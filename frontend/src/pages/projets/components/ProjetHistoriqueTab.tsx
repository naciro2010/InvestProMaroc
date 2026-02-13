import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Skeleton,
} from '@mui/material'
import {
  Edit,
  PlayArrow,
  Pause,
  Done,
  Cancel,
  Timeline,
} from '@mui/icons-material'
import { projetsAPI } from '../../../lib/projetsAPI'
import { Projet, formatDate } from './projetDetailTypes'

interface ProjetHistoriqueTabProps {
  projetId: number
}

interface HistoryIconBoxProps {
  bgColor: string
  textColor: string
  children: React.ReactNode
}

const HistoryIconBox = ({ bgColor, textColor, children }: HistoryIconBoxProps) => (
  <Box sx={{
    p: 1,
    borderRadius: '50%',
    bgcolor: bgColor,
    color: textColor,
    height: 40,
    width: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    {children}
  </Box>
)

interface HistoryEntryProps {
  icon: React.ReactNode
  bgColor: string
  textColor: string
  title: string
  date?: string
  description?: string
}

const HistoryEntry = ({ icon, bgColor, textColor, title, date, description }: HistoryEntryProps) => (
  <Paper sx={{ p: 2, bgcolor: '#f9fafb' }}>
    <Stack direction="row" spacing={2}>
      <HistoryIconBox bgColor={bgColor} textColor={textColor}>
        {icon}
      </HistoryIconBox>
      <Box flex={1}>
        <Typography variant="body1" fontWeight={600}>
          {title}
        </Typography>
        {date && (
          <Typography variant="caption" color="text.secondary">
            {date}
          </Typography>
        )}
        {description && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            {description}
          </Typography>
        )}
      </Box>
    </Stack>
  </Paper>
)

const ProjetHistoriqueTab = ({ projetId }: ProjetHistoriqueTabProps) => {
  const [projet, setProjet] = useState<Projet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistorique = async () => {
      try {
        setLoading(true)
        const response = await projetsAPI.getById(projetId)
        setProjet(response.data as Projet)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur chargement historique'
        console.error(message)
      } finally {
        setLoading(false)
      }
    }
    loadHistorique()
  }, [projetId])

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Skeleton variant="rectangular" height={300} />
      </Container>
    )
  }

  if (!projet) return null

  return (
    <Container maxWidth="xl">
      <Typography variant="h6" fontWeight={600} gutterBottom mb={3}>
        Historique des Modifications
      </Typography>
      <Stack spacing={2}>
        <HistoryEntry
          icon={<Timeline />}
          bgColor="primary.light"
          textColor="primary.dark"
          title="Projet cree"
          date={projet.dateCreation ? formatDate(projet.dateCreation) : 'N/A'}
          description="Statut initial: EN_PREPARATION"
        />

        {projet.dateDebutReel && (
          <HistoryEntry
            icon={<PlayArrow />}
            bgColor="success.light"
            textColor="success.dark"
            title="Projet demarre"
            date={formatDate(projet.dateDebutReel)}
            description="Passage au statut: EN_COURS"
          />
        )}

        {projet.motifSuspension && (
          <HistoryEntry
            icon={<Pause />}
            bgColor="warning.light"
            textColor="warning.dark"
            title="Projet suspendu"
            description={`Motif: ${projet.motifSuspension}`}
          />
        )}

        {projet.dateFinReelle && (
          <HistoryEntry
            icon={<Done />}
            bgColor="success.light"
            textColor="success.dark"
            title="Projet termine"
            date={formatDate(projet.dateFinReelle)}
            description="Passage au statut: TERMINE"
          />
        )}

        {projet.motifAnnulation && (
          <HistoryEntry
            icon={<Cancel />}
            bgColor="error.light"
            textColor="error.dark"
            title="Projet annule"
            description={`Motif: ${projet.motifAnnulation}`}
          />
        )}

        {projet.dateModification && (
          <HistoryEntry
            icon={<Edit />}
            bgColor="info.light"
            textColor="info.dark"
            title="Derniere modification"
            date={formatDate(projet.dateModification)}
          />
        )}
      </Stack>
    </Container>
  )
}

export default ProjetHistoriqueTab
