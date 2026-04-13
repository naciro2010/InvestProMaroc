import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Divider,
  Button,
} from '@mui/material'
import { RefreshCw, Settings2, RotateCcw } from 'lucide-react'
import { useDashboardPreferences } from '../hooks/useDashboardPreferences'
import AppLayout from '../components/layout/AppLayout'
import { ControlPanel, DashboardGrid } from '../components/core'
import type { WidgetConfig } from '../components/core'
import { colors, typography } from '../lib/designSystem'
import { useAuth } from '../contexts/AuthContext'
import { reportingAPI, ExecutiveDashboardDTO } from '../lib/api'
import {
  DashboardQuickActions,
  DashboardFinanceKPIs,
  DashboardWorkflowFunnel,
  DashboardMonthlyTrend,
  DashboardTopMarches,
  DashboardTopFournisseurs,
  DashboardBudgetExecution,
  DashboardAlerts,
  DashboardRecentActivityExec,
  // Legacy fallback
  DashboardKPICards,
  DashboardConventionChart,
  DashboardBudgetOverview,
  DashboardMarcheChart,
  DashboardRecentActivity,
} from '../components/dashboard'
import { getGreeting } from '../components/dashboard/types'

// ==================== WIDGET BUILDER ====================

const buildExecutiveWidgets = (data: ExecutiveDashboardDTO): WidgetConfig[] => [
  {
    id: 'finance-kpis',
    title: 'KPIs Finance',
    component: <DashboardFinanceKPIs kpis={data.kpis} />,
    defaultLayout: { x: 0, y: 0, w: 12, h: 3, minW: 6, minH: 2 },
  },
  {
    id: 'workflow-funnel',
    title: 'Workflow',
    component: <DashboardWorkflowFunnel funnel={data.workflowFunnel} />,
    defaultLayout: { x: 0, y: 3, w: 6, h: 4, minW: 4, minH: 3 },
  },
  {
    id: 'alerts',
    title: 'Alertes',
    component: <DashboardAlerts alerts={data.alerts} />,
    defaultLayout: { x: 6, y: 3, w: 6, h: 4, minW: 4, minH: 3 },
  },
  {
    id: 'monthly-trend',
    title: 'Tendance Mensuelle',
    component: <DashboardMonthlyTrend trends={data.monthlyTrends} />,
    defaultLayout: { x: 0, y: 7, w: 12, h: 5, minW: 6, minH: 3 },
  },
  {
    id: 'top-marches',
    title: 'Top Marches',
    component: <DashboardTopMarches marches={data.topMarches} />,
    defaultLayout: { x: 0, y: 12, w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: 'top-fournisseurs',
    title: 'Top Fournisseurs',
    component: <DashboardTopFournisseurs fournisseurs={data.topFournisseurs} />,
    defaultLayout: { x: 4, y: 12, w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: 'budget-execution',
    title: 'Execution Budgetaire',
    component: <DashboardBudgetExecution budget={data.budgetExecution} />,
    defaultLayout: { x: 8, y: 12, w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: 'recent-activity',
    title: 'Activite Recente',
    component: <DashboardRecentActivityExec items={data.recentActivity} />,
    defaultLayout: { x: 0, y: 16, w: 12, h: 5, minW: 6, minH: 3 },
  },
]

const buildLegacyWidgets = (refreshKey: number): WidgetConfig[] => [
  {
    id: 'legacy-kpis',
    title: 'Indicateurs Cles',
    component: <DashboardKPICards refreshKey={refreshKey} />,
    defaultLayout: { x: 0, y: 0, w: 12, h: 3, minW: 6, minH: 2 },
  },
  {
    id: 'legacy-conventions',
    title: 'Conventions',
    component: <DashboardConventionChart refreshKey={refreshKey} />,
    defaultLayout: { x: 0, y: 3, w: 4, h: 5, minW: 3, minH: 3 },
  },
  {
    id: 'legacy-budget',
    title: 'Budget',
    component: <DashboardBudgetOverview refreshKey={refreshKey} />,
    defaultLayout: { x: 4, y: 3, w: 4, h: 5, minW: 3, minH: 3 },
  },
  {
    id: 'legacy-marches',
    title: 'Marches',
    component: <DashboardMarcheChart refreshKey={refreshKey} />,
    defaultLayout: { x: 8, y: 3, w: 4, h: 5, minW: 3, minH: 3 },
  },
  {
    id: 'legacy-activity',
    title: 'Activite Recente',
    component: <DashboardRecentActivity refreshKey={refreshKey} />,
    defaultLayout: { x: 0, y: 8, w: 12, h: 5, minW: 6, minH: 3 },
  },
]

// ==================== MAIN COMPONENT ====================

const DashboardModern = () => {
  const { user } = useAuth()
  const [data, setData] = useState<ExecutiveDashboardDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [useLegacy, setUseLegacy] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { isWidgetVisible, toggleWidget, resetToDefaults, hiddenCount } = useDashboardPreferences()
  const [customizeAnchor, setCustomizeAnchor] = useState<null | HTMLElement>(null)

  const fetchDashboard = async () => {
    try {
      const res = await reportingAPI.getExecutiveDashboard()
      const payload = res.data?.data ?? res.data
      setData(payload as ExecutiveDashboardDTO)
      setUseLegacy(false)
    } catch {
      setUseLegacy(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    if (useLegacy) {
      setRefreshKey(prev => prev + 1)
      setTimeout(() => setRefreshing(false), 1500)
    } else {
      fetchDashboard()
    }
  }

  const allWidgets = useMemo(() => {
    if (useLegacy) return buildLegacyWidgets(refreshKey)
    if (data) return buildExecutiveWidgets(data)
    return []
  }, [data, useLegacy, refreshKey])

  const widgets = useMemo(
    () => allWidgets.filter(w => isWidgetVisible(w.id)),
    [allWidgets, isWidgetVisible]
  )

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        <ControlPanel
          breadcrumbs={[{ label: 'Tableau de bord' }]}
          actions={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Personnaliser les widgets">
                <IconButton onClick={(e) => setCustomizeAnchor(e.currentTarget)} size="small"
                  sx={{ color: hiddenCount > 0 ? colors.primary[600] : colors.textSecondary, '&:hover': { bgcolor: colors.neutral[100] } }}>
                  <Settings2 size={16} />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={customizeAnchor}
                open={Boolean(customizeAnchor)}
                onClose={() => setCustomizeAnchor(null)}
                slotProps={{ paper: { sx: { minWidth: 240, maxHeight: 400 } } }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Widgets visibles</Typography>
                </Box>
                <Divider />
                {allWidgets.map(w => (
                  <MenuItem key={w.id} onClick={() => toggleWidget(w.id)} dense>
                    <ListItemIcon><Checkbox checked={isWidgetVisible(w.id)} size="small" /></ListItemIcon>
                    <ListItemText>{w.title}</ListItemText>
                  </MenuItem>
                ))}
                {hiddenCount > 0 && (
                  <>
                    <Divider />
                    <MenuItem onClick={() => { resetToDefaults(); setCustomizeAnchor(null) }}>
                      <ListItemIcon><RotateCcw size={16} /></ListItemIcon>
                      <ListItemText>Tout afficher</ListItemText>
                    </MenuItem>
                  </>
                )}
              </Menu>
              <Tooltip title="Actualiser les donnees">
                <IconButton onClick={handleRefresh} disabled={refreshing} size="small"
                  sx={{ color: colors.textSecondary, '&:hover': { bgcolor: colors.neutral[100] } }}>
                  {refreshing ? <CircularProgress size={16} sx={{ color: colors.textSecondary }} /> : <RefreshCw size={16} />}
                </IconButton>
              </Tooltip>
            </Box>
          }
          hideBottomRow
        />

        {/* Welcome */}
        <Box sx={{ px: { xs: 2, md: 3 }, pt: 3, pb: 1 }}>
          <Typography sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.textPrimary, letterSpacing: '-0.01em', mb: 0.5 }}>
            {getGreeting()}, {user?.fullName || 'Utilisateur'}
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.base, color: colors.textSecondary }}>
            Tableau de bord executif — vue d'ensemble de vos investissements
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.neutral[400], mt: 0.25 }}>
            {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
          </Typography>
        </Box>

        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          <DashboardQuickActions />

          {loading ? (
            <DashboardSkeleton />
          ) : widgets.length > 0 ? (
            <DashboardGrid
              widgets={widgets}
              storageKey={useLegacy ? 'investpro-dashboard-legacy' : 'investpro-dashboard-exec'}
              rowHeight={60}
            />
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: colors.textDisabled }}>
                Impossible de charger le tableau de bord
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </AppLayout>
  )
}

const DashboardSkeleton = () => (
  <>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
      {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: 2 }} />)}
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5, mb: 3 }}>
      <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
    </Box>
    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 3 }} />
  </>
)

export default DashboardModern
