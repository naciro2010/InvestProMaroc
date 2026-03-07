import { Box, Typography, Avatar } from '@mui/material'
import {
  MessageSquare,
  Clock,
  FileText,
  ArrowRightLeft,
} from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'

// ==================== TYPES ====================

export interface ChatterActivity {
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

export const formatRelativeDate = (dateStr: string): string => {
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

// ==================== COMPONENT ====================

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
          fontSize: typography.sizes.xs, color: colors.neutral[400], mt: 0.5,
        }}>
          {formatRelativeDate(activity.date)}
        </Typography>
      </Box>
    </Box>
  )
}

export default ActivityItem
