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
  CircularProgress,
  Alert,
} from '@mui/material'
import { Edit, Delete, AccountBalance, ChevronRight, AddCircleOutline } from '@mui/icons-material'
import { versementsPrevisionnelsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'
import VersementFormDialog from '../VersementFormDialog'
import VersementDetailDrawer from './VersementDetailDrawer'
import { thStyle } from './types'
import type { VersementPrevisionnel } from './types'

interface ConventionVersementsCardProps {
  conventionId: number
  conventionBudget?: number
  canEdit?: boolean
  onDataChanged?: () => void
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR')

/**
 * ConventionVersementsCard - Self-loading versements tab content.
 * Loads its own data and manages its own form dialog.
 */
const ConventionVersementsCard = ({
  conventionId,
  conventionBudget = 0,
  canEdit = false,
  onDataChanged,
}: ConventionVersementsCardProps) => {
  const [versements, setVersements] = useState<VersementPrevisionnel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVersement, setEditingVersement] = useState<VersementPrevisionnel | null>(null)
  const [selectedVersement, setSelectedVersement] = useState<VersementPrevisionnel | null>(null)

  const loadVersements = async () => {
    try {
      setLoading(true); setError(null)
      const res = await versementsPrevisionnelsAPI.getByConvention(conventionId)
      setVersements(res.data.data || res.data || [])
    } catch {
      setError('Erreur lors du chargement des versements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadVersements() }, [conventionId])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce versement ?')) return
    try {
      await versementsPrevisionnelsAPI.delete(id)
      loadVersements()
      onDataChanged?.()
    } catch { setError('Erreur lors de la suppression') }
  }

  const totalVersements = versements.reduce((sum, v) => sum + v.montant, 0)
  const totalPrevu = versements.reduce((sum, v) => sum + (v.montantPrevu || 0), 0)

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
  if (error) return <Alert severity="error">{error}</Alert>

  if (versements.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <AccountBalance sx={{ fontSize: 36, color: colors.neutral[300], mb: 1 }} />
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: canEdit ? 1.5 : 0 }}>
          Aucun versement previsionnel
        </Typography>
        {canEdit && (
          <Box
            onClick={() => { setEditingVersement(null); setDialogOpen(true) }}
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', py: 0.75, px: 2, borderRadius: 1, '&:hover': { bgcolor: colors.primary[25] } }}
          >
            <AddCircleOutline sx={{ fontSize: 16, color: colors.primary[500] }} />
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.primary[600], fontWeight: typography.weights.medium }}>
              Ajouter un versement
            </Typography>
          </Box>
        )}
        <VersementFormDialog
          open={dialogOpen} conventionId={conventionId}
          onClose={() => { setDialogOpen(false); setEditingVersement(null) }}
          onSuccess={() => { loadVersements(); setDialogOpen(false); setEditingVersement(null); onDataChanged?.() }}
          editingVersement={editingVersement}
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
              <TableCell sx={thStyle}>Partenaire</TableCell>
              <TableCell sx={thStyle}>Volet / Tranche</TableCell>
              <TableCell sx={thStyle}>Date versement</TableCell>
              <TableCell align="right" sx={thStyle}>Montant prevu</TableCell>
              <TableCell align="right" sx={thStyle}>Montant reel</TableCell>
              <TableCell align="right" sx={thStyle}>Ecart</TableCell>
              {canEdit && <TableCell align="center" sx={{ ...thStyle, width: 80 }}>Actions</TableCell>}
              <TableCell sx={{ ...thStyle, width: 32 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {versements.map(v => (
              <Tooltip key={v.id} title="Cliquer pour voir le detail" placement="left" arrow enterDelay={600}>
              <TableRow
                onClick={() => setSelectedVersement(v)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] }, bgcolor: selectedVersement?.id === v.id ? colors.primary[25] : 'transparent' }}
              >
                <TableCell>
                  <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                    {v.partenaireSigle || v.partenaireNom || '-'}
                  </Typography>
                  {v.partenaireSigle && v.partenaireNom && (
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{v.partenaireNom}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>{v.volet || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>{formatDate(v.dateVersement)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontSize: typography.sizes.sm, color: v.montantPrevu ? colors.textPrimary : colors.textSecondary }}>
                    {v.montantPrevu ? formatCurrency(v.montantPrevu) : '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.sm, color: colors.success[600] }}>
                    {formatCurrency(v.montant)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {v.montantPrevu ? (
                    <Typography sx={{
                      fontSize: typography.sizes.sm, fontWeight: typography.weights.medium,
                      color: v.montant === v.montantPrevu ? colors.success[600]
                        : v.montant > v.montantPrevu ? colors.danger[600] : colors.info[600],
                    }}>
                      {formatCurrency(v.montant - v.montantPrevu)}
                    </Typography>
                  ) : (
                    <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>-</Typography>
                  )}
                </TableCell>
                {canEdit && (
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditingVersement(v); setDialogOpen(true) }} sx={{ color: colors.primary[600] }}>
                          <Edit sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(v.id) }} sx={{ color: colors.danger[500] }}>
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
              <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm }}>
                {formatCurrency(totalPrevu)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm, color: colors.success[700] }}>
                {formatCurrency(totalVersements)}
              </TableCell>
              <TableCell align="right">
                {totalPrevu > 0 && (
                  <Typography sx={{
                    fontWeight: typography.weights.bold, fontSize: typography.sizes.sm,
                    color: totalVersements === totalPrevu ? colors.success[700]
                      : totalVersements > totalPrevu ? colors.danger[700] : colors.info[700],
                  }}>
                    {formatCurrency(totalVersements - totalPrevu)}
                  </Typography>
                )}
              </TableCell>
              <TableCell colSpan={canEdit ? 2 : 1} />
            </TableRow>
            {/* Add line */}
            {canEdit && (
              <TableRow
                onClick={() => { setEditingVersement(null); setDialogOpen(true) }}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] }, '& td': { borderBottom: 0 } }}
              >
                <TableCell colSpan={totalColSpan}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <AddCircleOutline sx={{ fontSize: 16, color: colors.primary[500] }} />
                    <Typography sx={{ fontSize: typography.sizes.sm, color: colors.primary[600], fontWeight: typography.weights.medium }}>
                      Ajouter un versement
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Drawer */}
      <VersementDetailDrawer
        open={selectedVersement !== null}
        onClose={() => setSelectedVersement(null)}
        versement={selectedVersement}
        allVersements={versements}
        conventionBudget={conventionBudget}
      />

      {/* Form Dialog */}
      <VersementFormDialog
        open={dialogOpen} conventionId={conventionId}
        onClose={() => { setDialogOpen(false); setEditingVersement(null) }}
        onSuccess={() => { loadVersements(); setDialogOpen(false); setEditingVersement(null); onDataChanged?.() }}
        editingVersement={editingVersement}
      />
    </Box>
  )
}

export default ConventionVersementsCard
