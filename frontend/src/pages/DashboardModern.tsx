import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Activity,
  Users,
  Building2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import AppLayout from '@/components/layout/AppLayout'
import api from '@/lib/api'

interface DashboardStats {
  totalDepenses: number
  totalCommissions: number
  nombreDepenses: number
  depensesParMois: { month: string; montant: number }[]
  topProjets: { nom: string; montant: number }[]
  topFournisseurs: { nom: string; montant: number }[]
  commissionsParConvention: { name: string; value: number }[]
  depensesParStatut: { statut: string; count: number; montant: number }[]
}

const DashboardModern = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalDepenses: 0,
    totalCommissions: 0,
    nombreDepenses: 0,
    depensesParMois: [],
    topProjets: [],
    topFournisseurs: [],
    commissionsParConvention: [],
    depensesParStatut: [],
  })
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    fetchDashboardData()
  }, [selectedPeriod])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch multiple endpoints in parallel
      const [depensesRes, conventionsRes, projetsRes] = await Promise.all([
        api.get('/api/depenses').catch(() => ({ data: [] })),
        api.get('/api/conventions').catch(() => ({ data: [] })),
        api.get('/api/projets').catch(() => ({ data: [] })),
      ])

      const depenses = depensesRes.data || []

      // Calculate stats from real data
      const totalDepenses = depenses.reduce((sum: number, d: any) => sum + (d.montantTTC || 0), 0)
      const totalCommissions = depenses.reduce((sum: number, d: any) => sum + (d.commissionTTC || 0), 0)

      // Group by month
      const depensesByMonth: {[key: string]: number} = {}
      depenses.forEach((d: any) => {
        if (d.dateFacture) {
          const date = new Date(d.dateFacture)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }).format(date)
          depensesByMonth[monthLabel] = (depensesByMonth[monthLabel] || 0) + (d.montantTTC || 0)
        }
      })

      // Group by projet
      const depensesByProjet: {[key: string]: number} = {}
      depenses.forEach((d: any) => {
        if (d.projet && d.projet.nom) {
          depensesByProjet[d.projet.nom] = (depensesByProjet[d.projet.nom] || 0) + (d.montantTTC || 0)
        }
      })

      // Group by fournisseur
      const depensesByFournisseur: {[key: string]: number} = {}
      depenses.forEach((d: any) => {
        if (d.fournisseur && d.fournisseur.raisonSociale) {
          depensesByFournisseur[d.fournisseur.raisonSociale] = (depensesByFournisseur[d.fournisseur.raisonSociale] || 0) + (d.montantTTC || 0)
        }
      })

      // Group by convention
      const commissionsByConvention: {[key: string]: number} = {}
      depenses.forEach((d: any) => {
        if (d.convention && d.convention.libelle && d.commissionTTC) {
          commissionsByConvention[d.convention.libelle] = (commissionsByConvention[d.convention.libelle] || 0) + (d.commissionTTC || 0)
        }
      })

      // Group by statut
      const depensesByStatut: {[key: string]: {count: number, montant: number}} = {}
      depenses.forEach((d: any) => {
        const statut = d.statut || 'BROUILLON'
        if (!depensesByStatut[statut]) {
          depensesByStatut[statut] = { count: 0, montant: 0 }
        }
        depensesByStatut[statut].count++
        depensesByStatut[statut].montant += d.montantTTC || 0
      })

      setStats({
        totalDepenses,
        totalCommissions,
        nombreDepenses: depenses.length,
        depensesParMois: Object.entries(depensesByMonth).map(([month, montant]) => ({
          month,
          montant: Math.round(montant)
        })).slice(-6),
        topProjets: Object.entries(depensesByProjet)
          .map(([nom, montant]) => ({ nom: nom.length > 30 ? nom.substring(0, 30) + '...' : nom, montant: Math.round(montant as number) }))
          .sort((a, b) => b.montant - a.montant)
          .slice(0, 5),
        topFournisseurs: Object.entries(depensesByFournisseur)
          .map(([nom, montant]) => ({ nom: nom.length > 25 ? nom.substring(0, 25) + '...' : nom, montant: Math.round(montant as number) }))
          .sort((a, b) => b.montant - a.montant)
          .slice(0, 5),
        commissionsParConvention: Object.entries(commissionsByConvention)
          .map(([name, value]) => ({ name: name.length > 30 ? name.substring(0, 30) + '...' : name, value: Math.round(value as number) }))
          .slice(0, 5),
        depensesParStatut: Object.entries(depensesByStatut).map(([statut, data]) => ({
          statut,
          count: data.count,
          montant: Math.round(data.montant)
        })),
      })
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#FC6D26', '#E24329', '#FCA326', '#10B981', '#8B5CF6', '#F59E0B']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const tauxCommission = stats.totalDepenses > 0
    ? (stats.totalCommissions / stats.totalDepenses) * 100
    : 0

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gitlab-orange"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de Bord
            </h1>
            <p className="text-gray-600 mt-1">
              Vue d'ensemble de la gestion des dépenses d'investissement
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gitlab-orange"
            >
              <option value="month">Ce mois</option>
              <option value="quarter">3 derniers mois</option>
              <option value="year">12 derniers mois</option>
            </select>

            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gitlab-orange hover:bg-gitlab-orange-dark text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exporter</span>
            </button>
          </div>
        </div>

        {/* KPI Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Dépenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gitlab-orange to-orange-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-lg p-3">
                <DollarSign className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">
                Total Dépenses
              </p>
              <p className="text-2xl sm:text-3xl font-bold">
                {formatCurrency(stats.totalDepenses)}
              </p>
              <p className="text-orange-100 text-xs mt-2">
                {stats.nombreDepenses} dépenses
              </p>
            </div>
          </motion.div>

          {/* Total Commissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-lg p-3">
                <FileText className="w-6 h-6" />
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
                {tauxCommission.toFixed(1)}%
              </div>
            </div>
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">
                Total Commissions
              </p>
              <p className="text-2xl sm:text-3xl font-bold">
                {formatCurrency(stats.totalCommissions)}
              </p>
              <p className="text-green-100 text-xs mt-2">
                Sur total dépenses
              </p>
            </div>
          </motion.div>

          {/* Projets Actifs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-lg p-3">
                <Building2 className="w-6 h-6" />
              </div>
              <Activity className="w-5 h-5 opacity-80" />
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">
                Projets Actifs
              </p>
              <p className="text-2xl sm:text-3xl font-bold">
                {stats.topProjets.length}
              </p>
              <p className="text-blue-100 text-xs mt-2">
                En cours de suivi
              </p>
            </div>
          </motion.div>

          {/* Fournisseurs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-lg p-3">
                <Users className="w-6 h-6" />
              </div>
              <CheckCircle2 className="w-5 h-5 opacity-80" />
            </div>
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">
                Fournisseurs
              </p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.topFournisseurs.length}</p>
              <p className="text-purple-100 text-xs mt-2">
                Actifs ce mois
              </p>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 1 - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolution Mensuelle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Évolution des Dépenses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.depensesParMois}>
                <defs>
                  <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FC6D26" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FC6D26" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="montant" stroke="#FC6D26" strokeWidth={2} fillOpacity={1} fill="url(#colorDepenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Répartition par Projet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 5 Projets par Dépenses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topProjets} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="nom" width={150} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="montant" fill="#FC6D26" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 2 - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Fournisseurs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 5 Fournisseurs
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.topFournisseurs}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.nom} (${((entry.montant / stats.totalDepenses) * 100).toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="montant"
                >
                  {stats.topFournisseurs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Commissions par Convention */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Commissions par Convention
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.commissionsParConvention}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}

export default DashboardModern
