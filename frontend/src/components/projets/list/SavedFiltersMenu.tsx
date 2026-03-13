import { useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Star, Trash2, BookmarkPlus } from 'lucide-react'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'
import { EMPTY_FILTERS, type ProjetFilterState } from './filterTypes'

export interface SavedProjetFilter {
  id: string
  name: string
  filters: ProjetFilterState
  groupBy: string
  createdAt: string
}

const STORAGE_KEY = 'projet-saved-filters'

interface SavedFiltersMenuProps {
  currentFilters: ProjetFilterState
  currentGroupBy: string
  onLoadFilter: (filters: ProjetFilterState, groupBy: string) => void
}

const loadSavedFilters = (): SavedProjetFilter[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) as SavedProjetFilter[] : []
  } catch {
    return []
  }
}

const persistFilters = (filters: SavedProjetFilter[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
}

const SavedFiltersMenu = ({
  currentFilters,
  currentGroupBy,
  onLoadFilter,
}: SavedFiltersMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [savedFilters, setSavedFilters] = useState<SavedProjetFilter[]>(loadSavedFilters)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [filterName, setFilterName] = useState('')

  const open = Boolean(anchorEl)

  const hasActiveFilters = Object.entries(currentFilters).some(([, v]) => v !== '')
    || currentGroupBy !== ''

  const handleSave = () => {
    if (!filterName.trim()) return
    const newFilter: SavedProjetFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters: { ...currentFilters },
      groupBy: currentGroupBy,
      createdAt: new Date().toISOString(),
    }
    const updated = [...savedFilters, newFilter]
    setSavedFilters(updated)
    persistFilters(updated)
    setFilterName('')
    setSaveDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id)
    setSavedFilters(updated)
    persistFilters(updated)
  }

  const handleLoad = (saved: SavedProjetFilter) => {
    onLoadFilter(saved.filters, saved.groupBy)
    setAnchorEl(null)
  }

  const countActiveInSaved = (saved: SavedProjetFilter): number => {
    return Object.entries(saved.filters).filter(([, v]) => v !== '').length
      + (saved.groupBy ? 1 : 0)
  }

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Star size={14} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          ...componentStyles.buttonSecondary,
          fontSize: typography.sizes.sm,
          py: 0.5,
          px: 1.5,
        }}
      >
        Vues
        {savedFilters.length > 0 && (
          <Box
            component="span"
            sx={{
              ml: 0.75,
              bgcolor: colors.warning[100],
              color: colors.warning[700],
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
            {savedFilters.length}
          </Box>
        )}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: borders.radius.lg,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            mt: 0.5,
          },
        }}
      >
        {hasActiveFilters && (
          <MenuItem
            onClick={() => { setAnchorEl(null); setSaveDialogOpen(true) }}
            sx={{ color: colors.primary[600], fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}
          >
            <BookmarkPlus size={16} style={{ marginRight: 8 }} />
            Enregistrer la vue actuelle
          </MenuItem>
        )}

        {hasActiveFilters && savedFilters.length > 0 && <Divider />}

        {savedFilters.length === 0 && !hasActiveFilters && (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Star size={24} style={{ color: colors.neutral[300], marginBottom: 4 }} />
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
              Aucun favori enregistre
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.neutral[400], mt: 0.5 }}>
              Appliquez des filtres puis sauvegardez-les ici
            </Typography>
          </Box>
        )}

        {savedFilters.map((saved) => (
          <MenuItem
            key={saved.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 1,
              '&:hover .delete-btn': { opacity: 1 },
            }}
            onClick={() => handleLoad(saved)}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.medium,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {saved.name}
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                {countActiveInSaved(saved)} critere(s)
              </Typography>
            </Box>
            <IconButton
              className="delete-btn"
              size="small"
              onClick={(e) => { e.stopPropagation(); handleDelete(saved.id) }}
              sx={{ opacity: 0, transition: 'opacity 0.2s', color: colors.danger[500], p: 0.5 }}
            >
              <Trash2 size={14} />
            </IconButton>
          </MenuItem>
        ))}

        {savedFilters.length > 0 && (
          <>
            <Divider />
            <MenuItem
              onClick={() => {
                onLoadFilter(EMPTY_FILTERS, '')
                setAnchorEl(null)
              }}
              sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}
            >
              Reinitialiser tous les filtres
            </MenuItem>
          </>
        )}
      </Menu>

      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: borders.radius.lg } }}
      >
        <DialogTitle sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.lg }}>
          Enregistrer le filtre
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Nom du filtre"
            placeholder="Ex: Projets en cours"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSaveDialogOpen(false)} sx={componentStyles.buttonSecondary}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!filterName.trim()}
            sx={componentStyles.buttonPrimary}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SavedFiltersMenu
