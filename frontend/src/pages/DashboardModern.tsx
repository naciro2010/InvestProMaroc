import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Skeleton,
} from '@mui/material'
import { RefreshCw } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { ControlPanel } from '../components/core'
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
} from '../components/dashboard'
import { getGreeting } from '../components/dashboard/types'

const DashboardModern = () => {
  const { user } = useAuth()
  const [data, setData] = useState<ExecutiveDashboardDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboard = async () => {
    try {
      const res = await reportingAPI.getExecutiveDashboard()
      const payload = res.data?.data ?? res.data
      setData(payload as ExecutiveDashboardDTO)
    } catch (err) {
      console.error('Failed to load executive dashboard', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboard()
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        <ControlPanel
          breadcrumbs={[{ label: 'Tableau de bord' }]}
          actions={
            <Tooltip title="Actualiser les donnees">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                size="small"
                sx={{ color: colors.textSecondary, '&:hover': { bgcolor: colors.neutral[100] } }}
              >
                {refreshing
                  ? <CircularProgress size={16} sx={{ color: colors.textSecondary }} />
                  : <RefreshCw size={16} />
                }
              </IconButton>
            </Tooltip>
          }
          hideBottomRow
        />

        {/* Welcome */}
        <Box sx={{ px: { xs: 2, md: 3 }, pt: 3, pb: 1 }}>
          <Typography sx={{
            fontSize: typography.sizes['2xl'],
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
            letterSpacing: '-0.01em',
            mb: 0.5,
          }}>
            {getGreeting()}, {user?.fullName || 'Utilisateur'}
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.base,
            color: colors.textSecondary,
          }}>
            Tableau de bord executif — vue d'ensemble de vos investissements
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.sm,
            color: colors.neutral[400],
            mt: 0.25,
          }}>
            {new Intl.DateTimeFormat('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            }).format(new Date())}
          </Typography>
        </Box>

        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          {/* Quick Actions */}
          <DashboardQuickActions />

          {loading ? (
            <DashboardSkeleton />
          ) : data ? (
            <>
              {/* Finance KPIs + Gauges */}
              <DashboardFinanceKPIs kpis={data.kpis} />

              {/* Row: Workflow + Alerts */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                gap: 2.5, mb: 3,
              }}>
                <DashboardWorkflowFunnel funnel={data.workflowFunnel} />
                <DashboardAlerts alerts={data.alerts} />
              </Box>

              {/* Monthly Trend (full width) */}
              <Box sx={{ mb: 3 }}>
                <DashboardMonthlyTrend trends={data.monthlyTrends} />
              </Box>

              {/* Row: Top Marches + Top Fournisseurs + Budget Execution */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' },
                gap: 2.5, mb: 3,
              }}>
                <DashboardTopMarches marches={data.topMarches} />
                <DashboardTopFournisseurs fournisseurs={data.topFournisseurs} />
                <DashboardBudgetExecution budget={data.budgetExecution} />
              </Box>

              {/* Recent Activity (full width) */}
              <DashboardRecentActivityExec items={data.recentActivity} />
            </>
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
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
      gap: 2, mb: 3,
    }}>
      {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: 2 }} />)}
    </Box>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
      gap: 2.5, mb: 3,
    }}>
      <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
    </Box>
    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 3 }} />
  </>
)

export default DashboardModern
