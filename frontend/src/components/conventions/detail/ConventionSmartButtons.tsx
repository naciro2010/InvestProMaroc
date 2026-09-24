import { Box } from '@mui/material'
import { CounterButton } from '@/components/core'
import { useNavigate } from 'react-router-dom'

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

  const buttons = [
    {
      key: 'marches',
      value: String(nombreMarches), label: 'Marchés',
      subtitle: montantTotalMarches && montantTotalMarches > 0 ? fmtShort(montantTotalMarches) + ' MAD' : undefined,
      hint: montantTotalMarches ? `${nombreMarches} marche(s) - Engagement total: ${fmtMAD(montantTotalMarches)}` : `${nombreMarches} marche(s)`,
      rawValue: nombreMarches,
      onClick: () => navigate(`/marches?conventionId=${conventionId}`), visible: true,
    },
    {
      key: 'projets',
      value: String(nombreProjets), label: 'Projets',
      subtitle: montantTotalProjets && montantTotalProjets > 0 ? fmtShort(montantTotalProjets) + ' MAD' : undefined,
      hint: montantTotalProjets ? `${nombreProjets} projet(s) - Budget total: ${fmtMAD(montantTotalProjets)}` : `${nombreProjets} projet(s)`,
      rawValue: nombreProjets,
      onClick: () => navigate(`/projets?conventionId=${conventionId}`), visible: true,
    },
    {
      key: 'commission',
      value: commissionTTC && commissionTTC > 0 ? fmtShort(commissionTTC) : '0',
      label: 'Commission',
      subtitle: tauxRealisation !== undefined && tauxRealisation > 0 ? `${tauxRealisation.toFixed(0)}% réalisé` : undefined,
      hint: commissionTTC ? `Commission TTC: ${fmtMAD(commissionTTC)}${tauxRealisation ? ` - Taux de realisation: ${tauxRealisation.toFixed(1)}%` : ''}` : 'Commission non calculee',
      rawValue: commissionTTC || 0,
      onClick: () => {}, visible: true,
    },
    {
      key: 'sousConventions',
      value: String(nombreSousConventions), label: 'Sous-conventions',
      subtitle: undefined, hint: `${nombreSousConventions} sous-convention(s)`,
      rawValue: nombreSousConventions,
      onClick: () => navigate(`/conventions?parentId=${conventionId}`), visible: typeConvention === 'CADRE',
    },
    {
      key: 'avenants',
      value: String(nombreAvenants), label: 'Avenants',
      subtitle: undefined, hint: `${nombreAvenants} avenant(s)`,
      rawValue: nombreAvenants,
      onClick: () => navigate(`/conventions/${conventionId}?tab=avenants`), visible: true,
    },
    {
      key: 'partenaires',
      value: String(nombrePartenaires), label: 'Partenaires',
      subtitle: undefined, hint: `${nombrePartenaires} partenaire(s)`,
      rawValue: nombrePartenaires,
      onClick: () => navigate(`/conventions/${conventionId}?tab=partenaires`), visible: true,
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 0.5 }}>
      {buttons.filter(b => b.visible).map(b => (
        <CounterButton key={b.key} value={b.value} label={b.label}
          subtitle={b.subtitle} hint={b.hint} isZero={b.rawValue === 0} onClick={b.onClick} />
      ))}
    </Box>
  )
}

export default ConventionSmartButtons
