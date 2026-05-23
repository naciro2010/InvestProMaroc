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
import { Delete, Edit, TrendingUp, Schedule, ChevronRight, AddCircleOutline } from '@mui/icons-material'
import { conventionsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'
import ImputationFormDialog from './ImputationFormDialog'
import ImputationDetailDrawer from './ImputationDetailDrawer'
import { thStyle } from './types'
import type { ImputationPrevisionnelle } from './types'

interface ConventionImputationsCardProps {
  conventionId: number
  conventionBudget?: number
  canEdit?: boolean
  refreshKey?: number
  onRefresh?: () => void
  onCountChange?: (count: number) => void
}

const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '-'

const calculateEndDate = (startDate: string, delaiMois: number): string => {
  const date = new Date(startDate)
  date.setMonth(date.getMonth() + delaiMois)
  return date.toLocaleDateString('fr-FR')
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

/**
 * ConventionImputationsCard - Pure content for ResizableSection.
 * No Paper wrapper or redundant header. Dialog extracted to ImputationFormDialog.
 */
const ConventionImputationsCard = ({ conventionId, conventionBudget = 0, canEdit = false, refreshKey, onRefresh, onCountChange }: ConventionImputationsCardProps) => {
  const [imputations, setImputations] = useState<ImputationPrevisionnelle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingImputation, setEditingImputation] = useState<ImputationPrevisionnelle | null>(null)
  const [selectedImputation, setSelectedImputation] = useState<ImputationPrevisionnelle | null>(null)

  const loadImputations = async () => {
    try {
      setLoading(true)
      const res = await conventionsAPI.getImputations(conventionId)
      setImputations(res.data.data || [])
      setError(null)
    } catch {
      setError('Erreur lors du chargement des imputations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImputations()
  }, [conventionId, refreshKey])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onCountChange?.(imputations.length) }, [imputations.length])

  const handleDelete = async (imputationId: number) => {
    if (!window.confirm('Supprimer cette imputation ?')) return
    try {
      await conventionsAPI.supprimerImputation(conventionId, imputationId)
      setImputations(prev => prev.filter(i => i.id !== imputationId))
      onRefresh?.()
    } catch {
      setError('Erreur lors de la suppression')
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
  if (error) return <Alert severity="error">{error}</Alert>

  if (imputations.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <TrendingUp sx={{ fontSize: 36, color: colors.neutral[300], mb: 1 }} />
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: canEdit ? 1.5 : 0 }}>
          Aucune imputation previsionnelle
        </Typography>
        {canEdit && (
          <Box
            onClick={() => setDialogOpen(true)}
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', py: 0.75, px: 2, borderRadius: 1, '&:hover': { bgcolor: colors.primary[25] } }}
          >
            <AddCircleOutline sx={{ fontSize: 16, color: colors.primary[500] }} />
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.primary[600], fontWeight: typography.weights.medium }}>
              Ajouter une imputation
            </Typography>
          </Box>
        )}

        <ImputationFormDialog
          open={dialogOpen} conventionId={conventionId}
          onClose={() => { setDialogOpen(false); setEditingImputation(null) }}
          onSuccess={() => { loadImputations(); setDialogOpen(false); setEditingImputation(null); onRefresh?.() }}
          editingImputation={editingImputation}
        />
      </Box>
    )
  }

  const totalColSpan = canEdit ? 9 : 8

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: colors.neutral[50] }}>
              <TableCell sx={thStyle}>Volet</TableCell>
              <TableCell sx={thStyle}>Date demarrage</TableCell>
              <TableCell sx={thStyle}>Delai</TableCell>
              <TableCell sx={thStyle}>Date fin prevue</TableCell>
              <TableCell align="right" sx={thStyle}>Montant prevu</TableCell>
              <TableCell sx={thStyle}>Remarques</TableCell>
              {canEdit && <TableCell align="center" sx={{ ...thStyle, width: 80 }}>Actions</TableCell>}
              <TableCell sx={{ ...thStyle, width: 32 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {imputations.map(imp => (
              <Tooltip key={imp.id} title="Cliquer pour voir le detail" placement="left" arrow enterDelay={600}>
              <TableRow
                onClick={() => setSelectedImputation(imp)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] }, bgcolor: selectedImputation?.id === imp.id ? colors.primary[25] : 'transparent' }}
              >
                <TableCell>
                  {imp.volet ? (
                    <Chip label={imp.volet} size="small"
                      sx={{ bgcolor: colors.purple[50], color: colors.purple[700], fontSize: typography.sizes.xs, height: 22 }} />
                  ) : (
                    <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>-</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: typography.sizes.sm }}>{formatDate(imp.dateDemarrage)}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Schedule sx={{ fontSize: 14, color: colors.textSecondary }} />
                    <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>{imp.delaiMois} mois</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: typography.sizes.sm }}>
                    {imp.dateFinPrevue ? formatDate(imp.dateFinPrevue) : calculateEndDate(imp.dateDemarrage, imp.delaiMois)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>
                    {imp.montantPrevu ? formatCurrency(imp.montantPrevu) : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {imp.remarques || '-'}
                  </Typography>
                </TableCell>
                {canEdit && (
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditingImputation(imp); setDialogOpen(true) }} sx={{ color: colors.primary[600] }}>
                          <Edit sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(imp.id) }} sx={{ color: colors.danger[500] }}>
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
            {/* Add line */}
            {canEdit && (
              <TableRow
                onClick={() => { setEditingImputation(null); setDialogOpen(true) }}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] }, '& td': { borderBottom: 0 } }}
              >
                <TableCell colSpan={totalColSpan}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <AddCircleOutline sx={{ fontSize: 16, color: colors.primary[500] }} />
                    <Typography sx={{ fontSize: typography.sizes.sm, color: colors.primary[600], fontWeight: typography.weights.medium }}>
                      Ajouter une imputation
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ImputationFormDialog
        open={dialogOpen} conventionId={conventionId}
        onClose={() => { setDialogOpen(false); setEditingImputation(null) }}
        onSuccess={() => { loadImputations(); setDialogOpen(false); setEditingImputation(null); onRefresh?.() }}
        editingImputation={editingImputation}
      />

      {/* Detail Drawer */}
      <ImputationDetailDrawer
        open={selectedImputation !== null}
        onClose={() => setSelectedImputation(null)}
        imputation={selectedImputation}
        allImputations={imputations}
        conventionBudget={conventionBudget}
      />
    </Box>
  )
}

export default ConventionImputationsCard
