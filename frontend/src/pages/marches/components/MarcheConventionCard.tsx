import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Stack, CircularProgress, Button } from '@mui/material'
import { OpenInNew, Description, Gavel } from '@mui/icons-material'
import { marchesAPI, conventionsAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import StatusBadge from '@/components/core/StatusBadge'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'

interface MarcheConventionCardProps {
  marcheId: number
}

interface ConventionBasicInfo {
  id: number
  code: string
  numero: string
  libelle: string
  objet: string | null
  typeConvention: string
  statut: string
}

/**
 * MICRO-COMPONENT: MarcheConventionCard
 * Design: Atlassian/Confluence style - flat, professional
 *
 * Displays the linked convention for a marche.
 * Loads data independently following micro-frontend pattern:
 * 1. GET /marches/{id} to get conventionId
 * 2. GET /conventions/{id}/basic to get convention details
 */
const MarcheConventionCard = ({ marcheId }: MarcheConventionCardProps) => {
  const navigate = useNavigate()
  const { showError } = useToast()
  const [convention, setConvention] = useState<ConventionBasicInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [noConvention, setNoConvention] = useState(false)

  useEffect(() => {
    loadConventionInfo()
  }, [marcheId])

  const loadConventionInfo = async () => {
    try {
      setLoading(true)
      // Step 1: Get marche to find conventionId
      const { data: marcheResponse } = await marchesAPI.getById(marcheId)
      const marcheData = marcheResponse.data || marcheResponse
      const conventionId = marcheData.conventionId as number | null

      if (!conventionId) {
        setNoConvention(true)
        return
      }

      // Step 2: Load convention basic info
      const { data: convResponse } = await conventionsAPI.getBasic(conventionId)
      const convData = convResponse.data || convResponse
      setConvention(convData as ConventionBasicInfo)
    } catch {
      showError('Erreur lors du chargement de la convention rattachée')
      setNoConvention(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ ...componentStyles.card, p: 3, mb: 3, textAlign: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (noConvention) {
    return (
      <Box sx={{ ...componentStyles.card, p: 0, mb: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            bgcolor: colors.neutral[50],
            borderBottom: `1px solid ${colors.border}`,
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Gavel sx={{ fontSize: 18, color: colors.neutral[400] }} />
          <Typography
            sx={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: colors.textPrimary,
            }}
          >
            Convention Rattachée
          </Typography>
        </Box>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography
            sx={{
              fontSize: typography.sizes.sm,
              color: colors.textSecondary,
            }}
          >
            Aucune convention rattachée à ce marché
          </Typography>
        </Box>
      </Box>
    )
  }

  if (!convention) return null

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
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Gavel sx={{ fontSize: 18, color: colors.neutral[400] }} />
          <Typography
            sx={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: colors.textPrimary,
            }}
          >
            Convention Rattachée
          </Typography>
        </Box>
        <Button
          size="small"
          endIcon={<OpenInNew sx={{ fontSize: '14px !important' }} />}
          onClick={() => navigate(`/conventions/${convention.id}`)}
          sx={{
            ...componentStyles.buttonGhost,
            fontSize: typography.sizes.sm,
            color: colors.primary[600],
          }}
        >
          Voir la convention
        </Button>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Convention code and status */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              onClick={() => navigate(`/conventions/${convention.id}`)}
              sx={{
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <Typography
                sx={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.weights.bold,
                  color: colors.primary[700],
                }}
              >
                {convention.code}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <StatusBadge status={convention.typeConvention} size="small" />
              <StatusBadge status={convention.statut} size="small" />
            </Box>
          </Box>

          {/* Libelle */}
          <Box>
            <Typography
              sx={{
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.semibold,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 0.5,
              }}
            >
              Libellé
            </Typography>
            <RichTextDisplay html={convention.libelle} variant="compact" collapseLength={200} />
          </Box>

          {/* Objet (if exists) */}
          {convention.objet && (
            <Box>
              <Typography
                sx={{
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.semibold,
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 0.5,
                }}
              >
                Objet
              </Typography>
              <RichTextDisplay html={convention.objet} variant="compact" collapseLength={200} sx={{ color: colors.textSecondary }} />
            </Box>
          )}

          {/* Numéro */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Description sx={{ fontSize: 16, color: colors.neutral[400] }} />
            <Typography
              sx={{
                fontSize: typography.sizes.sm,
                color: colors.textSecondary,
                minWidth: 80,
              }}
            >
              Numéro
            </Typography>
            <Typography
              sx={{
                fontSize: typography.sizes.sm,
                color: colors.textPrimary,
                fontWeight: typography.weights.medium,
              }}
            >
              {convention.numero}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}

export default MarcheConventionCard
