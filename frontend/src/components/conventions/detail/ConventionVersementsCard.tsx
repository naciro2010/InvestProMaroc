import {
  Box,
  Paper,
  Typography,
  Button,
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
import { Add, Edit, Delete, AccountBalance } from '@mui/icons-material'
import { colors, typography, componentStyles } from '@/lib/designSystem'

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
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR')

const ConventionVersementsCard = ({
  versements,
  onAdd,
  onEdit,
  onDelete,
}: ConventionVersementsCardProps) => {
  const totalVersements = versements.reduce((sum, v) => sum + v.montant, 0)
  const totalPrevu = versements.reduce((sum, v) => sum + (v.montantPrevu || 0), 0)

  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 3,
        py: 2,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: colors.warning[50],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AccountBalance sx={{ color: colors.warning[600], fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary, fontSize: typography.sizes.md }}>
            Versements previsionnels
          </Typography>
          {versements.length > 0 && (
            <Chip
              label={versements.length}
              size="small"
              sx={{
                bgcolor: colors.warning[100],
                color: colors.warning[700],
                fontWeight: typography.weights.semibold,
                fontSize: typography.sizes.xs,
                height: 22,
              }}
            />
          )}
        </Box>
        <Button
          size="small"
          startIcon={<Add />}
          variant="outlined"
          onClick={onAdd}
          sx={{
            borderColor: colors.primary[200],
            color: colors.primary[600],
            '&:hover': { borderColor: colors.primary[400], bgcolor: colors.primary[25] },
            textTransform: 'none',
            fontWeight: typography.weights.medium,
          }}
        >
          Ajouter
        </Button>
      </Box>

      {/* Table */}
      {versements.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Partenaire
                </TableCell>
                <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Volet / Tranche
                </TableCell>
                <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Date versement
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Montant prevu
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Montant reel
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ecart
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em', width: 90 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {versements.map((versement) => (
                <TableRow
                  key={versement.id}
                  sx={{
                    '&:hover': { bgcolor: colors.neutral[25] },
                    '&:last-child td': { borderBottom: 0 },
                  }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                      {versement.partenaireSigle || versement.partenaireNom || '-'}
                    </Typography>
                    {versement.partenaireSigle && versement.partenaireNom && (
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                        {versement.partenaireNom}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                      {versement.volet || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                      {formatDate(versement.dateVersement)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontSize: typography.sizes.sm, color: versement.montantPrevu ? colors.textPrimary : colors.textSecondary }}>
                      {versement.montantPrevu ? formatCurrency(versement.montantPrevu) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.sm, color: colors.success[600] }}>
                      {formatCurrency(versement.montant)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {versement.montantPrevu ? (
                      <Typography sx={{
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.medium,
                        color: versement.montant === versement.montantPrevu
                          ? colors.success[600]
                          : versement.montant > versement.montantPrevu
                            ? colors.danger[600]
                            : colors.info[600],
                      }}>
                        {formatCurrency(versement.montant - versement.montantPrevu)}
                      </Typography>
                    ) : (
                      <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(versement)}
                          sx={{ color: colors.primary[600], '&:hover': { bgcolor: colors.primary[25] } }}
                        >
                          <Edit sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(versement.id)}
                          sx={{ color: colors.danger[500], '&:hover': { bgcolor: colors.danger[25] } }}
                        >
                          <Delete sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {/* Total row */}
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell colSpan={3}>
                  <Typography sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                    Total
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                    {formatCurrency(totalPrevu)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm, color: colors.success[700] }}>
                    {formatCurrency(totalVersements)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {totalPrevu > 0 && (
                    <Typography sx={{
                      fontWeight: typography.weights.bold,
                      fontSize: typography.sizes.sm,
                      color: totalVersements === totalPrevu
                        ? colors.success[700]
                        : totalVersements > totalPrevu
                          ? colors.danger[700]
                          : colors.info[700],
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
      ) : (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <AccountBalance sx={{ fontSize: 40, color: colors.neutral[300], mb: 1.5 }} />
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
            Aucun versement previsionnel
          </Typography>
          <Button
            size="small"
            startIcon={<Add />}
            onClick={onAdd}
            sx={{ mt: 1.5, textTransform: 'none', color: colors.primary[600] }}
          >
            Ajouter un versement
          </Button>
        </Box>
      )}
    </Paper>
  )
}

export default ConventionVersementsCard
