import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material'
import { People } from '@mui/icons-material'
import { conventionsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'

interface ParentPartenaireData {
  id: number
  partenaireId: number
  partenaireCode: string
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
}

interface ParentConventionPartenairesProps {
  parentConventionId: number
}

const formatCurrencyShort = (amount: number): string => {
  const millions = amount / 1_000_000
  if (millions >= 1) return `${millions.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M DH`
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)
}

/**
 * ParentConventionPartenaires - Displays parent convention's partenaires list.
 * Micro-component split from ParentConventionBanner.
 */
const ParentConventionPartenaires = ({ parentConventionId }: ParentConventionPartenairesProps) => {
  const [partenaires, setPartenaires] = useState<ParentPartenaireData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const response = await conventionsAPI.getPartenaires(parentConventionId)
        const data = response.data.data || response.data || []
        setPartenaires(Array.isArray(data) ? data : [])
      } catch {
        setPartenaires([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [parentConventionId])

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={20} /></Box>
  }

  if (partenaires.length === 0) return null

  const totalBudget = partenaires.reduce((sum, p) => sum + p.budgetAlloue, 0)

  return (
    <Box sx={{ px: 2.5, py: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <People sx={{ fontSize: 16, color: colors.primary[600] }} />
        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
          Partenaires de la convention principale
        </Typography>
        <Chip label={partenaires.length} size="small"
          sx={{ height: 20, fontSize: typography.sizes.xs, bgcolor: colors.primary[100], color: colors.primary[700], fontWeight: typography.weights.semibold }} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {partenaires.map(p => (
          <Box key={p.id} sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            p: 1, bgcolor: colors.neutral[25], borderRadius: '6px', border: `1px solid ${colors.neutral[200]}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 24, height: 24, borderRadius: '4px', bgcolor: colors.primary[50], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '10px', fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                  {(p.partenaireSigle || p.partenaireCode).substring(0, 2)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textPrimary }}>
                  {p.partenaireSigle || p.partenaireCode}
                </Typography>
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{p.partenaireNom}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, ml: 0.5 }}>
                {p.estMaitreOeuvre && <Chip label="MO" size="small" sx={{ height: 18, fontSize: '10px', bgcolor: colors.info[100], color: colors.info[700] }} />}
                {p.estMaitreOeuvreDelegue && <Chip label="MOD" size="small" sx={{ height: 18, fontSize: '10px', bgcolor: colors.purple[100], color: colors.purple[700] }} />}
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
                {formatCurrencyShort(p.budgetAlloue)}
              </Typography>
              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{p.pourcentage.toFixed(1)}%</Typography>
            </Box>
          </Box>
        ))}
        {partenaires.length > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, py: 0.75, bgcolor: colors.primary[25], borderRadius: '4px', border: `1px solid ${colors.primary[100]}` }}>
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.textPrimary }}>Total</Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.primary[700] }}>{formatCurrencyShort(totalBudget)}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ParentConventionPartenaires
