import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { conventionsAPI } from '@/lib/api'

interface Convention {
  id: number
  code: string
  libelle: string
  tauxCommission: number
  baseCalcul: string // HT, TTC, AUTRE
  tauxTva: number
  dateDebut: string
  dateFin?: string
  description?: string
  actif: boolean
}

const ConventionsCRUD = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConvention, setEditingConvention] = useState<Convention | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    libelle: '',
    tauxCommission: 0,
    baseCalcul: 'HT',
    tauxTva: 20.00,
    dateDebut: '',
    dateFin: '',
    description: '',
  })
  const [error, setError] = useState('')

  // Fetch conventions
  const { data: conventionsData, isLoading } = useQuery({
    queryKey: ['conventions'],
    queryFn: async () => {
      const response = await conventionsAPI.getAll()
      return response.data.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => conventionsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conventions'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Une erreur est survenue')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => conventionsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conventions'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Une erreur est survenue')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => conventionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conventions'] })
    },
  })

  const filteredConventions = conventionsData?.filter((convention: Convention) =>
    convention.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    convention.libelle.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleOpenModal = (convention?: Convention) => {
    if (convention) {
      setEditingConvention(convention)
      setFormData({
        code: convention.code,
        libelle: convention.libelle,
        tauxCommission: convention.tauxCommission,
        baseCalcul: convention.baseCalcul,
        tauxTva: convention.tauxTva,
        dateDebut: convention.dateDebut,
        dateFin: convention.dateFin || '',
        description: convention.description || '',
      })
    } else {
      setEditingConvention(null)
      setFormData({
        code: '',
        libelle: '',
        tauxCommission: 0,
        baseCalcul: 'HT',
        tauxTva: 20.00,
        dateDebut: '',
        dateFin: '',
        description: '',
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingConvention(null)
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (editingConvention) {
      updateMutation.mutate({ id: editingConvention.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir désactiver cette convention ?')) {
      deleteMutation.mutate(id)
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'libelle', label: 'Libellé' },
    {
      key: 'tauxCommission',
      label: 'Taux (%)',
      render: (convention: Convention) => (
        <span className="font-medium text-primary-600">
          {convention.tauxCommission}%
        </span>
      ),
    },
    {
      key: 'baseCalcul',
      label: 'Base Calcul',
      render: (convention: Convention) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          convention.baseCalcul === 'HT'
            ? 'bg-blue-100 text-blue-700'
            : convention.baseCalcul === 'TTC'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {convention.baseCalcul}
        </span>
      ),
    },
    {
      key: 'tauxTva',
      label: 'TVA (%)',
      render: (convention: Convention) => `${convention.tauxTva}%`,
    },
    {
      key: 'dateDebut',
      label: 'Date Début',
      render: (convention: Convention) =>
        new Date(convention.dateDebut).toLocaleDateString('fr-FR'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (convention: Convention) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenModal(convention)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(convention.id)}
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
            <h1 className="text-3xl font-bold text-gray-900">Conventions de Commissions</h1>
            <p className="text-gray-600 mt-1">
              Gérez les conventions de calcul des commissions d'intervention
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle convention</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par code ou libellé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <DataTable
            data={filteredConventions}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Aucune convention trouvée"
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingConvention ? 'Modifier la convention' : 'Nouvelle convention'}
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
                placeholder="CONV-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Libellé <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.libelle}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Commission Investissement"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taux de Commission (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                step="0.01"
                value={formData.tauxCommission}
                onChange={(e) => setFormData({ ...formData, tauxCommission: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="2.50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base de Calcul <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.baseCalcul}
                onChange={(e) => setFormData({ ...formData, baseCalcul: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="HT">Hors Taxes (HT)</option>
                <option value="TTC">Toutes Taxes Comprises (TTC)</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taux TVA (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              step="0.01"
              value={formData.tauxTva}
              onChange={(e) => setFormData({ ...formData, tauxTva: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="20.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de Début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de Fin
              </label>
              <input
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Description de la convention..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {editingConvention ? 'Mettre à jour' : 'Créer'}
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

export default ConventionsCRUD
