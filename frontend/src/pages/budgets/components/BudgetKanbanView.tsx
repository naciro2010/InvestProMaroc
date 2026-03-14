import { Box, Typography } from '@mui/material'
import { KanbanBoard, StatusBadge } from '@/components/core'
import type { KanbanColumn } from '@/components/core'
import type { Budget, StatutBudget } from '@/types/entities'
import { colors, typography } from '@/lib/designSystem'

interface BudgetKanbanViewProps {
  budgets: Budget[]
  onCardMove: (itemId: string, fromCol: string, toCol: string) => void
  formatCurrency: (amount: number) => string
  onBudgetClick: (id: number) => void
}

const STATUT_COLORS: Record<StatutBudget, string> = {
  BROUILLON: colors.neutral[400],
  SOUMIS: colors.warning[500],
  VALIDE: colors.success[500],
  REJETE: colors.danger[500],
  ARCHIVE: colors.info[500],
}

const STATUT_LABELS: Record<StatutBudget, string> = {
  BROUILLON: 'Brouillon',
  SOUMIS: 'Soumis',
  VALIDE: 'Valide',
  REJETE: 'Rejete',
  ARCHIVE: 'Archive',
}

const BudgetKanbanView = ({ budgets, onCardMove, formatCurrency, onBudgetClick }: BudgetKanbanViewProps) => {
  const statuts: StatutBudget[] = ['BROUILLON', 'SOUMIS', 'VALIDE', 'REJETE', 'ARCHIVE']

  const columns: KanbanColumn<Budget>[] = statuts.map(statut => ({
    id: statut,
    title: STATUT_LABELS[statut],
    color: STATUT_COLORS[statut],
    items: budgets.filter(b => b.statut === statut),
  }))

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
      <KanbanBoard<Budget>
        columns={columns}
        getItemId={(b) => String(b.id)}
        onCardMove={onCardMove}
        emptyMessage="Aucun budget"
        renderCard={(budget) => (
          <Box onClick={() => onBudgetClick(budget.id)} sx={{ cursor: 'pointer' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
                {budget.version}
              </Typography>
              <StatusBadge status={budget.statut} size="small" />
            </Box>
            {budget.convention && (
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.primary[600], mb: 0.5 }}>
                {budget.convention.code || budget.convention.libelle}
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                Total:
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
                {formatCurrency(budget.totalBudget)}
              </Typography>
            </Box>
            {budget.deltaMontant !== undefined && budget.deltaMontant !== 0 && (
              <Typography sx={{
                fontSize: typography.sizes.xs,
                color: budget.deltaMontant > 0 ? colors.success[600] : colors.danger[600],
                textAlign: 'right',
                mt: 0.25,
              }}>
                {budget.deltaMontant > 0 ? '+' : ''}{formatCurrency(budget.deltaMontant)}
              </Typography>
            )}
          </Box>
        )}
      />
    </Box>
  )
}

export default BudgetKanbanView
