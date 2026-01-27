import { ReactNode } from 'react'
import { Box, Typography, Stack, Chip } from '@mui/material'
import { ChevronRight } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { colors, typography, spacing, componentStyles } from '@/lib/designSystem'

// ==================== TYPES ====================

export interface BreadcrumbItem {
  label: string
  path?: string
}

type ChipColor = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'

interface PageHeaderProps {
  /** Titre principal de la page */
  title: string
  /** Sous-titre descriptif (optionnel) */
  subtitle?: string
  /** Fil d'Ariane - navigation hiérarchique */
  breadcrumbs?: BreadcrumbItem[]
  /** Badge de statut à côté du titre */
  status?: {
    label: string
    color: ChipColor
  }
  /** Boutons d'action (à droite du titre) */
  actions?: ReactNode
  /** Contenu additionnel sous le titre (filtres, onglets...) */
  children?: ReactNode
}

/**
 * PageHeader - En-tête de page standard.
 *
 * Composant micro-frontend qui encapsule:
 * - Breadcrumbs (fil d'Ariane)
 * - Titre + statut
 * - Sous-titre
 * - Actions (boutons)
 * - Contenu additionnel (filtres, onglets)
 *
 * Principes:
 * - Fond blanc, bordure bottom subtile
 * - Pas de gradient, pas d'emojis
 * - Espacement cohérent (base 8px)
 * - Responsive (stack vertical sur mobile)
 *
 * @example
 * <PageHeader
 *   title="Conventions"
 *   subtitle="Gérer les conventions de financement"
 *   breadcrumbs={[
 *     { label: 'Accueil', path: '/dashboard' },
 *     { label: 'Conventions' },
 *   ]}
 *   actions={<Button>Nouvelle Convention</Button>}
 * />
 */
const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  status,
  actions,
  children,
}: PageHeaderProps) => {
  return (
    <Box sx={componentStyles.pageHeader}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Box
          component="nav"
          aria-label="breadcrumb"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1

            return (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {index > 0 && (
                  <ChevronRight
                    size={14}
                    style={{ color: colors.gray[400], flexShrink: 0 }}
                  />
                )}
                {isLast || !item.path ? (
                  <Typography
                    sx={{
                      fontSize: typography.sizes.sm,
                      color: isLast ? colors.gray[800] : colors.gray[500],
                      fontWeight: isLast ? typography.weights.medium : typography.weights.normal,
                    }}
                  >
                    {item.label}
                  </Typography>
                ) : (
                  <Box
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      fontSize: typography.sizes.sm,
                      color: colors.gray[500],
                      textDecoration: 'none',
                      '&:hover': {
                        color: colors.primary[600],
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {item.label}
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>
      )}

      {/* Title Row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
      >
        {/* Title + Status */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
            <Typography
              variant="h5"
              sx={{
                fontWeight: typography.weights.semibold,
                color: colors.gray[900],
                letterSpacing: '-0.01em',
                lineHeight: typography.lineHeights.tight,
              }}
            >
              {title}
            </Typography>
            {status && (
              <Chip
                label={status.label}
                color={status.color}
                size="small"
                sx={{
                  fontWeight: typography.weights.medium,
                  fontSize: typography.sizes.xs,
                  height: 24,
                }}
              />
            )}
          </Stack>
          {subtitle && (
            <Typography
              sx={{
                color: colors.gray[500],
                fontSize: typography.sizes.base,
                mt: 0.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        {actions && (
          <Stack direction="row" spacing={1} flexShrink={0}>
            {actions}
          </Stack>
        )}
      </Stack>

      {/* Children (filters, tabs, etc.) */}
      {children && (
        <Box sx={{ mt: spacing.mui.lg }}>
          {children}
        </Box>
      )}
    </Box>
  )
}

export default PageHeader
