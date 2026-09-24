import { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { KanbanBoard, type KanbanColumn } from '@/components/core'
import { colors, typography, tones, toneOf, getStatusConfig } from '@/lib/designSystem'
import { formatMillions, formatRate } from '@/lib/utils'

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
  /** Colonnes à afficher (statuts de la section courante) */
  statuses?: string[]
  onCardClick: (id: number) => void
  onStatusChange?: (conventionId: number, newStatus: string) => void
}

// ==================== HELPERS ====================

const DEFAULT_STATUSES = ['BROUILLON', 'SOUMIS', 'VALIDEE', 'EN_EXECUTION', 'ACHEVE']

const TYPE_LABELS: Record<string, string> = { CADRE: 'Cadre', SPECIFIQUE: 'Spécifique', NON_CADRE: 'Non cadre', AVENANT: 'Avenant' }

const normalizeStatut = (statut: string): string => {
  const aliases: Record<string, string> = { VALIDE: 'VALIDEE', EN_COURS: 'EN_EXECUTION' }
  return aliases[statut] || statut
}

// ==================== KANBAN CARD RENDER ====================

const renderConventionCard = (convention: KanbanConvention, onClick: (id: number) => void) => (
  <Box onClick={() => onClick(convention.id)} sx={{ cursor: 'pointer' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
      <Typography sx={{ fontSize: '12.5px', fontWeight: typography.weights.bold, color: colors.textPrimary }}>
        {convention.code}
      </Typography>
      <Typography sx={{ fontSize: '11.5px', color: colors.textTertiary }}>
        {TYPE_LABELS[convention.type ?? ''] ?? convention.type ?? ''}
      </Typography>
    </Box>
    <Typography sx={{
      fontSize: '13px', color: colors.textSecondary, lineHeight: 1.4, mb: 1,
      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
    }}>
      {convention.libelle || convention.numero}
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
      <Typography sx={{ fontSize: '14px', fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
        {formatMillions(convention.budget)} MAD
      </Typography>
      {convention.tauxCommission > 0 && (
        <Typography sx={{ fontSize: '12px', color: colors.textTertiary }}>{formatRate(convention.tauxCommission)}</Typography>
      )}
    </Box>
    {convention.createdByNom && (
      <Typography sx={{ fontSize: '11.5px', color: colors.textTertiary, mt: 0.5 }}>{convention.createdByNom}</Typography>
    )}
  </Box>
)

// ==================== MAIN COMPONENT ====================

const ConventionKanbanView = ({ data, statuses = DEFAULT_STATUSES, onCardClick, onStatusChange }: ConventionKanbanViewProps) => {
  const columns: KanbanColumn<KanbanConvention>[] = useMemo(() =>
    statuses.map(statut => {
      const cfg = getStatusConfig(statut)
      return {
        id: statut,
        title: cfg.label,
        color: statut === 'EN_EXECUTION' ? colors.brass.main : tones[toneOf(cfg.color)].fg,
        items: data.filter(c => normalizeStatut(c.statut) === statut),
      }
    }), [data, statuses])

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
