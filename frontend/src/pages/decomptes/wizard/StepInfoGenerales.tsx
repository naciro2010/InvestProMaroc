import { Box, Typography, TextField, MenuItem, Divider, Alert, LinearProgress } from '@mui/material'
import RichTextEditor from '../../../components/common/RichTextEditor'
import { colors } from '@/lib/designSystem'
import type { DecompteFormData, Marche } from './types'
import { formatMAD, formatPct } from './types'
import type { MarcheSummaryDTO } from '../../../lib/api'

interface StepInfoGeneralesProps {
  formData: DecompteFormData
  marches: Marche[]
  marcheSummary: MarcheSummaryDTO | null
  prefilledMarcheId: number | null
  onChange: (field: keyof DecompteFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void
  onFormDataChange: (updates: Partial<DecompteFormData>) => void
}

const StepInfoGenerales = ({
  formData, marches, marcheSummary, prefilledMarcheId, onChange, onFormDataChange,
}: StepInfoGeneralesProps) => (
  <Box sx={{ display: 'grid', gap: 3 }}>
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>Informations de base</Typography>
      <Divider sx={{ mb: 3 }} />
    </Box>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      <TextField fullWidth label="Numero de decompte" required value={formData.numeroDecompte}
        onChange={onChange('numeroDecompte')} placeholder="DEC-001" />
      <TextField fullWidth label="Date du decompte" type="date" required value={formData.dateDecompte}
        onChange={onChange('dateDecompte')} InputLabelProps={{ shrink: true }} />
    </Box>

    {prefilledMarcheId ? (
      <TextField fullWidth label="Marche"
        value={marches.find(m => m.id === prefilledMarcheId)?.code
          ? `${marches.find(m => m.id === prefilledMarcheId)?.code} - ${marches.find(m => m.id === prefilledMarcheId)?.objet?.substring(0, 50) ?? ''}`
          : `Marche #${prefilledMarcheId}`}
        InputProps={{ readOnly: true }}
        sx={{ '& .MuiInputBase-input': { bgcolor: colors.neutral[50] } }}
      />
    ) : (
      <TextField fullWidth select label="Marche" required value={formData.marcheId || ''} onChange={onChange('marcheId')}>
        <MenuItem value="">-- Selectionner un marche --</MenuItem>
        {marches.map((m) => (
          <MenuItem key={m.id} value={m.id}>{m.code} - {m.objet.substring(0, 50)}...</MenuItem>
        ))}
      </TextField>
    )}

    {marcheSummary && (
      <Box sx={{ p: 2.5, bgcolor: colors.primary[50], border: `1px solid ${colors.primary[200]}`, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.primary[700], mb: 1.5 }}>
          Marché: {marcheSummary.numeroMarche} — {marcheSummary.objet.substring(0, 80)}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Montant HT</Typography>
            <Typography variant="body2" fontWeight={600}>{formatMAD(marcheSummary.montantHT)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Montant TTC</Typography>
            <Typography variant="body2" fontWeight={600}>{formatMAD(marcheSummary.montantTTC)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Cumul décomptes HT</Typography>
            <Typography variant="body2" fontWeight={600}>{formatMAD(marcheSummary.cumulDecomptesHT)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Restant HT</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: marcheSummary.montantRestantHT > 0 ? colors.success[600] : colors.danger[600] }}>
              {formatMAD(marcheSummary.montantRestantHT)}
            </Typography>
          </Box>
        </Box>
        <LinearProgress variant="determinate" value={Math.min(marcheSummary.tauxAvancement, 100)}
          sx={{ mt: 1.5, height: 6, borderRadius: 3, bgcolor: colors.primary[100],
            '& .MuiLinearProgress-bar': { bgcolor: marcheSummary.tauxAvancement > 90 ? colors.danger[500] : colors.primary[500], borderRadius: 3 } }} />
        <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">Avancement: {formatPct(marcheSummary.tauxAvancement)}</Typography>
          <Typography variant="caption" color="text.secondary">Fournisseur: {marcheSummary.fournisseurNom}</Typography>
          <Typography variant="caption" color="text.secondary">{marcheSummary.nombreDecomptes} décompte(s) · {marcheSummary.nombreLignes} ligne(s)</Typography>
        </Box>
        {marcheSummary.conventionNumero && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Convention: {marcheSummary.conventionNumero} — {marcheSummary.conventionLibelle}
          </Typography>
        )}
        {marcheSummary.montantRestantHT <= 0 && (
          <Alert severity="warning" sx={{ mt: 1.5 }}>Ce marché est entièrement décompté. Aucun restant disponible.</Alert>
        )}
      </Box>
    )}

    <Typography variant="subtitle2" gutterBottom fontWeight={600}>Periode couverte</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      <TextField fullWidth label="Debut de periode" type="date" required value={formData.periodeDebut}
        onChange={onChange('periodeDebut')} InputLabelProps={{ shrink: true }} />
      <TextField fullWidth label="Fin de periode" type="date" required value={formData.periodeFin}
        onChange={onChange('periodeFin')} InputLabelProps={{ shrink: true }} />
    </Box>

    <RichTextEditor label="Observations" value={formData.observationsRich}
      onChange={(value) => onFormDataChange({ observationsRich: value, observations: value.replace(/<[^>]*>/g, '').substring(0, 500) })}
      placeholder="Observations sur ce decompte..." minHeight={150} />

    <TextField fullWidth select label="Statut" required value={formData.statut} onChange={onChange('statut')}>
      <MenuItem value="BROUILLON">Brouillon</MenuItem>
      <MenuItem value="VALIDE">Valide</MenuItem>
      <MenuItem value="PAYE">Paye</MenuItem>
    </TextField>
  </Box>
)

export default StepInfoGenerales
