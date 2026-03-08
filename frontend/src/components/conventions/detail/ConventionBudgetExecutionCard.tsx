import { useState, useEffect } from 'react'
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  LinearProgress,
  Skeleton,
} from '@mui/material'
import { TrendingUp } from '@mui/icons-material'
import { conventionsAPI } from '@/lib/api'
import { colors, typography, componentStyles, borders } from '@/lib/designSystem'

interface BudgetLineData {
  id: number
  partenaireId: number
  partenaireCode: string
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
  commissionIntervention: number | null
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
  remarques: string | null
}

interface ConventionBudgetExecutionCardProps {
  conventionId: number
  conventionBudget: number
  tauxCommission: number
  tauxTva: number
  baseCalcul: string
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

const formatPct = (val: number): string => `${val.toFixed(1)}%`

/**
 * MICRO-COMPONENT: ConventionBudgetExecutionCard
 * Shows full financial overview: budget, commission, partenaires allocation, execution tracking
 * Compact financial tables with ERP-style layout
 */
const ConventionBudgetExecutionCard = ({
  conventionId,
  conventionBudget,
  tauxCommission,
  tauxTva,
  baseCalcul,
}: ConventionBudgetExecutionCardProps) => {
  const [partenaires, setPartenaires] = useState<BudgetLineData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await conventionsAPI.getPartenaires(conventionId)
        const data = res.data.data || res.data || []
        setPartenaires(Array.isArray(data) ? data : [])
      } catch {
        setPartenaires([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [conventionId])

  const totalAlloue = partenaires.reduce((sum, p) => sum + p.budgetAlloue, 0)
  const restant = conventionBudget - totalAlloue
  const allocationPct = conventionBudget > 0 ? (totalAlloue / conventionBudget) * 100 : 0

  // Commission calculations
  const commissionHT = (conventionBudget * tauxCommission) / 100
  const commissionTTC = commissionHT * (1 + tauxTva / 100)

  const baseLabel = baseCalcul === 'DECAISSEMENTS_HT' ? 'HT' : 'TTC'

  if (loading) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${colors.border}` }}>
          <Skeleton variant="text" width="50%" height={24} />
        </Box>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
        </Box>
      </Paper>
    )
  }

  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1.5, borderBottom: `1px solid ${colors.border}`,
        bgcolor: colors.neutral[25],
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp sx={{ color: colors.primary[600], fontSize: 18 }} />
          <Typography sx={{
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
            fontSize: typography.sizes.sm,
          }}>
            Synthese financiere
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Taux: <strong>{tauxCommission}%</strong>
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            TVA: <strong>{tauxTva}%</strong>
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Base: <strong>{baseLabel}</strong>
          </Typography>
        </Box>
      </Box>

      {/* KPI Row - compact layout */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <KpiCell label="Budget global" value={formatCurrency(conventionBudget)} color={colors.textPrimary} />
        <KpiCell label="Commission HT" value={formatCurrency(commissionHT)} color={colors.info[600]} />
        <KpiCell label="Commission TTC" value={formatCurrency(commissionTTC)} color={colors.primary[600]} />
        <KpiCell
          label="Allocation"
          value={formatPct(allocationPct)}
          color={restant < 0 ? colors.danger[600] : colors.success[600]}
          subtitle={`Reste: ${formatCurrency(restant)}`}
        />
      </Box>

      {/* Budget allocation progress */}
      <Box sx={{ px: 2.5, py: 1, borderBottom: `1px solid ${colors.border}` }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(allocationPct, 100)}
          sx={{
            height: 4, borderRadius: 2,
            bgcolor: colors.neutral[100],
            '& .MuiLinearProgress-bar': {
              borderRadius: 2,
              bgcolor: restant < 0 ? colors.danger[500] : colors.primary[500],
            },
          }}
        />
      </Box>

      {/* Partenaires allocation table */}
      {partenaires.length > 0 && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell sx={thStyle}>Partenaire</TableCell>
                <TableCell align="right" sx={thStyle}>Budget alloue</TableCell>
                <TableCell align="right" sx={thStyle}>%</TableCell>
                <TableCell sx={thStyle}>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {partenaires.map((p) => (
                <TableRow key={p.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={tdStyle}>
                    <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, color: colors.textPrimary }}>
                      {p.partenaireSigle || p.partenaireCode}
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: colors.textSecondary, lineHeight: 1.2 }}>
                      {p.partenaireNom}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={tdStyle}>
                    <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, color: colors.primary[700], fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(p.budgetAlloue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={tdStyle}>
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontVariantNumeric: 'tabular-nums' }}>
                      {p.pourcentage.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell sx={tdStyle}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {p.estMaitreOeuvre && <RoleBadge label="MO" color={colors.info[600]} bg={colors.info[50]} />}
                      {p.estMaitreOeuvreDelegue && <RoleBadge label="MOD" color={colors.purple[600]} bg={colors.purple[50]} />}
                      {!p.estMaitreOeuvre && !p.estMaitreOeuvreDelegue && (
                        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>-</Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {/* Total */}
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell sx={{ ...tdStyle, fontWeight: typography.weights.semibold }}>
                  Total ({partenaires.length})
                </TableCell>
                <TableCell align="right" sx={{ ...tdStyle, fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                  {formatCurrency(totalAlloue)}
                </TableCell>
                <TableCell align="right" sx={{ ...tdStyle, fontWeight: typography.weights.medium }}>
                  {formatPct(allocationPct)}
                </TableCell>
                <TableCell sx={tdStyle} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {partenaires.length === 0 && (
        <Box sx={{ px: 2.5, py: 2, textAlign: 'center' }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Aucun partenaire alloue
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

// Compact KPI cell
const KpiCell = ({ label, value, color, subtitle }: {
  label: string; value: string; color: string; subtitle?: string
}) => (
  <Box sx={{
    px: 2, py: 1.5,
    borderRight: `1px solid ${colors.border}`,
    '&:last-child': { borderRight: 0 },
  }}>
    <Typography sx={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.25 }}>
      {label}
    </Typography>
    <Typography sx={{
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color,
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1.2,
    }}>
      {value}
    </Typography>
    {subtitle && (
      <Typography sx={{ fontSize: '10px', color: colors.textSecondary, mt: 0.25 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
)

// Inline role badge
const RoleBadge = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <Box sx={{
    px: 0.75, py: 0.125,
    borderRadius: '3px',
    bgcolor: bg,
    border: `1px solid ${color}30`,
  }}>
    <Typography sx={{ fontSize: '10px', fontWeight: typography.weights.semibold, color, lineHeight: 1.4 }}>
      {label}
    </Typography>
  </Box>
)

// Table styles
const thStyle = {
  fontSize: typography.sizes.xs,
  fontWeight: typography.weights.semibold,
  color: colors.textSecondary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.03em',
  py: 1,
  px: 1.5,
  borderBottom: `1px solid ${colors.border}`,
}

const tdStyle = {
  fontSize: typography.sizes.xs,
  py: 0.75,
  px: 1.5,
  borderBottom: `1px solid ${colors.borderSubtle}`,
}

export default ConventionBudgetExecutionCard
