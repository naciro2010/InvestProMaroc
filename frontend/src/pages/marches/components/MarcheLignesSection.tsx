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
import { marchesAPI } from '../../../lib/api'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'

interface MarcheLignesSectionProps {
  marcheId: number
}

// Interface matching backend MarcheLigneDTO exactly
interface MarcheLigne {
  id: number
  marcheId: number
  numeroLigne: number
  designation: string
  unite: string | null
  quantite: number | null
  prixUnitaireHT: number
  montantHT: number
  tauxTVA: number
  montantTVA: number
  montantTTC: number
}

/**
 * MICRO-COMPONENT: MarcheLignesSection
 * Design: Atlassian/Confluence style table
 * Charge uniquement les lignes du marché
 * Endpoint: GET /marches/{id}/lignes
 */
const MarcheLignesSection = ({ marcheId }: MarcheLignesSectionProps) => {
  const [lignes, setLignes] = useState<MarcheLigne[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLignes()
  }, [marcheId])

  const loadLignes = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await marchesAPI.getLignes(marcheId)
      const lignesData = Array.isArray(data.data) ? data.data : data.data?.data || []
      setLignes(lignesData)
    } catch (err) {
      console.error('Erreur chargement lignes:', err)
      setError('Impossible de charger les lignes')
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

  const totalLignes = lignes.reduce((sum, ligne) => sum + (ligne.montantTTC || 0), 0)

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
        <Typography
          sx={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
          }}
        >
          Lignes de Prix
        </Typography>
        <Box
          sx={{
            bgcolor: colors.primary[50],
            color: colors.primary[700],
            fontSize: typography.sizes.xs,
            fontWeight: typography.weights.semibold,
            px: 1.5,
            py: 0.5,
            borderRadius: borders.radius.full,
          }}
        >
          {lignes.length} ligne(s)
        </Box>
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
      ) : lignes.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">Aucune ligne de prix pour ce marché</Alert>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={componentStyles.listPage.tableHeader}>
                <TableCell>Désignation</TableCell>
                <TableCell>Unité</TableCell>
                <TableCell align="right">Quantité</TableCell>
                <TableCell align="right">Prix Unitaire</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lignes.map((ligne) => (
                <TableRow
                  key={ligne.id}
                  sx={{
                    borderBottom: `1px solid ${colors.divider}`,
                    '&:hover': { bgcolor: colors.neutral[50] },
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <TableCell sx={{ color: colors.textPrimary }}>{ligne.designation}</TableCell>
                  <TableCell sx={{ color: colors.textSecondary }}>{ligne.unite || '-'}</TableCell>
                  <TableCell align="right" sx={{ color: colors.textSecondary }}>
                    {ligne.quantite?.toLocaleString('fr-FR') || '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ color: colors.textSecondary }}>
                    {formatCurrency(ligne.prixUnitaireHT)} DH
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontSize: typography.sizes.base,
                        fontWeight: typography.weights.semibold,
                        color: colors.primary[700],
                      }}
                    >
                      {formatCurrency(ligne.montantTTC)} DH
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {/* Total row */}
              <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                <TableCell colSpan={4} align="right">
                  <Typography
                    sx={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.semibold,
                      color: colors.textPrimary,
                    }}
                  >
                    Total Général:
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    sx={{
                      fontSize: typography.sizes.lg,
                      fontWeight: typography.weights.bold,
                      color: colors.primary[700],
                    }}
                  >
                    {formatCurrency(totalLignes)} DH
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default MarcheLignesSection
