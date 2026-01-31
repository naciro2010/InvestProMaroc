import React, { ReactNode } from 'react'
import { Box, Container, Typography, useTheme, useMediaQuery } from '@mui/material'
import { colors } from '@/lib/designSystem'

// Simple helper for primary gradient (maintains consistency with design system)
const getPrimaryGradient = () => `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`

export interface PageLayoutProps {
  /**
   * Page title displayed in the header
   */
  title?: string

  /**
   * Page subtitle/description displayed below title
   */
  subtitle?: string

  /**
   * Action buttons or elements displayed on the right side of header
   */
  actions?: ReactNode

  /**
   * Page content
   */
  children: ReactNode

  /**
   * Optional CSS class for custom styling
   */
  className?: string

  /**
   * Show gradient header background
   */
  showGradient?: boolean

  /**
   * Header background color override
   */
  headerBg?: string
}

/**
 * PageLayout Component
 *
 * Provides consistent page structure with:
 * - Unified header with title, subtitle, and action buttons
 * - Consistent spacing and padding
 * - Responsive design for mobile/tablet/desktop
 * - Optional gradient background
 *
 * Usage:
 * ```tsx
 * <PageLayout
 *   title="Conventions"
 *   subtitle="Manage your business conventions"
 *   actions={<Button variant="contained">Create</Button>}
 * >
 *   <DataTable data={conventions} />
 * </PageLayout>
 * ```
 */
export function PageLayout({
  title,
  subtitle,
  actions,
  children,
  className,
  showGradient = true,
  headerBg,
}: PageLayoutProps): React.ReactElement {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
      className={className}
    >
      {/* Header Section */}
      {(title || subtitle || actions) && (
        <Box
          sx={{
            background: headerBg || (showGradient ? getPrimaryGradient() : colors.surface),
            color: showGradient ? 'white' : 'text.primary',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 3, sm: 4, md: 5 },
            borderBottom: !showGradient ? `1px solid ${theme.palette.divider}` : 'none',
            boxShadow: showGradient ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: { xs: 2, sm: 3, md: 4 },
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              {/* Title Section */}
              <Box sx={{ flex: 1 }}>
                {title && (
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      mb: subtitle ? 1 : 0,
                      fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: showGradient ? 0.9 : 0.7,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      lineHeight: 1.5,
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>

              {/* Actions Section */}
              {actions && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                  }}
                >
                  {actions}
                </Box>
              )}
            </Box>
          </Container>
        </Box>
      )}

      {/* Content Section */}
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 3, sm: 4, md: 5 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {children}
      </Container>
    </Box>
  )
}

/**
 * Exported component variants for common use cases
 */

/**
 * SimplePageLayout - Minimal header without gradient
 */
export function SimplePageLayout({
  title,
  subtitle,
  actions,
  children,
}: Omit<PageLayoutProps, 'showGradient'>): React.ReactElement {
  return (
    <PageLayout
      title={title}
      subtitle={subtitle}
      actions={actions}
      showGradient={false}
    >
      {children}
    </PageLayout>
  )
}

/**
 * DetailPageLayout - For detail/show pages with back button typically
 */
export function DetailPageLayout({
  title,
  subtitle,
  actions,
  children,
}: PageLayoutProps): React.ReactElement {
  return (
    <PageLayout
      title={title}
      subtitle={subtitle}
      actions={actions}
      showGradient={true}
      headerBg={getPrimaryGradient()}
    >
      {children}
    </PageLayout>
  )
}

export default PageLayout
