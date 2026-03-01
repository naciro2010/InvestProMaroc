import { useState } from 'react'
import {
  Box,
  Button,
  Popover,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  Chip,
  Divider,
} from '@mui/material'
import { Filter, X, RotateCcw } from 'lucide-react'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'
import { EMPTY_FILTERS, type MarcheFilterState } from './filterTypes'

interface MarcheAdvancedFiltersProps {
  filters: MarcheFilterState
  onFiltersChange: (filters: MarcheFilterState) => void
  fournisseurs: string[]
  conventions: string[]
}

const TYPE_OPTIONS = [
  { value: '', label: 'Tous les types' },
  { value: 'TRAVAUX', label: 'Travaux' },
  { value: 'FOURNITURES', label: 'Fournitures' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'ETUDES', label: 'Etudes' },
]

const STATUT_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'VALIDE', label: 'Valide' },
  { value: 'TERMINE', label: 'Termine' },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'ANNULE', label: 'Annule' },
]

const MarcheAdvancedFilters = ({
  filters,
  onFiltersChange,
  fournisseurs,
  conventions,
}: MarcheAdvancedFiltersProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)

  const activeCount = Object.entries(filters).filter(
    ([, v]) => v !== ''
  ).length

  const handleChange = (key: keyof MarcheFilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleReset = () => {
    onFiltersChange(EMPTY_FILTERS)
  }

  const getActiveFilterTags = (): { key: string; label: string }[] => {
    const tags: { key: string; label: string }[] = []
    if (filters.typeMarche) {
      const opt = TYPE_OPTIONS.find(o => o.value === filters.typeMarche)
      tags.push({ key: 'typeMarche', label: `Type: ${opt?.label || filters.typeMarche}` })
    }
    if (filters.statut) {
      const opt = STATUT_OPTIONS.find(o => o.value === filters.statut)
      tags.push({ key: 'statut', label: `Statut: ${opt?.label || filters.statut}` })
    }
    if (filters.fournisseur) {
      tags.push({ key: 'fournisseur', label: `Fournisseur: ${filters.fournisseur}` })
    }
    if (filters.convention) {
      tags.push({ key: 'convention', label: `Convention: ${filters.convention}` })
    }
    if (filters.montantMin || filters.montantMax) {
      const min = filters.montantMin ? `${Number(filters.montantMin).toLocaleString('fr-FR')}` : '0'
      const max = filters.montantMax ? `${Number(filters.montantMax).toLocaleString('fr-FR')}` : '...'
      tags.push({ key: 'montant', label: `Montant: ${min} - ${max} MAD` })
    }
    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom || '...'
      const to = filters.dateTo || '...'
      tags.push({ key: 'date', label: `Periode: ${from} - ${to}` })
    }
    return tags
  }

  const removeFilter = (key: string) => {
    const updated = { ...filters }
    switch (key) {
      case 'typeMarche': updated.typeMarche = ''; break
      case 'statut': updated.statut = ''; break
      case 'fournisseur': updated.fournisseur = ''; break
      case 'convention': updated.convention = ''; break
      case 'montant': updated.montantMin = ''; updated.montantMax = ''; break
      case 'date': updated.dateFrom = ''; updated.dateTo = ''; break
    }
    onFiltersChange(updated)
  }

  const activeTags = getActiveFilterTags()

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Filter size={14} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          ...componentStyles.buttonSecondary,
          fontSize: typography.sizes.sm,
          py: 0.5,
          px: 1.5,
          ...(activeCount > 0 && {
            borderColor: colors.primary[300],
            bgcolor: colors.primary[50],
            color: colors.primary[700],
          }),
        }}
      >
        Filtres
        {activeCount > 0 && (
          <Box
            component="span"
            sx={{
              ml: 0.75,
              bgcolor: colors.primary[600],
              color: '#fff',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: typography.sizes['2xs'],
              fontWeight: typography.weights.bold,
            }}
          >
            {activeCount}
          </Box>
        )}
      </Button>

      {activeTags.map((tag) => (
        <Chip
          key={tag.key}
          label={tag.label}
          size="small"
          onDelete={() => removeFilter(tag.key)}
          deleteIcon={<X size={12} />}
          sx={{
            bgcolor: colors.primary[50],
            color: colors.primary[700],
            border: `1px solid ${colors.primary[200]}`,
            borderRadius: borders.radius.base,
            fontSize: typography.sizes.xs,
            fontWeight: typography.weights.medium,
            height: 26,
            '& .MuiChip-deleteIcon': {
              color: colors.primary[400],
              '&:hover': { color: colors.primary[700] },
            },
          }}
        />
      ))}

      {activeTags.length > 1 && (
        <IconButton size="small" onClick={handleReset} sx={{ p: 0.5 }}>
          <RotateCcw size={14} />
        </IconButton>
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            width: 380,
            borderRadius: borders.radius.lg,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            mt: 0.5,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.base }}>
              Filtres avances
            </Typography>
            {activeCount > 0 && (
              <Button
                size="small"
                startIcon={<RotateCcw size={12} />}
                onClick={handleReset}
                sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}
              >
                Reinitialiser
              </Button>
            )}
          </Box>

          <TextField
            select fullWidth size="small" label="Type de marche"
            value={filters.typeMarche}
            onChange={(e) => handleChange('typeMarche', e.target.value)}
            sx={{ mb: 1.5 }}
          >
            {TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            select fullWidth size="small" label="Statut"
            value={filters.statut}
            onChange={(e) => handleChange('statut', e.target.value)}
            sx={{ mb: 1.5 }}
          >
            {STATUT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          {fournisseurs.length > 0 && (
            <TextField
              select fullWidth size="small" label="Fournisseur"
              value={filters.fournisseur}
              onChange={(e) => handleChange('fournisseur', e.target.value)}
              sx={{ mb: 1.5 }}
            >
              <MenuItem value="">Tous</MenuItem>
              {fournisseurs.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </TextField>
          )}

          {conventions.length > 0 && (
            <TextField
              select fullWidth size="small" label="Convention"
              value={filters.convention}
              onChange={(e) => handleChange('convention', e.target.value)}
              sx={{ mb: 1.5 }}
            >
              <MenuItem value="">Toutes</MenuItem>
              {conventions.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </TextField>
          )}

          <Divider sx={{ my: 1.5 }} />

          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Montant TTC (MAD)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <TextField
              size="small" type="number" placeholder="Min"
              value={filters.montantMin}
              onChange={(e) => handleChange('montantMin', e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small" type="number" placeholder="Max"
              value={filters.montantMax}
              onChange={(e) => handleChange('montantMax', e.target.value)}
              sx={{ flex: 1 }}
            />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Periode
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small" type="date" label="Du"
              value={filters.dateFrom}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small" type="date" label="Au"
              value={filters.dateTo}
              onChange={(e) => handleChange('dateTo', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth variant="contained" size="small"
            onClick={() => setAnchorEl(null)}
            sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm }}
          >
            Appliquer
          </Button>
        </Box>
      </Popover>
    </>
  )
}

export default MarcheAdvancedFilters
