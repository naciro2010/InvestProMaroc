import { useNavigate } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import {
  FileText, ShoppingCart, Building2, Wallet,
  Plus,
} from 'lucide-react'
import { colors, typography, borders, transitions } from '@/lib/designSystem'

interface QuickAction {
  label: string
  description: string
  icon: React.ReactElement
  path: string
  color: string
  bgColor: string
}

const quickActions: QuickAction[] = [
  {
    label: 'Nouvelle Convention',
    description: 'Creer une convention cadre ou specifique',
    icon: <FileText size={20} />,
    path: '/conventions/nouvelle',
    color: colors.primary[600],
    bgColor: colors.primary[50],
  },
  {
    label: 'Nouveau Marche',
    description: 'Ajouter un marche de travaux ou services',
    icon: <ShoppingCart size={20} />,
    path: '/marches/nouveau',
    color: colors.info[600],
    bgColor: colors.info[50],
  },
  {
    label: 'Nouveau Projet',
    description: 'Creer un programme d\'investissement',
    icon: <Building2 size={20} />,
    path: '/projets/nouveau',
    color: colors.success[600],
    bgColor: colors.success[50],
  },
  {
    label: 'Nouveau Budget',
    description: 'Definir un budget previsionnel',
    icon: <Wallet size={20} />,
    path: '/budgets/nouveau',
    color: colors.purple[600],
    bgColor: colors.purple[50],
  },
]

const DashboardQuickActions = () => {
  const navigate = useNavigate()

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        mb: 1.5,
      }}>
        <Typography sx={{
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.semibold,
          color: colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Actions rapides
        </Typography>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 1.5,
      }}>
        {quickActions.map(action => (
          <Box
            key={action.path}
            component="button"
            onClick={() => navigate(action.path)}
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              gap: 1, padding: '14px 16px',
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: borders.radius.lg,
              cursor: 'pointer', textAlign: 'left',
              transition: `all ${transitions.normal}`,
              '&:hover': {
                borderColor: action.color,
                backgroundColor: action.bgColor,
              },
            }}
          >
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              width: '100%',
            }}>
              <Box sx={{
                width: 32, height: 32,
                borderRadius: borders.radius.md,
                backgroundColor: action.bgColor,
                color: action.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {action.icon}
              </Box>
              <Plus size={14} style={{ color: colors.neutral[300], marginLeft: 'auto' }} />
            </Box>
            <Box>
              <Typography sx={{
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.semibold,
                color: colors.textPrimary,
                lineHeight: 1.3,
              }}>
                {action.label}
              </Typography>
              <Typography sx={{
                fontSize: typography.sizes.xs,
                color: colors.textSecondary,
                lineHeight: 1.3,
                mt: 0.25,
                display: { xs: 'none', sm: 'block' },
              }}>
                {action.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default DashboardQuickActions
