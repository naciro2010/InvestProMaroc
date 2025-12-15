import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { axesAnalytiquesAPI } from '@/lib/api'

interface AxeAnalytique {
  id: number
  code: string
  libelle: string
  type?: string
  description?: string
  actif: boolean
}

const AxesAnalytiquesCRUD = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAxe, setEditingAxe] = useState<AxeAnalytique | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    libelle: '',
    type: '',
    description: '',
  })
  const [error, setError] = useState('')

  // Fetch axes analytiques
  const { data: axesData, isLoading } = useQuery({
    queryKey: ['axes-analytiques'],
    queryFn: async () => {
      const response = await axesAnalytiquesAPI.getAll()
      return response.data.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => axesAnalytiquesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['axes-analytiques'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Une erreur est survenue')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => axesAnalytiquesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['axes-analytiques'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Une erreur est survenue')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => axesAnalytiquesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['axes-analytiques'] })
    },
  })

  const filteredAxes = axesData?.filter((axe: AxeAnalytique) =>
    axe.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    axe.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (axe.type && axe.type.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  const handleOpenModal = (axe?: AxeAnalytique) => {
    if (axe) {
      setEditingAxe(axe)
      setFormData({
        code: axe.code,
        libelle: axe.libelle,
        type: axe.type || '',
        description: axe.description || '',
      })
    } else {
      setEditingAxe(null)
      setFormData({
        code: '',
        libelle: '',
        type: '',
        description: '',
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingAxe(null)
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (editingAxe) {
      updateMutation.mutate({ id: editingAxe.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir désactiver cet axe analytique ?')) {
      deleteMutation.mutate(id)
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'libelle', label: 'Libellé' },
    {
      key: 'type',
      label: 'Type',
      render: (axe: AxeAnalytique) => (
        axe.type ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
            {axe.type}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (axe: AxeAnalytique) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenModal(axe)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(axe.id)}
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
            <h1 className="text-3xl font-bold text-gray-900">Axes Analytiques</h1>
            <p className="text-gray-600 mt-1">
              Gérez les axes d'analyse pour le suivi budgétaire
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvel axe</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par code, libellé ou type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <DataTable
            data={filteredAxes}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Aucun axe analytique trouvé"
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAxe ? "Modifier l'axe analytique" : 'Nouvel axe analytique'}
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
                placeholder="AXE-001"
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
                placeholder="Direction Générale"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sélectionner un type</option>
              <option value="DIRECTION">Direction</option>
              <option value="DEPARTEMENT">Département</option>
              <option value="SERVICE">Service</option>
              <option value="ACTIVITE">Activité</option>
              <option value="CENTRE_COUT">Centre de Coût</option>
              <option value="AUTRE">Autre</option>
            </select>
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
              placeholder="Description de l'axe analytique..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {editingAxe ? 'Mettre à jour' : 'Créer'}
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

export default AxesAnalytiquesCRUD
