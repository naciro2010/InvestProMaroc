import { useState, useEffect } from 'react'
import {
  Stack,
  TextField,
  MenuItem,
  Typography,
  Box,
  InputAdornment,
  Autocomplete,
  Alert,
} from '@mui/material'
import { DecompteFormData } from '../DecompteWizard'
import { marchesAPI } from '../../../lib/api'

interface Step1Props {
  formData: DecompteFormData
  setFormData: React.Dispatch<React.SetStateAction<DecompteFormData>>
}

interface Marche {
  id: number
  numeroMarche: string
  objet: string
  montantTTC: number
}

const Step1InfoDecompte = ({ formData, setFormData }: Step1Props) => {
  const [marches, setMarches] = useState<Marche[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMarches()
  }, [])

  useEffect(() => {
    // Auto-calcul TVA et TTC
    const tva = (formData.montantBrutHT * formData.tauxTVA) / 100
    const ttc = formData.montantBrutHT + tva
    const cumulActuel = formData.cumulPrecedent + formData.montantBrutHT

    setFormData((prev) => ({
      ...prev,
      montantTVA: tva,
      montantTTC: ttc,
      cumulActuel: cumulActuel,
      tauxAvancement: formData.montantBrutHT > 0 ? (cumulActuel / formData.montantBrutHT) * 100 : 0,
    }))
  }, [formData.montantBrutHT, formData.tauxTVA, formData.cumulPrecedent])

  const loadMarches = async () => {
    try {
      const { data } = await marchesAPI.getAll()
      const marcheData = Array.isArray(data.data) ? data.data : data.data?.data || []
      setMarches(marcheData)
    } catch (error) {
      console.error('Erreur chargement marchés:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h6" gutterBottom color="primary">
        Informations Générales du Décompte
      </Typography>

      {/* Numéro et Marché */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          required
          label="Numéro Décompte"
          value={formData.numeroDecompte}
          onChange={(e) => setFormData({ ...formData, numeroDecompte: e.target.value })}
          placeholder="DEC-2026-001"
          helperText="Numéro unique du décompte"
        />
        <Autocomplete
          fullWidth
          options={marches}
          getOptionLabel={(option) => `${option.numeroMarche} - ${option.objet}`}
          value={marches.find((m) => m.id === formData.marcheId) || null}
          onChange={(_, newValue) => {
            setFormData({ ...formData, marcheId: newValue?.id || null })
          }}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              label="Marché"
              placeholder="Sélectionnez un marché"
              helperText="Marché associé au décompte"
            />
          )}
        />
      </Stack>

      {/* Dates */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          required
          type="date"
          label="Date Décompte"
          value={formData.dateDecompte}
          onChange={(e) => setFormData({ ...formData, dateDecompte: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          required
          type="date"
          label="Période Début"
          value={formData.periodeDebut}
          onChange={(e) => setFormData({ ...formData, periodeDebut: e.target.value })}
          InputLabelProps={{ shrink: true }}
          helperText="Début de la période facturée"
        />
        <TextField
          fullWidth
          required
          type="date"
          label="Période Fin"
          value={formData.periodeFin}
          onChange={(e) => setFormData({ ...formData, periodeFin: e.target.value })}
          InputLabelProps={{ shrink: true }}
          helperText="Fin de la période facturée"
        />
      </Stack>

      {/* Statut */}
      <TextField
        fullWidth
        select
        label="Statut"
        value={formData.statut}
        onChange={(e) => setFormData({ ...formData, statut: e.target.value as typeof formData.statut })}
      >
        <MenuItem value="BROUILLON">Brouillon</MenuItem>
        <MenuItem value="SOUMIS">Soumis</MenuItem>
        <MenuItem value="VALIDE">Validé</MenuItem>
        <MenuItem value="REJETE">Rejeté</MenuItem>
        <MenuItem value="PAYE_PARTIEL">Payé Partiellement</MenuItem>
        <MenuItem value="PAYE_TOTAL">Payé Totalement</MenuItem>
      </TextField>

      {/* Montants */}
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight={600} color="primary">
          Montants de la Période
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              required
              type="number"
              label="Montant Brut HT"
              value={formData.montantBrutHT}
              onChange={(e) =>
                setFormData({ ...formData, montantBrutHT: parseFloat(e.target.value) || 0 })
              }
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
                inputProps: { step: '0.01', min: '0' },
              }}
              helperText="Montant HT de la période"
            />
            <TextField
              fullWidth
              type="number"
              label="Taux TVA"
              value={formData.tauxTVA}
              onChange={(e) => setFormData({ ...formData, tauxTVA: parseFloat(e.target.value) || 0 })}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                inputProps: { step: '0.01', min: '0', max: '100' },
              }}
            />
            <TextField
              fullWidth
              disabled
              label="Montant TVA"
              value={formData.montantTVA.toFixed(2)}
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
              helperText="Auto-calculé"
            />
          </Stack>

          <TextField
            fullWidth
            disabled
            label="Montant TTC"
            value={formData.montantTTC.toFixed(2)}
            InputProps={{
              endAdornment: <InputAdornment position="end">DH</InputAdornment>,
            }}
            helperText="Auto-calculé = HT + TVA"
            sx={{ bgcolor: '#f0f9ff' }}
          />
        </Stack>
      </Box>

      {/* Cumuls */}
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight={600} color="primary">
          Cumuls et Avancement
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Les montants cumulés permettent de suivre l'avancement global du marché
        </Alert>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type="number"
              label="Cumul Précédent"
              value={formData.cumulPrecedent}
              onChange={(e) =>
                setFormData({ ...formData, cumulPrecedent: parseFloat(e.target.value) || 0 })
              }
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
                inputProps: { step: '0.01', min: '0' },
              }}
              helperText="Cumul des décomptes précédents"
            />
            <TextField
              fullWidth
              disabled
              label="Cumul Actuel"
              value={formData.cumulActuel.toFixed(2)}
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
              helperText="Cumul précédent + montant actuel"
            />
            <TextField
              fullWidth
              disabled
              label="Taux Avancement"
              value={formData.tauxAvancement.toFixed(2)}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="Pourcentage d'avancement"
            />
          </Stack>
        </Stack>
      </Box>

      {/* Observations */}
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Observations"
        value={formData.observations}
        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
        placeholder="Observations ou remarques sur le décompte..."
      />
    </Stack>
  )
}

export default Step1InfoDecompte
