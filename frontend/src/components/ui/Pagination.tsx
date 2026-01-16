import React from 'react'
import { Box, Button, Typography, Stack } from '@mui/material'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

/**
 * Pagination Component
 * Reusable pagination controls for list pages
 * Shows: « Previous | Page X of Y | Next »
 * Plus item count: "Showing X-Y of Z items"
 */
export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  disabled = false,
}: PaginationProps): React.ReactElement {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        py: 2,
      }}
    >
      {/* Item count info */}
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Showing {startItem} to {endItem} of {totalItems} items
      </Typography>

      {/* Pagination controls */}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Button
          size="small"
          variant="outlined"
          disabled={!canGoPrevious || disabled}
          onClick={() => onPageChange(currentPage - 1)}
          startIcon={<ChevronLeft size={16} />}
        >
          Previous
        </Button>

        <Typography variant="body2" sx={{ px: 1, minWidth: '80px', textAlign: 'center' }}>
          Page {currentPage} of {totalPages}
        </Typography>

        <Button
          size="small"
          variant="outlined"
          disabled={!canGoNext || disabled}
          onClick={() => onPageChange(currentPage + 1)}
          endIcon={<ChevronRight size={16} />}
        >
          Next
        </Button>
      </Stack>
    </Box>
  )
}

export default Pagination
