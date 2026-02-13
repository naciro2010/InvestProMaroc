import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Collapse,
} from '@mui/material'
import { colors, typography, borders, getStatusConfig } from '@/lib/designSystem'

/** Matches backend MarchePaiementDTO */
interface MarchePaiement {
  id: number
  referencePaiement: string
  dateValeur: string
  dateExecution: string | null
  montantPaye: number
  modePaiement: string
  estPaiementPartiel: boolean
  decompteId: number
  numeroDecompte: string
  ordrePaiementId: number
  numeroOP: string
  observations: string | null
}

interface DecomptePaiementsSubRowProps {
  open: boolean
  paiements: MarchePaiement[]
  colSpan: number
}

const modePaiementLabels: Record<string, string> = {
  VIREMENT: 'Virement',
  CHEQUE: 'Cheque',
  ESPECES: 'Especes',
  AUTRE: 'Autre',
}

const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '0,00'
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatDate = (date: string | null): string => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR')
}

/**
 * MICRO-COMPONENT: DecomptePaiementsSubRow
 * Displays paiements for a single decompte as an expandable sub-table.
 * Used inside MarcheDecomptesSection cascade view.
 */
const DecomptePaiementsSubRow = ({ open, paiements, colSpan }: DecomptePaiementsSubRowProps) => {
  return (
    <TableRow>
      <TableCell sx={{ py: 0, border: 'none' }} colSpan={colSpan}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ px: 2, py: 1.5, bgcolor: colors.neutral[25] }}>
            {paiements.length === 0 ? (
              <Typography
                sx={{
                  fontSize: typography.sizes.sm,
                  color: colors.textSecondary,
                  fontStyle: 'italic',
                  py: 1,
                }}
              >
                Aucun paiement enregistre pour ce decompte
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.semibold,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${colors.border}`,
                        py: 0.75,
                      }}
                    >
                      Reference
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.semibold,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${colors.border}`,
                        py: 0.75,
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.semibold,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${colors.border}`,
                        py: 0.75,
                      }}
                    >
                      Ordre Paiement
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.semibold,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${colors.border}`,
                        py: 0.75,
                      }}
                    >
                      Montant
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.semibold,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${colors.border}`,
                        py: 0.75,
                      }}
                    >
                      Mode
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.semibold,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${colors.border}`,
                        py: 0.75,
                      }}
                    >
                      Type
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paiements.map((p) => {
                    const typeConfig = p.estPaiementPartiel
                      ? getStatusConfig('PAYE_PARTIEL')
                      : getStatusConfig('PAYE_TOTAL')

                    return (
                      <TableRow
                        key={p.id}
                        sx={{
                          '&:last-child td': { borderBottom: 'none' },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontSize: typography.sizes.sm,
                            color: colors.textPrimary,
                            fontWeight: typography.weights.medium,
                            py: 0.75,
                          }}
                        >
                          {p.referencePaiement}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: typography.sizes.sm,
                            color: colors.textSecondary,
                            py: 0.75,
                          }}
                        >
                          {formatDate(p.dateValeur)}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: typography.sizes.sm,
                            color: colors.textSecondary,
                            py: 0.75,
                          }}
                        >
                          {p.numeroOP}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontSize: typography.sizes.sm,
                            fontWeight: typography.weights.semibold,
                            color: colors.success[700],
                            py: 0.75,
                          }}
                        >
                          {formatCurrency(p.montantPaye)} DH
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: typography.sizes.sm,
                            color: colors.textSecondary,
                            py: 0.75,
                          }}
                        >
                          {modePaiementLabels[p.modePaiement] || p.modePaiement}
                        </TableCell>
                        <TableCell sx={{ py: 0.75 }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 1,
                              py: 0.25,
                              borderRadius: borders.radius.sm,
                              bgcolor: typeConfig.bgColor,
                            }}
                          >
                            <Box
                              sx={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                bgcolor: typeConfig.dotColor,
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: typography.sizes.xs,
                                fontWeight: typography.weights.semibold,
                                color: typeConfig.textColor,
                              }}
                            >
                              {p.estPaiementPartiel ? 'Partiel' : 'Total'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  )
}

export default DecomptePaiementsSubRow
