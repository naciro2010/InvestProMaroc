import { Box, Typography, Chip, CircularProgress } from '@mui/material'
import { People } from '@mui/icons-material'
import { colors, typography, borders } from '@/lib/designSystem'
import type { ParentPartenaireData } from './types'
import { formatCurrency } from './types'

interface ParentPartenairesInfoProps {
  partenaires: ParentPartenaireData[]
  loading: boolean
}

const ParentPartenairesInfo = ({ partenaires, loading }: ParentPartenairesInfoProps) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <CircularProgress size={20} />
      </Box>
    )
  }

  if (partenaires.length === 0) return null

  return (
    <Box sx={{
      p: 2, borderRadius: borders.radius.md,
      bgcolor: colors.neutral[25],
      border: `1px solid ${colors.neutral[200]}`,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <People sx={{ fontSize: 18, color: colors.primary[600] }} />
        <Typography sx={{
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
        }}>
          Partenaires de la convention parente
        </Typography>
        <Chip
          label={partenaires.length}
          size="small"
          sx={{
            height: 20, fontSize: typography.sizes.xs,
            bgcolor: colors.primary[100], color: colors.primary[700],
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {partenaires.map((p) => (
          <Chip
            key={p.id}
            label={`${p.partenaireSigle || p.partenaireCode} - ${formatCurrency(p.budgetAlloue)} (${p.pourcentage.toFixed(1)}%)`}
            size="small"
            variant="outlined"
            sx={{
              fontSize: typography.sizes.xs,
              borderColor: colors.neutral[300],
              color: colors.textPrimary,
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export default ParentPartenairesInfo
