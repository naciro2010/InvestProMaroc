import { memo, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Box, Typography, Divider, LinearProgress, Tooltip } from '@mui/material'
import {
  Wallet,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'
import type { ConventionWizardFormData, WizardTotals } from './types'
import { formatCurrency } from './types'

interface ConventionSmartSidebarProps {
  formData: ConventionWizardFormData
  totals: WizardTotals
  activeStep: number
  completionPercent: number
}

interface KpiItemProps {
  icon: ReactNode
  label: string
  value: string
  color?: string
  subValue?: string
  subColor?: string
}

const KpiItem = ({ icon, label, value, color, subValue, subColor }: KpiItemProps) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: borders.radius.md,
        bgcolor: `${color || colors.primary[600]}10`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color || colors.primary[600],
        flexShrink: 0,
        mt: 0.25,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: typography.sizes.xs,
          color: colors.textSecondary,
          fontWeight: typography.weights.medium,
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.bold,
          color: color || colors.textPrimary,
          lineHeight: 1.3,
          mt: 0.25,
        }}
      >
        {value}
      </Typography>
      {subValue && (
        <Typography
          sx={{
            fontSize: typography.sizes.xs,
            color: subColor || colors.textSecondary,
            mt: 0.25,
          }}
        >
          {subValue}
        </Typography>
      )}
    </Box>
  </Box>
)

const STEP_LABELS = ['Informations', 'Budget', 'Partenaires', 'Recapitulatif']

const ConventionSmartSidebar = memo(({
  formData,
  totals,
  activeStep,
  completionPercent,
}: ConventionSmartSidebarProps) => {
  const reliquat = useMemo(() => formData.budgetGlobal - totals.totalPartenaires, [formData.budgetGlobal, totals.totalPartenaires])
  const allocationPct = useMemo(
    () => formData.budgetGlobal > 0 ? (totals.totalPartenaires / formData.budgetGlobal) * 100 : 0,
    [formData.budgetGlobal, totals.totalPartenaires]
  )

  const daysRemaining = useMemo(() => formData.dateFin
    ? Math.ceil((new Date(formData.dateFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null, [formData.dateFin])

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        position: 'sticky',
        top: 80,
        alignSelf: 'flex-start',
        display: { xs: 'none', lg: 'block' },
      }}
    >
      {/* Completion Progress */}
      <Box
        sx={{
          bgcolor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: borders.radius.lg,
          p: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            sx={{
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.semibold,
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Progression
          </Typography>
          <Typography
            sx={{
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.bold,
              color: completionPercent >= 80 ? colors.success[600] : colors.primary[600],
            }}
          >
            {completionPercent}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={completionPercent}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: colors.neutral[100],
            mb: 1.5,
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              bgcolor: completionPercent >= 80 ? colors.success[500] : colors.primary[500],
            },
          }}
        />
        {/* Step indicators */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {STEP_LABELS.map((label, idx) => {
            const isDone = idx < activeStep
            const isCurrent = idx === activeStep
            return (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.25,
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={14} color={colors.success[500]} />
                ) : isCurrent ? (
                  <Clock size={14} color={colors.primary[500]} />
                ) : (
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      border: `1.5px solid ${colors.neutral[300]}`,
                    }}
                  />
                )}
                <Typography
                  sx={{
                    fontSize: typography.sizes.xs,
                    fontWeight: isCurrent ? typography.weights.semibold : typography.weights.normal,
                    color: isDone
                      ? colors.success[600]
                      : isCurrent
                        ? colors.primary[600]
                        : colors.textSecondary,
                  }}
                >
                  {label}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* Live KPIs */}
      <Box
        sx={{
          bgcolor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: borders.radius.lg,
          p: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: typography.sizes.xs,
            fontWeight: typography.weights.semibold,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: 1,
          }}
        >
          Resume en direct
        </Typography>

        <Divider sx={{ mb: 1 }} />

        {/* Convention Info */}
        {formData.code && (
          <KpiItem
            icon={<FileText size={16} />}
            label="Convention"
            value={formData.code}
            subValue={formData.type}
            color={colors.primary[600]}
          />
        )}

        {/* Budget */}
        <KpiItem
          icon={<Wallet size={16} />}
          label="Budget Global"
          value={formData.budgetGlobal > 0 ? formatCurrency(formData.budgetGlobal) : '-'}
          color={colors.primary[700]}
          subValue={
            formData.lignesBudget.length > 0
              ? `${formData.lignesBudget.length} ligne(s) budgetaire(s)`
              : undefined
          }
        />

        {/* Commission */}
        {totals.commissionTTC > 0 && (
          <KpiItem
            icon={<TrendingUp size={16} />}
            label="Commission estimee"
            value={formatCurrency(totals.commissionTTC)}
            color={colors.success[600]}
            subValue={`${formData.tauxCommission}% ${formData.commissionMode === 'PAR_CATEGORIE' ? '(par categorie)' : '(global)'}`}
            subColor={colors.success[500]}
          />
        )}

        {/* Partenaires */}
        {formData.partenaires.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <KpiItem
              icon={<Users size={16} />}
              label="Partenaires"
              value={`${formData.partenaires.length} partenaire(s)`}
              color={colors.info[600]}
              subValue={`${allocationPct.toFixed(0)}% alloue`}
            />
            {/* Budget allocation bar */}
            <Box sx={{ px: 0.5, mb: 1 }}>
              <Tooltip title={`Reliquat: ${formatCurrency(reliquat)}`}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(allocationPct, 100)}
                  color={reliquat >= 0 ? 'primary' : 'error'}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: colors.neutral[100],
                  }}
                />
              </Tooltip>
            </Box>
          </>
        )}

        {/* Duration */}
        {formData.dureeMois > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <KpiItem
              icon={<Calendar size={16} />}
              label="Duree"
              value={`${formData.dureeMois} mois`}
              color={colors.neutral[600]}
              subValue={
                daysRemaining !== null
                  ? daysRemaining > 0
                    ? `${daysRemaining} jours restants`
                    : 'Expire'
                  : undefined
              }
              subColor={
                daysRemaining !== null && daysRemaining <= 0
                  ? colors.danger[500]
                  : undefined
              }
            />
          </>
        )}

        {/* Warnings */}
        {totals.differenceGlobalVsLignes < 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                bgcolor: colors.danger[25],
                borderRadius: borders.radius.md,
                border: `1px solid ${colors.danger[200]}`,
              }}
            >
              <AlertCircle size={16} color={colors.danger[500]} />
              <Typography
                sx={{
                  fontSize: typography.sizes.xs,
                  color: colors.danger[600],
                  fontWeight: typography.weights.medium,
                }}
              >
                Lignes depassent le budget de {formatCurrency(Math.abs(totals.differenceGlobalVsLignes))}
              </Typography>
            </Box>
          </>
        )}

        {reliquat < 0 && formData.partenaires.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              mt: 1,
              bgcolor: colors.warning[25],
              borderRadius: borders.radius.md,
              border: `1px solid ${colors.warning[200]}`,
            }}
          >
            <AlertCircle size={16} color={colors.warning[500]} />
            <Typography
              sx={{
                fontSize: typography.sizes.xs,
                color: colors.warning[600],
                fontWeight: typography.weights.medium,
              }}
            >
              Surallocation de {formatCurrency(Math.abs(reliquat))}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
})

ConventionSmartSidebar.displayName = 'ConventionSmartSidebar'

export default ConventionSmartSidebar
