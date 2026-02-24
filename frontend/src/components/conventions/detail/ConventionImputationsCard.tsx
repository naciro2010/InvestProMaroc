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
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material'
import { Delete, TrendingUp, Schedule } from '@mui/icons-material'
import { conventionsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'
import ImputationFormDialog from './ImputationFormDialog'

interface ImputationPrevisionnelle {
  id: number
  conventionId: number
  volet?: string
  dateDemarrage: string
  delaiMois: number
  dateFinPrevue?: string
  montantPrevu?: number
  remarques?: string
}

interface ConventionImputationsCardProps {
  conventionId: number
  onRefresh?: () => void
}

const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '-'

const calculateEndDate = (startDate: string, delaiMois: number): string => {
  const date = new Date(startDate)
  date.setMonth(date.getMonth() + delaiMois)
  return date.toLocaleDateString('fr-FR')
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

/**
 * ConventionImputationsCard - Pure content for ResizableSection.
 * No Paper wrapper or redundant header. Dialog extracted to ImputationFormDialog.
 */
const ConventionImputationsCard = ({ conventionId, onRefresh }: ConventionImputationsCardProps) => {
  const [imputations, setImputations] = useState<ImputationPrevisionnelle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await conventionsAPI.getImputations(conventionId)
        setImputations(res.data.data || [])
        setError(null)
      } catch {
        setError('Erreur lors du chargement des imputations')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [conventionId])

  const handleDelete = async (imputationId: number) => {
    if (!window.confirm('Supprimer cette imputation ?')) return
    try {
      await conventionsAPI.supprimerImputation(conventionId, imputationId)
      setImputations(prev => prev.filter(i => i.id !== imputationId))
      onRefresh?.()
    } catch {
      setError('Erreur lors de la suppression')
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
  if (error) return <Alert severity="error">{error}</Alert>

  if (imputations.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <TrendingUp sx={{ fontSize: 36, color: colors.neutral[300], mb: 1 }} />
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          Aucune imputation previsionnelle
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: colors.neutral[50] }}>
              <TableCell sx={thStyle}>Volet</TableCell>
              <TableCell sx={thStyle}>Date demarrage</TableCell>
              <TableCell sx={thStyle}>Delai</TableCell>
              <TableCell sx={thStyle}>Date fin prevue</TableCell>
              <TableCell align="right" sx={thStyle}>Montant prevu</TableCell>
              <TableCell sx={thStyle}>Remarques</TableCell>
              <TableCell align="center" sx={{ ...thStyle, width: 60 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {imputations.map(imp => (
              <TableRow key={imp.id} sx={{ '&:hover': { bgcolor: colors.neutral[25] } }}>
                <TableCell>
                  {imp.volet ? (
                    <Chip label={imp.volet} size="small"
                      sx={{ bgcolor: colors.purple[50], color: colors.purple[700], fontSize: typography.sizes.xs, height: 22 }} />
                  ) : (
                    <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>-</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: typography.sizes.sm }}>{formatDate(imp.dateDemarrage)}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Schedule sx={{ fontSize: 14, color: colors.textSecondary }} />
                    <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>{imp.delaiMois} mois</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: typography.sizes.sm }}>
                    {imp.dateFinPrevue ? formatDate(imp.dateFinPrevue) : calculateEndDate(imp.dateDemarrage, imp.delaiMois)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>
                    {imp.montantPrevu ? formatCurrency(imp.montantPrevu) : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {imp.remarques || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Supprimer">
                    <IconButton size="small" onClick={() => handleDelete(imp.id)} sx={{ color: colors.danger[500] }}>
                      <Delete sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ImputationFormDialog
        open={dialogOpen} conventionId={conventionId}
        onClose={() => setDialogOpen(false)}
        onSuccess={(newImp) => { setImputations(prev => [...prev, newImp]); setDialogOpen(false); onRefresh?.() }}
      />
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

export default ConventionImputationsCard
