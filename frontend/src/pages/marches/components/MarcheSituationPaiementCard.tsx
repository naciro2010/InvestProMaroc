import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Stack,
  Card,
  CircularProgress,
  LinearProgress,
} from '@mui/material'
import {
  AccountBalance,
  CheckCircle,
  HourglassEmpty,
  Cancel,
} from '@mui/icons-material'
import type { SvgIconComponent } from '@mui/icons-material'
import { marchesAPI } from '../../../lib/api'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'

interface MarcheSituationPaiementCardProps {
  marcheId: number
}

/** Matches backend MarcheSituationPaiementDTO */
interface SituationPaiement {
  totalDecomptes: number
  totalNetAPayer: number
  totalMontantPaye: number
  resteAPayer: number
  tauxPaiement: number
  decomptesNonPayes: number
  decomptesPayesPartiellement: number
  decomptesPayesTotalement: number
  nombrePaiements: number
}

interface MetricCardConfig {
  label: string
  value: string
  icon: SvgIconComponent
  iconBgColor: string
  iconColor: string
  valueColor: string
}

/**
 * MICRO-COMPONENT: MarcheSituationPaiementCard
 * Displays a summary card with aggregated payment metrics for a marche.
 * Shows total amounts, payment progress, and decompte status breakdown.
 *
 * Endpoint: GET /marches/{id}/situation-paiement
 */
const MarcheSituationPaiementCard = ({ marcheId }: MarcheSituationPaiementCardProps) => {
  const [situation, setSituation] = useState<SituationPaiement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSituation()
  }, [marcheId])

  const loadSituation = async () => {
    try {
      setLoading(true)
      const { data } = await marchesAPI.getSituationPaiement(marcheId)
      const situationData = data.data || data
      setSituation(situationData)
    } catch (err) {
      console.error('Erreur chargement situation paiement:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return '0,00'
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CircularProgress size={30} />
      </Box>
    )
  }

  if (!situation || situation.totalDecomptes === 0) return null

  const progressColor = situation.tauxPaiement >= 100
    ? colors.success[500]
    : situation.tauxPaiement > 0
      ? colors.warning[500]
      : colors.neutral[300]

  const metricCards: MetricCardConfig[] = [
    {
      label: 'Reste a payer',
      value: `${formatCurrency(situation.resteAPayer)} DH`,
      icon: AccountBalance,
      iconBgColor: colors.warning[50],
      iconColor: colors.warning[600],
      valueColor: colors.warning[700],
    },
    {
      label: 'Payes totalement',
      value: `${situation.decomptesPayesTotalement} / ${situation.totalDecomptes}`,
      icon: CheckCircle,
      iconBgColor: colors.success[50],
      iconColor: colors.success[600],
      valueColor: colors.success[700],
    },
    {
      label: 'Partiellement payes',
      value: `${situation.decomptesPayesPartiellement}`,
      icon: HourglassEmpty,
      iconBgColor: colors.warning[50],
      iconColor: colors.warning[600],
      valueColor: colors.warning[700],
    },
    {
      label: 'Non payes',
      value: `${situation.decomptesNonPayes}`,
      icon: Cancel,
      iconBgColor: colors.danger[50],
      iconColor: colors.danger[600],
      valueColor: colors.danger[700],
    },
  ]

  return (
    <Box sx={{ ...componentStyles.card, p: 0, mb: 3, overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: colors.neutral[50],
          borderBottom: `1px solid ${colors.border}`,
          px: 3,
          py: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
          }}
        >
          Situation des paiements
        </Typography>
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          {situation.totalDecomptes} decompte(s) - {situation.nombrePaiements} paiement(s)
        </Typography>
      </Box>

      {/* Progress bar */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
            Avancement paiements
          </Typography>
          <Typography
            sx={{
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.semibold,
              color: progressColor,
            }}
          >
            {situation.tauxPaiement.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, situation.tauxPaiement)}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: colors.neutral[100],
            '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: progressColor },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Paye: {formatCurrency(situation.totalMontantPaye)} DH
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Total: {formatCurrency(situation.totalNetAPayer)} DH
          </Typography>
        </Box>
      </Box>

      {/* Stat cards row */}
      <Box sx={{ px: 3, pb: 3, pt: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {metricCards.map((card) => {
            const IconComponent = card.icon
            return (
              <Card
                key={card.label}
                sx={{ ...componentStyles.statCard, flex: 1, display: 'flex', alignItems: 'center' }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: borders.radius.md,
                      bgcolor: card.iconBgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent sx={{ fontSize: 20, color: card.iconColor }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: typography.sizes.xs,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {card.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: typography.weights.bold,
                        color: card.valueColor,
                        fontSize: typography.sizes.base,
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}

export default MarcheSituationPaiementCard
