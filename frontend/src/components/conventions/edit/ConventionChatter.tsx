import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Divider, CircularProgress, Alert, Chip,
} from '@mui/material'
import {
  History, User, Calendar, ArrowRight, FileText,
  AlertTriangle, CheckCircle, XCircle, Clock, Send,
} from 'lucide-react'
import { conventionsAPI } from '@/lib/api'
import { colors, typography, borders } from '@/lib/designSystem'

interface ConventionModification {
  id: number
  conventionId: number
  modifieParNom: string
  dateModification: string
  motifModification: string
  donneesAvant: Record<string, string | number | null>
  donneesApres: Record<string, string | number | null>
  champsModifies: string[]
  typeModification: string
}

interface ChatterEvent {
  id: string
  type: 'status_change' | 'field_change' | 'creation' | 'rejection'
  date: string
  user: string
  title: string
  details?: string
  changes?: Array<{ field: string; before: string; after: string }>
  icon: 'send' | 'check' | 'x' | 'edit' | 'clock' | 'alert' | 'create'
  color: string
}

interface ConventionChatterProps {
  conventionId: number
  statut: string
  createdBy: string
  createdAt: string
  dateSoumission: string | null
  dateValidation: string | null
  valideParNom?: string | null
  motifRejet?: string | null
}

const FIELD_LABELS: Record<string, string> = {
  libelle: 'Libelle',
  numero: 'Numero',
  objet: 'Objet',
  typeConvention: 'Type',
  tauxCommission: 'Taux de commission',
  budget: 'Budget',
  baseCalcul: 'Base de calcul',
  tauxTva: 'Taux TVA',
  dateDebut: 'Date de debut',
  dateFin: 'Date de fin',
  description: 'Description',
  code: 'Code',
  statut: 'Statut',
}

const formatDateTime = (dateStr: string): string => {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

const formatValue = (val: string | number | null): string => {
  if (val === null || val === '') return '-'
  return String(val)
}

const EVENT_ICONS: Record<string, typeof Send> = {
  send: Send,
  check: CheckCircle,
  x: XCircle,
  edit: FileText,
  clock: Clock,
  alert: AlertTriangle,
  create: FileText,
}

const ConventionChatter = ({
  conventionId,
  createdBy,
  createdAt,
  dateSoumission,
  dateValidation,
  valideParNom,
  motifRejet,
}: ConventionChatterProps) => {
  const [modifications, setModifications] = useState<ConventionModification[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true)
      const response = await conventionsAPI.getHistorique(conventionId)
      const data: ConventionModification[] = response.data.data || []
      setModifications(data)
    } catch {
      // Silently fail - history is non-critical
    } finally {
      setLoading(false)
    }
  }, [conventionId])

  useEffect(() => { loadHistory() }, [loadHistory])

  // Build timeline events from modifications + workflow dates
  const events: ChatterEvent[] = []

  // Creation event
  if (createdAt) {
    events.push({
      id: 'creation',
      type: 'creation',
      date: createdAt,
      user: createdBy || 'Systeme',
      title: 'Convention creee',
      icon: 'create',
      color: colors.primary[600],
    })
  }

  // Submission event
  if (dateSoumission) {
    events.push({
      id: 'soumission',
      type: 'status_change',
      date: dateSoumission,
      user: createdBy || 'Utilisateur',
      title: 'Convention soumise pour validation',
      icon: 'send',
      color: colors.warning[600],
    })
  }

  // Rejection event
  if (motifRejet) {
    events.push({
      id: 'rejet',
      type: 'rejection',
      date: dateValidation || dateSoumission || createdAt,
      user: 'Validateur',
      title: 'Convention rejetee',
      details: motifRejet,
      icon: 'x',
      color: colors.danger[600],
    })
  }

  // Validation event
  if (dateValidation && !motifRejet) {
    events.push({
      id: 'validation',
      type: 'status_change',
      date: dateValidation,
      user: valideParNom || 'Validateur',
      title: 'Convention validee',
      icon: 'check',
      color: colors.success[600],
    })
  }

  // Field modification events
  modifications.forEach((mod: ConventionModification) => {
    const changes = mod.champsModifies
      .map((champ: string) => ({
        field: FIELD_LABELS[champ] || champ,
        before: formatValue(mod.donneesAvant[champ]),
        after: formatValue(mod.donneesApres[champ]),
      }))
      .filter((c: { before: string; after: string }) => c.before !== c.after)

    events.push({
      id: `mod-${mod.id}`,
      type: mod.typeModification === 'STATUS_CHANGE' ? 'status_change' : 'field_change',
      date: mod.dateModification,
      user: mod.modifieParNom,
      title: mod.typeModification === 'STATUS_CHANGE'
        ? 'Changement de statut'
        : `${changes.length} champ(s) modifie(s)`,
      details: mod.motifModification,
      changes: changes.length > 0 ? changes : undefined,
      icon: mod.typeModification === 'STATUS_CHANGE' ? 'clock' : 'edit',
      color: mod.typeModification === 'STATUS_CHANGE' ? colors.info[600] : colors.neutral[500],
    })
  })

  // Sort events by date descending (most recent first)
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const visibleEvents = expanded ? events : events.slice(0, 3)

  return (
    <Box sx={{
      bgcolor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: borders.radius.lg,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{
        px: 2.5, py: 1.5,
        bgcolor: colors.neutral[50],
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}>
        <History size={16} style={{ color: colors.textSecondary }} />
        <Typography sx={{
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.semibold,
          color: colors.textPrimary,
        }}>
          Historique & Activite
        </Typography>
        <Chip
          label={events.length}
          size="small"
          sx={{
            height: 20,
            fontSize: typography.sizes['2xs'],
            bgcolor: colors.neutral[200],
            color: colors.neutral[600],
            fontWeight: typography.weights.semibold,
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={20} />
          </Box>
        ) : events.length === 0 ? (
          <Alert severity="info" sx={{ fontSize: typography.sizes.sm }}>
            Aucune activite enregistree
          </Alert>
        ) : (
          <>
            {/* Timeline */}
            <Box sx={{ position: 'relative' }}>
              {/* Vertical line */}
              <Box sx={{
                position: 'absolute',
                left: 11,
                top: 8,
                bottom: 8,
                width: 2,
                bgcolor: colors.neutral[200],
              }} />

              {visibleEvents.map((event, idx) => {
                const IconComponent = EVENT_ICONS[event.icon] || FileText
                return (
                  <Box key={event.id} sx={{ display: 'flex', gap: 1.5, mb: idx < visibleEvents.length - 1 ? 2 : 0, position: 'relative' }}>
                    {/* Icon dot */}
                    <Box sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: colors.surface,
                      border: `2px solid ${event.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      zIndex: 1,
                    }}>
                      <IconComponent size={12} style={{ color: event.color }} />
                    </Box>

                    {/* Event content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography sx={{
                          fontSize: typography.sizes.sm,
                          fontWeight: typography.weights.semibold,
                          color: colors.textPrimary,
                        }}>
                          {event.title}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <User size={11} style={{ color: colors.textSecondary }} />
                          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                            {event.user}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Calendar size={11} style={{ color: colors.textSecondary }} />
                          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                            {formatDateTime(event.date)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Rejection motif */}
                      {event.details && (
                        <Box sx={{
                          mt: 1,
                          p: 1.5,
                          bgcolor: event.type === 'rejection' ? colors.danger[25] : colors.neutral[50],
                          border: `1px solid ${event.type === 'rejection' ? colors.danger[200] : colors.neutral[200]}`,
                          borderRadius: borders.radius.md,
                          borderLeft: `3px solid ${event.type === 'rejection' ? colors.danger[400] : colors.neutral[300]}`,
                        }}>
                          <Typography sx={{
                            fontSize: typography.sizes.xs,
                            color: event.type === 'rejection' ? colors.danger[700] : colors.textSecondary,
                            fontStyle: 'italic',
                          }}>
                            &ldquo;{event.details}&rdquo;
                          </Typography>
                        </Box>
                      )}

                      {/* Field changes */}
                      {event.changes && event.changes.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {event.changes.map((change, ci) => (
                            <Box key={ci} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                              <Typography sx={{
                                fontSize: typography.sizes.xs,
                                color: colors.textSecondary,
                                fontWeight: typography.weights.medium,
                                minWidth: 100,
                              }}>
                                {change.field}
                              </Typography>
                              <Chip
                                label={change.before}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: typography.sizes['2xs'],
                                  textDecoration: 'line-through',
                                  bgcolor: colors.danger[50],
                                  color: colors.danger[700],
                                }}
                              />
                              <ArrowRight size={12} style={{ color: colors.neutral[400] }} />
                              <Chip
                                label={change.after}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: typography.sizes['2xs'],
                                  bgcolor: colors.success[50],
                                  color: colors.success[700],
                                  fontWeight: typography.weights.semibold,
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      )}

                      {idx < visibleEvents.length - 1 && (
                        <Divider sx={{ mt: 1.5, borderColor: colors.divider }} />
                      )}
                    </Box>
                  </Box>
                )
              })}
            </Box>

            {/* Show more/less */}
            {events.length > 3 && (
              <Typography
                onClick={() => setExpanded(!expanded)}
                sx={{
                  mt: 2,
                  fontSize: typography.sizes.xs,
                  color: colors.primary[600],
                  cursor: 'pointer',
                  fontWeight: typography.weights.medium,
                  textAlign: 'center',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {expanded ? 'Voir moins' : `Voir les ${events.length - 3} evenements precedents`}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}

export default ConventionChatter
