import { useState, useCallback } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowRightLeft,
  Send,
  History,
} from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'

// ==================== TYPES ====================

interface ChatterActivity {
  id: number
  type: 'modification' | 'workflow' | 'note' | 'creation'
  date: string
  user: string
  userInitials: string
  title: string
  details?: string
  fieldsChanged?: string[]
  icon?: 'edit' | 'workflow' | 'note' | 'create'
}

interface ChatterProps {
  entityType: string
  entityId: number
  activities: ChatterActivity[]
  loading?: boolean
  onAddNote?: (note: string) => Promise<void>
  onRefresh?: () => void
  maxVisible?: number
}

// ==================== HELPERS ====================

const getActivityIcon = (type: ChatterActivity['type']) => {
  switch (type) {
    case 'modification': return <ArrowRightLeft size={14} />
    case 'workflow': return <FileText size={14} />
    case 'note': return <MessageSquare size={14} />
    case 'creation': return <Clock size={14} />
    default: return <Clock size={14} />
  }
}

const getActivityColor = (type: ChatterActivity['type']): string => {
  switch (type) {
    case 'modification': return colors.warning[500]
    case 'workflow': return colors.primary[500]
    case 'note': return colors.success[500]
    case 'creation': return colors.info[500]
    default: return colors.neutral[400]
  }
}

const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "A l'instant"
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ==================== SUB-COMPONENTS ====================

interface ActivityItemProps {
  activity: ChatterActivity
  isLast: boolean
}

const ActivityItem = ({ activity, isLast }: ActivityItemProps) => {
  const accentColor = getActivityColor(activity.type)

  return (
    <Box sx={{ display: 'flex', gap: 1.5, position: 'relative' }}>
      {/* Timeline line */}
      {!isLast && (
        <Box sx={{
          position: 'absolute', left: 15, top: 32, bottom: -8,
          width: 1, bgcolor: colors.border,
        }} />
      )}

      {/* Avatar / Icon */}
      <Avatar sx={{
        width: 30, height: 30,
        bgcolor: `${accentColor}15`,
        color: accentColor,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
        flexShrink: 0,
      }}>
        {getActivityIcon(activity.type)}
      </Avatar>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.25 }}>
          <Typography sx={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
          }}>
            {activity.user}
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            {activity.title}
          </Typography>
        </Box>

        {activity.details && (
          <Typography sx={{
            fontSize: typography.sizes.sm, color: colors.textSecondary,
            mt: 0.25, lineHeight: 1.5,
          }}>
            {activity.details}
          </Typography>
        )}

        {activity.fieldsChanged && activity.fieldsChanged.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {activity.fieldsChanged.map((field) => (
              <Box key={field} sx={{
                px: 1, py: 0.25,
                bgcolor: colors.neutral[100],
                borderRadius: borders.radius.sm,
                fontSize: typography.sizes.xs,
                color: colors.textSecondary,
              }}>
                {field}
              </Box>
            ))}
          </Box>
        )}

        <Typography sx={{
          fontSize: '11px', color: colors.neutral[400], mt: 0.5,
        }}>
          {formatRelativeDate(activity.date)}
        </Typography>
      </Box>
    </Box>
  )
}

// ==================== MAIN COMPONENT ====================

const Chatter = ({
  activities,
  loading = false,
  onAddNote,
  onRefresh,
  maxVisible = 5,
}: ChatterProps) => {
  const [expanded, setExpanded] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const visibleActivities = expanded ? activities : activities.slice(0, maxVisible)
  const hasMore = activities.length > maxVisible

  const handleSubmitNote = useCallback(async () => {
    if (!noteText.trim() || !onAddNote) return
    setSubmitting(true)
    try {
      await onAddNote(noteText.trim())
      setNoteText('')
      setShowNoteInput(false)
    } finally {
      setSubmitting(false)
    }
  }, [noteText, onAddNote])

  return (
    <Box sx={{
      borderTop: `1px solid ${colors.border}`,
      pt: 2, mt: 3,
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History size={16} style={{ color: colors.textSecondary }} />
          <Typography sx={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            Historique
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.xs,
            color: colors.textSecondary,
            bgcolor: colors.neutral[100],
            borderRadius: borders.radius.full,
            px: 0.75, py: 0.125,
            minWidth: 20, textAlign: 'center',
          }}>
            {activities.length}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {onAddNote && (
            <Button
              size="small"
              startIcon={<MessageSquare size={13} />}
              onClick={() => setShowNoteInput(!showNoteInput)}
              sx={{
                fontSize: typography.sizes.xs, py: 0.25, px: 1,
                color: colors.textSecondary,
                '&:hover': { bgcolor: colors.neutral[50] },
              }}
            >
              Note
            </Button>
          )}
          {onRefresh && (
            <Tooltip title="Rafraichir">
              <IconButton size="small" onClick={onRefresh} sx={{ p: 0.5 }}>
                <Clock size={14} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Note input */}
      <Collapse in={showNoteInput}>
        <Box sx={{
          display: 'flex', gap: 1, mb: 2,
          p: 1.5, bgcolor: colors.neutral[25],
          borderRadius: borders.radius.md,
          border: `1px solid ${colors.border}`,
        }}>
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            placeholder="Ajouter une note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: colors.surface,
                fontSize: typography.sizes.sm,
              },
            }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleSubmitNote}
              disabled={!noteText.trim() || submitting}
              sx={{ minWidth: 'auto', px: 1.5, py: 0.5, fontSize: typography.sizes.xs }}
            >
              {submitting ? <CircularProgress size={14} /> : <Send size={14} />}
            </Button>
          </Box>
        </Box>
      </Collapse>

      {/* Activities list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : activities.length === 0 ? (
        <Typography sx={{
          fontSize: typography.sizes.sm, color: colors.textSecondary,
          textAlign: 'center', py: 3,
        }}>
          Aucune activite enregistree
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {visibleActivities.map((activity, idx) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isLast={idx === visibleActivities.length - 1}
            />
          ))}
        </Box>
      )}

      {/* Show more/less */}
      {hasMore && (
        <Box sx={{ textAlign: 'center', mt: 1.5 }}>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            sx={{
              fontSize: typography.sizes.xs, color: colors.textSecondary,
              '&:hover': { bgcolor: colors.neutral[50] },
            }}
          >
            {expanded ? 'Voir moins' : `Voir ${activities.length - maxVisible} de plus`}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Chatter
export type { ChatterActivity, ChatterProps }
