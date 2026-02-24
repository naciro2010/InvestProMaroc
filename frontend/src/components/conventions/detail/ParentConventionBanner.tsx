import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Tooltip,
} from '@mui/material'
import { ArrowUpward, OpenInNew, TrendingUp, Percent, AccountBalance } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { conventionsAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import ParentConventionPartenaires from './ParentConventionPartenaires'

interface ParentConventionData {
  id: number
  code: string
  numero: string
  libelle: string
  typeConvention: string
  statut: string
  budget: number
  tauxCommission: number
  baseCalcul: string
  tauxTva: number
}

interface ParentConventionBannerProps {
  parentConventionId: number
  parentConventionNumero: string
  heriteParametres: boolean
}

const formatCurrencyShort = (amount: number): string => {
  const millions = amount / 1_000_000
  if (millions >= 1) return `${millions.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M DH`
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)
}

/**
 * ParentConventionBanner - Shows parent convention info on sous-convention detail.
 * Micro-component: loads parent data via GET /conventions/{parentId} endpoints.
 * Split from original 519-line version into banner + partenaires list.
 */
const ParentConventionBanner = ({
  parentConventionId,
  parentConventionNumero,
  heriteParametres,
}: ParentConventionBannerProps) => {
  const navigate = useNavigate()
  const [parentData, setParentData] = useState<ParentConventionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [basicRes, financesRes] = await Promise.all([
          conventionsAPI.getBasic(parentConventionId),
          conventionsAPI.getFinances(parentConventionId),
        ])
        const basic = basicRes.data.data || basicRes.data
        const finances = financesRes.data.data || financesRes.data
        setParentData({
          id: basic.id, code: basic.code, numero: basic.numero, libelle: basic.libelle,
          typeConvention: basic.typeConvention, statut: basic.statut,
          budget: finances.budget, tauxCommission: finances.tauxCommission,
          baseCalcul: finances.baseCalcul, tauxTva: finances.tauxTva,
        })
      } catch {
        setParentData(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [parentConventionId])

  if (loading) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 2, border: `1px solid ${colors.primary[200]}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={20} />
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.primary[600], fontWeight: typography.weights.medium }}>
            Chargement de la convention principale ({parentConventionNumero})...
          </Typography>
        </Box>
      </Paper>
    )
  }

  if (!parentData) return null

  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden', border: `1px solid ${colors.primary[200]}` }}>
      {/* Accent bar */}
      <Box sx={{ height: 3, bgcolor: colors.primary[500] }} />

      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1.5, bgcolor: colors.primary[25], borderBottom: `1px solid ${colors.primary[100]}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: colors.primary[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpward sx={{ color: colors.primary[600], fontSize: 16 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.primary[600], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Convention Principale
            </Typography>
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textPrimary }}>
              {parentData.numero} - {parentData.libelle}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Voir la convention principale">
          <Chip label="Voir" size="small" icon={<OpenInNew sx={{ fontSize: 14 }} />}
            onClick={() => navigate(`/conventions/${parentConventionId}`)}
            sx={{ bgcolor: colors.primary[50], color: colors.primary[700], fontWeight: typography.weights.medium, fontSize: typography.sizes.xs, cursor: 'pointer', border: `1px solid ${colors.primary[200]}`, '&:hover': { bgcolor: colors.primary[100] } }} />
        </Tooltip>
      </Box>

      {/* Financial KPIs */}
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
          <KpiCard icon={<AccountBalance sx={{ fontSize: 14, color: colors.success[600] }} />}
            label="Budget Total" value={formatCurrencyShort(parentData.budget)}
            color={colors.success[700]} bgColor={colors.success[25]} borderColor={colors.success[100]} />
          <KpiCard icon={<TrendingUp sx={{ fontSize: 14, color: heriteParametres ? colors.info[600] : colors.neutral[500] }} />}
            label="Taux Commission" value={`${parentData.tauxCommission}%`}
            color={heriteParametres ? colors.info[700] : colors.textPrimary}
            bgColor={heriteParametres ? colors.info[25] : colors.neutral[25]}
            borderColor={heriteParametres ? colors.info[100] : colors.neutral[200]}
            tag={heriteParametres ? 'Herite' : undefined} />
          <KpiCard icon={<AccountBalance sx={{ fontSize: 14, color: heriteParametres ? colors.info[600] : colors.neutral[500] }} />}
            label="Base de Calcul"
            value={parentData.baseCalcul === 'DECAISSEMENTS_TTC' ? 'Dec. TTC' : 'Dec. HT'}
            color={heriteParametres ? colors.info[700] : colors.textPrimary}
            bgColor={heriteParametres ? colors.info[25] : colors.neutral[25]}
            borderColor={heriteParametres ? colors.info[100] : colors.neutral[200]}
            tag={heriteParametres ? 'Herite' : undefined} />
          <KpiCard icon={<Percent sx={{ fontSize: 14, color: heriteParametres ? colors.info[600] : colors.neutral[500] }} />}
            label="Taux TVA" value={`${parentData.tauxTva}%`}
            color={heriteParametres ? colors.info[700] : colors.textPrimary}
            bgColor={heriteParametres ? colors.info[25] : colors.neutral[25]}
            borderColor={heriteParametres ? colors.info[100] : colors.neutral[200]}
            tag={heriteParametres ? 'Herite' : undefined} />
        </Box>
      </Box>

      {/* Partenaires */}
      <Divider sx={{ borderColor: colors.primary[100] }} />
      <ParentConventionPartenaires parentConventionId={parentConventionId} />
    </Paper>
  )
}

/** Compact KPI card */
function KpiCard({ icon, label, value, color, bgColor, borderColor, tag }: {
  icon: React.ReactNode; label: string; value: string; color: string
  bgColor: string; borderColor: string; tag?: string
}) {
  return (
    <Box sx={{ p: 1.5, bgcolor: bgColor, borderRadius: '6px', border: `1px solid ${borderColor}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
        {icon}
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.medium }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color }}>{value}</Typography>
      {tag && (
        <Typography sx={{ fontSize: '10px', color: colors.primary[500], fontWeight: typography.weights.medium, fontStyle: 'italic', mt: 0.25, display: 'flex', alignItems: 'center', gap: 0.25 }}>
          <ArrowUpward sx={{ fontSize: 10 }} />{tag}
        </Typography>
      )}
    </Box>
  )
}

export default ParentConventionBanner
