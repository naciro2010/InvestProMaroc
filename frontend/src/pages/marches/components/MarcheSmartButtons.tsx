import { Box, Typography, Tooltip } from '@mui/material'
import { FileText, Receipt, CreditCard, History, Truck, Layers } from 'lucide-react'
import { colors, typography, borders, transitions } from '@/lib/designSystem'

interface MarcheSmartButtonsProps {
  marcheId: number
  nombreLignes: number
  nombreDecomptes: number
  nombrePaiements: number
  nombreAvenants: number
  montantTtc: number
  montantPaye: number
  fournisseurNom?: string
  onScrollToTab?: (tab: string) => void
}

const fmtShort = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}G`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return n.toString()
}

const fmtMAD = (n: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)

interface SmartButtonProps {
  icon: React.ReactNode
  value: string
  label: string
  subtitle?: string
  hint?: string
  color: string
  mutedColor: string
  isZero: boolean
  onClick: () => void
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
          '&:hover': {
            backgroundColor: isZero ? colors.neutral[50] : `${color}12`,
            borderColor: isZero ? colors.neutral[300] : `${color}40`,
            transform: 'translateY(-1px)',
          },
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

const MarcheSmartButtons = ({
  nombreLignes, nombreDecomptes, nombrePaiements, nombreAvenants,
  montantTtc, montantPaye, fournisseurNom, onScrollToTab,
}: MarcheSmartButtonsProps) => {
  const iconSize = 17
  const tauxPaiement = montantTtc > 0 ? (montantPaye / montantTtc) * 100 : 0

  const buttons = [
    {
      key: 'lignes', icon: <Layers size={iconSize} />,
      value: String(nombreLignes), label: 'Lignes',
      subtitle: montantTtc > 0 ? fmtShort(montantTtc) + ' MAD' : undefined,
      hint: `${nombreLignes} ligne(s) - Montant TTC: ${fmtMAD(montantTtc)}`,
      rawValue: nombreLignes, color: colors.primary[600], mutedColor: colors.neutral[400],
      onClick: () => { onScrollToTab?.('Lignes') },
    },
    {
      key: 'decomptes', icon: <FileText size={iconSize} />,
      value: String(nombreDecomptes), label: 'Decomptes',
      subtitle: montantPaye > 0 ? fmtShort(montantPaye) + ' MAD' : undefined,
      hint: `${nombreDecomptes} decompte(s)${montantPaye > 0 ? ` - Montant paye: ${fmtMAD(montantPaye)}` : ''}`,
      rawValue: nombreDecomptes, color: colors.success[600], mutedColor: colors.neutral[400],
      onClick: () => { onScrollToTab?.('Situation Paiement') },
    },
    {
      key: 'paiements', icon: <CreditCard size={iconSize} />,
      value: tauxPaiement > 0 ? `${tauxPaiement.toFixed(0)}%` : '0%',
      label: 'Paiement',
      subtitle: nombrePaiements > 0 ? `${nombrePaiements} op.` : undefined,
      hint: `Taux de paiement: ${tauxPaiement.toFixed(1)}%${nombrePaiements > 0 ? ` - ${nombrePaiements} paiement(s)` : ''}`,
      rawValue: nombrePaiements, color: colors.warning[600], mutedColor: colors.neutral[400],
      onClick: () => { onScrollToTab?.('Situation Paiement') },
    },
    {
      key: 'avenants', icon: <History size={iconSize} />,
      value: String(nombreAvenants), label: 'Avenants',
      subtitle: undefined,
      hint: `${nombreAvenants} avenant(s)`,
      rawValue: nombreAvenants, color: colors.danger[500], mutedColor: colors.neutral[400],
      onClick: () => { onScrollToTab?.('Avenants') },
    },
    {
      key: 'fournisseur', icon: <Truck size={iconSize} />,
      value: fournisseurNom ? '1' : '0', label: 'Fournisseur',
      subtitle: fournisseurNom || undefined,
      hint: fournisseurNom ? `Fournisseur: ${fournisseurNom}` : 'Aucun fournisseur',
      rawValue: fournisseurNom ? 1 : 0, color: colors.purple[600], mutedColor: colors.neutral[400],
      onClick: () => { onScrollToTab?.('Detail') },
    },
    {
      key: 'engagement', icon: <Receipt size={iconSize} />,
      value: montantTtc > 0 ? fmtShort(montantTtc) : '0',
      label: 'Engagement',
      subtitle: montantTtc > 0 ? `Reste: ${fmtShort(montantTtc - montantPaye)}` : undefined,
      hint: montantTtc > 0 ? `Engagement: ${fmtMAD(montantTtc)} - Reste a payer: ${fmtMAD(montantTtc - montantPaye)}` : 'Aucun engagement',
      rawValue: montantTtc, color: colors.info[600], mutedColor: colors.neutral[400],
      onClick: () => {},
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 0.5 }}>
      {buttons.map(b => (
        <SmartButton
          key={b.key} icon={b.icon} value={b.value} label={b.label}
          subtitle={b.subtitle} hint={b.hint}
          color={b.color} mutedColor={b.mutedColor} isZero={b.rawValue === 0} onClick={b.onClick}
        />
      ))}
    </Box>
  )
}

export default MarcheSmartButtons
