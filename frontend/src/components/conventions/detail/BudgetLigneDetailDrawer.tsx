import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  CircularProgress,
  Divider,
  Tooltip,
} from '@mui/material'
import {
  Close,
  TrendingUp,
  AccountBalance,
  Receipt,
  Payments,
  OpenInNew,
  ArrowForward,
} from '@mui/icons-material'
import { marchesAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'
import StatusBadge from '@/components/core/StatusBadge'
import type { ConventionBudgetLigneDTO } from '@/types/api'

// ---------- Types ----------

interface MarcheResume {
  id: number
  numeroMarche: string
  objet: string
  montantTtc: number
  statut: string
  fournisseurNom?: string
}

interface SituationPaiement {
  totalDecomptes: number
  totalNetAPayer: number
  totalMontantPaye: number
  resteAPayer: number
  tauxPaiement: number
}

interface MarcheWithSituation {
  marche: MarcheResume
  situation: SituationPaiement | null
}

interface ConventionFinancials {
  budget: number
  tauxCommission: number
  tauxTva: number
  baseCalcul: string
  commissionMode?: string
}

interface BudgetLigneDetailDrawerProps {
  open: boolean
  onClose: () => void
  ligne: ConventionBudgetLigneDTO | null
  conventionId: number
  conventionFinancials: ConventionFinancials
  totalBudgetLignes: number
}

// ---------- Helpers ----------

const fmtMAD = (v: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v)

const fmtPct = (v: number): string => `${v.toFixed(1)}%`

// ---------- Component ----------

const BudgetLigneDetailDrawer = ({
  open,
  onClose,
  ligne,
  conventionId,
  conventionFinancials,
  totalBudgetLignes,
}: BudgetLigneDetailDrawerProps) => {
  const navigate = useNavigate()
  const [marchesData, setMarchesData] = useState<MarcheWithSituation[]>([])
  const [loading, setLoading] = useState(false)

  const loadMarchesData = useCallback(async () => {
    if (!open || !ligne) return
    setLoading(true)
    try {
      const res = await marchesAPI.getByConvention(conventionId)
      const marches: MarcheResume[] = res.data.data || res.data || []

      const withSituations = await Promise.all(
        marches.map(async (m) => {
          try {
            const sitRes = await marchesAPI.getSituationPaiement(m.id)
            return { marche: m, situation: (sitRes.data.data || sitRes.data) as SituationPaiement }
          } catch {
            return { marche: m, situation: null }
          }
        }),
      )
      setMarchesData(withSituations)
    } catch {
      setMarchesData([])
    } finally {
      setLoading(false)
    }
  }, [open, ligne, conventionId])

  useEffect(() => { loadMarchesData() }, [loadMarchesData])

  if (!ligne) return null

  // Aggregated metrics
  const totalEngage = marchesData.reduce((s: number, m: MarcheWithSituation) => s + (m.marche.montantTtc || 0), 0)
  const totalDepenses = marchesData.reduce((s: number, m: MarcheWithSituation) => s + (m.situation?.totalNetAPayer || 0), 0)
  const totalPaye = marchesData.reduce((s: number, m: MarcheWithSituation) => s + (m.situation?.totalMontantPaye || 0), 0)
  const resteAEngager = ligne.montant - totalEngage
  const tauxExecution = ligne.montant > 0 ? (totalEngage / ligne.montant) * 100 : 0

  // Commission calculation
  const effectiveTaux = ligne.tauxCommission ?? conventionFinancials.tauxCommission
  const plafond = ligne.plafond ?? 0
  const assiette = plafond > 0 ? Math.min(ligne.montant, plafond) : ligne.montant
  const commissionHT = (assiette * effectiveTaux) / 100
  const commissionTTC = commissionHT * (1 + conventionFinancials.tauxTva / 100)

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, bgcolor: colors.background } }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={ligne.categorieDepenseCode} size="small" sx={{ bgcolor: colors.primary[50], color: colors.primary[700], fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs }} />
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              {fmtPct(ligne.pourcentage)} du budget
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
        </Box>
        <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary, mb: 0.25 }}>
          {ligne.designation || ligne.categorieDepenseLibelle}
        </Typography>
        <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.primary[700], fontVariantNumeric: 'tabular-nums' }}>
          {fmtMAD(ligne.montant)}
        </Typography>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {/* Odoo-style Smart Stat Buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <StatButton icon={<AccountBalance sx={{ fontSize: 16 }} />} label="Budget" value={fmtMAD(ligne.montant)} color={colors.primary[600]} borderRight />
          <StatButton icon={<TrendingUp sx={{ fontSize: 16 }} />} label="Engage" value={fmtMAD(totalEngage)} subtitle={fmtPct(tauxExecution)} color={tauxExecution > 100 ? colors.danger[600] : colors.info[600]} />
          <StatButton icon={<Receipt sx={{ fontSize: 16 }} />} label="Depense" value={fmtMAD(totalDepenses)} color={colors.success[600]} borderRight borderTop />
          <StatButton icon={<Payments sx={{ fontSize: 16 }} />} label="Paye" value={fmtMAD(totalPaye)} color={colors.warning[600]} borderTop />
        </Box>

        {/* Execution progress */}
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Taux d'execution</Typography>
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: tauxExecution > 100 ? colors.danger[600] : colors.primary[600] }}>
              {fmtPct(tauxExecution)}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={Math.min(tauxExecution, 100)} sx={{
            height: 6, borderRadius: 3, bgcolor: colors.neutral[100],
            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: tauxExecution > 100 ? colors.danger[500] : colors.primary[500] },
          }} />
          {resteAEngager !== 0 && (
            <Typography sx={{ fontSize: typography.sizes.xs, color: resteAEngager < 0 ? colors.danger[600] : colors.success[600], mt: 0.5 }}>
              {resteAEngager > 0 ? `Reste a engager: ${fmtMAD(resteAEngager)}` : `Depassement: ${fmtMAD(Math.abs(resteAEngager))}`}
            </Typography>
          )}
        </Box>

        {/* Formule de calcul (the key UX feature) */}
        <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
            Comment le calcul est fait
          </Typography>

          {/* Step 1: Budget allocation */}
          <FormulaStep
            step={1}
            title="Repartition budgetaire"
            formula={`${fmtMAD(conventionFinancials.budget)} x ${fmtPct(ligne.pourcentage)}`}
            result={fmtMAD(ligne.montant)}
            hint={`Part ${ligne.categorieDepenseLibelle} du budget convention`}
          />

          {/* Step 2: Commission assiette */}
          {plafond > 0 && (
            <FormulaStep
              step={2}
              title="Plafond applique"
              formula={`min(${fmtMAD(ligne.montant)}, ${fmtMAD(plafond)})`}
              result={fmtMAD(assiette)}
              hint="Assiette de commission plafonnee"
            />
          )}

          {/* Step 3: Commission HT */}
          <FormulaStep
            step={plafond > 0 ? 3 : 2}
            title="Commission HT"
            formula={`${fmtMAD(assiette)} x ${effectiveTaux}%`}
            result={fmtMAD(commissionHT)}
            hint={conventionFinancials.commissionMode === 'PAR_CATEGORIE' ? 'Taux specifique a la categorie' : 'Taux global convention'}
          />

          {/* Step 4: Commission TTC */}
          <FormulaStep
            step={plafond > 0 ? 4 : 3}
            title="Commission TTC"
            formula={`${fmtMAD(commissionHT)} x (1 + ${conventionFinancials.tauxTva}%)`}
            result={fmtMAD(commissionTTC)}
            hint="Montant final avec TVA"
            isLast
          />
        </Box>

        {/* Marches lies */}
        <Box sx={{ px: 2.5, py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Marches lies ({marchesData.length})
            </Typography>
            {marchesData.length > 0 && (
              <Chip
                label="Voir tous"
                size="small"
                icon={<OpenInNew sx={{ fontSize: 12 }} />}
                onClick={() => { onClose(); navigate('/marches') }}
                sx={{ fontSize: typography.sizes.xs, cursor: 'pointer', bgcolor: colors.primary[50], color: colors.primary[700], '& .MuiChip-icon': { color: colors.primary[500] } }}
              />
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={22} /></Box>
          ) : marchesData.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center', bgcolor: colors.surface, borderRadius: 1, border: `1px dashed ${colors.border}` }}>
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                Aucun marche lie a cette convention
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {marchesData.map((item: MarcheWithSituation) => (
                <MarcheCard
                  key={item.marche.id}
                  marche={item.marche}
                  situation={item.situation}
                  onClick={() => { onClose(); navigate(`/marches/${item.marche.id}`) }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Budget context */}
        <Divider />
        <Box sx={{ px: 2.5, py: 2, bgcolor: colors.neutral[25] }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, mb: 0.5 }}>
            Cette ligne represente <strong>{fmtPct(ligne.pourcentage)}</strong> du budget total ({fmtMAD(conventionFinancials.budget)}).
            {totalBudgetLignes > 1 && ` Il y a ${totalBudgetLignes} categories dans cette convention.`}
          </Typography>
          {ligne.remarques && (
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontStyle: 'italic', mt: 0.5 }}>
              Note: {ligne.remarques}
            </Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}

// ---------- Sub-components ----------

const StatButton = ({ icon, label, value, subtitle, color, borderRight, borderTop }: {
  icon: React.ReactNode; label: string; value: string; subtitle?: string; color: string; borderRight?: boolean; borderTop?: boolean
}) => (
  <Box sx={{
    px: 2, py: 1.5,
    borderRight: borderRight ? `1px solid ${colors.border}` : 'none',
    borderTop: borderTop ? `1px solid ${colors.border}` : 'none',
    cursor: 'default',
    '&:hover': { bgcolor: colors.neutral[25] },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25, color }}>
      {icon}
      <Typography sx={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: typography.weights.semibold, letterSpacing: '0.03em' }}>{label}</Typography>
    </Box>
    <Typography sx={{ fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
      {value}
    </Typography>
    {subtitle && <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>{subtitle}</Typography>}
  </Box>
)

const FormulaStep = ({ step, title, formula, result, hint, isLast }: {
  step: number; title: string; formula: string; result: string; hint: string; isLast?: boolean
}) => (
  <Box sx={{ display: 'flex', gap: 1.5, mb: isLast ? 0 : 1.5, position: 'relative' }}>
    {/* Step indicator with connecting line */}
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
      <Box sx={{
        width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: isLast ? colors.primary[600] : colors.primary[50],
        color: isLast ? colors.textOnColor : colors.primary[700],
        fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, flexShrink: 0,
      }}>
        {step}
      </Box>
      {!isLast && <Box sx={{ width: 1.5, flex: 1, bgcolor: colors.primary[100], mt: 0.5 }} />}
    </Box>
    {/* Content */}
    <Box sx={{ flex: 1, pb: isLast ? 0 : 0.5 }}>
      <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 0.25 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: colors.neutral[50], borderRadius: 1, px: 1.5, py: 0.75 }}>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontFamily: typography.fontFamilyMono }}>
          {formula}
        </Typography>
        <ArrowForward sx={{ fontSize: 12, color: colors.neutral[400] }} />
        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: isLast ? colors.primary[700] : colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
          {result}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '10px', color: colors.textSecondary, mt: 0.25, fontStyle: 'italic' }}>
        {hint}
      </Typography>
    </Box>
  </Box>
)

const MarcheCard = ({ marche, situation, onClick }: {
  marche: MarcheResume; situation: SituationPaiement | null; onClick: () => void
}) => {
  const pct = situation?.tauxPaiement || 0
  return (
    <Tooltip title="Cliquer pour voir le detail du marche" placement="left" arrow>
      <Box
        onClick={onClick}
        sx={{
          p: 1.5, borderRadius: 1, bgcolor: colors.surface, border: `1px solid ${colors.border}`,
          cursor: 'pointer', transition: 'all 0.15s ease',
          '&:hover': { borderColor: colors.primary[300], bgcolor: colors.primary[25] },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
              <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
                {marche.numeroMarche}
              </Typography>
              <StatusBadge status={marche.statut} size="small" />
            </Box>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {marche.objet}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.textPrimary, fontVariantNumeric: 'tabular-nums', ml: 1, whiteSpace: 'nowrap' }}>
            {fmtMAD(marche.montantTtc)}
          </Typography>
        </Box>

        {/* Mini progress */}
        {situation && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
              <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>
                {situation.totalDecomptes} decompte{situation.totalDecomptes !== 1 ? 's' : ''} - Paye: {fmtMAD(situation.totalMontantPaye)}
              </Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: typography.weights.semibold, color: pct >= 100 ? colors.success[600] : colors.warning[600] }}>
                {fmtPct(pct)}
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={Math.min(pct, 100)} sx={{
              height: 4, borderRadius: 2, bgcolor: colors.neutral[100],
              '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: pct >= 100 ? colors.success[500] : colors.primary[400] },
            }} />
          </Box>
        )}
        {marche.fournisseurNom && (
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary, mt: 0.5 }}>
            Fournisseur: {marche.fournisseurNom}
          </Typography>
        )}
      </Box>
    </Tooltip>
  )
}

export default BudgetLigneDetailDrawer
