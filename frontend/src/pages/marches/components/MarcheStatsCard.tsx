import { useState, useEffect } from 'react'
import { Box, Card, Typography, Stack, CircularProgress } from '@mui/material'
import { TrendingUp, Receipt, Payments, CheckCircle } from '@mui/icons-material'
import { marchesAPI } from '../../../lib/api'
import { colors, componentStyles, borders, typography } from '@/lib/designSystem'

interface MarcheStatsCardProps {
  marcheId: number
}

interface MarcheStats {
  montantTotal: number
  montantPaye: number
  resteAPayer: number
  tauxAvancement: number
  nombreDecomptes: number
  nombreLignes: number
}

/**
 * MICRO-COMPONENT: MarcheStatsCard
 * Design: Atlassian-style stat cards (white bg, colored icons/values)
 * Charge uniquement les statistiques calculées
 */
const MarcheStatsCard = ({ marcheId }: MarcheStatsCardProps) => {
  const [stats, setStats] = useState<MarcheStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [marcheId])

  const loadStats = async () => {
    try {
      setLoading(true)
      const { data } = await marchesAPI.getById(marcheId)
      const marcheData = data.data || data

      setStats({
        montantTotal: marcheData.montantTtc || 0,
        montantPaye: 0,
        resteAPayer: marcheData.montantTtc || 0,
        tauxAvancement: 0,
        nombreDecomptes: marcheData.decomptes?.length || 0,
        nombreLignes: marcheData.lignes?.length || 0,
      })
    } catch (err) {
      console.error('Erreur chargement stats:', err)
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

  if (!stats) return null

  // Stat card configurations - using semantic colors for icons/values only
  const statCards = [
    {
      label: 'Montant Total TTC',
      value: `${formatCurrency(stats.montantTotal)} DH`,
      icon: TrendingUp,
      iconColor: colors.primary[600],
      valueColor: colors.primary[700],
    },
    {
      label: 'Montant Payé',
      value: `${formatCurrency(stats.montantPaye)} DH`,
      icon: Payments,
      iconColor: colors.success[600],
      valueColor: colors.success[700],
    },
    {
      label: 'Reste à Payer',
      value: `${formatCurrency(stats.resteAPayer)} DH`,
      icon: Receipt,
      iconColor: colors.warning[600],
      valueColor: colors.warning[700],
    },
    {
      label: 'Avancement',
      value: `${(stats.tauxAvancement ?? 0).toFixed(1)}%`,
      icon: CheckCircle,
      iconColor: colors.info[600],
      valueColor: colors.info[700],
    },
  ]

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
      {statCards.map((card, index) => {
        const IconComponent = card.icon
        return (
          <Box key={index} sx={{ flex: 1 }}>
            <Card
              sx={{
                ...componentStyles.statCard,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: borders.radius.lg,
                    bgcolor: colors.neutral[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComponent sx={{ fontSize: 24, color: card.iconColor }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      color: colors.textSecondary,
                      fontSize: typography.sizes.xs,
                      fontWeight: typography.weights.medium,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      mb: 0.5,
                    }}
                  >
                    {card.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: typography.weights.bold,
                      color: card.valueColor,
                      fontSize: typography.sizes.lg,
                    }}
                  >
                    {card.value}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Box>
        )
      })}
    </Stack>
  )
}

export default MarcheStatsCard
