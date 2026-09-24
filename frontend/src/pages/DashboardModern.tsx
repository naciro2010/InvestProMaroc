import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
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
  Typography,
} from '@mui/material'
import { RefreshCw, Settings2, RotateCcw, Plus } from 'lucide-react'
import { useDashboardPreferences } from '../hooks/useDashboardPreferences'
import {
  useExecutiveDashboard,
  selectActionableAlerts,
  EXECUTIVE_DASHBOARD_QUERY_KEY,
} from '../hooks/useExecutiveDashboard'
import AppLayout from '../components/layout/AppLayout'
import { ControlPanel, DashboardGrid } from '../components/core'
import type { WidgetConfig } from '../components/core'
import { colors, componentStyles } from '../lib/designSystem'
import { useAuth } from '../contexts/AuthContext'
import { ExecutiveDashboardDTO } from '../lib/api'
import {
  DashboardMonthlyTrend,
  DashboardTopMarches,
  DashboardTopFournisseurs,
  DashboardBudgetExecution,
  DashboardWorkflowFunnel,
  DashboardFinanceKPIs,
  // Repli si le tableau de bord exécutif est indisponible
  DashboardKPICards,
  DashboardConventionChart,
  DashboardBudgetOverview,
  DashboardMarcheChart,
  DashboardRecentActivity,
} from '../components/dashboard'
import {
  HeadlineKPIs,
  ConventionExecution,
  ConventionCircuit,
  ToDoPanel,
  ActivityFeed,
} from '../components/dashboard/registre'
import { getGreeting } from '../components/dashboard/types'

// ==================== WIDGETS PERSONNALISABLES ====================

/** Indicateurs détaillés, sous la synthèse (réorganisables, masquables). */
const buildExecutiveWidgets = (data: ExecutiveDashboardDTO): WidgetConfig[] => [
  {
    id: 'finance-kpis',
    title: 'Indicateurs financiers',
    component: <DashboardFinanceKPIs kpis={data.kpis} />,
    defaultLayout: { x: 0, y: 0, w: 12, h: 3, minW: 6, minH: 2 },
  },
  {
    id: 'monthly-trend',
    title: 'Tendance mensuelle',
    component: <DashboardMonthlyTrend trends={data.monthlyTrends} />,
    defaultLayout: { x: 0, y: 3, w: 12, h: 5, minW: 6, minH: 3 },
  },
  {
    id: 'workflow-funnel',
    title: 'Flux de travail',
    component: <DashboardWorkflowFunnel funnel={data.workflowFunnel} />,
    defaultLayout: { x: 0, y: 8, w: 6, h: 4, minW: 4, minH: 3 },
  },
  {
    id: 'budget-execution',
    title: 'Exécution budgétaire',
    component: <DashboardBudgetExecution budget={data.budgetExecution} />,
    defaultLayout: { x: 6, y: 8, w: 6, h: 4, minW: 3, minH: 3 },
  },
  {
    id: 'top-marches',
    title: 'Principaux marchés',
    component: <DashboardTopMarches marches={data.topMarches} />,
    defaultLayout: { x: 0, y: 12, w: 6, h: 4, minW: 3, minH: 3 },
  },
  {
    id: 'top-fournisseurs',
    title: 'Principaux fournisseurs',
    component: <DashboardTopFournisseurs fournisseurs={data.topFournisseurs} />,
    defaultLayout: { x: 6, y: 12, w: 6, h: 4, minW: 3, minH: 3 },
  },
]

const buildLegacyWidgets = (refreshKey: number): WidgetConfig[] => [
  {
    id: 'legacy-kpis',
    title: 'Indicateurs clés',
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
    title: 'Marchés',
    component: <DashboardMarcheChart refreshKey={refreshKey} />,
    defaultLayout: { x: 8, y: 3, w: 4, h: 5, minW: 3, minH: 3 },
  },
  {
    id: 'legacy-activity',
    title: 'Activité récente',
    component: <DashboardRecentActivity refreshKey={refreshKey} />,
    defaultLayout: { x: 0, y: 8, w: 12, h: 5, minW: 6, minH: 3 },
  },
]

// ==================== PAGE ====================

const DashboardModern = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, isFetching } = useExecutiveDashboard()
  const [refreshKey, setRefreshKey] = useState(0)
  const { isWidgetVisible, toggleWidget, resetToDefaults, hiddenCount } = useDashboardPreferences()
  const [customizeAnchor, setCustomizeAnchor] = useState<null | HTMLElement>(null)
  const useLegacy = isError

  const handleRefresh = () => {
    if (useLegacy) setRefreshKey(prev => prev + 1)
    queryClient.invalidateQueries({ queryKey: EXECUTIVE_DASHBOARD_QUERY_KEY })
  }

  const allWidgets = useMemo(() => {
    if (useLegacy) return buildLegacyWidgets(refreshKey)
    if (data) return buildExecutiveWidgets(data)
    return []
  }, [data, useLegacy, refreshKey])

  const widgets = useMemo(
    () => allWidgets.filter(w => isWidgetVisible(w.id)),
    [allWidgets, isWidgetVisible],
  )

  const alerts = selectActionableAlerts(data)
  const firstName = user?.fullName?.split(' ')[0] || 'Utilisateur'
  const subtitle = data
    ? alerts.length === 0
      ? 'Aucun point ne demande votre attention aujourd\'hui.'
      : `${alerts.length} point${alerts.length > 1 ? 's demandent' : ' demande'} votre attention aujourd'hui.`
    : new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  return (
    <AppLayout>
      <ControlPanel
        breadcrumbs={[{ label: 'Tableau de bord' }]}
        title={`${getGreeting()}, ${firstName}`}
        subtitle={subtitle}
        actions={
          <>
            <Tooltip title="Personnaliser les indicateurs">
              <IconButton
                onClick={(e) => setCustomizeAnchor(e.currentTarget)}
                aria-label="Personnaliser les indicateurs"
                sx={{ color: hiddenCount > 0 ? colors.textPrimary : colors.textSecondary }}
              >
                <Settings2 size={16} strokeWidth={1.75} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Actualiser les données">
              <span>
                <IconButton onClick={handleRefresh} disabled={isFetching} aria-label="Actualiser les données" sx={{ color: colors.textSecondary }}>
                  {isFetching ? <CircularProgress size={16} sx={{ color: colors.textSecondary }} /> : <RefreshCw size={16} strokeWidth={1.75} />}
                </IconButton>
              </span>
            </Tooltip>
            <Button onClick={() => navigate('/conventions')} sx={componentStyles.buttonSecondary}>
              Conventions
            </Button>
            <Button onClick={() => navigate('/decomptes/nouveau')} startIcon={<Plus size={16} />} sx={componentStyles.buttonPrimary}>
              Nouveau décompte
            </Button>
          </>
        }
        hideBottomRow
      />

      <Menu
        anchorEl={customizeAnchor}
        open={Boolean(customizeAnchor)}
        onClose={() => setCustomizeAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 240, maxHeight: 400 } } }}
      >
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography variant="subtitle2">Indicateurs détaillés</Typography>
        </Box>
        <Divider />
        {allWidgets.map(w => (
          <MenuItem key={w.id} onClick={() => toggleWidget(w.id)} dense>
            <ListItemIcon><Checkbox checked={isWidgetVisible(w.id)} size="small" /></ListItemIcon>
            <ListItemText>{w.title}</ListItemText>
          </MenuItem>
        ))}
        {hiddenCount > 0 && [
          <Divider key="divider" />,
          <MenuItem key="reset" onClick={() => { resetToDefaults(); setCustomizeAnchor(null) }}>
            <ListItemIcon><RotateCcw size={16} /></ListItemIcon>
            <ListItemText>Tout afficher</ListItemText>
          </MenuItem>,
        ]}
      </Menu>

      {isLoading ? (
        <DashboardSkeleton />
      ) : data ? (
        <>
          <HeadlineKPIs kpis={data.kpis} budget={data.budgetExecution} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' },
              gap: 2.5,
              alignItems: 'start',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
              <ConventionExecution rows={data.budgetExecution.byConvention ?? []} />
              <ConventionCircuit counts={data.workflowFunnel.conventions?.counts ?? {}} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
              <ToDoPanel alerts={alerts} />
              <ActivityFeed items={data.recentActivity ?? []} />
            </Box>
          </Box>
        </>
      ) : null}

      {!isLoading && widgets.length > 0 && (
        <>
          {!useLegacy && (
            <Box component="h2" className="page-eyebrow" sx={{ m: 0, mb: 1.5 }}>Indicateurs détaillés</Box>
          )}
          <DashboardGrid
            widgets={widgets}
            storageKey={useLegacy ? 'investpro-dashboard-legacy' : 'investpro-dashboard-exec-v2'}
            rowHeight={60}
          />
        </>
      )}
    </AppLayout>
  )
}

const DashboardSkeleton = () => (
  <>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 2, mb: 2.5 }}>
      {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={112} />)}
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' }, gap: 2.5 }}>
      <Skeleton variant="rounded" height={320} />
      <Skeleton variant="rounded" height={320} />
    </Box>
  </>
)

export default DashboardModern
