import React from 'react'
import { Box, Button, Typography, Stack } from '@mui/material'
import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
  disabled?: boolean
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
}

/**
 * Breadcrumb Navigation Component
 * Provides hierarchical navigation context
 * Last item is always non-clickable (current page)
 */
export function Breadcrumb({
  items,
  separator = <ChevronRight size={18} />,
}: BreadcrumbProps): React.ReactElement {
  const navigate = useNavigate()

  const handleClick = (item: BreadcrumbItem) => {
    if (item.href) {
      navigate(item.href)
    } else if (item.onClick) {
      item.onClick()
    }
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        py: 1,
        flexWrap: 'wrap',
        gap: 0.5,
      }}
    >
      {items.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {index > 0 && (
            <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
              {separator}
            </Box>
          )}

          {index === items.length - 1 ? (
            // Last item - not clickable
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
              }}
            >
              {item.label}
            </Typography>
          ) : (
            // Clickable item
            <Button
              variant="text"
              size="small"
              disabled={item.disabled}
              onClick={() => handleClick(item)}
              sx={{
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.5 : 1,
                textTransform: 'none',
                fontSize: 'inherit',
                p: 0,
                minWidth: 'auto',
                color: 'primary.main',
              }}
            >
              {item.label}
            </Button>
          )}
        </Box>
      ))}
    </Stack>
  )
}

export default Breadcrumb
