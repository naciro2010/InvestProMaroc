import { useState, useEffect, useCallback, type ChangeEvent, type ReactNode, type MouseEvent, type KeyboardEvent } from 'react'
import {
  Box, Typography, IconButton, Tooltip, Chip, TextField,
  MenuItem, Button, Collapse, CircularProgress,
} from '@mui/material'
import {
  Schedule, Add, Phone, Email, Event, Assignment,
  Delete, CheckCircle, ExpandMore, ExpandLess,
} from '@mui/icons-material'
import { colors, typography, borders, transitions } from '@/lib/designSystem'
import { activitesPlanifieesAPI, type ActivitePlanifieeDTO } from '@/lib/api'

// ──── Types ────

type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'reminder'

interface ConventionScheduledActivitiesProps {
  conventionId: number
}

// ──── Config ────

const ACTIVITY_TYPES: Record<ActivityType, { label: string; icon: ReactNode; color: string }> = {
  call: { label: 'Appel', icon: <Phone sx={{ fontSize: 14 }} />, color: colors.success[500] },
  email: { label: 'Email', icon: <Email sx={{ fontSize: 14 }} />, color: colors.primary[500] },
  meeting: { label: 'Réunion', icon: <Event sx={{ fontSize: 14 }} />, color: colors.purple[500] },
  task: { label: 'Tâche', icon: <Assignment sx={{ fontSize: 14 }} />, color: colors.warning[500] },
  reminder: { label: 'Rappel', icon: <Schedule sx={{ fontSize: 14 }} />, color: colors.info[500] },
}

// ──── Helpers ────

const isOverdue = (date: string) => new Date(date) < new Date(new Date().toISOString().split('T')[0])
const isToday = (date: string) => date === new Date().toISOString().split('T')[0]
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

// ──── Sub-components ────

const ActivityItem = ({ activity, onToggle, onDelete, disabled }: {
  activity: ActivitePlanifieeDTO
  onToggle: () => void
  onDelete: () => void
  disabled: boolean
}) => {
  const cfg = ACTIVITY_TYPES[activity.typeActivite as ActivityType] ?? ACTIVITY_TYPES.task
  const overdue = !activity.fait && isOverdue(activity.datePrevue)
  const today = isToday(activity.datePrevue)

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1,
      px: 1.5, py: 0.75, borderRadius: borders.radius.sm,
      opacity: activity.fait ? 0.5 : 1,
      bgcolor: overdue ? colors.danger[25] : today ? colors.warning[25] : 'transparent',
      borderLeft: `3px solid ${overdue ? colors.danger[400] : today ? colors.warning[400] : cfg.color}`,
      transition: `all ${transitions.normal}`,
      '&:hover': { bgcolor: overdue ? colors.danger[50] : colors.neutral[50] },
    }}>
      <Tooltip title={activity.fait ? 'Marquer non fait' : 'Marquer fait'}>
        <IconButton size="small" onClick={onToggle} disabled={disabled} sx={{ p: 0.25 }}>
          <CheckCircle sx={{
            fontSize: 18,
            color: activity.fait ? colors.success[500] : colors.neutral[300],
            '&:hover': { color: colors.success[400] },
          }} />
        </IconButton>
      </Tooltip>

      <Box sx={{ color: cfg.color, display: 'flex', alignItems: 'center' }}>
        {cfg.icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: typography.sizes.xs, fontWeight: typography.weights.medium,
          color: activity.fait ? colors.textDisabled : colors.textPrimary,
          textDecoration: activity.fait ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {activity.titre}
        </Typography>
        {activity.note && (
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary, lineHeight: 1.2 }}>
            {activity.note}
          </Typography>
        )}
      </Box>

      <Chip label={fmtDate(activity.datePrevue)} size="small" sx={{
        height: 20, fontSize: '10px',
        bgcolor: overdue ? colors.danger[100] : today ? colors.warning[100] : colors.neutral[100],
        color: overdue ? colors.danger[700] : today ? colors.warning[700] : colors.textSecondary,
      }} />

      <IconButton size="small" onClick={onDelete} disabled={disabled} sx={{ p: 0.25, color: colors.neutral[400], '&:hover': { color: colors.danger[500] } }}>
        <Delete sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  )
}

// ──── Main Component ────

const ConventionScheduledActivities = ({ conventionId }: ConventionScheduledActivitiesProps) => {
  const [activities, setActivities] = useState<ActivitePlanifieeDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [newType, setNewType] = useState<ActivityType>('task')
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newNote, setNewNote] = useState('')

  const fetchActivities = useCallback(async () => {
    try {
      const { data } = await activitesPlanifieesAPI.getByConvention(conventionId)
      if (data.success) {
        setActivities(data.data)
      }
    } catch {
      // Silently fail - activities are non-critical
    } finally {
      setLoading(false)
    }
  }, [conventionId])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    setSaving(true)
    try {
      const { data } = await activitesPlanifieesAPI.create(conventionId, {
        typeActivite: newType,
        titre: newTitle.trim(),
        datePrevue: newDate,
        note: newNote.trim() || null,
      })
      if (data.success) {
        setActivities((prev: ActivitePlanifieeDTO[]) => [...prev, data.data])
        setNewTitle('')
        setNewNote('')
        setShowForm(false)
      }
    } catch {
      // Could show toast error here
    } finally {
      setSaving(false)
    }
  }

  const toggleDone = async (id: number) => {
    setSaving(true)
    try {
      const { data } = await activitesPlanifieesAPI.toggleDone(conventionId, id)
      if (data.success) {
        setActivities((prev: ActivitePlanifieeDTO[]) => prev.map((a: ActivitePlanifieeDTO) => a.id === id ? data.data : a))
      }
    } catch {
      // Could show toast error here
    } finally {
      setSaving(false)
    }
  }

  const deleteActivity = async (id: number) => {
    setSaving(true)
    try {
      await activitesPlanifieesAPI.delete(conventionId, id)
      setActivities((prev: ActivitePlanifieeDTO[]) => prev.filter((a: ActivitePlanifieeDTO) => a.id !== id))
    } catch {
      // Could show toast error here
    } finally {
      setSaving(false)
    }
  }

  const pendingCount = activities.filter((a: ActivitePlanifieeDTO) => !a.fait).length
  const overdueCount = activities.filter((a: ActivitePlanifieeDTO) => !a.fait && isOverdue(a.datePrevue)).length
  const sorted = [...activities].sort((a: ActivitePlanifieeDTO, b: ActivitePlanifieeDTO) => {
    if (a.fait !== b.fait) return a.fait ? 1 : -1
    return new Date(a.datePrevue).getTime() - new Date(b.datePrevue).getTime()
  })

  return (
    <Box sx={{ border: `1px solid ${colors.border}`, borderRadius: borders.radius.md, overflow: 'hidden' }}>
      {/* Header */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 2, py: 1, bgcolor: colors.neutral[25],
          borderBottom: expanded ? `1px solid ${colors.borderSubtle}` : 'none',
          cursor: 'pointer', '&:hover': { bgcolor: colors.neutral[50] },
        }}
      >
        <Schedule sx={{ fontSize: 16, color: colors.purple[500] }} />
        <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em', flex: 1 }}>
          Activités planifiées
        </Typography>
        {pendingCount > 0 && (
          <Chip label={pendingCount} size="small" sx={{
            height: 18, minWidth: 18, fontSize: '10px', fontWeight: typography.weights.bold,
            bgcolor: overdueCount > 0 ? colors.danger[100] : colors.primary[100],
            color: overdueCount > 0 ? colors.danger[700] : colors.primary[700],
          }} />
        )}
        <IconButton size="small" onClick={(e: MouseEvent) => { e.stopPropagation(); setShowForm(true); setExpanded(true) }}
          sx={{ p: 0.25, color: colors.primary[500] }}>
          <Add sx={{ fontSize: 16 }} />
        </IconButton>
        {expanded ? <ExpandLess sx={{ fontSize: 16, color: colors.textSecondary }} /> : <ExpandMore sx={{ fontSize: 16, color: colors.textSecondary }} />}
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ py: 0.5 }}>
          {/* Loading state */}
          {loading && (
            <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
              <CircularProgress size={20} />
            </Box>
          )}

          {/* Empty state */}
          {!loading && sorted.length === 0 && !showForm && (
            <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textDisabled }}>
                Aucune activité planifiée
              </Typography>
              <Button size="small" startIcon={<Add />} onClick={() => setShowForm(true)}
                sx={{ mt: 0.5, textTransform: 'none', fontSize: typography.sizes.xs, color: colors.primary[600] }}>
                Planifier une activité
              </Button>
            </Box>
          )}

          {/* Activity list */}
          {sorted.map((a) => (
            <ActivityItem
              key={a.id}
              activity={a}
              onToggle={() => toggleDone(a.id)}
              onDelete={() => deleteActivity(a.id)}
              disabled={saving}
            />
          ))}

          {/* Add form */}
          <Collapse in={showForm}>
            <Box sx={{ px: 1.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, borderTop: `1px solid ${colors.borderSubtle}`, bgcolor: colors.neutral[25] }}>
              {/* Row 1: Type + Date */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  select
                  size="small"
                  value={newType}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewType(e.target.value as ActivityType)}
                  sx={{
                    minWidth: 130,
                    '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.75 },
                  }}
                >
                  {Object.entries(ACTIVITY_TYPES).map(([k, v]) => (
                    <MenuItem key={k} value={k} sx={{ fontSize: typography.sizes.xs }}>{v.label}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  type="date"
                  size="small"
                  value={newDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewDate(e.target.value)}
                  sx={{
                    minWidth: 150,
                    '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.75 },
                  }}
                />
              </Box>

              {/* Row 2: Title (full width) */}
              <TextField
                size="small"
                placeholder="Titre de l'activité"
                fullWidth
                value={newTitle}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter' && newTitle.trim()) handleAdd() }}
                sx={{ '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.75 } }}
              />

              {/* Row 3: Note (optional) */}
              <TextField
                size="small"
                placeholder="Note (optionnel)"
                fullWidth
                value={newNote}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewNote(e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.75 } }}
              />

              {/* Row 4: Actions */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={() => { setShowForm(false); setNewTitle(''); setNewNote('') }}
                  sx={{ textTransform: 'none', fontSize: typography.sizes.xs }}
                >
                  Annuler
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleAdd}
                  disabled={!newTitle.trim() || saving}
                  sx={{
                    textTransform: 'none',
                    fontSize: typography.sizes.xs,
                    bgcolor: colors.primary[600],
                    '&:hover': { bgcolor: colors.primary[700] },
                  }}
                >
                  {saving ? 'Ajout...' : 'Ajouter'}
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Collapse>
    </Box>
  )
}

export default ConventionScheduledActivities
