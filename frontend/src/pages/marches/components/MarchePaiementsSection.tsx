import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material'
import { marchesAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography, borders, componentStyles, getStatusConfig } from '@/lib/designSystem'
import { formatCurrency } from '@/lib/utils'

interface MarchePaiementsSectionProps {
  marcheId: number
}

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

/** Maps backend mode paiement codes to French labels */
const modePaiementLabels: Record<string, string> = {
  VIREMENT: 'Virement',
  CHEQUE: 'Cheque',
  ESPECES: 'Especes',
  AUTRE: 'Autre',
}

/**
 * MICRO-COMPONENT: MarchePaiementsSection
 * Displays all paiements linked to a marche via the chain:
 * Marche -> Decompte -> OrdrePaiement -> Paiement
 *
 * Endpoint: GET /marches/{id}/paiements
 */
const MarchePaiementsSection = ({ marcheId }: MarchePaiementsSectionProps) => {
  const { showError } = useToast()
  const [paiements, setPaiements] = useState<MarchePaiement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPaiements()
  }, [marcheId])

  const loadPaiements = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await marchesAPI.getPaiements(marcheId)
      const paiementsData = Array.isArray(data.data) ? data.data : data.data?.data || []
      setPaiements(paiementsData)
    } catch {
      showError('Impossible de charger les paiements')
      setError('Impossible de charger les paiements')
    } finally {
      setLoading(false)
    }
  }


  const formatDate = (date: string | null): string => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const totalPaye = paiements.reduce((sum, p) => sum + (p.montantPaye || 0), 0)

  return (
    <Box sx={{ ...componentStyles.card, p: 0, mb: 3, overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: colors.neutral[50],
          borderBottom: `1px solid ${colors.border}`,
          px: 3,
          py: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
          }}
        >
          Paiements
        </Typography>
        <Typography
          sx={{
            fontSize: typography.sizes.sm,
            color: colors.textSecondary,
          }}
        >
          {paiements.length} paiement(s)
          {totalPaye > 0 && ` - Total: ${formatCurrency(totalPaye)}`}
        </Typography>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : paiements.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Aucun paiement enregistre pour ce marche</Alert>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={componentStyles.listPage.tableHeader}>
                <TableCell>Reference</TableCell>
                <TableCell>Date Valeur</TableCell>
                <TableCell>Decompte</TableCell>
                <TableCell>Ordre Paiement</TableCell>
                <TableCell align="right">Montant</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paiements.map((paiement) => {
                const typeConfig = paiement.estPaiementPartiel
                  ? getStatusConfig('PAYE_PARTIEL')
                  : getStatusConfig('PAYE_TOTAL')

                return (
                  <TableRow
                    key={paiement.id}
                    sx={{
                      borderBottom: `1px solid ${colors.divider}`,
                      '&:hover': { bgcolor: colors.neutral[50] },
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <TableCell sx={{ color: colors.textPrimary, fontWeight: typography.weights.medium }}>
                      {paiement.referencePaiement}
                    </TableCell>
                    <TableCell sx={{ color: colors.textSecondary }}>
                      {formatDate(paiement.dateValeur)}
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: typography.sizes.sm,
                          color: colors.primary[600],
                          fontWeight: typography.weights.medium,
                        }}
                      >
                        {paiement.numeroDecompte}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: typography.sizes.sm,
                          color: colors.textSecondary,
                        }}
                      >
                        {paiement.numeroOP}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontSize: typography.sizes.base,
                          fontWeight: typography.weights.semibold,
                          color: colors.success[700],
                        }}
                      >
                        {formatCurrency(paiement.montantPaye ?? 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                        {modePaiementLabels[paiement.modePaiement] || paiement.modePaiement}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                          px: 1.5,
                          py: 0.25,
                          borderRadius: borders.radius.sm,
                          bgcolor: typeConfig.bgColor,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
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
                          {paiement.estPaiementPartiel ? 'Partiel' : 'Total'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default MarchePaiementsSection
