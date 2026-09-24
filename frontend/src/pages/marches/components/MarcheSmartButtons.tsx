import { Box } from '@mui/material'
import { CounterButton } from '@/components/core'

interface MarcheSmartButtonsProps {
  marcheId: number
  nombreLignes: number
  nombreDecomptes: number
  nombrePaiements: number
  nombreAvenants: number
  montantTtc: number
  montantPaye: number
  fournisseurNom?: string
  /** Ouvre l'onglet correspondant (id d'onglet du Notebook) */
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

const MarcheSmartButtons = ({
  nombreLignes, nombreDecomptes, nombrePaiements, nombreAvenants,
  montantTtc, montantPaye, fournisseurNom, onScrollToTab,
}: MarcheSmartButtonsProps) => {
  const tauxPaiement = montantTtc > 0 ? (montantPaye / montantTtc) * 100 : 0

  const buttons = [
    {
      key: 'lignes',
      value: String(nombreLignes), label: 'Lignes',
      subtitle: montantTtc > 0 ? fmtShort(montantTtc) + ' MAD' : undefined,
      hint: `${nombreLignes} ligne(s) - Montant TTC: ${fmtMAD(montantTtc)}`,
      rawValue: nombreLignes,
      onClick: () => { onScrollToTab?.('bordereau') },
    },
    {
      key: 'decomptes',
      value: String(nombreDecomptes), label: 'Décomptes',
      subtitle: montantPaye > 0 ? fmtShort(montantPaye) + ' MAD' : undefined,
      hint: `${nombreDecomptes} décompte(s)${montantPaye > 0 ? ` - Montant payé : ${fmtMAD(montantPaye)}` : ''}`,
      rawValue: nombreDecomptes,
      onClick: () => { onScrollToTab?.('situation') },
    },
    {
      key: 'paiements',
      value: tauxPaiement > 0 ? `${tauxPaiement.toFixed(0)}%` : '0%',
      label: 'Paiement',
      subtitle: nombrePaiements > 0 ? `${nombrePaiements} op.` : undefined,
      hint: `Taux de paiement: ${tauxPaiement.toFixed(1)}%${nombrePaiements > 0 ? ` - ${nombrePaiements} paiement(s)` : ''}`,
      rawValue: nombrePaiements,
      onClick: () => { onScrollToTab?.('situation') },
    },
    {
      key: 'avenants',
      value: String(nombreAvenants), label: 'Avenants',
      subtitle: undefined,
      hint: `${nombreAvenants} avenant(s)`,
      rawValue: nombreAvenants,
      onClick: () => { onScrollToTab?.('avenants') },
    },
    {
      key: 'fournisseur',
      value: fournisseurNom ? '1' : '0', label: 'Fournisseur',
      subtitle: fournisseurNom || undefined,
      hint: fournisseurNom ? `Fournisseur: ${fournisseurNom}` : 'Aucun fournisseur',
      rawValue: fournisseurNom ? 1 : 0,
      onClick: () => { onScrollToTab?.('detail') },
    },
    {
      key: 'engagement',
      value: montantTtc > 0 ? fmtShort(montantTtc) : '0',
      label: 'Engagement',
      subtitle: montantTtc > 0 ? `Reste: ${fmtShort(montantTtc - montantPaye)}` : undefined,
      hint: montantTtc > 0 ? `Engagement: ${fmtMAD(montantTtc)} - Reste à payer : ${fmtMAD(montantTtc - montantPaye)}` : 'Aucun engagement',
      rawValue: montantTtc,
      onClick: () => {},
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 0.5 }}>
      {buttons.map(b => (
        <CounterButton
          key={b.key} value={b.value} label={b.label}
          subtitle={b.subtitle} hint={b.hint}
          isZero={b.rawValue === 0} onClick={b.onClick}
        />
      ))}
    </Box>
  )
}

export default MarcheSmartButtons
