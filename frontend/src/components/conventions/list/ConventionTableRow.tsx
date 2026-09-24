import { Box, TableCell, TableRow, IconButton, Checkbox } from '@mui/material'
import { MoreVert, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material'
import { StatusBadge } from '@/components/core'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { formatMillions, formatPercent, formatRate } from '@/lib/utils'
import type { Convention, ConventionWithChildren, ColumnConfig } from './ConventionListTable'

// ==================== HELPERS ====================

const TYPE_LABELS: Record<string, string> = {
  CADRE: 'Cadre',
  SPECIFIQUE: 'Spécifique',
  NON_CADRE: 'Non cadre',
  AVENANT: 'Avenant',
}

const monthYear = (date?: string): string => {
  if (!date) return '…'
  const d = new Date(date)
  return Number.isNaN(d.getTime()) ? '…' : `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const nowrap = { whiteSpace: 'nowrap' as const }

// ==================== PROPS ====================

interface ConventionTableRowProps {
  conv: ConventionWithChildren
  expanded: boolean
  onToggle: () => void
  onRowClick: (id: number) => void
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, conv: Convention) => void
  columns: ColumnConfig[]
  /** Taux d'engagement par convention (tableau de bord exécutif) */
  engagement?: Record<number, number>
  favoriteIds?: Set<number>
  onToggleFavorite?: (id: number) => void
  selectable: boolean
  selectedIds: Set<number>
  onSelect: (id: number) => void
}

interface RowProps extends Omit<ConventionTableRowProps, 'conv' | 'expanded' | 'onToggle' | 'favoriteIds' | 'selectedIds'> {
  conv: Convention
  isChild: boolean
  childCount?: number
  expanded?: boolean
  onToggle?: () => void
  isFavorite: boolean
  selected: boolean
}

const listStyles = componentStyles.listView

// ==================== LIGNE ====================

const Row = ({
  conv, isChild, childCount = 0, expanded, onToggle, onRowClick, onMenuOpen, columns, engagement,
  isFavorite, onToggleFavorite, selectable, selected, onSelect,
}: RowProps) => {
  const isVisible = (key: string) => columns.find(c => c.key === key)?.visible !== false
  const taux = engagement?.[conv.id]

  return (
    <TableRow
      hover
      tabIndex={0}
      onClick={() => onRowClick(conv.id)}
      onKeyDown={(e) => { if (e.key === 'Enter') onRowClick(conv.id) }}
      sx={{ ...listStyles.dataRow, ...(selected ? listStyles.dataRowSelected : {}) }}
    >
      {selectable && (
        <TableCell padding="checkbox" sx={{ width: 42 }}>
          <Checkbox
            size="small"
            checked={selected}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onSelect(conv.id)}
            inputProps={{ 'aria-label': `Sélectionner ${conv.code}` }}
            sx={{ p: 0.5 }}
          />
        </TableCell>
      )}

      {onToggleFavorite && (
        <TableCell sx={{ width: 40, pl: 2, pr: 0 }}>
          <Box
            component="button"
            type="button"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleFavorite(conv.id) }}
            aria-label={isFavorite ? `Retirer ${conv.code} des favoris` : `Ajouter ${conv.code} aux favoris`}
            aria-pressed={isFavorite}
            sx={{
              border: 0, background: 'transparent', cursor: 'pointer', p: 0.25, fontSize: 15, lineHeight: 1,
              color: isFavorite ? colors.brass.main : colors.neutral[300],
              '&:hover': { color: colors.brass.main },
            }}
          >
            {isFavorite ? '★' : '☆'}
          </Box>
        </TableCell>
      )}

      <TableCell sx={{ minWidth: 240 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 0.5,
            ...(isChild && { ml: 3, pl: 1.5, boxShadow: `inset 1px 0 0 ${colors.border}` }),
          }}
        >
          {!isChild && (
            <Box sx={{ width: 22, flexShrink: 0, mt: '-1px' }}>
              {childCount > 0 && (
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onToggle?.() }}
                  aria-label={expanded ? 'Masquer les sous-conventions' : `Afficher les ${childCount} sous-conventions`}
                  aria-expanded={expanded}
                  sx={{ p: 0.25, color: colors.textSecondary }}
                >
                  {expanded ? <KeyboardArrowDown sx={{ fontSize: 18 }} /> : <KeyboardArrowRight sx={{ fontSize: 18 }} />}
                </IconButton>
              )}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontWeight: typography.weights.semibold, fontSize: 14, color: colors.textPrimary, ...nowrap }}>
              {conv.code}
            </Box>
            <RichTextDisplay html={conv.libelle} variant="inline" sx={{ maxWidth: 270, display: 'block', color: colors.textSecondary, fontSize: 13 }} />
          </Box>
        </Box>
      </TableCell>

      {isVisible('type') && <TableCell sx={nowrap}>{TYPE_LABELS[conv.type ?? ''] ?? (conv.type || '—')}</TableCell>}
      {isVisible('statut') && <TableCell sx={nowrap}><StatusBadge status={conv.statut} /></TableCell>}
      {isVisible('budget') && (
        <TableCell align="right" sx={{ ...nowrap, fontWeight: typography.weights.medium }}>{formatMillions(conv.budget)}</TableCell>
      )}
      {isVisible('commission') && (
        <TableCell align="right" sx={{ ...nowrap, color: colors.textSecondary }}>{formatRate(conv.tauxCommission)}</TableCell>
      )}
      {isVisible('engage') && (
        <TableCell align="right" sx={{ ...nowrap, fontWeight: typography.weights.medium }}>
          {taux !== undefined ? formatPercent(taux) : '—'}
        </TableCell>
      )}
      {isVisible('dateDebut') && (
        <TableCell sx={{ ...nowrap, color: colors.textSecondary, fontSize: 13 }}>
          {monthYear(conv.dateDebut)} → {monthYear(conv.dateFin)}
        </TableCell>
      )}
      {isVisible('createdBy') && (
        <TableCell sx={{ ...nowrap, color: colors.textSecondary, fontSize: 13 }}>{conv.createdByNom || '—'}</TableCell>
      )}
      <TableCell align="center" sx={{ width: 48, pr: 2 }}>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onMenuOpen(e, conv) }}
          aria-label={`Actions sur ${conv.code}`}
          sx={{ color: colors.textSecondary }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

// ==================== CONVENTION + SOUS-CONVENTIONS ====================

/**
 * Ligne de convention suivie de ses sous-conventions, en retrait avec un
 * filet gauche, dans le même tableau (colonnes alignées).
 */
const ConventionTableRow = ({
  conv, expanded, onToggle, favoriteIds, selectedIds, ...rest
}: ConventionTableRowProps) => {
  const children = conv.sousConventions ?? []
  return (
    <>
      <Row
        {...rest}
        conv={conv}
        isChild={false}
        childCount={children.length}
        expanded={expanded}
        onToggle={onToggle}
        isFavorite={favoriteIds?.has(conv.id) ?? false}
        selected={selectedIds.has(conv.id)}
      />
      {expanded && children.map(sc => (
        <Row
          key={sc.id}
          {...rest}
          conv={{ ...sc, type: sc.type ?? 'SPECIFIQUE' }}
          isChild
          isFavorite={favoriteIds?.has(sc.id) ?? false}
          selected={selectedIds.has(sc.id)}
        />
      ))}
    </>
  )
}

export default ConventionTableRow
