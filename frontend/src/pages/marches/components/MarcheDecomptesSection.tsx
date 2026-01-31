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
  Button,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { marchesAPI } from '../../../lib/api'
import { colors, componentStyles } from '@/lib/designSystem'

interface MarcheDecomptesSectionProps {
  marcheId: number
}

interface Decompte {
  id: number
  numeroDecompte: string
  dateDecompte: string
  montantTTC: number
  statut: string
}

/**
 * MICRO-COMPONENT: MarcheDecomptesSection
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
      // Micro-endpoint dédié aux décomptes d'un marché
      // Endpoint: GET /marches/{id}/decomptes
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

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return 'success'
      case 'BROUILLON':
        return 'default'
      case 'SOUMIS':
        return 'info'
      case 'REJETE':
        return 'error'
      case 'PAYE_TOTAL':
        return 'success'
      case 'PAYE_PARTIEL':
        return 'warning'
      default:
        return 'default'
    }
  }

  const totalDecomptes = decomptes.reduce((sum, d) => sum + d.montantTTC, 0)

  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: colors.primary[700] }}>
            Décomptes
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {decomptes.length} décompte(s) - Total: {formatCurrency(totalDecomptes)} DH
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/decomptes/nouveau')}
          sx={componentStyles.buttonPrimary}
        >
          Nouveau Décompte
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : decomptes.length === 0 ? (
        <Alert severity="info">Aucun décompte pour ce marché</Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>
                  <strong>Numéro</strong>
                </TableCell>
                <TableCell>
                  <strong>Date</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Montant TTC</strong>
                </TableCell>
                <TableCell>
                  <strong>Statut</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {decomptes.map((decompte) => (
                <TableRow key={decompte.id} hover>
                  <TableCell>{decompte.numeroDecompte}</TableCell>
                  <TableCell>{formatDate(decompte.dateDecompte)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {formatCurrency(decompte.montantTTC)} DH
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={decompte.statut.replace('_', ' ')}
                      color={getStatutColor(decompte.statut)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}

export default MarcheDecomptesSection
