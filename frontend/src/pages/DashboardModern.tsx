import { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material'
import { RefreshCw } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { ControlPanel } from '../components/core'
import { colors, typography } from '../lib/designSystem'
import { useAuth } from '../contexts/AuthContext'
import {
  DashboardKPICards,
  DashboardConventionChart,
  DashboardBudgetOverview,
  DashboardMarcheChart,
  DashboardRecentActivity,
  DashboardQuickActions,
} from '../components/dashboard'
import { getGreeting } from '../components/dashboard/types'

const DashboardModern = () => {
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshKey(prev => prev + 1)
    setTimeout(() => setRefreshing(false), 1500)
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        {/* Control Panel */}
        <ControlPanel
          breadcrumbs={[{ label: 'Dashboard' }]}
          actions={
            <Tooltip title="Actualiser les donnees">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                size="small"
                sx={{ color: colors.textSecondary, '&:hover': { bgcolor: colors.neutral[100] } }}
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
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
            Vue d'ensemble de vos investissements et operations
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.sm,
            color: colors.neutral[400],
            mt: 0.25,
          }}>
            {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
          </Typography>
        </Box>

        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          {/* Quick Actions */}
          <DashboardQuickActions />

          {/* KPI Cards */}
          <DashboardKPICards refreshKey={refreshKey} />

          {/* Charts Row */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' },
            gap: 2.5,
            mb: 3,
          }}>
            <DashboardConventionChart refreshKey={refreshKey} />
            <DashboardBudgetOverview refreshKey={refreshKey} />
            <DashboardMarcheChart refreshKey={refreshKey} />
          </Box>

          {/* Activity */}
          <DashboardRecentActivity refreshKey={refreshKey} />
        </Box>
      </Box>
    </AppLayout>
  )
}

export default DashboardModern
