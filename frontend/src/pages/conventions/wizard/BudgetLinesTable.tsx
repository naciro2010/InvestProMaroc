import { useState, useRef, useCallback } from 'react'
import {
  Box, Typography, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Paper, Tooltip,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import DecimalInput from '@/components/ui/DecimalInput'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { CategorieDepenseListDTO } from '@/types/api'
import { formatCurrency, type BudgetLigne, type WizardTotals } from './types'

interface BudgetLinesTableProps {
  lignes: BudgetLigne[]
  categories: CategorieDepenseListDTO[]
  isParCategorie: boolean
  baseCalcul: 'DECAISSEMENTS_TTC' | 'DECAISSEMENTS_HT'
  totals: WizardTotals
  onUpdateLigne: (index: number, ligne: BudgetLigne) => void
  onDeleteLigne: (index: number) => void
}

const computeLineCommission = (
  ligne: BudgetLigne,
  baseCalcul: 'DECAISSEMENTS_TTC' | 'DECAISSEMENTS_HT'
): number => {
  const base = baseCalcul === 'DECAISSEMENTS_HT' ? ligne.montantHT : ligne.montantTTC
  const assiette = ligne.plafond > 0 ? Math.min(base, ligne.plafond) : base
  return (assiette * ligne.tauxCommissionLigne) / 100
}

const BudgetLinesTable = ({
  lignes, categories, isParCategorie, baseCalcul, totals, onUpdateLigne, onDeleteLigne,
}: BudgetLinesTableProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingLigne, setEditingLigne] = useState<BudgetLigne>({
    designation: '', montantHT: 0, tauxTVA: 20, montantTTC: 0, plafond: 0, tauxCommissionLigne: 0,
  })

  // Ref keeps the latest editingLigne value accessible across async boundaries
  // (fixes Enter key race condition where DecimalInput blur commits value
  //  but saveEditing reads stale closure state before React re-renders)
  const editingLigneRef = useRef(editingLigne)
  editingLigneRef.current = editingLigne

  const findCategory = (ligne: BudgetLigne): CategorieDepenseListDTO | undefined =>
    categories.find((c) => c.id === ligne.categorieDepenseId)

  const startEditing = (index: number) => {
    setEditingIndex(index)
    setEditingLigne({ ...lignes[index] })
  }

  const saveEditing = useCallback(() => {
    if (editingIndex === null) return
    const current = editingLigneRef.current
    const montantTTC = current.montantHT * (1 + current.tauxTVA / 100)
    onUpdateLigne(editingIndex, { ...current, montantTTC })
    setEditingIndex(null)
  }, [editingIndex, onUpdateLigne])

  const cancelEditing = () => setEditingIndex(null)

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Defer save to next tick so DecimalInput blur has time to commit its value
      // and React processes the state update before we read from the ref
      setTimeout(saveEditing, 0)
    }
    if (e.key === 'Escape') cancelEditing()
  }

  return (
    <TableContainer component={Paper} sx={{ ...componentStyles.table.container, mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={componentStyles.table.header}>
            <TableCell sx={componentStyles.table.headerCell}>Categorie</TableCell>
            <TableCell align="right" sx={componentStyles.table.headerCell}>Montant HT</TableCell>
            <TableCell align="right" sx={componentStyles.table.headerCell}>TVA (%)</TableCell>
            <TableCell align="right" sx={componentStyles.table.headerCell}>Montant TTC</TableCell>
            {isParCategorie && (
              <>
                <TableCell align="right" sx={componentStyles.table.headerCell}>Plafond</TableCell>
                <TableCell align="right" sx={componentStyles.table.headerCell}>Taux (%)</TableCell>
                <TableCell align="right" sx={componentStyles.table.headerCell}>Commission</TableCell>
              </>
            )}
            <TableCell align="center" sx={{ ...componentStyles.table.headerCell, width: 80 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lignes.map((ligne, idx) => {
            const isEditing = editingIndex === idx
            const cat = findCategory(ligne)

            if (isEditing) {
              const editTTC = editingLigne.montantHT * (1 + editingLigne.tauxTVA / 100)
              return (
                <TableRow
                  key={idx}
                  sx={{ bgcolor: colors.warning[25], '&:hover': { bgcolor: colors.warning[25] } }}
                  onKeyDown={handleEditKeyDown}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: typography.weights.medium, color: colors.textPrimary }}>
                      {cat ? `${cat.code} - ${cat.libelle}` : editingLigne.designation}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <DecimalInput
                      size="small"
                      value={editingLigne.montantHT}
                      onChange={(v) => setEditingLigne((p) => ({ ...p, montantHT: v, montantTTC: v * (1 + p.tauxTVA / 100) }))}
                      decimalPlaces={2} min={0} sx={{ minWidth: 120 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      {editingLigne.tauxTVA}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary }}>
                      {formatCurrency(editTTC)}
                    </Typography>
                  </TableCell>
                  {isParCategorie && (
                    <>
                      <TableCell align="right">
                        <DecimalInput
                          size="small"
                          value={editingLigne.plafond}
                          onChange={(v) => setEditingLigne((p) => ({ ...p, plafond: v }))}
                          decimalPlaces={2} min={0} sx={{ minWidth: 120 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <DecimalInput
                          size="small"
                          value={editingLigne.tauxCommissionLigne}
                          onChange={(v) => setEditingLigne((p) => ({ ...p, tauxCommissionLigne: v }))}
                          decimalPlaces={2} min={0} max={100} sx={{ minWidth: 70 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ color: colors.success[600], fontWeight: typography.weights.semibold }}>
                          {formatCurrency(computeLineCommission({ ...editingLigne, montantTTC: editTTC }, baseCalcul))}
                        </Typography>
                      </TableCell>
                    </>
                  )}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="Enregistrer (Entree)">
                        <IconButton size="small" onClick={saveEditing} sx={{ color: colors.success[600] }}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Annuler (Echap)">
                        <IconButton size="small" onClick={cancelEditing} sx={{ color: colors.danger[500] }}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            }

            return (
              <TableRow
                key={idx}
                sx={{ ...componentStyles.table.row, cursor: 'pointer', '&:hover .edit-hint': { opacity: 1 } }}
                onClick={() => startEditing(idx)}
              >
                <TableCell sx={componentStyles.table.cell}>
                  {cat ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={cat.code} size="small" variant="outlined" sx={{ color: colors.primary[600], borderColor: colors.primary[200] }} />
                      <span>{cat.libelle}</span>
                    </Box>
                  ) : ligne.designation}
                </TableCell>
                <TableCell align="right" sx={componentStyles.table.cell}>{formatCurrency(ligne.montantHT)}</TableCell>
                <TableCell align="right" sx={componentStyles.table.cell}>{ligne.tauxTVA}%</TableCell>
                <TableCell align="right" sx={{ ...componentStyles.table.cell, fontWeight: typography.weights.semibold }}>
                  {formatCurrency(ligne.montantTTC)}
                </TableCell>
                {isParCategorie && (
                  <>
                    <TableCell align="right" sx={componentStyles.table.cell}>
                      {ligne.plafond > 0 ? formatCurrency(ligne.plafond) : 'Illimite'}
                    </TableCell>
                    <TableCell align="right" sx={componentStyles.table.cell}>{ligne.tauxCommissionLigne}%</TableCell>
                    <TableCell align="right" sx={{ ...componentStyles.table.cell, fontWeight: typography.weights.semibold, color: colors.success[600] }}>
                      {formatCurrency(computeLineCommission(ligne, baseCalcul))}
                    </TableCell>
                  </>
                )}
                <TableCell align="center" sx={componentStyles.table.cell}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="Modifier">
                      <EditIcon className="edit-hint" sx={{ fontSize: 16, color: colors.primary[400], opacity: 0, transition: 'opacity 0.2s' }} />
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onDeleteLigne(idx) }}
                      sx={{ color: colors.danger[500] }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            )
          })}

          {/* Total row */}
          <TableRow sx={{ bgcolor: colors.primary[25], '&:hover': { bgcolor: colors.primary[25] } }}>
            <TableCell sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}>TOTAL</TableCell>
            <TableCell align="right" sx={{ fontWeight: typography.weights.bold }}>{formatCurrency(totals.totalLignesHT)}</TableCell>
            <TableCell />
            <TableCell align="right" sx={{ fontWeight: typography.weights.bold }}>{formatCurrency(totals.totalLignesTTC)}</TableCell>
            {isParCategorie && (
              <>
                <TableCell />
                <TableCell />
                <TableCell align="right" sx={{ fontWeight: typography.weights.bold, color: colors.success[700] }}>
                  {formatCurrency(totals.commissionHT)}
                </TableCell>
              </>
            )}
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default BudgetLinesTable
