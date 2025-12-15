import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { projetsAPI } from '@/lib/api'

interface Projet {
  id: number
  code: string
  nom: string
  description?: string
  responsable?: string
  statut?: string
  actif: boolean
}

const ProjetsCRUD = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProjet, setEditingProjet] = useState<Projet | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    description: '',
    responsable: '',
    statut: 'EN_COURS',
  })
  const [error, setError] = useState('')

  // Fetch projets
  const { data: projetsData, isLoading } = useQuery({
    queryKey: ['projets'],
    queryFn: async () => {
      const response = await projetsAPI.getAll()
      return response.data.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => projetsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projets'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Une erreur est survenue')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => projetsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projets'] })
      handleCloseModal()
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Une erreur est survenue')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => projetsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projets'] })
    },
  })

  const filteredProjets = projetsData?.filter((projet: Projet) =>
    projet.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    projet.nom.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleOpenModal = (projet?: Projet) => {
    if (projet) {
      setEditingProjet(projet)
      setFormData({
        code: projet.code,
        nom: projet.nom,
        description: projet.description || '',
        responsable: projet.responsable || '',
        statut: projet.statut || 'EN_COURS',
      })
    } else {
      setEditingProjet(null)
      setFormData({
        code: '',
        nom: '',
        description: '',
        responsable: '',
        statut: 'EN_COURS',
      })
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProjet(null)
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (editingProjet) {
      updateMutation.mutate({ id: editingProjet.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir désactiver ce projet ?')) {
      deleteMutation.mutate(id)
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'nom', label: 'Nom' },
    { key: 'responsable', label: 'Responsable' },
    {
      key: 'statut',
      label: 'Statut',
      render: (projet: Projet) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            projet.statut === 'EN_COURS'
              ? 'bg-green-100 text-green-700'
              : projet.statut === 'TERMINE'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {projet.statut || 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (projet: Projet) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenModal(projet)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(projet.id)}
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
            <h1 className="text-3xl font-bold text-gray-900">Projets</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos projets d'investissement
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau projet</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par code ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <DataTable
            data={filteredProjets}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Aucun projet trouvé"
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProjet ? 'Modifier le projet' : 'Nouveau projet'}
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
              placeholder="PROJ-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Modernisation SI"
            />
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
              placeholder="Description du projet..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsable
            </label>
            <input
              type="text"
              value={formData.responsable}
              onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Mohammed ALAMI"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
              <option value="SUSPENDU">Suspendu</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {editingProjet ? 'Mettre à jour' : 'Créer'}
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

export default ProjetsCRUD
