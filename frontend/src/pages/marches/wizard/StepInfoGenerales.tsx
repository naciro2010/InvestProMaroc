import { Box, Typography, TextField, MenuItem, Divider, Alert, LinearProgress } from '@mui/material'
import RichTextEditor from '../../../components/common/RichTextEditor'
import { colors } from '@/lib/designSystem'
import type { MarcheFormData, Convention, Fournisseur } from './types'
import { formatMAD, formatPct } from './types'
import type { ConventionSummaryDTO, FournisseurSummaryDTO } from '../../../lib/api'

interface StepInfoGeneralesProps {
  formData: MarcheFormData
  conventions: Convention[]
  fournisseurs: Fournisseur[]
  conventionSummary: ConventionSummaryDTO | null
  fournisseurSummary: FournisseurSummaryDTO | null
  onChange: (field: keyof MarcheFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void
  onFormDataChange: (updates: Partial<MarcheFormData>) => void
}

const StepInfoGenerales = ({
  formData, conventions, fournisseurs, conventionSummary, fournisseurSummary, onChange, onFormDataChange,
}: StepInfoGeneralesProps) => (
  <Box sx={{ display: 'grid', gap: 3 }}>
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>Informations de base</Typography>
      <Divider sx={{ mb: 3 }} />
    </Box>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      <TextField fullWidth label="Code" required value={formData.code} onChange={onChange('code')} placeholder="MRC-001" />
      <TextField fullWidth label="Numéro de marché" required value={formData.numeroMarche} onChange={onChange('numeroMarche')} placeholder="N°2024/001" />
      <TextField fullWidth label="Numéro d'AO" value={formData.numAO} onChange={onChange('numAO')} placeholder="AO-2024/001" />
      <TextField fullWidth select label="Type de marché" required value={formData.typeMarche} onChange={onChange('typeMarche')}>
        <MenuItem value="MARCHE">Marché</MenuItem>
        <MenuItem value="CONTRAT">Contrat</MenuItem>
        <MenuItem value="BON_DE_COMMANDE">Bon de commande</MenuItem>
        <MenuItem value="LETTRE_DE_COMMANDE">Lettre de commande</MenuItem>
      </TextField>
    </Box>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      <TextField fullWidth select label="Nature de la prestation" required value={formData.naturePrestation} onChange={onChange('naturePrestation')}>
        <MenuItem value="TRAVAUX">Travaux</MenuItem>
        <MenuItem value="FOURNITURES">Fournitures</MenuItem>
        <MenuItem value="SERVICES">Services</MenuItem>
        <MenuItem value="ETUDES">Études</MenuItem>
      </TextField>
    </Box>

    <RichTextEditor
      label="Objet du marché"
      value={formData.objetRich}
      onChange={(value) => onFormDataChange({ objetRich: value, objet: value.replace(/<[^>]*>/g, '').substring(0, 500) })}
      placeholder="Décrivez l'objet du marché en détail..."
      required
      minHeight={200}
    />

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      <TextField fullWidth select label="Fournisseur" required value={formData.fournisseurId || ''} onChange={onChange('fournisseurId')}>
        <MenuItem value="">-- Sélectionner --</MenuItem>
        {fournisseurs.map((f) => (
          <MenuItem key={f.id} value={f.id}>{f.code} - {f.raisonSociale}</MenuItem>
        ))}
      </TextField>
      <TextField fullWidth select label="Convention" value={formData.conventionId || ''} onChange={onChange('conventionId')}>
        <MenuItem value="">-- Optionnel --</MenuItem>
        {conventions.map((c) => (
          <MenuItem key={c.id} value={c.id}>{c.code} - {c.objet.substring(0, 50)}...</MenuItem>
        ))}
      </TextField>
    </Box>

    {conventionSummary && (
      <Box sx={{ p: 2.5, bgcolor: colors.primary[50], border: `1px solid ${colors.primary[200]}`, borderRadius: 2, mt: 1 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.primary[700], mb: 1.5 }}>
          Convention: {conventionSummary.numero} — {conventionSummary.libelle}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Budget</Typography>
            <Typography variant="body2" fontWeight={600}>{formatMAD(conventionSummary.budget)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Engagé HT</Typography>
            <Typography variant="body2" fontWeight={600}>{formatMAD(conventionSummary.montantEngageHT)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Budget restant</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: conventionSummary.budgetRestant > 0 ? colors.success[600] : colors.danger[600] }}>
              {formatMAD(conventionSummary.budgetRestant)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Taux engagement</Typography>
            <Typography variant="body2" fontWeight={600}>{formatPct(conventionSummary.tauxEngagement)}</Typography>
          </Box>
        </Box>
        <LinearProgress variant="determinate" value={Math.min(conventionSummary.tauxEngagement, 100)}
          sx={{ mt: 1.5, height: 6, borderRadius: 3, bgcolor: colors.primary[100],
            '& .MuiLinearProgress-bar': { bgcolor: conventionSummary.tauxEngagement > 90 ? colors.danger[500] : colors.primary[500], borderRadius: 3 },
          }} />
        <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">Taux commission: {formatPct(conventionSummary.tauxCommission)}</Typography>
          <Typography variant="caption" color="text.secondary">TVA: {formatPct(conventionSummary.tauxTva)}</Typography>
          <Typography variant="caption" color="text.secondary">{conventionSummary.nombreMarches} marché(s) · {conventionSummary.nombreProjets} projet(s)</Typography>
        </Box>
        {conventionSummary.budgetRestant <= 0 && (
          <Alert severity="warning" sx={{ mt: 1.5 }}>Le budget de cette convention est entièrement engagé.</Alert>
        )}
      </Box>
    )}

    {fournisseurSummary && (
      <Box sx={{ p: 2.5, bgcolor: colors.neutral[50], border: `1px solid ${colors.neutral[200]}`, borderRadius: 2, mt: 1 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.neutral[700], mb: 1 }}>
          Fournisseur: {fournisseurSummary.raisonSociale}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">ICE</Typography>
            <Typography variant="body2" fontWeight={600}>{fournisseurSummary.ice || '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">IF</Typography>
            <Typography variant="body2" fontWeight={600}>{fournisseurSummary.identifiantFiscal || '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Marchés</Typography>
            <Typography variant="body2" fontWeight={600}>{fournisseurSummary.nombreMarches}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Total marchés</Typography>
            <Typography variant="body2" fontWeight={600}>{formatMAD(fournisseurSummary.montantTotalMarches)}</Typography>
          </Box>
        </Box>
        {fournisseurSummary.ville && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {fournisseurSummary.adresse ? `${fournisseurSummary.adresse}, ` : ''}{fournisseurSummary.ville}
            {fournisseurSummary.telephone ? ` · Tél: ${fournisseurSummary.telephone}` : ''}
          </Typography>
        )}
      </Box>
    )}
  </Box>
)

export default StepInfoGenerales
