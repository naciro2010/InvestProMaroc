import React from 'react'
import {
  Drawer, Box, Typography, IconButton, Chip, Divider,
} from '@mui/material'
import { Close, Schedule, CalendarMonth, ArrowForward, TrendingUp } from '@mui/icons-material'
import { colors, typography } from '@/lib/designSystem'

interface ImputationPrevisionnelle {
  id: number
  conventionId: number
  volet?: string
  dateDemarrage: string
  delaiMois: number
  dateFinPrevue?: string
  montantPrevu?: number
  remarques?: string
}

interface ImputationDetailDrawerProps {
  open: boolean
  onClose: () => void
  imputation: ImputationPrevisionnelle | null
  allImputations: ImputationPrevisionnelle[]
  conventionBudget: number
}

const fmtMAD = (v: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v)
const fmtDate = (d: string): string => new Date(d).toLocaleDateString('fr-FR')
const fmtPct = (v: number): string => `${v.toFixed(1)}%`

const calculateEndDate = (startDate: string, delaiMois: number): Date => {
  const d = new Date(startDate)
  d.setMonth(d.getMonth() + delaiMois)
  return d
}

const ImputationDetailDrawer = ({
  open, onClose, imputation, allImputations, conventionBudget,
}: ImputationDetailDrawerProps) => {
  if (!imputation) return null

  const dateDebut = new Date(imputation.dateDemarrage)
  const dateFin = imputation.dateFinPrevue ? new Date(imputation.dateFinPrevue) : calculateEndDate(imputation.dateDemarrage, imputation.delaiMois)
  const now = new Date()
  const totalDays = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.ceil((now.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24))
  const progressPct = totalDays > 0 ? Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100) : 0
  const isStarted = now >= dateDebut
  const isFinished = now >= dateFin
  const daysRemaining = Math.ceil((dateFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const partDuBudget = conventionBudget > 0 && imputation.montantPrevu ? (imputation.montantPrevu / conventionBudget) * 100 : 0
  const totalImputations = allImputations.reduce((s: number, i: ImputationPrevisionnelle) => s + (i.montantPrevu || 0), 0)

  // Status
  const status = isFinished ? 'Termine' : isStarted ? 'En cours' : 'A venir'
  const statusColor = isFinished ? colors.success[600] : isStarted ? colors.info[600] : colors.warning[600]
  const statusBg = isFinished ? colors.success[50] : isStarted ? colors.info[50] : colors.warning[50]

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, bgcolor: colors.background } }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              {imputation.volet && <Chip label={imputation.volet} size="small" sx={{ bgcolor: colors.purple[50], color: colors.purple[700], fontSize: typography.sizes.xs, height: 22 }} />}
              <Chip label={status} size="small" sx={{ bgcolor: statusBg, color: statusColor, fontSize: typography.sizes.xs, height: 22, fontWeight: typography.weights.semibold }} />
            </Box>
            <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary }}>
              Imputation previsionnelle
            </Typography>
            {imputation.montantPrevu && (
              <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.primary[700], fontVariantNumeric: 'tabular-nums' }}>
                {fmtMAD(imputation.montantPrevu)}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {/* Stat buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <StatBtn icon={<CalendarMonth sx={{ fontSize: 16 }} />} label="Date debut" value={fmtDate(imputation.dateDemarrage)} color={colors.primary[600]} borderRight />
          <StatBtn icon={<CalendarMonth sx={{ fontSize: 16 }} />} label="Date fin prevue" value={dateFin.toLocaleDateString('fr-FR')} color={colors.info[600]} />
          <StatBtn icon={<Schedule sx={{ fontSize: 16 }} />} label="Duree" value={`${imputation.delaiMois} mois`} subtitle={`${totalDays} jours`} color={colors.purple[600]} borderRight borderTop />
          <StatBtn icon={<TrendingUp sx={{ fontSize: 16 }} />} label={isFinished ? 'Statut' : 'Jours restants'} value={isFinished ? 'Termine' : `${Math.max(daysRemaining, 0)} jours`} subtitle={isStarted && !isFinished ? fmtPct(progressPct) : ''} color={statusColor} borderTop />
        </Box>

        {/* Timeline progress bar */}
        <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
            Progression temporelle
          </Typography>

          {/* Timeline bar */}
          <Box sx={{ position: 'relative', height: 32, bgcolor: colors.neutral[50], borderRadius: 1, overflow: 'hidden', mb: 1 }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progressPct}%`, bgcolor: isFinished ? colors.success[100] : colors.primary[100], transition: 'width 0.3s' }} />
            {isStarted && !isFinished && (
              <Box sx={{ position: 'absolute', top: 0, left: `${progressPct}%`, width: 2, height: '100%', bgcolor: colors.primary[600] }} />
            )}
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', px: 1.5 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{fmtDate(imputation.dateDemarrage)}</Typography>
              {isStarted && !isFinished && (
                <Typography sx={{ fontSize: '10px', fontWeight: typography.weights.bold, color: colors.primary[700] }}>Aujourd'hui ({fmtPct(progressPct)})</Typography>
              )}
              <Typography sx={{ fontSize: '10px', fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{dateFin.toLocaleDateString('fr-FR')}</Typography>
            </Box>
          </Box>

          {/* Monthly breakdown */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {Array.from({ length: Math.min(imputation.delaiMois, 24) }, (_, i) => {
              const monthDate = new Date(imputation.dateDemarrage)
              monthDate.setMonth(monthDate.getMonth() + i)
              const isPast = now > monthDate
              const isCurrent = now.getMonth() === monthDate.getMonth() && now.getFullYear() === monthDate.getFullYear()
              return (
                <Box key={i} sx={{
                  px: 0.75, py: 0.25, borderRadius: 0.5, fontSize: '10px', fontWeight: isCurrent ? typography.weights.bold : typography.weights.normal,
                  bgcolor: isCurrent ? colors.primary[100] : isPast ? colors.success[50] : colors.neutral[50],
                  color: isCurrent ? colors.primary[700] : isPast ? colors.success[600] : colors.textSecondary,
                  border: isCurrent ? `1px solid ${colors.primary[300]}` : '1px solid transparent',
                }}>
                  M{i + 1}
                </Box>
              )
            })}
          </Box>
        </Box>

        {/* Calculation */}
        {imputation.montantPrevu && imputation.montantPrevu > 0 && (
          <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
              Comment le calcul est fait
            </Typography>
            <FormulaStep step={1} title="Budget convention" formula={fmtMAD(conventionBudget)} hint="Budget total" />
            <FormulaStep step={2} title="Part de cette imputation" formula={`${fmtMAD(conventionBudget)} x ${fmtPct(partDuBudget)}`} result={fmtMAD(imputation.montantPrevu)} hint={`Represente ${fmtPct(partDuBudget)} du budget total`} />
            <FormulaStep step={3} title="Mensualite indicative" formula={`${fmtMAD(imputation.montantPrevu)} / ${imputation.delaiMois} mois`} result={fmtMAD(imputation.montantPrevu / imputation.delaiMois)} hint="Repartition lineaire sur la duree" isLast />
          </Box>
        )}

        {/* Context */}
        <Divider />
        <Box sx={{ px: 2.5, py: 2, bgcolor: colors.neutral[25] }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, mb: 0.5 }}>
            {allImputations.length > 1 ? `Cette imputation fait partie de ${allImputations.length} imputations totalisant ${fmtMAD(totalImputations)}.` : 'Seule imputation previsionnelle de cette convention.'}
          </Typography>
          {imputation.remarques && (
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontStyle: 'italic', mt: 0.5 }}>Note: {imputation.remarques}</Typography>
          )}
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

export default ImputationDetailDrawer
