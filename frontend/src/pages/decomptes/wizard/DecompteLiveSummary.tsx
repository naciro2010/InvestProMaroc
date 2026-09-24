import { Box } from '@mui/material'
import { Panel, HighlightBlock, DualProgress } from '@/components/core'
import type { MarcheSummaryDTO } from '@/lib/api'
import { colors } from '@/lib/designSystem'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { DecompteFormData } from './types'

interface DecompteLiveSummaryProps {
  formData: DecompteFormData
  marcheSummary: MarcheSummaryDTO | null
}

const Row = ({ label, value, bold, danger }: { label: string; value: string; bold?: boolean; danger?: boolean }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, py: 0.5, fontSize: 13.5, fontWeight: bold ? 700 : 400, color: danger ? colors.danger[600] : colors.textPrimary }}>
    <span style={{ color: danger ? undefined : bold ? colors.textPrimary : colors.textSecondary }}>{label}</span>
    <span style={{ whiteSpace: 'nowrap' }}>{value}</span>
  </Box>
)

/** Colonne droite de l'assistant : calculs en direct et cumul décompté sur le marché. */
const DecompteLiveSummary = ({ formData, marcheSummary }: DecompteLiveSummaryProps) => {
  const numero = marcheSummary ? marcheSummary.nombreDecomptes + 1 : null
  const cumulHT = (marcheSummary?.cumulDecomptesHT ?? 0) + (formData.montantBrutHT || 0)
  const montantMarche = marcheSummary?.montantHT ?? 0
  const tauxCumul = montantMarche > 0 ? (cumulHT / montantMarche) * 100 : 0

  return (
    <Panel title={numero ? `Décompte n° ${numero}` : 'Nouveau décompte'}>
      <Row label="Brut HT" value={formatNumber(formData.montantBrutHT || 0)} />
      <Row label={`TVA (${formData.tauxTVA} %)`} value={formatNumber(formData.montantTVA)} />
      <Row label="TTC" value={formatNumber(formData.montantTTC)} bold />
      <Row label="Retenues" value={`− ${formatNumber(formData.totalRetenues)}`} danger />
      <Box sx={{ my: 1.5 }}>
        <HighlightBlock label="Net à payer" value={formatNumber(formData.netAPayer)} />
      </Box>
      {marcheSummary ? (
        <>
          <Box sx={{ fontSize: 12.5, color: colors.textSecondary, mb: 0.75 }}>
            Cumul décompté HT : {formatNumber(cumulHT)} sur {formatNumber(montantMarche)} ({formatPercent(tauxCumul)})
          </Box>
          <DualProgress engaged={tauxCumul} label={`Cumul décompté ${formatPercent(tauxCumul)} du marché`} />
        </>
      ) : (
        <Box sx={{ fontSize: 12.5, color: colors.textTertiary }}>Choisissez un marché pour voir le cumul décompté.</Box>
      )}
    </Panel>
  )
}

export default DecompteLiveSummary
