import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { comptesBancairesAPI } from '@/lib/api'

interface CompteBancaire {
  id: number
  code: string
  rib: string // 24 caractères
  banque: string
  agence?: string
  typeCompte?: string
  titulaire?: string
  devise: string
  actif: boolean
}

const ComptesBancairesCRUD = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompte, setEditingCompte] = useState<CompteBancaire | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    rib: '',
    banque: '',
    agence: '',
    typeCompte: 'GENERAL',
    titulaire: '',
    devise: 'MAD',
  })
  const [error, setError] = useState('')

  // Fetch comptes bancaires
  const { data: comptesData, isLoading } = useQuery({
    queryKey: ['comptes-bancaires'],
    queryFn: async () => {
      const response = await comptesBancairesAPI.getAll()
      return response.data.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => comptesBancairesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comptes-bancaires'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Une erreur est survenue')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => comptesBancairesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comptes-bancaires'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Une erreur est survenue')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => comptesBancairesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comptes-bancaires'] })
    },
  })

  const filteredComptes = comptesData?.filter((compte: CompteBancaire) =>
    compte.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    compte.rib.includes(searchTerm) ||
    compte.banque.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleOpenModal = (compte?: CompteBancaire) => {
    if (compte) {
      setEditingCompte(compte)
      setFormData({
        code: compte.code,
        rib: compte.rib,
        banque: compte.banque,
        agence: compte.agence || '',
        typeCompte: compte.typeCompte || 'GENERAL',
        titulaire: compte.titulaire || '',
        devise: compte.devise,
      })
    } else {
      setEditingCompte(null)
      setFormData({
        code: '',
        rib: '',
        banque: '',
        agence: '',
        typeCompte: 'GENERAL',
        titulaire: '',
        devise: 'MAD',
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCompte(null)
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate RIB length
    if (formData.rib.length !== 24) {
      setError('Le RIB doit contenir exactement 24 chiffres')
      return
    }

    if (editingCompte) {
      updateMutation.mutate({ id: editingCompte.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir désactiver ce compte bancaire ?')) {
      deleteMutation.mutate(id)
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    {
      key: 'rib',
      label: 'RIB',
      render: (compte: CompteBancaire) => (
        <span className="font-mono text-sm">{compte.rib}</span>
      ),
    },
    { key: 'banque', label: 'Banque' },
    { key: 'agence', label: 'Agence' },
    {
      key: 'typeCompte',
      label: 'Type',
      render: (compte: CompteBancaire) => (
        compte.typeCompte ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
            {compte.typeCompte}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (compte: CompteBancaire) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenModal(compte)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(compte.id)}
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
            <h1 className="text-3xl font-bold text-gray-900">Comptes Bancaires</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos comptes bancaires et RIB
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau compte</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par code, RIB ou banque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <DataTable
            data={filteredComptes}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Aucun compte bancaire trouvé"
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCompte ? 'Modifier le compte bancaire' : 'Nouveau compte bancaire'}
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
                placeholder="CPT-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devise <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.devise}
                onChange={(e) => setFormData({ ...formData, devise: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="MAD">MAD - Dirham Marocain</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dollar US</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RIB (24 chiffres) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={24}
              pattern="[0-9]{24}"
              value={formData.rib}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '') // Seulement des chiffres
                setFormData({ ...formData, rib: value })
              }}
              className="w-full px-4 py-2 font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="000000000000000000000000"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.rib.length}/24 caractères
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banque <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.banque}
                onChange={(e) => setFormData({ ...formData, banque: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Attijariwafa Bank"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agence
              </label>
              <input
                type="text"
                value={formData.agence}
                onChange={(e) => setFormData({ ...formData, agence: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Casablanca Centre"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de Compte
              </label>
              <select
                value={formData.typeCompte}
                onChange={(e) => setFormData({ ...formData, typeCompte: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="GENERAL">Compte Général</option>
                <option value="INVESTISSEMENT">Compte Investissement</option>
                <option value="TRESORERIE">Compte Trésorerie</option>
                <option value="PROJET">Compte Projet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titulaire
              </label>
              <input
                type="text"
                value={formData.titulaire}
                onChange={(e) => setFormData({ ...formData, titulaire: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="INVESTPRO MAROC SARL"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {editingCompte ? 'Mettre à jour' : 'Créer'}
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

export default ComptesBancairesCRUD
