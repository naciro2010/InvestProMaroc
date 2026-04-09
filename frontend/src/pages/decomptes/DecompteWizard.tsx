import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import { WizardView } from '@/components/core'
import { useToast } from '@/contexts/ToastContext'
import { decomptesAPI, marchesAPI, cascadeAPI } from '../../lib/api'
import type { MarcheSummaryDTO } from '../../lib/api'
import { StepInfoGenerales, StepMontantsRetenues, StepConfirmation } from './wizard'
import type { DecompteFormData, Marche, Retenue } from './wizard'
import { createInitialFormData } from './wizard'

const steps = ['Informations generales', 'Montants & Retenues', 'Pieces jointes & Confirmation']

const DecompteWizard = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { marcheId: routeMarcheId } = useParams<{ marcheId: string }>()
  const prefilledMarcheId = routeMarcheId ? parseInt(routeMarcheId) : null
  const [activeStep, setActiveStep] = useState(0)
  const [marches, setMarches] = useState<Marche[]>([])
  const [loadingMarches, setLoadingMarches] = useState(true)
  const [marcheSummary, setMarcheSummary] = useState<MarcheSummaryDTO | null>(null)
  const [formData, setFormData] = useState<DecompteFormData>(createInitialFormData(prefilledMarcheId))

  useEffect(() => {
    setLoadingMarches(true)
    marchesAPI.getAll()
      .then(res => setMarches(res.data.data || []))
      .catch(() => showToast('Erreur lors du chargement des marches', 'error'))
      .finally(() => setLoadingMarches(false))
  }, [])

  useEffect(() => {
    const marcheId = formData.marcheId
    if (marcheId) {
      cascadeAPI.getMarcheSummary(marcheId)
        .then(res => {
          const summary = res.data.data ?? null
          setMarcheSummary(summary)
          if (summary) setFormData(prev => ({ ...prev, tauxTVA: summary.tauxTva }))
        })
        .catch(() => setMarcheSummary(null))
    } else { setMarcheSummary(null) }
  }, [formData.marcheId])

  useEffect(() => {
    const brutHT = formData.montantBrutHT || 0
    const tva = formData.tauxTVA || 0
    const montantTVA = brutHT * (tva / 100)
    const montantTTC = brutHT + montantTVA
    const totalRetenues = formData.retenues.reduce((sum, r) => sum + (r.montant || 0), 0)
    setFormData(prev => ({ ...prev, montantTVA, montantTTC, totalRetenues, netAPayer: montantTTC - totalRetenues }))
  }, [formData.montantBrutHT, formData.tauxTVA, formData.retenues])

  const createMutation = useMutation({
    mutationFn: async (data: DecompteFormData) => {
      const payload = {
        code: data.numeroDecompte, montant: data.montantTTC, netAPayer: data.netAPayer,
        retenues: data.totalRetenues, dateDecompte: data.dateDecompte,
        marcheId: data.marcheId || undefined, status: data.statut, observation: data.observations,
      }
      return await decomptesAPI.create(payload)
    },
    onSuccess: () => navigate(prefilledMarcheId ? `/marches/${prefilledMarcheId}` : '/marches'),
  })

  const handleChange = (field: keyof DecompteFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({
      ...formData,
      [field]: field === 'marcheId' ? (value ? Number(value) : null)
        : field === 'montantBrutHT' || field === 'tauxTVA' ? (parseFloat(value) || 0)
        : value
    })
  }

  const onFormDataChange = (updates: Partial<DecompteFormData>) => setFormData(prev => ({ ...prev, ...updates }))

  const addRetenue = () => setFormData(prev => ({
    ...prev, retenues: [...prev.retenues, { type: 'RG', montant: 0, description: '' }],
  }))

  const updateRetenue = (index: number, field: keyof Retenue, value: string | number) => {
    const newRetenues = [...formData.retenues]
    newRetenues[index] = { ...newRetenues[index], [field]: field === 'montant' ? (typeof value === 'number' ? value : parseFloat(value) || 0) : value }
    setFormData({ ...formData, retenues: newRetenues })
  }

  const removeRetenue = (index: number) => setFormData(prev => ({
    ...prev, retenues: prev.retenues.filter((_, i) => i !== index),
  }))

  const handleNext = () => {
    if (activeStep === steps.length - 1) createMutation.mutate(formData)
    else setActiveStep(prev => prev + 1)
  }

  const isStepValid = () => {
    switch (activeStep) {
      case 0: return formData.numeroDecompte && formData.marcheId && formData.dateDecompte && formData.periodeDebut && formData.periodeFin
      case 1: return formData.montantBrutHT > 0 && formData.totalRetenues <= formData.montantTTC && formData.netAPayer >= 0
      case 2: return true
      default: return false
    }
  }

  const renderStep = () => {
    switch (activeStep) {
      case 0: return <StepInfoGenerales formData={formData} marches={marches} marcheSummary={marcheSummary}
        prefilledMarcheId={prefilledMarcheId} onChange={handleChange} onFormDataChange={onFormDataChange} />
      case 1: return <StepMontantsRetenues formData={formData} onFormDataChange={onFormDataChange}
        onAddRetenue={addRetenue} onUpdateRetenue={updateRetenue} onRemoveRetenue={removeRetenue} />
      case 2: return <StepConfirmation formData={formData} marches={marches} onFormDataChange={onFormDataChange}
        error={createMutation.error} />
      default: return null
    }
  }

  return (
    <AppLayout>
      <WizardView
        breadcrumbs={[{ label: 'Decomptes', path: '/decomptes' }, { label: 'Nouveau' }]}
        steps={steps.map(label => ({ label }))}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        onBack={() => setActiveStep(s => s - 1)}
        onNext={handleNext}
        onCancel={() => navigate(prefilledMarcheId ? `/marches/${prefilledMarcheId}` : '/decomptes')}
        isNextDisabled={!isStepValid() || createMutation.isPending || loadingMarches}
        isSubmitting={createMutation.isPending}
        submitLabel="Creer le decompte"
      >
        {renderStep()}
      </WizardView>
    </AppLayout>
  )
}

export default DecompteWizard
