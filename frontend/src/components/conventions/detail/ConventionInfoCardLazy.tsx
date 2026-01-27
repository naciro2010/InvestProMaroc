import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Skeleton,
  Alert,
} from '@mui/material'
import { Lock, LockOpen } from '@mui/icons-material'
import { useConventionBasic } from '@/hooks/useConventionData'
import RichTextDisplay from '@/components/ui/RichTextDisplay'

interface ConventionInfoCardLazyProps {
  conventionId: number
  canEdit: boolean
  getStatusColor: (statut: string) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

/**
 * Micro-component with independent data loading (micro-services pattern)
 * Loads basic convention info (~5-10 KB) independently from other components
 */
const ConventionInfoCardLazy = ({ conventionId, canEdit, getStatusColor }: ConventionInfoCardLazyProps) => {
  // Independent data loading via micro-endpoint
  const { data: convention, loading, error } = useConventionBasic(conventionId)

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Divider sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </Paper>
    )
  }

  if (error || !convention) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">
          Erreur lors du chargement des informations de la convention
        </Alert>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
        Informations Générales
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* Type & Statut - More Prominent */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Type de convention
            </Typography>
            <Chip
              label={convention.typeConvention}
              color={convention.typeConvention === 'CADRE' ? 'secondary' : 'info'}
              sx={{ fontWeight: 600, fontSize: '0.875rem', px: 1 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Statut
            </Typography>
            <Chip
              label={convention.statut}
              color={getStatusColor(convention.statut)}
              icon={canEdit ? <LockOpen /> : <Lock />}
              sx={{ fontWeight: 600, fontSize: '0.875rem', px: 1 }}
            />
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Code de la convention
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {convention.code}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Numéro
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {convention.numero}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Libellé de la convention
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {convention.libelle}
          </Typography>
        </Box>

        {convention.objet && (
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Objet de la convention
            </Typography>
            <RichTextDisplay html={convention.objet || ''} />
          </Box>
        )}

        {convention.createdBy && (
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Créée par
            </Typography>
            <Typography variant="body2">
              {convention.createdBy}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default ConventionInfoCardLazy
