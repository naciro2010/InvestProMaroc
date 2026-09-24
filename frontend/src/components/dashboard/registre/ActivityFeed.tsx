import { Box, ButtonBase } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { RecentActivityExecDTO } from '@/lib/api'
import { Panel, StatusBadge } from '@/components/core'
import { colors } from '@/lib/designSystem'

interface ActivityFeedProps {
  items: RecentActivityExecDTO[]
}

const ENTITY_LABELS: Record<string, string> = {
  convention: 'Convention',
  marche: 'Marché',
  projet: 'Projet',
  decompte: 'Décompte',
}

const relativeDay = (iso: string | null): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const today = new Date()
  const days = Math.round((new Date(today.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86_400_000)
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Hier'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(d)
}

/** Activité récente : date, type de fiche, code et libellé, statut. */
const ActivityFeed = ({ items }: ActivityFeedProps) => {
  const navigate = useNavigate()

  return (
    <Panel title="Activité récente" flush>
      {items.length === 0 ? (
        <Box sx={{ px: 3, py: 2, fontSize: 13, color: colors.textTertiary }}>Aucune activité récente.</Box>
      ) : items.slice(0, 8).map(item => (
        <ButtonBase
          key={`${item.entityType}-${item.id}`}
          onClick={() => navigate(item.path)}
          sx={{
            display: 'grid',
            gridTemplateColumns: '64px minmax(0, 1fr)',
            columnGap: 1.5,
            width: '100%',
            textAlign: 'left',
            px: 2.5,
            py: 1.25,
            borderBottom: `1px solid ${colors.borderSubtle}`,
            '&:last-of-type': { borderBottom: 0 },
            '&:hover': { bgcolor: 'rgba(247,243,234,.7)' },
          }}
        >
          <Box sx={{ fontSize: 12.5, color: colors.textTertiary, pt: '1px' }}>{relativeDay(item.date)}</Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontSize: 13, color: colors.textPrimary, lineHeight: 1.4 }}>
              {ENTITY_LABELS[item.entityType] ?? item.entityType} <strong>{item.code}</strong>
            </Box>
            <Box sx={{ fontSize: 12.5, color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.5 }}>
              {item.label}
            </Box>
            <StatusBadge status={item.statut} size="small" />
          </Box>
        </ButtonBase>
      ))}
    </Panel>
  )
}

export default ActivityFeed
