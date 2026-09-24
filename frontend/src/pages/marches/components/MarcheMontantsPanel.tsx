import { Box, Skeleton } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Panel, HighlightBlock, DualProgress } from '@/components/core'
import { marchesAPI } from '@/lib/api'
import { colors } from '@/lib/designSystem'
import { formatNumber, formatPercent } from '@/lib/utils'

interface SituationPaiement {
  totalNetAPayer: number
  totalMontantPaye: number
  resteAPayer: number
  tauxPaiement: number
}

interface MarcheMontantsPanelProps {
  marcheId: number
  montantHt: number | null
  montantTva: number | null
  montantTtc: number | null
}

const Row = ({ label, value, bold }: { label: string; value: number; bold?: boolean }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, py: 0.6, fontSize: 13.5, fontWeight: bold ? 700 : 400 }}>
    <span style={{ color: bold ? colors.textPrimary : colors.textSecondary }}>{label}</span>
    <span style={{ whiteSpace: 'nowrap' }}>{formatNumber(value)}</span>
  </Box>
)

/** Montants du marché : HT, TVA, TTC, décomptes, payé, reste à payer et avancement. */
const MarcheMontantsPanel = ({ marcheId, montantHt, montantTva, montantTtc }: MarcheMontantsPanelProps) => {
  const { data, isLoading } = useQuery<SituationPaiement | null>({
    queryKey: ['marche-situation-paiement', marcheId],
    queryFn: async () => {
      const res = await marchesAPI.getSituationPaiement(marcheId)
      return (res.data?.data ?? res.data ?? null) as SituationPaiement | null
    },
  })

  const ttc = montantTtc ?? 0
  const decompte = data?.totalNetAPayer ?? 0
  const paye = data?.totalMontantPaye ?? 0
  const avancement = ttc > 0 ? (decompte / ttc) * 100 : 0
  const paiements = data?.tauxPaiement ?? (decompte > 0 ? (paye / decompte) * 100 : 0)

  return (
    <Panel title="Montants du marché">
      <Row label="Montant HT" value={montantHt ?? 0} />
      <Row label="TVA" value={montantTva ?? ttc - (montantHt ?? 0)} />
      <Row label="Montant TTC" value={ttc} bold />
      <Box sx={{ height: 8 }} />
      {isLoading ? <Skeleton variant="rounded" height={120} /> : (
        <>
          <Row label="Décomptes constatés" value={decompte} />
          <Row label="Payé" value={paye} />
          <Row label="Reste à décompter" value={Math.max(0, ttc - decompte)} />
          <Box sx={{ my: 1.5 }}>
            <HighlightBlock label="Reste à payer" value={formatNumber(data?.resteAPayer ?? decompte - paye)} />
          </Box>
          <Box sx={{ fontSize: 12.5, color: colors.textSecondary, mb: 0.5 }}>Avancement {formatPercent(avancement)}</Box>
          <DualProgress engaged={avancement} label={`Avancement ${formatPercent(avancement)}`} />
          <Box sx={{ fontSize: 12.5, color: colors.textSecondary, mt: 1.25, mb: 0.5 }}>Paiements {formatPercent(paiements)}</Box>
          <DualProgress engaged={0} paid={paiements} label={`Paiements ${formatPercent(paiements)}`} />
        </>
      )}
    </Panel>
  )
}

export default MarcheMontantsPanel
