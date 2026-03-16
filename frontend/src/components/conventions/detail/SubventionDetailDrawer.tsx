import React from 'react'
import {
  Drawer, Box, Typography, IconButton, Chip, Divider, Tooltip,
} from '@mui/material'
import { Close, Edit, AccountBalance, CalendarMonth, ArrowForward, CurrencyExchange } from '@mui/icons-material'
import { colors, typography } from '@/lib/designSystem'
import type { Subvention } from './types'

interface SubventionDetailDrawerProps {
  open: boolean
  onClose: () => void
  subvention: Subvention | null
  allSubventions: Subvention[]
  conventionBudget: number
  onEdit?: (subvention: Subvention) => void
}

const TYPE_LABELS: Record<string, string> = {
  ETAT: 'Etat', REGION: 'Region', COMMUNE: 'Commune',
  FONDS_SPECIAL: 'Fonds special', BAILLEUR_INTERNATIONAL: 'Bailleur international', AUTRE: 'Autre',
}

const fmtMAD = (v: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v)
const fmtCur = (v: number, devise: string): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(v)
const fmtDate = (d?: string): string => d ? new Date(d).toLocaleDateString('fr-FR') : '-'
const fmtPct = (v: number): string => `${v.toFixed(1)}%`

const SubventionDetailDrawer = ({
  open, onClose, subvention, allSubventions, conventionBudget, onEdit,
}: SubventionDetailDrawerProps) => {
  if (!subvention) return null

  const montantMAD = subvention.montantTotal * (subvention.tauxChange || 1)
  const isDeviseEtrangere = subvention.devise !== 'MAD'
  const partDuBudget = conventionBudget > 0 ? (montantMAD / conventionBudget) * 100 : 0
  const totalSubventions = allSubventions.reduce((s: number, sub: Subvention) => s + sub.montantTotal * (sub.tauxChange || 1), 0)
  const tauxCouverture = conventionBudget > 0 ? (totalSubventions / conventionBudget) * 100 : 0

  // Validity
  const now = new Date()
  const isValid = (!subvention.dateDebutValidite || now >= new Date(subvention.dateDebutValidite))
    && (!subvention.dateFinValidite || now <= new Date(subvention.dateFinValidite))
  const isExpired = subvention.dateFinValidite && now > new Date(subvention.dateFinValidite)

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, bgcolor: colors.background } }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              {subvention.typeSubvention && (
                <Chip label={TYPE_LABELS[subvention.typeSubvention] || subvention.typeSubvention} size="small" sx={{ bgcolor: colors.info[50], color: colors.info[700], fontSize: typography.sizes.xs, height: 22 }} />
              )}
              <Chip
                label={isExpired ? 'Expiree' : isValid ? 'Valide' : 'A venir'}
                size="small"
                sx={{
                  height: 22, fontSize: '10px', fontWeight: typography.weights.semibold,
                  bgcolor: isExpired ? colors.danger[50] : isValid ? colors.success[50] : colors.warning[50],
                  color: isExpired ? colors.danger[700] : isValid ? colors.success[700] : colors.warning[700],
                }}
              />
            </Box>
            <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary }}>
              {subvention.organismeBailleur}
            </Typography>
            <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.success[600], fontVariantNumeric: 'tabular-nums' }}>
              {fmtCur(subvention.montantTotal, subvention.devise)}
            </Typography>
            {isDeviseEtrangere && (
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>~ {fmtMAD(montantMAD)}</Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onEdit && (
              <Tooltip title="Modifier cette subvention">
                <IconButton size="small" onClick={() => { onEdit(subvention); onClose() }}>
                  <Edit fontSize="small" sx={{ color: colors.primary[600] }} />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {/* Stat buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <StatBtn icon={<AccountBalance sx={{ fontSize: 16 }} />} label="Montant" value={fmtMAD(montantMAD)} color={colors.success[600]} borderRight />
          <StatBtn icon={<CurrencyExchange sx={{ fontSize: 16 }} />} label="Part du budget" value={fmtPct(partDuBudget)} color={colors.primary[600]} />
          <StatBtn icon={<CalendarMonth sx={{ fontSize: 16 }} />} label="Debut validite" value={fmtDate(subvention.dateDebutValidite)} color={colors.info[600]} borderRight borderTop />
          <StatBtn icon={<CalendarMonth sx={{ fontSize: 16 }} />} label="Fin validite" value={fmtDate(subvention.dateFinValidite)} color={isExpired ? colors.danger[600] : colors.info[600]} borderTop />
        </Box>

        {/* Currency conversion */}
        {isDeviseEtrangere && (
          <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
              Conversion de devise
            </Typography>
            <FormulaStep step={1} title={`Montant en ${subvention.devise}`} formula={fmtCur(subvention.montantTotal, subvention.devise)} hint={`Devise d'origine: ${subvention.devise}`} />
            <FormulaStep step={2} title="Taux de change" formula={`1 ${subvention.devise} = ${subvention.tauxChange || 1} MAD`} hint="Taux de conversion applique" />
            <FormulaStep step={3} title="Equivalent MAD" formula={`${fmtCur(subvention.montantTotal, subvention.devise)} x ${subvention.tauxChange || 1}`} result={fmtMAD(montantMAD)} hint="Montant utilise pour le budget convention" isLast />
          </Box>
        )}

        {/* Budget impact */}
        <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
            Impact budgetaire
          </Typography>
          <FormulaStep step={1} title="Budget convention" formula={fmtMAD(conventionBudget)} hint="Budget total de la convention" />
          <FormulaStep step={2} title="Total subventions" formula={`${allSubventions.length} subvention(s)`} result={fmtMAD(totalSubventions)} hint={`Taux de couverture: ${fmtPct(tauxCouverture)}`} />
          <FormulaStep step={3} title="Part de cette subvention" formula={`${fmtMAD(montantMAD)} / ${fmtMAD(conventionBudget)}`} result={fmtPct(partDuBudget)} hint={`Contribution de ${subvention.organismeBailleur}`} isLast />
        </Box>

        {/* Full conditions */}
        {subvention.conditions && (
          <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1 }}>
              Conditions et termes
            </Typography>
            <Box sx={{ p: 1.5, bgcolor: colors.neutral[25], borderRadius: 1, border: `1px solid ${colors.border}` }}>
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {subvention.conditions}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Context */}
        <Divider />
        <Box sx={{ px: 2.5, py: 2, bgcolor: colors.neutral[25] }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Cette subvention couvre <strong>{fmtPct(partDuBudget)}</strong> du budget convention.
            {allSubventions.length > 1 && ` L'ensemble des ${allSubventions.length} subventions couvre ${fmtPct(tauxCouverture)} du budget.`}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  )
}

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
  step: number; title: string; formula: string; result?: string; hint: string; isLast?: boolean
}) => (
  <Box sx={{ display: 'flex', gap: 1.5, mb: isLast ? 0 : 1.5 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
      <Box sx={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isLast ? colors.primary[600] : colors.primary[50], color: isLast ? colors.textOnColor : colors.primary[700], fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, flexShrink: 0 }}>{step}</Box>
      {!isLast && <Box sx={{ width: 1.5, flex: 1, bgcolor: colors.primary[100], mt: 0.5 }} />}
    </Box>
    <Box sx={{ flex: 1, pb: isLast ? 0 : 0.5 }}>
      <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 0.25 }}>{title}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: colors.neutral[50], borderRadius: 1, px: 1.5, py: 0.75 }}>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontFamily: typography.fontFamilyMono }}>{formula}</Typography>
        {result && <><ArrowForward sx={{ fontSize: 12, color: colors.neutral[400] }} /><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: isLast ? colors.primary[700] : colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{result}</Typography></>}
      </Box>
      <Typography sx={{ fontSize: '10px', color: colors.textSecondary, mt: 0.25, fontStyle: 'italic' }}>{hint}</Typography>
    </Box>
  </Box>
)

export default SubventionDetailDrawer
