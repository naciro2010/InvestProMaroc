import { useState, useEffect } from 'react'
import { Box, Typography, Stack, CircularProgress, Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { decomptesAPI } from '@/lib/api'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'
import { StatusBadge } from '@/components/core'

// ==================== TYPES ====================

interface DecompteInfoCardProps {
  decompteId: number
}

interface DecompteInfo {
  id: number
  marcheId: number
  marcheNumero: string | null
  marcheFournisseur: string | null
  numeroDecompte: string
  dateDecompte: string
  periodeDebut: string
  periodeFin: string
  statut: string
  montantBrutHT: number
  montantTVA: number
  montantTTC: number
  totalRetenues: number
  netAPayer: number
  cumulPrecedent: number | null
  cumulActuel: number | null
  observations: string | null
  dateValidation: string | null
  montantPaye: number
  estSolde: boolean
}

// ==================== HELPERS ====================

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '0,00 MAD'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' MAD'
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR')
}

// ==================== SUB-COMPONENT ====================

interface InfoFieldProps {
  label: string
  value: string
  primary?: boolean
  danger?: boolean
  bold?: boolean
}

const InfoField = ({ label, value, primary, danger, bold }: InfoFieldProps) => (
  <Box>
    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.gray[500], mb: 0.5 }}>
      {label}
    </Typography>
    <Typography sx={{
      fontWeight: bold || primary || danger ? typography.weights.semibold : typography.weights.normal,
      fontSize: typography.sizes.base,
      color: primary ? colors.primary[700] : danger ? colors.danger[600] : colors.gray[800],
    }}>
      {value}
    </Typography>
  </Box>
)

// ==================== COMPONENT ====================

/**
 * MICRO-COMPONENT: DecompteInfoCard
 * Loads decompte data independently via GET /api/decomptes/{id}
 * Displays general info and financial summary.
 */
const DecompteInfoCard = ({ decompteId }: DecompteInfoCardProps) => {
  const [info, setInfo] = useState<DecompteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadInfo = async () => {
      try {
        setLoading(true)
        const { data } = await decomptesAPI.getById(decompteId)
        const decompteData = data.data || data
        setInfo(decompteData)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue'
        console.error('Erreur chargement info decompte:', message)
      } finally {
        setLoading(false)
      }
    }
    loadInfo()
  }, [decompteId])

  if (loading) {
    return (
      <Box sx={{ ...componentStyles.card, p: 3, mb: 3, textAlign: 'center' }}>
        <CircularProgress size={30} />
      </Box>
    )
  }

  if (!info) return null

  return (
    <Box sx={{ ...componentStyles.card, p: 3, mb: 3 }}>
      <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.lg, color: colors.gray[800], mb: 2 }}>
        Informations Generales
      </Typography>
      <Divider sx={{ mb: 2.5 }} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
        <InfoField label="Numero Decompte" value={info.numeroDecompte} bold />
        <Box>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.gray[500], mb: 0.5 }}>Statut</Typography>
          <StatusBadge status={info.statut} />
        </Box>

        {/* Marche reference */}
        <Box sx={{ gridColumn: { md: '1 / -1' } }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.gray[500], mb: 0.5 }}>Marche</Typography>
          <Typography
            sx={{
              fontWeight: typography.weights.semibold,
              color: colors.primary[700],
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => navigate(`/marches/${info.marcheId}`)}
          >
            {info.marcheNumero || `Marche #${info.marcheId}`}
          </Typography>
          {info.marcheFournisseur && (
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.gray[500] }}>
              Fournisseur: {info.marcheFournisseur}
            </Typography>
          )}
        </Box>

        <InfoField label="Date du decompte" value={formatDate(info.dateDecompte)} />
        <InfoField label="Periode" value={`${formatDate(info.periodeDebut)} - ${formatDate(info.periodeFin)}`} />

        {/* Financial summary */}
        <InfoField label="Montant Brut HT" value={formatCurrency(info.montantBrutHT)} bold />
        <InfoField label="Montant TVA" value={formatCurrency(info.montantTVA)} />
        <InfoField label="Montant TTC" value={formatCurrency(info.montantTTC)} bold />
        <InfoField label="Total Retenues" value={formatCurrency(info.totalRetenues)} danger />

        <Box sx={{
          gridColumn: { md: '1 / -1' },
          p: 2,
          bgcolor: colors.primary[25],
          borderRadius: borders.radius.md,
          border: `1px solid ${colors.primary[100]}`,
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: typography.weights.semibold, color: colors.gray[700] }}>Net a Payer</Typography>
            <Typography sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xl, color: colors.primary[700] }}>
              {formatCurrency(info.netAPayer)}
            </Typography>
          </Stack>
        </Box>

        <InfoField label="Montant Paye" value={formatCurrency(info.montantPaye)} />
        <InfoField label="Solde" value={info.estSolde ? 'Solde' : 'Non solde'} primary={info.estSolde} />
        <InfoField label="Cumul Precedent" value={formatCurrency(info.cumulPrecedent)} />
        <InfoField label="Cumul Actuel" value={formatCurrency(info.cumulActuel)} />
      </Box>

      {info.observations && (
        <Box sx={{ mt: 2.5 }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.gray[500], mb: 0.5 }}>Observations</Typography>
          <Box sx={{ p: 2, bgcolor: colors.neutral[50], borderRadius: borders.radius.md }}>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.gray[700] }}>{info.observations}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default DecompteInfoCard
