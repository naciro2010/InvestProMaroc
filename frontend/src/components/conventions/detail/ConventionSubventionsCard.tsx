import React, { useState, useEffect } from 'react'
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
import { Edit, Delete, AccountBalance, ChevronRight, AddCircleOutline } from '@mui/icons-material'
import { subventionsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'
import SubventionFormDialog from '../SubventionFormDialog'
import SubventionDetailDrawer from './SubventionDetailDrawer'
import { thStyle } from './types'
import type { Subvention } from './types'

interface ConventionSubventionsCardProps {
  conventionId: number
  conventionBudget?: number
  canEdit?: boolean
  refreshKey?: number
  onDataChanged?: () => void
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
const ConventionSubventionsCard = ({ conventionId, conventionBudget = 0, canEdit = false, refreshKey, onDataChanged }: ConventionSubventionsCardProps) => {
  const [subventions, setSubventions] = useState<Subvention[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubvention, setEditingSubvention] = useState<Subvention | null>(null)
  const [selectedSubvention, setSelectedSubvention] = useState<Subvention | null>(null)

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

  useEffect(() => { loadSubventions() }, [conventionId, refreshKey])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette subvention ?')) return
    try { await subventionsAPI.delete(id); loadSubventions(); onDataChanged?.() }
    catch { setError('Erreur lors de la suppression') }
  }

  const totalMAD = subventions.reduce((sum, s) => sum + s.montantTotal * (s.tauxChange || 1), 0)

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
  if (error) return <Alert severity="error">{error}</Alert>

  if (subventions.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <AccountBalance sx={{ fontSize: 36, color: colors.neutral[300], mb: 1 }} />
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: canEdit ? 1.5 : 0 }}>
          Aucune subvention enregistree
        </Typography>
        {canEdit && (
          <Box
            onClick={() => { setEditingSubvention(null); setDialogOpen(true) }}
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', py: 0.75, px: 2, borderRadius: 1, '&:hover': { bgcolor: colors.primary[25] } }}
          >
            <AddCircleOutline sx={{ fontSize: 16, color: colors.primary[500] }} />
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.primary[600], fontWeight: typography.weights.medium }}>
              Ajouter une subvention
            </Typography>
          </Box>
        )}

        <SubventionFormDialog
          open={dialogOpen} conventionId={conventionId}
          onClose={() => { setDialogOpen(false); setEditingSubvention(null) }}
          onSuccess={() => { loadSubventions(); setDialogOpen(false); setEditingSubvention(null); onDataChanged?.() }}
          editingSubvention={editingSubvention}
        />
      </Box>
    )
  }

  const totalColSpan = canEdit ? 8 : 7

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: colors.neutral[50] }}>
              <TableCell sx={thStyle}>Organisme bailleur</TableCell>
              <TableCell sx={thStyle}>Type</TableCell>
              <TableCell sx={thStyle}>Date signature</TableCell>
              <TableCell align="right" sx={thStyle}>Montant</TableCell>
              <TableCell sx={thStyle}>Validite</TableCell>
              {canEdit && <TableCell align="center" sx={{ ...thStyle, width: 80 }}>Actions</TableCell>}
              <TableCell sx={{ ...thStyle, width: 32 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {subventions.map(s => (
              <Tooltip key={s.id} title="Cliquer pour voir le detail" placement="left" arrow enterDelay={600}>
              <TableRow
                onClick={() => setSelectedSubvention(s)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] }, bgcolor: selectedSubvention?.id === s.id ? colors.primary[25] : 'transparent' }}
              >
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
                <TableCell>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                    {s.dateSignature ? formatDate(s.dateSignature) : '-'}
                  </Typography>
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
                {canEdit && (
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditingSubvention(s); setDialogOpen(true) }} sx={{ color: colors.primary[600] }}>
                          <Edit sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(s.id) }} sx={{ color: colors.danger[500] }}>
                          <Delete sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                )}
                <TableCell sx={{ px: 0.5 }}>
                  <ChevronRight sx={{ fontSize: 16, color: colors.neutral[400] }} />
                </TableCell>
              </TableRow>
              </Tooltip>
            ))}
            {/* Total */}
            <TableRow sx={{ bgcolor: colors.neutral[50] }}>
              <TableCell colSpan={3} sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm, color: colors.success[700] }}>
                {formatCurrency(totalMAD, 'MAD')}
              </TableCell>
              <TableCell colSpan={canEdit ? 3 : 2} />
            </TableRow>
            {/* Add line */}
            {canEdit && (
              <TableRow
                onClick={() => { setEditingSubvention(null); setDialogOpen(true) }}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] }, '& td': { borderBottom: 0 } }}
              >
                <TableCell colSpan={totalColSpan}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <AddCircleOutline sx={{ fontSize: 16, color: colors.primary[500] }} />
                    <Typography sx={{ fontSize: typography.sizes.sm, color: colors.primary[600], fontWeight: typography.weights.medium }}>
                      Ajouter une subvention
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Drawer */}
      <SubventionDetailDrawer
        open={selectedSubvention !== null}
        onClose={() => setSelectedSubvention(null)}
        subvention={selectedSubvention}
        allSubventions={subventions}
        conventionBudget={conventionBudget}
      />

      <SubventionFormDialog
        open={dialogOpen} conventionId={conventionId}
        onClose={() => { setDialogOpen(false); setEditingSubvention(null) }}
        onSuccess={() => { loadSubventions(); setDialogOpen(false); setEditingSubvention(null); onDataChanged?.() }}
        editingSubvention={editingSubvention}
      />
    </Box>
  )
}

export default ConventionSubventionsCard
