import { Box, Typography, Paper, IconButton, LinearProgress } from '@mui/material'
import { MoreVert } from '@mui/icons-material'
import { GripVertical } from 'lucide-react'
import { useSortable } from '@/components/core/SortableTable'
import { CSS } from '@dnd-kit/utilities'
import { StatusBadge } from '@/components/core'
import { colors, typography, transitions, componentStyles } from '@/lib/designSystem'
import type { Projet } from '@/lib/projetsAPI'

interface SortableProjetCardProps {
  projet: Projet
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, projet: Projet) => void
  onClick: () => void
  formatMontant: (montant: number) => string
}

const SortableProjetCard = ({
  projet,
  onMenuOpen,
  onClick,
  formatMontant,
}: SortableProjetCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: projet.id ?? 0 })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        ...componentStyles.cardInteractive,
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDragging ? colors.primary[50] : colors.surface,
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, flex: 1, minWidth: 0 }}>
          {/* Drag Handle */}
          <Box
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            sx={{
              cursor: 'grab',
              color: colors.neutral[400],
              '&:hover': { color: colors.neutral[600] },
              transition: `color ${transitions.fast}`,
              mt: 0.5,
            }}
          >
            <GripVertical className="w-4 h-4" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              {projet.code}
            </Typography>
            <Typography
              sx={{
                fontWeight: typography.weights.semibold,
                mt: 0.5,
                fontSize: typography.sizes.lg,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {projet.nom}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onMenuOpen(e, projet) }}
        >
          <MoreVert />
        </IconButton>
      </Box>

      <Box sx={{ mb: 2 }}>
        <StatusBadge status={projet.statut} />
      </Box>

      {projet.description && (
        <Typography
          sx={{
            mb: 2,
            color: colors.textSecondary,
            fontSize: typography.sizes.sm,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {projet.description}
        </Typography>
      )}

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Avancement
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
            {projet.pourcentageAvancement}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={projet.pourcentageAvancement}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: colors.neutral[100],
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              bgcolor: projet.pourcentageAvancement >= 80 ? colors.success[400]
                : projet.pourcentageAvancement >= 40 ? colors.primary[400]
                : colors.warning[400],
            },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
        <Typography sx={{ fontSize: typography.sizes.sm }}>
          <strong>Budget:</strong> {formatMontant(projet.budgetTotal)}
        </Typography>
        {projet.dateDebut && (
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            {new Date(projet.dateDebut).toLocaleDateString('fr-FR')}
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

export default SortableProjetCard
