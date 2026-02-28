import { Box, Paper, Typography, Chip, Divider, Tooltip } from '@mui/material'
import { CalendarMonth, Person, Percent, Calculate, Info } from '@mui/icons-material'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { ConventionDetailEnrichedDTO } from '@/types/api'

interface Convention {
  budget: number; tauxCommission: number; tauxTva: number; tauxTvaLignes: number
  baseCalcul: string; commissionMode?: string
  dateSignature: string; dateDebut: string; dateFin?: string
}

interface ConventionKeyInfoCardProps {
  convention: Convention
  enrichedData: ConventionDetailEnrichedDTO | null
}

const fmtMAD = (v: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v)
const fmtDate = (d?: string | null): string =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtPct = (v: number): string => `${v.toFixed(2)}%`

const BASE_LABELS: Record<string, string> = {
  MONTANT_TTC: 'Montant TTC', MONTANT_HT: 'Montant HT',
  MONTANT_HORS_TAXES: 'Montant HT', MONTANT_NET: 'Montant Net',
}
const MODE_LABELS: Record<string, string> = {
  GLOBAL: 'Taux global', PAR_CATEGORIE: 'Par categorie de depense',
}

/**
 * ConventionKeyInfoCard: Odoo-style information grid showing convention
 * financial parameters, key dates, and audit trail.
 * All fields are read-only; user understands the rules that govern the convention.
 */
const ConventionKeyInfoCard = ({ convention, enrichedData }: ConventionKeyInfoCardProps) => {
  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
      {/* Financial Parameters */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <Calculate sx={{ fontSize: 15, color: colors.primary[500] }} />
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Parametres financiers
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
          <InfoField label="Budget convention" value={fmtMAD(convention.budget)} color={colors.primary[700]} bold />
          <InfoField label="Taux commission" value={fmtPct(convention.tauxCommission)} icon={<Percent sx={{ fontSize: 12 }} />} />
          <InfoField label="TVA" value={fmtPct(convention.tauxTva)} />
          <InfoField label="Base de calcul" value={BASE_LABELS[convention.baseCalcul] || convention.baseCalcul} />
        </Box>
        {convention.commissionMode && (
          <Box sx={{ mt: 1 }}>
            <Tooltip title="Methode de calcul de la commission" placement="top">
              <Chip
                icon={<Info sx={{ fontSize: 14 }} />}
                label={`Mode commission: ${MODE_LABELS[convention.commissionMode] || convention.commissionMode}`}
                size="small"
                sx={{ fontSize: typography.sizes.xs, bgcolor: colors.warning[50], color: colors.warning[700], '& .MuiChip-icon': { color: colors.warning[500] } }}
              />
            </Tooltip>
            {enrichedData?.tauxCommissionEffectif !== undefined && enrichedData.tauxCommissionEffectif !== convention.tauxCommission && (
              <Chip
                label={`Taux effectif: ${fmtPct(enrichedData.tauxCommissionEffectif)}`}
                size="small"
                sx={{ ml: 0.5, fontSize: typography.sizes.xs, bgcolor: colors.info[50], color: colors.info[700] }}
              />
            )}
          </Box>
        )}
      </Box>

      <Divider />

      {/* Dates + Audit */}
      <Box sx={{ px: 2, py: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
        {/* Key Dates */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
            <CalendarMonth sx={{ fontSize: 15, color: colors.info[500] }} />
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Dates cles
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <InfoField label="Signature" value={fmtDate(convention.dateSignature)} />
            <InfoField label="Debut" value={fmtDate(convention.dateDebut)} />
            <InfoField label="Fin" value={fmtDate(convention.dateFin)} />
            {enrichedData?.dureeJours !== undefined && enrichedData.dureeJours !== null && (
              <InfoField label="Duree" value={`${enrichedData.dureeJours} jours`} />
            )}
          </Box>
        </Box>

        {/* Audit Trail */}
        {enrichedData && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
              <Person sx={{ fontSize: 15, color: colors.purple[500] }} />
              <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Tracabilite
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {enrichedData.createdByNom && (
                <InfoField label="Cree par" value={enrichedData.createdByNom} />
              )}
              {enrichedData.createdAt && (
                <InfoField label="Date creation" value={fmtDate(enrichedData.createdAt)} />
              )}
              {enrichedData.valideParNom && (
                <InfoField label="Valide par" value={enrichedData.valideParNom} />
              )}
              {enrichedData.dateValidation && (
                <InfoField label="Date validation" value={fmtDate(enrichedData.dateValidation)} />
              )}
              {enrichedData.dateSoumission && !enrichedData.dateValidation && (
                <InfoField label="Date soumission" value={fmtDate(enrichedData.dateSoumission)} />
              )}
              {enrichedData.motifRejet && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography sx={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase' }}>Motif de rejet</Typography>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.danger[600], fontWeight: typography.weights.medium }}>{enrichedData.motifRejet}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

const InfoField = ({ label, value, color, bold, icon }: {
  label: string; value: string; color?: string; bold?: boolean; icon?: React.ReactNode
}) => (
  <Box>
    <Typography sx={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.3 }}>{label}</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
      {icon}
      <Typography sx={{
        fontSize: typography.sizes.sm,
        fontWeight: bold ? typography.weights.bold : typography.weights.medium,
        color: color || colors.textPrimary,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.3,
      }}>
        {value}
      </Typography>
    </Box>
  </Box>
)

export default ConventionKeyInfoCard
