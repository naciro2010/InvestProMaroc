import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/layout/AppLayout'
import {
  TrendingUp, DollarSign, Briefcase, FileText,
  ArrowUpRight, ArrowDownRight, Calendar
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Dépenses totales',
      value: '2,450,000 MAD',
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Commissions',
      value: '61,250 MAD',
      change: '+8.2%',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Projets actifs',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Factures en attente',
      value: '8',
      change: '-3',
      trend: 'down',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>

              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Activité récente
              </h2>
              <div className="text-center py-12 text-gray-500">
                Aucune activité récente
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions rapides
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium transition-colors">
                  Nouvelle dépense
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors">
                  Ajouter un projet
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors">
                  Exporter les données
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default Dashboard
