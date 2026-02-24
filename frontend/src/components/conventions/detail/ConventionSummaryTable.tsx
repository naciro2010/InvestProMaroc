import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Skeleton,
} from '@mui/material'
import { marchesAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface MarcheData {
  id: number
  numeroMarche: string
  objet: string
  montantTtc: number
  statut: string
  fournisseurNom?: string
}

interface SituationPaiement {
  totalDecomptes: number
  totalNetAPayer: number
  totalMontantPaye: number
  resteAPayer: number
  tauxPaiement: number
}

interface SummaryLine {
  label: string
  marcheId?: number
  budget: number
  engage: number
  resteAEngager: number
  depenses: number
  resteAPayer: number
}

interface ConventionSummaryTableProps {
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
    maximumFractionDigits: 0,
  }).format(amount)

const formatPct = (val: number): string => `${val.toFixed(1)}%`

/**
 * ConventionSummaryTable: Financial summary at the top of the detail page.
 * Shows Budget / Engagement / Reste a engager / Depenses / Reste a payer
 * per marche + totals + commission line.
 */
const ConventionSummaryTable = ({
  conventionId,
  conventionBudget,
  tauxCommission,
  tauxTva,
  baseCalcul,
}: ConventionSummaryTableProps) => {
  const [lines, setLines] = useState<SummaryLine[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      const marchesRes = await marchesAPI.getByConvention(conventionId)
      const marches: MarcheData[] = marchesRes.data.data || marchesRes.data || []

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
      situations.forEach(s => {
        if (s.situation) situationMap.set(s.marcheId, s.situation)
      })

      const summaryLines: SummaryLine[] = marches.map(m => {
        const sit = situationMap.get(m.id)
        const engage = m.montantTtc || 0
        const depenses = sit?.totalNetAPayer || 0
        return {
          label: m.objet || m.numeroMarche,
          marcheId: m.id,
          budget: engage,
          engage,
          resteAEngager: 0,
          depenses,
          resteAPayer: engage - depenses,
        }
      })

      setLines(summaryLines)
    } catch {
      setLines([])
    } finally {
      setLoading(false)
    }
  }, [conventionId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totalEngage = lines.reduce((s: number, l: SummaryLine) => s + l.engage, 0)
  const totalDepenses = lines.reduce((s: number, l: SummaryLine) => s + l.depenses, 0)
  const resteAEngager = conventionBudget - totalEngage
  const resteAPayer = totalEngage - totalDepenses
  const tauxEngagement = conventionBudget > 0 ? (totalEngage / conventionBudget) * 100 : 0
  const tauxDecaissement = totalEngage > 0 ? (totalDepenses / totalEngage) * 100 : 0

  const commissionHT = (conventionBudget * tauxCommission) / 100
  const commissionTTC = commissionHT * (1 + tauxTva / 100)
  const baseLabel = baseCalcul === 'DECAISSEMENTS_HT' ? 'HT' : 'TTC'

  if (loading) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${colors.border}`, bgcolor: colors.neutral[25] }}>
          <Skeleton variant="text" width="40%" height={24} />
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
        </Box>
      </Paper>
    )
  }

  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
      {/* Header with KPIs */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1.5, borderBottom: `1px solid ${colors.border}`, bgcolor: colors.neutral[25],
      }}>
        <Typography sx={{
          fontWeight: typography.weights.bold,
          color: colors.textPrimary,
          fontSize: typography.sizes.sm,
        }}>
          Synthese financiere
        </Typography>
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
          <KpiTag label="Commission" value={`${tauxCommission}% ${baseLabel}`} />
          <KpiTag label="TVA" value={`${tauxTva}%`} />
          <KpiTag
            label="Engagement"
            value={formatPct(tauxEngagement)}
            color={tauxEngagement > 100 ? colors.danger[600] : colors.primary[600]}
          />
          <KpiTag
            label="Decaissement"
            value={formatPct(tauxDecaissement)}
            color={colors.success[600]}
          />
        </Box>
      </Box>

      {/* Progress bars */}
      <Box sx={{ px: 2.5, py: 1, borderBottom: `1px solid ${colors.border}` }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 0.5 }}>
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary, minWidth: 72 }}>Engagement</Typography>
          <LinearProgress variant="determinate" value={Math.min(tauxEngagement, 100)}
            sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: colors.neutral[100],
              '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: tauxEngagement > 100 ? colors.danger[500] : colors.primary[500] },
            }} />
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary, minWidth: 40, textAlign: 'right' }}>
            {formatPct(tauxEngagement)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary, minWidth: 72 }}>Decaissement</Typography>
          <LinearProgress variant="determinate" value={Math.min(tauxDecaissement, 100)}
            sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: colors.neutral[100],
              '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: colors.success[500] },
            }} />
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary, minWidth: 40, textAlign: 'right' }}>
            {formatPct(tauxDecaissement)}
          </Typography>
        </Box>
      </Box>

      {/* Summary Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: colors.neutral[50] }}>
              <TableCell sx={thStyle}>Rubrique</TableCell>
              <TableCell align="right" sx={thStyle}>Budget</TableCell>
              <TableCell align="right" sx={thStyle}>Engagement</TableCell>
              <TableCell align="right" sx={thStyle}>Reste a engager</TableCell>
              <TableCell align="right" sx={thStyle}>Depenses realisees</TableCell>
              <TableCell align="right" sx={thStyle}>Reste a payer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 2.5 }}>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                    Aucun marche lie a cette convention
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {lines.map((line: SummaryLine, idx: number) => (
              <TableRow key={idx} sx={{ '&:hover': { bgcolor: colors.neutral[25] } }}>
                <TableCell sx={{ ...tdStyle, maxWidth: 220 }}>
                  <Typography sx={{
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.medium,
                    color: colors.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {line.label}
                  </Typography>
                </TableCell>
                <CurrencyCell value={line.budget} />
                <CurrencyCell value={line.engage} color={colors.primary[700]} />
                <CurrencyCell value={line.resteAEngager} />
                <CurrencyCell value={line.depenses} color={colors.success[700]} />
                <CurrencyCell
                  value={line.resteAPayer}
                  color={line.resteAPayer > 0 ? colors.warning[700] : colors.success[700]}
                />
              </TableRow>
            ))}

            {/* Commission row */}
            <TableRow sx={{ bgcolor: colors.warning[25], '& td': { borderBottom: `1px solid ${colors.border}` } }}>
              <TableCell sx={{ ...tdStyle, fontWeight: typography.weights.semibold, color: colors.warning[800] }}>
                Commission ({tauxCommission}% {baseLabel})
              </TableCell>
              <TableCell align="right" sx={tdStyle}>
                <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, color: colors.warning[700], fontVariantNumeric: 'tabular-nums' }}>
                  HT: {formatCurrency(commissionHT)}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={tdStyle}>
                <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.warning[800], fontVariantNumeric: 'tabular-nums' }}>
                  TTC: {formatCurrency(commissionTTC)}
                </Typography>
              </TableCell>
              <TableCell colSpan={3} sx={tdStyle} />
            </TableRow>

            {/* Total Row */}
            <TableRow sx={{ bgcolor: colors.primary[50], '& td': { borderBottom: 0 } }}>
              <TableCell sx={{ ...tdStyle, fontWeight: typography.weights.bold, color: colors.primary[800] }}>
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
                {formatCurrency(totalDepenses)}
              </TableCell>
              <TableCell align="right" sx={{
                ...tdStyle, fontWeight: typography.weights.bold,
                color: resteAPayer > 0 ? colors.warning[700] : colors.success[700],
              }}>
                {formatCurrency(resteAPayer)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

/** Compact KPI tag in the header */
const KpiTag = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>{label}:</Typography>
    <Typography sx={{
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.bold,
      color: color || colors.textPrimary,
    }}>
      {value}
    </Typography>
  </Box>
)

/** Currency cell */
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

export default ConventionSummaryTable
