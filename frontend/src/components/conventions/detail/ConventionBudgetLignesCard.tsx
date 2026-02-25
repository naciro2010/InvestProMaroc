import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  LinearProgress,
} from '@mui/material'
import { ReceiptLong } from '@mui/icons-material'
import { conventionsAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { ConventionBudgetLigneDTO, ApiResponse } from '@/types/api'

interface ConventionBudgetLignesCardProps {
  conventionId: number
}

const formatMAD = (value: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(value)

/**
 * ConventionBudgetLignesCard - Display of budget lines by expense category.
 * Micro-component: self-loads data via GET /conventions/{id}/budget-lignes.
 *
 * Improved: Shows visual percentage bars and better totals display.
 */
const ConventionBudgetLignesCard = ({ conventionId }: ConventionBudgetLignesCardProps) => {
  const [lignes, setLignes] = useState<ConventionBudgetLigneDTO[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await conventionsAPI.getBudgetLignes(conventionId)
      const data: ConventionBudgetLigneDTO[] =
        (res.data as ApiResponse<ConventionBudgetLigneDTO[]>).data ?? []
      setLignes(data)
    } catch {
      setLignes([])
    } finally {
      setLoading(false)
    }
  }, [conventionId])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={22} />
      </Box>
    )
  }

  if (lignes.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <ReceiptLong sx={{ fontSize: 36, color: colors.neutral[300], mb: 1 }} />
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          Aucune repartition par categorie de depenses
        </Typography>
      </Box>
    )
  }

  const totalMontant = lignes.reduce((sum: number, l: ConventionBudgetLigneDTO) => sum + l.montant, 0)
  const maxMontant = Math.max(...lignes.map((l: ConventionBudgetLigneDTO) => l.montant), 1)

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={componentStyles.table.header}>
            <TableCell sx={componentStyles.table.headerCell}>Categorie</TableCell>
            <TableCell sx={componentStyles.table.headerCell}>Designation</TableCell>
            <TableCell align="right" sx={componentStyles.table.headerCell}>Montant</TableCell>
            <TableCell sx={{ ...componentStyles.table.headerCell, width: 180 }}>Repartition</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lignes.map((ligne: ConventionBudgetLigneDTO) => {
            const pct = totalMontant > 0 ? (ligne.montant / totalMontant) * 100 : 0
            const barWidth = maxMontant > 0 ? (ligne.montant / maxMontant) * 100 : 0
            return (
              <TableRow key={ligne.id} sx={componentStyles.table.row}>
                <TableCell sx={componentStyles.table.cell}>
                  <Chip
                    label={ligne.categorieDepenseCode}
                    size="small"
                    variant="outlined"
                    sx={{ color: colors.primary[600], borderColor: colors.primary[200], fontSize: typography.sizes.xs }}
                  />
                </TableCell>
                <TableCell sx={componentStyles.table.cell}>
                  <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                    {ligne.designation || ligne.categorieDepenseLibelle}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={componentStyles.table.cell}>
                  <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                    {formatMAD(ligne.montant)}
                  </Typography>
                </TableCell>
                <TableCell sx={componentStyles.table.cell}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={barWidth}
                      sx={{
                        flex: 1, height: 6, borderRadius: 3,
                        bgcolor: colors.neutral[100],
                        '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: colors.primary[400] },
                      }}
                    />
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, minWidth: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {pct.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )
          })}
          {/* Total row */}
          <TableRow sx={{ bgcolor: colors.primary[25], '&:hover': { bgcolor: colors.primary[25] } }}>
            <TableCell colSpan={2} sx={{ fontWeight: typography.weights.bold, color: colors.primary[700], fontSize: typography.sizes.sm }}>
              TOTAL ({lignes.length} categorie{lignes.length !== 1 ? 's' : ''})
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm, fontVariantNumeric: 'tabular-nums' }}>
              {formatMAD(totalMontant)}
            </TableCell>
            <TableCell sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm }}>
              100%
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ConventionBudgetLignesCard
