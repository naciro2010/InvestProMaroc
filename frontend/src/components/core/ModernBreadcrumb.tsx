import { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import { ChevronRight } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { componentStyles } from '@/lib/designSystem'

export interface BreadcrumbSegment {
  label: string
  path?: string
}

interface ModernBreadcrumbProps {
  items: BreadcrumbSegment[]
  actions?: ReactNode
}

/**
 * Breadcrumb navigation - always visible at the top of every page.
 * Shows the full navigation path for quick back-navigation.
 *
 * Pattern: Module > List > Record Name > Sub-section
 */
const ModernBreadcrumb = ({ items, actions }: ModernBreadcrumbProps) => {
  const styles = componentStyles.controlPanel

  return (
    <Box sx={styles.breadcrumb}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <Box key={`${item.label}-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            {index > 0 && (
              <ChevronRight size={16} style={{ flexShrink: 0 }} />
            )}
            {isLast || !item.path ? (
              <Typography
                component="span"
                sx={isLast ? styles.breadcrumbCurrent : styles.breadcrumbLink}
                noWrap
              >
                {item.label}
              </Typography>
            ) : (
              <Box component={RouterLink} to={item.path} sx={styles.breadcrumbLink}>
                {item.label}
              </Box>
            )}
          </Box>
        )
      })}

      {actions && (
        <Box sx={{ ml: 'auto', ...styles.actions }}>
          {actions}
        </Box>
      )}
    </Box>
  )
}

export default ModernBreadcrumb
