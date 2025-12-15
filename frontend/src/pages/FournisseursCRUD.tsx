import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { fournisseursAPI } from '@/lib/api'

interface Fournisseur {
  id: number
  code: string
  raisonSociale: string
  identifiantFiscal?: string
  ice?: string
  adresse?: string
  ville?: string
  telephone?: string
  email?: string
  contact?: string
  nonResident: boolean
  actif: boolean
}

const FournisseursCRUD = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFournisseur, setEditingFournisseur] = useState<Fournisseur | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    raisonSociale: '',
    identifiantFiscal: '',
    ice: '',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    contact: '',
    nonResident: false,
  })
  const [error, setError] = useState('')

  // Fetch fournisseurs
  const { data: fournisseursData, isLoading } = useQuery({
    queryKey: ['fournisseurs'],
    queryFn: async () => {
      const response = await fournisseursAPI.getAll()
      return response.data.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => fournisseursAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Une erreur est survenue')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => fournisseursAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Une erreur est survenue')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => fournisseursAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] })
    },
  })

  const filteredFournisseurs = fournisseursData?.filter((fournisseur: Fournisseur) =>
    fournisseur.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fournisseur.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fournisseur.ice && fournisseur.ice.includes(searchTerm))
  ) || []

  const handleOpenModal = (fournisseur?: Fournisseur) => {
    if (fournisseur) {
      setEditingFournisseur(fournisseur)
      setFormData({
        code: fournisseur.code,
        raisonSociale: fournisseur.raisonSociale,
        identifiantFiscal: fournisseur.identifiantFiscal || '',
        ice: fournisseur.ice || '',
        adresse: fournisseur.adresse || '',
        ville: fournisseur.ville || '',
        telephone: fournisseur.telephone || '',
        email: fournisseur.email || '',
        contact: fournisseur.contact || '',
        nonResident: fournisseur.nonResident,
      })
    } else {
      setEditingFournisseur(null)
      setFormData({
        code: '',
        raisonSociale: '',
        identifiantFiscal: '',
        ice: '',
        adresse: '',
        ville: '',
        telephone: '',
        email: '',
        contact: '',
        nonResident: false,
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingFournisseur(null)
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (editingFournisseur) {
      updateMutation.mutate({ id: editingFournisseur.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir désactiver ce fournisseur ?')) {
      deleteMutation.mutate(id)
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'raisonSociale', label: 'Raison Sociale' },
    { key: 'ice', label: 'ICE' },
    { key: 'ville', label: 'Ville' },
    { key: 'telephone', label: 'Téléphone' },
    {
      key: 'nonResident',
      label: 'Statut',
      render: (fournisseur: Fournisseur) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            fournisseur.nonResident
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {fournisseur.nonResident ? 'Non-Résident' : 'Résident'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (fournisseur: Fournisseur) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenModal(fournisseur)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(fournisseur.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fournisseurs</h1>
            <p className="text-gray-600 mt-1">
              Gérez votre base de fournisseurs et prestataires
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau fournisseur</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par code, raison sociale ou ICE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <DataTable
            data={filteredFournisseurs}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Aucun fournisseur trouvé"
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingFournisseur ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
        size="lg"
      >
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="FOUR-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison Sociale <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.raisonSociale}
                onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="ENTREPRISE SARL"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identifiant Fiscal
              </label>
              <input
                type="text"
                value={formData.identifiantFiscal}
                onChange={(e) => setFormData({ ...formData, identifiantFiscal: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ICE (15 chiffres)
              </label>
              <input
                type="text"
                maxLength={15}
                pattern="[0-9]{15}"
                value={formData.ice}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, ice: value })
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="000000000000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="123 Rue Mohammed V"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Casablanca"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="+212 5 22 00 00 00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="contact@entreprise.ma"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personne de Contact
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ahmed BENALI"
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="nonResident"
                checked={formData.nonResident}
                onChange={(e) => setFormData({ ...formData, nonResident: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="nonResident" className="ml-3 block text-sm text-gray-900">
                Fournisseur non-résident{' '}
                <span className="text-amber-700 font-medium">(IS tiers 10%)</span>
              </label>
            </div>
            {formData.nonResident && (
              <p className="text-xs text-amber-700 mt-2">
                ⚠️ La retenue à la source de 10% sera automatiquement appliquée sur les dépenses
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {editingFournisseur ? 'Mettre à jour' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}

export default FournisseursCRUD
