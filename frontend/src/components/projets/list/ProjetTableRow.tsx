import {
  Box,
  TableCell,
  TableRow,
  IconButton,
  Typography,
  LinearProgress,
  Checkbox,
} from '@mui/material'
import {
  MoreVert,
  Star,
  StarBorder,
  FolderOpen,
} from '@mui/icons-material'
import { StatusBadge } from '@/components/core'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { Projet } from '@/lib/projetsAPI'

export interface ColumnConfig {
  key: string
  label: string
  visible: boolean
}

interface ProjetTableRowProps {
  projet: Projet
  onRowClick: (id: number) => void
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, projet: Projet) => void
  columns: ColumnConfig[]
  isFavorite?: boolean
  onToggleFavorite?: (id: number) => void
  selectable: boolean
  selected: boolean
  onSelect: (id: number) => void
}

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
  return amount.toLocaleString('fr-FR')
}

const formatDate = (date?: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const listStyles = componentStyles.listView

const ProjetTableRow = ({
  projet, onRowClick, onMenuOpen, columns,
  isFavorite = false, onToggleFavorite, selectable, selected, onSelect,
}: ProjetTableRowProps) => {
  const isVisible = (key: string) => columns.find(c => c.key === key)?.visible !== false
  const id = projet.id ?? 0

  return (
    <TableRow
      hover
      onClick={() => onRowClick(id)}
      sx={{
        ...listStyles.dataRow,
        ...(selected ? listStyles.dataRowSelected : {}),
        ...(projet.estEnRetard ? { borderLeft: `3px solid ${colors.danger[500]}` } : {}),
      }}
    >
      {selectable && (
        <TableCell padding="checkbox" sx={{ width: 42 }}>
          <Checkbox
            size="small"
            checked={selected}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onSelect(id)}
            sx={{ p: 0.5 }}
          />
        </TableCell>
      )}

      {onToggleFavorite && (
        <TableCell sx={{ width: 36, px: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(id) }}
            sx={{ p: 0.25, color: isFavorite ? colors.warning[500] : colors.neutral[300], '&:hover': { color: colors.warning[500] } }}
          >
            {isFavorite ? <Star sx={{ fontSize: 18 }} /> : <StarBorder sx={{ fontSize: 18 }} />}
          </IconButton>
        </TableCell>
      )}

      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderOpen sx={{ fontSize: 18, color: colors.primary[600] }} />
          <Box>
            <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.base, color: colors.textPrimary }}>
              {projet.code}
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {projet.nom}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {isVisible('statut') && <TableCell><StatusBadge status={projet.statut} /></TableCell>}

      {isVisible('budget') && (
        <TableCell align="right">
          <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.base, fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(projet.budgetTotal)} MAD
          </Typography>
        </TableCell>
      )}

      {isVisible('avancement') && (
        <TableCell sx={{ minWidth: 120 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={projet.pourcentageAvancement}
              sx={{
                flex: 1,
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
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.semibold, minWidth: 32, textAlign: 'right' }}>
              {projet.pourcentageAvancement}%
            </Typography>
          </Box>
        </TableCell>
      )}

      {isVisible('convention') && (
        <TableCell>
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
            {projet.conventionNumero || '-'}
          </Typography>
        </TableCell>
      )}

      {isVisible('dateDebut') && (
        <TableCell>
          <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>{formatDate(projet.dateDebut)}</Typography>
        </TableCell>
      )}

      {isVisible('chefProjet') && (
        <TableCell>
          <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>{projet.chefProjetNom || '-'}</Typography>
        </TableCell>
      )}

      <TableCell align="center" sx={{ width: 50 }}>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onMenuOpen(e, projet) }}>
          <MoreVert fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

export default ProjetTableRow
