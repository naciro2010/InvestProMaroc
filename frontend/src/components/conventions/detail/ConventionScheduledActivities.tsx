import { useState, type ChangeEvent, type ReactNode, type MouseEvent, type KeyboardEvent } from 'react'
import {
  Box, Typography, IconButton, Tooltip, Chip, TextField,
  MenuItem, Button, Collapse,
} from '@mui/material'
import {
  Schedule, Add, Phone, Email, Event, Assignment,
  Delete, CheckCircle, ExpandMore, ExpandLess,
} from '@mui/icons-material'
import { colors, typography, borders, transitions } from '@/lib/designSystem'

// ──── Types ────

type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'reminder'

interface ScheduledActivity {
  id: string
  type: ActivityType
  title: string
  date: string
  note?: string
  done: boolean
}

interface ConventionScheduledActivitiesProps {
  conventionId: number
}

// ──── Config ────

const ACTIVITY_TYPES: Record<ActivityType, { label: string; icon: ReactNode; color: string }> = {
  call: { label: 'Appel', icon: <Phone sx={{ fontSize: 14 }} />, color: colors.success[500] },
  email: { label: 'Email', icon: <Email sx={{ fontSize: 14 }} />, color: colors.primary[500] },
  meeting: { label: 'Reunion', icon: <Event sx={{ fontSize: 14 }} />, color: colors.purple[500] },
  task: { label: 'Tache', icon: <Assignment sx={{ fontSize: 14 }} />, color: colors.warning[500] },
  reminder: { label: 'Rappel', icon: <Schedule sx={{ fontSize: 14 }} />, color: colors.info[500] },
}

const STORAGE_KEY_PREFIX = 'conv-activities-'

// ──── Helpers ────

const loadActivities = (conventionId: number): ScheduledActivity[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${conventionId}`)
    return raw ? JSON.parse(raw) as ScheduledActivity[] : []
  } catch { return [] }
}

const saveActivities = (conventionId: number, activities: ScheduledActivity[]) => {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${conventionId}`, JSON.stringify(activities))
}

const isOverdue = (date: string) => new Date(date) < new Date(new Date().toISOString().split('T')[0])
const isToday = (date: string) => date === new Date().toISOString().split('T')[0]
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

// ──── Sub-components ────

const ActivityItem = ({ activity, onToggle, onDelete }: {
  key?: string; activity: ScheduledActivity; onToggle: () => void; onDelete: () => void
}) => {
  const cfg = ACTIVITY_TYPES[activity.type]
  const overdue = !activity.done && isOverdue(activity.date)
  const today = isToday(activity.date)

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1,
      px: 1.5, py: 0.75, borderRadius: borders.radius.sm,
      opacity: activity.done ? 0.5 : 1,
      bgcolor: overdue ? colors.danger[25] : today ? colors.warning[25] : 'transparent',
      borderLeft: `3px solid ${overdue ? colors.danger[400] : today ? colors.warning[400] : cfg.color}`,
      transition: `all ${transitions.normal}`,
      '&:hover': { bgcolor: overdue ? colors.danger[50] : colors.neutral[50] },
    }}>
      <Tooltip title={activity.done ? 'Marquer non fait' : 'Marquer fait'}>
        <IconButton size="small" onClick={onToggle} sx={{ p: 0.25 }}>
          <CheckCircle sx={{
            fontSize: 18,
            color: activity.done ? colors.success[500] : colors.neutral[300],
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
          color: activity.done ? colors.textDisabled : colors.textPrimary,
          textDecoration: activity.done ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {activity.title}
        </Typography>
        {activity.note && (
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary, lineHeight: 1.2 }}>
            {activity.note}
          </Typography>
        )}
      </Box>

      <Chip label={fmtDate(activity.date)} size="small" sx={{
        height: 20, fontSize: '10px',
        bgcolor: overdue ? colors.danger[100] : today ? colors.warning[100] : colors.neutral[100],
        color: overdue ? colors.danger[700] : today ? colors.warning[700] : colors.textSecondary,
      }} />

      <IconButton size="small" onClick={onDelete} sx={{ p: 0.25, color: colors.neutral[400], '&:hover': { color: colors.danger[500] } }}>
        <Delete sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  )
}

// ──── Main Component ────

const ConventionScheduledActivities = ({ conventionId }: ConventionScheduledActivitiesProps) => {
  const [activities, setActivities] = useState<ScheduledActivity[]>(() => loadActivities(conventionId))
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [newType, setNewType] = useState<ActivityType>('task')
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newNote, setNewNote] = useState('')

  const updateActivities = (updated: ScheduledActivity[]) => {
    setActivities(updated)
    saveActivities(conventionId, updated)
  }

  const handleAdd = () => {
    if (!newTitle.trim()) return
    const activity: ScheduledActivity = {
      id: `act-${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      date: newDate,
      note: newNote.trim() || undefined,
      done: false,
    }
    updateActivities([...activities, activity])
    setNewTitle(''); setNewNote(''); setShowForm(false)
  }

  const toggleDone = (id: string) => {
    updateActivities(activities.map((a: ScheduledActivity) => a.id === id ? { ...a, done: !a.done } : a))
  }

  const deleteActivity = (id: string) => {
    updateActivities(activities.filter((a: ScheduledActivity) => a.id !== id))
  }

  const pendingCount = activities.filter((a: ScheduledActivity) => !a.done).length
  const overdueCount = activities.filter((a: ScheduledActivity) => !a.done && isOverdue(a.date)).length
  const sorted = [...activities].sort((a: ScheduledActivity, b: ScheduledActivity) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return new Date(a.date).getTime() - new Date(b.date).getTime()
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
          Activites planifiees
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
          {/* Activity list */}
          {sorted.length === 0 && !showForm && (
            <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textDisabled }}>
                Aucune activite planifiee
              </Typography>
              <Button size="small" startIcon={<Add />} onClick={() => setShowForm(true)}
                sx={{ mt: 0.5, textTransform: 'none', fontSize: typography.sizes.xs, color: colors.primary[600] }}>
                Planifier une activite
              </Button>
            </Box>
          )}

          {sorted.map((a: ScheduledActivity) => (
            <ActivityItem key={a.id} activity={a} onToggle={() => toggleDone(a.id)} onDelete={() => deleteActivity(a.id)} />
          ))}

          {/* Add form */}
          <Collapse in={showForm}>
            <Box sx={{ px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 1, borderTop: `1px solid ${colors.borderSubtle}`, bgcolor: colors.neutral[25] }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField select size="small" value={newType} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewType(e.target.value as ActivityType)}
                  sx={{ minWidth: 100, '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.5 } }}>
                  {Object.entries(ACTIVITY_TYPES).map(([k, v]) => (
                    <MenuItem key={k} value={k} sx={{ fontSize: typography.sizes.xs }}>{v.label}</MenuItem>
                  ))}
                </TextField>
                <TextField size="small" placeholder="Titre de l'activite" fullWidth value={newTitle}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                  onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter') handleAdd() }}
                  sx={{ '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.5 } }} />
                <TextField type="date" size="small" value={newDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewDate(e.target.value)}
                  sx={{ minWidth: 130, '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.5 } }} />
              </Box>
              <TextField size="small" placeholder="Note (optionnel)" fullWidth value={newNote}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewNote(e.target.value)}
                sx={{ '& .MuiInputBase-input': { fontSize: typography.sizes.xs, py: 0.5 } }} />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => { setShowForm(false); setNewTitle(''); setNewNote('') }}
                  sx={{ textTransform: 'none', fontSize: typography.sizes.xs }}>Annuler</Button>
                <Button size="small" variant="contained" onClick={handleAdd} disabled={!newTitle.trim()}
                  sx={{ textTransform: 'none', fontSize: typography.sizes.xs, bgcolor: colors.primary[600], '&:hover': { bgcolor: colors.primary[700] } }}>
                  Ajouter
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
