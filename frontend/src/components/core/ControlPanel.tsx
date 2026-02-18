import { ReactNode, useState } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Chip,
} from '@mui/material'
import { Search, ChevronLeft, ChevronRight, List, LayoutGrid, X } from 'lucide-react'
import { componentStyles, colors, typography } from '@/lib/designSystem'
import ModernBreadcrumb, { BreadcrumbSegment } from './ModernBreadcrumb'

type ViewMode = 'list' | 'kanban' | 'map'

interface FilterTag {
  key: string
  label: string
  value: string
}

interface ControlPanelProps {
  breadcrumbs: BreadcrumbSegment[]
  actions?: ReactNode
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: FilterTag[]
  onRemoveFilter?: (key: string) => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  availableViews?: ViewMode[]
  paginationInfo?: {
    currentStart: number
    currentEnd: number
    total: number
  }
  onPreviousPage?: () => void
  onNextPage?: () => void
  children?: ReactNode
  hideBottomRow?: boolean
}

/**
 * ControlPanel - Top control bar combining breadcrumb navigation,
 * search, filters, view switching, and pagination.
 */
const ControlPanel = ({
  breadcrumbs,
  actions,
  searchPlaceholder = 'Rechercher...',
  searchValue = '',
  onSearchChange,
  filters = [],
  onRemoveFilter,
  viewMode,
  onViewModeChange,
  availableViews = [],
  paginationInfo,
  onPreviousPage,
  onNextPage,
  children,
  hideBottomRow = false,
}: ControlPanelProps) => {
  const styles = componentStyles.controlPanel
  const [localSearch, setLocalSearch] = useState(searchValue)

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearchChange?.(value)
  }

  return (
    <Box sx={styles.container}>
      {/* Top Row: Breadcrumbs + Actions + Pager */}
      <Box sx={styles.topRow}>
        <ModernBreadcrumb items={breadcrumbs} />

        <Box sx={styles.actions}>
          {actions}

          {availableViews.length > 1 && (
            <Box sx={styles.viewSwitcher}>
              {availableViews.includes('list') && (
                <IconButton
                  size="small"
                  onClick={() => onViewModeChange?.('list')}
                  sx={viewMode === 'list' ? styles.viewSwitcherButtonActive : styles.viewSwitcherButton}
                >
                  <List size={16} />
                </IconButton>
              )}
              {availableViews.includes('kanban') && (
                <IconButton
                  size="small"
                  onClick={() => onViewModeChange?.('kanban')}
                  sx={viewMode === 'kanban' ? styles.viewSwitcherButtonActive : styles.viewSwitcherButton}
                >
                  <LayoutGrid size={16} />
                </IconButton>
              )}
            </Box>
          )}

          {paginationInfo && (
            <Box sx={styles.pager}>
              <IconButton size="small" onClick={onPreviousPage} disabled={paginationInfo.currentStart <= 1} sx={{ p: 0.5 }}>
                <ChevronLeft size={16} />
              </IconButton>
              <Typography component="span" sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                {paginationInfo.currentStart}-{paginationInfo.currentEnd} / {paginationInfo.total}
              </Typography>
              <IconButton size="small" onClick={onNextPage} disabled={paginationInfo.currentEnd >= paginationInfo.total} sx={{ p: 0.5 }}>
                <ChevronRight size={16} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      {!hideBottomRow && (
        <Box sx={styles.bottomRow}>
          {onSearchChange && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              sx={styles.searchBar}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} style={{ color: colors.textSecondary }} />
                  </InputAdornment>
                ),
                endAdornment: localSearch ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleSearchChange('')} sx={{ p: 0.25 }}>
                      <X size={14} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          )}

          {filters.map((filter) => (
            <Chip
              key={filter.key}
              label={`${filter.label}: ${filter.value}`}
              size="small"
              onDelete={onRemoveFilter ? () => onRemoveFilter(filter.key) : undefined}
              sx={componentStyles.controlPanel.filterTag}
            />
          ))}

          {children}
        </Box>
      )}
    </Box>
  )
}

export default ControlPanel
