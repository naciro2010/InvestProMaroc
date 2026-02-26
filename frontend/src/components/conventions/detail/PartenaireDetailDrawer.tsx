import React, { useState, useEffect, useCallback } from 'react'
import {
  Drawer, Box, Typography, IconButton, Chip, LinearProgress,
  CircularProgress, Divider,
} from '@mui/material'
import { Close, AccountBalance, ArrowForward, Percent, CalendarMonth } from '@mui/icons-material'
import { conventionsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'

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
}

interface PartenaireDetailDrawerProps {
  open: boolean
  onClose: () => void
  partenaire: PartenaireData | null
  conventionId: number
  conventionBudget: number
  versements: VersementForPartenaire[]
}

const fmtMAD = (v: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v)
const fmtDate = (d: string): string => new Date(d).toLocaleDateString('fr-FR')
const fmtPct = (v: number): string => `${v.toFixed(1)}%`

const PartenaireDetailDrawer = ({
  open, onClose, partenaire, conventionBudget, versements,
}: PartenaireDetailDrawerProps) => {
  if (!partenaire) return null

  // Filter versements for this partenaire
  const partenaireVersements = versements.filter(
    (v: VersementForPartenaire) => v.partenaireId === partenaire.partenaireId,
  )
  const totalVersePrevu = partenaireVersements.reduce((s: number, v: VersementForPartenaire) => s + (v.montantPrevu || 0), 0)
  const totalVerseReel = partenaireVersements.reduce((s: number, v: VersementForPartenaire) => s + v.montant, 0)
  const tauxVersement = partenaire.budgetAlloue > 0 ? (totalVerseReel / partenaire.budgetAlloue) * 100 : 0

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, bgcolor: colors.background } }}>
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              {partenaire.estMaitreOeuvre && <Chip label="MO" size="small" sx={{ bgcolor: colors.info[100], color: colors.info[700], fontSize: typography.sizes.xs, height: 22 }} />}
              {partenaire.estMaitreOeuvreDelegue && <Chip label="MOD" size="small" sx={{ bgcolor: colors.purple[100], color: colors.purple[700], fontSize: typography.sizes.xs, height: 22 }} />}
              <Chip label={partenaire.partenaireCode} size="small" variant="outlined" sx={{ fontSize: typography.sizes.xs, height: 22 }} />
            </Box>
            <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary }}>
              {partenaire.partenaireSigle || partenaire.partenaireNom}
            </Typography>
            {partenaire.partenaireSigle && (
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{partenaire.partenaireNom}</Typography>
            )}
          </Box>
          <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {/* Stat buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <StatBtn icon={<AccountBalance sx={{ fontSize: 16 }} />} label="Budget alloue" value={fmtMAD(partenaire.budgetAlloue)} color={colors.primary[600]} borderRight />
          <StatBtn icon={<Percent sx={{ fontSize: 16 }} />} label="Part du budget" value={fmtPct(partenaire.pourcentage)} color={colors.info[600]} />
          <StatBtn icon={<CalendarMonth sx={{ fontSize: 16 }} />} label="Verse (prevu)" value={fmtMAD(totalVersePrevu)} color={colors.warning[600]} borderRight borderTop />
          <StatBtn icon={<CalendarMonth sx={{ fontSize: 16 }} />} label="Verse (reel)" value={fmtMAD(totalVerseReel)} subtitle={fmtPct(tauxVersement)} color={colors.success[600]} borderTop />
        </Box>

        {/* Progress */}
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Taux de versement</Typography>
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: tauxVersement >= 100 ? colors.success[600] : colors.primary[600] }}>{fmtPct(tauxVersement)}</Typography>
          </Box>
          <LinearProgress variant="determinate" value={Math.min(tauxVersement, 100)} sx={{ height: 6, borderRadius: 3, bgcolor: colors.neutral[100], '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: tauxVersement >= 100 ? colors.success[500] : colors.primary[500] } }} />
        </Box>

        {/* Calculation formula */}
        <Box sx={{ px: 2.5, py: 2, bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
            Comment le calcul est fait
          </Typography>
          <FormulaStep step={1} title="Budget convention" formula={fmtMAD(conventionBudget)} result="" hint="Budget total de la convention" />
          <FormulaStep step={2} title="Part du partenaire" formula={`${fmtMAD(conventionBudget)} x ${fmtPct(partenaire.pourcentage)}`} result={fmtMAD(partenaire.budgetAlloue)} hint={`Pourcentage negocie: ${partenaire.pourcentage.toFixed(2)}%`} />
          {partenaire.commissionIntervention !== null && partenaire.commissionIntervention > 0 && (
            <FormulaStep step={3} title="Commission d'intervention" formula={`${fmtMAD(partenaire.budgetAlloue)} x ${partenaire.commissionIntervention}%`} result={fmtMAD(partenaire.budgetAlloue * partenaire.commissionIntervention / 100)} hint="Commission pour services rendus" isLast />
          )}
          {(partenaire.commissionIntervention === null || partenaire.commissionIntervention === 0) && (
            <FormulaStep step={3} title="Reste a verser" formula={`${fmtMAD(partenaire.budgetAlloue)} - ${fmtMAD(totalVerseReel)}`} result={fmtMAD(partenaire.budgetAlloue - totalVerseReel)} hint="Montant encore attendu" isLast />
          )}
        </Box>

        {/* Versements list */}
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
            Versements ({partenaireVersements.length})
          </Typography>
          {partenaireVersements.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center', bgcolor: colors.surface, borderRadius: 1, border: `1px dashed ${colors.border}` }}>
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Aucun versement pour ce partenaire</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {partenaireVersements.map((v: VersementForPartenaire) => {
                const ecart = v.montantPrevu ? v.montant - v.montantPrevu : 0
                return (
                  <Box key={v.id} sx={{ p: 1.5, borderRadius: 1, bgcolor: colors.surface, border: `1px solid ${colors.border}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{fmtDate(v.dateVersement)}</Typography>
                        {v.volet && <Chip label={v.volet} size="small" sx={{ height: 18, fontSize: '10px', bgcolor: colors.purple[50], color: colors.purple[700] }} />}
                      </Box>
                      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.success[600], fontVariantNumeric: 'tabular-nums' }}>{fmtMAD(v.montant)}</Typography>
                    </Box>
                    {v.montantPrevu !== undefined && v.montantPrevu > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
                        <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>Prevu: {fmtMAD(v.montantPrevu)}</Typography>
                        <Typography sx={{ fontSize: '10px', fontWeight: typography.weights.semibold, color: ecart === 0 ? colors.success[600] : ecart > 0 ? colors.danger[600] : colors.info[600] }}>
                          Ecart: {fmtMAD(ecart)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Box>
          )}
        </Box>

        {/* Notes */}
        {partenaire.remarques && (
          <>
            <Divider />
            <Box sx={{ px: 2.5, py: 2, bgcolor: colors.neutral[25] }}>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontStyle: 'italic' }}>
                Note: {partenaire.remarques}
              </Typography>
            </Box>
          </>
        )}
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
  step: number; title: string; formula: string; result: string; hint: string; isLast?: boolean
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

export default PartenaireDetailDrawer
