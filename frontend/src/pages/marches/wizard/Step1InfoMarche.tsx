import { useState, useEffect } from 'react'
import {
  Stack,
  TextField,
  MenuItem,
  Typography,
  Box,
  InputAdornment,
  Autocomplete,
} from '@mui/material'
import { MarcheFormData } from '../MarcheWizard'
import { conventionsAPI, fournisseursAPI } from '../../../lib/api'
import LocationPicker from '../../../components/ui/LocationPicker'

interface Step1Props {
  formData: MarcheFormData
  setFormData: React.Dispatch<React.SetStateAction<MarcheFormData>>
}

interface Convention {
  id: number
  code: string
  libelle: string
}

interface Fournisseur {
  id: number
  code: string
  raisonSociale: string
}

const Step1InfoMarche = ({ formData, setFormData }: Step1Props) => {
  const [conventions, setConventions] = useState<Convention[]>([])
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Auto-calcul TVA et TTC
    const tva = (formData.montantHT * formData.tauxTVA) / 100
    const ttc = formData.montantHT + tva
    setFormData((prev) => ({
      ...prev,
      montantTVA: tva,
      montantTTC: ttc,
    }))
  }, [formData.montantHT, formData.tauxTVA])

  const loadData = async () => {
    try {
      const [convRes, fournRes] = await Promise.all([
        conventionsAPI.getAll(),
        fournisseursAPI.getAll(),
      ])

      const convData = Array.isArray(convRes.data) ? convRes.data : convRes.data?.data || []
      const fournData = Array.isArray(fournRes.data) ? fournRes.data : fournRes.data?.data || []

      setConventions(convData)
      setFournisseurs(fournData)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (location: { latitude: number; longitude: number; adresse: string }) => {
    setFormData((prev) => ({
      ...prev,
      adresse: location.adresse,
      latitude: location.latitude,
      longitude: location.longitude,
      zoneGeographique: '',
    }))
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h6" gutterBottom color="primary">
        Informations générales du Marché
      </Typography>

      {/* Numéros et Dates */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          required
          label="Numéro Marché"
          value={formData.numeroMarche}
          onChange={(e) => setFormData({ ...formData, numeroMarche: e.target.value })}
          placeholder="M-2026-001"
          helperText="Numéro unique du marché"
        />
        <TextField
          fullWidth
          label="N° Appel d'Offres (AO)"
          value={formData.numAO}
          onChange={(e) => setFormData({ ...formData, numAO: e.target.value })}
          placeholder="AO-2026-001"
          helperText="Numéro de l'appel d'offres"
        />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          required
          type="date"
          label="Date Marché"
          value={formData.dateMarche}
          onChange={(e) => setFormData({ ...formData, dateMarche: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          type="date"
          label="Date Début"
          value={formData.dateDebut}
          onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          type="date"
          label="Date Fin Prévue"
          value={formData.dateFinPrevue}
          onChange={(e) => setFormData({ ...formData, dateFinPrevue: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      {/* Objet */}
      <TextField
        fullWidth
        required
        multiline
        rows={3}
        label="Objet du Marché"
        value={formData.objet}
        onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
        placeholder="Description détaillée du marché..."
        helperText="Description complète de l'objet du marché"
      />

      {/* Convention et Fournisseur */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Autocomplete
          fullWidth
          options={conventions}
          getOptionLabel={(option) => `${option.code} - ${option.libelle}`}
          value={conventions.find((c) => c.id === formData.conventionId) || null}
          onChange={(_, newValue) => {
            setFormData({ ...formData, conventionId: newValue?.id || null })
          }}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Convention"
              placeholder="Sélectionnez une convention"
              helperText="Convention rattachée au marché"
            />
          )}
        />
        <Autocomplete
          fullWidth
          options={fournisseurs}
          getOptionLabel={(option) => `${option.code} - ${option.raisonSociale}`}
          value={fournisseurs.find((f) => f.id === formData.fournisseurId) || null}
          onChange={(_, newValue) => {
            setFormData({ ...formData, fournisseurId: newValue?.id || null })
          }}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              label="Fournisseur"
              placeholder="Sélectionnez un fournisseur"
              helperText="Entreprise attributaire du marché"
            />
          )}
        />
      </Stack>

      {/* Type et Délai */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          required
          select
          label="Type de Prestation"
          value={formData.typePrestation}
          onChange={(e) => setFormData({ ...formData, typePrestation: e.target.value as any })}
        >
          <MenuItem value="TRAVAUX">Travaux</MenuItem>
          <MenuItem value="FOURNITURES">Fournitures</MenuItem>
          <MenuItem value="SERVICES">Services</MenuItem>
        </TextField>
        <TextField
          fullWidth
          type="number"
          label="Délai d'Exécution"
          value={formData.delaiExecutionMois}
          onChange={(e) => setFormData({ ...formData, delaiExecutionMois: parseInt(e.target.value) || 0 })}
          InputProps={{
            endAdornment: <InputAdornment position="end">mois</InputAdornment>,
          }}
        />
      </Stack>

      {/* Montants */}
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight={600} color="primary">
          Montants et Garanties
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              required
              type="number"
              label="Montant HT"
              value={formData.montantHT}
              onChange={(e) => setFormData({ ...formData, montantHT: parseFloat(e.target.value) || 0 })}
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              type="number"
              label="Taux TVA"
              value={formData.tauxTVA}
              onChange={(e) => setFormData({ ...formData, tauxTVA: parseFloat(e.target.value) || 0 })}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              disabled
              label="Montant TTC"
              value={formData.montantTTC.toFixed(2)}
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
              helperText="Auto-calculé"
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type="number"
              label="Taux RG"
              value={formData.tauxRG}
              onChange={(e) => setFormData({ ...formData, tauxRG: parseFloat(e.target.value) || 0 })}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="Retenue de Garantie"
            />
            <TextField
              fullWidth
              type="number"
              label="Taux Limite"
              value={formData.tauxLimite}
              onChange={(e) => setFormData({ ...formData, tauxLimite: parseFloat(e.target.value) || 0 })}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="Limite RG"
            />
            <TextField
              fullWidth
              type="number"
              label="Caution Bancaire"
              value={formData.cautionBancaire}
              onChange={(e) => setFormData({ ...formData, cautionBancaire: parseFloat(e.target.value) || 0 })}
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Géolocalisation */}
      <Box>
        <Typography variant="subtitle1" gutterBottom fontWeight={600} color="primary">
          Localisation du Projet
        </Typography>
        <Box sx={{ mt: 2 }}>
          <LocationPicker
            adresse={formData.adresse}
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={handleLocationChange}
          />
        </Box>
      </Box>
    </Stack>
  )
}

export default Step1InfoMarche
