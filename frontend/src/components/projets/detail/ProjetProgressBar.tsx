import { Paper, Stack, Typography, LinearProgress } from '@mui/material'

interface ProjetProgressBarProps {
  pourcentageAvancement: number
}

const ProjetProgressBar = ({ pourcentageAvancement }: ProjetProgressBarProps) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Progression Globale
        </Typography>
        <Typography variant="h6" color="primary.main" fontWeight={600}>
          {pourcentageAvancement.toFixed(2)}%
        </Typography>
      </Stack>
      <LinearProgress variant="determinate" value={pourcentageAvancement} sx={{ height: 10, borderRadius: 5 }} />
    </Paper>
  )
}

export default ProjetProgressBar
