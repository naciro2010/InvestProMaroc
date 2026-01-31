import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Box,
} from '@mui/material'
import { marchesAPI } from '../../../lib/api'
import { colors } from '@/lib/designSystem'

interface MarcheLignesSectionProps {
  marcheId: number
}

interface MarcheLigne {
  id: number
  designation: string
  unite: string
  quantite: number
  prixUnitaire: number
  total: number
}

/**
 * MICRO-COMPONENT: MarcheLignesSection
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
      // Micro-endpoint dédié aux lignes
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

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const totalLignes = lignes.reduce((sum, ligne) => sum + ligne.total, 0)

  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: colors.primary[700] }}>
          Lignes de Prix
        </Typography>
        <Chip label={`${lignes.length} ligne(s)`} color="primary" />
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : lignes.length === 0 ? (
        <Alert severity="info">Aucune ligne de prix pour ce marché</Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>
                  <strong>Désignation</strong>
                </TableCell>
                <TableCell>
                  <strong>Unité</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Quantité</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Prix Unitaire</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Total</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lignes.map((ligne) => (
                <TableRow key={ligne.id} hover>
                  <TableCell>{ligne.designation}</TableCell>
                  <TableCell>{ligne.unite}</TableCell>
                  <TableCell align="right">{ligne.quantite.toLocaleString('fr-FR')}</TableCell>
                  <TableCell align="right">{formatCurrency(ligne.prixUnitaire)} DH</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {formatCurrency(ligne.total)} DH
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell colSpan={4} align="right">
                  <strong>Total Général:</strong>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {formatCurrency(totalLignes)} DH
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}

export default MarcheLignesSection
