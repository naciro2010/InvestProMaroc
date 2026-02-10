import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'
import { Security } from '@mui/icons-material'
import { decomptesAPI } from '@/lib/api'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'

// ==================== TYPES ====================

interface DecompteRetenuesCardProps {
  decompteId: number
}

interface DecompteRetenue {
  id: number
  decompteId: number
  typeRetenue: string
  montant: number
  tauxPourcent: number | null
  libelle: string | null
  actif: boolean
  createdAt: string | null
  updatedAt: string | null
}

type RetenueType = 'GARANTIE' | 'RAS' | 'PENALITES' | 'AVANCES'

// ==================== HELPERS ====================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' MAD'
}

const RETENUE_CONFIG: Record<RetenueType, { label: string; color: string; bgColor: string }> = {
  GARANTIE: {
    label: 'Retenue de Garantie',
    color: colors.info[700],
    bgColor: colors.info[50],
  },
  RAS: {
    label: 'Retenue a la Source',
    color: colors.purple[700],
    bgColor: colors.purple[50],
  },
  PENALITES: {
    label: 'Penalites',
    color: colors.danger[700],
    bgColor: colors.danger[50],
  },
  AVANCES: {
    label: 'Remboursement Avances',
    color: colors.warning[700],
    bgColor: colors.warning[50],
  },
}

const getRetenueConfig = (type: string) => {
  return RETENUE_CONFIG[type as RetenueType] || {
    label: type,
    color: colors.gray[700],
    bgColor: colors.gray[50],
  }
}

// ==================== COMPONENT ====================

/**
 * MICRO-COMPONENT: DecompteRetenuesCard
 * Loads retenues independently via GET /api/decomptes/{id}/retenues
 * Displays retenues table with type, taux, and montant.
 */
const DecompteRetenuesCard = ({ decompteId }: DecompteRetenuesCardProps) => {
  const [retenues, setRetenues] = useState<DecompteRetenue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRetenues = async () => {
      try {
        setLoading(true)
        const { data } = await decomptesAPI.getRetenues(decompteId)
        const retenuesData = data.data || data
        setRetenues(Array.isArray(retenuesData) ? retenuesData : [])
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue'
        console.error('Erreur chargement retenues:', message)
      } finally {
        setLoading(false)
      }
    }
    loadRetenues()
  }, [decompteId])

  const totalRetenues = retenues.reduce((acc, r) => acc + (r.montant || 0), 0)

  if (loading) {
    return (
      <Box sx={{ ...componentStyles.card, p: 3, mb: 3, textAlign: 'center' }}>
        <CircularProgress size={30} />
      </Box>
    )
  }

  return (
    <Box sx={{ ...componentStyles.card, p: 3, mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.lg, color: colors.gray[800] }}>
          Retenues
        </Typography>
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.gray[500] }}>
          {retenues.length} retenue(s)
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2.5 }} />

      {retenues.length > 0 ? (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, color: colors.gray[500], textTransform: 'uppercase', borderBottom: `1px solid ${colors.neutral[200]}` } }}>
                  <TableCell>Type</TableCell>
                  <TableCell>Libelle</TableCell>
                  <TableCell align="center">Taux %</TableCell>
                  <TableCell align="right">Montant</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {retenues.map((retenue) => {
                  const config = getRetenueConfig(retenue.typeRetenue)
                  return (
                    <TableRow key={retenue.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell>
                        <Chip
                          label={config.label}
                          size="small"
                          sx={{
                            fontWeight: typography.weights.medium,
                            fontSize: typography.sizes.xs,
                            color: config.color,
                            bgcolor: config.bgColor,
                            border: 'none',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.gray[700] }}>
                          {retenue.libelle || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.gray[700] }}>
                          {retenue.tauxPourcent !== null ? `${retenue.tauxPourcent}%` : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.danger[600] }}>
                          {formatCurrency(retenue.montant)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Total row */}
          <Box sx={{
            mt: 2,
            p: 2,
            bgcolor: colors.danger[25],
            borderRadius: borders.radius.md,
            border: `1px solid ${colors.danger[100]}`,
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontWeight: typography.weights.semibold, color: colors.gray[700] }}>
                Total Retenues
              </Typography>
              <Typography sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.lg, color: colors.danger[600] }}>
                {formatCurrency(totalRetenues)}
              </Typography>
            </Stack>
          </Box>
        </>
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Security sx={{ fontSize: 40, color: colors.gray[300], mb: 1 }} />
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.gray[500] }}>
            Aucune retenue appliquee
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default DecompteRetenuesCard
