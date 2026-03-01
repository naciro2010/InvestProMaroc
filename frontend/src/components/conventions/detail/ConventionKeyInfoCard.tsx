import { useState, useRef, useEffect, type KeyboardEvent, type ReactNode, type ChangeEvent, type MouseEvent } from 'react'
import {
  Box, Paper, Typography, Chip, Divider, Tooltip,
  TextField, MenuItem, ClickAwayListener, CircularProgress,
  InputAdornment,
} from '@mui/material'
import { CalendarMonth, Person, Percent, Calculate, Info } from '@mui/icons-material'
import { Check, X, Pencil } from 'lucide-react'
import { colors, typography, componentStyles, borders } from '@/lib/designSystem'
import type { ConventionDetailEnrichedDTO } from '@/types/api'

/* ─── Types ─── */

interface Convention {
  budget: number; tauxCommission: number; tauxTva: number; tauxTvaLignes: number
  baseCalcul: string; commissionMode?: string
  dateSignature: string; dateDebut: string; dateFin?: string
}

interface ConventionKeyInfoCardProps {
  convention: Convention
  enrichedData: ConventionDetailEnrichedDTO | null
  canEdit?: boolean
  onFieldSave?: (fieldKey: string, value: string | number | null) => Promise<void>
}

/* ─── Formatters ─── */

const fmtMAD = (v: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v)
const fmtDate = (d?: string | null): string =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtPct = (v: number): string => `${v.toFixed(2)}%`

const BASE_LABELS: Record<string, string> = {
  MONTANT_TTC: 'Montant TTC', MONTANT_HT: 'Montant HT',
  MONTANT_HORS_TAXES: 'Montant HT', MONTANT_NET: 'Montant Net',
}
const MODE_LABELS: Record<string, string> = {
  GLOBAL: 'Taux global', PAR_CATEGORIE: 'Par categorie de depense',
}
const BASE_OPTIONS = [
  { value: 'MONTANT_TTC', label: 'Montant TTC' },
  { value: 'MONTANT_HT', label: 'Montant HT' },
  { value: 'MONTANT_NET', label: 'Montant Net' },
]
const MODE_OPTIONS = [
  { value: 'GLOBAL', label: 'Taux global' },
  { value: 'PAR_CATEGORIE', label: 'Par categorie' },
]

/* ─── Inline Editable InfoField ─── */

interface EditableInfoFieldProps {
  label: string
  value: string
  rawValue: string | number
  fieldKey: string
  fieldType: 'number' | 'select' | 'date'
  color?: string
  bold?: boolean
  icon?: ReactNode
  canEdit: boolean
  options?: Array<{ value: string; label: string }>
  onSave: (fieldKey: string, value: string | number | null) => Promise<void>
  suffix?: string
  isMoney?: boolean
}

const EditableInfoField = ({
  label, value, rawValue, fieldKey, fieldType, color, bold, icon,
  canEdit, options, onSave, suffix, isMoney,
}: EditableInfoFieldProps) => {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localValue, setLocalValue] = useState<string | number>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (fieldType === 'number' && inputRef.current.select) {
        inputRef.current.select()
      }
    }
  }, [editing, fieldType])

  const startEdit = () => {
    if (!canEdit || saving) return
    setLocalValue(rawValue)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setLocalValue('')
  }

  const confirmEdit = async () => {
    if (saving) return
    const newVal = fieldType === 'number' ? Number(localValue) : localValue
    if (newVal === rawValue) { cancelEdit(); return }
    setSaving(true)
    try {
      await onSave(fieldKey, newVal)
      setEditing(false)
    } catch { /* stay in edit mode */ }
    finally { setSaving(false) }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
    if (e.key === 'Enter') { e.preventDefault(); confirmEdit() }
  }

  /* ── Editing mode ── */
  if (editing) {
    return (
      <Box>
        <Typography sx={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.3, mb: 0.25 }}>
          {label}
        </Typography>
        <ClickAwayListener onClickAway={confirmEdit}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {fieldType === 'select' && options ? (
              <TextField
                select size="small" fullWidth
                value={localValue} autoFocus
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
                inputRef={inputRef}
                sx={{ '& .MuiInputBase-root': { fontSize: typography.sizes.sm, py: 0 }, '& .MuiInputBase-input': { py: 0.5 } }}
              >
                {options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            ) : fieldType === 'date' ? (
              <TextField
                type="date" size="small" fullWidth
                value={localValue} autoFocus
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
                inputRef={inputRef}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiInputBase-root': { fontSize: typography.sizes.sm }, '& .MuiInputBase-input': { py: 0.5 } }}
              />
            ) : (
              <TextField
                type="number" size="small" fullWidth
                value={localValue} autoFocus
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLocalValue(e.target.value === '' ? 0 : Number(e.target.value))}
                onKeyDown={handleKeyDown}
                inputRef={inputRef}
                InputProps={suffix ? {
                  endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '10px' }}>{suffix}</Typography></InputAdornment>,
                } : isMoney ? {
                  endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '10px' }}>MAD</Typography></InputAdornment>,
                } : undefined}
                inputProps={suffix === '%' ? { step: 0.01, min: 0, max: 100 } : { step: 1, min: 0 }}
                sx={{ '& .MuiInputBase-root': { fontSize: typography.sizes.sm }, '& .MuiInputBase-input': { py: 0.5, textAlign: 'right' } }}
              />
            )}
            <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
              {saving ? <CircularProgress size={16} /> : (
                <>
                  <Box onClick={(e: MouseEvent) => { e.stopPropagation(); confirmEdit() }}
                    sx={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: borders.radius.sm, cursor: 'pointer', color: colors.success[600], '&:hover': { bgcolor: colors.success[50] } }}>
                    <Check size={13} />
                  </Box>
                  <Box onClick={(e: MouseEvent) => { e.stopPropagation(); cancelEdit() }}
                    sx={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: borders.radius.sm, cursor: 'pointer', color: colors.danger[600], '&:hover': { bgcolor: colors.danger[50] } }}>
                    <X size={13} />
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </ClickAwayListener>
      </Box>
    )
  }

  /* ── View mode ── */
  return (
    <Box
      onClick={canEdit ? startEdit : undefined}
      sx={{
        cursor: canEdit ? 'pointer' : 'default',
        borderRadius: '4px', px: 0.5, py: 0.25, mx: -0.5,
        position: 'relative',
        '& .edit-icon': { opacity: 0, transition: 'opacity 0.15s' },
        '&:hover': canEdit ? {
          bgcolor: colors.primary[25],
          '& .edit-icon': { opacity: 1 },
        } : {},
      }}
    >
      <Typography sx={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.3 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        {icon}
        <Typography sx={{
          fontSize: typography.sizes.sm,
          fontWeight: bold ? typography.weights.bold : typography.weights.medium,
          color: color || colors.textPrimary,
          fontVariantNumeric: 'tabular-nums', lineHeight: 1.3,
        }}>
          {value}
        </Typography>
        {canEdit && (
          <Box className="edit-icon" sx={{ ml: 'auto', color: colors.primary[400], display: 'flex', alignItems: 'center' }}>
            <Pencil size={11} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

/* ─── Read-only InfoField (for dates & audit) ─── */

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Typography sx={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.3 }}>{label}</Typography>
    <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textPrimary, fontVariantNumeric: 'tabular-nums', lineHeight: 1.3 }}>
      {value}
    </Typography>
  </Box>
)

/* ─── Main Component ─── */

const ConventionKeyInfoCard = ({ convention, enrichedData, canEdit = false, onFieldSave }: ConventionKeyInfoCardProps) => {
  const editable = canEdit && !!onFieldSave
  const handleSave = onFieldSave ?? (async () => {})

  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
      {/* Financial Parameters */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <Calculate sx={{ fontSize: 15, color: colors.primary[500] }} />
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Parametres financiers
          </Typography>
          {editable && (
            <Chip label="Cliquer pour modifier" size="small"
              sx={{ ml: 'auto', height: 18, fontSize: '10px', bgcolor: colors.primary[50], color: colors.primary[600] }} />
          )}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
          <EditableInfoField
            label="Budget convention" value={fmtMAD(convention.budget)} rawValue={convention.budget}
            fieldKey="budget" fieldType="number" color={colors.primary[700]} bold isMoney
            canEdit={editable} onSave={handleSave}
          />
          <EditableInfoField
            label="Taux commission" value={fmtPct(convention.tauxCommission)} rawValue={convention.tauxCommission}
            fieldKey="tauxCommission" fieldType="number" suffix="%"
            icon={<Percent sx={{ fontSize: 12, color: colors.textSecondary }} />}
            canEdit={editable} onSave={handleSave}
          />
          <EditableInfoField
            label="TVA" value={fmtPct(convention.tauxTva)} rawValue={convention.tauxTva}
            fieldKey="tauxTva" fieldType="number" suffix="%"
            canEdit={editable} onSave={handleSave}
          />
          <EditableInfoField
            label="Base de calcul" value={BASE_LABELS[convention.baseCalcul] || convention.baseCalcul} rawValue={convention.baseCalcul}
            fieldKey="baseCalcul" fieldType="select" options={BASE_OPTIONS}
            canEdit={editable} onSave={handleSave}
          />
        </Box>

        {/* Commission mode row */}
        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <EditableInfoField
            label="Mode commission"
            value={MODE_LABELS[convention.commissionMode || 'GLOBAL'] || convention.commissionMode || 'Global'}
            rawValue={convention.commissionMode || 'GLOBAL'}
            fieldKey="commissionMode" fieldType="select" options={MODE_OPTIONS}
            canEdit={editable} onSave={handleSave}
          />
          {enrichedData?.tauxCommissionEffectif !== undefined && enrichedData.tauxCommissionEffectif !== convention.tauxCommission && (
            <Chip
              label={`Taux effectif: ${fmtPct(enrichedData.tauxCommissionEffectif)}`}
              size="small"
              sx={{ fontSize: typography.sizes.xs, bgcolor: colors.info[50], color: colors.info[700] }}
            />
          )}
          {enrichedData?.commissionTTC !== undefined && enrichedData.commissionTTC > 0 && (
            <Tooltip title="Commission TTC estimee" placement="top">
              <Chip
                icon={<Info sx={{ fontSize: 14 }} />}
                label={`Commission TTC: ${fmtMAD(enrichedData.commissionTTC)}`}
                size="small"
                sx={{ fontSize: typography.sizes.xs, bgcolor: colors.warning[50], color: colors.warning[700], '& .MuiChip-icon': { color: colors.warning[500] } }}
              />
            </Tooltip>
          )}
        </Box>

        {/* TVA Lignes */}
        <Box sx={{ mt: 1 }}>
          <EditableInfoField
            label="TVA lignes budgetaires" value={fmtPct(convention.tauxTvaLignes)} rawValue={convention.tauxTvaLignes}
            fieldKey="tauxTvaLignes" fieldType="number" suffix="%"
            canEdit={editable} onSave={handleSave}
          />
        </Box>
      </Box>

      <Divider />

      {/* Dates + Audit */}
      <Box sx={{ px: 2, py: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
        {/* Key Dates */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
            <CalendarMonth sx={{ fontSize: 15, color: colors.info[500] }} />
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Dates cles
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <EditableInfoField
              label="Signature" value={fmtDate(convention.dateSignature)} rawValue={convention.dateSignature || ''}
              fieldKey="dateSignature" fieldType="date"
              canEdit={editable} onSave={handleSave}
            />
            <EditableInfoField
              label="Debut" value={fmtDate(convention.dateDebut)} rawValue={convention.dateDebut || ''}
              fieldKey="dateDebut" fieldType="date"
              canEdit={editable} onSave={handleSave}
            />
            <EditableInfoField
              label="Fin" value={fmtDate(convention.dateFin)} rawValue={convention.dateFin || ''}
              fieldKey="dateFin" fieldType="date"
              canEdit={editable} onSave={handleSave}
            />
            {enrichedData?.dureeJours !== undefined && enrichedData.dureeJours !== null && (
              <InfoField label="Duree" value={`${enrichedData.dureeJours} jours`} />
            )}
          </Box>
        </Box>

        {/* Audit Trail */}
        {enrichedData && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
              <Person sx={{ fontSize: 15, color: colors.purple[500] }} />
              <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Tracabilite
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {enrichedData.createdByNom && (
                <InfoField label="Cree par" value={enrichedData.createdByNom} />
              )}
              {enrichedData.createdAt && (
                <InfoField label="Date creation" value={fmtDate(enrichedData.createdAt)} />
              )}
              {enrichedData.valideParNom && (
                <InfoField label="Valide par" value={enrichedData.valideParNom} />
              )}
              {enrichedData.dateValidation && (
                <InfoField label="Date validation" value={fmtDate(enrichedData.dateValidation)} />
              )}
              {enrichedData.dateSoumission && !enrichedData.dateValidation && (
                <InfoField label="Date soumission" value={fmtDate(enrichedData.dateSoumission)} />
              )}
              {enrichedData.motifRejet && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography sx={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase' }}>Motif de rejet</Typography>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.danger[600], fontWeight: typography.weights.medium }}>{enrichedData.motifRejet}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default ConventionKeyInfoCard
