import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaSearch, FaFileContract } from 'react-icons/fa'
import AppLayout from '../../components/layout/AppLayout'
import { Card, Button, Badge } from '../../components/ui'
import { decomptesAPI } from '../../lib/api'
import type { Decompte, StatutDecompte } from '../../types/entities'

export default function DecomptesPage() {
  const navigate = useNavigate()
  const [decomptes, setDecomptes] = useState<Decompte[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchDecomptes()
  }, [])

  const fetchDecomptes = async () => {
    try {
      setLoading(true)
      const response = await decomptesAPI.getAll()
      setDecomptes(response.data.data || response.data || [])
    } catch (error) {
      console.error('Erreur chargement décomptes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDecomptes = decomptes.filter((dec) => {
    const matchesSearch = dec.numeroDecompte.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = statutFilter === 'ALL' || dec.statut === statutFilter
    return matchesSearch && matchesStatut
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-MA')
  }

  const getStatutBadge = (statut: StatutDecompte) => {
    const config: Record<StatutDecompte, { variant: 'success' | 'danger' | 'warning' | 'info' | 'gray'; label: string }> = {
      BROUILLON: { variant: 'gray', label: 'Brouillon' },
      SOUMIS: { variant: 'warning', label: 'Soumis' },
      VALIDE: { variant: 'info', label: 'Validé' },
      REJETE: { variant: 'danger', label: 'Rejeté' },
      PAYE_PARTIEL: { variant: 'warning', label: 'Payé Partiel' },
      PAYE_TOTAL: { variant: 'success', label: 'Soldé' },
    }
    const cfg = config[statut]
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-rubik text-gray-800">Décomptes</h1>
            <p className="text-gray-600 mt-1">Situations de travaux et prestations</p>
          </div>
          <Button
            variant="success"
            icon={<FaPlus />}
            onClick={() => navigate('/decomptes/nouveau')}
          >
            Nouveau Décompte
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card title="Total">
            <div className="text-3xl font-bold font-rubik text-gray-800">{decomptes.length}</div>
          </Card>
          <Card title="Validés">
            <div className="text-3xl font-bold font-rubik text-info">
              {decomptes.filter(d => d.statut === 'VALIDE').length}
            </div>
          </Card>
          <Card title="Soldés">
            <div className="text-3xl font-bold font-rubik text-success">
              {decomptes.filter(d => d.statut === 'PAYE_TOTAL').length}
            </div>
          </Card>
          <Card title="En Attente">
            <div className="text-3xl font-bold font-rubik text-warning">
              {decomptes.filter(d => d.statut === 'SOUMIS').length}
            </div>
          </Card>
          <Card title="Montant Total">
            <div className="text-2xl font-bold font-rubik text-gray-800">
              {formatCurrency(decomptes.reduce((sum, d) => sum + d.netAPayer, 0))}
            </div>
          </Card>
        </div>

        {/* Filtres */}
        <Card title="Recherche et Filtres">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-info"
              />
            </div>
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-info"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="SOUMIS">Soumis</option>
              <option value="VALIDE">Validé</option>
              <option value="PAYE_PARTIEL">Payé Partiel</option>
              <option value="PAYE_TOTAL">Soldé</option>
            </select>
          </div>
        </Card>

        {/* Table */}
        <Card title="Liste des Décomptes">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Décompte</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Retenues</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net à Payer</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDecomptes.map((dec) => (
                  <tr key={dec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaFileContract className="text-info mr-2" />
                        <span className="text-sm font-semibold text-gray-900">{dec.numeroDecompte}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(dec.dateDecompte)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(dec.periodeDebut)} - {formatDate(dec.periodeFin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(dec.montantTTC)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-danger">
                      {formatCurrency(dec.totalRetenues)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-success">
                      {formatCurrency(dec.netAPayer)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(dec.montantPaye)}
                      {dec.estSolde && <span className="ml-2 text-success">✓</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatutBadge(dec.statut)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/decomptes/${dec.id}`)}
                        className="text-info hover:text-info-dark"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDecomptes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aucun décompte trouvé</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
