import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Drawer, Box, Typography, IconButton, Chip, LinearProgress,
  CircularProgress, Divider, Tooltip,
} from '@mui/material'
import {
  Close, TrendingUp, Receipt, Payments, AccountBalance,
  OpenInNew, ArrowForward,
} from '@mui/icons-material'
import { marchesAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'
import StatusBadge from '@/components/core/StatusBadge'

interface SituationPaiement {
  totalDecomptes: number
  totalNetAPayer: number
  totalMontantPaye: number
  resteAPayer: number
  tauxPaiement: number
}

interface DecompteSimple {
  id: number
  numeroDecompte: string
  dateDecompte: string
  statut: string
  netAPayer: number
  montantPaye: number
  estSolde: boolean
}

interface MarcheDetailDrawerProps {
  open: boolean
  onClose: () => void
  marcheId: number | null
  marcheLabel: string
  marcheEngagement: number
  marcheDepenses: number
  marcheResteAPayer: number
}

const fmtMAD = (v: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v)
const fmtDate = (d: string): string => new Date(d).toLocaleDateString('fr-FR')
const fmtPct = (v: number): string => `${v.toFixed(1)}%`

const MarcheDetailDrawer = ({
  open, onClose, marcheId, marcheLabel, marcheEngagement, marcheDepenses, marcheResteAPayer,
}: MarcheDetailDrawerProps) => {
  const navigate = useNavigate()
  const [situation, setSituation] = useState<SituationPaiement | null>(null)
  const [decomptes, setDecomptes] = useState<DecompteSimple[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!open || !marcheId) return
    setLoading(true)
    try {
      const [sitRes, decRes] = await Promise.all([
        marchesAPI.getSituationPaiement(marcheId),
        marchesAPI.getDecomptes(marcheId),
      ])
      setSituation((sitRes.data.data || sitRes.data) as SituationPaiement)
      setDecomptes((decRes.data.data || decRes.data || []) as DecompteSimple[])
    } catch {
      setSituation(null); setDecomptes([])
    } finally {
      setLoading(false)
    }
  }, [open, marcheId])

  useEffect(() => { loadData() }, [loadData])

  if (!marcheId) return null

  const tauxPaiement = situation?.tauxPaiement || 0
  const tauxDecaissement = marcheEngagement > 0 ? (marcheDepenses / marcheEngagement) * 100 : 0

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, bgcolor: colors.background } }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: typography.weights.semibold, mb: 0.5 }}>
              Detail du marche
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary, mb: 0.5 }}>
              {marcheLabel}
            </Typography>
            <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.primary[700], fontVariantNumeric: 'tabular-nums' }}>
              {fmtMAD(marcheEngagement)}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {/* Stat buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <StatBtn icon={<AccountBalance sx={{ fontSize: 16 }} />} label="Engagement" value={fmtMAD(marcheEngagement)} color={colors.primary[600]} borderRight />
          <StatBtn icon={<Receipt sx={{ fontSize: 16 }} />} label="Depenses" value={fmtMAD(marcheDepenses)} subtitle={fmtPct(tauxDecaissement)} color={colors.success[600]} />
          <StatBtn icon={<Payments sx={{ fontSize: 16 }} />} label="Paye" value={fmtMAD(situation?.totalMontantPaye || 0)} subtitle={fmtPct(tauxPaiement)} color={colors.warning[600]} borderRight borderTop />
          <StatBtn icon={<TrendingUp sx={{ fontSize: 16 }} />} label="Reste a payer" value={fmtMAD(marcheResteAPayer)} color={marcheResteAPayer > 0 ? colors.danger[600] : colors.success[600]} borderTop />
        </Box>

        {/* Progress */}
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <ProgressRow label="Decaissement" pct={tauxDecaissement} color={colors.success[500]} />
          <ProgressRow label="Paiement" pct={tauxPaiement} color={colors.warning[500]} />
        </Box>

        {/* Calculation chain */}
        <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
            Chaine de calcul
          </Typography>
          <ChainStep step={1} title="Engagement (Montant TTC)" value={fmtMAD(marcheEngagement)} hint="Montant total du marche" />
          <ChainStep step={2} title="Depenses realisees (Decomptes)" value={fmtMAD(marcheDepenses)} hint={`${situation?.totalDecomptes || 0} decompte(s) valide(s)`} />
          <ChainStep step={3} title="Montant paye" value={fmtMAD(situation?.totalMontantPaye || 0)} hint="Via ordres de paiement" />
          <ChainStep step={4} title="Reste a payer" value={fmtMAD(marcheResteAPayer)} hint="Engagement - Depenses" isLast />
        </Box>

        {/* Decomptes */}
        <Box sx={{ px: 2.5, py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Decomptes ({decomptes.length})
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={22} /></Box>
          ) : decomptes.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center', bgcolor: colors.surface, borderRadius: 1, border: `1px dashed ${colors.border}` }}>
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Aucun decompte</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {decomptes.map((d: DecompteSimple) => {
                const pct = d.netAPayer > 0 ? (d.montantPaye / d.netAPayer) * 100 : 0
                return (
                  <Box key={d.id} sx={{ p: 1.5, borderRadius: 1, bgcolor: colors.surface, border: `1px solid ${colors.border}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{d.numeroDecompte}</Typography>
                        <StatusBadge status={d.statut} size="small" />
                        {d.estSolde && <Chip label="Solde" size="small" sx={{ height: 18, fontSize: '10px', bgcolor: colors.success[50], color: colors.success[700] }} />}
                      </Box>
                      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                        {fmtMAD(d.netAPayer)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>{fmtDate(d.dateDecompte)} - Paye: {fmtMAD(d.montantPaye)}</Typography>
                      <Typography sx={{ fontSize: '10px', fontWeight: typography.weights.semibold, color: pct >= 100 ? colors.success[600] : colors.warning[600] }}>{fmtPct(pct)}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={Math.min(pct, 100)} sx={{
                      height: 4, borderRadius: 2, bgcolor: colors.neutral[100],
                      '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: pct >= 100 ? colors.success[500] : colors.primary[400] },
                    }} />
                  </Box>
                )
              })}
            </Box>
          )}
        </Box>

        {/* Navigate */}
        <Divider />
        <Box sx={{ px: 2.5, py: 2, bgcolor: colors.neutral[25] }}>
          <Tooltip title="Ouvrir la page detail du marche">
            <Chip
              icon={<OpenInNew sx={{ fontSize: 14 }} />}
              label="Voir le detail complet du marche"
              onClick={() => { onClose(); navigate(`/marches/${marcheId}`) }}
              sx={{ cursor: 'pointer', bgcolor: colors.primary[50], color: colors.primary[700], fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, '& .MuiChip-icon': { color: colors.primary[500] } }}
            />
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  )
}

// Sub-components

const StatBtn = ({ icon, label, value, subtitle, color, borderRight, borderTop }: {
  icon: React.ReactNode; label: string; value: string; subtitle?: string; color: string; borderRight?: boolean; borderTop?: boolean
}) => (
  <Box sx={{ px: 2, py: 1.5, borderRight: borderRight ? `1px solid ${colors.border}` : 'none', borderTop: borderTop ? `1px solid ${colors.border}` : 'none' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25, color }}>
      {icon}
      <Typography sx={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: typography.weights.semibold, letterSpacing: '0.03em' }}>{label}</Typography>
    </Box>
    <Typography sx={{ fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>{value}</Typography>
    {subtitle && <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>{subtitle}</Typography>}
  </Box>
)

const ProgressRow = ({ label, pct, color }: { label: string; pct: number; color: string }) => (
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 0.5 }}>
    <Typography sx={{ fontSize: '10px', color: colors.textSecondary, minWidth: 72 }}>{label}</Typography>
    <LinearProgress variant="determinate" value={Math.min(pct, 100)} sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: colors.neutral[100], '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: color } }} />
    <Typography sx={{ fontSize: '10px', color: colors.textSecondary, minWidth: 40, textAlign: 'right' }}>{fmtPct(pct)}</Typography>
  </Box>
)

const ChainStep = ({ step, title, value, hint, isLast }: { step: number; title: string; value: string; hint: string; isLast?: boolean }) => (
  <Box sx={{ display: 'flex', gap: 1.5, mb: isLast ? 0 : 1.5 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
      <Box sx={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isLast ? colors.primary[600] : colors.primary[50], color: isLast ? colors.textOnColor : colors.primary[700], fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, flexShrink: 0 }}>{step}</Box>
      {!isLast && <Box sx={{ width: 1.5, flex: 1, bgcolor: colors.primary[100], mt: 0.5 }} />}
    </Box>
    <Box sx={{ flex: 1, pb: isLast ? 0 : 0.5 }}>
      <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 0.25 }}>{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: colors.neutral[50], borderRadius: 1, px: 1.5, py: 0.75 }}>
        <ArrowForward sx={{ fontSize: 12, color: colors.neutral[400] }} />
        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: isLast ? colors.primary[700] : colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      </Box>
      <Typography sx={{ fontSize: '10px', color: colors.textSecondary, mt: 0.25, fontStyle: 'italic' }}>{hint}</Typography>
    </Box>
  </Box>
)

export default MarcheDetailDrawer
