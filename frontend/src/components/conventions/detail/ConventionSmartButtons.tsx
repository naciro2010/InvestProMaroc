import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { FileText, Briefcase, GitBranch, History, Users } from 'lucide-react'
import { colors, typography, borders, transitions } from '@/lib/designSystem'

interface ConventionSmartButtonsProps {
  conventionId: number
  typeConvention: 'CADRE' | 'SPECIFIQUE'
  nombreMarches: number
  nombreProjets: number
  nombreSousConventions: number
  nombreAvenants: number
  nombrePartenaires: number
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

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

interface SmartButtonProps {
  icon: React.ReactNode; value: string; label: string
  color: string; mutedColor: string; isZero: boolean; onClick: () => void
}

const SmartButton = ({ icon, value, label, color, mutedColor, isZero, onClick }: SmartButtonProps) => {
  const activeColor = isZero ? mutedColor : color
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        px: 2, py: 1.5, minWidth: 90, flex: '1 1 0', cursor: 'pointer',
        borderRadius: borders.radius.md,
        border: `1px solid ${isZero ? colors.neutral[200] : `${color}25`}`,
        backgroundColor: isZero ? colors.neutral[25] : `${color}06`,
        transition: `all ${transitions.normal}`, opacity: isZero ? 0.7 : 1,
        '&:hover': { backgroundColor: isZero ? colors.neutral[50] : `${color}12`, borderColor: isZero ? colors.neutral[300] : `${color}40` },
      }}
    >
      <Box sx={{ color: activeColor, mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isZero ? 0.5 : 0.7 }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: activeColor, lineHeight: typography.lineHeights.tight }}>
        {value}
      </Typography>
      <Typography sx={{
        fontSize: typography.sizes['2xs'], fontWeight: typography.weights.medium,
        color: isZero ? colors.textDisabled : colors.textSecondary,
        lineHeight: typography.lineHeights.tight, mt: 0.25, textAlign: 'center',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
      }}>
        {label}
      </Typography>
    </Box>
  )
}

/**
 * SmartButtons: compact entity counts (Odoo-style).
 * Financial metrics (commission, montant, realisation) removed — now in FinancialFlowCard.
 */
const ConventionSmartButtons = ({
  conventionId, typeConvention, nombreMarches, nombreProjets,
  nombreSousConventions, nombreAvenants, nombrePartenaires,
}: ConventionSmartButtonsProps) => {
  const navigate = useNavigate()
  const iconSize = 18

  const buttons: SmartButtonConfig[] = [
    {
      key: 'marches', icon: <FileText size={iconSize} />,
      value: formatCount(nombreMarches), rawValue: nombreMarches, label: 'Marches',
      color: colors.primary[600], mutedColor: colors.neutral[400],
      onClick: () => navigate(`/marches?conventionId=${conventionId}`), visible: true,
    },
    {
      key: 'projets', icon: <Briefcase size={iconSize} />,
      value: formatCount(nombreProjets), rawValue: nombreProjets, label: 'Projets',
      color: colors.purple[600], mutedColor: colors.neutral[400],
      onClick: () => navigate(`/projets?conventionId=${conventionId}`), visible: true,
    },
    {
      key: 'sousConventions', icon: <GitBranch size={iconSize} />,
      value: formatCount(nombreSousConventions), rawValue: nombreSousConventions, label: 'S-Conv.',
      color: colors.info[600], mutedColor: colors.neutral[400],
      onClick: () => navigate(`/conventions?parentId=${conventionId}`), visible: typeConvention === 'CADRE',
    },
    {
      key: 'avenants', icon: <History size={iconSize} />,
      value: formatCount(nombreAvenants), rawValue: nombreAvenants, label: 'Avenants',
      color: colors.warning[600], mutedColor: colors.neutral[400],
      onClick: () => navigate(`/conventions/${conventionId}?tab=avenants`), visible: true,
    },
    {
      key: 'partenaires', icon: <Users size={iconSize} />,
      value: formatCount(nombrePartenaires), rawValue: nombrePartenaires, label: 'Partenaires',
      color: colors.success[600], mutedColor: colors.neutral[400],
      onClick: () => navigate(`/conventions/${conventionId}?tab=partenaires`), visible: true,
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 1 }}>
      {buttons.filter(b => b.visible).map(b => (
        <SmartButton key={b.key} icon={b.icon} value={b.value} label={b.label}
          color={b.color} mutedColor={b.mutedColor} isZero={b.rawValue === 0} onClick={b.onClick} />
      ))}
    </Box>
  )
}

export default ConventionSmartButtons
