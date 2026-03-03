import { Box, Chip, IconButton, Select, MenuItem, TextField, InputAdornment, Typography, type SelectChangeEvent } from '@mui/material'
import { Add, Check, Close, Delete } from '@mui/icons-material'
import { useState, type ChangeEvent } from 'react'
import { colors, typography } from '@/lib/designSystem'
import type { BudgetLigneImputationDTO } from '@/types/api'

interface ProjetOption { id: number; code: string; nom: string }

interface BudgetImputationChipsProps {
  imputations: BudgetLigneImputationDTO[]
  canEdit: boolean
  saving: boolean
  projets: ProjetOption[]
  typeImputation: string
  conventionId: number
  ligneId: number
  onAdd: (data: { projetId: number; projetCode: string; projetLibelle: string; pourcentage: number; typeImputation: string }) => Promise<void>
  onUpdate: (imputId: number, pourcentage: number) => Promise<void>
  onDelete: (imputId: number) => Promise<void>
}

const chipSx = {
  height: 20, fontSize: '10px', mr: 0.5, mb: 0.25,
  borderColor: colors.primary[200], color: colors.primary[700],
}

const BudgetImputationChips = ({
  imputations, canEdit, saving, projets, typeImputation,
  onAdd, onUpdate, onDelete,
}: BudgetImputationChipsProps) => {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newProjetId, setNewProjetId] = useState<number | null>(null)
  const [newPct, setNewPct] = useState('')
  const [editPct, setEditPct] = useState('')

  const usedProjetCodes = new Set(imputations.map(i => i.projetCode))
  const availableProjets = projets.filter(p => !usedProjetCodes.has(p.code))

  const handleSaveNew = async () => {
    const p = projets.find(pr => pr.id === newProjetId)
    if (!p || !newPct) return
    const pct = parseFloat(newPct.replace(',', '.'))
    if (isNaN(pct) || pct <= 0 || pct > 100) return
    await onAdd({ projetId: p.id, projetCode: p.code, projetLibelle: p.nom, pourcentage: pct, typeImputation })
    setAdding(false); setNewProjetId(null); setNewPct('')
  }

  const handleSaveEdit = async (imputId: number) => {
    const pct = parseFloat(editPct.replace(',', '.'))
    if (isNaN(pct) || pct <= 0 || pct > 100) return
    await onUpdate(imputId, pct)
    setEditingId(null); setEditPct('')
  }

  const totalPct = imputations.reduce((s, i) => s + i.pourcentage, 0)

  if (!canEdit && imputations.length === 0) {
    return <Typography sx={{ fontSize: '10px', color: colors.textSecondary, fontStyle: 'italic' }}>—</Typography>
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, alignItems: 'center' }}>
      {imputations.map(imp => {
        if (editingId === imp.id) {
          return (
            <Box key={imp.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 600 }}>{imp.projetCode}</Typography>
              <TextField size="small" value={editPct} autoFocus
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditPct(e.target.value)} placeholder="0"
                InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '9px' }}>%</Typography></InputAdornment> }}
                sx={{ width: 65, '& .MuiInputBase-input': { fontSize: '10px', py: 0.25, textAlign: 'right' } }} />
              <IconButton size="small" onClick={() => handleSaveEdit(imp.id)} disabled={saving}>
                <Check sx={{ fontSize: 12, color: colors.success[600] }} />
              </IconButton>
              <IconButton size="small" onClick={() => setEditingId(null)} disabled={saving}>
                <Close sx={{ fontSize: 12, color: colors.neutral[500] }} />
              </IconButton>
            </Box>
          )
        }
        return (
          <Chip key={imp.id} size="small" variant="outlined"
            label={`${imp.pourcentage}% ${imp.projetCode}`}
            sx={chipSx}
            onDoubleClick={canEdit ? () => { setEditingId(imp.id); setEditPct(String(imp.pourcentage)) } : undefined}
            onDelete={canEdit ? () => onDelete(imp.id) : undefined}
            deleteIcon={canEdit ? <Delete sx={{ fontSize: '12px !important' }} /> : undefined}
          />
        )
      })}

      {totalPct < 100 && imputations.length > 0 && (
        <Chip size="small" variant="outlined"
          label={`${(100 - totalPct).toFixed(1)}% libre`}
          sx={{ ...chipSx, borderColor: colors.warning[300], color: colors.warning[700], borderStyle: 'dashed' }} />
      )}

      {adding ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          <Select size="small" value={newProjetId ?? ''} displayEmpty
            onChange={(e: SelectChangeEvent<number | string>) => setNewProjetId(Number(e.target.value))}
            sx={{ minWidth: 90, fontSize: '10px', '& .MuiSelect-select': { py: 0.25 } }}
            renderValue={(val: number | string) => {
              if (!val) return <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>Projet</Typography>
              const p = projets.find(pr => pr.id === val)
              return p ? p.code : ''
            }}>
            {availableProjets.map(p => (
              <MenuItem key={p.id} value={p.id} sx={{ fontSize: '10px' }}>{p.code} - {p.nom}</MenuItem>
            ))}
          </Select>
          <TextField size="small" value={newPct} autoFocus
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPct(e.target.value)} placeholder="%"
            InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '9px' }}>%</Typography></InputAdornment> }}
            sx={{ width: 55, '& .MuiInputBase-input': { fontSize: '10px', py: 0.25, textAlign: 'right' } }} />
          <IconButton size="small" onClick={handleSaveNew} disabled={saving || !newProjetId}>
            <Check sx={{ fontSize: 12, color: colors.success[600] }} />
          </IconButton>
          <IconButton size="small" onClick={() => { setAdding(false); setNewProjetId(null); setNewPct('') }}>
            <Close sx={{ fontSize: 12, color: colors.neutral[500] }} />
          </IconButton>
        </Box>
      ) : (
        canEdit && (
          <IconButton size="small" onClick={() => setAdding(true)} disabled={saving}
            sx={{ width: 18, height: 18, bgcolor: colors.primary[50], '&:hover': { bgcolor: colors.primary[100] } }}>
            <Add sx={{ fontSize: 12, color: colors.primary[600] }} />
          </IconButton>
        )
      )}
    </Box>
  )
}

export default BudgetImputationChips
