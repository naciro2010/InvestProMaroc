import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import { WizardView } from '@/components/core'
import { marchesAPI, conventionsAPI, fournisseursAPI, cascadeAPI } from '../../lib/api'
import { useToast } from '@/contexts/ToastContext'
import type { ConventionSummaryDTO, FournisseurSummaryDTO } from '../../lib/api'
import { StepInfoGenerales, StepMontantsDates, StepLocalisation } from './wizard'
import type { MarcheFormData, Convention, Fournisseur, ApiErrorResponse } from './wizard'
import { INITIAL_FORM_DATA } from './wizard'

const steps = ['Informations générales', 'Montants & Dates', 'Localisation & Confirmation']

const MarcheWizard = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [activeStep, setActiveStep] = useState(0)
  const [conventions, setConventions] = useState<Convention[]>([])
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])
  const [conventionSummary, setConventionSummary] = useState<ConventionSummaryDTO | null>(null)
  const [fournisseurSummary, setFournisseurSummary] = useState<FournisseurSummaryDTO | null>(null)
  const [formData, setFormData] = useState<MarcheFormData>(INITIAL_FORM_DATA)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true)
      try {
        const [convRes, fournRes] = await Promise.all([conventionsAPI.getAll(), fournisseursAPI.getAll()])
        setConventions(convRes.data.data || [])
        setFournisseurs(fournRes.data.data || [])
      } catch {
        showToast('Erreur lors du chargement des donnees', 'error')
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (formData.conventionId) {
      cascadeAPI.getConventionSummary(formData.conventionId)
        .then(res => setConventionSummary(res.data.data ?? null))
        .catch(() => setConventionSummary(null))
    } else { setConventionSummary(null) }
  }, [formData.conventionId])

  useEffect(() => {
    if (formData.fournisseurId) {
      cascadeAPI.getFournisseurSummary(formData.fournisseurId)
        .then(res => setFournisseurSummary(res.data.data ?? null))
        .catch(() => setFournisseurSummary(null))
    } else { setFournisseurSummary(null) }
  }, [formData.fournisseurId])

  useEffect(() => {
    const montantTVA = formData.montantHT * (formData.tauxTVA / 100)
    setFormData(prev => ({ ...prev, montantTTC: formData.montantHT + montantTVA }))
  }, [formData.montantHT, formData.tauxTVA])

  const createMutation = useMutation({
    mutationFn: async (data: MarcheFormData) => {
      const payload = {
        code: data.code, numeroMarche: data.numeroMarche, numAo: data.numAO || null,
        objet: data.objet, objetRich: data.objetRich, typeMarche: data.typeMarche,
        naturePrestation: data.naturePrestation, fournisseurId: data.fournisseurId,
        conventionId: data.conventionId, montantHt: data.montantHT, montantTtc: data.montantTTC,
        tauxTva: data.tauxTVA, tauxPenalite: data.tauxPenalite, dateSignature: data.dateSignature,
        dateNotification: data.dateNotification, dateOrdreService: data.dateOrdreService || null,
        delaiExecutionMois: data.delaiExecution, adresse: data.adresse || null,
        latitude: data.latitude, longitude: data.longitude, zoneGeographique: data.zoneGeographique || null,
      }
      return await marchesAPI.create(payload)
    },
    onSuccess: () => navigate('/marches'),
  })

  const handleChange = (field: keyof MarcheFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({
      ...formData,
      [field]: field === 'fournisseurId' || field === 'conventionId' || field === 'delaiExecution'
        ? value ? Number(value) : null
        : field === 'montantHT' || field === 'montantTTC' || field === 'tauxTVA' || field === 'tauxPenalite'
        ? parseFloat(value) || 0
        : field === 'latitude' || field === 'longitude'
        ? value ? parseFloat(value) : null
        : value
    })
  }

  const onFormDataChange = (updates: Partial<MarcheFormData>) => setFormData(prev => ({ ...prev, ...updates }))

  const handleNext = () => {
    if (activeStep === steps.length - 1) createMutation.mutate(formData)
    else setActiveStep(prev => prev + 1)
  }

  const isStepValid = () => {
    switch (activeStep) {
      case 0: return formData.code && formData.numeroMarche && formData.objetRich && formData.fournisseurId
      case 1: return formData.montantHT > 0 && formData.montantTTC > 0 && formData.montantTTC >= formData.montantHT && (!formData.dateNotification || !formData.dateSignature || formData.dateNotification >= formData.dateSignature)
      case 2: return true
      default: return false
    }
  }

  const getErrorMessage = (): string => {
    if (!createMutation.error) return ''
    const err = createMutation.error as ApiErrorResponse
    return err.response?.data?.message || 'Erreur lors de la création du marché'
  }

  const renderStep = () => {
    switch (activeStep) {
      case 0: return <StepInfoGenerales formData={formData} conventions={conventions} fournisseurs={fournisseurs}
        conventionSummary={conventionSummary} fournisseurSummary={fournisseurSummary} onChange={handleChange} onFormDataChange={onFormDataChange} />
      case 1: return <StepMontantsDates formData={formData} onChange={handleChange} onFormDataChange={onFormDataChange} />
      case 2: return <StepLocalisation formData={formData} fournisseurs={fournisseurs} onChange={handleChange} onFormDataChange={onFormDataChange} />
      default: return null
    }
  }

  return (
    <AppLayout>
      <WizardView
        breadcrumbs={[{ label: 'Marchés', path: '/marches' }, { label: 'Nouveau' }]}
        steps={steps.map(label => ({ label }))}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        onBack={() => setActiveStep(s => s - 1)}
        onNext={handleNext}
        onCancel={() => navigate('/marches')}
        isNextDisabled={!isStepValid() || loadingData}
        isSubmitting={createMutation.isPending}
        submitLabel="Créer le marché"
      >
        {renderStep()}
        {createMutation.error && <Alert severity="error" sx={{ mt: 3 }}>{getErrorMessage()}</Alert>}
      </WizardView>
    </AppLayout>
  )
}

export default MarcheWizard
