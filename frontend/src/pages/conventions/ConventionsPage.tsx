import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaSearch, FaFileAlt } from 'react-icons/fa'
import AppLayout from '../../components/layout/AppLayout'
import { Card, Button, StatusBadge } from '../../components/ui'
import type { Status } from '../../components/ui/StatusBadge'
import api from '../../lib/api'

interface Convention {
  id: number
  numero: string
  code: string
  libelle: string
  typeConvention: 'CADRE' | 'NON_CADRE' | 'SPECIFIQUE' | 'AVENANT'
  statut: 'BROUILLON' | 'SOUMIS' | 'VALIDEE' | 'EN_COURS' | 'ACHEVE' | 'EN_RETARD' | 'ANNULE'
  dateConvention: string
  budget: number
  tauxCommission: number
  dateDebut: string
  dateFin?: string
  // Workflow fields
  dateSoumission?: string
  dateValidation?: string
  valideParId?: number
  version?: string
  isLocked: boolean
  motifVerrouillage?: string
}

export default function ConventionsPage() {
  const navigate = useNavigate()
  const [conventions, setConventions] = useState<Convention[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    cadre: 0,
    nonCadre: 0,
    specifique: 0,
    avenant: 0,
  })

  useEffect(() => {
    fetchConventions()
  }, [])

  const fetchConventions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/conventions')
      const data = response.data
      setConventions(data)

      // Calculate stats
      setStats({
        total: data.length,
        cadre: data.filter((c: Convention) => c.typeConvention === 'CADRE').length,
        nonCadre: data.filter((c: Convention) => c.typeConvention === 'NON_CADRE').length,
        specifique: data.filter((c: Convention) => c.typeConvention === 'SPECIFIQUE').length,
        avenant: data.filter((c: Convention) => c.typeConvention === 'AVENANT').length,
      })
    } catch (error) {
      console.error('Erreur lors du chargement des conventions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConventions = conventions.filter((convention) => {
    const matchesSearch =
      convention.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convention.libelle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'ALL' || convention.typeConvention === typeFilter
    const matchesStatut = statutFilter === 'ALL' || convention.statut === statutFilter

    return matchesSearch && matchesType && matchesStatut
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(amount / 1000000) + ' M'
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-MA')
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CADRE: 'Cadre',
      NON_CADRE: 'Non-Cadre',
      SPECIFIQUE: 'Spécifique',
      AVENANT: 'Avenant',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CADRE: 'bg-info text-white',
      NON_CADRE: 'bg-success text-white',
      SPECIFIQUE: 'bg-warning text-white',
      AVENANT: 'bg-xcompta-orange text-white',
    }
    return colors[type] || 'bg-gray-500 text-white'
  }

  const mapStatutToBadge = (statut: string): Status => {
    const mapping: Record<string, Status> = {
      BROUILLON: 'BROUILLON',
      SOUMIS: 'SOUMIS',
      VALIDEE: 'VALIDEE',
      EN_COURS: 'EN_COURS',
      ACHEVE: 'ACHEVE',
      EN_RETARD: 'EN_RETARD',
      ANNULE: 'ANNULE',
    }
    return mapping[statut] || 'BROUILLON'
  }

  // Workflow actions
  const handleSoumettre = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Voulez-vous soumettre cette convention pour validation ?')) return

    try {
      const response = await api.post(`/api/conventions/${id}/soumettre`)
      if (response.data.success) {
        alert('Convention soumise pour validation avec succès')
        fetchConventions()
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la soumission')
    }
  }

  const handleValider = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Voulez-vous valider cette convention ? Une version V0 sera créée et la convention sera verrouillée.')) return

    try {
      // Get current user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await api.post(`/api/conventions/${id}/valider`, {
        valideParId: user.id || 1
      })
      if (response.data.success) {
        alert('Convention validée avec succès - Version V0 créée')
        fetchConventions()
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la validation')
    }
  }

  const handleRejeter = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const motif = prompt('Motif du rejet:')
    if (!motif) return

    try {
      const response = await api.post(`/api/conventions/${id}/rejeter`, { motif })
      if (response.data.success) {
        alert('Convention rejetée - retour en brouillon')
        fetchConventions()
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors du rejet')
    }
  }

  const handleAnnuler = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const motif = prompt('Motif de l\'annulation:')
    if (!motif) return

    try {
      const response = await api.post(`/api/conventions/${id}/annuler`, { motif })
      if (response.data.success) {
        alert('Convention annulée')
        fetchConventions()
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'annulation')
    }
  }

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
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-rubik text-gray-800">Conventions XCOMPTA</h1>
            <p className="text-gray-600 mt-1">Gestion des conventions d'intervention</p>
          </div>
          <Button
            variant="success"
            icon={<FaPlus />}
            onClick={() => navigate('/conventions/nouvelle')}
          >
            Nouvelle Convention
          </Button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card title="Total Conventions">
            <div className="text-3xl font-bold font-rubik text-gray-800">{stats.total}</div>
          </Card>

          <Card title="Cadre">
            <div className="text-3xl font-bold font-rubik text-info">{stats.cadre}</div>
          </Card>

          <Card title="Non-Cadre">
            <div className="text-3xl font-bold font-rubik text-success">{stats.nonCadre}</div>
          </Card>

          <Card title="Spécifique">
            <div className="text-3xl font-bold font-rubik text-warning">{stats.specifique}</div>
          </Card>

          <Card title="Avenant">
            <div className="text-3xl font-bold font-rubik text-gitlab-orange">{stats.avenant}</div>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card title="Recherche et Filtres">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro ou libellé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-info"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-info"
            >
              <option value="ALL">Tous les types</option>
              <option value="CADRE">Cadre</option>
              <option value="NON_CADRE">Non-Cadre</option>
              <option value="SPECIFIQUE">Spécifique</option>
              <option value="AVENANT">Avenant</option>
            </select>

            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-info"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="SOUMIS">Soumis</option>
              <option value="VALIDEE">Validée</option>
              <option value="EN_COURS">En cours</option>
              <option value="ACHEVE">Achevé</option>
              <option value="EN_RETARD">En retard</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>
        </Card>

        {/* Table des conventions */}
        <Card title="Liste des Conventions">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Libellé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taux (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConventions.map((convention) => (
                  <tr
                    key={convention.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/conventions/${convention.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaFileAlt className="text-info mr-2" />
                        <span className="text-sm font-semibold text-gray-900">
                          {convention.numero}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{convention.libelle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                          convention.typeConvention
                        )}`}
                      >
                        {getTypeLabel(convention.typeConvention)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(convention.dateConvention)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(convention.budget)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-success">
                        {convention.tauxCommission}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={mapStatutToBadge(convention.statut)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {/* Détails button (always available) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/conventions/${convention.id}`)
                          }}
                          className="text-info hover:text-info-dark"
                        >
                          Détails
                        </button>

                        {/* Workflow buttons based on status */}
                        {convention.statut === 'BROUILLON' && (
                          <button
                            onClick={(e) => handleSoumettre(convention.id, e)}
                            className="text-success hover:text-success-dark font-semibold"
                          >
                            Soumettre
                          </button>
                        )}

                        {convention.statut === 'SOUMIS' && (
                          <>
                            <button
                              onClick={(e) => handleValider(convention.id, e)}
                              className="text-success hover:text-success-dark font-semibold"
                            >
                              Valider
                            </button>
                            <button
                              onClick={(e) => handleRejeter(convention.id, e)}
                              className="text-danger hover:text-danger-dark"
                            >
                              Rejeter
                            </button>
                          </>
                        )}

                        {convention.statut === 'VALIDEE' && convention.version && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {convention.version}
                          </span>
                        )}

                        {convention.statut !== 'ANNULE' && (
                          <button
                            onClick={(e) => handleAnnuler(convention.id, e)}
                            className="text-danger hover:text-danger-dark text-xs"
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredConventions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aucune convention trouvée</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
