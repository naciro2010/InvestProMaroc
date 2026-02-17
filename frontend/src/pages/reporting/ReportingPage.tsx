import { useState, Suspense, lazy } from 'react'
import { Box, Typography, Stack, Tooltip, IconButton, Tab, Tabs, CircularProgress } from '@mui/material'
import { RefreshCw, BarChart3, PieChart, TrendingUp, Layers } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { colors, typography } from '@/lib/designSystem'
import {
  ReportingKPICards,
  ReportingDepensesChart,
  ReportingCommissionsChart,
  ReportingPaiementsCard,
  ReportingTopFournisseurs,
} from '@/components/reporting'

const ReportingAnalytiquePage = lazy(() => import('./ReportingAnalytiquePage'))

interface TabPanelProps {
  children: React.ReactNode
  value: number
  index: number
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
)

const TabLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
    <CircularProgress size={32} />
  </Box>
)

const ReportingPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshKey((prev) => prev + 1)
    setTimeout(() => setRefreshing(false), 1500)
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        {/* Page Header */}
        <Box sx={{
          bgcolor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          px: { xs: 2, md: 3 },
          py: 2.5,
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
                Reporting
              </Typography>
              <Typography sx={{
                fontSize: typography.sizes.sm,
                color: colors.textSecondary,
              }}>
                Tableaux de bord, analyses et statistiques financieres
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

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, val: number) => setActiveTab(val)}
            sx={{
              mt: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.medium,
                color: colors.textSecondary,
                minHeight: 40,
                px: 2,
                '&.Mui-selected': {
                  color: colors.primary[700],
                  fontWeight: typography.weights.semibold,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.primary[600],
                height: 2,
              },
            }}
          >
            <Tab icon={<BarChart3 size={16} />} iconPosition="start" label="Vue d'ensemble" />
            <Tab icon={<TrendingUp size={16} />} iconPosition="start" label="Depenses" />
            <Tab icon={<PieChart size={16} />} iconPosition="start" label="Commissions" />
            <Tab icon={<Layers size={16} />} iconPosition="start" label="Analytique" />
          </Tabs>
        </Box>

        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          {/* Tab 0: Vue d'ensemble */}
          <TabPanel value={activeTab} index={0}>
            <ReportingKPICards refreshKey={refreshKey} />
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              gap: 2.5,
              mb: 3,
            }}>
              <ReportingDepensesChart refreshKey={refreshKey} />
              <ReportingPaiementsCard refreshKey={refreshKey} />
            </Box>
            <ReportingTopFournisseurs refreshKey={refreshKey} />
          </TabPanel>

          {/* Tab 1: Depenses */}
          <TabPanel value={activeTab} index={1}>
            <ReportingKPICards refreshKey={refreshKey} />
            <ReportingDepensesChart refreshKey={refreshKey} />
          </TabPanel>

          {/* Tab 2: Commissions */}
          <TabPanel value={activeTab} index={2}>
            <ReportingKPICards refreshKey={refreshKey} />
            <ReportingCommissionsChart refreshKey={refreshKey} />
          </TabPanel>

          {/* Tab 3: Analytique */}
          <TabPanel value={activeTab} index={3}>
            <Suspense fallback={<TabLoader />}>
              <ReportingAnalytiquePage />
            </Suspense>
          </TabPanel>
        </Box>
      </Box>
    </AppLayout>
  )
}

export default ReportingPage
