import { ReactNode, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { componentStyles, colors } from '@/lib/designSystem'

interface FieldGroupProps {
  title?: string
  children: ReactNode
  /** Number of columns for the field grid (default: 2) */
  columns?: 1 | 2 | 3 | 4
  /** Enable collapse/expand toggle on the group header */
  collapsible?: boolean
  /** Start collapsed (only used when collapsible=true) */
  defaultCollapsed?: boolean
  /** localStorage key for persisting collapse state */
  storageKey?: string
}

const COLUMN_TEMPLATES: Record<number, Record<string, string>> = {
  1: { xs: '1fr' },
  2: { xs: '1fr', md: '1fr 1fr' },
  3: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
  4: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
}

/**
 * FieldGroup - A bordered group of fields inside the form.
 * Supports 1-4 column layouts and optional collapsibility.
 */
const FieldGroup = ({ title, children, columns = 2, collapsible = false, defaultCollapsed = false, storageKey }: FieldGroupProps) => {
  const styles = componentStyles.formView

  const getInitialCollapsed = (): boolean => {
    if (!collapsible) return false
    if (storageKey) {
      try {
        const stored = localStorage.getItem(`fieldgroup-${storageKey}`)
        if (stored !== null) return stored === 'true'
      } catch { /* ignore */ }
    }
    return defaultCollapsed
  }

  const [collapsed, setCollapsed] = useState(getInitialCollapsed)

  const toggleCollapse = () => {
    if (!collapsible) return
    const next = !collapsed
    setCollapsed(next)
    if (storageKey) {
      try { localStorage.setItem(`fieldgroup-${storageKey}`, String(next)) } catch { /* ignore */ }
    }
  }

  return (
    <Box sx={styles.group}>
      {title && (
        <Box
          sx={{
            ...styles.groupTitle,
            ...(collapsible ? {
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              userSelect: 'none',
              '&:hover': { bgcolor: colors.neutral[100] },
            } : {}),
          }}
          onClick={collapsible ? toggleCollapse : undefined}
        >
          {collapsible && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: colors.textSecondary }}>
              {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </Box>
          )}
          {title}
        </Box>
      )}
      {!collapsed && (
        <Box sx={{
          ...styles.groupBody,
          display: 'grid',
          gridTemplateColumns: COLUMN_TEMPLATES[columns] || COLUMN_TEMPLATES[2],
          gap: 0,
        }}>
          {children}
        </Box>
      )}
    </Box>
  )
}

export default FieldGroup
