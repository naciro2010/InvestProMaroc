import { useState, useEffect } from 'react'
import {
  Paper,
  Box,
  Typography,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material'
import { Add, Edit, Delete, AccountBalance, Euro } from '@mui/icons-material'
import { subventionsAPI } from '@/lib/api'
import { colors, componentStyles, typography } from '@/lib/designSystem'
import SubventionFormDialog from '../SubventionFormDialog'

interface Subvention {
  id: number
  conventionId: number
  organismeBailleur: string
  typeSubvention?: string
  montantTotal: number
  devise: string
  tauxChange?: number
  dateSignature?: string
  dateDebutValidite?: string
  dateFinValidite?: string
  conditions?: string
  observations?: string
}

interface ConventionSubventionsCardProps {
  conventionId: number
}

const TYPE_LABELS: Record<string, string> = {
  ETAT: 'État',
  REGION: 'Région',
  COMMUNE: 'Commune',
  FONDS_SPECIAL: 'Fonds spécial',
  BAILLEUR_INTERNATIONAL: 'Bailleur international',
  AUTRE: 'Autre',
}

const ConventionSubventionsCard = ({ conventionId }: ConventionSubventionsCardProps) => {
  const [subventions, setSubventions] = useState<Subvention[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubvention, setEditingSubvention] = useState<Subvention | null>(null)

  const loadSubventions = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await subventionsAPI.getByConvention(conventionId)
      setSubventions(res.data.data || res.data || [])
    } catch (err) {
      console.error('Error loading subventions:', err)
      setError('Erreur lors du chargement des subventions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubventions()
  }, [conventionId])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette subvention ?')) return

    try {
      await subventionsAPI.delete(id)
      loadSubventions()
    } catch (err) {
      console.error('Error deleting subvention:', err)
      setError('Erreur lors de la suppression')
    }
  }

  const formatCurrency = (amount: number, devise = 'MAD') => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: devise,
    }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const totalMAD = subventions.reduce((sum, s) => {
    const rate = s.tauxChange || 1
    return sum + s.montantTotal * rate
  }, 0)

  return (
    <Paper sx={{ ...componentStyles.card, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Euro sx={{ color: colors.success[600] }} />
          <Typography variant="h6" sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
            Subventions
          </Typography>
          {subventions.length > 0 && (
            <Chip
              label={subventions.length}
              size="small"
              sx={{
                bgcolor: colors.success[100],
                color: colors.success[700],
                fontWeight: typography.weights.medium,
              }}
            />
          )}
        </Box>
        <Button
          size="small"
          startIcon={<Add />}
          variant="outlined"
          onClick={() => {
            setEditingSubvention(null)
            setDialogOpen(true)
          }}
          sx={{ borderColor: colors.primary[300], color: colors.primary[600] }}
        >
          Ajouter
        </Button>
      </Box>
      <Divider sx={{ mb: 2, borderColor: colors.border }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : subventions.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell sx={{ fontWeight: typography.weights.semibold }}>Organisme bailleur</TableCell>
                <TableCell sx={{ fontWeight: typography.weights.semibold }}>Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.semibold }}>Montant</TableCell>
                <TableCell sx={{ fontWeight: typography.weights.semibold }}>Validité</TableCell>
                <TableCell align="center" sx={{ fontWeight: typography.weights.semibold }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subventions.map((subvention) => (
                <TableRow key={subvention.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: typography.weights.medium }}>
                      {subvention.organismeBailleur}
                    </Typography>
                    {subvention.conditions && (
                      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                        {subvention.conditions.substring(0, 50)}
                        {subvention.conditions.length > 50 ? '...' : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {subvention.typeSubvention ? (
                      <Chip
                        label={TYPE_LABELS[subvention.typeSubvention] || subvention.typeSubvention}
                        size="small"
                        sx={{
                          bgcolor: colors.info[50],
                          color: colors.info[700],
                          fontSize: typography.sizes.xs,
                        }}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: typography.weights.medium, color: colors.success[600] }}>
                      {formatCurrency(subvention.montantTotal, subvention.devise)}
                    </Typography>
                    {subvention.devise !== 'MAD' && subvention.tauxChange && (
                      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                        ≈ {formatCurrency(subvention.montantTotal * subvention.tauxChange, 'MAD')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {subvention.dateDebutValidite || subvention.dateFinValidite ? (
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        {formatDate(subvention.dateDebutValidite)} - {formatDate(subvention.dateFinValidite)}
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingSubvention(subvention)
                            setDialogOpen(true)
                          }}
                          sx={{ color: colors.primary[600] }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(subvention.id)}
                          sx={{ color: colors.danger[500] }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {/* Total row */}
              <TableRow sx={{ bgcolor: colors.neutral[100] }}>
                <TableCell colSpan={2} sx={{ fontWeight: typography.weights.bold }}>
                  Total
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.bold, color: colors.success[700] }}>
                  {formatCurrency(totalMAD, 'MAD')}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <AccountBalance sx={{ fontSize: 48, color: colors.neutral[300], mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Aucune subvention enregistrée
          </Typography>
        </Box>
      )}

      {/* Dialog */}
      <SubventionFormDialog
        open={dialogOpen}
        conventionId={conventionId}
        onClose={() => {
          setDialogOpen(false)
          setEditingSubvention(null)
        }}
        onSuccess={() => {
          loadSubventions()
          setDialogOpen(false)
          setEditingSubvention(null)
        }}
        editingSubvention={editingSubvention}
      />
    </Paper>
  )
}

export default ConventionSubventionsCard
