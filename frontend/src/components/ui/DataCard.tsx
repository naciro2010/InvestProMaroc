import { ReactNode } from 'react'
import { Paper, Box, Typography, Stack, Divider } from '@mui/material'

interface DataRowProps {
  label: string
  value: ReactNode
  fullWidth?: boolean
}

interface DataCardProps {
  title?: string
  children: ReactNode
  actions?: ReactNode
}

/**
 * DataRow - Single row in DataCard
 *
 * Label-value pair with clean layout
 */
export const DataRow = ({ label, value, fullWidth = false }: DataRowProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: fullWidth ? 'column' : { xs: 'column', sm: 'row' },
        gap: fullWidth ? 0.5 : { xs: 0.5, sm: 2 },
        py: 1.5,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          minWidth: fullWidth ? 'auto' : { xs: 'auto', sm: 180 },
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'text.primary',
          flex: 1,
        }}
      >
        {value || '—'}
      </Typography>
    </Box>
  )
}

/**
 * Odoo-style Data Card Component
 *
 * Clean card for displaying read-only data:
 * - Optional title with actions
 * - Clean data rows with label-value pairs
 * - Subtle borders, white background
 * - No shadows (or very subtle)
 * - Responsive layout (stacked on mobile)
 *
 * @example
 * <DataCard title="Informations générales">
 *   <DataRow label="Code" value={convention.code} />
 *   <DataRow label="Objet" value={convention.objet} fullWidth />
 *   <DataRow label="Montant" value={formatCurrency(convention.montant)} />
 * </DataCard>
 */
const DataCard = ({ title, children, actions }: DataCardProps) => {
  return (
    <Paper
      sx={{
        border: 1,
        borderColor: 'divider',
        boxShadow: 'none',
        backgroundColor: 'background.paper',
      }}
    >
      {/* Card Header */}
      {(title || actions) && (
        <>
          <Box sx={{ px: 3, py: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {title && (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {title}
                </Typography>
              )}
              {actions && <Box>{actions}</Box>}
            </Stack>
          </Box>
          <Divider />
        </>
      )}

      {/* Card Content */}
      <Box sx={{ px: 3, py: 2 }}>{children}</Box>
    </Paper>
  )
}

export default DataCard
