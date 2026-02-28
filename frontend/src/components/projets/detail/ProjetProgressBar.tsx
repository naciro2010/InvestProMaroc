import { Box, Typography, LinearProgress } from '@mui/material'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface ProjetProgressBarProps {
  pourcentageAvancement: number
}

const ProjetProgressBar = ({ pourcentageAvancement }: ProjetProgressBarProps) => {
  return (
    <Box sx={{ ...componentStyles.card, p: 2.5, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
          Progression Globale
        </Typography>
        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.primary[600] }}>
          {pourcentageAvancement.toFixed(1)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pourcentageAvancement}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: colors.neutral[100],
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            bgcolor: pourcentageAvancement >= 80 ? colors.success[400]
              : pourcentageAvancement >= 40 ? colors.primary[400]
              : colors.warning[400],
          },
        }}
      />
    </Box>
  )
}

export default ProjetProgressBar
