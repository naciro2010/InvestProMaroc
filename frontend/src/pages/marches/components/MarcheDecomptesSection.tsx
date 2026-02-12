import { useState, useEffect, useMemo, useCallback, Fragment } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material'
import { Add, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { marchesAPI } from '@/lib/api'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'
import StatusBadge from '@/components/core/StatusBadge'
import DecomptePaiementsSubRow from './DecomptePaiementsSubRow'

interface MarcheDecomptesSectionProps {
  marcheId: number
}

/** Matches backend DecompteSimpleDTO */
interface Decompte {
  id: number
  numeroDecompte: string
  dateDecompte: string
  statut: string
  netAPayer: number
  montantPaye: number
  estSolde: boolean
  actif: boolean
}

/** Matches backend MarchePaiementDTO */
interface MarchePaiement {
  id: number
  referencePaiement: string
  dateValeur: string
  dateExecution: string | null
  montantPaye: number
  modePaiement: string
  estPaiementPartiel: boolean
  decompteId: number
  numeroDecompte: string
  ordrePaiementId: number
  numeroOP: string
  observations: string | null
}

type PaymentFilter = 'TOUS' | 'NON_PAYE' | 'PAYE_PARTIEL' | 'PAYE_TOTAL'

type PaymentStatusKey = 'NON_PAYE' | 'PAYE_PARTIEL' | 'PAYE_TOTAL'

function getPaymentStatus(decompte: Decompte): PaymentStatusKey {
  if (decompte.estSolde || (decompte.montantPaye > 0 && decompte.montantPaye >= decompte.netAPayer)) {
    return 'PAYE_TOTAL'
  }
  if (decompte.montantPaye > 0) {
    return 'PAYE_PARTIEL'
  }
  return 'NON_PAYE'
}

const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '0,00'
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date: string): string => new Date(date).toLocaleDateString('fr-FR')

const TOTAL_COLUMNS = 7

interface FilterChipDef {
  key: PaymentFilter
  label: string
}

const filterChips: FilterChipDef[] = [
  { key: 'TOUS', label: 'Tous' },
  { key: 'NON_PAYE', label: 'Non Paye' },
  { key: 'PAYE_PARTIEL', label: 'Partiellement Paye' },
  { key: 'PAYE_TOTAL', label: 'Paye' },
]

/**
 * MICRO-COMPONENT: MarcheDecomptesSection (Cascade View)
 * Shows decomptes with expandable paiements per decompte.
 * Endpoints: GET /marches/{id}/decomptes + GET /marches/{id}/paiements
 */
const MarcheDecomptesSection = ({ marcheId }: MarcheDecomptesSectionProps) => {
  const navigate = useNavigate()
  const [decomptes, setDecomptes] = useState<Decompte[]>([])
  const [paiements, setPaiements] = useState<MarchePaiement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>('TOUS')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [decomptesRes, paiementsRes] = await Promise.all([
          marchesAPI.getDecomptes(marcheId),
          marchesAPI.getPaiements(marcheId),
        ])
        const dData = Array.isArray(decomptesRes.data.data)
          ? decomptesRes.data.data
          : decomptesRes.data.data?.data || []
        const pData = Array.isArray(paiementsRes.data.data)
          ? paiementsRes.data.data
          : paiementsRes.data.data?.data || []
        setDecomptes(dData)
        setPaiements(pData)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        console.error('Erreur chargement decomptes/paiements:', msg)
        setError('Impossible de charger les decomptes')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [marcheId])

  /** Group paiements by decompteId for fast lookup */
  const paiementsByDecompte = useMemo(() => {
    const map = new Map<number, MarchePaiement[]>()
    for (const p of paiements) {
      const existing = map.get(p.decompteId) || []
      existing.push(p)
      map.set(p.decompteId, existing)
    }
    return map
  }, [paiements])

  /** Filter counts */
  const filterCounts = useMemo(() => {
    const counts: Record<PaymentFilter, number> = { TOUS: decomptes.length, NON_PAYE: 0, PAYE_PARTIEL: 0, PAYE_TOTAL: 0 }
    for (const d of decomptes) {
      const status = getPaymentStatus(d)
      counts[status]++
    }
    return counts
  }, [decomptes])

  /** Filtered decomptes */
  const filteredDecomptes = useMemo(() => {
    if (activeFilter === 'TOUS') return decomptes
    return decomptes.filter((d) => getPaymentStatus(d) === activeFilter)
  }, [decomptes, activeFilter])

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const totalDecomptes = decomptes.reduce((sum, d) => sum + (d.netAPayer || 0), 0)
  const totalPaye = decomptes.reduce((sum, d) => sum + (d.montantPaye || 0), 0)

  return (
    <Box sx={{ ...componentStyles.card, p: 0, mb: 3, overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: colors.neutral[50],
          borderBottom: `1px solid ${colors.border}`,
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.textPrimary }}
          >
            Decomptes &amp; Paiements
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
            {decomptes.length} decompte(s) - Total: {formatCurrency(totalDecomptes)} DH
            {totalPaye > 0 && ` - Paye: ${formatCurrency(totalPaye)} DH`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/decomptes/nouveau')}
          sx={componentStyles.buttonPrimary}
          size="small"
        >
          Nouveau Decompte
        </Button>
      </Box>

      {/* Filter Chips */}
      {decomptes.length > 0 && (
        <Box sx={{ px: 3, py: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap', borderBottom: `1px solid ${colors.divider}` }}>
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.key
            return (
              <Chip
                key={chip.key}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <span>{chip.label}</span>
                    <Box
                      sx={{
                        bgcolor: isActive ? 'rgba(255,255,255,0.3)' : colors.neutral[200],
                        color: isActive ? colors.neutral[0] : colors.textSecondary,
                        borderRadius: borders.radius.full,
                        px: 0.75,
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.semibold,
                        minWidth: 20,
                        textAlign: 'center',
                      }}
                    >
                      {filterCounts[chip.key]}
                    </Box>
                  </Box>
                }
                onClick={() => setActiveFilter(chip.key)}
                sx={isActive ? componentStyles.listPage.filterPillActive : componentStyles.listPage.filterPill}
                size="small"
              />
            )
          })}
        </Box>
      )}

      {/* Content */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : filteredDecomptes.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">
            {decomptes.length === 0 ? 'Aucun decompte pour ce marche' : 'Aucun decompte pour ce filtre'}
          </Alert>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={componentStyles.listPage.tableHeader}>
                <TableCell sx={{ width: 48 }} />
                <TableCell>Numero</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Net a Payer</TableCell>
                <TableCell align="right">Montant Paye</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Paiement</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDecomptes.map((decompte) => {
                const paymentStatusKey = getPaymentStatus(decompte)
                const isExpanded = expandedIds.has(decompte.id)
                const decomptePaiements = paiementsByDecompte.get(decompte.id) || []
                const progressPercent = decompte.netAPayer > 0
                  ? Math.min(100, (decompte.montantPaye / decompte.netAPayer) * 100)
                  : 0
                const progressBarColor = paymentStatusKey === 'PAYE_TOTAL'
                  ? colors.success[500]
                  : paymentStatusKey === 'PAYE_PARTIEL'
                    ? colors.warning[500]
                    : colors.neutral[300]

                return (
                  <Fragment key={decompte.id}>
                    <TableRow
                      sx={{
                        borderBottom: `1px solid ${colors.divider}`,
                        '&:hover': { bgcolor: colors.neutral[50] },
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleExpand(decompte.id)}
                    >
                      <TableCell sx={{ width: 48, px: 1 }}>
                        <IconButton size="small" sx={{ color: colors.textSecondary }}>
                          {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ color: colors.textPrimary, fontWeight: typography.weights.medium }}>
                        {decompte.numeroDecompte}
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary }}>
                        {formatDate(decompte.dateDecompte)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{ fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.primary[700] }}
                        >
                          {formatCurrency(decompte.netAPayer)} DH
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontSize: typography.sizes.base,
                            fontWeight: typography.weights.medium,
                            color: decompte.montantPaye > 0 ? colors.success[700] : colors.textSecondary,
                          }}
                        >
                          {formatCurrency(decompte.montantPaye)} DH
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={decompte.statut} size="small" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ minWidth: 120 }}>
                          <StatusBadge status={paymentStatusKey} size="small" />
                          <LinearProgress
                            variant="determinate"
                            value={progressPercent}
                            sx={{
                              mt: 0.5,
                              height: 4,
                              borderRadius: 2,
                              bgcolor: colors.neutral[100],
                              '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: progressBarColor },
                            }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                    <DecomptePaiementsSubRow
                      open={isExpanded}
                      paiements={decomptePaiements}
                      colSpan={TOTAL_COLUMNS}
                    />
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default MarcheDecomptesSection
