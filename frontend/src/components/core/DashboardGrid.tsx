import { ReactNode, useState, useCallback, useMemo } from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import type { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout/legacy'
import { Lock, Unlock, RotateCcw } from 'lucide-react'
import { colors, typography, borders, shadows, transitions } from '@/lib/designSystem'
import 'react-grid-layout/css/styles.css'

type Layouts = ResponsiveLayouts
const ResponsiveGridLayout = WidthProvider(Responsive)

// ==================== TYPES ====================

interface WidgetConfig {
  id: string
  title: string
  component: ReactNode
  /** Default grid position: {x, y, w, h} */
  defaultLayout: { x: number; y: number; w: number; h: number; minW?: number; minH?: number }
}

interface DashboardGridProps {
  widgets: WidgetConfig[]
  storageKey?: string
  cols?: { lg: number; md: number; sm: number; xs: number }
  rowHeight?: number
}

// ==================== WIDGET WRAPPER ====================

interface WidgetWrapperProps {
  title: string
  isEditing: boolean
  children: ReactNode
}

const WidgetWrapper = ({ title, isEditing, children }: WidgetWrapperProps) => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: colors.surface,
      border: `1px solid ${isEditing ? colors.primary[200] : colors.border}`,
      borderRadius: borders.radius.lg,
      boxShadow: shadows.xs,
      overflow: 'hidden',
      transition: transitions.normal,
      ...(isEditing ? {
        '&:hover': { borderColor: colors.primary[400], boxShadow: shadows.sm },
        cursor: 'move',
      } : {}),
    }}
  >
    <Box sx={{
      px: 2,
      py: 1,
      borderBottom: `1px solid ${colors.divider}`,
      display: 'flex',
      alignItems: 'center',
      bgcolor: colors.neutral[25],
      minHeight: 36,
    }}>
      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
      {children}
    </Box>
  </Box>
)

// ==================== MAIN DASHBOARD GRID ====================

const DashboardGrid = ({
  widgets,
  storageKey = 'investpro-dashboard-layout',
  cols = { lg: 12, md: 10, sm: 6, xs: 4 },
  rowHeight = 80,
}: DashboardGridProps) => {
  const [isEditing, setIsEditing] = useState(false)

  // Build default layouts from widget configs
  const defaultLayouts = useMemo((): Layouts => {
    const lgLayout: LayoutItem[] = widgets.map(w => ({
      i: w.id,
      x: w.defaultLayout.x,
      y: w.defaultLayout.y,
      w: w.defaultLayout.w,
      h: w.defaultLayout.h,
      minW: w.defaultLayout.minW ?? 2,
      minH: w.defaultLayout.minH ?? 2,
    }))
    return { lg: lgLayout as unknown as Layout }
  }, [widgets])

  // Load saved layout or use defaults
  const loadLayouts = useCallback((): Layouts => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) return JSON.parse(saved) as Layouts
    } catch { /* ignore */ }
    return defaultLayouts
  }, [storageKey, defaultLayouts])

  const [layouts, setLayouts] = useState<Layouts>(loadLayouts)

  const handleLayoutChange = (_currentLayout: Layout, allLayouts: Layouts) => {
    setLayouts(allLayouts)
    try {
      localStorage.setItem(storageKey, JSON.stringify(allLayouts))
    } catch { /* ignore */ }
  }

  const handleReset = () => {
    setLayouts(defaultLayouts)
    try {
      localStorage.removeItem(storageKey)
    } catch { /* ignore */ }
  }

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mb: 1 }}>
        {isEditing && (
          <Tooltip title="Reinitialiser la disposition">
            <IconButton size="small" onClick={handleReset} sx={{ color: colors.textSecondary }}>
              <RotateCcw size={16} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={isEditing ? 'Verrouiller' : 'Personnaliser la disposition'}>
          <IconButton
            size="small"
            onClick={() => setIsEditing(prev => !prev)}
            sx={{
              color: isEditing ? colors.primary[600] : colors.textSecondary,
              bgcolor: isEditing ? colors.primary[50] : 'transparent',
              '&:hover': { bgcolor: isEditing ? colors.primary[100] : colors.neutral[100] },
            }}
          >
            {isEditing ? <Unlock size={16} /> : <Lock size={16} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Grid */}
      <ResponsiveGridLayout
        className="dashboard-grid"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={cols}
        rowHeight={rowHeight}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".dashboard-grid-widget"
        compactType="vertical"
        margin={[12, 12]}
      >
        {widgets.map(widget => (
          <div key={widget.id} className="dashboard-grid-widget">
            <WidgetWrapper title={widget.title} isEditing={isEditing}>
              {widget.component}
            </WidgetWrapper>
          </div>
        ))}
      </ResponsiveGridLayout>
    </Box>
  )
}

export { DashboardGrid, type WidgetConfig, type DashboardGridProps }
export default DashboardGrid
