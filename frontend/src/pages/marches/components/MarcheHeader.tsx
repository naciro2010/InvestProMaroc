import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material'
import { ArrowBack, Edit } from '@mui/icons-material'
import { marchesAPI } from '../../../lib/api'
import { colors, typography, borders, shadows, componentStyles, getStatusConfig } from '@/lib/designSystem'

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
 * Design: Atlassian/Confluence style - flat, professional
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

  const statusConfig = getStatusConfig(marche.statut)

  return (
    <Box
      sx={{
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: borders.radius.lg,
        overflow: 'hidden',
        mb: 3,
      }}
    >
      {/* Top bar with back button */}
      <Box
        sx={{
          bgcolor: colors.neutral[50],
          borderBottom: `1px solid ${colors.border}`,
          px: 3,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/marches')}
          sx={{
            ...componentStyles.buttonGhost,
            color: colors.textSecondary,
          }}
        >
          Retour aux marchés
        </Button>

        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/marches/${marcheId}/modifier`)}
          sx={componentStyles.buttonPrimary}
        >
          Modifier
        </Button>
      </Box>

      {/* Main header content */}
      <Box sx={{ px: 3, py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            {/* Status badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: borders.radius.sm,
                bgcolor: statusConfig.bgColor,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: statusConfig.dotColor,
                }}
              />
              <Typography
                sx={{
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.semibold,
                  color: statusConfig.textColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {statusConfig.label}
              </Typography>
            </Box>

            {/* Marché number */}
            <Typography
              sx={{
                fontSize: typography.sizes['2xl'],
                fontWeight: typography.weights.bold,
                color: colors.textPrimary,
                mb: 0.5,
              }}
            >
              {marche.numeroMarche}
            </Typography>

            {/* Objet */}
            <Typography
              sx={{
                fontSize: typography.sizes.base,
                color: colors.textSecondary,
                maxWidth: 600,
              }}
            >
              {marche.objet}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default MarcheHeader
