import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaSearch, FaMoneyBillWave, FaChartLine } from 'react-icons/fa'
import AppLayout from '../../components/layout/AppLayout'
import { Card, Button, Badge } from '../../components/ui'
import { paiementsAPI } from '../../lib/api'
import type { Paiement, ModePaiement } from '../../types/entities'

export default function PaiementsPage() {
  const navigate = useNavigate()
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modeFilter, setModeFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchPaiements()
  }, [])

  const fetchPaiements = async () => {
    try {
      setLoading(true)
      const response = await paiementsAPI.getAll()
      setPaiements(response.data.data || response.data || [])
    } catch (error) {
      console.error('Erreur chargement paiements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPaiements = paiements.filter((p) => {
    const matchesSearch = p.referencePaiement.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMode = modeFilter === 'ALL' || p.modePaiement === modeFilter
    return matchesSearch && matchesMode
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

  const getModeBadge = (mode: ModePaiement) => {
    const config: Record<ModePaiement, { variant: 'success' | 'info' | 'warning' | 'gray'; label: string }> = {
      VIREMENT: { variant: 'info', label: 'Virement' },
      CHEQUE: { variant: 'success', label: 'Chèque' },
      ESPECES: { variant: 'warning', label: 'Espèces' },
      AUTRE: { variant: 'gray', label: 'Autre' },
    }
    const cfg = config[mode]
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  // Stats
  const totalPaye = paiements.reduce((sum, p) => sum + p.montantPaye, 0)
  const totalEcarts = paiements.reduce((sum, p) => {
    const ecartTotal = p.imputations?.reduce((acc, imp) => acc + (imp.ecart || 0), 0) || 0
    return sum + ecartTotal
  }, 0)

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
            <h1 className="text-3xl font-bold font-rubik text-gray-800">Paiements</h1>
            <p className="text-gray-600 mt-1">Suivi des paiements réels avec RÉEL vs BUDGET</p>
          </div>
          <Button
            variant="success"
            icon={<FaPlus />}
            onClick={() => navigate('/paiements/nouveau')}
          >
            Nouveau Paiement
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="Total Paiements">
            <div className="text-3xl font-bold font-rubik text-gray-800">{paiements.length}</div>
          </Card>
          <Card title="Montant Total Payé">
            <div className="text-2xl font-bold font-rubik text-success">
              {formatCurrency(totalPaye)}
            </div>
          </Card>
          <Card title="Écarts RÉEL vs BUDGET">
            <div className={`text-2xl font-bold font-rubik ${totalEcarts >= 0 ? 'text-success' : 'text-danger'}`}>
              {totalEcarts >= 0 ? '+' : ''}{formatCurrency(totalEcarts)}
            </div>
          </Card>
          <Card title="Par Virement">
            <div className="text-3xl font-bold font-rubik text-info">
              {paiements.filter(p => p.modePaiement === 'VIREMENT').length}
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
                placeholder="Rechercher par référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-info"
              />
            </div>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-info"
            >
              <option value="ALL">Tous les modes</option>
              <option value="VIREMENT">Virement</option>
              <option value="CHEQUE">Chèque</option>
              <option value="ESPECES">Espèces</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
        </Card>

        {/* Table */}
        <Card title="Liste des Paiements">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Valeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Exécution</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant Payé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Écart Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPaiements.map((paiement) => {
                  const ecartTotal = paiement.imputations?.reduce((acc, imp) => acc + (imp.ecart || 0), 0) || 0
                  return (
                    <tr key={paiement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaMoneyBillWave className="text-success mr-2" />
                          <span className="text-sm font-semibold text-gray-900">{paiement.referencePaiement}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(paiement.dateValeur)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(paiement.dateExecution)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-success">
                        {formatCurrency(paiement.montantPaye)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getModeBadge(paiement.modePaiement)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {ecartTotal !== 0 && (
                          <span className={`text-sm font-semibold ${ecartTotal >= 0 ? 'text-success' : 'text-danger'}`}>
                            {ecartTotal >= 0 ? '+' : ''}{formatCurrency(ecartTotal)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/paiements/${paiement.id}`)}
                          className="text-info hover:text-info-dark flex items-center gap-1"
                        >
                          <FaChartLine /> Détails
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredPaiements.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aucun paiement trouvé</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
