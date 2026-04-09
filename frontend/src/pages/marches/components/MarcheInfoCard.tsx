import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Divider } from '@mui/material'
import { marchesAPI } from '../../../lib/api'
import { useToast } from '@/contexts/ToastContext'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import StatusBadge from '@/components/core/StatusBadge'
import { colors, typography, borders, componentStyles, getStatusConfig } from '@/lib/designSystem'
import { formatCurrency } from '@/lib/utils'

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
  typeMarche: string
  naturePrestation: string
  montantHt: number
  tauxTva: number
  montantTva: number
  montantTtc: number
  dateSignature: string | null
  dateNotification: string | null
  dateOrdreService: string | null
  delaiExecutionMois: number | null
  tauxPenalite: number
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
 * Design: Compact 2-column grid, Atlassian-style
 * Charge les détails complets du marché
 */
const MarcheInfoCard = ({ marcheId }: MarcheInfoCardProps) => {
  const { showError } = useToast()
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
    } catch {
      showError('Erreur lors du chargement des détails du marché')
    } finally {
      setLoading(false)
    }
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

      {/* Content - Optimized layout */}
      <Box sx={{ p: 3 }}>
        {/* Section: Identité + Dates - 2 columns */}
        <SectionTitle>Identité du Marché</SectionTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0 }}>
          <InfoRow label="Numéro Marché" value={details.numeroMarche} />
          <InfoRow label="Numéro AO" value={details.numAo || '-'} />
          <InfoRow label="Date Marché" value={formatDate(details.dateMarche)} />
          {details.dateSignature && (
            <InfoRow label="Date Signature" value={formatDate(details.dateSignature)} />
          )}
          {details.dateNotification && (
            <InfoRow label="Date Notification" value={formatDate(details.dateNotification)} />
          )}
          {details.delaiExecutionMois && (
            <InfoRow label="Délai d'exécution" value={`${details.delaiExecutionMois} mois`} />
          )}
        </Box>

        {/* Type + Status row */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, mb: 1, flexWrap: 'wrap' }}>
          <StatusBadge status={details.typeMarche} size="small" />
          <StatusBadge status={details.naturePrestation} size="small" />
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
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusConfig.dotColor }} />
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: statusConfig.textColor }}>
              {statusConfig.label}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: colors.divider, my: 2 }} />

        {/* Section: Objet - full width with rich text */}
        <SectionTitle>Objet</SectionTitle>
        <Box sx={componentStyles.richTextDisplay.container}>
          <RichTextDisplay html={details.objet} variant="block" collapseLength={500} />
        </Box>

        <Divider sx={{ borderColor: colors.divider, my: 2 }} />

        {/* Section: Montants - 2 columns */}
        <SectionTitle>Montants</SectionTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 0 }}>
          <InfoRow label="Montant HT" value={formatCurrency(details.montantHt ?? 0)} />
          <InfoRow label={`TVA (${details.tauxTva || 20}%)`} value={formatCurrency(details.montantTva ?? 0)} />
          <InfoRow
            label="Montant TTC"
            value={
              <Typography sx={{ fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                {formatCurrency(details.montantTtc ?? 0)}
              </Typography>
            }
          />
        </Box>

        <Divider sx={{ borderColor: colors.divider, my: 2 }} />

        {/* Section: Relations - 2 columns */}
        <SectionTitle>Relations</SectionTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0 }}>
          <InfoRow label="Fournisseur" value={details.fournisseurNom || '-'} />
          <InfoRow label="Convention" value={details.conventionNumero || '-'} />
        </Box>

        {/* Section: Géolocalisation */}
        {details.adresse && (
          <>
            <Divider sx={{ borderColor: colors.divider, my: 2 }} />
            <SectionTitle>Localisation</SectionTitle>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0 }}>
              <InfoRow label="Adresse" value={details.adresse} />
              {details.latitude && details.longitude && (
                <InfoRow label="Coordonnées" value={`${details.latitude}, ${details.longitude}`} />
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}

/** Section title - small uppercase label */
const SectionTitle = ({ children }: { children: string }) => (
  <Typography
    sx={{
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      mb: 1.5,
    }}
  >
    {children}
  </Typography>
)

interface InfoRowProps {
  label: string
  value: React.ReactNode
}

/** Compact info row without icons - saves horizontal space */
const InfoRow = ({ label, value }: InfoRowProps) => {
  return (
    <Box sx={{ py: 0.75, pr: 2 }}>
      <Typography
        sx={{
          fontSize: typography.sizes.xs,
          color: colors.textSecondary,
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      {typeof value === 'string' ? (
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary, fontWeight: typography.weights.medium }}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  )
}

export default MarcheInfoCard
