import { Box, Container, Skeleton } from '@mui/material'
import AppLayout from '@/components/layout/AppLayout'
import { colors } from '@/lib/designSystem'

const ConventionDetailSkeleton = () => (
  <AppLayout>
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
      <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 3, py: 1.5 }}>
        <Skeleton variant="text" width={300} height={32} />
      </Box>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      </Container>
    </Box>
  </AppLayout>
)

export default ConventionDetailSkeleton
