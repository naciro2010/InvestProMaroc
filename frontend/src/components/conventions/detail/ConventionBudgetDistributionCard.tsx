import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, TextField, Select,
  MenuItem, Chip, CircularProgress, Collapse, InputAdornment,
} from '@mui/material'
import {
  Add, Check, Close, Delete, Edit, ExpandMore, ExpandLess,
  ReceiptLong, AccountTree,
} from '@mui/icons-material'
import { conventionsAPI, categoriesDepensesAPI, projetsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'
import type {
  ConventionBudgetLigneDTO, BudgetLigneImputationDTO,
  BudgetLigneWithImputationsDTO, CategorieDepenseListDTO, ApiResponse,
} from '@/types/api'

/* ──────────────────── Types ──────────────────── */

interface ProjetOption { id: number; code: string; nom: string }

interface InlineRow {
  id: number | null
  categorieDepenseId: number | null
  categorieDepenseCode: string
  categorieDepenseLibelle: string
  designation: string
  montant: string
  remarques: string
}

interface InlineImputRow {
  id: number | null
  projetId: number | null
  projetCode: string
  projetLibelle: string
  pourcentage: string
}

interface Props {
  conventionId: number
  canEdit: boolean
  onDataChanged?: () => void
}

/* ──────────────────── Helpers ──────────────────── */

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)

const parseMontant = (s: string): number => {
  const cleaned = s.replace(/\s/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

const emptyRow = (): InlineRow => ({
  id: null, categorieDepenseId: null, categorieDepenseCode: '',
  categorieDepenseLibelle: '', designation: '', montant: '', remarques: '',
})

const emptyImputRow = (): InlineImputRow => ({
  id: null, projetId: null, projetCode: '', projetLibelle: '', pourcentage: '',
})

/* ──────────────────── Styles ──────────────────── */

const th = {
  fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold,
  color: colors.textSecondary, textTransform: 'uppercase' as const,
  letterSpacing: '0.03em', py: 0.75, px: 1,
}
const td = { fontSize: typography.sizes.xs, py: 0.5, px: 1 }
const tnum = { fontVariantNumeric: 'tabular-nums' as const }
const impChip = {
  height: 20, fontSize: '10px', mr: 0.5, mb: 0.25,
  borderColor: colors.primary[200], color: colors.primary[700],
}

/* ──────────────────── Component ──────────────────── */

const ConventionBudgetDistributionCard = ({ conventionId, canEdit, onDataChanged }: Props) => {
  const [distribution, setDistribution] = useState<BudgetLigneWithImputationsDTO[]>([])
  const [categories, setCategories] = useState<CategorieDepenseListDTO[]>([])
  const [projets, setProjets] = useState<ProjetOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Ligne editing
  const [editingLigneId, setEditingLigneId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<InlineRow | null>(null)
  const [newRow, setNewRow] = useState<InlineRow | null>(null)

  // Imputation editing
  const [expandedLigneId, setExpandedLigneId] = useState<number | null>(null)
  const [editingImputId, setEditingImputId] = useState<number | null>(null)
  const [editImputRow, setEditImputRow] = useState<InlineImputRow | null>(null)
  const [newImputRow, setNewImputRow] = useState<InlineImputRow | null>(null)
  const [newImputLigneId, setNewImputLigneId] = useState<number | null>(null)

  /* ── Load data ── */

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [distRes, catRes, projRes] = await Promise.all([
        conventionsAPI.getBudgetDistribution(conventionId),
        categoriesDepensesAPI.getList(),
        projetsAPI.getAll(),
      ])
      const distData = (distRes.data as ApiResponse<BudgetLigneWithImputationsDTO[]>).data ?? []
      const catData = (catRes.data as ApiResponse<CategorieDepenseListDTO[]>).data ?? []
      const projData: ProjetOption[] = ((projRes.data as ApiResponse<ProjetOption[]>).data ?? [])
        .map((p: ProjetOption) => ({ id: p.id, code: p.code, nom: p.nom }))
      setDistribution(distData)
      setCategories(catData)
      setProjets(projData)
    } catch {
      setDistribution([])
    } finally {
      setLoading(false)
    }
  }, [conventionId])

  useEffect(() => { loadData() }, [loadData])

  /* ══════════════════ LIGNE CRUD ══════════════════ */

  const handleSaveNewLigne = async () => {
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
    } catch { /* */ } finally { setSaving(false) }
  }

  const handleSaveEditLigne = async () => {
    if (!editRow || editRow.id === null || parseMontant(editRow.montant) <= 0) return
    try {
      setSaving(true)
      await conventionsAPI.updateBudgetLigne(conventionId, editRow.id, {
        categorieDepenseId: editRow.categorieDepenseId ?? undefined,
        montant: parseMontant(editRow.montant),
        designation: editRow.designation || undefined,
        remarques: editRow.remarques || undefined,
      })
      setEditingLigneId(null); setEditRow(null)
      await loadData()
      onDataChanged?.()
    } catch { /* */ } finally { setSaving(false) }
  }

  const handleDeleteLigne = async (id: number) => {
    if (!window.confirm('Supprimer cette ligne de budget ?')) return
    try {
      setSaving(true)
      await conventionsAPI.deleteBudgetLigne(conventionId, id)
      await loadData()
      onDataChanged?.()
    } catch { /* */ } finally { setSaving(false) }
  }

  const startEditLigne = (ligne: ConventionBudgetLigneDTO) => {
    if (newRow) setNewRow(null)
    setEditingLigneId(ligne.id)
    setEditRow({
      id: ligne.id, categorieDepenseId: ligne.categorieDepenseId,
      categorieDepenseCode: ligne.categorieDepenseCode,
      categorieDepenseLibelle: ligne.categorieDepenseLibelle,
      designation: ligne.designation ?? '', montant: String(ligne.montant), remarques: ligne.remarques ?? '',
    })
  }

  const handleCategoryChange = (catId: number, setter: (r: InlineRow) => void, current: InlineRow) => {
    const cat = categories.find(c => c.id === catId)
    setter({ ...current, categorieDepenseId: catId, categorieDepenseCode: cat?.code ?? '',
      categorieDepenseLibelle: cat?.libelle ?? '', designation: current.designation || cat?.libelle || '' })
  }

  /* ══════════════════ IMPUTATION CRUD ══════════════════ */

  const handleSaveNewImput = async () => {
    if (!newImputRow || !newImputRow.projetId || !newImputLigneId) return
    const pct = parseMontant(newImputRow.pourcentage)
    if (pct <= 0 || pct > 100) return
    try {
      setSaving(true)
      await conventionsAPI.addBudgetLigneImputation(conventionId, newImputLigneId, {
        projetId: newImputRow.projetId,
        projetCode: newImputRow.projetCode,
        projetLibelle: newImputRow.projetLibelle || undefined,
        pourcentage: pct,
      })
      setNewImputRow(null); setNewImputLigneId(null)
      await loadData()
      onDataChanged?.()
    } catch { /* */ } finally { setSaving(false) }
  }

  const handleSaveEditImput = async (ligneId: number) => {
    if (!editImputRow || editImputRow.id === null) return
    const pct = parseMontant(editImputRow.pourcentage)
    if (pct <= 0 || pct > 100) return
    try {
      setSaving(true)
      await conventionsAPI.updateBudgetLigneImputation(conventionId, ligneId, editImputRow.id, {
        pourcentage: pct,
      })
      setEditingImputId(null); setEditImputRow(null)
      await loadData()
      onDataChanged?.()
    } catch { /* */ } finally { setSaving(false) }
  }

  const handleDeleteImput = async (ligneId: number, imputId: number) => {
    if (!window.confirm('Supprimer cette imputation ?')) return
    try {
      setSaving(true)
      await conventionsAPI.deleteBudgetLigneImputation(conventionId, ligneId, imputId)
      await loadData()
      onDataChanged?.()
    } catch { /* */ } finally { setSaving(false) }
  }

  const startEditImput = (imp: BudgetLigneImputationDTO) => {
    setEditingImputId(imp.id)
    setEditImputRow({
      id: imp.id, projetId: imp.projetId, projetCode: imp.projetCode,
      projetLibelle: imp.projetLibelle ?? '', pourcentage: String(imp.pourcentage),
    })
  }

  const startAddImput = (ligneId: number) => {
    setNewImputLigneId(ligneId)
    setNewImputRow(emptyImputRow())
    setExpandedLigneId(ligneId)
  }

  const handleProjetChange = (projetId: number) => {
    const p = projets.find(pr => pr.id === projetId)
    if (!p || !newImputRow) return
    setNewImputRow({ ...newImputRow, projetId: p.id, projetCode: p.code, projetLibelle: p.nom })
  }

  /* ── Derived ── */

  const usedCatIds = new Set(distribution.map(d => d.budgetLigne.categorieDepenseId))
  const availableCategories = categories.filter(c =>
    !usedCatIds.has(c.id) || (editRow?.categorieDepenseId === c.id))

  const totalBudget = distribution.reduce((s, d) => s + d.budgetLigne.montant, 0)

  /* ── Render ── */

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={22} />
      </Box>
    )
  }

  if (distribution.length === 0 && !canEdit) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <ReceiptLong sx={{ fontSize: 36, color: colors.neutral[300], mb: 1 }} />
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          Aucune repartition par categorie de depenses
        </Typography>
      </Box>
    )
  }

  // Column count for colSpan
  const colCount = canEdit ? 7 : 5

  return (
    <TableContainer>
      <Table size="small">
        {/* ══════ HEADER ══════ */}
        <TableHead>
          <TableRow sx={{ bgcolor: colors.neutral[50] }}>
            <TableCell sx={{ ...th, width: 32 }} />
            <TableCell sx={th}>Libelle</TableCell>
            <TableCell align="right" sx={th}>Budget (convention)</TableCell>
            <TableCell sx={{ ...th, minWidth: 180 }}>Imputation</TableCell>
            <TableCell align="right" sx={{ ...th, width: 60 }}>Part</TableCell>
            {canEdit && <TableCell align="center" sx={{ ...th, width: 60 }}>Actions</TableCell>}
            {canEdit && <TableCell align="center" sx={{ ...th, width: 40 }}>Imp.</TableCell>}
          </TableRow>
        </TableHead>

        <TableBody>
          {/* ══════ DATA ROWS ══════ */}
          {distribution.map(item => {
            const ligne = item.budgetLigne
            const imputations = item.imputations
            const isEditing = editingLigneId === ligne.id
            const isExpanded = expandedLigneId === ligne.id
            const pct = totalBudget > 0 ? (ligne.montant / totalBudget) * 100 : 0
            const totalImputPct = item.totalPourcentageImpute
            const hasImputations = imputations.length > 0

            return (
              <Box key={ligne.id} component="tbody">
                {/* ── Main row ── */}
                {isEditing && editRow ? (
                  <TableRow sx={{ bgcolor: colors.primary[25] }}>
                    <TableCell sx={td} />
                    <TableCell sx={td}>
                      <Select size="small" value={editRow.categorieDepenseId ?? ''} displayEmpty
                        onChange={e => handleCategoryChange(Number(e.target.value), r => setEditRow(r), editRow)}
                        sx={{ minWidth: 120, fontSize: typography.sizes.xs }}>
                        {categories.map(c => (
                          <MenuItem key={c.id} value={c.id} sx={{ fontSize: typography.sizes.xs }}>
                            <Chip label={c.code} size="small" variant="outlined" sx={{ ...impChip, mr: 1 }} />
                            {c.libelle}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell align="right" sx={td}>
                      <TextField size="small" variant="outlined" value={editRow.montant}
                        onChange={e => setEditRow({ ...editRow, montant: e.target.value })} placeholder="0"
                        InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '10px' }}>MAD</Typography></InputAdornment> }}
                        sx={{ width: 140, '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.5, textAlign: 'right' } }} />
                    </TableCell>
                    <TableCell sx={td} />
                    <TableCell sx={td} />
                    <TableCell align="center" sx={td}>
                      <IconButton size="small" onClick={handleSaveEditLigne} disabled={saving || parseMontant(editRow.montant) <= 0}>
                        <Check sx={{ fontSize: 16, color: colors.success[600] }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => { setEditingLigneId(null); setEditRow(null) }} disabled={saving}>
                        <Close sx={{ fontSize: 16, color: colors.neutral[500] }} />
                      </IconButton>
                    </TableCell>
                    <TableCell sx={td} />
                  </TableRow>
                ) : (
                  <TableRow sx={{ transition: 'all 0.15s ease', '&:hover': { bgcolor: colors.neutral[50] } }}>
                    {/* Expand toggle */}
                    <TableCell sx={{ ...td, px: 0.5 }}>
                      {hasImputations ? (
                        <IconButton size="small" onClick={() => setExpandedLigneId(isExpanded ? null : ligne.id)}>
                          {isExpanded
                            ? <ExpandLess sx={{ fontSize: 16, color: colors.neutral[500] }} />
                            : <ExpandMore sx={{ fontSize: 16, color: colors.neutral[500] }} />}
                        </IconButton>
                      ) : (
                        <Box sx={{ width: 28 }} />
                      )}
                    </TableCell>

                    {/* Libelle */}
                    <TableCell sx={td}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Chip label={ligne.categorieDepenseCode} size="small" variant="outlined"
                          sx={{ color: colors.primary[600], borderColor: colors.primary[200], fontSize: '10px', height: 20 }} />
                        <Typography sx={{ fontSize: typography.sizes.sm }}>
                          {ligne.designation || ligne.categorieDepenseLibelle}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Budget */}
                    <TableCell align="right" sx={td}>
                      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, ...tnum }}>
                        {fmt(ligne.montant)}
                      </Typography>
                    </TableCell>

                    {/* Imputation tags */}
                    <TableCell sx={td}>
                      {hasImputations ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
                          {imputations.map(imp => (
                            <Chip key={imp.id} size="small" variant="outlined"
                              label={`${imp.pourcentage}% ${imp.projetCode}`}
                              sx={impChip} />
                          ))}
                          {totalImputPct < 100 && (
                            <Chip size="small" variant="outlined"
                              label={`${(100 - totalImputPct).toFixed(1)}% non impute`}
                              sx={{ ...impChip, borderColor: colors.warning[300], color: colors.warning[700], borderStyle: 'dashed' }} />
                          )}
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: '10px', color: colors.textSecondary, fontStyle: 'italic' }}>
                          Aucune imputation
                        </Typography>
                      )}
                    </TableCell>

                    {/* Part % */}
                    <TableCell align="right" sx={td}>
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, ...tnum }}>
                        {pct.toFixed(1)}%
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    {canEdit && (
                      <TableCell align="center" sx={td}>
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => startEditLigne(ligne)} disabled={saving}>
                            <Edit sx={{ fontSize: 14, color: colors.neutral[500] }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" onClick={() => handleDeleteLigne(ligne.id)} disabled={saving}>
                            <Delete sx={{ fontSize: 14, color: colors.danger[400] }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}

                    {/* Add imputation button */}
                    {canEdit && (
                      <TableCell align="center" sx={td}>
                        <Tooltip title="Ajouter une imputation">
                          <IconButton size="small" onClick={() => startAddImput(ligne.id)} disabled={saving}>
                            <AccountTree sx={{ fontSize: 14, color: colors.primary[500] }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                )}

                {/* ── Imputation detail rows (collapsible) ── */}
                <TableRow>
                  <TableCell colSpan={colCount} sx={{ py: 0, px: 0, borderBottom: isExpanded ? undefined : 0 }}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box sx={{ pl: 5, pr: 1, py: 0.5, bgcolor: colors.primary[25], borderLeft: `3px solid ${colors.primary[200]}` }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ ...th, fontSize: '10px', py: 0.25 }}>Projet</TableCell>
                              <TableCell align="right" sx={{ ...th, fontSize: '10px', py: 0.25, width: 80 }}>%</TableCell>
                              <TableCell align="right" sx={{ ...th, fontSize: '10px', py: 0.25, width: 120 }}>Montant</TableCell>
                              {canEdit && <TableCell align="center" sx={{ ...th, fontSize: '10px', py: 0.25, width: 70 }}>Actions</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {imputations.map(imp => {
                              const isEditingImp = editingImputId === imp.id
                              if (isEditingImp && editImputRow) {
                                return (
                                  <TableRow key={imp.id} sx={{ bgcolor: colors.primary[50] }}>
                                    <TableCell sx={{ ...td, fontSize: '11px' }}>
                                      <Typography sx={{ fontSize: '11px', fontWeight: typography.weights.medium }}>
                                        {imp.projetCode} - {imp.projetLibelle}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={td}>
                                      <TextField size="small" variant="outlined" value={editImputRow.pourcentage}
                                        onChange={e => setEditImputRow({ ...editImputRow, pourcentage: e.target.value })}
                                        InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '9px' }}>%</Typography></InputAdornment> }}
                                        sx={{ width: 80, '& .MuiInputBase-input': { fontSize: '11px', py: 0.25, textAlign: 'right' } }}
                                        autoFocus />
                                    </TableCell>
                                    <TableCell sx={td} />
                                    <TableCell align="center" sx={td}>
                                      <IconButton size="small" onClick={() => handleSaveEditImput(ligne.id)}
                                        disabled={saving || parseMontant(editImputRow.pourcentage) <= 0}>
                                        <Check sx={{ fontSize: 14, color: colors.success[600] }} />
                                      </IconButton>
                                      <IconButton size="small" onClick={() => { setEditingImputId(null); setEditImputRow(null) }} disabled={saving}>
                                        <Close sx={{ fontSize: 14, color: colors.neutral[500] }} />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                )
                              }
                              return (
                                <TableRow key={imp.id} sx={{ '&:hover': { bgcolor: colors.primary[50] } }}>
                                  <TableCell sx={{ ...td, fontSize: '11px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Chip label={imp.projetCode} size="small" variant="outlined"
                                        sx={{ height: 18, fontSize: '9px', color: colors.primary[700], borderColor: colors.primary[200] }} />
                                      <Typography sx={{ fontSize: '11px', color: colors.textPrimary }}>
                                        {imp.projetLibelle}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right" sx={td}>
                                    <Typography sx={{ fontSize: '11px', fontWeight: typography.weights.semibold, color: colors.primary[700], ...tnum }}>
                                      {imp.pourcentage}%
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right" sx={td}>
                                    <Typography sx={{ fontSize: '11px', ...tnum }}>{fmt(imp.montant)}</Typography>
                                  </TableCell>
                                  {canEdit && (
                                    <TableCell align="center" sx={td}>
                                      <IconButton size="small" onClick={() => startEditImput(imp)} disabled={saving}>
                                        <Edit sx={{ fontSize: 12, color: colors.neutral[500] }} />
                                      </IconButton>
                                      <IconButton size="small" onClick={() => handleDeleteImput(ligne.id, imp.id)} disabled={saving}>
                                        <Delete sx={{ fontSize: 12, color: colors.danger[400] }} />
                                      </IconButton>
                                    </TableCell>
                                  )}
                                </TableRow>
                              )
                            })}

                            {/* New imputation inline row */}
                            {newImputLigneId === ligne.id && newImputRow && (
                              <TableRow sx={{ bgcolor: colors.success[25] }}>
                                <TableCell sx={td}>
                                  <Select size="small" value={newImputRow.projetId ?? ''}
                                    onChange={e => handleProjetChange(Number(e.target.value))}
                                    displayEmpty sx={{ minWidth: 160, fontSize: '11px' }}
                                    renderValue={(val) => {
                                      if (!val) return <Typography sx={{ fontSize: '11px', color: colors.textSecondary }}>Projet...</Typography>
                                      const p = projets.find(pr => pr.id === val)
                                      return p ? `${p.code} - ${p.nom}` : ''
                                    }}>
                                    {projets.filter(p => !imputations.some(imp => imp.projetCode === p.code)).map(p => (
                                      <MenuItem key={p.id} value={p.id} sx={{ fontSize: '11px' }}>
                                        <Chip label={p.code} size="small" variant="outlined"
                                          sx={{ mr: 0.5, height: 16, fontSize: '9px', color: colors.primary[600], borderColor: colors.primary[200] }} />
                                        {p.nom}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </TableCell>
                                <TableCell align="right" sx={td}>
                                  <TextField size="small" variant="outlined" value={newImputRow.pourcentage}
                                    onChange={e => setNewImputRow({ ...newImputRow, pourcentage: e.target.value })}
                                    placeholder="0" autoFocus
                                    InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '9px' }}>%</Typography></InputAdornment> }}
                                    sx={{ width: 80, '& .MuiInputBase-input': { fontSize: '11px', py: 0.25, textAlign: 'right' } }} />
                                </TableCell>
                                <TableCell sx={td} />
                                {canEdit && (
                                  <TableCell align="center" sx={td}>
                                    <IconButton size="small" onClick={handleSaveNewImput}
                                      disabled={saving || !newImputRow.projetId || parseMontant(newImputRow.pourcentage) <= 0}>
                                      <Check sx={{ fontSize: 14, color: colors.success[600] }} />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => { setNewImputRow(null); setNewImputLigneId(null) }} disabled={saving}>
                                      <Close sx={{ fontSize: 14, color: colors.neutral[500] }} />
                                    </IconButton>
                                  </TableCell>
                                )}
                              </TableRow>
                            )}

                            {/* Imputation total row */}
                            {imputations.length > 0 && (
                              <TableRow sx={{ bgcolor: colors.primary[25] }}>
                                <TableCell sx={{ ...td, fontSize: '10px', fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                                  Total impute
                                </TableCell>
                                <TableCell align="right" sx={{ ...td, fontSize: '10px', fontWeight: typography.weights.bold, color: colors.primary[700], ...tnum }}>
                                  {totalImputPct}%
                                </TableCell>
                                <TableCell align="right" sx={{ ...td, fontSize: '10px', fontWeight: typography.weights.bold, ...tnum }}>
                                  {fmt(imputations.reduce((s, i) => s + i.montant, 0))}
                                </TableCell>
                                {canEdit && <TableCell sx={td} />}
                              </TableRow>
                            )}

                            {/* Add imputation inline link */}
                            {canEdit && newImputLigneId !== ligne.id && (
                              <TableRow onClick={() => startAddImput(ligne.id)}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.primary[50] }, '& td': { borderBottom: 0 } }}>
                                <TableCell colSpan={canEdit ? 4 : 3} sx={{ ...td, fontSize: '10px' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Add sx={{ fontSize: 12, color: colors.primary[500] }} />
                                    <Typography sx={{ fontSize: '10px', color: colors.primary[600] }}>
                                      Ajouter une imputation projet
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </Box>
            )
          })}

          {/* ══════ NEW LIGNE ROW ══════ */}
          {newRow && (
            <TableRow sx={{ bgcolor: colors.success[25] }}>
              <TableCell sx={td} />
              <TableCell sx={td}>
                <Select size="small" value={newRow.categorieDepenseId ?? ''} displayEmpty
                  onChange={e => handleCategoryChange(Number(e.target.value), r => setNewRow(r), newRow)}
                  sx={{ minWidth: 140, fontSize: typography.sizes.xs }}
                  renderValue={(val) => {
                    if (!val) return <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Categorie...</Typography>
                    const cat = categories.find(c => c.id === val)
                    return cat ? cat.code : ''
                  }}>
                  {availableCategories.map(c => (
                    <MenuItem key={c.id} value={c.id} sx={{ fontSize: typography.sizes.xs }}>
                      <Chip label={c.code} size="small" variant="outlined" sx={{ ...impChip, mr: 1 }} /> {c.libelle}
                    </MenuItem>
                  ))}
                  {availableCategories.length === 0 && (
                    <MenuItem disabled sx={{ fontSize: typography.sizes.xs }}>Toutes les categories sont utilisees</MenuItem>
                  )}
                </Select>
              </TableCell>
              <TableCell align="right" sx={td}>
                <TextField size="small" variant="outlined" value={newRow.montant}
                  onChange={e => setNewRow({ ...newRow, montant: e.target.value })} placeholder="0" autoFocus
                  InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '10px' }}>MAD</Typography></InputAdornment> }}
                  sx={{ width: 140, '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.5, textAlign: 'right' } }} />
              </TableCell>
              <TableCell sx={td} />
              <TableCell sx={td} />
              <TableCell align="center" sx={td}>
                <IconButton size="small" onClick={handleSaveNewLigne}
                  disabled={saving || !newRow.categorieDepenseId || parseMontant(newRow.montant) <= 0}>
                  <Check sx={{ fontSize: 16, color: colors.success[600] }} />
                </IconButton>
                <IconButton size="small" onClick={() => setNewRow(null)} disabled={saving}>
                  <Close sx={{ fontSize: 16, color: colors.neutral[500] }} />
                </IconButton>
              </TableCell>
              <TableCell sx={td} />
            </TableRow>
          )}

          {/* ══════ TOTAL ROW ══════ */}
          {distribution.length > 0 && (
            <TableRow sx={{ bgcolor: colors.primary[25] }}>
              <TableCell sx={td} />
              <TableCell sx={{ ...td, fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                Total ({distribution.length} categorie{distribution.length > 1 ? 's' : ''})
              </TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, ...tnum }}>
                {fmt(totalBudget)}
              </TableCell>
              <TableCell sx={td}>
                {(() => {
                  const allImps = distribution.flatMap(d => d.imputations)
                  const byProjet = new Map<string, number>()
                  allImps.forEach(imp => byProjet.set(imp.projetCode, (byProjet.get(imp.projetCode) ?? 0) + imp.montant))
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
                      {Array.from(byProjet.entries()).map(([code, montant]) => (
                        <Chip key={code} size="small" variant="outlined"
                          label={`${code}: ${fmt(montant)}`}
                          sx={{ ...impChip, borderColor: colors.success[300], color: colors.success[700] }} />
                      ))}
                    </Box>
                  )
                })()}
              </TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold }}>100%</TableCell>
              {canEdit && <TableCell sx={td} />}
              {canEdit && <TableCell sx={td} />}
            </TableRow>
          )}

          {/* ══════ ADD LINE TRIGGER ══════ */}
          {canEdit && !newRow && (
            <TableRow onClick={() => { if (editingLigneId) { setEditingLigneId(null); setEditRow(null) }; setNewRow(emptyRow()) }}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] }, '& td': { borderBottom: 0 } }}>
              <TableCell colSpan={colCount} sx={td}>
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

export default ConventionBudgetDistributionCard
