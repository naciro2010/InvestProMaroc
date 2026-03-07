import { Box, Typography, Chip } from '@mui/material'
import { Calendar, Users, TrendingUp } from 'lucide-react'
import { StatusBadge } from '@/components/core'
import { colors, typography, borders, componentStyles } from '@/lib/designSystem'

// ==================== TYPES ====================

interface KanbanConvention {
  id: number
  code: string
  libelle: string
  numero: string
  type?: string
  statut: string
  budget: number
  tauxCommission: number
  dateDebut?: string
  dateFin?: string
  createdByNom?: string
  sousConventionsCount?: number
}

interface ConventionKanbanViewProps {
  data: KanbanConvention[]
  onCardClick: (id: number) => void
}

// ==================== HELPERS ====================

const KANBAN_COLUMNS: Array<{ statut: string; label: string; color: string; bgColor: string }> = [
  { statut: 'BROUILLON', label: 'Brouillon', color: colors.neutral[600], bgColor: colors.neutral[50] },
  { statut: 'SOUMIS', label: 'Soumis', color: colors.warning[700], bgColor: colors.warning[25] },
  { statut: 'VALIDEE', label: 'Validee', color: colors.success[700], bgColor: colors.success[25] },
  { statut: 'EN_EXECUTION', label: 'En execution', color: colors.info[700], bgColor: colors.info[25] },
  { statut: 'ACHEVE', label: 'Acheve', color: colors.purple[700], bgColor: colors.purple[25] },
]

const normalizeStatut = (statut: string): string => {
  const aliases: Record<string, string> = { VALIDE: 'VALIDEE', EN_COURS: 'EN_EXECUTION' }
  return aliases[statut] || statut
}

const formatCurrency = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`
  return amount.toLocaleString('fr-FR')
}

// ==================== KANBAN CARD ====================

interface KanbanCardProps {
  convention: KanbanConvention
  onClick: () => void
}

const KanbanCard = ({ convention, onClick }: KanbanCardProps) => (
  <Box
    onClick={onClick}
    sx={{
      ...componentStyles.cardInteractive,
      p: 1.5,
      cursor: 'pointer',
      bgcolor: colors.surface,
      borderRadius: borders.radius.md,
      border: `1px solid ${colors.border}`,
      '&:hover': {
        borderColor: colors.primary[200],
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transform: 'translateY(-1px)',
      },
      transition: 'all 0.15s ease',
    }}
  >
    {/* Header: Code + Type */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
      <Typography sx={{
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
        color: colors.primary[600],
      }}>
        {convention.code}
      </Typography>
      <StatusBadge status={convention.type || 'CADRE'} size="small" />
    </Box>

    {/* Title */}
    <Typography sx={{
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.textPrimary,
      lineHeight: 1.4,
      mb: 1,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    }}>
      {convention.libelle || convention.numero}
    </Typography>

    {/* Budget */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
      <TrendingUp size={12} style={{ color: colors.textSecondary }} />
      <Typography sx={{
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
      }}>
        {formatCurrency(convention.budget)} MAD
      </Typography>
      {convention.tauxCommission > 0 && (
        <Chip
          label={`${convention.tauxCommission}%`}
          size="small"
          sx={{
            height: 18, fontSize: '10px',
            bgcolor: colors.purple[50], color: colors.purple[700],
            fontWeight: typography.weights.semibold,
          }}
        />
      )}
    </Box>

    {/* Footer: Date + Creator */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {convention.dateDebut && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Calendar size={11} style={{ color: colors.neutral[400] }} />
          <Typography sx={{ fontSize: '11px', color: colors.neutral[400] }}>
            {new Date(convention.dateDebut).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
          </Typography>
        </Box>
      )}
      {convention.createdByNom && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Users size={11} style={{ color: colors.neutral[400] }} />
          <Typography sx={{ fontSize: '11px', color: colors.neutral[400] }}>
            {convention.createdByNom}
          </Typography>
        </Box>
      )}
    </Box>
  </Box>
)

// ==================== MAIN COMPONENT ====================

const ConventionKanbanView = ({ data, onCardClick }: ConventionKanbanViewProps) => {
  const columnData = KANBAN_COLUMNS.map((col) => ({
    ...col,
    items: data.filter((c) => normalizeStatut(c.statut) === col.statut),
  }))

  const totalBudgetByColumn = columnData.map((col) =>
    col.items.reduce((sum, c) => sum + (c.budget || 0), 0)
  )

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(${KANBAN_COLUMNS.length}, minmax(220px, 1fr))`,
      gap: 2,
      overflowX: 'auto',
      pb: 1,
    }}>
      {columnData.map((col, colIdx) => (
        <Box key={col.statut} sx={{
          bgcolor: col.bgColor,
          borderRadius: borders.radius.lg,
          p: 1.5,
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Column header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.semibold,
                color: col.color,
              }}>
                {col.label}
              </Typography>
              <Typography sx={{
                fontSize: typography.sizes.xs,
                bgcolor: `${col.color}20`,
                color: col.color,
                borderRadius: borders.radius.full,
                px: 0.75, py: 0.125,
                minWidth: 20, textAlign: 'center',
                fontWeight: typography.weights.semibold,
              }}>
                {col.items.length}
              </Typography>
            </Box>
            {totalBudgetByColumn[colIdx] > 0 && (
              <Typography sx={{
                fontSize: '10px',
                color: colors.neutral[500],
                fontWeight: typography.weights.medium,
              }}>
                {formatCurrency(totalBudgetByColumn[colIdx])}
              </Typography>
            )}
          </Box>

          {/* Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            {col.items.length === 0 ? (
              <Typography sx={{
                fontSize: typography.sizes.xs,
                color: colors.neutral[400],
                textAlign: 'center',
                py: 3,
                fontStyle: 'italic',
              }}>
                Aucune convention
              </Typography>
            ) : (
              col.items.map((conv) => (
                <KanbanCard
                  key={conv.id}
                  convention={conv}
                  onClick={() => onCardClick(conv.id)}
                />
              ))
            )}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default ConventionKanbanView
export type { KanbanConvention }
