import { useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import { ChevronDown, ChevronRight, GripHorizontal } from 'lucide-react'
import { componentStyles } from '@/lib/designSystem'

// ==================== TYPES ====================

interface ResizableSectionProps {
  /** Section title displayed in the header bar */
  title: string
  /** Optional icon displayed before the title */
  icon?: ReactNode
  /** localStorage key for persisting collapse/height state */
  storageKey?: string
  /** Start collapsed (default: false) */
  defaultCollapsed?: boolean
  /** Initial height in px, or 'auto' for natural height (default: 'auto') */
  defaultHeight?: number | 'auto'
  /** Minimum height in px when resizing (default: 60) */
  minHeight?: number
  /** Maximum height in px when resizing (default: 1200) */
  maxHeight?: number
  /** Enable drag-to-resize handle (default: true) */
  resizable?: boolean
  /** Enable collapse/expand toggle (default: true) */
  collapsible?: boolean
  /** Section content */
  children: ReactNode
  /** Optional actions rendered on the right side of the header */
  actions?: ReactNode
  /** Remove padding from content area (default: false) */
  noPadding?: boolean
  /**
   * Autorise le débordement visible du conteneur (overflow: visible).
   * Nécessaire pour qu'un en-tête collant (sticky) interne se positionne
   * par rapport au viewport plutôt que d'être clippé. Default: false.
   */
  overflowVisible?: boolean
}

interface PersistedState {
  collapsed: boolean
  height: number | 'auto'
}

// ==================== HELPERS ====================

function loadPersistedState(
  storageKey: string | undefined,
  defaultCollapsed: boolean,
  defaultHeight: number | 'auto',
): PersistedState {
  if (!storageKey) return { collapsed: defaultCollapsed, height: defaultHeight }
  try {
    const raw = localStorage.getItem(`resizable-section-${storageKey}`)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState
      return {
        collapsed: typeof parsed.collapsed === 'boolean' ? parsed.collapsed : defaultCollapsed,
        height: typeof parsed.height === 'number' || parsed.height === 'auto' ? parsed.height : defaultHeight,
      }
    }
  } catch {
    /* ignore corrupted storage */
  }
  return { collapsed: defaultCollapsed, height: defaultHeight }
}

function savePersistedState(storageKey: string | undefined, state: PersistedState): void {
  if (!storageKey) return
  try {
    localStorage.setItem(`resizable-section-${storageKey}`, JSON.stringify(state))
  } catch {
    /* ignore quota errors */
  }
}

// ==================== COMPONENT ====================

/**
 * ResizableSection - Collapsible & vertically resizable panel.
 *
 * Design system component for wrapping detail-page sections so users
 * can collapse, resize (drag bottom handle), and arrange visible content.
 * State is persisted to localStorage when a storageKey is provided.
 *
 * Double-click the resize handle to reset height to auto.
 */
const ResizableSection = ({
  title,
  icon,
  storageKey,
  defaultCollapsed = false,
  defaultHeight = 'auto',
  minHeight = 60,
  maxHeight = 1200,
  resizable = true,
  collapsible = true,
  children,
  actions,
  noPadding = false,
  overflowVisible = false,
}: ResizableSectionProps) => {
  const initial = loadPersistedState(storageKey, defaultCollapsed, defaultHeight)
  const [collapsed, setCollapsed] = useState<boolean>(initial.collapsed)
  const [height, setHeight] = useState<number | 'auto'>(initial.height)
  const [isResizing, setIsResizing] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const startH = useRef(0)

  // Persist whenever state changes
  useEffect(() => {
    savePersistedState(storageKey, { collapsed, height })
  }, [collapsed, height, storageKey])

  // ---- Resize handlers ----

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)
      startY.current = e.clientY
      startH.current = contentRef.current?.offsetHeight ?? 200

      const handleMouseMove = (ev: MouseEvent) => {
        const delta = ev.clientY - startY.current
        const next = Math.max(minHeight, Math.min(maxHeight, startH.current + delta))
        setHeight(next)
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [minHeight, maxHeight],
  )

  const handleResetHeight = useCallback(() => {
    setHeight('auto')
  }, [])

  const toggleCollapse = useCallback(() => {
    if (collapsible) {
      setCollapsed((c) => !c)
      // Reset to auto when expanding so content isn't stuck at a stale height
      if (collapsed) setHeight('auto')
    }
  }, [collapsible, collapsed])

  // ---- Styles ----

  const styles = componentStyles.resizableSection

  return (
    <Box sx={{ ...styles.container, ...(overflowVisible ? { overflow: 'visible' } : {}) }}>
      {/* Header */}
      <Box
        sx={collapsed ? styles.headerCollapsed : styles.header}
        onClick={toggleCollapse}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleCollapse()
          }
        }}
      >
        {collapsible && (
          <Box sx={styles.chevron}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </Box>
        )}
        {icon && <Box sx={styles.icon}>{icon}</Box>}
        <Typography component="span" sx={styles.title}>
          {title}
        </Typography>
        {actions && (
          <Box sx={styles.actions} onClick={(e) => e.stopPropagation()}>
            {actions}
          </Box>
        )}
      </Box>

      {/* Content */}
      {!collapsed && (
        <Box
          ref={contentRef}
          sx={{
            ...styles.content,
            ...(noPadding ? { p: 0 } : {}),
            ...(height !== 'auto'
              ? {
                  height,
                  overflowY: 'auto',
                  // Subtle scrollbar styling
                  '&::-webkit-scrollbar': { width: 6 },
                  '&::-webkit-scrollbar-thumb': {
                    borderRadius: 3,
                    bgcolor: 'rgba(0,0,0,0.15)',
                  },
                }
              : {}),
            ...(isResizing ? { transition: 'none' } : {}),
          }}
        >
          {children}
        </Box>
      )}

      {/* Resize handle */}
      {!collapsed && resizable && (
        <Box
          sx={styles.resizeHandle}
          onMouseDown={handleResizeStart}
          onDoubleClick={handleResetHeight}
          title="Glisser pour redimensionner, double-clic pour reinitialiser"
        >
          <GripHorizontal size={14} />
        </Box>
      )}
    </Box>
  )
}

export default ResizableSection
