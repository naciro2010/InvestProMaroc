import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Briefcase,
  GitBranch,
  History,
  Users,
  Calculator,
  TrendingUp,
  Banknote,
} from 'lucide-react'
import { colors, typography, borders, transitions } from '@/lib/designSystem'

// ---------- Types ----------

interface ConventionSmartButtonsProps {
  conventionId: number
  typeConvention: 'CADRE' | 'SPECIFIQUE'
  nombreMarches: number
  nombreProjets: number
  nombreSousConventions: number
  nombreAvenants: number
  nombrePartenaires: number
  commissionEstimee: number
  montantTotalMarches: number
  tauxRealisation: number
}

interface SmartButtonConfig {
  key: string
  icon: React.ReactNode
  value: string
  rawValue: number
  label: string
  color: string
  mutedColor: string
  onClick: () => void
  visible: boolean
}

// ---------- Helpers ----------

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(amount)

const formatPercentage = (value: number): string =>
  `${value.toFixed(1)}%`

// ---------- SmartButton Sub-component ----------

interface SmartButtonProps {
  icon: React.ReactNode
  value: string
  label: string
  color: string
  mutedColor: string
  isZero: boolean
  onClick: () => void
}

const SmartButton = ({
  icon,
  value,
  label,
  color,
  mutedColor,
  isZero,
  onClick,
}: SmartButtonProps) => {
  const activeColor = isZero ? mutedColor : color

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 1.5,
        minWidth: 100,
        flex: '1 1 0',
        cursor: 'pointer',
        borderRadius: borders.radius.md,
        border: `1px solid ${isZero ? colors.neutral[200] : `${color}25`}`,
        backgroundColor: isZero ? colors.neutral[25] : `${color}06`,
        transition: `all ${transitions.normal}`,
        opacity: isZero ? 0.7 : 1,
        '&:hover': {
          backgroundColor: isZero ? colors.neutral[50] : `${color}12`,
          borderColor: isZero ? colors.neutral[300] : `${color}40`,
        },
      }}
    >
      <Box
        sx={{
          color: activeColor,
          mb: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isZero ? 0.5 : 0.7,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: typography.sizes.xl,
          fontWeight: typography.weights.bold,
          color: activeColor,
          lineHeight: typography.lineHeights.tight,
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: typography.sizes['2xs'],
          fontWeight: typography.weights.medium,
          color: isZero ? colors.textDisabled : colors.textSecondary,
          lineHeight: typography.lineHeights.tight,
          mt: 0.25,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

// ---------- Main Component ----------

const ConventionSmartButtons = ({
  conventionId,
  typeConvention,
  nombreMarches,
  nombreProjets,
  nombreSousConventions,
  nombreAvenants,
  nombrePartenaires,
  commissionEstimee,
  montantTotalMarches,
  tauxRealisation,
}: ConventionSmartButtonsProps) => {
  const navigate = useNavigate()
  const iconSize = 18

  const buttons: SmartButtonConfig[] = [
    {
      key: 'marches',
      icon: <FileText size={iconSize} />,
      value: formatCount(nombreMarches),
      rawValue: nombreMarches,
      label: 'Marches',
      color: colors.primary[600],
      mutedColor: colors.neutral[400],
      onClick: () => navigate(`/marches?conventionId=${conventionId}`),
      visible: true,
    },
    {
      key: 'projets',
      icon: <Briefcase size={iconSize} />,
      value: formatCount(nombreProjets),
      rawValue: nombreProjets,
      label: 'Projets',
      color: colors.purple[600],
      mutedColor: colors.neutral[400],
      onClick: () => navigate(`/projets?conventionId=${conventionId}`),
      visible: true,
    },
    {
      key: 'sousConventions',
      icon: <GitBranch size={iconSize} />,
      value: formatCount(nombreSousConventions),
      rawValue: nombreSousConventions,
      label: 'S-Conv.',
      color: colors.info[600],
      mutedColor: colors.neutral[400],
      onClick: () =>
        navigate(`/conventions?parentId=${conventionId}`),
      visible: typeConvention === 'CADRE',
    },
    {
      key: 'avenants',
      icon: <History size={iconSize} />,
      value: formatCount(nombreAvenants),
      rawValue: nombreAvenants,
      label: 'Avenants',
      color: colors.warning[600],
      mutedColor: colors.neutral[400],
      onClick: () =>
        navigate(`/conventions/${conventionId}?tab=avenants`),
      visible: true,
    },
    {
      key: 'partenaires',
      icon: <Users size={iconSize} />,
      value: formatCount(nombrePartenaires),
      rawValue: nombrePartenaires,
      label: 'Partenaires',
      color: colors.success[600],
      mutedColor: colors.neutral[400],
      onClick: () =>
        navigate(`/conventions/${conventionId}?tab=partenaires`),
      visible: true,
    },
    {
      key: 'montantMarches',
      icon: <Banknote size={iconSize} />,
      value: formatCurrency(montantTotalMarches),
      rawValue: montantTotalMarches,
      label: 'Montant Marches',
      color: colors.primary[700],
      mutedColor: colors.neutral[400],
      onClick: () => navigate(`/marches?conventionId=${conventionId}`),
      visible: true,
    },
    {
      key: 'commission',
      icon: <Calculator size={iconSize} />,
      value: formatCurrency(commissionEstimee),
      rawValue: commissionEstimee,
      label: 'Commission',
      color: colors.warning[700],
      mutedColor: colors.neutral[400],
      onClick: () =>
        navigate(`/conventions/${conventionId}?tab=finances`),
      visible: true,
    },
    {
      key: 'realisation',
      icon: <TrendingUp size={iconSize} />,
      value: formatPercentage(tauxRealisation),
      rawValue: tauxRealisation,
      label: 'Realisation',
      color: colors.success[600],
      mutedColor: colors.neutral[400],
      onClick: () =>
        navigate(`/conventions/${conventionId}?tab=budget`),
      visible: true,
    },
  ]

  const visibleButtons = buttons.filter((b) => b.visible)

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        py: 1,
      }}
    >
      {visibleButtons.map((button) => {
        const isZero = button.rawValue === 0

        return (
          <SmartButton
            key={button.key}
            icon={button.icon}
            value={button.value}
            label={button.label}
            color={button.color}
            mutedColor={button.mutedColor}
            isZero={isZero}
            onClick={button.onClick}
          />
        )
      })}
    </Box>
  )
}

export default ConventionSmartButtons
