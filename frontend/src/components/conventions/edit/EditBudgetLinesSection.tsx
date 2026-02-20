import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Paper, Tooltip, Chip,
  Autocomplete, TextField, CircularProgress, Alert,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import DecimalInput from '@/components/ui/DecimalInput'
import { conventionsAPI, categoriesDepensesAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { CategorieDepenseListDTO, ConventionBudgetLigneDTO, ApiResponse } from '@/types/api'

interface EditBudgetLinesSectionProps {
  conventionId: number
  isEditing: boolean
}

const formatMAD = (value: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(value)

const EditBudgetLinesSection = ({ conventionId, isEditing }: EditBudgetLinesSectionProps) => {
  const [lignes, setLignes] = useState<ConventionBudgetLigneDTO[]>([])
  const [categories, setCategories] = useState<CategorieDepenseListDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCat, setSelectedCat] = useState<CategorieDepenseListDTO | null>(null)
  const [newMontant, setNewMontant] = useState(0)
  const [newDesignation, setNewDesignation] = useState('')
  const [saving, setSaving] = useState(false)

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editMontant, setEditMontant] = useState(0)
  const editMontantRef = useRef(editMontant)
  editMontantRef.current = editMontant

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [lignesRes, catsRes] = await Promise.all([
        conventionsAPI.getBudgetLignes(conventionId),
        categoriesDepensesAPI.getList(),
      ])
      const lignesData: ConventionBudgetLigneDTO[] =
        (lignesRes.data as ApiResponse<ConventionBudgetLigneDTO[]>).data ?? []
      const catsData: CategorieDepenseListDTO[] =
        (catsRes.data as ApiResponse<CategorieDepenseListDTO[]>).data ?? []
      setLignes(lignesData)
      setCategories(catsData)
    } catch {
      setError('Erreur lors du chargement des lignes de budget.')
    } finally {
      setLoading(false)
    }
  }, [conventionId])

  useEffect(() => { loadData() }, [loadData])

  const usedCategoryIds = lignes.map((l) => l.categorieDepenseId)
  const availableCategories = categories.filter((c) => !usedCategoryIds.includes(c.id))

  const handleAdd = async () => {
    if (!selectedCat || newMontant <= 0) return
    try {
      setSaving(true)
      await conventionsAPI.addBudgetLigne(conventionId, {
        categorieDepenseId: selectedCat.id,
        montant: newMontant,
        designation: newDesignation || undefined,
      })
      setSelectedCat(null)
      setNewMontant(0)
      setNewDesignation('')
      setShowAddForm(false)
      await loadData()
    } catch {
      setError('Erreur lors de l\'ajout de la ligne.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ligneId: number) => {
    try {
      await conventionsAPI.deleteBudgetLigne(conventionId, ligneId)
      await loadData()
    } catch {
      setError('Erreur lors de la suppression.')
    }
  }

  const startInlineEdit = (ligne: ConventionBudgetLigneDTO) => {
    setEditingId(ligne.id)
    setEditMontant(ligne.montant)
  }

  const saveInlineEdit = useCallback(async () => {
    if (editingId === null) return
    try {
      setSaving(true)
      await conventionsAPI.updateBudgetLigne(conventionId, editingId, { montant: editMontantRef.current })
      setEditingId(null)
      await loadData()
    } catch {
      setError('Erreur lors de la mise a jour.')
    } finally {
      setSaving(false)
    }
  }, [editingId, conventionId, loadData])

  const totalMontant = lignes.reduce((sum, l) => sum + l.montant, 0)

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
          Lignes de Depenses
        </Typography>
        {isEditing && (
          <Chip
            icon={<AddIcon sx={{ fontSize: 16 }} />}
            label="Ajouter"
            size="small"
            color="primary"
            variant="outlined"
            onClick={() => setShowAddForm(!showAddForm)}
            sx={{ cursor: 'pointer' }}
          />
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Add form */}
      {isEditing && showAddForm && (
        <Paper sx={{ p: 2, mb: 2, border: `1px solid ${colors.primary[200]}`, borderRadius: '6px' }}>
          <Autocomplete
            size="small"
            options={availableCategories}
            value={selectedCat}
            getOptionLabel={(opt) => `${opt.code} - ${opt.libelle}`}
            groupBy={(opt) => opt.categorie ?? 'Autre'}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            onChange={(_e, val) => {
              setSelectedCat(val)
              if (val) setNewDesignation(val.libelle)
            }}
            renderInput={(params) => (
              <TextField {...params} label="Categorie de depense" placeholder="Selectionner..." />
            )}
            noOptionsText="Aucune categorie disponible"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              size="small"
              label="Designation"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
            />
            <DecimalInput
              size="small"
              label="Montant (MAD)"
              value={newMontant}
              onChange={setNewMontant}
              decimalPlaces={2}
              min={0}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <IconButton size="small" onClick={() => setShowAddForm(false)} sx={{ color: colors.danger[500] }}>
              <CloseIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleAdd}
              disabled={!selectedCat || newMontant <= 0 || saving}
              sx={{ color: colors.success[600] }}
            >
              {saving ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Table */}
      {lignes.length > 0 ? (
        <TableContainer component={Paper} sx={{ ...componentStyles.table.container }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={componentStyles.table.header}>
                <TableCell sx={componentStyles.table.headerCell}>Categorie</TableCell>
                <TableCell sx={componentStyles.table.headerCell}>Designation</TableCell>
                <TableCell align="right" sx={componentStyles.table.headerCell}>Montant</TableCell>
                <TableCell align="right" sx={componentStyles.table.headerCell}>%</TableCell>
                {isEditing && (
                  <TableCell align="center" sx={{ ...componentStyles.table.headerCell, width: 80 }}>
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {lignes.map((ligne) => {
                const isLineEditing = editingId === ligne.id
                return (
                  <TableRow
                    key={ligne.id}
                    sx={{
                      ...componentStyles.table.row,
                      ...(isLineEditing ? { bgcolor: colors.warning[50] } : {}),
                      ...(isEditing && !isLineEditing ? { cursor: 'pointer', '&:hover .edit-hint': { opacity: 1 } } : {}),
                    }}
                    onClick={() => {
                      if (isEditing && !isLineEditing) startInlineEdit(ligne)
                    }}
                  >
                    <TableCell sx={componentStyles.table.cell}>
                      <Chip
                        label={ligne.categorieDepenseCode}
                        size="small"
                        variant="outlined"
                        sx={{ color: colors.primary[600], borderColor: colors.primary[200] }}
                      />
                    </TableCell>
                    <TableCell sx={componentStyles.table.cell}>
                      {ligne.designation || ligne.categorieDepenseLibelle}
                    </TableCell>
                    <TableCell align="right" sx={componentStyles.table.cell}>
                      {isLineEditing ? (
                        <DecimalInput
                          size="small"
                          value={editMontant}
                          onChange={setEditMontant}
                          decimalPlaces={2}
                          min={0}
                          sx={{ minWidth: 120 }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); setTimeout(saveInlineEdit, 0) }
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: typography.weights.semibold }}>
                          {formatMAD(ligne.montant)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={componentStyles.table.cell}>
                      {ligne.pourcentage.toFixed(1)}%
                    </TableCell>
                    {isEditing && (
                      <TableCell align="center" sx={componentStyles.table.cell}>
                        {isLineEditing ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Enregistrer">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); saveInlineEdit() }} sx={{ color: colors.success[600] }}>
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Annuler">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditingId(null) }} sx={{ color: colors.danger[500] }}>
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <EditIcon className="edit-hint" sx={{ fontSize: 16, color: colors.primary[400], opacity: 0, transition: 'opacity 0.2s' }} />
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleDelete(ligne.id) }}
                              sx={{ color: colors.danger[500] }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              {/* Total row */}
              <TableRow sx={{ bgcolor: colors.primary[25], '&:hover': { bgcolor: colors.primary[25] } }}>
                <TableCell colSpan={2} sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                  TOTAL
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.bold }}>
                  {formatMAD(totalMontant)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.bold }}>
                  {lignes.reduce((sum, l) => sum + l.pourcentage, 0).toFixed(1)}%
                </TableCell>
                {isEditing && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ py: 3, textAlign: 'center', border: `1px dashed ${colors.border}`, borderRadius: '6px' }}>
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
            Aucune ligne de depenses.
            {isEditing && ' Cliquez "Ajouter" pour creer une ligne.'}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default EditBudgetLinesSection
