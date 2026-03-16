import React, { useState, useEffect } from 'react'
import {
  Drawer, Box, Typography, IconButton, Chip, LinearProgress,
  CircularProgress, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Tooltip,
} from '@mui/material'
import {
  Close, AccountBalance, Percent, CalendarMonth,
  ArrowForward, Edit, Add, TrendingUp, Receipt,
} from '@mui/icons-material'
import { conventionsAPI, versementsPrevisionnelsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'

// ==================== TYPES ====================

interface PartenaireData {
  id: number
  partenaireId: number
  partenaireCode: string
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
  commissionIntervention: number | null
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
  remarques: string | null
}

interface VersementForPartenaire {
  id: number
  partenaireId?: number
  partenaireNom?: string
  volet?: string
  dateVersement: string
  montant: number
  montantPrevu?: number
  remarques?: string
}

interface ImputationForPartenaire {
  id: number
  volet?: string
  montantPrevu?: number
  dateDemarrage: string
  delaiMois: number
  remarques?: string
}

interface PartenaireDetailDrawerProps {
  open: boolean
  onClose: () => void
  partenaire: PartenaireData | null
  conventionId: number
  conventionBudget: number
  onEdit?: (partenaire: PartenaireData) => void
  versements?: VersementForPartenaire[]
}

// ==================== HELPERS ====================

const fmtMAD = (v: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v)
const fmtMADFull = (v: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(v)
const fmtDate = (d: string): string => {
  try { return new Date(d).toLocaleDateString('fr-FR') } catch { return d }
}
const fmtPct = (v: number): string => `${v.toFixed(1)}%`

// ==================== SUB-COMPONENTS ====================

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{
    fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold,
    color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5,
  }}>
    {children}
  </Typography>
)

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

const FormulaStep = ({ step, title, formula, result, hint, isLast }: {
  step: number; title: string; formula: string; result: string; hint: string; isLast?: boolean
}) => (
  <Box sx={{ display: 'flex', gap: 1.5, mb: isLast ? 0 : 1.5 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
      <Box sx={{
        width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: isLast ? colors.primary[600] : colors.primary[50],
        color: isLast ? colors.textOnColor : colors.primary[700],
        fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, flexShrink: 0,
      }}>{step}</Box>
      {!isLast && <Box sx={{ width: 1.5, flex: 1, bgcolor: colors.primary[100], mt: 0.5 }} />}
    </Box>
    <Box sx={{ flex: 1, pb: isLast ? 0 : 0.5 }}>
      <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 0.25 }}>{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: colors.neutral[50], borderRadius: 1, px: 1.5, py: 0.75 }}>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontFamily: typography.fontFamilyMono }}>{formula}</Typography>
        {result && (
          <>
            <ArrowForward sx={{ fontSize: 12, color: colors.neutral[400] }} />
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: isLast ? colors.primary[700] : colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{result}</Typography>
          </>
        )}
      </Box>
      <Typography sx={{ fontSize: '10px', color: colors.textSecondary, mt: 0.25, fontStyle: 'italic' }}>{hint}</Typography>
    </Box>
  </Box>
)

// ==================== MAIN COMPONENT ====================

const PartenaireDetailDrawer = ({
  open, onClose, partenaire, conventionId, conventionBudget, onEdit, versements: externalVersements,
}: PartenaireDetailDrawerProps) => {
  const [versements, setVersements] = useState<VersementForPartenaire[]>([])
  const [imputations, setImputations] = useState<ImputationForPartenaire[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (open && partenaire) {
      if (externalVersements && externalVersements.length > 0) {
        setVersements(externalVersements.filter(v => v.partenaireId === partenaire.partenaireId))
      } else {
        loadVersements()
      }
      loadImputations()
    }
  }, [open, partenaire, externalVersements])

  const loadVersements = async () => {
    if (!partenaire) return
    try {
      setLoadingData(true)
      const res = await versementsPrevisionnelsAPI.getByConvention(conventionId)
      const allVersements: VersementForPartenaire[] = res.data.data || res.data || []
      setVersements(allVersements.filter(v => v.partenaireId === partenaire.partenaireId))
    } catch { setVersements([]) }
    finally { setLoadingData(false) }
  }

  const loadImputations = async () => {
    try {
      const res = await conventionsAPI.getImputations(conventionId)
      const allImputations: ImputationForPartenaire[] = res.data.data || res.data || []
      setImputations(allImputations)
    } catch { setImputations([]) }
  }

  if (!partenaire) return null

  const totalVersePrevu = versements.reduce((s, v) => s + (v.montantPrevu || 0), 0)
  const totalVerseReel = versements.reduce((s, v) => s + v.montant, 0)
  const tauxVersement = partenaire.budgetAlloue > 0 ? (totalVerseReel / partenaire.budgetAlloue) * 100 : 0
  const resteAVerser = partenaire.budgetAlloue - totalVerseReel

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, bgcolor: colors.background } }}>
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`,
        position: 'sticky', top: 0, zIndex: 1,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
              {partenaire.estMaitreOeuvre && (
                <Chip label="Maitre d'oeuvre" size="small" sx={{ bgcolor: colors.info[100], color: colors.info[700], fontSize: typography.sizes.xs, height: 22 }} />
              )}
              {partenaire.estMaitreOeuvreDelegue && (
                <Chip label="MOD" size="small" sx={{ bgcolor: colors.purple[100], color: colors.purple[700], fontSize: typography.sizes.xs, height: 22 }} />
              )}
              <Chip label={partenaire.partenaireCode} size="small" variant="outlined" sx={{ fontSize: typography.sizes.xs, height: 22 }} />
            </Box>
            <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary }}>
              {partenaire.partenaireSigle || partenaire.partenaireNom}
            </Typography>
            {partenaire.partenaireSigle && (
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{partenaire.partenaireNom}</Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onEdit && (
              <Tooltip title="Modifier ce partenaire">
                <IconButton size="small" onClick={() => { onEdit(partenaire); onClose() }}>
                  <Edit fontSize="small" sx={{ color: colors.primary[600] }} />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {/* Stat Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <StatBtn icon={<AccountBalance sx={{ fontSize: 16 }} />} label="Budget alloue" value={fmtMAD(partenaire.budgetAlloue)} color={colors.primary[600]} borderRight />
          <StatBtn icon={<Percent sx={{ fontSize: 16 }} />} label="Part du budget" value={fmtPct(partenaire.pourcentage)} color={colors.info[600]} />
          <StatBtn icon={<CalendarMonth sx={{ fontSize: 16 }} />} label="Verse (prevu)" value={fmtMAD(totalVersePrevu)} color={colors.warning[600]} borderRight borderTop />
          <StatBtn icon={<TrendingUp sx={{ fontSize: 16 }} />} label="Verse (reel)" value={fmtMAD(totalVerseReel)} subtitle={fmtPct(tauxVersement)} color={colors.success[600]} borderTop />
        </Box>

        {/* Taux de versement progress */}
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Taux de versement</Typography>
            <Typography sx={{
              fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold,
              color: tauxVersement >= 100 ? colors.success[600] : colors.primary[600],
            }}>{fmtPct(tauxVersement)}</Typography>
          </Box>
          <LinearProgress variant="determinate" value={Math.min(tauxVersement, 100)} sx={{
            height: 6, borderRadius: 3, bgcolor: colors.neutral[100],
            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: tauxVersement >= 100 ? colors.success[500] : colors.primary[500] },
          }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
            <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>
              Reste a verser: <strong>{fmtMADFull(Math.max(resteAVerser, 0))}</strong>
            </Typography>
            {partenaire.commissionIntervention !== null && partenaire.commissionIntervention > 0 && (
              <Typography sx={{ fontSize: '10px', color: colors.purple[600] }}>
                Commission: {fmtMADFull(partenaire.commissionIntervention)}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Formula explanation */}
        <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <SectionTitle>Comment le calcul est fait</SectionTitle>
          <FormulaStep step={1} title="Budget convention" formula={fmtMAD(conventionBudget)} result="" hint="Budget total de la convention" />
          <FormulaStep step={2} title="Part du partenaire"
            formula={`${fmtMAD(conventionBudget)} x ${fmtPct(partenaire.pourcentage)}`}
            result={fmtMAD(partenaire.budgetAlloue)}
            hint={`Pourcentage negocie: ${partenaire.pourcentage.toFixed(2)}%`} />
          {partenaire.commissionIntervention !== null && partenaire.commissionIntervention > 0 ? (
            <FormulaStep step={3} title="Commission d'intervention"
              formula={`Calculee sur le budget alloue`}
              result={fmtMAD(partenaire.commissionIntervention)}
              hint="Commission pour services rendus" isLast />
          ) : (
            <FormulaStep step={3} title="Reste a verser"
              formula={`${fmtMAD(partenaire.budgetAlloue)} - ${fmtMAD(totalVerseReel)}`}
              result={fmtMAD(Math.max(resteAVerser, 0))}
              hint="Montant encore attendu" isLast />
          )}
        </Box>

        {/* Versements Table */}
        <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <SectionTitle>Versements ({versements.length})</SectionTitle>
          {loadingData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={20} /></Box>
          ) : versements.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center', bgcolor: colors.neutral[25], borderRadius: 1, border: `1px dashed ${colors.border}` }}>
              <Receipt sx={{ fontSize: 28, color: colors.neutral[300], mb: 0.5 }} />
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                Aucun versement pour ce partenaire
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                    <TableCell sx={{ fontSize: '10px', fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase' }}>Date</TableCell>
                    <TableCell sx={{ fontSize: '10px', fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase' }}>Volet</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10px', fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase' }}>Prevu</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10px', fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase' }}>Reel</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10px', fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase' }}>Ecart</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {versements.map(v => {
                    const ecart = (v.montantPrevu || 0) > 0 ? v.montant - (v.montantPrevu || 0) : 0
                    return (
                      <TableRow key={v.id} sx={{ '&:hover': { bgcolor: colors.primary[25] } }}>
                        <TableCell sx={{ fontSize: typography.sizes.xs }}>{fmtDate(v.dateVersement)}</TableCell>
                        <TableCell>
                          {v.volet ? (
                            <Chip label={v.volet} size="small" sx={{ height: 18, fontSize: '10px', bgcolor: colors.purple[50], color: colors.purple[700] }} />
                          ) : <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>-</Typography>}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                          {v.montantPrevu ? fmtMADFull(v.montantPrevu) : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.success[600] }}>
                          {fmtMADFull(v.montant)}
                        </TableCell>
                        <TableCell align="right" sx={{
                          fontSize: typography.sizes.xs, fontWeight: typography.weights.medium,
                          color: ecart === 0 ? colors.success[600] : ecart > 0 ? colors.danger[600] : colors.info[600],
                        }}>
                          {(v.montantPrevu || 0) > 0 ? fmtMADFull(ecart) : '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {/* Total row */}
                  <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                    <TableCell colSpan={2} sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold }}>
                      {totalVersePrevu > 0 ? fmtMADFull(totalVersePrevu) : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.success[700] }}>
                      {fmtMADFull(totalVerseReel)}
                    </TableCell>
                    <TableCell align="right" sx={{
                      fontSize: typography.sizes.xs, fontWeight: typography.weights.bold,
                      color: totalVersePrevu > 0
                        ? (totalVerseReel - totalVersePrevu === 0 ? colors.success[700] : totalVerseReel > totalVersePrevu ? colors.danger[700] : colors.info[700])
                        : colors.textSecondary,
                    }}>
                      {totalVersePrevu > 0 ? fmtMADFull(totalVerseReel - totalVersePrevu) : '-'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Imputations */}
        {imputations.length > 0 && (
          <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
            <SectionTitle>Imputations previsionnelles ({imputations.length})</SectionTitle>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {imputations.map(imp => (
                <Box key={imp.id} sx={{ p: 1.5, borderRadius: 1, bgcolor: colors.neutral[25], border: `1px solid ${colors.border}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {imp.volet && (
                        <Chip label={imp.volet} size="small" sx={{ height: 18, fontSize: '10px', bgcolor: colors.info[50], color: colors.info[700] }} />
                      )}
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                        {fmtDate(imp.dateDemarrage)} - {imp.delaiMois} mois
                      </Typography>
                    </Box>
                    {imp.montantPrevu !== undefined && imp.montantPrevu !== null && (
                      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                        {fmtMADFull(imp.montantPrevu)}
                      </Typography>
                    )}
                  </Box>
                  {imp.remarques && (
                    <Typography sx={{ fontSize: '10px', color: colors.textSecondary, fontStyle: 'italic' }}>
                      {imp.remarques}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Remarques */}
        {partenaire.remarques && (
          <>
            <Box sx={{ px: 2.5, py: 2, bgcolor: colors.neutral[25] }}>
              <SectionTitle>Remarques</SectionTitle>
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary, lineHeight: 1.5 }}>
                {partenaire.remarques}
              </Typography>
            </Box>
          </>
        )}

        {/* Bottom spacer */}
        <Box sx={{ height: 32 }} />
      </Box>
    </Drawer>
  )
}

export default PartenaireDetailDrawer
