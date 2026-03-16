import { useState, useCallback } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  History,
  Clock,
} from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'
import ActivityItem, { type ChatterActivity } from './ActivityItem'

// ==================== TYPES ====================

export interface ChatterProps {
  entityType: string
  entityId: number
  activities: ChatterActivity[]
  loading?: boolean
  onAddNote?: (note: string) => Promise<void>
  onRefresh?: () => void
  maxVisible?: number
  /** SSE connecte (temps reel actif) */
  connected?: boolean
}

// ==================== MAIN COMPONENT ====================

const Chatter = ({
  activities,
  loading = false,
  onAddNote,
  onRefresh,
  maxVisible = 5,
  connected = false,
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
    <Box sx={{ borderTop: `1px solid ${colors.border}`, pt: 2, mt: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History size={16} style={{ color: colors.textSecondary }} />
          <Typography sx={{
            fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
            color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            Historique
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.xs, color: colors.textSecondary,
            bgcolor: colors.neutral[100], borderRadius: borders.radius.full,
            px: 0.75, py: 0.125, minWidth: 20, textAlign: 'center',
          }}>
            {activities.length}
          </Typography>
          {connected && (
            <Tooltip title="Temps reel actif (SSE)">
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: colors.success[500],
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.4 },
                  '100%': { opacity: 1 },
                },
              }} />
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {onAddNote && (
            <Button size="small" startIcon={<MessageSquare size={13} />}
              onClick={() => setShowNoteInput(!showNoteInput)}
              sx={{ fontSize: typography.sizes.xs, py: 0.25, px: 1, color: colors.textSecondary, '&:hover': { bgcolor: colors.neutral[50] } }}>
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
          display: 'flex', gap: 1, mb: 2, p: 1.5,
          bgcolor: colors.neutral[25], borderRadius: borders.radius.md,
          border: `1px solid ${colors.border}`,
        }}>
          <TextField size="small" fullWidth multiline minRows={2} maxRows={4}
            placeholder="Ajouter une note..." value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: colors.surface, fontSize: typography.sizes.sm } }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Button size="small" variant="contained" onClick={handleSubmitNote}
              disabled={!noteText.trim() || submitting}
              sx={{ minWidth: 'auto', px: 1.5, py: 0.5, fontSize: typography.sizes.xs }}>
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
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, textAlign: 'center', py: 3 }}>
          Aucune activite enregistree
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {visibleActivities.map((activity, idx) => (
            <ActivityItem key={activity.id} activity={activity} isLast={idx === visibleActivities.length - 1} />
          ))}
        </Box>
      )}

      {/* Show more/less */}
      {hasMore && (
        <Box sx={{ textAlign: 'center', mt: 1.5 }}>
          <Button size="small" onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, '&:hover': { bgcolor: colors.neutral[50] } }}>
            {expanded ? 'Voir moins' : `Voir ${activities.length - maxVisible} de plus`}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Chatter
