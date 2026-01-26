import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material'
import { ChevronRight } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

/**
 * Odoo-style Breadcrumbs Component
 *
 * Simple, clean breadcrumbs with subtle separators
 * - No emojis, no flashy colors
 * - Clickable hierarchy
 * - Chevron separators
 * - Last item is not clickable (current page)
 */
const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <MuiBreadcrumbs
      separator={<ChevronRight size={14} className="text-gray-400" />}
      aria-label="breadcrumb"
      sx={{
        mb: 2,
        fontSize: 13,
        '& .MuiBreadcrumbs-separator': {
          mx: 0.5,
        },
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        if (isLast) {
          return (
            <Typography
              key={item.label}
              sx={{
                fontSize: 13,
                color: 'text.primary',
                fontWeight: 500,
              }}
            >
              {item.label}
            </Typography>
          )
        }

        if (item.path) {
          return (
            <Link
              key={item.label}
              component={RouterLink}
              to={item.path}
              underline="hover"
              sx={{
                fontSize: 13,
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {item.label}
            </Link>
          )
        }

        return (
          <Typography
            key={item.label}
            sx={{
              fontSize: 13,
              color: 'text.secondary',
            }}
          >
            {item.label}
          </Typography>
        )
      })}
    </MuiBreadcrumbs>
  )
}

export default Breadcrumbs
