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
import { EMPTY_FILTERS, type ConventionFilterState } from './filterTypes'

interface ConventionAdvancedFiltersProps {
  filters: ConventionFilterState
  onFiltersChange: (filters: ConventionFilterState) => void
  creators: string[]
}

// ==================== FILTER OPTIONS ====================

const TYPE_OPTIONS = [
  { value: '', label: 'Tous les types' },
  { value: 'CADRE', label: 'Cadre' },
  { value: 'SPECIFIQUE', label: 'Specifique' },
  { value: 'NON_CADRE', label: 'Non cadre' },
]

const STATUT_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'VALIDE', label: 'Valide' },
]

// ==================== COMPONENT ====================

const ConventionAdvancedFilters = ({
  filters,
  onFiltersChange,
  creators,
}: ConventionAdvancedFiltersProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)

  const activeCount = Object.entries(filters).filter(
    ([, v]) => v !== ''
  ).length

  const handleChange = (key: keyof ConventionFilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleReset = () => {
    onFiltersChange(EMPTY_FILTERS)
  }

  const getActiveFilterTags = (): { key: string; label: string }[] => {
    const tags: { key: string; label: string }[] = []
    if (filters.type) {
      const opt = TYPE_OPTIONS.find(o => o.value === filters.type)
      tags.push({ key: 'type', label: `Type: ${opt?.label || filters.type}` })
    }
    if (filters.statut) {
      const opt = STATUT_OPTIONS.find(o => o.value === filters.statut)
      tags.push({ key: 'statut', label: `Statut: ${opt?.label || filters.statut}` })
    }
    if (filters.budgetMin || filters.budgetMax) {
      const min = filters.budgetMin ? `${Number(filters.budgetMin).toLocaleString('fr-FR')}` : '0'
      const max = filters.budgetMax ? `${Number(filters.budgetMax).toLocaleString('fr-FR')}` : '...'
      tags.push({ key: 'budget', label: `Budget: ${min} - ${max} MAD` })
    }
    if (filters.commissionMin || filters.commissionMax) {
      const min = filters.commissionMin || '0'
      const max = filters.commissionMax || '...'
      tags.push({ key: 'commission', label: `Commission: ${min}% - ${max}%` })
    }
    if (filters.dateDebutFrom || filters.dateDebutTo) {
      const from = filters.dateDebutFrom || '...'
      const to = filters.dateDebutTo || '...'
      tags.push({ key: 'date', label: `Periode: ${from} - ${to}` })
    }
    if (filters.createdBy) {
      tags.push({ key: 'createdBy', label: `Cree par: ${filters.createdBy}` })
    }
    return tags
  }

  const removeFilter = (key: string) => {
    const updated = { ...filters }
    switch (key) {
      case 'type': updated.type = ''; break
      case 'statut': updated.statut = ''; break
      case 'budget': updated.budgetMin = ''; updated.budgetMax = ''; break
      case 'commission': updated.commissionMin = ''; updated.commissionMax = ''; break
      case 'date': updated.dateDebutFrom = ''; updated.dateDebutTo = ''; break
      case 'createdBy': updated.createdBy = ''; break
    }
    onFiltersChange(updated)
  }

  const activeTags = getActiveFilterTags()

  return (
    <>
      {/* Filter button */}
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

      {/* Active filter tags */}
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

      {/* Filter popover */}
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

          {/* Type */}
          <TextField
            select
            fullWidth
            size="small"
            label="Type"
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            sx={{ mb: 1.5 }}
          >
            {TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          {/* Status */}
          <TextField
            select
            fullWidth
            size="small"
            label="Statut"
            value={filters.statut}
            onChange={(e) => handleChange('statut', e.target.value)}
            sx={{ mb: 1.5 }}
          >
            {STATUT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <Divider sx={{ my: 1.5 }} />

          {/* Budget range */}
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Budget (MAD)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <TextField
              size="small"
              type="number"
              placeholder="Min"
              value={filters.budgetMin}
              onChange={(e) => handleChange('budgetMin', e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Max"
              value={filters.budgetMax}
              onChange={(e) => handleChange('budgetMax', e.target.value)}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Commission range */}
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Taux commission (%)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <TextField
              size="small"
              type="number"
              placeholder="Min"
              value={filters.commissionMin}
              onChange={(e) => handleChange('commissionMin', e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ step: 0.1 }}
            />
            <TextField
              size="small"
              type="number"
              placeholder="Max"
              value={filters.commissionMax}
              onChange={(e) => handleChange('commissionMax', e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ step: 0.1 }}
            />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Date range */}
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Periode
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <TextField
              size="small"
              type="date"
              label="Du"
              value={filters.dateDebutFrom}
              onChange={(e) => handleChange('dateDebutFrom', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="date"
              label="Au"
              value={filters.dateDebutTo}
              onChange={(e) => handleChange('dateDebutTo', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Creator */}
          {creators.length > 0 && (
            <TextField
              select
              fullWidth
              size="small"
              label="Cree par"
              value={filters.createdBy}
              onChange={(e) => handleChange('createdBy', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              {creators.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </TextField>
          )}
        </Box>

        {/* Apply button */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="small"
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

export default ConventionAdvancedFilters
