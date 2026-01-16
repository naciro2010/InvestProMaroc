import React, { useState, ReactNode } from 'react'
import { Box, Button, Stack, Collapse, TextField, InputAdornment } from '@mui/material'
import { Search, Filter, X } from 'lucide-react'
import { FilterState } from '@/types/api'

export interface FilterConfig {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'number'
  placeholder?: string
  options?: Array<{ label: string; value: string | number }>
  defaultValue?: string | number
}

export interface FilterBarProps {
  filters: FilterConfig[]
  onFilterChange: (filters: FilterState) => void
  onSearch?: (query: string) => void
  onReset: () => void
  searchPlaceholder?: string
  showExpandButton?: boolean
  children?: ReactNode
}

/**
 * FilterBar Component
 * Reusable filter and search controls
 * Supports text search + multiple filter fields
 * Collapsible to save space
 *
 * Usage:
 * <FilterBar
 *   filters={[
 *     { key: 'status', label: 'Status', type: 'select', options: [...] },
 *     { key: 'dateFrom', label: 'From', type: 'date' }
 *   ]}
 *   onFilterChange={(filters) => console.log(filters)}
 *   onSearch={(q) => console.log(q)}
 *   onReset={() => console.log('reset')}
 * />
 */
export function FilterBar({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  searchPlaceholder = 'Search...',
  showExpandButton = true,
  children,
}: FilterBarProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState<FilterState>(
    filters.reduce((acc, f) => {
      acc[f.key] = f.defaultValue || ''
      return acc
    }, {} as FilterState)
  )

  const handleFilterChange = (key: string, value: string | number | boolean | null) => {
    const newValues = { ...filterValues, [key]: value }
    setFilterValues(newValues)
    onFilterChange(newValues)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleReset = () => {
    setSearchQuery('')
    setFilterValues(
      filters.reduce((acc, f) => {
        acc[f.key] = f.defaultValue || ''
        return acc
      }, {} as FilterState)
    )
    onReset()
  }

  const hasActiveFilters = Object.values(filterValues).some((v) => v !== '' && v !== null)

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
      }}
    >
      {/* Search bar */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <Box
                  component="button"
                  onClick={() => handleSearch('')}
                  sx={{ cursor: 'pointer', border: 'none', bgcolor: 'transparent' }}
                >
                  <X size={16} />
                </Box>
              </InputAdornment>
            ),
          }}
        />

        {showExpandButton && filters.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Filter size={16} />}
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ minWidth: '120px' }}
          >
            Filters {hasActiveFilters && `(${Object.values(filterValues).filter((v) => v).length})`}
          </Button>
        )}
      </Stack>

      {/* Expandable filter fields */}
      {filters.length > 0 && (
        <Collapse in={isExpanded}>
          <Stack spacing={2} sx={{ mb: 2 }}>
            {filters.map((filter) => (
              <TextField
                key={filter.key}
                size="small"
                label={filter.label}
                placeholder={filter.placeholder}
                type={filter.type === 'date' ? 'date' : 'text'}
                value={filterValues[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                InputLabelProps={filter.type === 'date' ? { shrink: true } : undefined}
                fullWidth
                select={filter.type === 'select'}
              >
                {filter.type === 'select' && filter.options && (
                  <>
                    <option value="">-- All --</option>
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </>
                )}
              </TextField>
            ))}

            {/* Reset button */}
            {hasActiveFilters && (
              <Button
                variant="text"
                size="small"
                startIcon={<X size={16} />}
                onClick={handleReset}
                fullWidth
              >
                Reset Filters
              </Button>
            )}
          </Stack>
        </Collapse>
      )}

      {/* Custom children */}
      {children && <Box>{children}</Box>}
    </Box>
  )
}

export default FilterBar
