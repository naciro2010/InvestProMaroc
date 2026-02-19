import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Stack,
  InputAdornment,
  Divider,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material'
import { CompareArrows } from '@mui/icons-material'
import { conventionsAPI, avenantConventionsAPI } from '@/lib/api'
import AppLayout from '@/components/layout/AppLayout'
import { WizardView } from '@/components/core'
import { Convention } from '@/types/entities'
import FileUpload from '@/components/ui/FileUpload'
import RichTextEditor from '@/components/common/RichTextEditor'
import { colors, typography } from '@/lib/designSystem'
import DecimalInput from '@/components/ui/DecimalInput'

const steps = [
  { label: 'Sélection des modifications' },
  { label: 'Nouvelles valeurs' },
  { label: 'Pièces jointes' },
  { label: 'Récapitulatif' },
]

interface PartenaireAllocation {
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
}

const AvenantForm = () => {
  const { conventionId } = useParams<{ conventionId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [convention, setConvention] = useState<Convention | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [createdAvenantId, setCreatedAvenantId] = useState<number | null>(null)

  // Budget repartition (partenaires)
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
      // Pre-remplir avec valeurs actuelles
      setFormData(prev => ({
        ...prev,
        budget: data.data.budget?.toString() || '',
        tauxCommission: data.data.tauxCommission?.toString() || '',
        baseCalcul: data.data.baseCalcul || '',
        tauxTva: data.data.tauxTva?.toString() || '',
        dateFin: data.data.dateFin || '',
        objetModifie: data.data.objet || '',
      }))
      // Charger la repartition du budget (partenaires)
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
      setActiveStep(prev => prev + 1)
    } catch (err: unknown) {
      console.error('Erreur creation avenant:', err)
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Erreur lors de la creation')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = (): boolean => {
    if (activeStep === 0) {
      return Object.values(selectedFields).some(v => v)
    }
    if (activeStep === 1) {
      return Boolean(formData.numeroAvenant && formData.objet)
    }
    return true
  }

  const handleNext = () => {
    // Step 2 (Pieces jointes): submit if not yet created, otherwise advance
    if (activeStep === 2) {
      if (!createdAvenantId) {
        handleSubmit()
        return
      }
      setActiveStep(prev => prev + 1)
      return
    }
    // Step 3 (Recap / final): navigate back to convention
    if (activeStep === 3) {
      navigate(`/conventions/${conventionId}`)
      return
    }
    // Default: advance to next step
    setActiveStep(prev => prev + 1)
  }

  // Determine the submit label based on current step state
  const getSubmitLabel = (): string => {
    if (activeStep === 2 && !createdAvenantId) return "Creer l'avenant"
    if (activeStep === 3) return 'Terminer'
    return 'Suivant'
  }

  const renderStep1 = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Selectionnez les articles a modifier</Typography>

      {convention && (
        <Alert severity="info">
          <strong>Convention:</strong> {convention.code} - {convention.libelle}
        </Alert>
      )}

      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
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
                  Valeur actuelle: {convention?.dateFin || 'Non definie'}
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
      </Box>
    </Stack>
  )

  const renderStep2 = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Nouvelles valeurs</Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          fullWidth
          required
          label="Numero de l'Avenant"
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

      <RichTextEditor
        label="Objet de l'Avenant"
        value={formData.objet}
        onChange={(value) => setFormData({ ...formData, objet: value })}
        placeholder="Description de l'avenant..."
        required
        minHeight={100}
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
            <DecimalInput
              required
              label="Nouvelle valeur"
              value={Number(formData.budget) || 0}
              onChange={(value) => setFormData({ ...formData, budget: String(value) })}
              decimalPlaces={2}
              min={0}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
              }}
            />
          </Stack>

          {/* Repartition actuelle du budget */}
          {partenaires.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: colors.neutral[25], border: `1px solid ${colors.neutral[200]}`, borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
                Repartition actuelle du budget par partenaire
              </Typography>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', '& th, & td': { px: 1.5, py: 0.75, fontSize: typography.sizes.sm, borderBottom: `1px solid ${colors.neutral[100]}` } }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontWeight: 600, color: colors.textSecondary }}>Partenaire</th>
                    <th style={{ textAlign: 'right', fontWeight: 600, color: colors.textSecondary }}>Budget alloue</th>
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
                    <td>Total alloue</td>
                    <td style={{ textAlign: 'right' }}>{partenaires.reduce((s, p) => s + (p.budgetAlloue || 0), 0).toLocaleString('fr-FR')} MAD</td>
                    <td style={{ textAlign: 'right' }}>{partenaires.reduce((s, p) => s + (p.pourcentage || 0), 0).toFixed(1)}%</td>
                  </tr>
                </tbody>
              </Box>
              <Alert severity="info" sx={{ mt: 1.5 }}>
                Apres validation de l'avenant, pensez a mettre a jour la repartition du budget entre les partenaires depuis la page de detail de la convention.
              </Alert>
            </Box>
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
            <DecimalInput
              required
              label="Nouvelle valeur"
              value={Number(formData.tauxCommission) || 0}
              onChange={(value) => setFormData({ ...formData, tauxCommission: String(value) })}
              decimalPlaces={2}
              min={0}
              max={100}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
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
              <MenuItem value="DECAISSEMENTS_TTC">Decaissements TTC</MenuItem>
              <MenuItem value="DECAISSEMENTS_HT">Decaissements HT</MenuItem>
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
              value={convention?.dateFin || 'Non definie'}
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
        <RichTextEditor
          label="Nouvel Objet de la Convention"
          value={formData.objetModifie}
          onChange={(value) => setFormData({ ...formData, objetModifie: value })}
          placeholder="Nouvel objet de la convention..."
          minHeight={120}
        />
      )}

      <RichTextEditor
        label="Justification"
        value={formData.justification}
        onChange={(value) => setFormData({ ...formData, justification: value })}
        placeholder="Justification des modifications..."
        minHeight={120}
      />
    </Stack>
  )

  const renderStep3 = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pieces jointes de l'avenant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ajoutez les documents justificatifs de l'avenant (signatures, decisions, etc.)
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
        Avenant cree avec succes !
      </Alert>
      <Typography variant="h6" gutterBottom>
        Recapitulatif
      </Typography>
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2">
          <strong>Numero:</strong> {formData.numeroAvenant}
        </Typography>
        <Typography variant="body2">
          <strong>Date:</strong> {new Date(formData.dateAvenant).toLocaleDateString('fr-FR')}
        </Typography>
        <Typography variant="body2">
          <strong>Objet:</strong> {formData.objet}
        </Typography>
      </Box>
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

  return (
    <AppLayout>
      {error && (
        <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
          {error}
        </Alert>
      )}

      <WizardView
        breadcrumbs={[
          { label: 'Conventions', path: '/conventions' },
          { label: convention?.code || '', path: `/conventions/${conventionId}` },
          { label: 'Nouvel Avenant' },
        ]}
        steps={steps}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        onBack={() => setActiveStep(s => s - 1)}
        onNext={handleNext}
        onCancel={() => navigate(`/conventions/${conventionId}`)}
        isNextDisabled={!canProceed()}
        isSubmitting={loading}
        submitLabel={getSubmitLabel()}
      >
        {renderStepContent()}
      </WizardView>
    </AppLayout>
  )
}

export default AvenantForm
