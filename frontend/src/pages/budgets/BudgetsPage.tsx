import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaSearch, FaFileInvoiceDollar } from 'react-icons/fa'
import AppLayout from '../../components/layout/AppLayout'
import { Card, Button, Badge } from '../../components/ui'
import { budgetsAPI } from '../../lib/api'
import type { Budget, StatutBudget } from '../../types/entities'

export default function BudgetsPage() {
  const navigate = useNavigate()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await budgetsAPI.getAll()
      setBudgets(response.data.data || response.data || [])
    } catch (error) {
      console.error('Erreur chargement budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch = budget.version.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = statutFilter === 'ALL' || budget.statut === statutFilter
    return matchesSearch && matchesStatut
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

  const getStatutBadge = (statut: StatutBudget) => {
    const config: Record<StatutBudget, { variant: 'success' | 'danger' | 'warning' | 'info' | 'gray'; label: string }> = {
      BROUILLON: { variant: 'gray', label: 'Brouillon' },
      SOUMIS: { variant: 'warning', label: 'Soumis' },
      VALIDE: { variant: 'success', label: 'Validé' },
      REJETE: { variant: 'danger', label: 'Rejeté' },
      ARCHIVE: { variant: 'gray', label: 'Archivé' },
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-rubik text-gray-800">Budgets</h1>
            <p className="text-gray-600 mt-1">Gestion des budgets avec versions (V0, V1, V2...)</p>
          </div>
          <Button
            variant="success"
            icon={<FaPlus />}
            onClick={() => navigate('/budgets/nouveau')}
          >
            Nouveau Budget
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="Total Budgets">
            <div className="text-3xl font-bold font-rubik text-gray-800">{budgets.length}</div>
          </Card>
          <Card title="Validés">
            <div className="text-3xl font-bold font-rubik text-success">
              {budgets.filter(b => b.statut === 'VALIDE').length}
            </div>
          </Card>
          <Card title="En Attente">
            <div className="text-3xl font-bold font-rubik text-warning">
              {budgets.filter(b => b.statut === 'SOUMIS').length}
            </div>
          </Card>
          <Card title="Brouillon">
            <div className="text-3xl font-bold font-rubik text-gray-500">
              {budgets.filter(b => b.statut === 'BROUILLON').length}
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
                placeholder="Rechercher par version..."
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
              <option value="REJETE">Rejeté</option>
              <option value="ARCHIVE">Archivé</option>
            </select>
          </div>
        </Card>

        {/* Table */}
        <Card title="Liste des Budgets">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Convention</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Plafond</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Budget</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Delta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBudgets.map((budget) => (
                  <tr key={budget.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaFileInvoiceDollar className="text-info mr-2" />
                        <span className="text-sm font-semibold text-gray-900">{budget.version}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{budget.convention?.libelle || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(budget.dateBudget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(budget.plafondConvention)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(budget.totalBudget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {budget.deltaMontant && (
                        <span className={budget.deltaMontant > 0 ? 'text-success' : 'text-danger'}>
                          {budget.deltaMontant > 0 ? '+' : ''}{formatCurrency(budget.deltaMontant)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatutBadge(budget.statut)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/budgets/${budget.id}`)}
                        className="text-info hover:text-info-dark"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBudgets.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aucun budget trouvé</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
