import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Skeleton,
  Alert,
  Divider,
} from '@mui/material'
import {
  Description,
  Lock,
  LockOpen,
  Person,
} from '@mui/icons-material'
import { useConventionBasic } from '@/hooks/useConventionData'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import StatusBadge from '@/components/core/StatusBadge'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface ConventionInfoCardLazyProps {
  conventionId: number
  canEdit: boolean
  getStatusColor: (statut: string) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

const ConventionInfoCardLazy = ({ conventionId, canEdit }: ConventionInfoCardLazyProps) => {
  const { data: convention, loading, error } = useConventionBasic(conventionId)

  if (loading) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 3 }}>
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />
        <Divider sx={{ mb: 2, borderColor: colors.border }} />
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Skeleton variant="rectangular" height={24} width="80%" />
          <Skeleton variant="rectangular" height={24} width="60%" />
          <Skeleton variant="rectangular" height={80} />
        </Box>
      </Paper>
    )
  }

  if (error || !convention) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 3 }}>
        <Alert severity="error">Erreur lors du chargement des informations</Alert>
      </Paper>
    )
  }

  const InfoRow = ({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1 }}>
      {icon && (
        <Box sx={{ color: colors.neutral[400], mt: 0.25, flexShrink: 0 }}>
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: typography.sizes.xs,
          color: colors.textSecondary,
          fontWeight: typography.weights.medium,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 0.25,
        }}>
          {label}
        </Typography>
        {typeof value === 'string' ? (
          <Typography sx={{
            fontSize: typography.sizes.sm,
            color: colors.textPrimary,
            fontWeight: typography.weights.medium,
          }}>
            {value || '-'}
          </Typography>
        ) : value}
      </Box>
    </Box>
  )

  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 3,
        py: 2,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <Box sx={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          bgcolor: colors.primary[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Description sx={{ color: colors.primary[600], fontSize: 20 }} />
        </Box>
        <Typography sx={{
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
          fontSize: typography.sizes.md,
          flex: 1,
        }}>
          Informations generales
        </Typography>
        {canEdit ? (
          <LockOpen sx={{ fontSize: 18, color: colors.success[600] }} />
        ) : (
          <Lock sx={{ fontSize: 18, color: colors.neutral[400] }} />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ px: 3, py: 2 }}>
        {/* Type & Status badges */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: '6px',
            bgcolor: convention.typeConvention === 'CADRE' ? colors.primary[50] : colors.purple[50],
            border: `1px solid ${convention.typeConvention === 'CADRE' ? colors.primary[200] : colors.purple[200]}`,
          }}>
            <Typography sx={{
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.semibold,
              color: convention.typeConvention === 'CADRE' ? colors.primary[700] : colors.purple[700],
            }}>
              {convention.typeConvention}
            </Typography>
          </Box>
          <StatusBadge status={convention.statut} />
        </Box>

        <Divider sx={{ borderColor: colors.borderSubtle, mb: 1.5 }} />

        <InfoRow label="Code" value={convention.code} />
        <InfoRow label="Numero" value={convention.numero} />
        <InfoRow label="Libelle" value={convention.libelle} />

        {convention.objet && (
          <Box sx={{ mt: 1.5 }}>
            <Typography sx={{
              fontSize: typography.sizes.xs,
              color: colors.textSecondary,
              fontWeight: typography.weights.medium,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 0.5,
            }}>
              Objet
            </Typography>
            <Box sx={{
              p: 1.5,
              bgcolor: colors.neutral[25],
              borderRadius: '6px',
              border: `1px solid ${colors.borderSubtle}`,
            }}>
              <RichTextDisplay html={convention.objet || ''} />
            </Box>
          </Box>
        )}

        {convention.createdBy && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${colors.borderSubtle}` }}>
            <InfoRow
              label="Creee par"
              value={convention.createdBy}
              icon={<Person sx={{ fontSize: 16 }} />}
            />
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default ConventionInfoCardLazy
