import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Alert } from '@mui/material'
import { conventionsAPI, avenantConventionsAPI } from '@/lib/api'
import AppLayout from '@/components/layout/AppLayout'
import { WizardView } from '@/components/core'
import { Convention } from '@/types/entities'
import FileUpload from '@/components/ui/FileUpload'
import {
  AvenantStepFieldSelection,
  AvenantStepValues,
  type SelectedFields,
  type AvenantFormData,
  type PartenaireAllocation,
} from './avenant'

const STEPS = [
  { label: 'Selection des modifications' },
  { label: 'Nouvelles valeurs' },
  { label: 'Pieces jointes' },
  { label: 'Recapitulatif' },
]

const AvenantForm = () => {
  const { conventionId } = useParams<{ conventionId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [convention, setConvention] = useState<Convention | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [createdAvenantId, setCreatedAvenantId] = useState<number | null>(null)
  const [partenaires, setPartenaires] = useState<PartenaireAllocation[]>([])

  const [selectedFields, setSelectedFields] = useState<SelectedFields>({
    montant: false, budget: false, tauxCommission: false,
    baseCalcul: false, tauxTva: false, dateFin: false, objet: false,
  })

  const [formData, setFormData] = useState<AvenantFormData>({
    numeroAvenant: '', dateAvenant: new Date().toISOString().split('T')[0],
    objet: '', budget: '', tauxCommission: '', baseCalcul: '',
    tauxTva: '', dateFin: '', objetModifie: '', justification: '',
  })

  useEffect(() => { if (conventionId) loadConvention() }, [conventionId])

  const loadConvention = async () => {
    try {
      const { data } = await conventionsAPI.getById(Number(conventionId))
      setConvention(data.data)
      setFormData((prev) => ({
        ...prev,
        budget: data.data.budget?.toString() || '',
        tauxCommission: data.data.tauxCommission?.toString() || '',
        baseCalcul: data.data.baseCalcul || '',
        tauxTva: data.data.tauxTva?.toString() || '',
        dateFin: data.data.dateFin || '',
        objetModifie: data.data.objet || '',
      }))
      try {
        const partRes = await conventionsAPI.getPartenaires(Number(conventionId))
        const partData = partRes.data.data || partRes.data || []
        setPartenaires(Array.isArray(partData) ? partData : [])
      } catch { setPartenaires([]) }
    } catch {
      setError('Impossible de charger la convention')
    }
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const modifications: Record<string, string | number> = {}
      if (selectedFields.budget) modifications.budget = parseFloat(formData.budget)
      if (selectedFields.tauxCommission) modifications.tauxCommission = parseFloat(formData.tauxCommission)
      if (selectedFields.baseCalcul) modifications.baseCalcul = formData.baseCalcul
      if (selectedFields.tauxTva) modifications.tauxTva = parseFloat(formData.tauxTva)
      if (selectedFields.dateFin) modifications.dateFin = formData.dateFin
      if (selectedFields.objet) modifications.objet = formData.objetModifie

      const { data } = await avenantConventionsAPI.create({
        conventionId: Number(conventionId),
        numeroAvenant: formData.numeroAvenant,
        dateAvenant: formData.dateAvenant,
        objet: formData.objet,
        modifications,
        justification: formData.justification,
      })
      setCreatedAvenantId(data.data.id)
      setActiveStep((prev) => prev + 1)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Erreur lors de la creation')
    } finally { setLoading(false) }
  }

  const canProceed = (): boolean => {
    if (activeStep === 0) return Object.values(selectedFields).some((v) => v)
    if (activeStep === 1) return Boolean(formData.numeroAvenant && formData.objet)
    return true
  }

  const handleNext = () => {
    if (activeStep === 2) {
      if (!createdAvenantId) { handleSubmit(); return }
      setActiveStep((prev) => prev + 1); return
    }
    if (activeStep === 3) { navigate(`/conventions/${conventionId}`); return }
    setActiveStep((prev) => prev + 1)
  }

  const getSubmitLabel = (): string => {
    if (activeStep === 2 && !createdAvenantId) return "Creer l'avenant"
    if (activeStep === 3) return 'Terminer'
    return 'Suivant'
  }

  return (
    <AppLayout>
      {error && <Alert severity="error" sx={{ mx: 3, mt: 2 }}>{error}</Alert>}
      <WizardView
        breadcrumbs={[
          { label: 'Conventions', path: '/conventions' },
          { label: convention?.code || '', path: `/conventions/${conventionId}` },
          { label: 'Nouvel Avenant' },
        ]}
        steps={STEPS}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        onBack={() => setActiveStep((s) => s - 1)}
        onNext={handleNext}
        onCancel={() => navigate(`/conventions/${conventionId}`)}
        isNextDisabled={!canProceed()}
        isSubmitting={loading}
        submitLabel={getSubmitLabel()}
      >
        {activeStep === 0 && (
          <AvenantStepFieldSelection
            convention={convention}
            selectedFields={selectedFields}
            onFieldChange={setSelectedFields}
          />
        )}
        {activeStep === 1 && (
          <AvenantStepValues
            convention={convention}
            selectedFields={selectedFields}
            formData={formData}
            partenaires={partenaires}
            onFormChange={setFormData}
          />
        )}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Pieces jointes de l'avenant</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ajoutez les documents justificatifs de l'avenant
            </Typography>
            <FileUpload typeEntite="AVENANT" entiteId={createdAvenantId} maxFiles={10} maxFileSize={10} />
          </Box>
        )}
        {activeStep === 3 && (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>Avenant cree avec succes !</Alert>
            <Typography variant="h6" gutterBottom>Recapitulatif</Typography>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2"><strong>Numero:</strong> {formData.numeroAvenant}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {new Date(formData.dateAvenant).toLocaleDateString('fr-FR')}</Typography>
              <Typography variant="body2"><strong>Objet:</strong> {formData.objet}</Typography>
            </Box>
          </Box>
        )}
      </WizardView>
    </AppLayout>
  )
}

export default AvenantForm
