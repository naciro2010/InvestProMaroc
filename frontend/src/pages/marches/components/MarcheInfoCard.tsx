import { useState, useEffect } from 'react'
import { Box, Typography, Stack, CircularProgress, Divider } from '@mui/material'
import { Business, CalendarMonth, AttachMoney, Description, LocationOn } from '@mui/icons-material'
import { marchesAPI } from '../../../lib/api'
import { colors, typography, borders, componentStyles, getStatusConfig } from '@/lib/designSystem'

interface MarcheInfoCardProps {
  marcheId: number
}

// Interface matching backend MarcheDTO exactly
interface MarcheDetails {
  numeroMarche: string
  numAo: string | null
  dateMarche: string
  objet: string
  statut: string
  montantHt: number
  tauxTva: number
  montantTva: number
  montantTtc: number
  fournisseurId: number
  fournisseurCode: string
  fournisseurNom: string
  fournisseurIce: string | null
  conventionId: number | null
  conventionNumero: string | null
  adresse?: string
  latitude?: number
  longitude?: number
}

/**
 * MICRO-COMPONENT: MarcheInfoCard
 * Design: Atlassian/Confluence style - flat, professional
 * Charge les détails complets du marché
 */
const MarcheInfoCard = ({ marcheId }: MarcheInfoCardProps) => {
  const [details, setDetails] = useState<MarcheDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDetails()
  }, [marcheId])

  const loadDetails = async () => {
    try {
      setLoading(true)
      const { data } = await marchesAPI.getById(marcheId)
      const marcheData = data.data || data
      setDetails(marcheData)
    } catch (err) {
      console.error('Erreur chargement détails:', err)
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

  if (loading) {
    return (
      <Box sx={{ ...componentStyles.card, p: 3, mb: 3, textAlign: 'center' }}>
        <CircularProgress size={30} />
      </Box>
    )
  }

  if (!details) return null

  const statusConfig = getStatusConfig(details.statut)

  return (
    <Box sx={{ ...componentStyles.card, p: 0, mb: 3, overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: colors.neutral[50],
          borderBottom: `1px solid ${colors.border}`,
          px: 3,
          py: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
          }}
        >
          Informations Détaillées
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Section Identité */}
          <Box>
            <Typography
              sx={{
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.semibold,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 2,
              }}
            >
              Identité du Marché
            </Typography>
            <Stack spacing={1.5}>
              <InfoRow icon={<Description />} label="Numéro Marché" value={details.numeroMarche} />
              <InfoRow icon={<Description />} label="Numéro AO" value={details.numAo || '-'} />
              <InfoRow icon={<CalendarMonth />} label="Date Marché" value={formatDate(details.dateMarche)} />
              <InfoRow
                icon={<Description />}
                label="Statut"
                value={
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.5,
                      py: 0.25,
                      borderRadius: borders.radius.sm,
                      bgcolor: statusConfig.bgColor,
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: statusConfig.dotColor,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.semibold,
                        color: statusConfig.textColor,
                      }}
                    >
                      {statusConfig.label}
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Box>

          <Divider sx={{ borderColor: colors.divider }} />

          {/* Section Objet */}
          <Box>
            <Typography
              sx={{
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.semibold,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 1,
              }}
            >
              Objet
            </Typography>
            <Typography
              sx={{
                fontSize: typography.sizes.base,
                color: colors.textPrimary,
              }}
            >
              {details.objet}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: colors.divider }} />

          {/* Section Financière */}
          <Box>
            <Typography
              sx={{
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.semibold,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 2,
              }}
            >
              Montants
            </Typography>
            <Stack spacing={1.5}>
              <InfoRow
                icon={<AttachMoney />}
                label="Montant HT"
                value={`${formatCurrency(details.montantHt)} DH`}
              />
              <InfoRow
                icon={<AttachMoney />}
                label={`TVA (${details.tauxTva || 20}%)`}
                value={`${formatCurrency(details.montantTva)} DH`}
              />
              <InfoRow
                icon={<AttachMoney />}
                label="Montant TTC"
                value={
                  <Typography
                    sx={{
                      fontSize: typography.sizes.base,
                      fontWeight: typography.weights.bold,
                      color: colors.primary[700],
                    }}
                  >
                    {formatCurrency(details.montantTtc)} DH
                  </Typography>
                }
              />
            </Stack>
          </Box>

          <Divider sx={{ borderColor: colors.divider }} />

          {/* Section Relations */}
          <Box>
            <Typography
              sx={{
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.semibold,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 2,
              }}
            >
              Relations
            </Typography>
            <Stack spacing={1.5}>
              <InfoRow icon={<Business />} label="Fournisseur" value={details.fournisseurNom || '-'} />
              <InfoRow icon={<Description />} label="Convention" value={details.conventionNumero || '-'} />
            </Stack>
          </Box>

          {/* Section Géolocalisation */}
          {details.adresse && (
            <>
              <Divider sx={{ borderColor: colors.divider }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.semibold,
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 2,
                  }}
                >
                  Localisation
                </Typography>
                <Stack spacing={1.5}>
                  <InfoRow icon={<LocationOn />} label="Adresse" value={details.adresse} />
                  {details.latitude && details.longitude && (
                    <InfoRow
                      icon={<LocationOn />}
                      label="Coordonnées"
                      value={`${details.latitude}, ${details.longitude}`}
                    />
                  )}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  )
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ color: colors.neutral[400], display: 'flex' }}>{icon}</Box>
      <Typography
        sx={{
          fontSize: typography.sizes.sm,
          color: colors.textSecondary,
          minWidth: 140,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>
        {typeof value === 'string' ? (
          <Typography sx={{ fontSize: typography.sizes.base, color: colors.textPrimary }}>
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Stack>
  )
}

export default MarcheInfoCard
