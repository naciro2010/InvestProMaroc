import { useState, useEffect } from 'react'
import { FaSearch, FaCalculator, FaFileInvoice } from 'react-icons/fa'
import AppLayout from '../../components/layout/AppLayout'
import { Card, Button } from '../../components/ui'
import api from '../../lib/api'

interface Commission {
  id: number
  dateCalcul: string
  baseCalcul: string
  montantBase: number
  tauxCommission: number
  tauxTva: number
  montantCommissionHt: number
  montantTvaCommission: number
  montantCommissionTtc: number
  depense?: {
    id: number
    numeroFacture: string
    fournisseur?: {
      raisonSociale: string
    }
  }
  convention?: {
    id: number
    numero: string
    libelle: string
  }
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear())

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    montantTotal: 0,
    montantTvaTotal: 0,
    montantTtcTotal: 0,
  })

  useEffect(() => {
    fetchCommissions()
  }, [yearFilter])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/commissions', {
        params: { year: yearFilter },
      })
      const data = response.data
      setCommissions(data)

      // Calculate stats
      const montantTotal = data.reduce((sum: number, c: Commission) => sum + c.montantCommissionHt, 0)
      const montantTvaTotal = data.reduce((sum: number, c: Commission) => sum + c.montantTvaCommission, 0)
      const montantTtcTotal = data.reduce((sum: number, c: Commission) => sum + c.montantCommissionTtc, 0)

      setStats({
        total: data.length,
        montantTotal,
        montantTvaTotal,
        montantTtcTotal,
      })
    } catch (error) {
      console.error('Erreur lors du chargement des commissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCommissions = commissions.filter((commission) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      commission.depense?.numeroFacture.toLowerCase().includes(searchLower) ||
      commission.depense?.fournisseur?.raisonSociale.toLowerCase().includes(searchLower) ||
      commission.convention?.numero.toLowerCase().includes(searchLower) ||
      commission.convention?.libelle.toLowerCase().includes(searchLower)
    )
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-MA')
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

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
            <h1 className="text-3xl font-bold font-rubik text-gray-800">Commissions d'Intervention</h1>
            <p className="text-gray-600 mt-1">Calcul et suivi des commissions selon les conventions</p>
          </div>
          <Button
            variant="success"
            icon={<FaCalculator />}
            onClick={() => alert('Calcul automatique des commissions (à implémenter)')}
          >
            Calculer Commissions
          </Button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="Total Commissions">
            <div className="text-3xl font-bold font-rubik text-gray-800">{stats.total}</div>
          </Card>

          <Card title="Montant HT">
            <div className="text-2xl font-bold font-rubik text-success">
              {formatCurrency(stats.montantTotal)}
            </div>
          </Card>

          <Card title="TVA">
            <div className="text-2xl font-bold font-rubik text-warning">
              {formatCurrency(stats.montantTvaTotal)}
            </div>
          </Card>

          <Card title="Montant TTC">
            <div className="text-2xl font-bold font-rubik text-info">
              {formatCurrency(stats.montantTtcTotal)}
            </div>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card title="Recherche et Filtres">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par facture, fournisseur, ou convention..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-info"
              />
            </div>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-info"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  Année {year}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Table des commissions */}
        <Card title="Liste des Commissions">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fournisseur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Convention
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taux (%)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant HT
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TVA
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant TTC
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(commission.dateCalcul)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaFileInvoice className="text-info mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {commission.depense?.numeroFacture}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {commission.depense?.fournisseur?.raisonSociale || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {commission.convention?.numero}
                      </div>
                      <div className="text-xs text-gray-500">
                        {commission.convention?.libelle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(commission.montantBase)}
                      </div>
                      <div className="text-xs text-gray-500">{commission.baseCalcul}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-success">
                        {commission.tauxCommission}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(commission.montantCommissionHt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(commission.montantTvaCommission)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-info">
                        {formatCurrency(commission.montantCommissionTtc)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCommissions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aucune commission trouvée</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
