import { useMemo } from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { Calendar, Users, TrendingUp } from 'lucide-react'
import { StatusBadge, KanbanBoard } from '@/components/core'
import type { KanbanColumn } from '@/components/core'
import { colors, typography, borders } from '@/lib/designSystem'

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
  onStatusChange?: (conventionId: number, newStatus: string) => void
}

// ==================== HELPERS ====================

const KANBAN_STATUSES = [
  { statut: 'BROUILLON', label: 'Brouillon', color: colors.neutral[500] },
  { statut: 'SOUMIS', label: 'Soumis', color: colors.warning[600] },
  { statut: 'VALIDEE', label: 'Validee', color: colors.success[600] },
  { statut: 'EN_EXECUTION', label: 'En execution', color: colors.info[600] },
  { statut: 'ACHEVE', label: 'Acheve', color: colors.purple[600] },
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

// ==================== KANBAN CARD RENDER ====================

const renderConventionCard = (convention: KanbanConvention, onClick: (id: number) => void) => (
  <Box onClick={() => onClick(convention.id)} sx={{ cursor: 'pointer' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
      <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.primary[600] }}>
        {convention.code}
      </Typography>
      <StatusBadge status={convention.type || 'CADRE'} size="small" />
    </Box>
    <Typography sx={{
      fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textPrimary,
      lineHeight: 1.4, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
    }}>
      {convention.libelle || convention.numero}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
      <TrendingUp size={12} style={{ color: colors.textSecondary }} />
      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
        {formatCurrency(convention.budget)} MAD
      </Typography>
      {convention.tauxCommission > 0 && (
        <Chip label={`${convention.tauxCommission}%`} size="small"
          sx={{ height: 18, fontSize: '10px', bgcolor: colors.purple[50], color: colors.purple[700], fontWeight: typography.weights.semibold }} />
      )}
    </Box>
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
          <Typography sx={{ fontSize: '11px', color: colors.neutral[400] }}>{convention.createdByNom}</Typography>
        </Box>
      )}
    </Box>
  </Box>
)

// ==================== MAIN COMPONENT ====================

const ConventionKanbanView = ({ data, onCardClick, onStatusChange }: ConventionKanbanViewProps) => {
  const columns: KanbanColumn<KanbanConvention>[] = useMemo(() =>
    KANBAN_STATUSES.map(col => ({
      id: col.statut,
      title: col.label,
      color: col.color,
      items: data.filter(c => normalizeStatut(c.statut) === col.statut),
    })), [data])

  const handleCardMove = (itemId: string, _fromCol: string, toCol: string) => {
    const conventionId = Number(itemId)
    if (!isNaN(conventionId) && onStatusChange) {
      onStatusChange(conventionId, toCol)
    }
  }

  return (
    <KanbanBoard<KanbanConvention>
      columns={columns}
      getItemId={(item) => String(item.id)}
      renderCard={(item) => renderConventionCard(item, onCardClick)}
      onCardMove={handleCardMove}
      emptyMessage="Aucune convention"
    />
  )
}

export default ConventionKanbanView
export type { KanbanConvention }
