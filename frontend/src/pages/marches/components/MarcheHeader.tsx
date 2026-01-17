import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Chip, CircularProgress, Alert } from '@mui/material'
import { ArrowBack, Edit } from '@mui/icons-material'
import { marchesAPI } from '../../../lib/api'
import colors from '../../../theme/colors'

interface MarcheHeaderProps {
  marcheId: number
}

interface MarcheBasicInfo {
  id: number
  numeroMarche: string
  objet: string
  statut: string
  dateMarche: string
}

/**
 * MICRO-COMPONENT: MarcheHeader
 * Charge uniquement les informations de base du marché
 * Endpoint: GET /marches/{id}/basic
 */
const MarcheHeader = ({ marcheId }: MarcheHeaderProps) => {
  const navigate = useNavigate()
  const [marche, setMarche] = useState<MarcheBasicInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBasicInfo()
  }, [marcheId])

  const loadBasicInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      // Micro-endpoint: charge uniquement les infos de base
      const { data } = await marchesAPI.getById(marcheId)
      const marcheData = data.data || data

      setMarche({
        id: marcheData.id,
        numeroMarche: marcheData.numeroMarche,
        objet: marcheData.objet,
        statut: marcheData.statut || 'EN_COURS',
        dateMarche: marcheData.dateMarche,
      })
    } catch (err) {
      console.error('Erreur chargement header:', err)
      setError('Impossible de charger les informations du marché')
    } finally {
      setLoading(false)
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS':
        return 'primary'
      case 'TERMINE':
        return 'success'
      case 'SUSPENDU':
        return 'warning'
      case 'ANNULE':
        return 'error'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !marche) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error || 'Marché introuvable'}
      </Alert>
    )
  }

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
        color: 'white',
        borderRadius: '16px',
        p: 4,
        mb: 3,
      }}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/marches')}
        sx={{
          color: 'white',
          mb: 2,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        Retour aux marchés
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {marche.numeroMarche}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            {marche.objet}
          </Typography>
          <Chip
            label={marche.statut.replace('_', ' ')}
            color={getStatutColor(marche.statut)}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/marches/${marcheId}/modifier`)}
          sx={{
            bgcolor: 'white',
            color: colors.primary[700],
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        >
          Modifier
        </Button>
      </Box>
    </Box>
  )
}

export default MarcheHeader
