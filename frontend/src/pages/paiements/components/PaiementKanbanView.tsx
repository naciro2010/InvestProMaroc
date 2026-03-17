import { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { CreditCard } from 'lucide-react'
import { KanbanBoard, StatusBadge } from '@/components/core'
import type { KanbanColumn } from '@/components/core'
import { colors, typography, borders } from '@/lib/designSystem'
import { Paiement, modeReglementLabels } from './types'

interface PaiementKanbanViewProps {
  paiements: Paiement[]
  onCardMove: (itemId: string, fromColumnId: string, toColumnId: string) => void
  formatCurrency: (amount: number) => string
}

const KANBAN_COLUMNS: { id: string; title: string; color: string }[] = [
  { id: 'EN_ATTENTE', title: 'En Attente', color: colors.warning[500] },
  { id: 'EFFECTUE', title: 'Effectue', color: colors.success[500] },
  { id: 'ANNULE', title: 'Annule', color: colors.danger[500] },
]

const PaiementKanbanView = ({ paiements, onCardMove, formatCurrency }: PaiementKanbanViewProps) => {
  const columns: KanbanColumn<Paiement>[] = useMemo(() => {
    return KANBAN_COLUMNS.map(col => ({
      id: col.id,
      title: col.title,
      color: col.color,
      items: paiements.filter(p => (p.statut || 'EN_ATTENTE') === col.id),
    }))
  }, [paiements])

  const renderCard = (paiement: Paiement) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Header: numero + status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
          {paiement.numeroPaiement}
        </Typography>
        <StatusBadge status={paiement.statut || 'EN_ATTENTE'} size="small" />
      </Box>

      {/* Date */}
      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
        {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
      </Typography>

      {/* Beneficiaire */}
      {paiement.beneficiaire && (
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textPrimary, fontWeight: typography.weights.medium }}>
          {paiement.beneficiaire}
        </Typography>
      )}

      {/* Footer: montant + mode reglement */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.primary[700] }}>
          {formatCurrency(paiement.montant)}
        </Typography>
        <Box sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.25,
          borderRadius: borders.radius.full,
          bgcolor: colors.neutral[100],
          fontSize: typography.sizes['2xs'],
          fontWeight: typography.weights.medium,
          color: colors.textSecondary,
        }}>
          <CreditCard size={10} />
          {modeReglementLabels[paiement.modeReglement] || paiement.modeReglement}
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
      <KanbanBoard<Paiement>
        columns={columns}
        getItemId={(p) => String(p.id)}
        renderCard={renderCard}
        onCardMove={onCardMove}
        emptyMessage="Aucun paiement"
      />
    </Box>
  )
}

export default PaiementKanbanView
