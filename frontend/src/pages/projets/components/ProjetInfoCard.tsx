import { useState, useEffect } from 'react'
import { Box, Typography, Skeleton } from '@mui/material'
import { projetsAPI } from '@/lib/projetsAPI'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { FieldGroup, Field } from '@/components/core'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { Projet, formatDate } from './projetDetailTypes'

interface ProjetInfoCardProps {
  projetId: number
}

const ProjetInfoCard = ({ projetId }: ProjetInfoCardProps) => {
  const [projet, setProjet] = useState<Projet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjet = async () => {
      try {
        setLoading(true)
        const response = await projetsAPI.getById(projetId)
        setProjet(response.data as Projet)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur chargement info'
        console.error(message)
      } finally {
        setLoading(false)
      }
    }
    loadProjet()
  }, [projetId])

  if (loading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '8px' }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '8px' }} />
      </Box>
    )
  }

  if (!projet) return null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Informations Principales */}
      <FieldGroup title="Informations Principales" columns={2}>
        <Field label="Code Projet" value={projet.code} />
        <Field label="Nom" value={projet.nom} />
        {projet.responsableNom && (
          <Field label="Responsable" value={projet.responsableNom} />
        )}
        {projet.localisation && (
          <Field label="Localisation" value={projet.localisation} />
        )}
      </FieldGroup>

      {/* Description */}
      {projet.description && (
        <Box>
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Description
          </Typography>
          <RichTextDisplay html={projet.description} variant="block" />
        </Box>
      )}

      {/* Dates */}
      <FieldGroup title="Dates" columns={2}>
        <Field label="Date de Creation" value={projet.dateCreation ? formatDate(projet.dateCreation) : '-'} />
        {projet.dateDebut && (
          <Field label="Date de Debut Prevue" value={formatDate(projet.dateDebut)} />
        )}
        {projet.dateFin && (
          <Field label="Date de Fin Prevue" value={formatDate(projet.dateFin)} />
        )}
        {projet.dateDebutReel && (
          <Field label="Date de Debut Reelle" value={formatDate(projet.dateDebutReel)} />
        )}
        {projet.dateFinReelle && (
          <Field label="Date de Fin Reelle" value={formatDate(projet.dateFinReelle)} />
        )}
        {projet.dureeMois && (
          <Field label="Duree" value={`${projet.dureeMois} mois`} />
        )}
      </FieldGroup>

      {/* Observations */}
      {(projet.motifSuspension || projet.motifAnnulation || projet.observations) && (
        <Box sx={{
          ...componentStyles.card,
          p: 2.5,
          bgcolor: colors.warning[25],
          borderColor: colors.warning[200],
        }}>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 1.5 }}>
            Observations
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {projet.motifSuspension && (
              <Box>
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Motif de Suspension</Typography>
                <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>{projet.motifSuspension}</Typography>
              </Box>
            )}
            {projet.motifAnnulation && (
              <Box>
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Motif d'Annulation</Typography>
                <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>{projet.motifAnnulation}</Typography>
              </Box>
            )}
            {projet.observations && (
              <Box>
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Observations</Typography>
                <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>{projet.observations}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ProjetInfoCard
