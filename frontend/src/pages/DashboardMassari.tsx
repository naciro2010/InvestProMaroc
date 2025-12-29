import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
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
} from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import AppLayout from '@/components/layout/AppLayout'
import { mockDepenses, calculateStats } from '@/lib/mockData'

const DashboardMassari = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  // Filter data based on selected period
  const filteredDepenses = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (selectedPeriod) {
      case 'month':
        startDate = startOfMonth(now)
        break
      case 'quarter':
        startDate = startOfMonth(subMonths(now, 3))
        break
      case 'year':
        startDate = startOfMonth(subMonths(now, 12))
        break
    }

    return mockDepenses.filter(d => new Date(d.dateFacture) >= startDate)
  }, [selectedPeriod])

  const stats = calculateStats(filteredDepenses)

  // Data for charts
  const depensesByMonth = useMemo(() => {
    const months: { [key: string]: number } = {}
    filteredDepenses.forEach(d => {
      const month = format(new Date(d.dateFacture), 'MMM yyyy', { locale: fr })
      months[month] = (months[month] || 0) + d.montantTTC
    })
    return Object.entries(months).map(([month, montant]) => ({
      month,
      montant: Math.round(montant),
    }))
  }, [filteredDepenses])

  const depensesByProjet = useMemo(() => {
    const projets: { [key: string]: number } = {}
    filteredDepenses.forEach(d => {
      projets[d.projet.nom] = (projets[d.projet.nom] || 0) + d.montantTTC
    })
    return Object.entries(projets)
      .map(([nom, montant]) => ({
        name: nom.length > 30 ? nom.substring(0, 30) + '...' : nom,
        value: Math.round(montant),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [filteredDepenses])

  const topFournisseurs = useMemo(() => {
    const fournisseurs: { [key: string]: number } = {}
    filteredDepenses.forEach(d => {
      fournisseurs[d.fournisseur.raisonSociale] =
        (fournisseurs[d.fournisseur.raisonSociale] || 0) + d.montantTTC
    })
    return Object.entries(fournisseurs)
      .map(([nom, montant]) => ({
        nom: nom.length > 25 ? nom.substring(0, 25) + '...' : nom,
        montant: Math.round(montant),
      }))
      .sort((a, b) => b.montant - a.montant)
      .slice(0, 5)
  }, [filteredDepenses])

  const commissionsByConvention = useMemo(() => {
    const conventions: { [key: string]: number } = {}
    filteredDepenses.forEach(d => {
      conventions[d.convention.libelle] =
        (conventions[d.convention.libelle] || 0) + d.commissionTTC
    })
    return Object.entries(conventions).map(([name, value]) => ({
      name: name.length > 30 ? name.substring(0, 30) + '...' : name,
      value: Math.round(value),
    }))
  }, [filteredDepenses])

  const COLORS = ['#1E3A8A', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de Bord MASSARI
            </h1>
            <p className="text-gray-600 mt-1">
              Vue d'ensemble de la gestion des dépenses d'investissement
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="month">Ce mois</option>
              <option value="quarter">3 derniers mois</option>
              <option value="year">12 derniers mois</option>
            </select>

            <button className="btn-primary flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Dépenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-lg p-3">
                <DollarSign className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">
                Dépenses du Mois
              </p>
              <p className="text-3xl font-bold">
                {formatCurrency(stats.totalDepenses)}
              </p>
              <p className="text-blue-100 text-xs mt-2">
                {stats.nombreFactures} factures
              </p>
            </div>
          </motion.div>

          {/* Total Commissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-lg p-3">
                <FileText className="w-6 h-6" />
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
                {((stats.totalCommissions / stats.totalDepenses) * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">
                Commissions Mois
              </p>
              <p className="text-3xl font-bold">
                {formatCurrency(stats.totalCommissions)}
              </p>
              <p className="text-orange-100 text-xs mt-2">
                Sur total dépenses
              </p>
            </div>
          </motion.div>

          {/* Factures à Payer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-lg p-3">
                <Clock className="w-6 h-6" />
              </div>
              <AlertCircle className="w-5 h-5 opacity-80" />
            </div>
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">
                Factures à Payer
              </p>
              <p className="text-3xl font-bold">
                {stats.facturesAValider + stats.facturesValidees}
              </p>
              <p className="text-amber-100 text-xs mt-2">
                Montant: {formatCurrency(stats.montantAPayer)}
              </p>
            </div>
          </motion.div>

          {/* Factures Payées */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-lg p-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
                {stats.tauxPaiement.toFixed(0)}%
              </div>
            </div>
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">
                Factures Payées
              </p>
              <p className="text-3xl font-bold">{stats.facturesPayees}</p>
              <p className="text-green-100 text-xs mt-2">
                Taux de paiement
              </p>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolution Mensuelle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Évolution des Dépenses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={depensesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="montant" fill="#1E3A8A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Répartition par Projet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Répartition par Projet
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={depensesByProjet}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) =>
                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {depensesByProjet.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Fournisseurs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 5 Fournisseurs
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topFournisseurs} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <YAxis type="category" dataKey="nom" width={150} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="montant" fill="#F97316" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Commissions par Convention */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Commissions par Convention
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={commissionsByConvention}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) =>
                    `${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {commissionsByConvention.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Statistiques Rapides
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {stats.nombreFactures}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Factures</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats.facturesPayees}
              </p>
              <p className="text-sm text-gray-600 mt-1">Factures Payées</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">
                {stats.facturesAValider}
              </p>
              <p className="text-sm text-gray-600 mt-1">À Valider</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {stats.facturesValidees}
              </p>
              <p className="text-sm text-gray-600 mt-1">Validées</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  )
}

export default DashboardMassari
