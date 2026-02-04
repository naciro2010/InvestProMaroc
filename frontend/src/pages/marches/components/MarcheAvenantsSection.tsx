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
import { marchesAPI } from '../../../lib/api'
import { colors } from '@/lib/designSystem'

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
    } catch (err) {
      console.error('Erreur chargement avenants:', err)
      setError('Impossible de charger les avenants')
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

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return 'success'
      case 'BROUILLON':
        return 'default'
      case 'REJETE':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: colors.primary[700] }}>
            Avenants
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {avenants.length} avenant(s)
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => alert('Création d\'avenant - À implémenter')}
        >
          Nouvel Avenant
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : avenants.length === 0 ? (
        <Alert severity="info">Aucun avenant pour ce marché</Alert>
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
                <TableCell>
                  <strong>Objet</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Impact</strong>
                </TableCell>
                <TableCell>
                  <strong>Statut</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {avenants.map((avenant) => (
                <TableRow key={avenant.id} hover>
                  <TableCell>{avenant.numeroAvenant}</TableCell>
                  <TableCell>{formatDate(avenant.dateAvenant)}</TableCell>
                  <TableCell>{avenant.objet}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={(avenant.impact ?? 0) >= 0 ? 'success.main' : 'error.main'}
                    >
                      {(avenant.impact ?? 0) >= 0 ? '+' : ''}
                      {formatCurrency(avenant.impact)} DH
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={avenant.statut?.replace('_', ' ') || 'N/A'}
                      color={getStatutColor(avenant.statut)}
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

export default MarcheAvenantsSection
