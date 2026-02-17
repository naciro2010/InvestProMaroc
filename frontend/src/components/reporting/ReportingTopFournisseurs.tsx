import { useState, useEffect } from 'react'
import {
  Box, Typography, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, LinearProgress, Stack,
} from '@mui/material'
import { colors, typography, componentStyles, spacing, borders } from '@/lib/designSystem'
import { reportingAPI, TopFournisseurStatsDTO } from '@/lib/api'

const formatMontant = (montant: number): string => {
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(2)} M MAD`
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K MAD`
  return `${montant.toFixed(2)} MAD`
}

interface ReportingTopFournisseursProps {
  refreshKey: number
}

const ReportingTopFournisseurs = ({ refreshKey }: ReportingTopFournisseursProps) => {
  const [fournisseurs, setFournisseurs] = useState<TopFournisseurStatsDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data } = await reportingAPI.getDashboard()
        if (data.data?.topFournisseurs) setFournisseurs(data.data.topFournisseurs)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        console.error('Erreur chargement fournisseurs:', msg)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [refreshKey])

  const maxMontant = fournisseurs.length > 0
    ? Math.max(...fournisseurs.map((f) => f.montantTotal))
    : 1

  return (
    <Box sx={componentStyles.sectionCard}>
      <Box sx={componentStyles.sectionCardHeader}>
        <Typography sx={{
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
        }}>
          Top Fournisseurs
        </Typography>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
          Par volume de depenses
        </Typography>
      </Box>
      <Box sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: spacing.mui['3xl'] }}>
            <CircularProgress size={28} />
          </Box>
        ) : fournisseurs.length === 0 ? (
          <Box sx={componentStyles.emptyState}>
            <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
              Aucun fournisseur disponible
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={componentStyles.table.header}>
                  <TableCell sx={componentStyles.table.headerCell}>#</TableCell>
                  <TableCell sx={componentStyles.table.headerCell}>Fournisseur</TableCell>
                  <TableCell sx={componentStyles.table.headerCell} align="right">Depenses</TableCell>
                  <TableCell sx={componentStyles.table.headerCell} align="right">Montant TTC</TableCell>
                  <TableCell sx={{ ...componentStyles.table.headerCell, minWidth: 120 }}>Part</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fournisseurs.map((f, index) => {
                  const percent = maxMontant > 0 ? (f.montantTotal / maxMontant) * 100 : 0
                  return (
                    <TableRow key={f.fournisseurId} sx={componentStyles.table.row}>
                      <TableCell sx={componentStyles.table.cell}>
                        <Box sx={{
                          width: 24, height: 24,
                          borderRadius: borders.radius.full,
                          bgcolor: index === 0 ? colors.primary[50] : colors.neutral[50],
                          color: index === 0 ? colors.primary[700] : colors.textSecondary,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold,
                        }}>
                          {index + 1}
                        </Box>
                      </TableCell>
                      <TableCell sx={componentStyles.table.cell}>
                        <Typography sx={{
                          fontSize: typography.sizes.sm,
                          fontWeight: typography.weights.medium,
                          color: colors.textPrimary,
                        }}>
                          {f.fournisseurNom}
                        </Typography>
                      </TableCell>
                      <TableCell sx={componentStyles.table.cell} align="right">
                        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                          {f.nombreDepenses}
                        </Typography>
                      </TableCell>
                      <TableCell sx={componentStyles.table.cell} align="right">
                        <Typography sx={{
                          fontSize: typography.sizes.sm,
                          fontWeight: typography.weights.semibold,
                          color: colors.textPrimary,
                        }}>
                          {formatMontant(f.montantTotal)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={componentStyles.table.cell}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={{
                              flex: 1, height: 6,
                              borderRadius: borders.radius.full,
                              bgcolor: colors.neutral[100],
                              '& .MuiLinearProgress-bar': {
                                borderRadius: borders.radius.full,
                                bgcolor: colors.primary[400],
                              },
                            }}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  )
}

export default ReportingTopFournisseurs
