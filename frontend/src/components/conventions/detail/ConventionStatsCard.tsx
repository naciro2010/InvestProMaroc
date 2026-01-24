import { Box, Paper, Typography, Divider, Skeleton, Alert, LinearProgress } from '@mui/material'
import { Assessment, TrendingUp, FolderOpen, Business, AccountTree } from '@mui/icons-material'
import { useConventionStats } from '@/hooks/useConventionData'

interface ConventionStatsCardProps {
  conventionId: number
}

/**
 * Micro-component: Convention Statistics Card
 * Loads aggregated stats (~5 KB) independently via micro-endpoint
 * Displays: project count, market count, sub-convention count, amounts, realization rate
 */
const ConventionStatsCard = ({ conventionId }: ConventionStatsCardProps) => {
  const { data: stats, loading, error } = useConventionStats(conventionId)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={100} />
        </Box>
      </Paper>
    )
  }

  if (error || !stats) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">
          Erreur lors du chargement des statistiques
        </Alert>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Assessment color="primary" />
        <Typography variant="h6" fontWeight={600} color="primary">
          Statistiques
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {/* Nombre de Projets */}
        <Box
          sx={{
            p: 2,
            textAlign: 'center',
            bgcolor: 'primary.lighter',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'primary.light',
          }}
        >
          <FolderOpen color="primary" sx={{ fontSize: 32, mb: 1 }} />
          <Typography variant="h4" fontWeight={700} color="primary.dark">
            {stats.nombreProjets}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Projets liés
          </Typography>
        </Box>

        {/* Nombre de Marchés */}
        <Box
          sx={{
            p: 2,
            textAlign: 'center',
            bgcolor: 'secondary.lighter',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'secondary.light',
          }}
        >
          <Business color="secondary" sx={{ fontSize: 32, mb: 1 }} />
          <Typography variant="h4" fontWeight={700} color="secondary.dark">
            {stats.nombreMarches}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Marchés liés
          </Typography>
        </Box>

        {/* Sous-Conventions */}
        <Box
          sx={{
            p: 2,
            textAlign: 'center',
            bgcolor: 'info.lighter',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'info.light',
          }}
        >
          <AccountTree color="info" sx={{ fontSize: 32, mb: 1 }} />
          <Typography variant="h4" fontWeight={700} color="info.dark">
            {stats.nombreSousConventions}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sous-conventions
          </Typography>
        </Box>

        {/* Taux Réalisation */}
        <Box
          sx={{
            p: 2,
            textAlign: 'center',
            bgcolor: 'success.lighter',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'success.light',
          }}
        >
          <TrendingUp color="success" sx={{ fontSize: 32, mb: 1 }} />
          <Typography variant="h4" fontWeight={700} color="success.dark">
            {formatPercent(stats.tauxRealisation)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Taux réalisation
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        {/* Montant Total Projets */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Montant Total Projets
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {formatCurrency(stats.montantTotalProjets)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((stats.montantTotalProjets / 10000000) * 100, 100)}
            sx={{ mt: 1, height: 6, borderRadius: 1 }}
          />
        </Box>

        {/* Montant Total Marchés */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Montant Total Marchés
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {formatCurrency(stats.montantTotalMarches)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((stats.montantTotalMarches / 10000000) * 100, 100)}
            color="secondary"
            sx={{ mt: 1, height: 6, borderRadius: 1 }}
          />
        </Box>
      </Box>

      {/* Commission Totale */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'warning.lighter',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'warning.light',
          textAlign: 'center',
          mt: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Commission Totale
        </Typography>
        <Typography variant="h5" fontWeight={700} color="warning.dark">
          {formatCurrency(stats.commissionTotale)}
        </Typography>
      </Box>
    </Paper>
  )
}

export default ConventionStatsCard
