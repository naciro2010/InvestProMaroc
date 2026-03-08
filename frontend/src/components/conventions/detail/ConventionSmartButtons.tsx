import { Box, Typography, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { FileText, Briefcase, GitBranch, History, Users, Banknote } from 'lucide-react'
import { colors, typography, borders, transitions } from '@/lib/designSystem'

interface ConventionSmartButtonsProps {
  conventionId: number
  typeConvention: 'CADRE' | 'SPECIFIQUE'
  nombreMarches: number
  nombreProjets: number
  nombreSousConventions: number
  nombreAvenants: number
  nombrePartenaires: number
  montantTotalMarches?: number
  montantTotalProjets?: number
  commissionTTC?: number
  tauxRealisation?: number
}

const fmtShort = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}G`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return n.toString()
}
const fmtMAD = (n: number): string => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)

interface SmartButtonProps {
  icon: React.ReactNode; value: string; label: string; subtitle?: string
  hint?: string; color: string; mutedColor: string; isZero: boolean; onClick: () => void
}

const SmartButton = ({ icon, value, label, subtitle, hint, color, mutedColor, isZero, onClick }: SmartButtonProps) => {
  const activeColor = isZero ? mutedColor : color
  return (
    <Tooltip title={hint || label} placement="top" arrow enterDelay={400}>
      <Box
        onClick={onClick}
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          px: 2, py: 1.25, minWidth: 95, flex: '1 1 0', cursor: 'pointer',
          borderRadius: borders.radius.md,
          border: `1px solid ${isZero ? colors.neutral[200] : `${color}25`}`,
          backgroundColor: isZero ? colors.neutral[25] : `${color}06`,
          transition: `all ${transitions.normal}`, opacity: isZero ? 0.7 : 1,
          '&:hover': { backgroundColor: isZero ? colors.neutral[50] : `${color}12`, borderColor: isZero ? colors.neutral[300] : `${color}40`, transform: 'translateY(-1px)' },
        }}
      >
        <Box sx={{ color: activeColor, mb: 0.25, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isZero ? 0.5 : 0.7 }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: activeColor, lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography sx={{
          fontSize: typography.sizes['2xs'], fontWeight: typography.weights.medium,
          color: isZero ? colors.textDisabled : colors.textSecondary,
          lineHeight: 1.1, mt: 0.15, textAlign: 'center', whiteSpace: 'nowrap',
        }}>
          {label}
        </Typography>
        {subtitle && (
          <Typography sx={{
            fontSize: '9px', fontWeight: typography.weights.semibold,
            color: activeColor, lineHeight: 1.1, mt: 0.15, textAlign: 'center',
            whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
          }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Tooltip>
  )
}

/**
 * SmartButtons: Buttons showing entity counts + financial amounts.
 * Click navigates to filtered views.
 */
const ConventionSmartButtons = ({
  conventionId, typeConvention, nombreMarches, nombreProjets,
  nombreSousConventions, nombreAvenants, nombrePartenaires,
  montantTotalMarches, montantTotalProjets, commissionTTC, tauxRealisation,
}: ConventionSmartButtonsProps) => {
  const navigate = useNavigate()
  const iconSize = 17

  const buttons = [
    {
      key: 'marches', icon: <FileText size={iconSize} />,
      value: String(nombreMarches), label: 'Marches',
      subtitle: montantTotalMarches && montantTotalMarches > 0 ? fmtShort(montantTotalMarches) + ' MAD' : undefined,
      hint: montantTotalMarches ? `${nombreMarches} marche(s) - Engagement total: ${fmtMAD(montantTotalMarches)}` : `${nombreMarches} marche(s)`,
      rawValue: nombreMarches, color: colors.primary[600], mutedColor: colors.neutral[400],
      onClick: () => navigate(`/marches?conventionId=${conventionId}`), visible: true,
    },
    {
      key: 'projets', icon: <Briefcase size={iconSize} />,
      value: String(nombreProjets), label: 'Projets',
      subtitle: montantTotalProjets && montantTotalProjets > 0 ? fmtShort(montantTotalProjets) + ' MAD' : undefined,
      hint: montantTotalProjets ? `${nombreProjets} projet(s) - Budget total: ${fmtMAD(montantTotalProjets)}` : `${nombreProjets} projet(s)`,
      rawValue: nombreProjets, color: colors.purple[600], mutedColor: colors.neutral[400],
      onClick: () => navigate(`/projets?conventionId=${conventionId}`), visible: true,
    },
    {
      key: 'commission', icon: <Banknote size={iconSize} />,
      value: commissionTTC && commissionTTC > 0 ? fmtShort(commissionTTC) : '0',
      label: 'Commission',
      subtitle: tauxRealisation !== undefined && tauxRealisation > 0 ? `${tauxRealisation.toFixed(0)}% realise` : undefined,
      hint: commissionTTC ? `Commission TTC: ${fmtMAD(commissionTTC)}${tauxRealisation ? ` - Taux de realisation: ${tauxRealisation.toFixed(1)}%` : ''}` : 'Commission non calculee',
      rawValue: commissionTTC || 0, color: colors.warning[600], mutedColor: colors.neutral[400],
      onClick: () => {}, visible: true,
    },
    {
      key: 'sousConventions', icon: <GitBranch size={iconSize} />,
      value: String(nombreSousConventions), label: 'S-Conv.',
      subtitle: undefined, hint: `${nombreSousConventions} sous-convention(s)`,
      rawValue: nombreSousConventions, color: colors.info[600], mutedColor: colors.neutral[400],
      onClick: () => navigate(`/conventions?parentId=${conventionId}`), visible: typeConvention === 'CADRE',
    },
    {
      key: 'avenants', icon: <History size={iconSize} />,
      value: String(nombreAvenants), label: 'Avenants',
      subtitle: undefined, hint: `${nombreAvenants} avenant(s)`,
      rawValue: nombreAvenants, color: colors.danger[500], mutedColor: colors.neutral[400],
      onClick: () => navigate(`/conventions/${conventionId}?tab=avenants`), visible: true,
    },
    {
      key: 'partenaires', icon: <Users size={iconSize} />,
      value: String(nombrePartenaires), label: 'Partenaires',
      subtitle: undefined, hint: `${nombrePartenaires} partenaire(s)`,
      rawValue: nombrePartenaires, color: colors.success[600], mutedColor: colors.neutral[400],
      onClick: () => navigate(`/conventions/${conventionId}?tab=partenaires`), visible: true,
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 0.5 }}>
      {buttons.filter(b => b.visible).map(b => (
        <SmartButton key={b.key} icon={b.icon} value={b.value} label={b.label}
          subtitle={b.subtitle} hint={b.hint}
          color={b.color} mutedColor={b.mutedColor} isZero={b.rawValue === 0} onClick={b.onClick} />
      ))}
    </Box>
  )
}

export default ConventionSmartButtons
