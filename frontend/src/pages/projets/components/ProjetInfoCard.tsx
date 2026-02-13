import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Divider,
  Skeleton,
} from '@mui/material'
import { projetsAPI } from '../../../lib/projetsAPI'
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
      <Container maxWidth="xl">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={200} />
        </Box>
      </Container>
    )
  }

  if (!projet) return null

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Informations Principales */}
        <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Informations Principales
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Code Projet</Typography>
              <Typography variant="body1" fontWeight={500}>{projet.code}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Nom</Typography>
              <Typography variant="body1" fontWeight={500}>{projet.nom}</Typography>
            </Box>
            {projet.description && (
              <Box>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="body1">{projet.description}</Typography>
              </Box>
            )}
            {projet.responsableNom && (
              <Box>
                <Typography variant="caption" color="text.secondary">Responsable</Typography>
                <Typography variant="body1">{projet.responsableNom}</Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Dates */}
        <Paper sx={{ p: 3, bgcolor: '#f9fafb' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Dates
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Date de Creation</Typography>
              <Typography variant="body1">{formatDate(projet.dateCreation)}</Typography>
            </Box>
            {projet.dateDebut && (
              <Box>
                <Typography variant="caption" color="text.secondary">Date de Debut Prevue</Typography>
                <Typography variant="body1">{formatDate(projet.dateDebut)}</Typography>
              </Box>
            )}
            {projet.dateFin && (
              <Box>
                <Typography variant="caption" color="text.secondary">Date de Fin Prevue</Typography>
                <Typography variant="body1">{formatDate(projet.dateFin)}</Typography>
              </Box>
            )}
            {projet.dateDebutReel && (
              <Box>
                <Typography variant="caption" color="text.secondary">Date de Debut Reelle</Typography>
                <Typography variant="body1">{formatDate(projet.dateDebutReel)}</Typography>
              </Box>
            )}
            {projet.dateFinReelle && (
              <Box>
                <Typography variant="caption" color="text.secondary">Date de Fin Reelle</Typography>
                <Typography variant="body1">{formatDate(projet.dateFinReelle)}</Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Observations */}
        {(projet.motifSuspension || projet.motifAnnulation || projet.observations) && (
          <Paper sx={{ p: 3, bgcolor: '#fff3cd', gridColumn: { xs: '1', md: 'span 2' } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Observations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {projet.motifSuspension && (
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">Motif de Suspension</Typography>
                <Typography variant="body1">{projet.motifSuspension}</Typography>
              </Box>
            )}
            {projet.motifAnnulation && (
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">Motif d'Annulation</Typography>
                <Typography variant="body1">{projet.motifAnnulation}</Typography>
              </Box>
            )}
            {projet.observations && (
              <Box>
                <Typography variant="caption" color="text.secondary">Observations</Typography>
                <Typography variant="body1">{projet.observations}</Typography>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  )
}

export default ProjetInfoCard
