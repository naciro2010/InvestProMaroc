import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material'
import { Visibility, History } from '@mui/icons-material'
import StatusBadge from '@/components/core/StatusBadge'
import { colors, typography } from '@/lib/designSystem'

interface Convention {
  id: number
  numero: string
  dateSignature: string
  budget: number
}

interface Avenant {
  id: number
  numeroAvenant: string
  dateAvenant: string
  statut: string
  objet: string
  type: string
}

interface ConventionAvenantsTabProps {
  convention: Convention
  avenants: Avenant[]
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
  getStatusColor: (statut: string) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

/**
 * ConventionAvenantsTab - Avenants list using design system tokens.
 * Odoo-inspired: clean table with StatusBadge, consistent typography.
 */
const ConventionAvenantsTab = ({ convention, avenants, formatCurrency, formatDate }: ConventionAvenantsTabProps) => {
  const navigate = useNavigate()

  if (avenants.length === 0) {
    return (
      <Box sx={{ py: 5, textAlign: 'center' }}>
        <History sx={{ fontSize: 40, color: colors.neutral[300], mb: 1.5 }} />
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 0.5 }}>
          Aucun avenant pour cette convention
        </Typography>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
          Les modifications futures seront enregistrees comme avenants
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ px: { xs: 1, md: 2 } }}>
      {/* Convention reference */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, px: 1 }}>
        <History sx={{ fontSize: 16, color: colors.info[500] }} />
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          Convention initiale : <strong>{convention.numero}</strong> - Signee le {formatDate(convention.dateSignature)} - {formatCurrency(convention.budget)}
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: colors.neutral[50] }}>
              <TableCell sx={thStyle}>Numero</TableCell>
              <TableCell sx={thStyle}>Objet</TableCell>
              <TableCell sx={thStyle}>Type</TableCell>
              <TableCell sx={thStyle}>Date</TableCell>
              <TableCell sx={thStyle}>Statut</TableCell>
              <TableCell align="center" sx={{ ...thStyle, width: 70 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {avenants.map((avenant, index) => (
              <TableRow key={avenant.id} sx={{ '&:hover': { bgcolor: colors.neutral[25] }, cursor: 'pointer' }}
                onClick={() => navigate(`/conventions/${convention.id}/avenants/${avenant.id}`)}>
                <TableCell>
                  <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.primary[600] }}>
                    {avenant.numeroAvenant}
                  </Typography>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Avenant #{index + 1}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {avenant.objet}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={avenant.type} size="small" variant="outlined"
                    sx={{ fontSize: typography.sizes.xs, height: 22, borderColor: colors.neutral[300] }} />
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>{formatDate(avenant.dateAvenant)}</Typography>
                </TableCell>
                <TableCell>
                  <StatusBadge status={avenant.statut} size="small" />
                </TableCell>
                <TableCell align="center" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                  <Tooltip title="Voir les details">
                    <IconButton size="small" onClick={() => navigate(`/conventions/${convention.id}/avenants/${avenant.id}`)}
                      sx={{ color: colors.primary[600] }}>
                      <Visibility sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

const thStyle = {
  fontWeight: typography.weights.semibold,
  fontSize: typography.sizes.xs,
  color: colors.textSecondary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}

export default ConventionAvenantsTab
