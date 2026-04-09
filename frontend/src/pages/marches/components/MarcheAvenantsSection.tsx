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
import { marchesAPI } from '../../../lib/api'
import { useToast } from '@/contexts/ToastContext'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { colors, typography, borders, componentStyles, getStatusConfig } from '@/lib/designSystem'
import { formatCurrency } from '@/lib/utils'

interface MarcheAvenantsSectionProps {
  marcheId: number
}

// Interface matching backend AvenantMarcheDTO exactly
interface Avenant {
  id: number
  marcheId: number
  numeroAvenant: string
  dateAvenant: string
  objet: string
  montantAvant: number | null
  montantApres: number | null
  impact: number | null
  statut: string
  actif: boolean
}

/**
 * MICRO-COMPONENT: MarcheAvenantsSection
 * Charge uniquement les avenants du marché
 * Endpoint: GET /marches/{id}/avenants
 */
const MarcheAvenantsSection = ({ marcheId }: MarcheAvenantsSectionProps) => {
  const { showError } = useToast()
  const [avenants, setAvenants] = useState<Avenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAvenants()
  }, [marcheId])

  const loadAvenants = async () => {
    try {
      setLoading(true)
      setError(null)
      // Micro-endpoint dédié aux avenants d'un marché
      // Endpoint: GET /marches/{id}/avenants
      const { data } = await marchesAPI.getAvenants(marcheId)
      const avenantsData = Array.isArray(data.data) ? data.data : data.data?.data || []
      setAvenants(avenantsData)
    } catch {
      showError('Impossible de charger les avenants')
      setError('Impossible de charger les avenants')
    } finally {
      setLoading(false)
    }
  }


  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR')
  }

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
            Avenants
          </Typography>
          <Typography
            sx={{
              fontSize: typography.sizes.sm,
              color: colors.textSecondary,
            }}
          >
            {avenants.length} avenant(s)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => alert('Création d\'avenant - À implémenter')}
          sx={componentStyles.buttonPrimary}
          size="small"
        >
          Nouvel Avenant
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
      ) : avenants.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Aucun avenant pour ce marché</Alert>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={componentStyles.listPage.tableHeader}>
                <TableCell>Numéro</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Objet</TableCell>
                <TableCell align="right">Impact</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {avenants.map((avenant) => {
                const statusConfig = getStatusConfig(avenant.statut)
                const impactValue = avenant.impact ?? 0
                return (
                  <TableRow
                    key={avenant.id}
                    sx={{
                      borderBottom: `1px solid ${colors.divider}`,
                      '&:hover': { bgcolor: colors.neutral[50] },
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <TableCell sx={{ color: colors.textPrimary, fontWeight: typography.weights.medium }}>
                      {avenant.numeroAvenant}
                    </TableCell>
                    <TableCell sx={{ color: colors.textSecondary }}>
                      {formatDate(avenant.dateAvenant)}
                    </TableCell>
                    <TableCell sx={{ color: colors.textPrimary }}>
                      <RichTextDisplay html={avenant.objet} variant="inline" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontSize: typography.sizes.base,
                          fontWeight: typography.weights.semibold,
                          color: impactValue >= 0 ? colors.success[700] : colors.danger[700],
                        }}
                      >
                        {impactValue >= 0 ? '+' : ''}
                        {formatCurrency(avenant.impact ?? 0)}
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

export default MarcheAvenantsSection
