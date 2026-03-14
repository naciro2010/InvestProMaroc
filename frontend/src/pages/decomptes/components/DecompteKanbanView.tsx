import { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { KanbanBoard } from '@/components/core'
import type { KanbanColumn } from '@/components/core'
import { colors, typography, borders } from '@/lib/designSystem'
import type { Decompte } from './types'

const KANBAN_COLUMNS: { id: string; title: string; color: string }[] = [
  { id: 'EN_ATTENTE', title: 'En Attente', color: colors.warning[500] },
  { id: 'VALIDE', title: 'Validé', color: colors.success[500] },
  { id: 'REJETE', title: 'Rejeté', color: colors.danger[500] },
  { id: 'PAYE', title: 'Payé', color: colors.info[500] },
]

interface DecompteKanbanViewProps {
  decomptes: Decompte[]
  onCardMove: (itemId: string, fromCol: string, toCol: string) => void
  formatCurrency: (amount: number) => string
}

const DecompteKanbanCard = ({ decompte, formatCurrency }: { decompte: Decompte; formatCurrency: (amount: number) => string }) => (
  <Box>
    <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.primary[700], mb: 0.5 }}>
      {decompte.numero}
    </Typography>
    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, mb: 0.75 }}>
      {new Date(decompte.dateDecompte).toLocaleDateString('fr-FR')}
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
        Montant
      </Typography>
      <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.medium }}>
        {formatCurrency(decompte.montant)}
      </Typography>
    </Box>
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mt: 0.5,
      pt: 0.5,
      borderTop: `1px solid ${colors.borderSubtle}`,
    }}>
      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
        Net à payer
      </Typography>
      <Typography sx={{
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        color: colors.primary[700],
        bgcolor: colors.primary[50],
        px: 1,
        py: 0.25,
        borderRadius: borders.radius.sm,
      }}>
        {formatCurrency(decompte.netAPayer)}
      </Typography>
    </Box>
  </Box>
)

const DecompteKanbanView = ({ decomptes, onCardMove, formatCurrency }: DecompteKanbanViewProps) => {
  const columns: KanbanColumn<Decompte>[] = useMemo(() => {
    return KANBAN_COLUMNS.map((col) => ({
      id: col.id,
      title: col.title,
      color: col.color,
      items: decomptes.filter((d) => d.statut === col.id),
    }))
  }, [decomptes])

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
      <KanbanBoard<Decompte>
        columns={columns}
        getItemId={(item) => String(item.id)}
        renderCard={(item) => <DecompteKanbanCard decompte={item} formatCurrency={formatCurrency} />}
        onCardMove={onCardMove}
        emptyMessage="Aucun décompte"
      />
    </Box>
  )
}

export default DecompteKanbanView
