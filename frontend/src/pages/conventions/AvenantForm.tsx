import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Stack,
  InputAdornment,
  Divider,
  Checkbox,
  FormControlLabel,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import { ArrowBack, Save, CompareArrows } from '@mui/icons-material'
import { conventionsAPI, avenantConventionsAPI } from '@/lib/api'
import AppLayout from '@/components/layout/AppLayout'
import { Convention } from '@/types/entities'
import FileUpload from '@/components/ui/FileUpload'
import { colors, typography } from '@/lib/designSystem'

const steps = ['Sélection des modifications', 'Nouvelles valeurs', 'Pièces jointes', 'Récapitulatif']

const AvenantForm = () => {
  const { conventionId } = useParams<{ conventionId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [convention, setConvention] = useState<Convention | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [createdAvenantId, setCreatedAvenantId] = useState<number | null>(null)

  // Budget répartition (partenaires)
  interface PartenaireAllocation {
    partenaireNom: string
    partenaireSigle: string | null
    budgetAlloue: number
    pourcentage: number
  }
  const [partenaires, setPartenaires] = useState<PartenaireAllocation[]>([])

  // Champs modifiables
  const [selectedFields, setSelectedFields] = useState({
    montant: false,
    budget: false,
    tauxCommission: false,
    baseCalcul: false,
    tauxTva: false,
    dateFin: false,
    objet: false,
  })

  const [formData, setFormData] = useState({
    numeroAvenant: '',
    dateAvenant: new Date().toISOString().split('T')[0],
    objet: '',
    // Nouvelles valeurs
    budget: '',
    tauxCommission: '',
    baseCalcul: '',
    tauxTva: '',
    dateFin: '',
    objetModifie: '',
    justification: '',
  })

  useEffect(() => {
    if (conventionId) {
      loadConvention()
    }
  }, [conventionId])

  const loadConvention = async () => {
    try {
      const { data } = await conventionsAPI.getById(Number(conventionId))
      setConvention(data.data)
      // Pré-remplir avec valeurs actuelles
      setFormData(prev => ({
        ...prev,
        budget: data.data.budget?.toString() || '',
        tauxCommission: data.data.tauxCommission?.toString() || '',
        baseCalcul: data.data.baseCalcul || '',
        tauxTva: data.data.tauxTva?.toString() || '',
        dateFin: data.data.dateFin || '',
        objetModifie: data.data.objet || '',
      }))
      // Charger la répartition du budget (partenaires)
      try {
        const partRes = await conventionsAPI.getPartenaires(Number(conventionId))
        const partData = partRes.data.data || partRes.data || []
        setPartenaires(Array.isArray(partData) ? partData : [])
      } catch {
        setPartenaires([])
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur chargement convention:', msg)
      setError('Impossible de charger la convention')
    }
  }

  const handleNext = () => {
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      // Construire l'objet modifications
      const modifications: Record<string, string | number> = {}
      if (selectedFields.budget) modifications.budget = parseFloat(formData.budget)
      if (selectedFields.tauxCommission) modifications.tauxCommission = parseFloat(formData.tauxCommission)
      if (selectedFields.baseCalcul) modifications.baseCalcul = formData.baseCalcul
      if (selectedFields.tauxTva) modifications.tauxTva = parseFloat(formData.tauxTva)
      if (selectedFields.dateFin) modifications.dateFin = formData.dateFin
      if (selectedFields.objet) modifications.objet = formData.objetModifie

      const payload = {
        conventionId: Number(conventionId),
        numeroAvenant: formData.numeroAvenant,
        dateAvenant: formData.dateAvenant,
        objet: formData.objet,
        modifications,
        justification: formData.justification,
      }

      const { data } = await avenantConventionsAPI.create(payload)
      setCreatedAvenantId(data.data.id)
      handleNext()
    } catch (err: unknown) {
      console.error('Erreur création avenant:', err)
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Sélectionnez les articles à modifier</Typography>

      {convention && (
        <Alert severity="info">
          <strong>Convention:</strong> {convention.code} - {convention.libelle}
        </Alert>
      )}

      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFields.budget}
                onChange={(e) => setSelectedFields({ ...selectedFields, budget: e.target.checked })}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Budget</Typography>
                <Typography variant="caption" color="text.secondary">
                  Valeur actuelle: {convention?.budget?.toLocaleString('fr-FR')} MAD
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFields.tauxCommission}
                onChange={(e) => setSelectedFields({ ...selectedFields, tauxCommission: e.target.checked })}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Taux de Commission</Typography>
                <Typography variant="caption" color="text.secondary">
                  Valeur actuelle: {convention?.tauxCommission} %
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFields.baseCalcul}
                onChange={(e) => setSelectedFields({ ...selectedFields, baseCalcul: e.target.checked })}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Base de Calcul</Typography>
                <Typography variant="caption" color="text.secondary">
                  Valeur actuelle: {convention?.baseCalcul}
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFields.tauxTva}
                onChange={(e) => setSelectedFields({ ...selectedFields, tauxTva: e.target.checked })}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Taux de TVA</Typography>
                <Typography variant="caption" color="text.secondary">
                  Valeur actuelle: {convention?.tauxTva} %
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFields.dateFin}
                onChange={(e) => setSelectedFields({ ...selectedFields, dateFin: e.target.checked })}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Date de Fin</Typography>
                <Typography variant="caption" color="text.secondary">
                  Valeur actuelle: {convention?.dateFin || 'Non définie'}
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFields.objet}
                onChange={(e) => setSelectedFields({ ...selectedFields, objet: e.target.checked })}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Objet de la Convention</Typography>
                <Typography variant="caption" color="text.secondary">
                  Modifier la description
                </Typography>
              </Box>
            }
          />
        </Stack>
      </Paper>
    </Stack>
  )

  const renderStep2 = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Nouvelles valeurs</Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          required
          label="Numéro de l'Avenant"
          value={formData.numeroAvenant}
          onChange={(e) => setFormData({ ...formData, numeroAvenant: e.target.value })}
          placeholder="AV-001"
        />
        <TextField
          fullWidth
          required
          type="date"
          label="Date de l'Avenant"
          value={formData.dateAvenant}
          onChange={(e) => setFormData({ ...formData, dateAvenant: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <TextField
        fullWidth
        required
        multiline
        rows={2}
        label="Objet de l'Avenant"
        value={formData.objet}
        onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
        placeholder="Description de l'avenant..."
      />

      <Divider />

      {selectedFields.budget && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            <CompareArrows sx={{ mr: 1, verticalAlign: 'middle' }} />
            Budget
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Valeur actuelle"
              value={convention?.budget?.toLocaleString('fr-FR')}
              disabled
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
              }}
            />
            <Typography>→</Typography>
            <TextField
              required
              type="number"
              label="Nouvelle valeur"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
                inputProps: { step: '0.01', min: '0' }
              }}
            />
          </Stack>

          {/* Répartition actuelle du budget */}
          {partenaires.length > 0 && (
            <Paper sx={{ mt: 2, p: 2, bgcolor: colors.neutral[25], border: `1px solid ${colors.neutral[200]}`, borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
                Répartition actuelle du budget par partenaire
              </Typography>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', '& th, & td': { px: 1.5, py: 0.75, fontSize: typography.sizes.sm, borderBottom: `1px solid ${colors.neutral[100]}` } }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontWeight: 600, color: colors.textSecondary }}>Partenaire</th>
                    <th style={{ textAlign: 'right', fontWeight: 600, color: colors.textSecondary }}>Budget alloué</th>
                    <th style={{ textAlign: 'right', fontWeight: 600, color: colors.textSecondary }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {partenaires.map((p, idx) => (
                    <tr key={idx}>
                      <td>{p.partenaireSigle || p.partenaireNom}</td>
                      <td style={{ textAlign: 'right' }}>{p.budgetAlloue?.toLocaleString('fr-FR')} MAD</td>
                      <td style={{ textAlign: 'right' }}>{p.pourcentage?.toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 600 }}>
                    <td>Total alloué</td>
                    <td style={{ textAlign: 'right' }}>{partenaires.reduce((s, p) => s + (p.budgetAlloue || 0), 0).toLocaleString('fr-FR')} MAD</td>
                    <td style={{ textAlign: 'right' }}>{partenaires.reduce((s, p) => s + (p.pourcentage || 0), 0).toFixed(1)}%</td>
                  </tr>
                </tbody>
              </Box>
              <Alert severity="info" sx={{ mt: 1.5 }}>
                Apres validation de l'avenant, pensez a mettre a jour la répartition du budget entre les partenaires depuis la page de détail de la convention.
              </Alert>
            </Paper>
          )}
        </Box>
      )}

      {selectedFields.tauxCommission && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            <CompareArrows sx={{ mr: 1, verticalAlign: 'middle' }} />
            Taux de Commission
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Valeur actuelle"
              value={convention?.tauxCommission}
              disabled
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
            <Typography>→</Typography>
            <TextField
              required
              type="number"
              label="Nouvelle valeur"
              value={formData.tauxCommission}
              onChange={(e) => setFormData({ ...formData, tauxCommission: e.target.value })}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                inputProps: { step: '0.01', min: '0', max: '100' }
              }}
            />
          </Stack>
        </Box>
      )}

      {selectedFields.baseCalcul && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            <CompareArrows sx={{ mr: 1, verticalAlign: 'middle' }} />
            Base de Calcul
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Valeur actuelle"
              value={convention?.baseCalcul}
              disabled
              size="small"
              sx={{ flex: 1 }}
            />
            <Typography>→</Typography>
            <TextField
              required
              select
              label="Nouvelle valeur"
              value={formData.baseCalcul}
              onChange={(e) => setFormData({ ...formData, baseCalcul: e.target.value })}
              size="small"
              sx={{ flex: 1 }}
            >
              <MenuItem value="DECAISSEMENTS_TTC">Décaissements TTC</MenuItem>
              <MenuItem value="DECAISSEMENTS_HT">Décaissements HT</MenuItem>
            </TextField>
          </Stack>
        </Box>
      )}

      {selectedFields.dateFin && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            <CompareArrows sx={{ mr: 1, verticalAlign: 'middle' }} />
            Date de Fin
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Valeur actuelle"
              value={convention?.dateFin || 'Non définie'}
              disabled
              size="small"
              sx={{ flex: 1 }}
            />
            <Typography>→</Typography>
            <TextField
              required
              type="date"
              label="Nouvelle valeur"
              value={formData.dateFin}
              onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
              size="small"
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Box>
      )}

      {selectedFields.objet && (
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Nouvel Objet de la Convention"
          value={formData.objetModifie}
          onChange={(e) => setFormData({ ...formData, objetModifie: e.target.value })}
        />
      )}

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Justification"
        value={formData.justification}
        onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
        placeholder="Justification des modifications..."
      />
    </Stack>
  )

  const renderStep3 = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pièces jointes de l'avenant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ajoutez les documents justificatifs de l'avenant (signatures, décisions, etc.)
      </Typography>
      <FileUpload
        typeEntite="AVENANT"
        entiteId={createdAvenantId}
        maxFiles={10}
        maxFileSize={10}
      />
    </Box>
  )

  const renderStep4 = () => (
    <Box>
      <Alert severity="success" sx={{ mb: 3 }}>
        Avenant créé avec succès !
      </Alert>
      <Typography variant="h6" gutterBottom>
        Récapitulatif
      </Typography>
      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="body2">
          <strong>Numéro:</strong> {formData.numeroAvenant}
        </Typography>
        <Typography variant="body2">
          <strong>Date:</strong> {new Date(formData.dateAvenant).toLocaleDateString('fr-FR')}
        </Typography>
        <Typography variant="body2">
          <strong>Objet:</strong> {formData.objet}
        </Typography>
      </Paper>
    </Box>
  )

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderStep1()
      case 1:
        return renderStep2()
      case 2:
        return renderStep3()
      case 3:
        return renderStep4()
      default:
        return null
    }
  }

  const canProceed = () => {
    if (activeStep === 0) {
      return Object.values(selectedFields).some(v => v)
    }
    if (activeStep === 1) {
      return formData.numeroAvenant && formData.objet
    }
    return true
  }

  return (
    <AppLayout>
      <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/conventions/${conventionId}`)}
            sx={{ mr: 2 }}
          >
            Retour
          </Button>
          <Typography variant="h5" fontWeight="bold">
            Nouvel Avenant
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Paper sx={{ p: 4, mb: 3 }}>
          {renderStepContent()}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
          >
            Précédent
          </Button>

          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => navigate(`/conventions/${conventionId}`)}
              >
                Terminer
              </Button>
            ) : activeStep === steps.length - 2 ? (
              <Button
                variant="contained"
                onClick={createdAvenantId ? handleNext : handleSubmit}
                disabled={!canProceed() || loading}
                startIcon={<Save />}
              >
                {loading ? 'Enregistrement...' : createdAvenantId ? 'Suivant' : 'Créer l\'avenant'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Suivant
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </AppLayout>
  )
}

export default AvenantForm
