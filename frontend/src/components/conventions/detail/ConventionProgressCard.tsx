import { Box, Typography, LinearProgress, Tooltip } from '@mui/material'
import {
  CheckCircle, RadioButtonUnchecked, TripOrigin,
  Timeline,
} from '@mui/icons-material'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'
import type { ConventionDetailEnrichedDTO } from '@/types/api'

// ──── Types ────

interface ConventionProgressCardProps {
  convention: {
    statut: string; budget: number; dateDebut: string; dateFin?: string
  }
  enrichedData: ConventionDetailEnrichedDTO | null
}

interface Milestone {
  label: string
  done: boolean
  current: boolean
  hint?: string
}

// ──── Helpers ────

const computeTimeProgress = (dateDebut: string, dateFin?: string): number => {
  if (!dateFin) return 0
  const now = new Date().getTime()
  const start = new Date(dateDebut).getTime()
  const end = new Date(dateFin).getTime()
  if (end <= start) return 100
  return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100))
}

const buildMilestones = (
  convention: ConventionProgressCardProps['convention'],
  enriched: ConventionDetailEnrichedDTO | null,
): Milestone[] => {
  const s = convention.statut
  const hasProjects = (enriched?.nombreProjets ?? 0) > 0
  const hasMarches = (enriched?.nombreMarches ?? 0) > 0
  const hasPartners = (enriched?.nombrePartenaires ?? 0) > 0

  return [
    { label: 'Creation', done: true, current: s === 'BROUILLON', hint: 'Convention creee' },
    { label: 'Soumission', done: s !== 'BROUILLON', current: s === 'SOUMIS', hint: 'Soumise pour validation' },
    { label: 'Validation', done: ['VALIDEE', 'VALIDE', 'EN_EXECUTION', 'EN_COURS', 'ACHEVE'].includes(s), current: s === 'VALIDEE' || s === 'VALIDE', hint: 'Validee par un responsable' },
    { label: 'Partenaires', done: hasPartners, current: false, hint: hasPartners ? `${enriched?.nombrePartenaires} partenaire(s)` : 'Aucun partenaire' },
    { label: 'Projets', done: hasProjects, current: false, hint: hasProjects ? `${enriched?.nombreProjets} projet(s)` : 'Aucun projet' },
    { label: 'Marches', done: hasMarches, current: false, hint: hasMarches ? `${enriched?.nombreMarches} marche(s)` : 'Aucun marche' },
    { label: 'Execution', done: s === 'EN_EXECUTION' || s === 'EN_COURS' || s === 'ACHEVE', current: s === 'EN_EXECUTION' || s === 'EN_COURS' },
    { label: 'Cloture', done: s === 'ACHEVE', current: s === 'ACHEVE', hint: 'Convention cloturee' },
  ]
}

// ──── Sub-components ────

const MilestoneItem = ({ milestone, isLast }: { key?: string; milestone: Milestone; isLast: boolean }) => {
  const iconColor = milestone.done ? colors.success[500] : milestone.current ? colors.primary[500] : colors.neutral[300]
  return (
    <Tooltip title={milestone.hint || milestone.label} placement="top" arrow>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: isLast ? '0 0 auto' : 1, position: 'relative', minWidth: 50 }}>
        {milestone.done
          ? <CheckCircle sx={{ fontSize: 18, color: iconColor, zIndex: 1 }} />
          : milestone.current
            ? <TripOrigin sx={{ fontSize: 18, color: iconColor, zIndex: 1 }} />
            : <RadioButtonUnchecked sx={{ fontSize: 18, color: iconColor, zIndex: 1 }} />}
        <Typography sx={{
          fontSize: '9px', fontWeight: milestone.current ? typography.weights.bold : typography.weights.medium,
          color: milestone.done ? colors.success[700] : milestone.current ? colors.primary[700] : colors.textDisabled,
          mt: 0.25, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap',
        }}>
          {milestone.label}
        </Typography>
      </Box>
    </Tooltip>
  )
}

const ProgressBar = ({ label, value, color, hint }: { label: string; value: number; color: string; hint?: string }) => (
  <Box sx={{ flex: 1, minWidth: 100 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
      <Typography sx={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
        {label}
      </Typography>
      <Tooltip title={hint || ''} placement="top">
        <Typography sx={{ fontSize: '10px', fontWeight: typography.weights.bold, color }}>
          {value.toFixed(0)}%
        </Typography>
      </Tooltip>
    </Box>
    <LinearProgress
      variant="determinate"
      value={Math.min(value, 100)}
      sx={{
        height: 5, borderRadius: 3, bgcolor: colors.neutral[100],
        '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: color },
      }}
    />
  </Box>
)

// ──── Main Component ────

const ConventionProgressCard = ({ convention, enrichedData }: ConventionProgressCardProps) => {
  const milestones = buildMilestones(convention, enrichedData)
  const completedCount = milestones.filter(m => m.done).length
  const overallProgress = (completedCount / milestones.length) * 100
  const timeProgress = computeTimeProgress(convention.dateDebut, convention.dateFin)
  const realisationProgress = enrichedData?.tauxRealisation ?? 0

  return (
    <Box sx={{
      ...componentStyles.card, p: 0, overflow: 'hidden',
      border: `1px solid ${colors.border}`,
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 2, py: 1, bgcolor: colors.neutral[25],
        borderBottom: `1px solid ${colors.borderSubtle}`,
      }}>
        <Timeline sx={{ fontSize: 16, color: colors.primary[500] }} />
        <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em', flex: 1 }}>
          Progression
        </Typography>
        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.primary[600] }}>
          {overallProgress.toFixed(0)}%
        </Typography>
      </Box>

      {/* Milestones row */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
          {/* Connecting line */}
          <Box sx={{
            position: 'absolute', top: 9, left: 25, right: 25,
            height: 2, bgcolor: colors.neutral[200], zIndex: 0,
          }} />
          <Box sx={{
            position: 'absolute', top: 9, left: 25, zIndex: 0,
            height: 2, bgcolor: colors.success[400],
            width: `${Math.max(0, ((completedCount - 1) / (milestones.length - 1)) * 100)}%`,
            transition: 'width 0.5s ease',
          }} />
          {milestones.map((m: Milestone, i: number) => (
            <MilestoneItem key={m.label} milestone={m} isLast={i === milestones.length - 1} />
          ))}
        </Box>
      </Box>

      {/* Progress bars */}
      <Box sx={{
        display: 'flex', gap: 2, px: 2, py: 1.25,
        borderTop: `1px solid ${colors.borderSubtle}`, bgcolor: colors.neutral[25],
      }}>
        <ProgressBar label="Etapes" value={overallProgress} color={colors.primary[500]} hint={`${completedCount}/${milestones.length} etapes`} />
        <ProgressBar label="Temps" value={timeProgress} color={timeProgress > 80 ? colors.warning[500] : colors.info[500]} hint={convention.dateFin ? `Fin: ${new Date(convention.dateFin).toLocaleDateString('fr-FR')}` : 'Pas de date de fin'} />
        <ProgressBar
          label="Realisation"
          value={realisationProgress}
          color={realisationProgress > 80 ? colors.success[500] : realisationProgress > 40 ? colors.primary[500] : colors.neutral[400]}
          hint={enrichedData ? `${enrichedData.nombreMarches} marche(s)` : undefined}
        />
      </Box>
    </Box>
  )
}

export default ConventionProgressCard
