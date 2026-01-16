import React from 'react'
import { Box, Skeleton, Stack, Card } from '@mui/material'

export interface LoadingSkeletonProps {
  rows?: number
  variant?: 'card' | 'table' | 'form'
  height?: number | string
}

/**
 * LoadingSkeleton Component
 * Skeleton loader while data is being fetched
 * Provides visual feedback and reduces layout shift
 */
export function LoadingSkeleton({
  rows = 3,
  variant = 'card',
  height = 'auto',
}: LoadingSkeletonProps): React.ReactElement {
  if (variant === 'table') {
    return (
      <Box sx={{ width: '100%' }}>
        {/* Table header */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="100%" height={32} />
            </Box>
          ))}
        </Box>

        {/* Table rows */}
        {Array.from({ length: rows }).map((_, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 1 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ flex: 1 }}>
                <Skeleton variant="text" width="100%" height={40} />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    )
  }

  if (variant === 'form') {
    return (
      <Stack spacing={2}>
        {Array.from({ length: rows }).map((_, idx) => (
          <Box key={idx}>
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" width="100%" height={40} />
          </Box>
        ))}
      </Stack>
    )
  }

  // Card variant (default)
  return (
    <Stack spacing={2}>
      {Array.from({ length: rows }).map((_, idx) => (
        <Card
          key={idx}
          sx={{
            p: 2,
            height: height,
          }}
        >
          <Stack spacing={1}>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="90%" height={16} />
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}

export default LoadingSkeleton
