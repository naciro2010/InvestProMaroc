import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, Building2, Map, CreditCard,
  Receipt, DollarSign, LogOut, User, Settings,
  Briefcase, ChevronDown, ShoppingCart, UserCog, Menu, X, Wallet, FileCheck, Banknote
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Par défaut sidebar fermée sur mobile, ouverte sur desktop
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'Conventions', path: '/conventions' },
    { icon: <Wallet className="w-5 h-5" />, label: 'Budgets', path: '/budgets' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Marchés', path: '/marches' },
    { icon: <FileCheck className="w-5 h-5" />, label: 'Décomptes', path: '/decomptes' },
    { icon: <Banknote className="w-5 h-5" />, label: 'Paiements', path: '/paiements' },
    { icon: <Building2 className="w-5 h-5" />, label: 'Projets', path: '/projets' },
    { icon: <Users className="w-5 h-5" />, label: 'Fournisseurs', path: '/fournisseurs' },
    { icon: <Map className="w-5 h-5" />, label: 'Axes Analytiques', path: '/axes-analytiques' },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Comptes Bancaires', path: '/comptes-bancaires' },
    { icon: <Receipt className="w-5 h-5" />, label: 'Dépenses', path: '/depenses' },
    { icon: <DollarSign className="w-5 h-5" />, label: 'Commissions', path: '/commissions' },
    { icon: <UserCog className="w-5 h-5" />, label: 'Utilisateurs', path: '/users' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Backdrop overlay pour mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* GitLab Style Sidebar - Dark - Responsive */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gitlab-orange rounded flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-lg">InvestPro</span>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2.5 mx-2 rounded transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-800 p-3">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-gitlab-orange rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.fullName || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded border border-gray-200 shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    navigate('/profile')
                    setUserMenuOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Mon profil</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/settings')
                    setUserMenuOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Paramètres</span>
                </button>
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => {
                      handleLogout()
                      setUserMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-danger-500" />
                    <span className="text-sm text-danger-600">Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area - Responsive */}
      <div className={`flex-1 w-full lg:ml-64`}>
        {/* GitLab Style Header - Responsive */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {/* Mobile: Show only icon */}
              <div className="lg:hidden w-8 h-8 bg-gitlab-orange rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content - Responsive padding */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
