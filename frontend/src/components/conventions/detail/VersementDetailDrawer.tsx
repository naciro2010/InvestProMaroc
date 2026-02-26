import React from 'react'
import {
  Drawer, Box, Typography, IconButton, Chip, LinearProgress, Divider,
} from '@mui/material'
import { Close, CalendarMonth, TrendingUp, ArrowForward, AccountBalance } from '@mui/icons-material'
import { colors, typography } from '@/lib/designSystem'
import type { VersementPrevisionnel } from './types'

interface VersementDetailDrawerProps {
  open: boolean
  onClose: () => void
  versement: VersementPrevisionnel | null
  allVersements: VersementPrevisionnel[]
  conventionBudget: number
}

const fmtMAD = (v: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v)
const fmtDate = (d: string): string => new Date(d).toLocaleDateString('fr-FR')
const fmtPct = (v: number): string => `${v.toFixed(1)}%`

const VersementDetailDrawer = ({
  open, onClose, versement, allVersements, conventionBudget,
}: VersementDetailDrawerProps) => {
  if (!versement) return null

  const ecart = versement.montantPrevu ? versement.montant - versement.montantPrevu : 0
  const ecartPct = versement.montantPrevu && versement.montantPrevu > 0 ? (ecart / versement.montantPrevu) * 100 : 0
  const partDuBudget = conventionBudget > 0 ? (versement.montant / conventionBudget) * 100 : 0

  // Same partner versements
  const samePartnerVers = versement.partenaireId
    ? allVersements.filter((v: VersementPrevisionnel) => v.partenaireId === versement.partenaireId)
    : []
  const totalPartnerVerse = samePartnerVers.reduce((s: number, v: VersementPrevisionnel) => s + v.montant, 0)
  const totalPartnerPrevu = samePartnerVers.reduce((s: number, v: VersementPrevisionnel) => s + (v.montantPrevu || 0), 0)
  const totalAllVersements = allVersements.reduce((s: number, v: VersementPrevisionnel) => s + v.montant, 0)

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, bgcolor: colors.background } }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              {versement.volet && <Chip label={versement.volet} size="small" sx={{ bgcolor: colors.purple[50], color: colors.purple[700], fontSize: typography.sizes.xs, height: 22 }} />}
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{fmtDate(versement.dateVersement)}</Typography>
            </Box>
            <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary }}>
              {versement.partenaireSigle || versement.partenaireNom || 'Versement'}
            </Typography>
            <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.success[600], fontVariantNumeric: 'tabular-nums' }}>
              {fmtMAD(versement.montant)}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {/* Stat buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <StatBtn icon={<CalendarMonth sx={{ fontSize: 16 }} />} label="Montant prevu" value={versement.montantPrevu ? fmtMAD(versement.montantPrevu) : '-'} color={colors.info[600]} borderRight />
          <StatBtn icon={<AccountBalance sx={{ fontSize: 16 }} />} label="Montant reel" value={fmtMAD(versement.montant)} color={colors.success[600]} />
          <StatBtn icon={<TrendingUp sx={{ fontSize: 16 }} />} label="Ecart" value={versement.montantPrevu ? fmtMAD(ecart) : '-'} subtitle={versement.montantPrevu ? fmtPct(ecartPct) : ''} color={ecart === 0 ? colors.success[600] : ecart > 0 ? colors.danger[600] : colors.info[600]} borderRight borderTop />
          <StatBtn icon={<TrendingUp sx={{ fontSize: 16 }} />} label="Part du budget" value={fmtPct(partDuBudget)} color={colors.primary[600]} borderTop />
        </Box>

        {/* Ecart analysis */}
        {versement.montantPrevu !== undefined && versement.montantPrevu > 0 && (
          <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
              Analyse de l'ecart
            </Typography>
            <FormulaStep step={1} title="Montant prevu" formula={fmtMAD(versement.montantPrevu)} hint="Montant initialement prevu" />
            <FormulaStep step={2} title="Montant realise" formula={fmtMAD(versement.montant)} hint="Montant effectivement verse" />
            <FormulaStep
              step={3} title="Ecart"
              formula={`${fmtMAD(versement.montant)} - ${fmtMAD(versement.montantPrevu)}`}
              result={fmtMAD(ecart)}
              hint={ecart === 0 ? 'Conforme au previsionnel' : ecart > 0 ? 'Depassement du previsionnel' : 'Sous-consommation'}
              isLast
              resultColor={ecart === 0 ? colors.success[700] : ecart > 0 ? colors.danger[700] : colors.info[700]}
            />
          </Box>
        )}

        {/* Partner versements timeline */}
        {samePartnerVers.length > 1 && (
          <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
              Historique partenaire ({samePartnerVers.length} versements)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {samePartnerVers.map((v: VersementPrevisionnel) => {
                const isCurrent = v.id === versement.id
                return (
                  <Box key={v.id} sx={{ p: 1.25, borderRadius: 1, bgcolor: isCurrent ? colors.primary[25] : colors.surface, border: `1px solid ${isCurrent ? colors.primary[300] : colors.border}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{fmtDate(v.dateVersement)}</Typography>
                        {v.volet && <Chip label={v.volet} size="small" sx={{ height: 18, fontSize: '10px', bgcolor: colors.purple[50], color: colors.purple[700] }} />}
                        {isCurrent && <Chip label="Actuel" size="small" sx={{ height: 18, fontSize: '10px', bgcolor: colors.primary[100], color: colors.primary[700] }} />}
                      </Box>
                      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.success[600], fontVariantNumeric: 'tabular-nums' }}>{fmtMAD(v.montant)}</Typography>
                    </Box>
                  </Box>
                )
              })}
            </Box>
            <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 1, bgcolor: colors.neutral[50] }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>Total partenaire</Typography>
                <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.primary[700], fontVariantNumeric: 'tabular-nums' }}>{fmtMAD(totalPartnerVerse)}</Typography>
              </Box>
              {totalPartnerPrevu > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
                  <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>Prevu total: {fmtMAD(totalPartnerPrevu)}</Typography>
                  <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>Ecart: {fmtMAD(totalPartnerVerse - totalPartnerPrevu)}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Budget context */}
        <Divider />
        <Box sx={{ px: 2.5, py: 2, bgcolor: colors.neutral[25] }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, mb: 0.5 }}>
            Ce versement represente <strong>{fmtPct(partDuBudget)}</strong> du budget convention ({fmtMAD(conventionBudget)}).
            Total verse a ce jour: {fmtMAD(totalAllVersements)}.
          </Typography>
          {versement.remarques && (
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontStyle: 'italic', mt: 0.5 }}>Note: {versement.remarques}</Typography>
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

const FormulaStep = ({ step, title, formula, result, hint, isLast, resultColor }: {
  step: number; title: string; formula: string; result?: string; hint: string; isLast?: boolean; resultColor?: string
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
        {result && <><ArrowForward sx={{ fontSize: 12, color: colors.neutral[400] }} /><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: resultColor || (isLast ? colors.primary[700] : colors.textPrimary), fontVariantNumeric: 'tabular-nums' }}>{result}</Typography></>}
      </Box>
      <Typography sx={{ fontSize: '10px', color: colors.textSecondary, mt: 0.25, fontStyle: 'italic' }}>{hint}</Typography>
    </Box>
  </Box>
)

export default VersementDetailDrawer
