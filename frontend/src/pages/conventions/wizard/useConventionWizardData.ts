import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { conventionsAPI } from '@/lib/api'
import { getEnabledConventionTypes } from '@/lib/settings/conventionSettings'
import { useConventionConfiguration } from '@/hooks/useConventionConfiguration'
import { incrementConventionCode } from '@/utils/conventionCode'
import { addMonths, calculateDurationMonths, formatDateInput } from '@/utils/dateUtils'
import {
  calculateTotals,
  type ConventionWizardFormData,
  type ConventionTypeOptionDisplay,
  type HandleChangeFunction,
  type WizardTotals,
  type BudgetLigne,
  type Partenaire,
  type Subvention,
} from './types'

interface ConventionListItem {
  id: number
  code: string
}

interface ConventionPartenaireApi {
  id: number
  partenaireId: number
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
  remarques: string | null
}

interface ConventionBudgetLigneApi {
  id: number
  categorieDepenseId: number
  categorieDepenseCode: string
  categorieDepenseLibelle: string
  designation: string | null
  montant: number
  pourcentage: number
  remarques: string | null
}

interface ConventionSubventionApi {
  id: number
  organismeBailleur: string
  montantTotal: number
  dateSignature: string | null
}

interface ConventionApiData {
  id: number
  code: string
  numero: string
  typeConvention: string
  type?: string
  libelle: string
  designation?: string
  objet: string
  objetRich?: string
  budget: number
  budgetTotal?: number
  tauxCommission: number
  baseCalcul: string
  tauxTva: number
  tauxTvaLignes?: number
  dateConvention: string
  dateDebut: string
  dateFin: string | null
  dureeMois?: number
  description?: string
  commissionMode?: string
  // Related data returned by getById
  partenaires?: ConventionPartenaireApi[]
  subventions?: ConventionSubventionApi[]
}

interface UseConventionWizardDataResult {
  id: string | undefined
  isEditing: boolean
  navigate: ReturnType<typeof useNavigate>
  formData: ConventionWizardFormData
  setFormData: React.Dispatch<React.SetStateAction<ConventionWizardFormData>>
  autoDateFin: boolean
  settings: ReturnType<typeof useConventionConfiguration>['configuration']
  typeOptionsWithCurrent: ConventionTypeOptionDisplay[]
  totals: WizardTotals
  handleChange: HandleChangeFunction
  onDureeMoisChange: (value: number) => void
  handleSubmit: () => void
  isLoadingConvention: boolean
  isSubmitting: boolean
  submitError: Error | null
}

export const useConventionWizardData = (): UseConventionWizardDataResult => {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEditing = !!id
  const { configuration: settings } = useConventionConfiguration()
  const [autoDateFin, setAutoDateFin] = useState(true)

  const defaultFormData: ConventionWizardFormData = {
    code: '',
    numeroConvention: '',
    libelle: '',
    libelleRich: '',
    objet: '',
    objetRich: '',
    type: 'CADRE',
    dateSignature: new Date().toISOString().split('T')[0],
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: formatDateInput(addMonths(new Date(), 12)),
    dureeMois: 12,
    budgetGlobal: 0,
    tauxTvaLignes: 20,
    lignesBudget: [],
    commissionMode: 'GLOBAL',
    tauxCommission: 2.5,
    baseCalcul: 'DECAISSEMENTS_TTC',
    tauxTva: 20,
    partenaires: [],
    subventions: [],
    files: [],
  }

  const [formData, setFormData] = useState<ConventionWizardFormData>(defaultFormData)

  // Load existing convention when in edit mode
  const { data: existingConvention, isLoading: isLoadingConventionQuery } = useQuery({
    queryKey: ['convention', id],
    queryFn: () => (id ? conventionsAPI.getById(parseInt(id)) : null),
    enabled: isEditing,
  })

  // Load budget lines separately (not included in getById response)
  const { data: budgetLignesResponse, isLoading: isLoadingBudgetLignes } = useQuery({
    queryKey: ['convention-budget-lignes', id],
    queryFn: () => (id ? conventionsAPI.getBudgetLignes(parseInt(id)) : null),
    enabled: isEditing,
  })

  const isLoadingConvention = isLoadingConventionQuery || isLoadingBudgetLignes

  // Initialize form with loaded data (convention + partenaires + budget lines)
  useEffect(() => {
    if (!existingConvention?.data) return

    // Handle ApiResponse wrapper: data may be at .data.data or .data
    const responseData = existingConvention.data
    const convention: ConventionApiData =
      (responseData as { data?: ConventionApiData }).data ?? (responseData as ConventionApiData)

    const formatDate = (dateStr: string | Date | null | undefined): string => {
      if (!dateStr) return ''
      return typeof dateStr === 'string'
        ? dateStr.split('T')[0]
        : new Date(dateStr).toISOString().split('T')[0]
    }

    const dateDebut = formatDate(convention.dateDebut)
    const dateFin = formatDate(convention.dateFin)
    const dureeMois = dateDebut && dateFin
      ? calculateDurationMonths(new Date(dateDebut), new Date(dateFin))
      : (convention.dureeMois || 12)

    // Map partenaires from API response to wizard format
    const partenaires: Partenaire[] = (convention.partenaires ?? []).map((p) => ({
      partenaireId: p.partenaireId,
      designation: p.partenaireSigle
        ? `${p.partenaireSigle} - ${p.partenaireNom}`
        : p.partenaireNom,
      budget: p.budgetAlloue,
      pourcentage: p.pourcentage,
    }))

    // Map budget lines from separate API call to wizard format
    let lignesBudget: BudgetLigne[] = []
    if (budgetLignesResponse?.data) {
      const budgetLignesData: ConventionBudgetLigneApi[] =
        (budgetLignesResponse.data as { data?: ConventionBudgetLigneApi[] }).data ??
        (budgetLignesResponse.data as ConventionBudgetLigneApi[])

      if (Array.isArray(budgetLignesData)) {
        const tauxTvaLignes = convention.tauxTvaLignes ?? convention.tauxTva ?? 20
        lignesBudget = budgetLignesData.map((bl) => ({
          categorieDepenseId: bl.categorieDepenseId,
          designation: bl.designation || bl.categorieDepenseLibelle,
          montantHT: bl.montant,
          tauxTVA: tauxTvaLignes,
          montantTTC: bl.montant * (1 + tauxTvaLignes / 100),
          plafond: 0,
          tauxCommissionLigne: convention.tauxCommission || 2.5,
        }))
      }
    }

    // Map subventions from API response
    const subventions: Subvention[] = (convention.subventions ?? []).map((s) => ({
      organisme: s.organismeBailleur,
      montant: s.montantTotal,
      pourcentage: convention.budget > 0 ? (s.montantTotal / convention.budget) * 100 : 0,
      dateObtention: s.dateSignature || '',
    }))

    setFormData({
      code: convention.code || '',
      numeroConvention: convention.numero || '',
      libelle: convention.libelle || convention.designation || '',
      libelleRich: convention.libelle || convention.designation || '',
      objet: convention.objet || '',
      objetRich: convention.objetRich || convention.objet || '',
      type: (convention.typeConvention || convention.type || 'CADRE') as ConventionWizardFormData['type'],
      dateSignature: formatDate(convention.dateConvention) || new Date().toISOString().split('T')[0],
      dateDebut,
      dateFin,
      dureeMois,
      budgetGlobal: convention.budget || convention.budgetTotal || 0,
      tauxTvaLignes: convention.tauxTvaLignes ?? convention.tauxTva ?? 20,
      lignesBudget,
      commissionMode: (convention.commissionMode as 'GLOBAL' | 'PAR_CATEGORIE') || 'GLOBAL',
      tauxCommission: convention.tauxCommission || 2.5,
      baseCalcul:
        (convention.baseCalcul as 'DECAISSEMENTS_TTC' | 'DECAISSEMENTS_HT') ||
        'DECAISSEMENTS_TTC',
      tauxTva: convention.tauxTvaLignes ?? convention.tauxTva ?? 20,
      partenaires,
      subventions,
      files: [],
    })
  }, [existingConvention, budgetLignesResponse])

  // Load next convention code
  useEffect(() => {
    const loadNextCode = async () => {
      if (isEditing || formData.code) return
      try {
        const response = await conventionsAPI.getAll()
        const conventions: ConventionListItem[] = response.data.data || response.data
        if (Array.isArray(conventions) && conventions.length > 0) {
          const latestConvention = conventions.reduce(
            (latest: ConventionListItem, current: ConventionListItem) =>
              current.id > latest.id ? current : latest
          )
          if (latestConvention?.code) {
            setFormData((prev) => ({
              ...prev,
              code: incrementConventionCode(latestConvention.code),
            }))
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du code de convention', error)
      }
    }

    loadNextCode()
  }, [formData.code, isEditing])

  // Build payload with all related data
  const buildPayload = (data: ConventionWizardFormData) => {
    // Map budget lines to backend format
    const lignesBudget = data.lignesBudget
      .filter((ligne) => ligne.categorieDepenseId && ligne.montantHT > 0)
      .map((ligne) => ({
        categorieDepenseId: ligne.categorieDepenseId!,
        designation: ligne.designation,
        montant: ligne.montantHT,
      }))

    // Map partenaires to backend format
    const partenaires = data.partenaires
      .filter((p) => p.partenaireId && p.budget > 0)
      .map((p) => ({
        partenaireId: p.partenaireId!,
        budgetAlloue: p.budget,
        pourcentage: p.pourcentage,
      }))

    return {
      code: data.code,
      numero: data.numeroConvention,
      dateConvention: data.dateSignature,
      typeConvention: data.type,
      libelle: data.libelle,
      objet: data.objetRich || data.objet,
      tauxCommission: data.tauxCommission,
      budget: data.budgetGlobal,
      baseCalcul: data.baseCalcul,
      tauxTva: data.tauxTva,
      tauxTvaLignes: data.tauxTvaLignes,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin || undefined,
      description: undefined,
      lignesBudget: lignesBudget.length > 0 ? lignesBudget : undefined,
      partenaires: partenaires.length > 0 ? partenaires : undefined,
    }
  }

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ConventionWizardFormData) => {
      return await conventionsAPI.create(buildPayload(data))
    },
    onSuccess: () => {
      navigate('/conventions')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ConventionWizardFormData) => {
      return await conventionsAPI.update(parseInt(id!), buildPayload(data))
    },
    onSuccess: () => {
      navigate(`/conventions/${id}`)
    },
  })

  // Handle form field changes
  const handleChange: HandleChangeFunction = (field) => (e) => {
    const value = e.target.value

    if (field === 'dateDebut') {
      const nextDateDebut = value
      setFormData((prev) => {
        const updated = { ...prev, dateDebut: nextDateDebut }
        if (autoDateFin && prev.dureeMois) {
          updated.dateFin = formatDateInput(addMonths(new Date(nextDateDebut), prev.dureeMois))
        }
        return updated
      })
      return
    }

    if (field === 'dateFin') {
      setAutoDateFin(false)
      setFormData((prev) => ({
        ...prev,
        dateFin: value,
        dureeMois:
          prev.dateDebut && value
            ? calculateDurationMonths(new Date(prev.dateDebut), new Date(value))
            : prev.dureeMois,
      }))
      return
    }

    if (field === 'dureeMois') {
      const duration = Number(value)
      setAutoDateFin(true)
      setFormData((prev) => ({
        ...prev,
        dureeMois: duration,
        dateFin: prev.dateDebut
          ? formatDateInput(addMonths(new Date(prev.dateDebut), duration))
          : prev.dateFin,
      }))
      return
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handler for dureeMois (DecimalInput provides number, not ChangeEvent)
  const onDureeMoisChange = (duration: number) => {
    setAutoDateFin(true)
    setFormData((prev) => ({
      ...prev,
      dureeMois: duration,
      dateFin: prev.dateDebut
        ? formatDateInput(addMonths(new Date(prev.dateDebut), duration))
        : prev.dateFin,
    }))
  }

  // Submit handler
  const handleSubmit = () => {
    if (isEditing) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  // Type options
  const typeOptions = getEnabledConventionTypes(settings)
  const typeOptionsWithCurrent: ConventionTypeOptionDisplay[] = typeOptions.find(
    (option) => option.value === formData.type
  )
    ? typeOptions
    : [...typeOptions, { value: formData.type, label: formData.type, enabled: true }]

  const totals = calculateTotals(formData)

  return {
    id,
    isEditing,
    navigate,
    formData,
    setFormData,
    autoDateFin,
    settings,
    typeOptionsWithCurrent,
    totals,
    handleChange,
    onDureeMoisChange,
    handleSubmit,
    isLoadingConvention,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    submitError:
      (createMutation.error instanceof Error ? createMutation.error : null) ||
      (updateMutation.error instanceof Error ? updateMutation.error : null),
  }
}
