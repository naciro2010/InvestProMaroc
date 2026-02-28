import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, LinearProgress,
  IconButton, Tooltip, TextField, Select, MenuItem, InputAdornment,
} from '@mui/material'
import {
  Add, Check, Close, Delete, Edit, ReceiptLong,
} from '@mui/icons-material'
import { conventionsAPI, categoriesDepensesAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type {
  ConventionBudgetLigneDTO, CategorieDepenseListDTO, ApiResponse,
} from '@/types/api'

/* ──────────────────────────── Types ──────────────────────────── */

interface InlineRow {
  id: number | null                // null → new unsaved row
  categorieDepenseId: number | null
  categorieDepenseCode: string
  categorieDepenseLibelle: string
  designation: string
  montant: string                  // kept as string for input binding
  remarques: string
}

interface ConventionBudgetLignesInlineProps {
  conventionId: number
  canEdit: boolean
  onDataChanged?: () => void
}

/* ──────────────────────────── Helpers ──────────────────────────── */

const formatMAD = (value: number): string =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'MAD', maximumFractionDigits: 0,
  }).format(value)

const parseMontant = (s: string): number => {
  const cleaned = s.replace(/\s/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

const emptyRow = (): InlineRow => ({
  id: null,
  categorieDepenseId: null,
  categorieDepenseCode: '',
  categorieDepenseLibelle: '',
  designation: '',
  montant: '',
  remarques: '',
})

/* ──────────────────────────── Styles ──────────────────────────── */

const th = {
  fontSize: typography.sizes.xs,
  fontWeight: typography.weights.semibold,
  color: colors.textSecondary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.03em',
  py: 0.75, px: 1.5,
}
const td = { fontSize: typography.sizes.xs, py: 0.5, px: 1.5 }
const tnum = { fontVariantNumeric: 'tabular-nums' as const }

/* ──────────────────────────── Component ──────────────────────────── */

const ConventionBudgetLignesInline = ({
  conventionId, canEdit, onDataChanged,
}: ConventionBudgetLignesInlineProps) => {
  const [lignes, setLignes] = useState<ConventionBudgetLigneDTO[]>([])
  const [categories, setCategories] = useState<CategorieDepenseListDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Inline editing state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<InlineRow | null>(null)
  const [newRow, setNewRow] = useState<InlineRow | null>(null)

  /* ── Load data ── */

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [lignesRes, catRes] = await Promise.all([
        conventionsAPI.getBudgetLignes(conventionId),
        categoriesDepensesAPI.getList(),
      ])
      const data: ConventionBudgetLigneDTO[] =
        (lignesRes.data as ApiResponse<ConventionBudgetLigneDTO[]>).data ?? []
      const catData: CategorieDepenseListDTO[] =
        (catRes.data as ApiResponse<CategorieDepenseListDTO[]>).data ?? []
      setLignes(data)
      setCategories(catData)
    } catch {
      setLignes([])
    } finally {
      setLoading(false)
    }
  }, [conventionId])

  useEffect(() => { loadData() }, [loadData])

  /* ── Save new line ── */

  const handleSaveNew = async () => {
    if (!newRow || !newRow.categorieDepenseId || parseMontant(newRow.montant) <= 0) return
    try {
      setSaving(true)
      await conventionsAPI.addBudgetLigne(conventionId, {
        categorieDepenseId: newRow.categorieDepenseId,
        montant: parseMontant(newRow.montant),
        designation: newRow.designation || undefined,
        remarques: newRow.remarques || undefined,
      })
      setNewRow(null)
      await loadData()
      onDataChanged?.()
    } catch {
      // silently fail – user can retry
    } finally {
      setSaving(false)
    }
  }

  /* ── Save edit ── */

  const handleSaveEdit = async () => {
    if (!editRow || editRow.id === null || parseMontant(editRow.montant) <= 0) return
    try {
      setSaving(true)
      await conventionsAPI.updateBudgetLigne(conventionId, editRow.id, {
        categorieDepenseId: editRow.categorieDepenseId ?? undefined,
        montant: parseMontant(editRow.montant),
        designation: editRow.designation || undefined,
        remarques: editRow.remarques || undefined,
      })
      setEditingId(null)
      setEditRow(null)
      await loadData()
      onDataChanged?.()
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete ── */

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette ligne de categorie de depenses ?')) return
    try {
      setSaving(true)
      await conventionsAPI.deleteBudgetLigne(conventionId, id)
      await loadData()
      onDataChanged?.()
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  /* ── Start edit ── */

  const startEdit = (ligne: ConventionBudgetLigneDTO) => {
    if (newRow) setNewRow(null) // cancel pending new row
    setEditingId(ligne.id)
    setEditRow({
      id: ligne.id,
      categorieDepenseId: ligne.categorieDepenseId,
      categorieDepenseCode: ligne.categorieDepenseCode,
      categorieDepenseLibelle: ligne.categorieDepenseLibelle,
      designation: ligne.designation ?? '',
      montant: String(ligne.montant),
      remarques: ligne.remarques ?? '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditRow(null)
  }

  /* ── Start add ── */

  const startAdd = () => {
    if (editingId) cancelEdit() // cancel pending edit
    setNewRow(emptyRow())
  }

  const cancelAdd = () => setNewRow(null)

  /* ── Category select handler ── */

  const handleCategoryChange = (
    catId: number,
    setter: (row: InlineRow) => void,
    current: InlineRow,
  ) => {
    const cat = categories.find(c => c.id === catId)
    setter({
      ...current,
      categorieDepenseId: catId,
      categorieDepenseCode: cat?.code ?? '',
      categorieDepenseLibelle: cat?.libelle ?? '',
      designation: current.designation || cat?.libelle || '',
    })
  }

  /* ── Available categories (not already used) ── */

  const usedCatIds = new Set(lignes.map(l => l.categorieDepenseId))
  const availableCategories = categories.filter(c =>
    !usedCatIds.has(c.id) || (editRow?.categorieDepenseId === c.id),
  )

  /* ── Render ── */

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={22} />
      </Box>
    )
  }

  if (lignes.length === 0 && !canEdit) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <ReceiptLong sx={{ fontSize: 36, color: colors.neutral[300], mb: 1 }} />
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          Aucune repartition par categorie de depenses
        </Typography>
      </Box>
    )
  }

  const totalMontant = lignes.reduce((sum, l) => sum + l.montant, 0)
  const maxMontant = Math.max(...lignes.map(l => l.montant), 1)

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: colors.neutral[50] }}>
            <TableCell sx={th}>Categorie</TableCell>
            <TableCell sx={th}>Designation</TableCell>
            <TableCell align="right" sx={th}>Montant</TableCell>
            <TableCell align="right" sx={{ ...th, width: 55 }}>Part</TableCell>
            <TableCell sx={{ ...th, width: 100 }}>Repartition</TableCell>
            {canEdit && <TableCell align="center" sx={{ ...th, width: 80 }}>Actions</TableCell>}
          </TableRow>
        </TableHead>

        <TableBody>
          {/* ─── Existing rows ─── */}
          {lignes.map(ligne => {
            const isEditing = editingId === ligne.id
            const barW = totalMontant > 0 ? (ligne.montant / maxMontant) * 100 : 0
            const pct = totalMontant > 0 ? (ligne.montant / totalMontant) * 100 : 0

            if (isEditing && editRow) {
              return (
                <TableRow key={ligne.id} sx={{ bgcolor: colors.primary[25] }}>
                  <TableCell sx={td}>
                    <Select
                      size="small"
                      value={editRow.categorieDepenseId ?? ''}
                      onChange={e => handleCategoryChange(
                        Number(e.target.value), r => setEditRow(r), editRow,
                      )}
                      sx={{ minWidth: 120, fontSize: typography.sizes.xs }}
                      displayEmpty
                    >
                      {categories.map(c => (
                        <MenuItem key={c.id} value={c.id} sx={{ fontSize: typography.sizes.xs }}>
                          <Chip label={c.code} size="small" variant="outlined"
                            sx={{ mr: 1, height: 18, fontSize: '10px', color: colors.primary[600], borderColor: colors.primary[200] }} />
                          {c.libelle}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell sx={td}>
                    <TextField
                      size="small" fullWidth variant="outlined"
                      value={editRow.designation}
                      onChange={e => setEditRow({ ...editRow, designation: e.target.value })}
                      placeholder="Designation"
                      sx={{ '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.5 } }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={td}>
                    <TextField
                      size="small" variant="outlined"
                      value={editRow.montant}
                      onChange={e => setEditRow({ ...editRow, montant: e.target.value })}
                      placeholder="0"
                      InputProps={{
                        endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '10px' }}>MAD</Typography></InputAdornment>,
                      }}
                      sx={{
                        width: 140,
                        '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.5, textAlign: 'right' },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={td} />
                  <TableCell sx={td} />
                  <TableCell align="center" sx={td}>
                    <Tooltip title="Enregistrer">
                      <IconButton size="small" onClick={handleSaveEdit}
                        disabled={saving || parseMontant(editRow.montant) <= 0}>
                        <Check sx={{ fontSize: 16, color: colors.success[600] }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Annuler">
                      <IconButton size="small" onClick={cancelEdit} disabled={saving}>
                        <Close sx={{ fontSize: 16, color: colors.neutral[500] }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            }

            return (
              <TableRow
                key={ligne.id}
                sx={{
                  ...componentStyles.table.row,
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: colors.neutral[50] },
                }}
              >
                <TableCell sx={td}>
                  <Chip label={ligne.categorieDepenseCode} size="small" variant="outlined"
                    sx={{ color: colors.primary[600], borderColor: colors.primary[200], fontSize: '10px', height: 20 }} />
                </TableCell>
                <TableCell sx={td}>
                  <Typography sx={{ fontSize: typography.sizes.sm }}>
                    {ligne.designation || ligne.categorieDepenseLibelle}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={td}>
                  <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, ...tnum }}>
                    {formatMAD(ligne.montant)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={td}>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, ...tnum }}>
                    {pct.toFixed(1)}%
                  </Typography>
                </TableCell>
                <TableCell sx={td}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LinearProgress variant="determinate" value={barW}
                      sx={{
                        flex: 1, height: 5, borderRadius: 3,
                        bgcolor: colors.neutral[100],
                        '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: colors.primary[400] },
                      }} />
                  </Box>
                </TableCell>
                {canEdit && (
                  <TableCell align="center" sx={td}>
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => startEdit(ligne)} disabled={saving}>
                        <Edit sx={{ fontSize: 14, color: colors.neutral[500] }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" onClick={() => handleDelete(ligne.id)} disabled={saving}>
                        <Delete sx={{ fontSize: 14, color: colors.danger[400] }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            )
          })}

          {/* ─── New row (inline add) ─── */}
          {newRow && (
            <TableRow sx={{ bgcolor: colors.success[25] }}>
              <TableCell sx={td}>
                <Select
                  size="small"
                  value={newRow.categorieDepenseId ?? ''}
                  onChange={e => handleCategoryChange(
                    Number(e.target.value), r => setNewRow(r), newRow,
                  )}
                  sx={{ minWidth: 120, fontSize: typography.sizes.xs }}
                  displayEmpty
                  renderValue={(val) => {
                    if (!val) return <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Categorie...</Typography>
                    const cat = categories.find(c => c.id === val)
                    return cat ? cat.code : ''
                  }}
                >
                  {availableCategories.map(c => (
                    <MenuItem key={c.id} value={c.id} sx={{ fontSize: typography.sizes.xs }}>
                      <Chip label={c.code} size="small" variant="outlined"
                        sx={{ mr: 1, height: 18, fontSize: '10px', color: colors.primary[600], borderColor: colors.primary[200] }} />
                      {c.libelle}
                    </MenuItem>
                  ))}
                  {availableCategories.length === 0 && (
                    <MenuItem disabled sx={{ fontSize: typography.sizes.xs }}>
                      Toutes les categories sont deja utilisees
                    </MenuItem>
                  )}
                </Select>
              </TableCell>
              <TableCell sx={td}>
                <TextField
                  size="small" fullWidth variant="outlined"
                  value={newRow.designation}
                  onChange={e => setNewRow({ ...newRow, designation: e.target.value })}
                  placeholder="Designation (optionnel)"
                  sx={{ '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.5 } }}
                />
              </TableCell>
              <TableCell align="right" sx={td}>
                <TextField
                  size="small" variant="outlined"
                  value={newRow.montant}
                  onChange={e => setNewRow({ ...newRow, montant: e.target.value })}
                  placeholder="0"
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '10px' }}>MAD</Typography></InputAdornment>,
                  }}
                  sx={{
                    width: 140,
                    '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.5, textAlign: 'right' },
                  }}
                  autoFocus
                />
              </TableCell>
              <TableCell sx={td} />
              <TableCell sx={td} />
              <TableCell align="center" sx={td}>
                <Tooltip title="Enregistrer">
                  <IconButton size="small" onClick={handleSaveNew}
                    disabled={saving || !newRow.categorieDepenseId || parseMontant(newRow.montant) <= 0}>
                    <Check sx={{ fontSize: 16, color: colors.success[600] }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Annuler">
                  <IconButton size="small" onClick={cancelAdd} disabled={saving}>
                    <Close sx={{ fontSize: 16, color: colors.neutral[500] }} />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          )}

          {/* ─── Total row ─── */}
          {lignes.length > 0 && (
            <TableRow sx={{ bgcolor: colors.primary[25] }}>
              <TableCell colSpan={2} sx={{ ...td, fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                Total ({lignes.length} categorie{lignes.length > 1 ? 's' : ''})
              </TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, ...tnum }}>
                {formatMAD(totalMontant)}
              </TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold }}>100%</TableCell>
              <TableCell sx={td} />
              {canEdit && <TableCell sx={td} />}
            </TableRow>
          )}

          {/* ─── "Ajouter une ligne" row ─── */}
          {canEdit && !newRow && (
            <TableRow
              onClick={startAdd}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] }, '& td': { borderBottom: 0 } }}
            >
              <TableCell colSpan={canEdit ? 6 : 5} sx={td}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Add sx={{ fontSize: 14, color: colors.primary[500] }} />
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.primary[600] }}>
                    Ajouter une categorie de depenses
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ConventionBudgetLignesInline
