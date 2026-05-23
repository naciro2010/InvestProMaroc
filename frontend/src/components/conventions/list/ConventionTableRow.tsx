import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Typography,
  Chip,
  Collapse,
  Checkbox,
} from '@mui/material'
import {
  MoreVert,
  KeyboardArrowDown,
  KeyboardArrowRight,
  FolderOpen,
  Description,
  Star,
  StarBorder,
} from '@mui/icons-material'
import { StatusBadge } from '@/components/core'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { Convention, ConventionWithChildren, ColumnConfig } from './ConventionListTable'

// ==================== HELPERS ====================

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
  return amount.toLocaleString('fr-FR')
}

const formatDate = (date?: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ==================== PROPS ====================

interface ConventionTableRowProps {
  conv: ConventionWithChildren
  expanded: boolean
  onToggle: () => void
  onRowClick: (id: number) => void
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, conv: Convention) => void
  columns: ColumnConfig[]
  isFavorite?: boolean
  onToggleFavorite?: (id: number) => void
  selectable: boolean
  selected: boolean
  onSelect: (id: number) => void
}

const listStyles = componentStyles.listView

// ==================== COMPONENT ====================

const ConventionTableRow = ({
  conv, expanded, onToggle, onRowClick, onMenuOpen, columns,
  isFavorite = false, onToggleFavorite, selectable, selected, onSelect,
}: ConventionTableRowProps) => {
  const hasSous = conv.sousConventions && conv.sousConventions.length > 0
  const isVisible = (key: string) => columns.find(c => c.key === key)?.visible !== false

  return (
    <>
      <TableRow
        hover
        onClick={() => onRowClick(conv.id)}
        sx={{
          ...listStyles.dataRow,
          ...(selected ? listStyles.dataRowSelected : {}),
          borderLeft: conv.type === 'CADRE' ? `3px solid ${colors.primary[600]}` : 'none',
        }}
      >
        {selectable && (
          <TableCell padding="checkbox" sx={{ width: 42 }}>
            <Checkbox
              size="small"
              checked={selected}
              onClick={(e) => e.stopPropagation()}
              onChange={() => onSelect(conv.id)}
              sx={{ p: 0.5 }}
            />
          </TableCell>
        )}

        {onToggleFavorite && (
          <TableCell sx={{ width: 36, px: 0.5 }}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(conv.id) }}
              aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-pressed={isFavorite}
              sx={{ p: 0.25, color: isFavorite ? colors.warning[500] : colors.neutral[300], '&:hover': { color: colors.warning[500] } }}
            >
              {isFavorite ? <Star sx={{ fontSize: 18 }} /> : <StarBorder sx={{ fontSize: 18 }} />}
            </IconButton>
          </TableCell>
        )}

        <TableCell sx={{ pl: 1, width: 40 }}>
          {hasSous && (
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggle() }}
              aria-label={expanded ? 'Réduire les sous-conventions' : 'Afficher les sous-conventions'}
              aria-expanded={expanded}>
              {expanded ? <KeyboardArrowDown fontSize="small" /> : <KeyboardArrowRight fontSize="small" />}
            </IconButton>
          )}
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderOpen sx={{ fontSize: 18, color: conv.type === 'CADRE' ? colors.primary[600] : colors.neutral[400] }} />
            <Box>
              <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.base, color: colors.textPrimary }}>
                {conv.code}
              </Typography>
              <RichTextDisplay html={conv.libelle} variant="inline" sx={{ maxWidth: 300, display: 'block', color: colors.textSecondary }} />
            </Box>
            {hasSous && (
              <Chip
                label={`${conv.sousConventions.length}`}
                size="small"
                sx={{ bgcolor: colors.neutral[100], fontSize: typography.sizes['2xs'], fontWeight: typography.weights.bold, height: 20, minWidth: 20 }}
              />
            )}
          </Box>
        </TableCell>

        {isVisible('type') && (
          <TableCell>
            <Chip
              label={conv.type || '-'}
              size="small"
              sx={{
                bgcolor: conv.type === 'CADRE' ? colors.primary[50] : colors.neutral[50],
                color: conv.type === 'CADRE' ? colors.primary[700] : colors.neutral[600],
                fontWeight: typography.weights.medium,
                fontSize: typography.sizes.xs,
                height: 22,
              }}
            />
          </TableCell>
        )}
        {isVisible('statut') && <TableCell><StatusBadge status={conv.statut} /></TableCell>}
        {isVisible('budget') && (
          <TableCell align="right">
            <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.base, fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(conv.budget)} MAD
            </Typography>
          </TableCell>
        )}
        {isVisible('commission') && (
          <TableCell align="center">
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>{conv.tauxCommission}%</Typography>
          </TableCell>
        )}
        {isVisible('dateDebut') && (
          <TableCell>
            <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>{formatDate(conv.dateDebut)}</Typography>
          </TableCell>
        )}
        {isVisible('createdBy') && (
          <TableCell>
            <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>{conv.createdByNom || '-'}</Typography>
          </TableCell>
        )}
        <TableCell align="center" sx={{ width: 50 }}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onMenuOpen(e, conv) }} aria-label="Actions sur la convention">
            <MoreVert fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Sous-conventions */}
      {hasSous && (
        <TableRow>
          <TableCell colSpan={20} sx={{ p: 0, border: 0 }}>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Table size="small">
                <TableBody>
                  {conv.sousConventions.map((sc) => (
                    <TableRow
                      key={sc.id}
                      hover
                      onClick={() => onRowClick(sc.id)}
                      sx={{ ...listStyles.dataRow, bgcolor: colors.neutral[25], '&:hover': { bgcolor: colors.primary[25] } }}
                    >
                      {selectable && <TableCell padding="checkbox" sx={{ width: 42 }} />}
                      {onToggleFavorite && <TableCell sx={{ width: 36, px: 0.5 }} />}
                      <TableCell sx={{ width: 40 }} />
                      <TableCell sx={{ pl: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Description sx={{ fontSize: 16, color: colors.neutral[400] }} />
                          <Box>
                            <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.base }}>{sc.code}</Typography>
                            <RichTextDisplay html={sc.libelle} variant="inline" sx={{ color: colors.textSecondary }} />
                          </Box>
                        </Box>
                      </TableCell>
                      {isVisible('type') && (
                        <TableCell>
                          <Chip label="SPECIFIQUE" size="small" sx={{ bgcolor: colors.purple[50], color: colors.purple[700], fontSize: typography.sizes.xs, height: 22 }} />
                        </TableCell>
                      )}
                      {isVisible('statut') && <TableCell><StatusBadge status={sc.statut} /></TableCell>}
                      {isVisible('budget') && (
                        <TableCell align="right">
                          <Typography sx={{ fontSize: typography.sizes.base, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(sc.budget)} MAD</Typography>
                        </TableCell>
                      )}
                      {isVisible('commission') && (
                        <TableCell align="center">
                          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>{sc.tauxCommission}%</Typography>
                        </TableCell>
                      )}
                      {isVisible('dateDebut') && (
                        <TableCell>
                          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>{formatDate(sc.dateDebut)}</Typography>
                        </TableCell>
                      )}
                      {isVisible('createdBy') && <TableCell />}
                      <TableCell align="center" sx={{ width: 50 }}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onMenuOpen(e, sc) }} aria-label="Actions sur la sous-convention">
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default ConventionTableRow
