import { useState, useEffect } from 'react'
import { Paper, Typography, Stack, Box, Chip, CircularProgress, Divider } from '@mui/material'
import { Business, CalendarMonth, AttachMoney, Description } from '@mui/icons-material'
import { marchesAPI } from '../../../lib/api'
import { colors } from '@/lib/designSystem'

interface MarcheInfoCardProps {
  marcheId: number
}

interface MarcheDetails {
  numeroMarche: string
  numAO: string
  dateMarche: string
  objet: string
  typePrestation: string
  montantHT: number
  tauxTVA: number
  montantTVA: number
  montantTTC: number
  fournisseur: {
    id: number
    designation: string
  }
  convention: {
    id: number
    code: string
    objet: string
  }
  adresse?: string
  latitude?: number
  longitude?: number
}

/**
 * MICRO-COMPONENT: MarcheInfoCard
 * Charge les détails complets du marché
 * Endpoint: GET /marches/{id}/details
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
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <CircularProgress size={30} />
      </Paper>
    )
  }

  if (!details) return null

  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: colors.primary[700] }}>
        Informations Détaillées
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={3}>
        {/* Section Identité */}
        <Box>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Identité du Marché
          </Typography>
          <Stack spacing={2} sx={{ pl: 2 }}>
            <InfoRow icon={<Description />} label="Numéro Marché" value={details.numeroMarche} />
            <InfoRow icon={<Description />} label="Numéro AO" value={details.numAO || '-'} />
            <InfoRow icon={<CalendarMonth />} label="Date Marché" value={formatDate(details.dateMarche)} />
            <InfoRow
              icon={<Description />}
              label="Type Prestation"
              value={
                <Chip
                  label={details.typePrestation}
                  size="small"
                  color={
                    details.typePrestation === 'TRAVAUX'
                      ? 'primary'
                      : details.typePrestation === 'FOURNITURES'
                        ? 'success'
                        : 'warning'
                  }
                />
              }
            />
          </Stack>
        </Box>

        <Divider />

        {/* Section Objet */}
        <Box>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Objet
          </Typography>
          <Typography variant="body1" sx={{ pl: 2 }}>
            {details.objet}
          </Typography>
        </Box>

        <Divider />

        {/* Section Financière */}
        <Box>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Montants
          </Typography>
          <Stack spacing={2} sx={{ pl: 2 }}>
            <InfoRow
              icon={<AttachMoney />}
              label="Montant HT"
              value={`${formatCurrency(details.montantHT)} DH`}
            />
            <InfoRow
              icon={<AttachMoney />}
              label={`TVA (${details.tauxTVA}%)`}
              value={`${formatCurrency(details.montantTVA)} DH`}
            />
            <InfoRow
              icon={<AttachMoney />}
              label="Montant TTC"
              value={
                <Typography variant="body1" fontWeight="bold" color="primary">
                  {formatCurrency(details.montantTTC)} DH
                </Typography>
              }
            />
          </Stack>
        </Box>

        <Divider />

        {/* Section Relations */}
        <Box>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Relations
          </Typography>
          <Stack spacing={2} sx={{ pl: 2 }}>
            <InfoRow
              icon={<Business />}
              label="Fournisseur"
              value={details.fournisseur?.designation || '-'}
            />
            <InfoRow
              icon={<Description />}
              label="Convention"
              value={details.convention ? `${details.convention.code} - ${details.convention.objet}` : '-'}
            />
          </Stack>
        </Box>

        {/* Section Géolocalisation (si disponible) */}
        {details.adresse && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Localisation
              </Typography>
              <Stack spacing={2} sx={{ pl: 2 }}>
                <InfoRow icon={<CalendarMonth />} label="Adresse" value={details.adresse} />
                {details.latitude && details.longitude && (
                  <InfoRow
                    icon={<CalendarMonth />}
                    label="Coordonnées"
                    value={`${details.latitude}, ${details.longitude}`}
                  />
                )}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Paper>
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
      <Box sx={{ color: colors.primary[600] }}>{icon}</Box>
      <Typography variant="body2" color="textSecondary" sx={{ minWidth: 150 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>
        {typeof value === 'string' ? <Typography variant="body1">{value}</Typography> : value}
      </Box>
    </Stack>
  )
}

export default MarcheInfoCard
