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
  LinearProgress,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material'
import { WarningAmber, CheckCircle, ErrorOutline, AccountBalance } from '@mui/icons-material'
import { conventionsAPI, marchesAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { MarcheData, SituationPaiement } from './types'

interface BudgetLine {
  label: string
  type: 'marche' | 'total'
  marcheId?: number
  prevu: number
  engage: number
  resteAEngager: number
  decompte: number
  resteAPayer: number
}

interface ConventionBudgetDetailCardProps {
  conventionId: number
  conventionBudget: number
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount)

const formatPct = (val: number): string => `${val.toFixed(1)}%`

/**
 * MICRO-COMPONENT: ConventionBudgetDetailCard
 * Shows detailed budget execution: Prevu / Engage / Reste a engager / Decompte / Reste a payer
 * With alerts when actual exceeds planned
 */
const ConventionBudgetDetailCard = ({
  conventionId,
  conventionBudget,
}: ConventionBudgetDetailCardProps) => {
  const [lines, setLines] = useState<BudgetLine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBudgetData()
  }, [conventionId])

  const loadBudgetData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load marches linked to this convention
      const marchesRes = await marchesAPI.getByConvention(conventionId)
      const marches: MarcheData[] = marchesRes.data.data || marchesRes.data || []

      // Load payment situation for each marche
      const situationPromises = marches.map(async (m) => {
        try {
          const res = await marchesAPI.getSituationPaiement(m.id)
          return { marcheId: m.id, situation: (res.data.data || res.data) as SituationPaiement }
        } catch {
          return { marcheId: m.id, situation: null }
        }
      })

      const situations = await Promise.all(situationPromises)
      const situationMap = new Map<number, SituationPaiement>()
      situations.forEach(s => { if (s.situation) situationMap.set(s.marcheId, s.situation) })

      // Build budget lines per marche
      const budgetLines: BudgetLine[] = marches.map(m => {
        const sit = situationMap.get(m.id)
        const engage = m.montantTtc || 0
        const decompte = sit?.totalNetAPayer || 0
        return {
          label: m.objet || m.numeroMarche,
          type: 'marche',
          marcheId: m.id,
          prevu: engage, // marche amount = what was engaged
          engage,
          resteAEngager: 0, // fully engaged by definition
          decompte,
          resteAPayer: engage - decompte,
        }
      })

      setLines(budgetLines)
    } catch {
      setError('Erreur lors du chargement des donnees budgetaires')
    } finally {
      setLoading(false)
    }
  }

  // Totals
  const totalEngage = lines.reduce((s, l) => s + l.engage, 0)
  const totalDecompte = lines.reduce((s, l) => s + l.decompte, 0)
  const resteAEngager = conventionBudget - totalEngage
  const resteAPayer = totalEngage - totalDecompte
  const tauxEngagement = conventionBudget > 0 ? (totalEngage / conventionBudget) * 100 : 0
  const tauxDecaissement = totalEngage > 0 ? (totalDecompte / totalEngage) * 100 : 0

  // Alerts
  const alerts: { severity: 'error' | 'warning' | 'info'; message: string }[] = []
  if (totalEngage > conventionBudget) {
    alerts.push({ severity: 'error', message: `Depassement budget: ${formatCurrency(totalEngage - conventionBudget)} au-dessus du prevu` })
  }
  if (resteAEngager > 0 && resteAEngager < conventionBudget * 0.1) {
    alerts.push({ severity: 'warning', message: `Budget presque epuise: reste ${formatPct((resteAEngager / conventionBudget) * 100)} a engager` })
  }

  if (loading) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${colors.border}`, bgcolor: colors.neutral[25] }}>
          <Skeleton variant="text" width="50%" height={24} />
        </Box>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
        </Box>
      </Paper>
    )
  }

  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1.5, borderBottom: `1px solid ${colors.border}`, bgcolor: colors.neutral[25],
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance sx={{ color: colors.primary[600], fontSize: 18 }} />
          <Typography sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary, fontSize: typography.sizes.sm }}>
            Suivi budgetaire
          </Typography>
          {lines.length > 0 && (
            <Chip label={`${lines.length} marche${lines.length > 1 ? 's' : ''}`} size="small"
              sx={{ height: 20, fontSize: '10px', bgcolor: colors.neutral[100], color: colors.textSecondary }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Engagement: <strong style={{ color: tauxEngagement > 100 ? colors.danger[600] : colors.primary[600] }}>{formatPct(tauxEngagement)}</strong>
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Decaissement: <strong style={{ color: colors.success[600] }}>{formatPct(tauxDecaissement)}</strong>
          </Typography>
        </Box>
      </Box>

      {/* Progress bars */}
      <Box sx={{ px: 2.5, py: 1, borderBottom: `1px solid ${colors.border}` }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 0.5 }}>
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary, minWidth: 65 }}>Engagement</Typography>
          <LinearProgress variant="determinate" value={Math.min(tauxEngagement, 100)}
            sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: colors.neutral[100],
              '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: tauxEngagement > 100 ? colors.danger[500] : colors.primary[500] },
            }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary, minWidth: 65 }}>Decaissement</Typography>
          <LinearProgress variant="determinate" value={Math.min(tauxDecaissement, 100)}
            sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: colors.neutral[100],
              '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: colors.success[500] },
            }} />
        </Box>
      </Box>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Box sx={{ px: 2.5, py: 1, borderBottom: `1px solid ${colors.border}` }}>
          {alerts.map((a, i) => (
            <Alert key={i} severity={a.severity} sx={{ py: 0, px: 1, mb: i < alerts.length - 1 ? 0.5 : 0, fontSize: typography.sizes.xs }}
              icon={a.severity === 'error' ? <ErrorOutline sx={{ fontSize: 16 }} /> : <WarningAmber sx={{ fontSize: 16 }} />}>
              {a.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Budget Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: colors.neutral[50] }}>
              <TableCell sx={thStyle}>Ligne</TableCell>
              <TableCell align="right" sx={thStyle}>Budget prevu</TableCell>
              <TableCell align="right" sx={thStyle}>Engage</TableCell>
              <TableCell align="right" sx={thStyle}>Reste a engager</TableCell>
              <TableCell align="right" sx={thStyle}>Decompte</TableCell>
              <TableCell align="right" sx={thStyle}>Reste a payer</TableCell>
              <TableCell align="center" sx={thStyle}>Etat</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                    Aucun marche lie a cette convention
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {lines.map((line, idx) => (
              <TableRow key={idx} sx={{ '&:hover': { bgcolor: colors.neutral[25] } }}>
                <TableCell sx={{ ...tdStyle, maxWidth: 200 }}>
                  <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {line.label}
                  </Typography>
                </TableCell>
                <CurrencyCell value={line.engage} />
                <CurrencyCell value={line.engage} color={colors.primary[700]} />
                <CurrencyCell value={0} />
                <CurrencyCell value={line.decompte} color={colors.success[700]} />
                <CurrencyCell value={line.resteAPayer} color={line.resteAPayer > 0 ? colors.warning[700] : colors.success[700]} />
                <TableCell align="center" sx={tdStyle}>
                  <StatusIcon decompte={line.decompte} engage={line.engage} />
                </TableCell>
              </TableRow>
            ))}

            {/* Total Row */}
            <TableRow sx={{ bgcolor: colors.neutral[100], '& td': { borderBottom: 0 } }}>
              <TableCell sx={{ ...tdStyle, fontWeight: typography.weights.bold }}>
                Total convention
              </TableCell>
              <TableCell align="right" sx={{ ...tdStyle, fontWeight: typography.weights.bold }}>
                {formatCurrency(conventionBudget)}
              </TableCell>
              <TableCell align="right" sx={{
                ...tdStyle, fontWeight: typography.weights.bold,
                color: totalEngage > conventionBudget ? colors.danger[700] : colors.primary[700],
              }}>
                {formatCurrency(totalEngage)}
              </TableCell>
              <TableCell align="right" sx={{
                ...tdStyle, fontWeight: typography.weights.bold,
                color: resteAEngager < 0 ? colors.danger[700] : colors.textPrimary,
              }}>
                {formatCurrency(resteAEngager)}
              </TableCell>
              <TableCell align="right" sx={{ ...tdStyle, fontWeight: typography.weights.bold, color: colors.success[700] }}>
                {formatCurrency(totalDecompte)}
              </TableCell>
              <TableCell align="right" sx={{
                ...tdStyle, fontWeight: typography.weights.bold,
                color: resteAPayer > 0 ? colors.warning[700] : colors.success[700],
              }}>
                {formatCurrency(resteAPayer)}
              </TableCell>
              <TableCell align="center" sx={tdStyle}>
                <StatusIcon decompte={totalDecompte} engage={totalEngage} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {error && (
        <Box sx={{ px: 2.5, py: 1.5 }}>
          <Alert severity="error" sx={{ fontSize: typography.sizes.xs }}>{error}</Alert>
        </Box>
      )}
    </Paper>
  )
}

/** Currency cell with conditional coloring */
const CurrencyCell = ({ value, color }: { value: number; color?: string }) => (
  <TableCell align="right" sx={tdStyle}>
    <Typography sx={{
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.medium,
      color: color || colors.textPrimary,
      fontVariantNumeric: 'tabular-nums',
    }}>
      {formatCurrency(value)}
    </Typography>
  </TableCell>
)

/** Status icon based on execution progress */
const StatusIcon = ({ decompte, engage }: { decompte: number; engage: number }) => {
  if (engage === 0) return <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>-</Typography>
  const pct = (decompte / engage) * 100
  if (pct >= 100) return <CheckCircle sx={{ fontSize: 16, color: colors.success[500] }} />
  if (pct >= 50) return <WarningAmber sx={{ fontSize: 16, color: colors.warning[500] }} />
  if (pct > 0) return <ErrorOutline sx={{ fontSize: 16, color: colors.info[500] }} />
  return <ErrorOutline sx={{ fontSize: 16, color: colors.neutral[300] }} />
}

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

export default ConventionBudgetDetailCard
