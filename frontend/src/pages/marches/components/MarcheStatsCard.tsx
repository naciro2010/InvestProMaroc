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
 * Design: Atlassian-style stat cards (flat, clean, professional)
 * Charge uniquement les statistiques calculées
 * Endpoint: GET /marches/{id}/stats
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
      // Micro-endpoint dédié aux statistiques
      const { data } = await marchesAPI.getById(marcheId)
      const marcheData = data.data || data

      // Calcul des stats (à terme, le backend devrait fournir un endpoint /marches/{id}/stats)
      setStats({
        montantTotal: marcheData.montantTTC || 0,
        montantPaye: 0, // À charger depuis /marches/{id}/montant-paye
        resteAPayer: marcheData.montantTTC || 0,
        tauxAvancement: 0,
        nombreDecomptes: 0, // À charger depuis /marches/{id}/decomptes/count
        nombreLignes: 0, // À charger depuis /marches/{id}/lignes/count
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

  // Stat card configurations with semantic colors
  const statCards = [
    {
      label: 'Montant Total TTC',
      value: `${formatCurrency(stats.montantTotal)} DH`,
      icon: TrendingUp,
      bgColor: colors.primary[50],
      iconBgColor: colors.primary[100],
      iconColor: colors.primary[600],
      textColor: colors.primary[700],
    },
    {
      label: 'Montant Payé',
      value: `${formatCurrency(stats.montantPaye)} DH`,
      icon: Payments,
      bgColor: colors.success[50],
      iconBgColor: colors.success[100],
      iconColor: colors.success[600],
      textColor: colors.success[700],
    },
    {
      label: 'Reste à Payer',
      value: `${formatCurrency(stats.resteAPayer)} DH`,
      icon: Receipt,
      bgColor: colors.warning[50],
      iconBgColor: colors.warning[100],
      iconColor: colors.warning[600],
      textColor: colors.warning[700],
    },
    {
      label: 'Avancement',
      value: `${(stats.tauxAvancement ?? 0).toFixed(1)}%`,
      icon: CheckCircle,
      bgColor: colors.info[50],
      iconBgColor: colors.info[100],
      iconColor: colors.info[600],
      textColor: colors.info[700],
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
                backgroundColor: card.bgColor,
                border: 'none',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: borders.radius.lg,
                    bgcolor: card.iconBgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComponent sx={{ fontSize: 24, color: card.iconColor }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
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
                    variant="h6"
                    sx={{
                      fontWeight: typography.weights.bold,
                      color: card.textColor,
                      fontSize: typography.sizes.xl,
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
