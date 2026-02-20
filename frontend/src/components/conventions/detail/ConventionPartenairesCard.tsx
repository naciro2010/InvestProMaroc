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
  Button,
  IconButton,
  CircularProgress,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material'
import { Add, Edit, Delete, People, ArrowUpward } from '@mui/icons-material'
import { conventionsAPI } from '@/lib/api'
import { colors, componentStyles, borders, typography } from '@/lib/designSystem'

interface ConventionPartenaireData {
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

interface VersementPrevisionnel {
  id: number
  partenaireId?: number
  partenaireNom?: string
  partenaireSigle?: string
  volet?: string
  dateVersement: string
  montant: number
  montantPrevu?: number
  remarques?: string
}

interface ConventionPartenairesCardProps {
  conventionId: number
  parentConventionId?: number
  versements?: VersementPrevisionnel[]
  onAddClick: () => void
  onEditClick?: (partenaire: ConventionPartenaireData) => void
  onRefresh?: () => void
}

const ConventionPartenairesCard = ({
  conventionId,
  parentConventionId,
  versements = [],
  onAddClick,
  onEditClick,
}: ConventionPartenairesCardProps) => {
  const [partenaires, setPartenaires] = useState<ConventionPartenaireData[]>([])
  const [parentPartenaires, setParentPartenaires] = useState<ConventionPartenaireData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingParent, setLoadingParent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSousConvention = !!parentConventionId

  useEffect(() => {
    loadPartenaires()
    if (parentConventionId) {
      loadParentPartenaires()
    }
  }, [conventionId, parentConventionId])

  const loadPartenaires = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await conventionsAPI.getPartenaires(conventionId)
      const data = response.data.data || response.data || []
      setPartenaires(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading partenaires:', err)
      setError('Erreur lors du chargement des partenaires')
      setPartenaires([])
    } finally {
      setLoading(false)
    }
  }

  const loadParentPartenaires = async () => {
    if (!parentConventionId) return
    try {
      setLoadingParent(true)
      const response = await conventionsAPI.getPartenaires(parentConventionId)
      const data = response.data.data || response.data || []
      setParentPartenaires(Array.isArray(data) ? data : [])
    } catch {
      setParentPartenaires([])
    } finally {
      setLoadingParent(false)
    }
  }

  const handleDelete = async (partenaireId: number) => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer ce partenaire ?')) return
    try {
      await conventionsAPI.deletePartenaire(conventionId, partenaireId)
      loadPartenaires()
    } catch (err) {
      console.error('Error deleting partenaire:', err)
      alert('Erreur lors de la suppression du partenaire')
    }
  }

  const formatCurrency = (amount: number): string => {
    const millions = amount / 1000000
    return `${millions.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`
  }

  const formatCurrencyFull = (amount: number): string =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

  const formatPercentage = (pct: number): string => `${pct.toFixed(2)}%`

  const totalBudget = partenaires.reduce((sum, p) => sum + p.budgetAlloue, 0)

  // Aggregate versements per partenaire
  const versementsByPartenaire = new Map<number, number>()
  versements.forEach(v => {
    if (v.partenaireId) {
      const current = versementsByPartenaire.get(v.partenaireId) || 0
      versementsByPartenaire.set(v.partenaireId, current + (v.montantPrevu || v.montant))
    }
  })
  const totalVersements = Array.from(versementsByPartenaire.values()).reduce((s, v) => s + v, 0)

  const parentPartenaireIds = new Set(parentPartenaires.map(p => p.partenaireId))

  return (
    <Paper sx={{ ...componentStyles.card, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <People sx={{ color: colors.primary[600] }} />
          <Typography variant="h6" sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
            Partenaires
          </Typography>
          {partenaires.length > 0 && (
            <Chip label={partenaires.length} size="small"
              sx={{ bgcolor: colors.primary[100], color: colors.primary[700], fontWeight: typography.weights.medium }} />
          )}
        </Box>
        <Button size="small" startIcon={<Add />} variant="outlined" onClick={onAddClick}
          sx={{ borderColor: colors.primary[300], color: colors.primary[600], '&:hover': { borderColor: colors.primary[500], bgcolor: colors.primary[50] } }}>
          Ajouter
        </Button>
      </Box>

      {/* Parent partenaires info for sous-conventions */}
      {isSousConvention && !loadingParent && parentPartenaires.length > 0 && (
        <Box sx={{ mb: 2, p: 1.5, bgcolor: colors.primary[25], borderRadius: borders.radius.md, border: `1px solid ${colors.primary[100]}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <ArrowUpward sx={{ fontSize: 14, color: colors.primary[600] }} />
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.primary[600], textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Partenaires de la convention principale
            </Typography>
            <Chip label={parentPartenaires.length} size="small" sx={{ height: 18, fontSize: '10px', bgcolor: colors.primary[100], color: colors.primary[700] }} />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {parentPartenaires.map((p) => (
              <Chip key={p.id}
                label={`${p.partenaireSigle || p.partenaireCode} - ${formatCurrency(p.budgetAlloue)} DH (${p.pourcentage.toFixed(1)}%)`}
                size="small" variant="outlined"
                sx={{ fontSize: typography.sizes.xs, borderColor: partenaires.some(own => own.partenaireId === p.partenaireId) ? colors.success[300] : colors.neutral[300], color: colors.textPrimary, bgcolor: partenaires.some(own => own.partenaireId === p.partenaireId) ? colors.success[25] : 'transparent' }} />
            ))}
          </Box>
        </Box>
      )}
      {isSousConvention && loadingParent && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, mb: 2 }}><CircularProgress size={20} /></Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={32} /></Box>
      ) : error ? (
        <Typography color="error" sx={{ py: 2, textAlign: 'center' }}>{error}</Typography>
      ) : partenaires.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center', bgcolor: colors.neutral[50], borderRadius: borders.radius.md }}>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {isSousConvention ? 'Aucun partenaire propre a cette sous-convention' : 'Aucun partenaire defini pour cette convention'}
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell sx={{ fontWeight: typography.weights.semibold }}>Partenaire</TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.semibold }}>Budget</TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.semibold }}>%</TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.semibold }}>Vers. Prev.</TableCell>
                <TableCell sx={{ fontWeight: typography.weights.semibold }}>Role</TableCell>
                {isSousConvention && <TableCell sx={{ fontWeight: typography.weights.semibold }}>Source</TableCell>}
                <TableCell align="center" sx={{ fontWeight: typography.weights.semibold }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {partenaires.map((p) => {
                const isFromParent = parentPartenaireIds.has(p.partenaireId)
                const versTotal = versementsByPartenaire.get(p.partenaireId) || 0
                return (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: typography.weights.medium, color: colors.textPrimary }}>
                        {p.partenaireSigle || p.partenaireCode}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        {p.partenaireNom}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: typography.weights.medium, color: colors.primary[700] }}>
                        {formatCurrency(p.budgetAlloue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatPercentage(p.pourcentage)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{
                        fontWeight: versTotal > 0 ? typography.weights.medium : typography.weights.normal,
                        color: versTotal > 0 ? colors.warning[700] : colors.textSecondary,
                      }}>
                        {versTotal > 0 ? formatCurrencyFull(versTotal) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {p.estMaitreOeuvre && <Chip label="MO" size="small" sx={{ bgcolor: colors.info[100], color: colors.info[700], fontSize: typography.sizes.xs }} />}
                        {p.estMaitreOeuvreDelegue && <Chip label="MOD" size="small" sx={{ bgcolor: colors.purple[100], color: colors.purple[700], fontSize: typography.sizes.xs }} />}
                        {!p.estMaitreOeuvre && !p.estMaitreOeuvreDelegue && <Typography variant="body2" sx={{ color: colors.textSecondary }}>-</Typography>}
                      </Box>
                    </TableCell>
                    {isSousConvention && (
                      <TableCell>
                        {isFromParent ? (
                          <Tooltip title="Ce partenaire figure dans la convention principale">
                            <Chip icon={<ArrowUpward sx={{ fontSize: 12 }} />} label="Conv. principale" size="small"
                              sx={{ height: 22, fontSize: '10px', bgcolor: colors.primary[50], color: colors.primary[700], border: `1px solid ${colors.primary[200]}`, '& .MuiChip-icon': { color: colors.primary[600] } }} />
                          </Tooltip>
                        ) : (
                          <Chip label="Propre" size="small" sx={{ height: 22, fontSize: '10px', bgcolor: colors.neutral[50], color: colors.textSecondary, border: `1px solid ${colors.neutral[200]}` }} />
                        )}
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        {onEditClick && (
                          <Tooltip title="Modifier">
                            <IconButton size="small" onClick={() => onEditClick(p)}>
                              <Edit fontSize="small" sx={{ color: colors.neutral[500] }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Supprimer">
                          <IconButton size="small" onClick={() => handleDelete(p.id)}>
                            <Delete fontSize="small" sx={{ color: colors.danger[500] }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
              {/* Total Row */}
              <TableRow sx={{ bgcolor: colors.neutral[100] }}>
                <TableCell sx={{ fontWeight: typography.weights.bold }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                  {formatCurrency(totalBudget)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.bold }}>100%</TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.bold, color: colors.warning[700] }}>
                  {totalVersements > 0 ? formatCurrencyFull(totalVersements) : '-'}
                </TableCell>
                <TableCell colSpan={isSousConvention ? 3 : 2} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}

export default ConventionPartenairesCard
