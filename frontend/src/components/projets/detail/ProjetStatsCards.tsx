import { Box, Paper, Stack, Typography } from '@mui/material'
import { AccountBalance, TrendingUp, AttachMoney, CalendarToday } from '@mui/icons-material'

interface ProjetStatsCardsProps {
  budgetTotal: number
  pourcentageAvancement: number
  budgetConsomme: number
  estEnRetard: boolean
  formatCurrency: (amount: number) => string
}

const ProjetStatsCards = ({
  budgetTotal,
  pourcentageAvancement,
  budgetConsomme,
  estEnRetard,
  formatCurrency,
}: ProjetStatsCardsProps) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
      {/* Budget Total */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark' }}>
            <AccountBalance />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Budget Total
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {formatCurrency(budgetTotal)}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Avancement */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark' }}>
            <TrendingUp />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Avancement
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {pourcentageAvancement.toFixed(2)}%
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Budget Consommé */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.dark' }}>
            <AttachMoney />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Budget Consommé
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {formatCurrency(budgetConsomme)}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Statut */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: estEnRetard ? 'error.light' : 'info.light',
              color: estEnRetard ? 'error.dark' : 'info.dark',
            }}
          >
            <CalendarToday />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Statut
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {estEnRetard ? 'En retard' : 'Dans les temps'}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default ProjetStatsCards
