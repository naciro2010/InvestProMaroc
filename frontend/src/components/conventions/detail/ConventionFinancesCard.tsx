import { Box, Paper, Typography, Divider, Skeleton, Alert } from '@mui/material'
import { AttachMoney, TrendingUp, Calculate } from '@mui/icons-material'
import { useConventionFinances } from '@/hooks/useConventionData'

interface ConventionFinancesCardProps {
  conventionId: number
}

/**
 * Micro-component: Convention Finances Card
 * Loads financial data (~3-5 KB) independently via micro-endpoint
 * Displays: tauxCommission, budget, baseCalcul, tauxTva, montantCommissionEstime
 */
const ConventionFinancesCard = ({ conventionId }: ConventionFinancesCardProps) => {
  const { data: finances, loading, error } = useConventionFinances(conventionId)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const getBaseCalculLabel = (baseCalcul: string) => {
    const labels: Record<string, string> = {
      DECAISSEMENTS_HT: 'Décaissements HT',
      DECAISSEMENTS_TTC: 'Décaissements TTC',
      MONTANT_HT: 'Montant HT',
      MONTANT_TTC: 'Montant TTC',
      MONTANT_MARCHE: 'Montant Marché',
    }
    return labels[baseCalcul] || baseCalcul
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={60} />
        </Box>
      </Paper>
    )
  }

  if (error || !finances) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">
          Erreur lors du chargement des informations financières
        </Alert>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
        Informations Financières
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
        {/* Budget */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'success.lighter',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'success.light',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AttachMoney color="success" />
            <Typography variant="caption" color="text.secondary">
              Budget Total
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} color="success.dark">
            {formatCurrency(finances.budget)}
          </Typography>
        </Box>

        {/* Commission Estimée */}
        {finances.montantCommissionEstime !== null && (
          <Box
            sx={{
              p: 2,
              bgcolor: 'info.lighter',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'info.light',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Calculate color="info" />
              <Typography variant="caption" color="text.secondary">
                Commission Estimée
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={700} color="info.dark">
              {formatCurrency(finances.montantCommissionEstime)}
            </Typography>
          </Box>
        )}

        {/* Taux Commission */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TrendingUp color="action" />
            <Typography variant="caption" color="text.secondary">
              Taux de Commission
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={600}>
            {formatPercent(finances.tauxCommission)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getBaseCalculLabel(finances.baseCalcul)}
          </Typography>
        </Box>

        {/* TVA */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Taux TVA
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {formatPercent(finances.tauxTva)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default ConventionFinancesCard
