import { Box, Typography } from '@mui/material'
import { Wallet, TrendingUp, Receipt, AlertTriangle } from 'lucide-react'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface ProjetStatsCardsProps {
  budgetTotal: number
  pourcentageAvancement: number
  budgetConsomme: number
  estEnRetard: boolean
  formatCurrency: (amount: number) => string
}

interface StatCardProps {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: string
}

const StatCard = ({ icon, iconBg, iconColor, label, value }: StatCardProps) => (
  <Box sx={{ ...componentStyles.statCard, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{
      p: 1.5,
      borderRadius: '8px',
      bgcolor: iconBg,
      color: iconColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary }}>
        {value}
      </Typography>
    </Box>
  </Box>
)

const ProjetStatsCards = ({
  budgetTotal,
  pourcentageAvancement,
  budgetConsomme,
  estEnRetard,
  formatCurrency,
}: ProjetStatsCardsProps) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
      <StatCard
        icon={<Wallet size={20} />}
        iconBg={colors.primary[50]}
        iconColor={colors.primary[600]}
        label="Budget Total"
        value={formatCurrency(budgetTotal)}
      />
      <StatCard
        icon={<TrendingUp size={20} />}
        iconBg={colors.success[50]}
        iconColor={colors.success[600]}
        label="Avancement"
        value={`${pourcentageAvancement.toFixed(1)}%`}
      />
      <StatCard
        icon={<Receipt size={20} />}
        iconBg={colors.warning[50]}
        iconColor={colors.warning[600]}
        label="Budget Consomme"
        value={formatCurrency(budgetConsomme)}
      />
      <StatCard
        icon={<AlertTriangle size={20} />}
        iconBg={estEnRetard ? colors.danger[50] : colors.info[50]}
        iconColor={estEnRetard ? colors.danger[600] : colors.info[600]}
        label="Statut"
        value={estEnRetard ? 'En retard' : 'Dans les temps'}
      />
    </Box>
  )
}

export default ProjetStatsCards
