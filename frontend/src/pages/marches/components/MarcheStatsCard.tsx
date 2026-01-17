import { useState, useEffect } from 'react'
import { Box, Card, Typography, Stack, CircularProgress } from '@mui/material'
import { TrendingUp, Receipt, Payments, CheckCircle } from '@mui/icons-material'
import { marchesAPI } from '../../../lib/api'
import colors from '../../../theme/colors'

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

  const formatCurrency = (amount: number): string => {
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

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
      {/* Montant Total */}
      <Box sx={{ flex: 1 }}>
        <Card sx={{ p: 3, background: colors.gradients.primary, color: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Montant Total TTC
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(stats.montantTotal)} DH
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Box>

      {/* Montant Payé */}
      <Box sx={{ flex: 1 }}>
        <Card sx={{ p: 3, background: colors.gradients.success, color: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Payments sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Montant Payé
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(stats.montantPaye)} DH
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Box>

      {/* Reste à Payer */}
      <Box sx={{ flex: 1 }}>
        <Card sx={{ p: 3, background: colors.gradients.warning, color: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Receipt sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Reste à Payer
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(stats.resteAPayer)} DH
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Box>

      {/* Avancement */}
      <Box sx={{ flex: 1 }}>
        <Card sx={{ p: 3, background: colors.gradients.error, color: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Avancement
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {stats.tauxAvancement.toFixed(1)}%
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Box>
    </Stack>
  )
}

export default MarcheStatsCard
