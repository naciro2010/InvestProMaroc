import { useState, Suspense, lazy } from 'react'
import { Box, IconButton, Tooltip, CircularProgress } from '@mui/material'
import { RefreshCw } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, Notebook } from '@/components/core'
import { colors } from '@/lib/designSystem'
import {
  ReportingKPICards,
  ReportingDepensesChart,
  ReportingCommissionsChart,
  ReportingPaiementsCard,
  ReportingTopFournisseurs,
} from '@/components/reporting'

const ReportingAnalytiquePage = lazy(() => import('./ReportingAnalytiquePage'))

const TabLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
    <CircularProgress size={32} />
  </Box>
)

const ReportingPage = () => {
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
        {/* Control Panel */}
        <ControlPanel
          breadcrumbs={[{ label: 'Reporting' }]}
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

        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          <Notebook
            tabs={[
              {
                label: "Vue d'ensemble",
                content: (
                  <Box>
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
                  </Box>
                ),
              },
              {
                label: 'Depenses',
                content: (
                  <Box>
                    <ReportingKPICards refreshKey={refreshKey} />
                    <ReportingDepensesChart refreshKey={refreshKey} />
                  </Box>
                ),
              },
              {
                label: 'Commissions',
                content: (
                  <Box>
                    <ReportingKPICards refreshKey={refreshKey} />
                    <ReportingCommissionsChart refreshKey={refreshKey} />
                  </Box>
                ),
              },
              {
                label: 'Analytique',
                content: (
                  <Suspense fallback={<TabLoader />}>
                    <ReportingAnalytiquePage />
                  </Suspense>
                ),
              },
            ]}
          />
        </Box>
      </Box>
    </AppLayout>
  )
}

export default ReportingPage
