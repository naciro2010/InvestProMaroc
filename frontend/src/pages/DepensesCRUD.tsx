import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ChevronRight,
  ChevronLeft,
  FileText,
  Calculator,
  Percent,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import {
  mockDepenses,
  mockConventions,
  mockProjets,
  mockFournisseurs,
  mockAxesAnalytiques,
  mockComptesBancaires,
  type Depense,
} from '@/lib/mockData'

type FormStep = 1 | 2 | 3 | 4 | 5

const DepensesCRUD = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<FormStep>(1)
  const [error, setError] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    // Step 1 - Facture
    numeroFacture: '',
    dateFacture: '',
    fournisseurId: 0,
    projetId: 0,
    axeAnalytiqueId: 0,
    numeroMarche: '',

    // Step 2 - Montants
    montantHT: 0,
    tauxTVA: 20,

    // Step 3 - Convention
    conventionId: 0,

    // Step 4 - Retenues
    appliquerRetenueGarantie: true,
    appliquerRetenueISTiers: true,
    appliquerRetenueSource: false,
    tauxRetenueISTiers: 1.5,

    // Step 5 - Paiement
    datePaiement: '',
    referencePaiement: '',
    compteBancaireId: 0,
  })

  // Calculated values
  const calculations = useMemo(() => {
    const { montantHT, tauxTVA, conventionId, fournisseurId } = formData

    if (!montantHT || !conventionId || !fournisseurId) {
      return null
    }

    const convention = mockConventions.find(c => c.id === conventionId)
    const fournisseur = mockFournisseurs.find(f => f.id === fournisseurId)

    if (!convention || !fournisseur) return null

    // Calcul TVA dépense
    const montantTVA = montantHT * (tauxTVA / 100)
    const montantTTC = montantHT + montantTVA

    // Calcul commission
    const baseCommission = convention.baseCalcul === 'HT' ? montantHT : montantTTC
    const commissionHT = baseCommission * (convention.tauxCommission / 100)
    const commissionTVA = commissionHT * (convention.tauxTva / 100)
    const commissionTTC = commissionHT + commissionTVA

    // Retenues
    const retenueGarantie = formData.appliquerRetenueGarantie ? montantTTC * 0.1 : 0
    const retenueISTiers =
      formData.appliquerRetenueISTiers && montantHT > 10000
        ? montantHT * (formData.tauxRetenueISTiers / 100)
        : 0
    const retenueSource =
      formData.appliquerRetenueSource || fournisseur.nonResident
        ? montantHT * 0.1
        : 0

    // Net à payer
    const netAPayer =
      montantTTC + commissionTTC - retenueGarantie - retenueISTiers - retenueSource

    return {
      montantTVA: Math.round(montantTVA * 100) / 100,
      montantTTC: Math.round(montantTTC * 100) / 100,
      commissionHT: Math.round(commissionHT * 100) / 100,
      commissionTVA: Math.round(commissionTVA * 100) / 100,
      commissionTTC: Math.round(commissionTTC * 100) / 100,
      retenueGarantie: Math.round(retenueGarantie * 100) / 100,
      retenueISTiers: Math.round(retenueISTiers * 100) / 100,
      retenueSource: Math.round(retenueSource * 100) / 100,
      netAPayer: Math.round(netAPayer * 100) / 100,
    }
  }, [formData])

  const filteredDepenses = mockDepenses.filter(
    (depense) =>
      (statusFilter === 'ALL' || depense.statut === statusFilter) &&
      (depense.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
        depense.fournisseur.raisonSociale
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        depense.projet.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleOpenModal = () => {
    setFormData({
      numeroFacture: `FACT-2024-${String(mockDepenses.length + 1).padStart(4, '0')}`,
      dateFacture: new Date().toISOString().split('T')[0],
      fournisseurId: 0,
      projetId: 0,
      axeAnalytiqueId: 0,
      numeroMarche: '',
      montantHT: 0,
      tauxTVA: 20,
      conventionId: 0,
      appliquerRetenueGarantie: true,
      appliquerRetenueISTiers: true,
      appliquerRetenueSource: false,
      tauxRetenueISTiers: 1.5,
      datePaiement: '',
      referencePaiement: '',
      compteBancaireId: 0,
    })
    setCurrentStep(1)
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentStep(1)
  }

  const handleNextStep = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (
        !formData.numeroFacture ||
        !formData.dateFacture ||
        !formData.fournisseurId ||
        !formData.projetId ||
        !formData.axeAnalytiqueId
      ) {
        setError('Veuillez remplir tous les champs obligatoires')
        return
      }
    } else if (currentStep === 2) {
      if (!formData.montantHT || formData.montantHT <= 0) {
        setError('Le montant HT doit être supérieur à 0')
        return
      }
    } else if (currentStep === 3) {
      if (!formData.conventionId) {
        setError('Veuillez sélectionner une convention')
        return
      }
    }

    setError('')
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as FormStep)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as FormStep)
    }
  }

  const handleSubmit = () => {
    alert('Dépense enregistrée avec succès! (Demo)')
    handleCloseModal()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getStatusBadge = (statut: Depense['statut']) => {
    const badges = {
      BROUILLON: 'bg-gray-100 text-gray-700',
      A_VALIDER: 'bg-blue-100 text-blue-700',
      VALIDEE: 'bg-amber-100 text-amber-700',
      PAYEE: 'bg-green-100 text-green-700',
      ANNULEE: 'bg-red-100 text-red-700',
    }
    const labels = {
      BROUILLON: '🟡 Brouillon',
      A_VALIDER: '🔵 À Valider',
      VALIDEE: '🟠 Validée',
      PAYEE: '🟢 Payée',
      ANNULEE: '🔴 Annulée',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[statut]}`}>
        {labels[statut]}
      </span>
    )
  }

  const columns = [
    {
      key: 'numeroFacture',
      label: 'N° Facture',
      render: (depense: Depense) => (
        <span className="font-medium text-gray-900">{depense.numeroFacture}</span>
      ),
    },
    {
      key: 'dateFacture',
      label: 'Date',
      render: (depense: Depense) =>
        new Date(depense.dateFacture).toLocaleDateString('fr-FR'),
    },
    {
      key: 'fournisseur',
      label: 'Fournisseur',
      render: (depense: Depense) => (
        <div>
          <div className="font-medium text-gray-900">
            {depense.fournisseur.raisonSociale}
          </div>
          <div className="text-xs text-gray-500">{depense.fournisseur.ice}</div>
        </div>
      ),
    },
    {
      key: 'projet',
      label: 'Projet',
      render: (depense: Depense) => (
        <span className="text-sm text-gray-700">{depense.projet.nom}</span>
      ),
    },
    {
      key: 'montantTTC',
      label: 'Montant TTC',
      render: (depense: Depense) => (
        <span className="font-semibold text-primary-600">
          {formatCurrency(depense.montantTTC)}
        </span>
      ),
    },
    {
      key: 'commissionTTC',
      label: 'Commission',
      render: (depense: Depense) => (
        <span className="text-sm text-gray-700">
          {formatCurrency(depense.commissionTTC)}
        </span>
      ),
    },
    {
      key: 'netAPayer',
      label: 'Net à Payer',
      render: (depense: Depense) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(depense.netAPayer)}
        </span>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (depense: Depense) => getStatusBadge(depense.statut),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (depense: Depense) => (
        <div className="flex items-center space-x-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  const stepIcons = [FileText, Calculator, Percent, CreditCard, CheckCircle2]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dépenses d'Investissement
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez vos dépenses avec calcul automatique des commissions et retenues
            </p>
          </div>
          <button onClick={handleOpenModal} className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Nouvelle Dépense</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par facture, fournisseur ou projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="A_VALIDER">À Valider</option>
              <option value="VALIDEE">Validée</option>
              <option value="PAYEE">Payée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <DataTable
            data={filteredDepenses}
            columns={columns}
            isLoading={false}
            emptyMessage="Aucune dépense trouvée"
          />
        </div>
      </div>

      {/* Multi-Step Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Nouvelle Dépense d'Investissement"
        size="lg"
      >
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step, index) => {
              const Icon = stepIcons[index]
              const isActive = step === currentStep
              const isCompleted = step < currentStep

              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      } transition-all duration-300`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs mt-2 ${
                        isActive ? 'text-primary-600 font-medium' : 'text-gray-500'
                      }`}
                    >
                      Étape {step}
                    </span>
                  </div>
                  {step < 5 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      } transition-all duration-300`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Erreur</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* STEP 1 - FACTURE */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations Facture
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      N° Facture <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.numeroFacture}
                      onChange={(e) =>
                        setFormData({ ...formData, numeroFacture: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Facture <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateFacture}
                      onChange={(e) =>
                        setFormData({ ...formData, dateFacture: e.target.value })
                      }
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fournisseur <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.fournisseurId}
                    onChange={(e) =>
                      setFormData({ ...formData, fournisseurId: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={0}>Sélectionner un fournisseur</option>
                    {mockFournisseurs.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.raisonSociale} - {f.ice}
                        {f.nonResident && ' (Non-Résident)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projet <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.projetId}
                    onChange={(e) =>
                      setFormData({ ...formData, projetId: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={0}>Sélectionner un projet</option>
                    {mockProjets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Axe Analytique <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.axeAnalytiqueId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        axeAnalytiqueId: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={0}>Sélectionner un axe</option>
                    {mockAxesAnalytiques.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} - {a.libelle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    N° Marché / Décompte
                  </label>
                  <input
                    type="text"
                    value={formData.numeroMarche}
                    onChange={(e) =>
                      setFormData({ ...formData, numeroMarche: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="MARCH-2024-001"
                  />
                </div>
              </div>
            )}

            {/* STEP 2 - MONTANTS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Montants de la Dépense
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant HT (MAD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.montantHT || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          montantHT: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 text-lg font-semibold border-2 border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taux TVA (%) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.tauxTVA}
                      onChange={(e) =>
                        setFormData({ ...formData, tauxTVA: parseFloat(e.target.value) })
                      }
                      className="w-full px-4 py-3 text-lg font-semibold border-2 border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={0}>0% (Exonéré)</option>
                      <option value={7}>7%</option>
                      <option value={10}>10%</option>
                      <option value={14}>14%</option>
                      <option value={20}>20% (Standard)</option>
                    </select>
                  </div>
                </div>

                {formData.montantHT > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6"
                  >
                    <h4 className="text-sm font-semibold text-blue-900 mb-4">
                      📊 CALCULS AUTOMATIQUES
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-blue-900">
                        <span>Montant HT:</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(formData.montantHT)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-blue-700">
                        <span>TVA ({formData.tauxTVA}%):</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            formData.montantHT * (formData.tauxTVA / 100)
                          )}
                        </span>
                      </div>
                      <div className="border-t-2 border-blue-300 pt-3 flex justify-between items-center">
                        <span className="font-bold text-blue-900">Montant TTC:</span>
                        <span className="font-bold text-2xl text-blue-600">
                          {formatCurrency(
                            formData.montantHT * (1 + formData.tauxTVA / 100)
                          )}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* STEP 3 - CONVENTION */}
            {currentStep === 3 && calculations && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Convention & Commission
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner une convention <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.conventionId}
                    onChange={(e) =>
                      setFormData({ ...formData, conventionId: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={0}>Choisir une convention</option>
                    {mockConventions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.libelle} ({c.tauxCommission}% sur {c.baseCalcul})
                      </option>
                    ))}
                  </select>
                </div>

                {formData.conventionId > 0 && calculations && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6"
                  >
                    <h4 className="text-sm font-semibold text-orange-900 mb-4 flex items-center">
                      <Calculator className="w-5 h-5 mr-2" />
                      📊 SIMULATION COMMISSION
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-orange-900">
                        <span>Base de calcul:</span>
                        <span className="font-semibold">
                          {mockConventions.find(c => c.id === formData.conventionId)
                            ?.baseCalcul}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-orange-900">
                        <span>Montant base:</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            mockConventions.find(c => c.id === formData.conventionId)
                              ?.baseCalcul === 'HT'
                              ? formData.montantHT
                              : calculations.montantTTC
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-orange-700">
                        <span>
                          × Taux (
                          {mockConventions.find(c => c.id === formData.conventionId)
                            ?.tauxCommission}
                          %):
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(calculations.commissionHT)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-orange-700">
                        <span>+ TVA (20%):</span>
                        <span className="font-semibold">
                          {formatCurrency(calculations.commissionTVA)}
                        </span>
                      </div>
                      <div className="border-t-2 border-orange-300 pt-3 flex justify-between items-center">
                        <span className="font-bold text-orange-900">
                          Commission TTC:
                        </span>
                        <span className="font-bold text-2xl text-orange-600">
                          {formatCurrency(calculations.commissionTTC)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* STEP 4 - RETENUES */}
            {currentStep === 4 && calculations && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Retenues Fiscales Marocaines
                </h3>

                <div className="space-y-4">
                  {/* Retenue Garantie */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="retenueGarantie"
                          checked={formData.appliquerRetenueGarantie}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              appliquerRetenueGarantie: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="retenueGarantie"
                          className="ml-3 text-sm font-medium text-gray-900"
                        >
                          Retenue de Garantie (10%)
                        </label>
                      </div>
                      {formData.appliquerRetenueGarantie && (
                        <span className="text-sm font-bold text-amber-700">
                          {formatCurrency(calculations.retenueGarantie)}
                        </span>
                      )}
                    </div>
                    {formData.appliquerRetenueGarantie && (
                      <p className="text-xs text-amber-700 ml-7">
                        Standard marchés publics marocains - 10% du montant TTC
                      </p>
                    )}
                  </div>

                  {/* Retenue IS Tiers */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="retenueISTiers"
                          checked={formData.appliquerRetenueISTiers}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              appliquerRetenueISTiers: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="retenueISTiers"
                          className="ml-3 text-sm font-medium text-gray-900"
                        >
                          Retenue IS Tiers
                        </label>
                      </div>
                      {formData.appliquerRetenueISTiers && (
                        <span className="text-sm font-bold text-blue-700">
                          {formatCurrency(calculations.retenueISTiers)}
                        </span>
                      )}
                    </div>
                    {formData.appliquerRetenueISTiers && (
                      <div className="ml-7">
                        <input
                          type="number"
                          min="1.5"
                          max="10"
                          step="0.1"
                          value={formData.tauxRetenueISTiers}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tauxRetenueISTiers: parseFloat(e.target.value),
                            })
                          }
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <span className="ml-2 text-xs text-blue-700">
                          % du montant HT (pour montants &gt; 10,000 MAD)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Retenue Source (Non-Résident) */}
                  {mockFournisseurs.find(f => f.id === formData.fournisseurId)
                    ?.nonResident && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="retenueSource"
                            checked={true}
                            disabled
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded opacity-50"
                          />
                          <label
                            htmlFor="retenueSource"
                            className="ml-3 text-sm font-medium text-gray-900"
                          >
                            Retenue à la Source (10%) - NON-RÉSIDENT
                          </label>
                        </div>
                        <span className="text-sm font-bold text-red-700">
                          {formatCurrency(calculations.retenueSource)}
                        </span>
                      </div>
                      <p className="text-xs text-red-700 ml-7">
                        ⚠️ Obligatoire pour fournisseurs non-résidents - 10% du HT
                      </p>
                    </div>
                  )}
                </div>

                {/* NET À PAYER */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 mt-6"
                >
                  <h4 className="text-sm font-semibold mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    💰 NET À PAYER
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Montant TTC:</span>
                      <span className="font-semibold">
                        + {formatCurrency(calculations.montantTTC)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Commission:</span>
                      <span className="font-semibold">
                        + {formatCurrency(calculations.commissionTTC)}
                      </span>
                    </div>
                    {formData.appliquerRetenueGarantie && (
                      <div className="flex justify-between items-center">
                        <span>Ret. Garantie:</span>
                        <span className="font-semibold">
                          - {formatCurrency(calculations.retenueGarantie)}
                        </span>
                      </div>
                    )}
                    {formData.appliquerRetenueISTiers && calculations.retenueISTiers > 0 && (
                      <div className="flex justify-between items-center">
                        <span>Ret. IS:</span>
                        <span className="font-semibold">
                          - {formatCurrency(calculations.retenueISTiers)}
                        </span>
                      </div>
                    )}
                    {calculations.retenueSource > 0 && (
                      <div className="flex justify-between items-center">
                        <span>Ret. Source:</span>
                        <span className="font-semibold">
                          - {formatCurrency(calculations.retenueSource)}
                        </span>
                      </div>
                    )}
                    <div className="border-t-2 border-green-400 pt-3 mt-3 flex justify-between items-center">
                      <span className="font-bold text-lg">NET:</span>
                      <span className="font-bold text-3xl">
                        {formatCurrency(calculations.netAPayer)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* STEP 5 - PAIEMENT */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations de Paiement (Optionnel)
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    ℹ️ Ces informations peuvent être remplies ultérieurement lors du
                    paiement effectif
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de Paiement
                    </label>
                    <input
                      type="date"
                      value={formData.datePaiement}
                      onChange={(e) =>
                        setFormData({ ...formData, datePaiement: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Référence Paiement
                    </label>
                    <input
                      type="text"
                      value={formData.referencePaiement}
                      onChange={(e) =>
                        setFormData({ ...formData, referencePaiement: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="VIR-000001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compte Bancaire RRA
                  </label>
                  <select
                    value={formData.compteBancaireId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        compteBancaireId: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={0}>Sélectionner un compte</option>
                    {mockComptesBancaires.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.banque} - {c.rib}
                      </option>
                    ))}
                  </select>
                </div>

                {calculations && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-6 mt-6"
                  >
                    <h4 className="text-lg font-bold mb-4 flex items-center">
                      <CheckCircle2 className="w-6 h-6 mr-2" />
                      Récapitulatif de la Dépense
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-primary-100 mb-1">Facture</p>
                        <p className="font-semibold">{formData.numeroFacture}</p>
                      </div>
                      <div>
                        <p className="text-primary-100 mb-1">Date</p>
                        <p className="font-semibold">
                          {new Date(formData.dateFacture).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-primary-100 mb-1">Montant TTC</p>
                        <p className="font-semibold text-lg">
                          {formatCurrency(calculations.montantTTC)}
                        </p>
                      </div>
                      <div>
                        <p className="text-primary-100 mb-1">Commission TTC</p>
                        <p className="font-semibold text-lg">
                          {formatCurrency(calculations.commissionTTC)}
                        </p>
                      </div>
                    </div>
                    <div className="border-t-2 border-primary-400 mt-4 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">NET À PAYER:</span>
                        <span className="text-3xl font-bold">
                          {formatCurrency(calculations.netAPayer)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Précédent</span>
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNextStep}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Suivant</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Valider la Dépense</span>
            </button>
          )}
        </div>
      </Modal>
    </AppLayout>
  )
}

export default DepensesCRUD
