import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Divider,
  Skeleton,
} from '@mui/material'
import { projetsAPI } from '../../../lib/projetsAPI'
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
    return <Skeleton variant="rectangular" height={120} sx={{ gridColumn: { xs: '1', md: 'span 2' } }} />
  }

  if (!projet) return null

  return (
    <Paper sx={{ p: 3, bgcolor: '#f9fafb', gridColumn: { xs: '1', md: 'span 2' } }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Budget
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">Budget Total</Typography>
          <Typography variant="h6" color="primary.main" fontWeight={600}>
            {formatCurrency(projet.budgetTotal)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Budget Consomme</Typography>
          <Typography variant="h6" color="warning.main" fontWeight={600}>
            {formatCurrency(projet.budgetConsomme)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Budget Restant</Typography>
          <Typography variant="h6" color="success.main" fontWeight={600}>
            {formatCurrency(projet.budgetTotal - (projet.budgetConsomme || 0))}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default ProjetBudgetSection
