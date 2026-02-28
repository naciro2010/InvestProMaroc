import { useState, useEffect } from 'react'
import { Box, Typography, Skeleton } from '@mui/material'
import { projetsAPI } from '@/lib/projetsAPI'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { Projet, formatCurrency } from './projetDetailTypes'

interface ProjetBudgetSectionProps {
  projetId: number
}

const ProjetBudgetSection = ({ projetId }: ProjetBudgetSectionProps) => {
  const [projet, setProjet] = useState<Projet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBudgetData = async () => {
      try {
        setLoading(true)
        const response = await projetsAPI.getById(projetId)
        setProjet(response.data as Projet)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur chargement budget'
        console.error(message)
      } finally {
        setLoading(false)
      }
    }
    loadBudgetData()
  }, [projetId])

  if (loading) {
    return <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '8px' }} />
  }

  if (!projet) return null

  const budgetRestant = projet.budgetTotal - (projet.budgetConsomme || 0)
  const pourcentageConsomme = projet.budgetTotal > 0 ? (projet.budgetConsomme / projet.budgetTotal) * 100 : 0

  return (
    <Box sx={{ ...componentStyles.card, p: 2.5 }}>
      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 2 }}>
        Budget
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        <Box>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Budget Total</Typography>
          <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.primary[600] }}>
            {formatCurrency(projet.budgetTotal)}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Budget Consomme ({pourcentageConsomme.toFixed(1)}%)
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.warning[600] }}>
            {formatCurrency(projet.budgetConsomme)}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Budget Restant</Typography>
          <Typography sx={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            color: budgetRestant >= 0 ? colors.success[600] : colors.danger[600],
          }}>
            {formatCurrency(budgetRestant)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ProjetBudgetSection
