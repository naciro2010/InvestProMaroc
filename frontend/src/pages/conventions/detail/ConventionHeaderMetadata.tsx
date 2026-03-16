import { useState, type MouseEvent } from 'react'
import { Box, Typography, Tooltip, IconButton, Chip, Menu, MenuItem } from '@mui/material'
import { CalendarMonth, Star, StarBorder, Person, AccessTime } from '@mui/icons-material'
import { StatusBadge } from '@/components/core'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { colors, typography, borders, transitions } from '@/lib/designSystem'

// ──── Types ────

interface ConventionHeaderMetadataProps {
  code: string
  numero: string
  libelle: string
  objet?: string
  typeConvention: 'CADRE' | 'SPECIFIQUE'
  dateSignature?: string
  dateDebut?: string
  dateFin?: string
  canEdit: boolean
  onEditField: (fieldKey: string, value: string) => void
  priorite?: string
  responsable?: string
  onPriorityChange?: (priority: string) => void
}

// ──── Priority config ────

const PRIORITIES: Record<string, { label: string; color: string; stars: number }> = {
  BASSE: { label: 'Basse', color: colors.neutral[400], stars: 0 },
  NORMALE: { label: 'Normale', color: colors.warning[400], stars: 1 },
  HAUTE: { label: 'Haute', color: colors.warning[600], stars: 2 },
  CRITIQUE: { label: 'Critique', color: colors.danger[500], stars: 3 },
}

// ──── Deadline indicator ────

const DeadlineChip = ({ dateFin }: { dateFin: string }) => {
  const daysLeft = Math.ceil((new Date(dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) {
    return (
      <Chip icon={<AccessTime sx={{ fontSize: 12 }} />} label={`${Math.abs(daysLeft)}j de retard`} size="small"
        sx={{ height: 20, fontSize: '10px', fontWeight: typography.weights.bold,
          bgcolor: colors.danger[100], color: colors.danger[700], '& .MuiChip-icon': { color: colors.danger[600] } }} />
    )
  }
  if (daysLeft <= 7) {
    return (
      <Chip icon={<AccessTime sx={{ fontSize: 12 }} />} label={`${daysLeft}j restants`} size="small"
        sx={{ height: 20, fontSize: '10px', fontWeight: typography.weights.bold,
          bgcolor: colors.danger[50], color: colors.danger[600], '& .MuiChip-icon': { color: colors.danger[500] } }} />
    )
  }
  if (daysLeft <= 30) {
    return (
      <Chip icon={<AccessTime sx={{ fontSize: 12 }} />} label={`${daysLeft}j restants`} size="small"
        sx={{ height: 20, fontSize: '10px', fontWeight: typography.weights.semibold,
          bgcolor: colors.warning[50], color: colors.warning[700], '& .MuiChip-icon': { color: colors.warning[500] } }} />
    )
  }
  if (daysLeft <= 90) {
    return (
      <Chip icon={<AccessTime sx={{ fontSize: 12 }} />} label={`${daysLeft}j`} size="small"
        sx={{ height: 20, fontSize: '10px', bgcolor: colors.info[50], color: colors.info[600], '& .MuiChip-icon': { color: colors.info[500] } }} />
    )
  }
  return null
}

// ──── Priority Stars ────

const PriorityStars = ({ priorite, canEdit, onChange }: {
  priorite: string; canEdit: boolean; onChange?: (p: string) => void
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const cfg = PRIORITIES[priorite] || PRIORITIES.NORMALE
  const priorities = Object.entries(PRIORITIES)

  return (
    <>
      <Tooltip title={`Priorite: ${cfg.label}`}>
        <Box
          onClick={canEdit ? (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget as HTMLElement) : undefined}
          sx={{
            display: 'flex', alignItems: 'center', gap: 0.15,
            cursor: canEdit ? 'pointer' : 'default',
            borderRadius: borders.radius.sm, px: 0.25,
            '&:hover': canEdit ? { bgcolor: colors.neutral[100] } : {},
            transition: `background-color ${transitions.fast}`,
          }}
        >
          {[0, 1, 2].map(i => (
            i < cfg.stars
              ? <Star key={i} sx={{ fontSize: 16, color: cfg.color }} />
              : <StarBorder key={i} sx={{ fontSize: 16, color: colors.neutral[300] }} />
          ))}
        </Box>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {priorities.map(([key, p]) => (
          <MenuItem key={key} onClick={() => { onChange?.(key); setAnchorEl(null) }}
            selected={key === priorite}
            sx={{ fontSize: typography.sizes.xs, gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 0.15 }}>
              {[0, 1, 2].map(i => (
                i < p.stars
                  ? <Star key={i} sx={{ fontSize: 14, color: p.color }} />
                  : <StarBorder key={i} sx={{ fontSize: 14, color: colors.neutral[300] }} />
              ))}
            </Box>
            {p.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

// ──── Main Component ────

const ConventionHeaderMetadata = ({
  code, numero, libelle, objet, typeConvention,
  dateSignature, dateDebut, dateFin,
  canEdit, onEditField,
  priorite = 'NORMALE', responsable, onPriorityChange,
}: ConventionHeaderMetadataProps) => (
  <Box sx={{ mb: 1.5 }}>
    {/* Title row with priority */}
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <PriorityStars priorite={priorite} canEdit={canEdit} onChange={onPriorityChange} />
      <Box
        sx={{
          flex: 1,
          fontSize: typography.sizes.xl, fontWeight: typography.weights.bold,
          color: colors.textPrimary, cursor: canEdit ? 'pointer' : 'default',
          borderRadius: '4px', px: 0.5, mx: -0.5,
          '&:hover': canEdit ? { bgcolor: colors.primary[25] } : {},
        }}
        onClick={canEdit ? () => onEditField('libelle', libelle || '') : undefined}
      >
        <RichTextDisplay html={libelle || code} variant="compact" allowExpand={false} />
      </Box>
    </Box>

    {/* Description */}
    {objet && (
      <Box
        sx={{
          mb: 1, cursor: canEdit ? 'pointer' : 'default',
          borderRadius: '4px', px: 0.5, mx: -0.5,
          '&:hover': canEdit ? { bgcolor: colors.primary[25] } : {},
        }}
        onClick={canEdit ? () => onEditField('objet', objet || '') : undefined}
      >
        <RichTextDisplay html={objet} variant="compact" collapseLength={200} />
      </Box>
    )}

    {/* Enhanced metadata bar */}
    <Box sx={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5,
      py: 0.75, borderTop: `1px solid ${colors.borderSubtle}`,
    }}>
      {/* Code */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Code:</Typography>
        <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{code}</Typography>
      </Box>
      <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />

      {/* Numero */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>N:</Typography>
        <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>{numero}</Typography>
      </Box>
      <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />

      {/* Type badge */}
      <StatusBadge status={typeConvention} size="small" />

      {/* Responsible person */}
      {responsable && (
        <>
          <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
          <Tooltip title="Responsable">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Person sx={{ fontSize: 14, color: colors.primary[500] }} />
              <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, color: colors.primary[700] }}>
                {responsable}
              </Typography>
            </Box>
          </Tooltip>
        </>
      )}

      {/* Dates */}
      {dateSignature && (
        <>
          <Box sx={{ width: '1px', height: 14, bgcolor: colors.border }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarMonth sx={{ fontSize: 13, color: colors.textSecondary }} />
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              {new Date(dateSignature).toLocaleDateString('fr-FR')}
              {dateDebut && ` — ${new Date(dateDebut).toLocaleDateString('fr-FR')}`}
              {dateFin && ` → ${new Date(dateFin).toLocaleDateString('fr-FR')}`}
            </Typography>
          </Box>
        </>
      )}

      {/* Deadline indicator */}
      {dateFin && <DeadlineChip dateFin={dateFin} />}
    </Box>
  </Box>
)

export default ConventionHeaderMetadata
