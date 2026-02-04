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
  Button,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { marchesAPI } from '../../../lib/api'
import { colors, typography, borders, componentStyles, getStatusConfig } from '@/lib/designSystem'

interface MarcheDecomptesSectionProps {
  marcheId: number
}

// Interface matching backend DecompteSimpleDTO exactly
interface Decompte {
  id: number
  numeroDecompte: string
  dateDecompte: string
  statut: string
  netAPayer: number
  montantPaye: number
  estSolde: boolean
  actif: boolean
}

/**
 * MICRO-COMPONENT: MarcheDecomptesSection
 * Design: Atlassian/Confluence style table
 * Charge uniquement les décomptes du marché
 * Endpoint: GET /marches/{id}/decomptes
 */
const MarcheDecomptesSection = ({ marcheId }: MarcheDecomptesSectionProps) => {
  const navigate = useNavigate()
  const [decomptes, setDecomptes] = useState<Decompte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDecomptes()
  }, [marcheId])

  const loadDecomptes = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await marchesAPI.getDecomptes(marcheId)
      const decomptesData = Array.isArray(data.data) ? data.data : data.data?.data || []
      setDecomptes(decomptesData)
    } catch (err) {
      console.error('Erreur chargement décomptes:', err)
      setError('Impossible de charger les décomptes')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return '0,00'
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const totalDecomptes = decomptes.reduce((sum, d) => sum + (d.netAPayer || 0), 0)

  return (
    <Box sx={{ ...componentStyles.card, p: 0, mb: 3, overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: colors.neutral[50],
          borderBottom: `1px solid ${colors.border}`,
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: colors.textPrimary,
            }}
          >
            Décomptes
          </Typography>
          <Typography
            sx={{
              fontSize: typography.sizes.sm,
              color: colors.textSecondary,
            }}
          >
            {decomptes.length} décompte(s) - Total: {formatCurrency(totalDecomptes)} DH
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/decomptes/nouveau')}
          sx={componentStyles.buttonPrimary}
          size="small"
        >
          Nouveau Décompte
        </Button>
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
      ) : decomptes.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Aucun décompte pour ce marché</Alert>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={componentStyles.listPage.tableHeader}>
                <TableCell>Numéro</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Net à Payer</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {decomptes.map((decompte) => {
                const statusConfig = getStatusConfig(decompte.statut)
                return (
                  <TableRow
                    key={decompte.id}
                    sx={{
                      borderBottom: `1px solid ${colors.divider}`,
                      '&:hover': { bgcolor: colors.neutral[50] },
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <TableCell sx={{ color: colors.textPrimary, fontWeight: typography.weights.medium }}>
                      {decompte.numeroDecompte}
                    </TableCell>
                    <TableCell sx={{ color: colors.textSecondary }}>
                      {formatDate(decompte.dateDecompte)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontSize: typography.sizes.base,
                          fontWeight: typography.weights.semibold,
                          color: colors.primary[700],
                        }}
                      >
                        {formatCurrency(decompte.netAPayer)} DH
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
                          bgcolor: statusConfig.bgColor,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: statusConfig.dotColor,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: typography.sizes.xs,
                            fontWeight: typography.weights.semibold,
                            color: statusConfig.textColor,
                          }}
                        >
                          {statusConfig.label}
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

export default MarcheDecomptesSection
