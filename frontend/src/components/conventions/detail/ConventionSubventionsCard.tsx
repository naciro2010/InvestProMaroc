import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
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
import { Edit, Delete, AccountBalance } from '@mui/icons-material'
import { subventionsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'
import SubventionFormDialog from '../SubventionFormDialog'

interface Subvention {
  id: number
  conventionId: number
  organismeBailleur: string
  typeSubvention?: string
  montantTotal: number
  devise: string
  tauxChange?: number
  dateDebutValidite?: string
  dateFinValidite?: string
  conditions?: string
}

interface ConventionSubventionsCardProps {
  conventionId: number
}

const TYPE_LABELS: Record<string, string> = {
  ETAT: 'Etat', REGION: 'Region', COMMUNE: 'Commune',
  FONDS_SPECIAL: 'Fonds special', BAILLEUR_INTERNATIONAL: 'Bailleur international', AUTRE: 'Autre',
}

const formatCurrency = (amount: number, devise = 'MAD') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(amount)

const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '-'

/**
 * ConventionSubventionsCard - Pure content for ResizableSection.
 * No Paper wrapper or redundant header.
 */
const ConventionSubventionsCard = ({ conventionId }: ConventionSubventionsCardProps) => {
  const [subventions, setSubventions] = useState<Subvention[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubvention, setEditingSubvention] = useState<Subvention | null>(null)

  const loadSubventions = async () => {
    try {
      setLoading(true); setError(null)
      const res = await subventionsAPI.getByConvention(conventionId)
      setSubventions(res.data.data || res.data || [])
    } catch {
      setError('Erreur lors du chargement des subventions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSubventions() }, [conventionId])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette subvention ?')) return
    try { await subventionsAPI.delete(id); loadSubventions() }
    catch { setError('Erreur lors de la suppression') }
  }

  const totalMAD = subventions.reduce((sum, s) => sum + s.montantTotal * (s.tauxChange || 1), 0)

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
  if (error) return <Alert severity="error">{error}</Alert>

  if (subventions.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <AccountBalance sx={{ fontSize: 36, color: colors.neutral[300], mb: 1 }} />
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Aucune subvention enregistree</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: colors.neutral[50] }}>
              <TableCell sx={thStyle}>Organisme bailleur</TableCell>
              <TableCell sx={thStyle}>Type</TableCell>
              <TableCell align="right" sx={thStyle}>Montant</TableCell>
              <TableCell sx={thStyle}>Validite</TableCell>
              <TableCell align="center" sx={{ ...thStyle, width: 80 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subventions.map(s => (
              <TableRow key={s.id} sx={{ '&:hover': { bgcolor: colors.neutral[25] } }}>
                <TableCell>
                  <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>{s.organismeBailleur}</Typography>
                  {s.conditions && (
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                      {s.conditions.substring(0, 50)}{s.conditions.length > 50 ? '...' : ''}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {s.typeSubvention ? (
                    <Chip label={TYPE_LABELS[s.typeSubvention] || s.typeSubvention} size="small"
                      sx={{ bgcolor: colors.info[50], color: colors.info[700], fontSize: typography.sizes.xs, height: 22 }} />
                  ) : <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>-</Typography>}
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.success[600] }}>
                    {formatCurrency(s.montantTotal, s.devise)}
                  </Typography>
                  {s.devise !== 'MAD' && s.tauxChange && (
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                      ~ {formatCurrency(s.montantTotal * s.tauxChange, 'MAD')}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                    {s.dateDebutValidite || s.dateFinValidite
                      ? `${formatDate(s.dateDebutValidite)} - ${formatDate(s.dateFinValidite)}` : '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => { setEditingSubvention(s); setDialogOpen(true) }} sx={{ color: colors.primary[600] }}>
                        <Edit sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" onClick={() => handleDelete(s.id)} sx={{ color: colors.danger[500] }}>
                        <Delete sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ bgcolor: colors.neutral[50], '& td': { borderBottom: 0 } }}>
              <TableCell colSpan={2} sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm, color: colors.success[700] }}>
                {formatCurrency(totalMAD, 'MAD')}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <SubventionFormDialog
        open={dialogOpen} conventionId={conventionId}
        onClose={() => { setDialogOpen(false); setEditingSubvention(null) }}
        onSuccess={() => { loadSubventions(); setDialogOpen(false); setEditingSubvention(null) }}
        editingSubvention={editingSubvention}
      />
    </Box>
  )
}

const thStyle = {
  fontWeight: typography.weights.semibold,
  fontSize: typography.sizes.xs,
  color: colors.textSecondary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}

export default ConventionSubventionsCard
