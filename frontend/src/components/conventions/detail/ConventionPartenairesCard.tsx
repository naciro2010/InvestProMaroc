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
} from '@mui/material'
import { Add, Edit, Delete, People } from '@mui/icons-material'
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

interface ConventionPartenairesCardProps {
  conventionId: number
  onAddClick: () => void
  onEditClick?: (partenaire: ConventionPartenaireData) => void
  onRefresh?: () => void
}

/**
 * MICRO-COMPONENT: ConventionPartenairesCard
 * Charge et affiche les partenaires d'une convention
 * Endpoint: GET /conventions/{id}/partenaires
 */
const ConventionPartenairesCard = ({
  conventionId,
  onAddClick,
  onEditClick,
  onRefresh,
}: ConventionPartenairesCardProps) => {
  const [partenaires, setPartenaires] = useState<ConventionPartenaireData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPartenaires()
  }, [conventionId])

  // Expose reload function via onRefresh callback
  useEffect(() => {
    if (onRefresh) {
      // This is a workaround to expose the reload function
      // In a real app, consider using a ref or context
    }
  }, [onRefresh])

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

  const handleDelete = async (partenaireId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      return
    }

    try {
      await conventionsAPI.deletePartenaire(conventionId, partenaireId)
      loadPartenaires()
    } catch (err) {
      console.error('Error deleting partenaire:', err)
      alert('Erreur lors de la suppression du partenaire')
    }
  }

  const formatCurrency = (amount: number): string => {
    // Budget en DH, affiché en millions
    const millions = amount / 1000000
    return `${millions.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`
  }

  const formatPercentage = (pct: number): string => {
    return `${pct.toFixed(2)}%`
  }

  const totalBudget = partenaires.reduce((sum, p) => sum + p.budgetAlloue, 0)
  const totalCI = partenaires.reduce((sum, p) => sum + (p.commissionIntervention || 0), 0)

  return (
    <Paper sx={{ ...componentStyles.card, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <People sx={{ color: colors.primary[600] }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary }}
          >
            Partenaires
          </Typography>
          {partenaires.length > 0 && (
            <Chip
              label={partenaires.length}
              size="small"
              sx={{
                bgcolor: colors.primary[100],
                color: colors.primary[700],
                fontWeight: typography.weights.medium,
              }}
            />
          )}
        </Box>
        <Button
          size="small"
          startIcon={<Add />}
          variant="outlined"
          onClick={onAddClick}
          sx={{
            borderColor: colors.primary[300],
            color: colors.primary[600],
            '&:hover': {
              borderColor: colors.primary[500],
              bgcolor: colors.primary[50],
            },
          }}
        >
          Ajouter
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ py: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      ) : partenaires.length === 0 ? (
        <Box
          sx={{
            py: 4,
            textAlign: 'center',
            bgcolor: colors.neutral[50],
            borderRadius: borders.radius.md,
          }}
        >
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Aucun partenaire défini pour cette convention
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                  <TableCell sx={{ fontWeight: typography.weights.semibold }}>Partenaire</TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.semibold }}>
                    Budget (M)
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.semibold }}>
                    %
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.semibold }}>
                    CI (M)
                  </TableCell>
                  <TableCell sx={{ fontWeight: typography.weights.semibold }}>Rôle</TableCell>
                  <TableCell align="center" sx={{ fontWeight: typography.weights.semibold }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partenaires.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: typography.weights.medium, color: colors.textPrimary }}
                      >
                        {p.partenaireSigle || p.partenaireCode}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        {p.partenaireNom}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: typography.weights.medium, color: colors.primary[700] }}
                      >
                        {formatCurrency(p.budgetAlloue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatPercentage(p.pourcentage)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ color: colors.success[600], fontWeight: typography.weights.medium }}
                      >
                        {p.commissionIntervention ? formatCurrency(p.commissionIntervention) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {p.estMaitreOeuvre && (
                          <Chip
                            label="MO"
                            size="small"
                            sx={{
                              bgcolor: colors.info[100],
                              color: colors.info[700],
                              fontSize: typography.sizes.xs,
                            }}
                          />
                        )}
                        {p.estMaitreOeuvreDelegue && (
                          <Chip
                            label="MOD"
                            size="small"
                            sx={{
                              bgcolor: colors.purple[100],
                              color: colors.purple[700],
                              fontSize: typography.sizes.xs,
                            }}
                          />
                        )}
                        {!p.estMaitreOeuvre && !p.estMaitreOeuvreDelegue && (
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            -
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
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
                ))}
                {/* Total Row */}
                <TableRow sx={{ bgcolor: colors.neutral[100] }}>
                  <TableCell sx={{ fontWeight: typography.weights.bold }}>Total</TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}
                  >
                    {formatCurrency(totalBudget)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.bold }}>
                    100%
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: typography.weights.bold, color: colors.success[600] }}
                  >
                    {formatCurrency(totalCI)}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Paper>
  )
}

export default ConventionPartenairesCard
