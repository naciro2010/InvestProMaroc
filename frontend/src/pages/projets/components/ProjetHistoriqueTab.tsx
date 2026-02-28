import { useState, useEffect } from 'react'
import { Box, Typography, Skeleton } from '@mui/material'
import {
  Edit,
  PlayArrow,
  Pause,
  Done,
  Cancel,
  Timeline,
} from '@mui/icons-material'
import { projetsAPI } from '@/lib/projetsAPI'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { Projet, formatDate } from './projetDetailTypes'

interface ProjetHistoriqueTabProps {
  projetId: number
}

interface HistoryEntryProps {
  icon: React.ReactNode
  bgColor: string
  iconColor: string
  title: string
  date?: string
  description?: string
}

const HistoryEntry = ({ icon, bgColor, iconColor, title, date, description }: HistoryEntryProps) => (
  <Box sx={{
    ...componentStyles.card,
    p: 2,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 2,
  }}>
    <Box sx={{
      p: 1,
      borderRadius: '50%',
      bgcolor: bgColor,
      color: iconColor,
      height: 40,
      width: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
        {title}
      </Typography>
      {date && (
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
          {date}
        </Typography>
      )}
      {description && (
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  </Box>
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
    return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '8px' }} />
  }

  if (!projet) return null

  return (
    <Box>
      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 2 }}>
        Historique des Modifications
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <HistoryEntry
          icon={<Timeline fontSize="small" />}
          bgColor={colors.primary[50]}
          iconColor={colors.primary[600]}
          title="Projet cree"
          date={projet.dateCreation ? formatDate(projet.dateCreation) : 'N/A'}
          description="Statut initial: EN_PREPARATION"
        />

        {projet.dateDebutReel && (
          <HistoryEntry
            icon={<PlayArrow fontSize="small" />}
            bgColor={colors.success[50]}
            iconColor={colors.success[600]}
            title="Projet demarre"
            date={formatDate(projet.dateDebutReel)}
            description="Passage au statut: EN_COURS"
          />
        )}

        {projet.motifSuspension && (
          <HistoryEntry
            icon={<Pause fontSize="small" />}
            bgColor={colors.warning[50]}
            iconColor={colors.warning[600]}
            title="Projet suspendu"
            description={`Motif: ${projet.motifSuspension}`}
          />
        )}

        {projet.dateFinReelle && (
          <HistoryEntry
            icon={<Done fontSize="small" />}
            bgColor={colors.success[50]}
            iconColor={colors.success[600]}
            title="Projet termine"
            date={formatDate(projet.dateFinReelle)}
            description="Passage au statut: TERMINE"
          />
        )}

        {projet.motifAnnulation && (
          <HistoryEntry
            icon={<Cancel fontSize="small" />}
            bgColor={colors.danger[50]}
            iconColor={colors.danger[600]}
            title="Projet annule"
            description={`Motif: ${projet.motifAnnulation}`}
          />
        )}

        {projet.dateModification && (
          <HistoryEntry
            icon={<Edit fontSize="small" />}
            bgColor={colors.info[50]}
            iconColor={colors.info[600]}
            title="Derniere modification"
            date={formatDate(projet.dateModification)}
          />
        )}
      </Box>
    </Box>
  )
}

export default ProjetHistoriqueTab
