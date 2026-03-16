import type { ReactNode } from 'react'
import { Box, Typography, Tooltip } from '@mui/material'
import {
  Create, Send, CheckCircle, PlayArrow,
  Flag, Cancel, Undo, Event,
} from '@mui/icons-material'
import { colors, typography, borders } from '@/lib/designSystem'
import type { ConventionDetailEnrichedDTO } from '@/types/api'

// ──── Types ────

interface TimelineEvent {
  date: string | null
  label: string
  icon: ReactNode
  color: string
  active: boolean
  future: boolean
}

interface ConventionTimelineCardProps {
  convention: {
    statut: string; dateDebut: string; dateFin?: string
    dateSignature?: string
  }
  enrichedData: ConventionDetailEnrichedDTO | null
}

// ──── Helpers ────

const fmtDate = (d?: string | null): string =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const fmtRelative = (d?: string | null): string => {
  if (!d) return ''
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "aujourd'hui"
  if (diff === 1) return 'demain'
  if (diff === -1) return 'hier'
  if (diff > 0) return `dans ${diff}j`
  return `il y a ${Math.abs(diff)}j`
}

const buildTimeline = (
  convention: ConventionTimelineCardProps['convention'],
  enriched: ConventionDetailEnrichedDTO | null,
): TimelineEvent[] => {
  const s = convention.statut
  const events: TimelineEvent[] = []

  // Creation
  events.push({
    date: enriched?.createdAt || null,
    label: 'Creee',
    icon: <Create sx={{ fontSize: 16 }} />,
    color: colors.neutral[500],
    active: s === 'BROUILLON',
    future: false,
  })

  // Signature
  if (convention.dateSignature) {
    events.push({
      date: convention.dateSignature,
      label: 'Signee',
      icon: <Event sx={{ fontSize: 16 }} />,
      color: colors.primary[500],
      active: false,
      future: false,
    })
  }

  // Soumission
  const soumisStates = ['SOUMIS', 'VALIDEE', 'VALIDE', 'EN_EXECUTION', 'EN_COURS', 'ACHEVE']
  events.push({
    date: enriched?.dateSoumission || null,
    label: 'Soumise',
    icon: <Send sx={{ fontSize: 16 }} />,
    color: colors.warning[500],
    active: s === 'SOUMIS',
    future: !soumisStates.includes(s) && s !== 'REJETE',
  })

  // Rejected (if applicable)
  if (s === 'REJETE') {
    events.push({
      date: null,
      label: 'Rejetee',
      icon: <Cancel sx={{ fontSize: 16 }} />,
      color: colors.danger[500],
      active: true,
      future: false,
    })
    events.push({
      date: null,
      label: 'Correction',
      icon: <Undo sx={{ fontSize: 16 }} />,
      color: colors.warning[500],
      active: false,
      future: true,
    })
  }

  // Validation
  const validStates = ['VALIDEE', 'VALIDE', 'EN_EXECUTION', 'EN_COURS', 'ACHEVE']
  events.push({
    date: enriched?.dateValidation || null,
    label: 'Validee',
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
    color: colors.success[500],
    active: s === 'VALIDEE' || s === 'VALIDE',
    future: !validStates.includes(s) && s !== 'REJETE' && s !== 'ANNULE',
  })

  // Debut execution
  events.push({
    date: convention.dateDebut,
    label: 'Demarree',
    icon: <PlayArrow sx={{ fontSize: 16 }} />,
    color: colors.info[500],
    active: s === 'EN_EXECUTION' || s === 'EN_COURS',
    future: !['EN_EXECUTION', 'EN_COURS', 'ACHEVE'].includes(s) && s !== 'ANNULE',
  })

  // Fin / Echeance
  events.push({
    date: convention.dateFin || null,
    label: s === 'ACHEVE' ? 'Cloturee' : 'Echeance',
    icon: <Flag sx={{ fontSize: 16 }} />,
    color: s === 'ACHEVE' ? colors.success[700] : colors.neutral[400],
    active: s === 'ACHEVE',
    future: s !== 'ACHEVE' && s !== 'ANNULE',
  })

  return events
}

// ──── Main Component ────

const ConventionTimelineCard = ({ convention, enrichedData }: ConventionTimelineCardProps) => {
  const events = buildTimeline(convention, enrichedData)

  return (
    <Box sx={{
      border: `1px solid ${colors.border}`, borderRadius: borders.radius.md,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 2, py: 1, bgcolor: colors.neutral[25],
        borderBottom: `1px solid ${colors.borderSubtle}`,
      }}>
        <Event sx={{ fontSize: 16, color: colors.info[500] }} />
        <Typography sx={{
          fontSize: typography.sizes.xs, fontWeight: typography.weights.bold,
          color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em',
        }}>
          Chronologie
        </Typography>
      </Box>

      {/* Timeline */}
      <Box sx={{ px: 2, py: 1.5 }}>
        {events.map((event, idx) => {
          const isLast = idx === events.length - 1
          return (
            <Box key={`${event.label}-${idx}`} sx={{ display: 'flex', gap: 1.5, position: 'relative' }}>
              {/* Vertical line */}
              {!isLast && (
                <Box sx={{
                  position: 'absolute', left: 11, top: 22, bottom: 0,
                  width: 2, bgcolor: event.future ? colors.neutral[200] : colors.neutral[300],
                  ...(event.future ? { borderLeft: `2px dashed ${colors.neutral[200]}`, width: 0 } : {}),
                }} />
              )}

              {/* Icon dot */}
              <Tooltip title={event.date ? fmtRelative(event.date) : ''} placement="left">
                <Box sx={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: event.active ? `${event.color}15` : event.future ? colors.neutral[100] : `${event.color}10`,
                  border: event.active ? `2px solid ${event.color}` : event.future ? `1px dashed ${colors.neutral[300]}` : `1px solid ${event.color}30`,
                  color: event.future ? colors.neutral[400] : event.color,
                  zIndex: 1, flexShrink: 0,
                }}>
                  {event.icon}
                </Box>
              </Tooltip>

              {/* Content */}
              <Box sx={{ flex: 1, pb: isLast ? 0 : 1.5, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{
                    fontSize: typography.sizes.xs,
                    fontWeight: event.active ? typography.weights.bold : typography.weights.medium,
                    color: event.future ? colors.textDisabled : colors.textPrimary,
                  }}>
                    {event.label}
                  </Typography>
                  {event.active && (
                    <Box sx={{
                      width: 6, height: 6, borderRadius: '50%',
                      bgcolor: event.color, animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.4 },
                        '100%': { opacity: 1 },
                      },
                    }} />
                  )}
                </Box>
                {event.date && (
                  <Typography sx={{
                    fontSize: '10px',
                    color: event.future ? colors.textDisabled : colors.textSecondary,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {fmtDate(event.date)}
                  </Typography>
                )}
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default ConventionTimelineCard
