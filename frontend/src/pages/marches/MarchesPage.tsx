import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaPlus, FaEdit, FaTrash, FaEye, FaFileExcel, FaSearch } from 'react-icons/fa'
import { XcomptaCard, XcomptaButton, StatusBadge } from '../../components/ui/xcompta'
import AppLayout from '../../components/layout/AppLayout'
import api from '../../lib/api'

interface Marche {
  id: number
  numeroMarche: string
  numAo?: string
  dateMarche: string
  objet: string
  montantTtc: number
  statut: 'EN_COURS' | 'VALIDE' | 'TERMINE' | 'SUSPENDU' | 'ANNULE' | 'EN_ATTENTE'
  fournisseur?: {
    id: number
    raisonSociale: string
  }
  projet?: {
    id: number
    nom: string
  }
  dateFinPrevue?: string
  tauxAvancement?: number
}

const statutColors: Record<string, 'VALIDEE' | 'EN_COURS' | 'ACHEVE' | 'EN_RETARD' | 'ANNULE'> = {
  'VALIDE': 'VALIDEE',
  'EN_COURS': 'EN_COURS',
  'TERMINE': 'ACHEVE',
  'SUSPENDU': 'EN_RETARD',
  'ANNULE': 'ANNULE',
  'EN_ATTENTE': 'EN_COURS'
}

export default function MarchesPage() {
  const [marches, setMarches] = useState<Marche[]>([])
  const [filteredMarches, setFilteredMarches] = useState<Marche[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatut, setSelectedStatut] = useState<string>('ALL')

  useEffect(() => {
    fetchMarches()
  }, [])

  useEffect(() => {
    filterMarches()
  }, [searchTerm, selectedStatut, marches])

  const fetchMarches = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/marches')
      setMarches(response.data)
      setFilteredMarches(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des marchés:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMarches = () => {
    let filtered = marches

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.numeroMarche.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.fournisseur?.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.projet?.nom.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par statut
    if (selectedStatut !== 'ALL') {
      filtered = filtered.filter(m => m.statut === selectedStatut)
    }

    setFilteredMarches(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce marché ?')) return

    try {
      await api.delete(`/api/marches/${id}`)
      fetchMarches()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-MA')
  }

  const calculateStats = () => {
    return {
      total: marches.length,
      enCours: marches.filter(m => m.statut === 'EN_COURS').length,
      valide: marches.filter(m => m.statut === 'VALIDE').length,
      termine: marches.filter(m => m.statut === 'TERMINE').length,
      montantTotal: marches.reduce((sum, m) => sum + m.montantTtc, 0)
    }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-info"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
      {/* En-tête avec stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <XcomptaCard title="Total Marchés" headerColor="info">
          <div className="text-3xl font-bold font-rubik text-gray-800">{stats.total}</div>
        </XcomptaCard>

        <XcomptaCard title="En Cours" headerColor="warning">
          <div className="text-3xl font-bold font-rubik text-warning">{stats.enCours}</div>
        </XcomptaCard>

        <XcomptaCard title="Validés" headerColor="success">
          <div className="text-3xl font-bold font-rubik text-success">{stats.valide}</div>
        </XcomptaCard>

        <XcomptaCard title="Terminés" headerColor="info">
          <div className="text-3xl font-bold font-rubik text-info">{stats.termine}</div>
        </XcomptaCard>

        <XcomptaCard title="Montant Total" headerColor="primary">
          <div className="text-2xl font-bold font-rubik text-xcompta-blue">
            {formatCurrency(stats.montantTotal)}
          </div>
        </XcomptaCard>
      </div>

      {/* Carte principale */}
      <XcomptaCard
        title="Gestion des Marchés"
        headerColor="info"
        actions={
          <div className="flex gap-2">
            <Link to="/marches/nouveau">
              <XcomptaButton variant="success" icon={<FaPlus />}>
                Nouveau Marché
              </XcomptaButton>
            </Link>
            <XcomptaButton variant="outline-success" icon={<FaFileExcel />}>
              Exporter Excel
            </XcomptaButton>
          </div>
        }
      >
        {/* Filtres */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro, objet, fournisseur, projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre par statut */}
            <div className="w-full md:w-64">
              <select
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info focus:border-transparent"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="EN_COURS">En cours</option>
                <option value="VALIDE">Validé</option>
                <option value="TERMINE">Terminé</option>
                <option value="SUSPENDU">Suspendu</option>
                <option value="ANNULE">Annulé</option>
                <option value="EN_ATTENTE">En attente</option>
              </select>
            </div>
          </div>

          {/* Résultats filtrés */}
          <div className="text-sm text-gray-600">
            Affichage de <span className="font-semibold">{filteredMarches.length}</span> sur{' '}
            <span className="font-semibold">{marches.length}</span> marché(s)
          </div>
        </div>

        {/* Table responsive */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Marché
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° AO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant TTC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMarches.map((marche) => (
                <tr key={marche.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {marche.numeroMarche}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {marche.numAo || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {marche.objet}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {marche.fournisseur?.raisonSociale || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {marche.projet?.nom || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(marche.montantTtc)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(marche.dateMarche)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={statutColors[marche.statut]} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link to={`/marches/${marche.id}`}>
                        <button className="text-info hover:text-cyan-700 p-2">
                          <FaEye />
                        </button>
                      </Link>
                      <Link to={`/marches/${marche.id}/edit`}>
                        <button className="text-warning hover:text-orange-700 p-2">
                          <FaEdit />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(marche.id)}
                        className="text-danger hover:text-red-700 p-2"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMarches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun marché trouvé</p>
            </div>
          )}
        </div>
      </XcomptaCard>
      </div>
    </AppLayout>
  )
}
