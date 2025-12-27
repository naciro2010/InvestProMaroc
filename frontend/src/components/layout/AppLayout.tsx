import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Users, Building2, Map, CreditCard,
  Receipt, DollarSign, LogOut, Menu, X, User, Settings,
  Briefcase, ChevronDown, ShoppingCart, UserCog
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'Conventions', path: '/conventions' },
    { icon: <Building2 className="w-5 h-5" />, label: 'Projets', path: '/projets' },
    { icon: <Users className="w-5 h-5" />, label: 'Fournisseurs', path: '/fournisseurs' },
    { icon: <Map className="w-5 h-5" />, label: 'Axes Analytiques', path: '/axes-analytiques' },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Comptes Bancaires', path: '/comptes-bancaires' },
    { icon: <Receipt className="w-5 h-5" />, label: 'Dépenses', path: '/depenses' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Marchés', path: '/marches' },
    { icon: <DollarSign className="w-5 h-5" />, label: 'Commissions', path: '/commissions' },
    { icon: <UserCog className="w-5 h-5" />, label: 'Utilisateurs', path: '/users' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-gray-200 z-40 overflow-y-auto"
          >
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    InvestPro
                  </span>
                  <p className="text-xs text-gray-500">Gestion d'investissement</p>
                </div>
              </Link>
            </div>

            {/* Menu */}
            <nav className="p-4 space-y-1">
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* User Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                    >
                      <button
                        onClick={() => navigate('/profile')}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Mon profil</span>
                      </button>
                      <button
                        onClick={() => navigate('/settings')}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Paramètres</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600">Déconnexion</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenue, <span className="font-medium text-gray-900">{user?.fullName}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
