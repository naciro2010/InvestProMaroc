import { Box, Typography } from '@mui/material'
import { StatusBadge } from '@/components/core'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface ProjetMetadata {
  statut: string
  createdAt?: string
  updatedAt?: string
}

interface ProjetEditInfoPanelProps {
  metadata: ProjetMetadata
  budgetTotal: number
  pourcentageAvancement: number
  isNew: boolean
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)
}

const ProjetEditInfoPanel = ({ metadata, budgetTotal, pourcentageAvancement, isNew }: ProjetEditInfoPanelProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Status Card */}
      <Box sx={{ ...componentStyles.card, p: 2 }}>
        <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
          Statut
        </Typography>
        <StatusBadge status={isNew ? 'EN_PREPARATION' : metadata.statut} />
      </Box>

      {/* Budget Summary */}
      {!isNew && (
        <Box sx={{ ...componentStyles.card, p: 2 }}>
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
            Resume financier
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Budget Total</Typography>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.primary[600] }}>
                {formatCurrency(budgetTotal)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Avancement</Typography>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.textPrimary }}>
                {pourcentageAvancement}%
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Metadata */}
      {!isNew && (metadata.createdAt || metadata.updatedAt) && (
        <Box sx={{ ...componentStyles.card, p: 2 }}>
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
            Metadonnees
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {metadata.createdAt && (
              <Box>
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Cree le</Typography>
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textPrimary }}>
                  {new Date(metadata.createdAt).toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
            )}
            {metadata.updatedAt && (
              <Box>
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Modifie le</Typography>
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textPrimary }}>
                  {new Date(metadata.updatedAt).toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ProjetEditInfoPanel
