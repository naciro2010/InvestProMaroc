import { Box, Typography, Divider } from '@mui/material'
import { Calendar, Clock, User, FileText, Lock } from 'lucide-react'
import { StatusBadge } from '@/components/core'
import { colors, typography, borders } from '@/lib/designSystem'
import { formatDateFR, formatCurrencyMAD, type ConventionMetadata } from './editTypes'

interface EditInfoPanelProps {
  metadata: ConventionMetadata
  budget: number
  tauxCommission: number
  tauxTva: number
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1 }}>
    <Box sx={{ color: colors.textSecondary, mt: 0.25, flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: typography.sizes.xs,
          color: colors.textSecondary,
          fontWeight: typography.weights.medium,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: typography.sizes.sm,
          color: colors.textPrimary,
          fontWeight: typography.weights.medium,
          mt: 0.25,
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
)

const EditInfoPanel = ({ metadata, budget, tauxCommission, tauxTva }: EditInfoPanelProps) => {
  const commissionHT = (budget * tauxCommission) / 100
  const commissionTTC = commissionHT * (1 + tauxTva / 100)

  return (
    <Box
      sx={{
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: borders.radius.lg,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: colors.neutral[50],
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Typography
          sx={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Informations
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Status */}
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontSize: typography.sizes.xs,
              color: colors.textSecondary,
              fontWeight: typography.weights.medium,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              mb: 0.5,
            }}
          >
            Statut
          </Typography>
          <StatusBadge status={metadata.statut} />
        </Box>

        <Divider sx={{ borderColor: colors.divider }} />

        {/* Metadata rows */}
        <InfoRow
          icon={<Calendar size={14} />}
          label="Date de creation"
          value={formatDateFR(metadata.createdAt)}
        />
        <InfoRow
          icon={<Clock size={14} />}
          label="Derniere modification"
          value={formatDateFR(metadata.updatedAt)}
        />
        {metadata.createdBy && (
          <InfoRow
            icon={<User size={14} />}
            label="Cree par"
            value={metadata.createdBy}
          />
        )}
        {metadata.dateSoumission && (
          <InfoRow
            icon={<FileText size={14} />}
            label="Date de soumission"
            value={formatDateFR(metadata.dateSoumission)}
          />
        )}
        {metadata.dateValidation && (
          <InfoRow
            icon={<FileText size={14} />}
            label="Date de validation"
            value={formatDateFR(metadata.dateValidation)}
          />
        )}
        {metadata.isLocked && (
          <InfoRow
            icon={<Lock size={14} />}
            label="Verrouillage"
            value={
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.warning[600] }}>
                Convention verrouillee
              </Typography>
            }
          />
        )}

        <Divider sx={{ my: 1, borderColor: colors.divider }} />

        {/* Financial summary */}
        <Box sx={{ py: 1 }}>
          <Typography
            sx={{
              fontSize: typography.sizes.xs,
              color: colors.textSecondary,
              fontWeight: typography.weights.semibold,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              mb: 1,
            }}
          >
            Resume Financier
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                Budget
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
                {formatCurrencyMAD(budget)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                Taux
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textPrimary }}>
                {tauxCommission}%
              </Typography>
            </Box>
            <Divider sx={{ borderColor: colors.divider, my: 0.25 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                Commission HT
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.info[600] }}>
                {formatCurrencyMAD(commissionHT)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textSecondary }}>
                Commission TTC
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.success[600] }}>
                {formatCurrencyMAD(commissionTTC)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Sous-conventions count */}
        {metadata.sousConventionsCount > 0 && (
          <>
            <Divider sx={{ my: 1, borderColor: colors.divider }} />
            <Box sx={{ py: 0.5 }}>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.medium }}>
                Sous-conventions
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.purple[600], mt: 0.25 }}>
                {metadata.sousConventionsCount} sous-convention(s)
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}

export default EditInfoPanel
