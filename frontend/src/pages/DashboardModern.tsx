import { useState } from 'react'
import {
  Box,
  Typography,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material'
import { RefreshCw } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { colors, typography } from '../lib/designSystem'
import { useAuth } from '../contexts/AuthContext'
import {
  DashboardKPICards,
  DashboardConventionChart,
  DashboardBudgetOverview,
  DashboardMarcheChart,
  DashboardRecentActivity,
} from '../components/dashboard'
import { getGreeting } from '../components/dashboard/types'

const DashboardModern = () => {
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshKey(prev => prev + 1)
    // Reset the spinning indicator after a short delay
    setTimeout(() => setRefreshing(false), 1500)
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        {/* Welcome Header */}
        <Box sx={{
          bgcolor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          px: { xs: 2, md: 3 },
          py: 3,
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
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
            </Box>
            <Tooltip title="Actualiser les donnees">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  color: colors.textSecondary,
                  '&:hover': { bgcolor: colors.neutral[100] },
                }}
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          {/* KPI Cards + Budget Utilization Bar */}
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

          {/* Bottom Row: Activity + Alerts + Actions */}
          <DashboardRecentActivity refreshKey={refreshKey} />
        </Box>
      </Box>
    </AppLayout>
  )
}

export default DashboardModern
