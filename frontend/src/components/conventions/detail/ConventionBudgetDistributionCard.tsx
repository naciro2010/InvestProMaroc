import { useState, useEffect, useCallback, type ChangeEvent } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, TextField, Select,
  MenuItem, Chip, CircularProgress, InputAdornment, type SelectChangeEvent,
} from '@mui/material'
import { Add, Check, Close, Delete, Edit, ReceiptLong } from '@mui/icons-material'
import { conventionsAPI, categoriesDepensesAPI, projetsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'
import BudgetImputationChips from './BudgetImputationChips'
import type {
  BudgetLigneWithImputationsDTO, BudgetDistributionResponse,
  CategorieDepenseListDTO, ApiResponse,
} from '@/types/api'

/* ──── Types ──── */

interface ProjetOption { id: number; code: string; nom: string }

interface Props {
  conventionId: number
  canEdit: boolean
  onDataChanged?: () => void
}

/* ──── Helpers ──── */

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)

const parseMontant = (s: string): number => {
  const cleaned = s.replace(/\s/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

/* ──── Styles ──── */

const thBase = {
  fontSize: '10px', fontWeight: typography.weights.semibold,
  color: colors.textSecondary, textTransform: 'uppercase' as const,
  letterSpacing: '0.03em', py: 0.5, px: 1, whiteSpace: 'nowrap' as const,
}
const td = { fontSize: typography.sizes.xs, py: 0.5, px: 1 }
const tnum = { fontVariantNumeric: 'tabular-nums' as const }
const montantCol = { ...td, ...tnum, whiteSpace: 'nowrap' as const }

/* ──── Component ──── */

const ConventionBudgetDistributionCard = ({ conventionId, canEdit, onDataChanged }: Props) => {
  const [distribution, setDistribution] = useState<BudgetLigneWithImputationsDTO[]>([])
  const [categories, setCategories] = useState<CategorieDepenseListDTO[]>([])
  const [projets, setProjets] = useState<ProjetOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editMontant, setEditMontant] = useState('')
  const [newRow, setNewRow] = useState<{ catId: number | null; montant: string } | null>(null)

  // Convention-level totals computed from marchés/décomptes
  const [convTotals, setConvTotals] = useState({ engagement: 0, depenses: 0, resteAEngager: 0, resteAPayer: 0 })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [distRes, catRes, projRes] = await Promise.all([
        conventionsAPI.getBudgetDistribution(conventionId),
        categoriesDepensesAPI.getList(),
        projetsAPI.getByConvention(conventionId),
      ])
      const distData = (distRes.data as ApiResponse<BudgetDistributionResponse>).data
      setDistribution(distData?.lignes ?? [])
      setConvTotals({
        engagement: distData?.totalEngagement ?? 0,
        depenses: distData?.totalDepenses ?? 0,
        resteAEngager: distData?.totalResteAEngager ?? 0,
        resteAPayer: distData?.totalResteAPayer ?? 0,
      })
      setCategories((catRes.data as ApiResponse<CategorieDepenseListDTO[]>).data ?? [])
      const projList = (projRes.data as ProjetOption[] | undefined) ?? ((projRes.data as ApiResponse<ProjetOption[]>).data ?? [])
      setProjets(
        (Array.isArray(projList) ? projList : []).map((p: ProjetOption) => ({ id: p.id, code: p.code, nom: p.nom }))
      )
    } catch { setDistribution([]) }
    finally { setLoading(false) }
  }, [conventionId])

  useEffect(() => { loadData() }, [loadData])

  const refresh = async () => { await loadData(); onDataChanged?.() }

  /* ── CRUD: Ligne ── */

  const handleSaveNew = async () => {
    if (!newRow?.catId || parseMontant(newRow.montant) <= 0) return
    setSaving(true)
    try {
      await conventionsAPI.addBudgetLigne(conventionId, {
        categorieDepenseId: newRow.catId, montant: parseMontant(newRow.montant),
      })
      setNewRow(null); await refresh()
    } catch { /* */ } finally { setSaving(false) }
  }

  const handleSaveEdit = async (id: number) => {
    if (parseMontant(editMontant) <= 0) return
    setSaving(true)
    try {
      await conventionsAPI.updateBudgetLigne(conventionId, id, { montant: parseMontant(editMontant) })
      setEditingId(null); await refresh()
    } catch { /* */ } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette ligne de budget ?')) return
    setSaving(true)
    try { await conventionsAPI.deleteBudgetLigne(conventionId, id); await refresh() }
    catch { /* */ } finally { setSaving(false) }
  }

  /* ── CRUD: Imputation ── */

  const handleAddImput = async (ligneId: number, data: { projetId: number; projetCode: string; projetLibelle: string; pourcentage: number; typeImputation: string }) => {
    setSaving(true)
    try { await conventionsAPI.addBudgetLigneImputation(conventionId, ligneId, data); await refresh() }
    catch { /* */ } finally { setSaving(false) }
  }

  const handleUpdateImput = async (ligneId: number, imputId: number, pourcentage: number) => {
    setSaving(true)
    try { await conventionsAPI.updateBudgetLigneImputation(conventionId, ligneId, imputId, { pourcentage }); await refresh() }
    catch { /* */ } finally { setSaving(false) }
  }

  const handleDeleteImput = async (ligneId: number, imputId: number) => {
    if (!window.confirm('Supprimer cette imputation ?')) return
    setSaving(true)
    try { await conventionsAPI.deleteBudgetLigneImputation(conventionId, ligneId, imputId); await refresh() }
    catch { /* */ } finally { setSaving(false) }
  }

  /* ── Derived ── */

  const usedCatIds = new Set(distribution.map((d: BudgetLigneWithImputationsDTO) => d.budgetLigne.categorieDepenseId))
  const availableCats = categories.filter((c: CategorieDepenseListDTO) => !usedCatIds.has(c.id))
  const totalBudget = distribution.reduce((s: number, d: BudgetLigneWithImputationsDTO) => s + d.budgetLigne.montant, 0)

  const numInputSx = { width: 100, '& .MuiInputBase-input': { fontSize: '11px', py: 0.25, textAlign: 'right' } }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={22} /></Box>

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

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: colors.neutral[50] }}>
            <TableCell sx={{ ...thBase, minWidth: 140, position: 'sticky', left: 0, bgcolor: colors.neutral[50], zIndex: 1 }}>Libelle</TableCell>
            <TableCell align="right" sx={thBase}>Budget (convention)</TableCell>
            <TableCell sx={{ ...thBase, minWidth: 140 }}>Imputation</TableCell>
            <TableCell align="right" sx={thBase}>Engagement (marche, BC...)</TableCell>
            <TableCell sx={{ ...thBase, minWidth: 140 }}>Imputation</TableCell>
            <TableCell align="right" sx={thBase}>Reste a engager</TableCell>
            <TableCell align="right" sx={thBase}>Depenses realisees</TableCell>
            <TableCell sx={{ ...thBase, minWidth: 140 }}>Imputation</TableCell>
            <TableCell align="right" sx={thBase}>Reste a payer</TableCell>
            {canEdit && <TableCell align="center" sx={{ ...thBase, width: 70 }}>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* ── Data rows ── */}
          {distribution.map((item: BudgetLigneWithImputationsDTO) => {
            const l = item.budgetLigne
            const isEditing = editingId === l.id

            if (isEditing) {
              return (
                <TableRow key={l.id} sx={{ bgcolor: colors.primary[25] }}>
                  <TableCell sx={{ ...td, position: 'sticky', left: 0, bgcolor: colors.primary[25], zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip label={l.categorieDepenseCode} size="small" variant="outlined" sx={{ fontSize: '9px', height: 18, color: colors.primary[600], borderColor: colors.primary[200] }} />
                      <Typography sx={{ fontSize: typography.sizes.xs }}>{l.designation || l.categorieDepenseLibelle}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={td}>
                    <TextField size="small" value={editMontant} autoFocus
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEditMontant(e.target.value)}
                      InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '9px' }}>MAD</Typography></InputAdornment> }}
                      sx={numInputSx} />
                  </TableCell>
                  <TableCell sx={td}>
                    <BudgetImputationChips imputations={item.imputationsBudget} canEdit={canEdit} saving={saving}
                      projets={projets} typeImputation="BUDGET" conventionId={conventionId} ligneId={l.id!}
                      onAdd={data => handleAddImput(l.id!, data)} onUpdate={(iid, p) => handleUpdateImput(l.id!, iid, p)}
                      onDelete={iid => handleDeleteImput(l.id!, iid)} />
                  </TableCell>
                  {/* Engagement — computed, read-only even in edit mode */}
                  <TableCell align="right" sx={montantCol}>
                    <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>{fmt(l.engagementMontant)}</Typography>
                  </TableCell>
                  <TableCell sx={td}>
                    <BudgetImputationChips imputations={item.imputationsEngagement} canEdit={canEdit} saving={saving}
                      projets={projets} typeImputation="ENGAGEMENT" conventionId={conventionId} ligneId={l.id!}
                      onAdd={data => handleAddImput(l.id!, data)} onUpdate={(iid, p) => handleUpdateImput(l.id!, iid, p)}
                      onDelete={iid => handleDeleteImput(l.id!, iid)} />
                  </TableCell>
                  <TableCell align="right" sx={montantCol}>
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.warning[600], ...tnum }}>
                      {fmt(parseMontant(editMontant) - l.engagementMontant)}
                    </Typography>
                  </TableCell>
                  {/* Dépenses — computed, read-only */}
                  <TableCell align="right" sx={montantCol}>
                    <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>{fmt(l.depensesMontant)}</Typography>
                  </TableCell>
                  <TableCell sx={td}>
                    <BudgetImputationChips imputations={item.imputationsDepense} canEdit={canEdit} saving={saving}
                      projets={projets} typeImputation="DEPENSE" conventionId={conventionId} ligneId={l.id!}
                      onAdd={data => handleAddImput(l.id!, data)} onUpdate={(iid, p) => handleUpdateImput(l.id!, iid, p)}
                      onDelete={iid => handleDeleteImput(l.id!, iid)} />
                  </TableCell>
                  <TableCell align="right" sx={montantCol}>
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.danger[600], ...tnum }}>
                      {fmt(l.engagementMontant - l.depensesMontant)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={td}>
                    <IconButton size="small" onClick={() => handleSaveEdit(l.id!)} disabled={saving || parseMontant(editMontant) <= 0}>
                      <Check sx={{ fontSize: 14, color: colors.success[600] }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => setEditingId(null)} disabled={saving}>
                      <Close sx={{ fontSize: 14, color: colors.neutral[500] }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            }

            return (
              <TableRow key={l.id} sx={{ '&:hover': { bgcolor: colors.neutral[50] } }}>
                <TableCell sx={{ ...td, position: 'sticky', left: 0, bgcolor: 'white', zIndex: 1, '&:hover': { bgcolor: colors.neutral[50] } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip label={l.categorieDepenseCode} size="small" variant="outlined" sx={{ fontSize: '9px', height: 18, color: colors.primary[600], borderColor: colors.primary[200] }} />
                    <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>{l.designation || l.categorieDepenseLibelle}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={montantCol}>
                  <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>{fmt(l.montant)}</Typography>
                </TableCell>
                <TableCell sx={td}>
                  <BudgetImputationChips imputations={item.imputationsBudget} canEdit={canEdit} saving={saving}
                    projets={projets} typeImputation="BUDGET" conventionId={conventionId} ligneId={l.id!}
                    onAdd={data => handleAddImput(l.id!, data)} onUpdate={(iid, p) => handleUpdateImput(l.id!, iid, p)}
                    onDelete={iid => handleDeleteImput(l.id!, iid)} />
                </TableCell>
                <TableCell align="right" sx={montantCol}>
                  <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>{fmt(l.engagementMontant)}</Typography>
                </TableCell>
                <TableCell sx={td}>
                  <BudgetImputationChips imputations={item.imputationsEngagement} canEdit={canEdit} saving={saving}
                    projets={projets} typeImputation="ENGAGEMENT" conventionId={conventionId} ligneId={l.id!}
                    onAdd={data => handleAddImput(l.id!, data)} onUpdate={(iid, p) => handleUpdateImput(l.id!, iid, p)}
                    onDelete={iid => handleDeleteImput(l.id!, iid)} />
                </TableCell>
                <TableCell align="right" sx={montantCol}>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: l.resteAEngager > 0 ? colors.warning[600] : colors.success[600] }}>{fmt(l.resteAEngager)}</Typography>
                </TableCell>
                <TableCell align="right" sx={montantCol}>
                  <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>{fmt(l.depensesMontant)}</Typography>
                </TableCell>
                <TableCell sx={td}>
                  <BudgetImputationChips imputations={item.imputationsDepense} canEdit={canEdit} saving={saving}
                    projets={projets} typeImputation="DEPENSE" conventionId={conventionId} ligneId={l.id!}
                    onAdd={data => handleAddImput(l.id!, data)} onUpdate={(iid, p) => handleUpdateImput(l.id!, iid, p)}
                    onDelete={iid => handleDeleteImput(l.id!, iid)} />
                </TableCell>
                <TableCell align="right" sx={montantCol}>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: l.resteAPayer > 0 ? colors.danger[600] : colors.success[600] }}>{fmt(l.resteAPayer)}</Typography>
                </TableCell>
                {canEdit && (
                  <TableCell align="center" sx={td}>
                    <Tooltip title="Modifier">
                      <IconButton size="small" disabled={saving} onClick={() => {
                        setEditingId(l.id); setEditMontant(String(l.montant))
                      }}><Edit sx={{ fontSize: 14, color: colors.neutral[500] }} /></IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" disabled={saving} onClick={() => handleDelete(l.id!)}>
                        <Delete sx={{ fontSize: 14, color: colors.danger[400] }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            )
          })}

          {/* ── New row ── */}
          {newRow && (
            <TableRow sx={{ bgcolor: colors.success[25] }}>
              <TableCell sx={{ ...td, position: 'sticky', left: 0, bgcolor: colors.success[25], zIndex: 1 }}>
                <Select size="small" value={newRow.catId ?? ''} displayEmpty
                  onChange={(e: SelectChangeEvent<number | string>) => setNewRow((r: { catId: number | null; montant: string } | null) => r ? { ...r, catId: Number(e.target.value) } : r)}
                  sx={{ minWidth: 130, fontSize: '11px' }}
                  renderValue={(val: number | string) => {
                    if (!val) return <Typography sx={{ fontSize: '11px', color: colors.textSecondary }}>Categorie...</Typography>
                    const cat = categories.find((c: CategorieDepenseListDTO) => c.id === val)
                    return cat ? `${cat.code} - ${cat.libelle}` : ''
                  }}>
                  {availableCats.map((c: CategorieDepenseListDTO) => (
                    <MenuItem key={c.id} value={c.id} sx={{ fontSize: '11px' }}>{c.code} - {c.libelle}</MenuItem>
                  ))}
                  {availableCats.length === 0 && <MenuItem disabled sx={{ fontSize: '11px' }}>Toutes utilisees</MenuItem>}
                </Select>
              </TableCell>
              <TableCell align="right" sx={td}>
                <TextField size="small" value={newRow.montant} autoFocus placeholder="Budget"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRow((r: { catId: number | null; montant: string } | null) => r ? { ...r, montant: e.target.value } : r)}
                  InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '9px' }}>MAD</Typography></InputAdornment> }}
                  sx={numInputSx} />
              </TableCell>
              <TableCell sx={td} />
              {/* Engagement, Imputation, Reste — empty for new row (will be computed from marchés) */}
              <TableCell align="right" sx={montantCol}><Typography sx={{ fontSize: '10px', color: colors.textSecondary, fontStyle: 'italic' }}>—</Typography></TableCell>
              <TableCell sx={td} />
              <TableCell align="right" sx={montantCol}><Typography sx={{ fontSize: '10px', color: colors.textSecondary, fontStyle: 'italic' }}>—</Typography></TableCell>
              <TableCell align="right" sx={montantCol}><Typography sx={{ fontSize: '10px', color: colors.textSecondary, fontStyle: 'italic' }}>—</Typography></TableCell>
              <TableCell sx={td} />
              <TableCell align="right" sx={montantCol}><Typography sx={{ fontSize: '10px', color: colors.textSecondary, fontStyle: 'italic' }}>—</Typography></TableCell>
              <TableCell align="center" sx={td}>
                <IconButton size="small" onClick={handleSaveNew} disabled={saving || !newRow.catId || parseMontant(newRow.montant) <= 0}>
                  <Check sx={{ fontSize: 14, color: colors.success[600] }} />
                </IconButton>
                <IconButton size="small" onClick={() => setNewRow(null)} disabled={saving}>
                  <Close sx={{ fontSize: 14, color: colors.neutral[500] }} />
                </IconButton>
              </TableCell>
            </TableRow>
          )}

          {/* ── Total row ── */}
          {distribution.length > 0 && (
            <TableRow sx={{ bgcolor: colors.primary[25] }}>
              <TableCell sx={{ ...td, fontWeight: typography.weights.bold, color: colors.primary[700], position: 'sticky', left: 0, bgcolor: colors.primary[25], zIndex: 1 }}>
                Total ({distribution.length} categorie{distribution.length > 1 ? 's' : ''})
              </TableCell>
              <TableCell align="right" sx={{ ...montantCol, fontWeight: typography.weights.bold }}>{fmt(totalBudget)}</TableCell>
              <TableCell sx={td} />
              <TableCell align="right" sx={{ ...montantCol, fontWeight: typography.weights.bold }}>{fmt(convTotals.engagement)}</TableCell>
              <TableCell sx={td} />
              <TableCell align="right" sx={{ ...montantCol, fontWeight: typography.weights.bold, color: colors.warning[700] }}>{fmt(convTotals.resteAEngager)}</TableCell>
              <TableCell align="right" sx={{ ...montantCol, fontWeight: typography.weights.bold }}>{fmt(convTotals.depenses)}</TableCell>
              <TableCell sx={td} />
              <TableCell align="right" sx={{ ...montantCol, fontWeight: typography.weights.bold, color: colors.danger[700] }}>{fmt(convTotals.resteAPayer)}</TableCell>
              {canEdit && <TableCell sx={td} />}
            </TableRow>
          )}

          {/* ── Add trigger ── */}
          {canEdit && !newRow && (
            <TableRow onClick={() => { setEditingId(null); setNewRow({ catId: null, montant: '' }) }}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] }, '& td': { borderBottom: 0 } }}>
              <TableCell colSpan={canEdit ? 10 : 9} sx={td}>
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
