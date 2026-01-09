import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Stack,
  InputAdornment,
  Chip,
} from '@mui/material'
import { Save, Close } from '@mui/icons-material'
import { avenantConventionsAPI } from '../../lib/api'
import { AvenantConventionRequest, AvenantConventionResponse } from '../../types/avenantConvention'

interface AvenantConventionFormProps {
  conventionId: number
  conventionData?: any // Données de la convention pour créer le snapshot
  avenantToEdit?: AvenantConventionResponse
  onSave: () => void
  onCancel: () => void
}

// Helper pour formater les nombres en affichage
const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

// Helper pour parser les nombres depuis l'affichage
const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/\s/g, '').replace(/,/g, '.')
  return parseFloat(cleaned) || 0
}

const AvenantConventionForm = ({
  conventionId,
  conventionData,
  avenantToEdit,
  onSave,
  onCancel,
}: AvenantConventionFormProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!avenantToEdit

  const [formData, setFormData] = useState({
    numeroAvenant: '',
    dateAvenant: new Date().toISOString().split('T')[0],
    objet: '',
    motif: '',
    detailsModifications: '',
    ancienBudget: '',
    nouveauBudget: '',
    ancienTauxCommission: '',
    nouveauTauxCommission: '',
    dateEffet: '',
    remarques: '',
  })

  useEffect(() => {
    if (avenantToEdit) {
      setFormData({
        numeroAvenant: avenantToEdit.numeroAvenant,
        dateAvenant: avenantToEdit.dateAvenant,
        objet: avenantToEdit.objet,
        motif: avenantToEdit.motif || '',
        detailsModifications: avenantToEdit.detailsModifications || '',
        ancienBudget: avenantToEdit.ancienBudget ? formatNumber(avenantToEdit.ancienBudget) : '',
        nouveauBudget: avenantToEdit.nouveauBudget ? formatNumber(avenantToEdit.nouveauBudget) : '',
        ancienTauxCommission: avenantToEdit.ancienTauxCommission?.toString() || '',
        nouveauTauxCommission: avenantToEdit.nouveauTauxCommission?.toString() || '',
        dateEffet: avenantToEdit.dateEffet || '',
        remarques: avenantToEdit.remarques || '',
      })
    } else if (conventionData) {
      // Pré-remplir avec les données actuelles de la convention
      setFormData(prev => ({
        ...prev,
        ancienBudget: conventionData.budget ? formatNumber(conventionData.budget) : '',
        ancienTauxCommission: conventionData.tauxCommission?.toString() || '',
      }))
    }
  }, [avenantToEdit, conventionData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Créer le snapshot des données avant
      const donneesAvant = conventionData ? {
        code: conventionData.code,
        numero: conventionData.numero,
        libelle: conventionData.libelle,
        objet: conventionData.objet,
        budget: conventionData.budget,
        tauxCommission: conventionData.tauxCommission,
        baseCalcul: conventionData.baseCalcul,
        tauxTva: conventionData.tauxTva,
        dateDebut: conventionData.dateDebut,
        dateFin: conventionData.dateFin,
        statut: conventionData.statut,
      } : undefined

      // Créer l'objet des modifications
      const modifications: Record<string, any> = {}

      if (formData.nouveauBudget && formData.ancienBudget !== formData.nouveauBudget) {
        modifications.budget = parseFormattedNumber(formData.nouveauBudget)
      }

      if (formData.nouveauTauxCommission && formData.ancienTauxCommission !== formData.nouveauTauxCommission) {
        modifications.tauxCommission = parseFloat(formData.nouveauTauxCommission)
      }

      const payload: AvenantConventionRequest = {
        conventionId,
        numeroAvenant: formData.numeroAvenant,
        dateAvenant: formData.dateAvenant,
        objet: formData.objet,
        motif: formData.motif || undefined,
        donneesAvant,
        modifications: Object.keys(modifications).length > 0 ? modifications : undefined,
        detailsModifications: formData.detailsModifications || undefined,
        ancienBudget: formData.ancienBudget ? parseFormattedNumber(formData.ancienBudget) : undefined,
        nouveauBudget: formData.nouveauBudget ? parseFormattedNumber(formData.nouveauBudget) : undefined,
        ancienTauxCommission: formData.ancienTauxCommission ? parseFloat(formData.ancienTauxCommission) : undefined,
        nouveauTauxCommission: formData.nouveauTauxCommission ? parseFloat(formData.nouveauTauxCommission) : undefined,
        dateEffet: formData.dateEffet || undefined,
        remarques: formData.remarques || undefined,
      }

      if (isEdit && avenantToEdit) {
        await avenantConventionsAPI.update(avenantToEdit.id, payload)
      } else {
        await avenantConventionsAPI.create(payload)
      }

      onSave()
    } catch (err: any) {
      console.error('Erreur sauvegarde avenant:', err)
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleNumberChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[\d\s,.]*$/.test(value) || value === '') {
      setFormData({ ...formData, [field]: value })
    }
  }

  const formatNumberOnBlur = (field: string) => () => {
    const value = formData[field as keyof typeof formData] as string
    if (value) {
      const num = parseFormattedNumber(value)
      setFormData({ ...formData, [field]: formatNumber(num) })
    }
  }

  const calculateDelta = () => {
    if (formData.ancienBudget && formData.nouveauBudget) {
      const ancien = parseFormattedNumber(formData.ancienBudget)
      const nouveau = parseFormattedNumber(formData.nouveauBudget)
      const delta = nouveau - ancien
      return formatNumber(delta)
    }
    return '0,00'
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {isEdit ? 'Modifier l\'avenant' : 'Nouvel avenant de convention'}
        </Typography>
        {avenantToEdit && (
          <Chip
            label={avenantToEdit.statut}
            color={
              avenantToEdit.statut === 'VALIDE' ? 'success' :
              avenantToEdit.statut === 'SOUMIS' ? 'warning' : 'default'
            }
            size="small"
          />
        )}
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <TextField
            label="Numéro d'avenant"
            value={formData.numeroAvenant}
            onChange={(e) => setFormData({ ...formData, numeroAvenant: e.target.value })}
            required
            fullWidth
            disabled={!avenantToEdit?.isEditable && isEdit}
            helperText="Ex: AVE-CONV-001"
          />

          <TextField
            label="Date de l'avenant"
            type="date"
            value={formData.dateAvenant}
            onChange={(e) => setFormData({ ...formData, dateAvenant: e.target.value })}
            required
            fullWidth
            disabled={!avenantToEdit?.isEditable && isEdit}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Objet de l'avenant"
            value={formData.objet}
            onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
            required
            fullWidth
            multiline
            rows={2}
            disabled={!avenantToEdit?.isEditable && isEdit}
            helperText="Décrivez brièvement l'objectif de cet avenant"
          />

          <TextField
            label="Motif / Justification"
            value={formData.motif}
            onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
            fullWidth
            multiline
            rows={3}
            disabled={!avenantToEdit?.isEditable && isEdit}
            helperText="Justification détaillée de l'avenant"
          />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Impacts financiers
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <TextField
              label="Budget actuel"
              value={formData.ancienBudget}
              onChange={handleNumberChange('ancienBudget')}
              onBlur={formatNumberOnBlur('ancienBudget')}
              fullWidth
              disabled={!avenantToEdit?.isEditable && isEdit}
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
            />

            <TextField
              label="Nouveau budget"
              value={formData.nouveauBudget}
              onChange={handleNumberChange('nouveauBudget')}
              onBlur={formatNumberOnBlur('nouveauBudget')}
              fullWidth
              disabled={!avenantToEdit?.isEditable && isEdit}
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
            />

            <TextField
              label="Variation"
              value={calculateDelta()}
              fullWidth
              disabled
              InputProps={{
                endAdornment: <InputAdornment position="end">DH</InputAdornment>,
              }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Taux commission actuel"
              value={formData.ancienTauxCommission}
              onChange={(e) => setFormData({ ...formData, ancienTauxCommission: e.target.value })}
              fullWidth
              type="number"
              disabled={!avenantToEdit?.isEditable && isEdit}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{ step: '0.01', min: '0', max: '100' }}
            />

            <TextField
              label="Nouveau taux commission"
              value={formData.nouveauTauxCommission}
              onChange={(e) => setFormData({ ...formData, nouveauTauxCommission: e.target.value })}
              fullWidth
              type="number"
              disabled={!avenantToEdit?.isEditable && isEdit}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{ step: '0.01', min: '0', max: '100' }}
            />
          </Box>

          <TextField
            label="Détails des modifications"
            value={formData.detailsModifications}
            onChange={(e) => setFormData({ ...formData, detailsModifications: e.target.value })}
            fullWidth
            multiline
            rows={3}
            disabled={!avenantToEdit?.isEditable && isEdit}
            helperText="Description textuelle complète des modifications apportées"
          />

          <TextField
            label="Date d'effet"
            type="date"
            value={formData.dateEffet}
            onChange={(e) => setFormData({ ...formData, dateEffet: e.target.value })}
            fullWidth
            disabled={!avenantToEdit?.isEditable && isEdit}
            InputLabelProps={{ shrink: true }}
            helperText="Date d'entrée en vigueur de l'avenant (optionnel)"
          />

          <TextField
            label="Remarques"
            value={formData.remarques}
            onChange={(e) => setFormData({ ...formData, remarques: e.target.value })}
            fullWidth
            multiline
            rows={2}
            disabled={!avenantToEdit?.isEditable && isEdit}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Close />}
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </Button>

            {(!isEdit || avenantToEdit?.isEditable) && (
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            )}
          </Box>
        </Stack>
      </form>
    </Paper>
  )
}

export default AvenantConventionForm
