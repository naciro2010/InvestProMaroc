import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import { WizardView } from '@/components/core'
import { useToast } from '@/contexts/ToastContext'
import { decomptesAPI, marchesAPI, cascadeAPI } from '../../lib/api'
import type { MarcheSummaryDTO } from '../../lib/api'
import { StepInfoGenerales, StepMontantsRetenues, StepConfirmation, DecompteLiveSummary } from './wizard'
import type { DecompteFormData, Marche, Retenue } from './wizard'
import { createInitialFormData } from './wizard'

const steps = ['Marché et période', 'Montants et retenues', 'Confirmation']

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
      .catch(() => showToast('Erreur lors du chargement des marchés', 'error'))
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
        marche: { id: data.marcheId },
        numeroDecompte: data.numeroDecompte,
        dateDecompte: data.dateDecompte,
        periodeDebut: data.periodeDebut,
        periodeFin: data.periodeFin,
        montantBrutHT: data.montantBrutHT,
        montantTVA: data.montantTVA,
        observations: data.observations || null,
        statut: 'BROUILLON',
        retenues: data.retenues.map(r => ({
          typeRetenue: r.type,
          montant: r.montant,
          description: r.description || null,
          actif: true,
        })),
      }
      return await decomptesAPI.create(payload)
    },
    onSuccess: (_res, data) => {
      showToast('Décompte enregistré en brouillon', 'success')
      navigate(data.marcheId ? `/marches/${data.marcheId}?tab=situation` : '/decomptes')
    },
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
    ...prev, retenues: [...prev.retenues, { type: 'GARANTIE', montant: 0, description: '' }],
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

  // Validation bloquante de l'étape « Montants et retenues »
  const montantsErrors: string[] = []
  if (!(formData.montantBrutHT > 0)) montantsErrors.push('Saisissez le montant brut HT.')
  if (formData.netAPayer < 0) montantsErrors.push('Les retenues dépassent le montant TTC.')
  if (marcheSummary && marcheSummary.montantHT > 0
    && marcheSummary.cumulDecomptesHT + (formData.montantBrutHT || 0) > marcheSummary.montantHT + 0.005) {
    montantsErrors.push('Le cumul des décomptes dépasse le montant HT du marché.')
  }

  const isStepValid = () => {
    switch (activeStep) {
      case 0: return formData.numeroDecompte && formData.marcheId && formData.dateDecompte && formData.periodeDebut && formData.periodeFin
      case 1: return montantsErrors.length === 0 && formData.totalRetenues <= formData.montantTTC
      case 2: return true
      default: return false
    }
  }

  const tauxRetenueGarantie = marches.find(m => m.id === formData.marcheId)?.retenueGarantie ?? null

  const renderStep = () => {
    switch (activeStep) {
      case 0: return <StepInfoGenerales formData={formData} marches={marches} marcheSummary={marcheSummary}
        prefilledMarcheId={prefilledMarcheId} onChange={handleChange} onFormDataChange={onFormDataChange} />
      case 1: return <StepMontantsRetenues formData={formData} onFormDataChange={onFormDataChange}
        onAddRetenue={addRetenue} onUpdateRetenue={updateRetenue} onRemoveRetenue={removeRetenue}
        tauxRetenueGarantie={tauxRetenueGarantie} errors={formData.montantBrutHT > 0 || formData.retenues.length > 0 ? montantsErrors : []} />
      case 2: return <StepConfirmation formData={formData} marches={marches} onFormDataChange={onFormDataChange}
        error={createMutation.error} />
      default: return null
    }
  }

  return (
    <AppLayout>
      <WizardView
        breadcrumbs={[{ label: 'Décomptes', path: '/decomptes' }, { label: 'Nouveau décompte' }]}
        steps={steps.map(label => ({ label }))}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        onBack={() => setActiveStep(s => s - 1)}
        onNext={handleNext}
        onCancel={() => navigate(prefilledMarcheId ? `/marches/${prefilledMarcheId}` : '/decomptes')}
        isNextDisabled={!isStepValid() || createMutation.isPending || loadingMarches}
        isSubmitting={createMutation.isPending}
        submitLabel="Enregistrer le décompte"
        aside={<DecompteLiveSummary formData={formData} marcheSummary={marcheSummary} />}
      >
        {renderStep()}
      </WizardView>
    </AppLayout>
  )
}

export default DecompteWizard
