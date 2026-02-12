import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  LinearProgress,
} from '@mui/material'
import {
  Receipt,
  Payments,
  AccountBalanceWallet,
  TrendingUp,
} from '@mui/icons-material'
import type { SvgIconComponent } from '@mui/icons-material'
import { marchesAPI } from '@/lib/api'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'

interface MarcheFinanceDashboardProps {
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

interface KpiCardConfig {
  label: string
  value: string
  icon: SvgIconComponent
  bgColor: string
  iconColor: string
  valueColor: string
}

const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '0,00'
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * MICRO-COMPONENT: MarcheFinanceDashboard
 * Displays 4 KPI cards + payment progress bar.
 * Endpoint: GET /marches/{id}/situation-paiement
 */
const MarcheFinanceDashboard = ({ marcheId }: MarcheFinanceDashboardProps) => {
  const [situation, setSituation] = useState<SituationPaiement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const { data } = await marchesAPI.getSituationPaiement(marcheId)
        setSituation(data.data || data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        console.error('Erreur chargement situation paiement:', msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [marcheId])

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (!situation || situation.totalDecomptes === 0) return null

  const progressColor =
    situation.tauxPaiement >= 80
      ? colors.success[500]
      : situation.tauxPaiement >= 50
        ? colors.warning[500]
        : colors.danger[400]

  const kpiCards: KpiCardConfig[] = [
    {
      label: 'Total Decomptes',
      value: `${formatCurrency(situation.totalNetAPayer)} DH`,
      icon: Receipt,
      bgColor: colors.primary[50],
      iconColor: colors.primary[600],
      valueColor: colors.primary[700],
    },
    {
      label: 'Total Paye',
      value: `${formatCurrency(situation.totalMontantPaye)} DH`,
      icon: Payments,
      bgColor: colors.success[50],
      iconColor: colors.success[600],
      valueColor: colors.success[700],
    },
    {
      label: 'Reste a Payer',
      value: `${formatCurrency(situation.resteAPayer)} DH`,
      icon: AccountBalanceWallet,
      bgColor: colors.warning[50],
      iconColor: colors.warning[600],
      valueColor: colors.warning[700],
    },
    {
      label: 'Taux de Paiement',
      value: `${situation.tauxPaiement.toFixed(1)} %`,
      icon: TrendingUp,
      bgColor: situation.tauxPaiement >= 80 ? colors.success[50] : colors.warning[50],
      iconColor: situation.tauxPaiement >= 80 ? colors.success[600] : colors.warning[600],
      valueColor: situation.tauxPaiement >= 80 ? colors.success[700] : colors.warning[700],
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
          Tableau de bord financier
        </Typography>
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          {situation.totalDecomptes} decompte(s) - {situation.nombrePaiements} paiement(s)
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {kpiCards.map((card) => {
            const IconComp = card.icon
            return (
              <Box
                key={card.label}
                sx={{
                  ...componentStyles.statCard,
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: borders.radius.md,
                    bgcolor: card.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComp sx={{ fontSize: 20, color: card.iconColor }} />
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
              </Box>
            )
          })}
        </Stack>
      </Box>

      {/* Progress bar */}
      <Box sx={{ px: 3, pb: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Avancement des paiements
          </Typography>
          <Typography
            sx={{
              fontSize: typography.sizes.xs,
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
            height: 6,
            borderRadius: 3,
            bgcolor: colors.neutral[100],
            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: progressColor },
          }}
        />
      </Box>
    </Box>
  )
}

export default MarcheFinanceDashboard
