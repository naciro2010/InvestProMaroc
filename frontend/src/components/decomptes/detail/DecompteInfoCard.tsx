import { Paper, Typography, Divider, Box, Chip, Stack } from '@mui/material'
import { Description, CalendarToday, TrendingUp } from '@mui/icons-material'

interface Decompte {
  id: number
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
  cumulPrecedent: number
  cumulActuel: number
  observations?: string
  marcheCode?: string
  marcheObjet?: string
}

interface DecompteInfoCardProps {
  decompte: Decompte
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
  getStatusColor: (statut: string) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

const DecompteInfoCard = ({ decompte, formatCurrency, formatDate, getStatusColor }: DecompteInfoCardProps) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Description color="primary" />
        <Typography variant="h6" fontWeight={600} color="primary">
          Informations Générales
        </Typography>
      </Stack>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'grid', gap: 2.5 }}>
        {/* Statut & Numéro */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Numéro Décompte
            </Typography>
            <Typography variant="h6" fontWeight={600} color="primary.main">
              {decompte.numeroDecompte}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Statut
            </Typography>
            <Chip label={decompte.statut} color={getStatusColor(decompte.statut)} sx={{ fontWeight: 600 }} />
          </Box>
        </Box>

        <Divider />

        {/* Marché lié */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Marché
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {decompte.marcheCode || 'N/A'}
          </Typography>
          {decompte.marcheObjet && (
            <Typography variant="body2" color="text.secondary">
              {decompte.marcheObjet}
            </Typography>
          )}
        </Box>

        {/* Période */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <CalendarToday fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Période de travaux
            </Typography>
          </Stack>
          <Typography variant="body1">
            Du {formatDate(decompte.periodeDebut)} au {formatDate(decompte.periodeFin)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Date du décompte: {formatDate(decompte.dateDecompte)}
          </Typography>
        </Box>

        {/* Cumuls */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <TrendingUp fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Cumuls
            </Typography>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Cumul précédent
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatCurrency(decompte.cumulPrecedent)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Cumul actuel
              </Typography>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                {formatCurrency(decompte.cumulActuel)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Observations */}
        {decompte.observations && (
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Observations
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#f9fafb' }}>
              <Typography variant="body2">{decompte.observations}</Typography>
            </Paper>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default DecompteInfoCard
