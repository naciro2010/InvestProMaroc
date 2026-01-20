import { Paper, Typography, Divider, Box, Stack } from '@mui/material'
import { Calculate, Add, Remove, Check } from '@mui/icons-material'

interface DecompteCalculsCardProps {
  montantBrutHT: number
  montantTVA: number
  montantTTC: number
  totalRetenues: number
  netAPayer: number
  formatCurrency: (amount: number) => string
}

const DecompteCalculsCard = ({
  montantBrutHT,
  montantTVA,
  montantTTC,
  totalRetenues,
  netAPayer,
  formatCurrency,
}: DecompteCalculsCardProps) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Calculate color="primary" />
        <Typography variant="h6" fontWeight={600} color="primary">
          Calculs & Montants
        </Typography>
      </Stack>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={2}>
        {/* Montant Brut HT */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: '#f0f9ff',
            border: '1px solid',
            borderColor: 'primary.light',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Montant Brut HT
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            {formatCurrency(montantBrutHT)}
          </Typography>
        </Box>

        {/* + TVA */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <Add fontSize="small" color="action" />
            <Typography variant="body2" fontWeight={600}>
              TVA
            </Typography>
          </Stack>
          <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
        </Stack>

        <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Montant TVA
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {formatCurrency(montantTVA)}
          </Typography>
        </Box>

        {/* = TTC */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <Check fontSize="small" color="action" />
            <Typography variant="body2" fontWeight={600}>
              Montant TTC
            </Typography>
          </Stack>
          <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: '#f0fdf4',
            border: '1px solid',
            borderColor: 'success.light',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Montant TTC
          </Typography>
          <Typography variant="h5" fontWeight={700} color="success.main">
            {formatCurrency(montantTTC)}
          </Typography>
        </Box>

        {/* - Retenues */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <Remove fontSize="small" color="error" />
            <Typography variant="body2" fontWeight={600} color="error.main">
              Retenues
            </Typography>
          </Stack>
          <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
        </Stack>

        <Box sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 1, border: '1px solid', borderColor: 'error.light' }}>
          <Typography variant="caption" color="text.secondary">
            Total Retenues
          </Typography>
          <Typography variant="h6" fontWeight={600} color="error.main">
            {formatCurrency(totalRetenues)}
          </Typography>
        </Box>

        {/* = Net à Payer */}
        <Divider sx={{ my: 1 }} />

        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            NET À PAYER
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
            {formatCurrency(netAPayer)}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}

export default DecompteCalculsCard
