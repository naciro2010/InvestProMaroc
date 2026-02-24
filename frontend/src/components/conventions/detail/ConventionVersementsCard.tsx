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
} from '@mui/material'
import { Edit, Delete, AccountBalance } from '@mui/icons-material'
import { colors, typography } from '@/lib/designSystem'

interface VersementPrevisionnel {
  id: number
  partenaireId?: number
  partenaireNom?: string
  partenaireSigle?: string
  volet?: string
  dateVersement: string
  montant: number
  montantPrevu?: number
  remarques?: string
}

interface ConventionVersementsCardProps {
  versements: VersementPrevisionnel[]
  onAdd: () => void
  onEdit: (versement: VersementPrevisionnel) => void
  onDelete: (versementId: number) => void
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR')

/**
 * ConventionVersementsCard - Pure content for ResizableSection.
 * No Paper wrapper or redundant header.
 */
const ConventionVersementsCard = ({
  versements,
  onAdd,
  onEdit,
  onDelete,
}: ConventionVersementsCardProps) => {
  const totalVersements = versements.reduce((sum, v) => sum + v.montant, 0)
  const totalPrevu = versements.reduce((sum, v) => sum + (v.montantPrevu || 0), 0)

  if (versements.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <AccountBalance sx={{ fontSize: 36, color: colors.neutral[300], mb: 1 }} />
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          Aucun versement previsionnel
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: colors.neutral[50] }}>
            <TableCell sx={thStyle}>Partenaire</TableCell>
            <TableCell sx={thStyle}>Volet / Tranche</TableCell>
            <TableCell sx={thStyle}>Date versement</TableCell>
            <TableCell align="right" sx={thStyle}>Montant prevu</TableCell>
            <TableCell align="right" sx={thStyle}>Montant reel</TableCell>
            <TableCell align="right" sx={thStyle}>Ecart</TableCell>
            <TableCell align="center" sx={{ ...thStyle, width: 80 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {versements.map(v => (
            <TableRow key={v.id} sx={{ '&:hover': { bgcolor: colors.neutral[25] } }}>
              <TableCell>
                <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                  {v.partenaireSigle || v.partenaireNom || '-'}
                </Typography>
                {v.partenaireSigle && v.partenaireNom && (
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{v.partenaireNom}</Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>{v.volet || '-'}</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>{formatDate(v.dateVersement)}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontSize: typography.sizes.sm, color: v.montantPrevu ? colors.textPrimary : colors.textSecondary }}>
                  {v.montantPrevu ? formatCurrency(v.montantPrevu) : '-'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.sm, color: colors.success[600] }}>
                  {formatCurrency(v.montant)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {v.montantPrevu ? (
                  <Typography sx={{
                    fontSize: typography.sizes.sm, fontWeight: typography.weights.medium,
                    color: v.montant === v.montantPrevu ? colors.success[600]
                      : v.montant > v.montantPrevu ? colors.danger[600] : colors.info[600],
                  }}>
                    {formatCurrency(v.montant - v.montantPrevu)}
                  </Typography>
                ) : (
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>-</Typography>
                )}
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                  <Tooltip title="Modifier">
                    <IconButton size="small" onClick={() => onEdit(v)} sx={{ color: colors.primary[600] }}>
                      <Edit sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" onClick={() => onDelete(v.id)} sx={{ color: colors.danger[500] }}>
                      <Delete sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {/* Total */}
          <TableRow sx={{ bgcolor: colors.neutral[50], '& td': { borderBottom: 0 } }}>
            <TableCell colSpan={3} sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm }}>Total</TableCell>
            <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm }}>
              {formatCurrency(totalPrevu)}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm, color: colors.success[700] }}>
              {formatCurrency(totalVersements)}
            </TableCell>
            <TableCell align="right">
              {totalPrevu > 0 && (
                <Typography sx={{
                  fontWeight: typography.weights.bold, fontSize: typography.sizes.sm,
                  color: totalVersements === totalPrevu ? colors.success[700]
                    : totalVersements > totalPrevu ? colors.danger[700] : colors.info[700],
                }}>
                  {formatCurrency(totalVersements - totalPrevu)}
                </Typography>
              )}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const thStyle = {
  fontWeight: typography.weights.semibold,
  fontSize: typography.sizes.xs,
  color: colors.textSecondary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}

export default ConventionVersementsCard
