import type { ReactNode } from 'react'
import { Box, Typography, Divider, Tooltip, Chip } from '@mui/material'
import {
  AccountBalance, TrendingUp, CalendarMonth,
  Groups, Speed, Receipt,
} from '@mui/icons-material'
import { colors, typography, borders } from '@/lib/designSystem'
import type { ConventionDetailEnrichedDTO } from '@/types/api'

// ──── Types ────

interface ConventionQuickSummaryProps {
  convention: {
    budget: number; tauxCommission: number; tauxTva: number
    statut: string; dateDebut: string; dateFin?: string
    typeConvention: 'CADRE' | 'SPECIFIQUE'
  }
  enrichedData: ConventionDetailEnrichedDTO | null
}

// ──── Helpers ────

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)
const fmtPct = (n: number) => `${n.toFixed(1)}%`

const getHealthColor = (statut: string, tauxRealisation: number, dateFin?: string): string => {
  if (statut === 'ACHEVE') return colors.success[500]
  if (statut === 'ANNULE' || statut === 'REJETE') return colors.danger[500]
  if (dateFin) {
    const daysLeft = Math.ceil((new Date(dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) return colors.danger[500]
    if (daysLeft < 30) return colors.warning[500]
  }
  if (tauxRealisation > 80) return colors.success[500]
  if (tauxRealisation > 40) return colors.primary[500]
  return colors.info[500]
}

const getHealthLabel = (statut: string, tauxRealisation: number, dateFin?: string): string => {
  if (statut === 'ACHEVE') return 'Terminee'
  if (statut === 'ANNULE') return 'Annulee'
  if (statut === 'REJETE') return 'Rejetee'
  if (dateFin) {
    const daysLeft = Math.ceil((new Date(dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) return 'En retard'
    if (daysLeft < 30) return 'Urgente'
  }
  if (tauxRealisation > 80) return 'Bonne voie'
  if (tauxRealisation > 40) return 'En cours'
  return 'Debut'
}

// ──── Sub-components ────

const SummaryRow = ({ icon, label, value, color, hint }: {
  icon: ReactNode; label: string; value: string; color?: string; hint?: string
}) => (
  <Tooltip title={hint || ''} placement="left">
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1, py: 0.5,
      '&:hover': { bgcolor: colors.neutral[50] }, px: 1, mx: -1,
      borderRadius: borders.radius.xs,
    }}>
      <Box sx={{ color: colors.textSecondary, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, flex: 1, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold,
        color: color || colors.textPrimary, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
      }}>
        {value}
      </Typography>
    </Box>
  </Tooltip>
)

// ──── Main Component ────

const ConventionQuickSummary = ({ convention, enrichedData }: ConventionQuickSummaryProps) => {
  const tauxRealisation = enrichedData?.tauxRealisation ?? 0
  const healthColor = getHealthColor(convention.statut, tauxRealisation, convention.dateFin)
  const healthLabel = getHealthLabel(convention.statut, tauxRealisation, convention.dateFin)
  const commissionEstimee = enrichedData?.commissionTTC ?? (convention.budget * convention.tauxCommission / 100 * (1 + convention.tauxTva / 100))
  const daysLeft = convention.dateFin ? Math.ceil((new Date(convention.dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

  return (
    <Box sx={{
      border: `1px solid ${colors.border}`, borderRadius: borders.radius.md,
      overflow: 'hidden',
    }}>
      {/* Health indicator */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, py: 1, bgcolor: colors.neutral[25],
        borderBottom: `1px solid ${colors.borderSubtle}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Speed sx={{ fontSize: 16, color: healthColor }} />
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Resume
          </Typography>
        </Box>
        <Chip label={healthLabel} size="small" sx={{
          height: 20, fontSize: '10px', fontWeight: typography.weights.bold,
          bgcolor: `${healthColor}15`, color: healthColor, border: `1px solid ${healthColor}30`,
        }} />
      </Box>

      {/* Summary rows */}
      <Box sx={{ px: 2, py: 1.25 }}>
        <SummaryRow icon={<AccountBalance sx={{ fontSize: 14 }} />} label="Budget" value={fmt(convention.budget)} color={colors.primary[700]} />
        <SummaryRow icon={<TrendingUp sx={{ fontSize: 14 }} />} label="Commission" value={fmt(commissionEstimee)} color={colors.warning[600]} hint={`${convention.tauxCommission}% + TVA ${convention.tauxTva}%`} />
        <SummaryRow icon={<Receipt sx={{ fontSize: 14 }} />} label="Realisation" value={fmtPct(tauxRealisation)} color={tauxRealisation > 80 ? colors.success[600] : colors.textPrimary} />

        <Divider sx={{ my: 0.75 }} />

        <SummaryRow icon={<Groups sx={{ fontSize: 14 }} />} label="Partenaires" value={String(enrichedData?.nombrePartenaires ?? 0)} />
        <SummaryRow icon={<Receipt sx={{ fontSize: 14 }} />} label="Marches" value={String(enrichedData?.nombreMarches ?? 0)} hint={enrichedData?.montantTotalMarches ? fmt(enrichedData.montantTotalMarches) : undefined} />

        {enrichedData?.nombreSousConventions !== undefined && enrichedData.nombreSousConventions > 0 && (
          <SummaryRow icon={<Receipt sx={{ fontSize: 14 }} />} label="S-Conventions" value={String(enrichedData.nombreSousConventions)} />
        )}

        <Divider sx={{ my: 0.75 }} />

        <SummaryRow icon={<CalendarMonth sx={{ fontSize: 14 }} />} label="Debut" value={new Date(convention.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })} />
        {convention.dateFin && (
          <SummaryRow
            icon={<CalendarMonth sx={{ fontSize: 14 }} />}
            label="Fin"
            value={new Date(convention.dateFin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
            color={daysLeft !== null && daysLeft < 0 ? colors.danger[600] : daysLeft !== null && daysLeft < 30 ? colors.warning[600] : undefined}
            hint={daysLeft !== null ? (daysLeft < 0 ? `${Math.abs(daysLeft)}j de retard` : `${daysLeft}j restants`) : undefined}
          />
        )}
        {enrichedData?.dureeJours !== undefined && enrichedData.dureeJours !== null && (
          <SummaryRow icon={<CalendarMonth sx={{ fontSize: 14 }} />} label="Duree" value={`${enrichedData.dureeJours}j`} />
        )}
      </Box>
    </Box>
  )
}

export default ConventionQuickSummary
