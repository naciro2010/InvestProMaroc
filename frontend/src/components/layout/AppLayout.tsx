import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, Building2, Map, CreditCard,
  Receipt, DollarSign, LogOut, User, Settings,
  Briefcase, ChevronDown, ChevronRight, ShoppingCart, UserCog, Menu, X, Wallet, FileCheck, Banknote, Sparkles, ClipboardCheck, Tags, Handshake
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { colors, typography, borders, transitions, shadows, spacing } from '@/lib/designSystem'

interface AppLayoutProps {
  children: ReactNode
}

interface MenuItem {
  icon: JSX.Element
  label: string
  path: string
  implemented: boolean
}

interface MenuGroup {
  label: string
  icon: JSX.Element
  items: MenuItem[]
  key: string
}

/**
 * AppLayout - Main application shell
 * Design: Confluence/Jira inspired - clean, professional, functional
 */
const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'gestion-financiere': true,
    'projets-tiers': false,
    'parametrage': false,
    'administration': false,
  })

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
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

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }))
  }

  // Menu groups structure
  const menuGroups: MenuGroup[] = [
    {
      key: 'gestion-financiere',
      label: 'Gestion Financière',
      icon: <DollarSign className="w-4 h-4" />,
      items: [
        { icon: <FileText className="w-4 h-4" />, label: 'Conventions', path: '/conventions', implemented: true },
        { icon: <Wallet className="w-4 h-4" />, label: 'Budgets', path: '/budgets', implemented: true },
        { icon: <ShoppingCart className="w-4 h-4" />, label: 'Marchés', path: '/marches', implemented: true },
        { icon: <FileCheck className="w-4 h-4" />, label: 'Décomptes', path: '/decomptes', implemented: true },
        { icon: <ClipboardCheck className="w-4 h-4" />, label: 'Ordres de Paiement', path: '/ordres-paiement', implemented: true },
        { icon: <Banknote className="w-4 h-4" />, label: 'Paiements', path: '/paiements', implemented: true },
        { icon: <Receipt className="w-4 h-4" />, label: 'Dépenses', path: '/depenses', implemented: false },
        { icon: <DollarSign className="w-4 h-4" />, label: 'Commissions', path: '/commissions', implemented: false },
      ]
    },
    {
      key: 'projets-tiers',
      label: 'Projets & Tiers',
      icon: <Building2 className="w-4 h-4" />,
      items: [
        { icon: <Building2 className="w-4 h-4" />, label: 'Projets', path: '/projets', implemented: true },
        { icon: <Users className="w-4 h-4" />, label: 'Fournisseurs', path: '/fournisseurs', implemented: false },
        { icon: <CreditCard className="w-4 h-4" />, label: 'Comptes Bancaires', path: '/comptes-bancaires', implemented: false },
      ]
    },
    {
      key: 'parametrage',
      label: 'Paramétrage',
      icon: <Settings className="w-4 h-4" />,
      items: [
        { icon: <Sparkles className="w-4 h-4" />, label: 'Paramétrage des conventions', path: '/parametrage/conventions', implemented: true },
        { icon: <Map className="w-4 h-4" />, label: 'Axes Analytiques', path: '/parametrage/plan-analytique', implemented: true },
        { icon: <Tags className="w-4 h-4" />, label: 'Catégories de dépenses', path: '/parametrage/categories-depenses', implemented: true },
        { icon: <Handshake className="w-4 h-4" />, label: 'Partenaires', path: '/parametrage/partenaires', implemented: true },
      ]
    },
    {
      key: 'administration',
      label: 'Administration',
      icon: <UserCog className="w-4 h-4" />,
      items: [
        { icon: <UserCog className="w-4 h-4" />, label: 'Utilisateurs', path: '/users', implemented: true },
      ]
    }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Styles
  const sidebarStyles = {
    container: {
      position: 'fixed' as const,
      left: 0,
      top: 0,
      height: '100vh',
      width: '260px',
      backgroundColor: colors.surface,
      borderRight: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column' as const,
      zIndex: 40,
      transition: `transform ${transitions.normal}`,
      boxShadow: isMobile ? shadows.lg : 'none',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
      padding: `${spacing.lg} ${spacing.xl}`,
      borderBottom: `1px solid ${colors.border}`,
    },
    logoIcon: {
      width: 32,
      height: 32,
      backgroundColor: colors.primary[600],
      borderRadius: borders.radius.md,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    nav: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: `${spacing.md} 0`,
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spacing.sm} ${spacing.lg}`,
      margin: `2px ${spacing.sm}`,
      borderRadius: borders.radius.base,
      color: colors.textSecondary,
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.medium,
      textDecoration: 'none',
      transition: `all ${transitions.fast}`,
      cursor: 'pointer',
    },
    menuItemActive: {
      backgroundColor: colors.primary[50],
      color: colors.primary[700],
    },
    menuItemHover: {
      backgroundColor: colors.neutral[100],
      color: colors.textPrimary,
    },
    groupHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spacing.xs} ${spacing.lg}`,
      margin: `${spacing.sm} ${spacing.sm} 2px`,
      borderRadius: borders.radius.base,
      color: colors.textSecondary,
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
      textTransform: 'uppercase' as const,
      letterSpacing: typography.letterSpacing.wider,
      cursor: 'pointer',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.xs,
      padding: `2px ${spacing.sm}`,
      backgroundColor: colors.purple[50],
      color: colors.purple[700],
      fontSize: typography.sizes['2xs'],
      fontWeight: typography.weights.medium,
      borderRadius: borders.radius.full,
    },
    userSection: {
      borderTop: `1px solid ${colors.border}`,
      padding: spacing.md,
    },
    userButton: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
      width: '100%',
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: borders.radius.base,
      cursor: 'pointer',
      transition: `background-color ${transitions.fast}`,
    },
    avatar: {
      width: 32,
      height: 32,
      backgroundColor: colors.primary[600],
      borderRadius: borders.radius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.textOnColor,
      fontWeight: typography.weights.semibold,
      fontSize: typography.sizes.sm,
      flexShrink: 0,
    },
    dropdown: {
      position: 'absolute' as const,
      bottom: '100%',
      left: 0,
      right: 0,
      marginBottom: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: borders.radius.lg,
      border: `1px solid ${colors.border}`,
      boxShadow: shadows.lg,
      overflow: 'hidden',
    },
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: colors.background }}>
      {/* Backdrop overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          ...sidebarStyles.container,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className="lg:translate-x-0"
      >
        {/* Logo */}
        <div style={sidebarStyles.logo}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: spacing.md, textDecoration: 'none' }}>
            <div style={sidebarStyles.logoIcon}>
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <span style={{ color: colors.textPrimary, fontWeight: typography.weights.semibold, fontSize: typography.sizes.lg }}>
                InvestPro
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={sidebarStyles.nav}>
          {/* Dashboard - Always visible */}
          <Link
            to="/dashboard"
            style={{
              ...sidebarStyles.menuItem,
              ...(isActive('/dashboard') ? sidebarStyles.menuItemActive : {}),
            }}
            onMouseEnter={(e) => {
              if (!isActive('/dashboard')) {
                Object.assign(e.currentTarget.style, sidebarStyles.menuItemHover)
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/dashboard')) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = colors.textSecondary
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </Link>

          <div style={{ height: '1px', backgroundColor: colors.divider, margin: `${spacing.sm} ${spacing.lg}` }} />

          {/* Grouped Menu Items */}
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups[group.key]
            const hasActiveItem = group.items.some(item => isActive(item.path))

            return (
              <div key={group.key} style={{ marginBottom: spacing.xs }}>
                {/* Group Header */}
                <div
                  onClick={() => toggleGroup(group.key)}
                  style={{
                    ...sidebarStyles.groupHeader,
                    ...(hasActiveItem && !isExpanded ? { backgroundColor: colors.primary[50], color: colors.primary[700] } : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!(hasActiveItem && !isExpanded)) {
                      e.currentTarget.style.backgroundColor = colors.neutral[50]
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(hasActiveItem && !isExpanded)) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    {group.icon}
                    <span>{group.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </div>

                {/* Group Items */}
                {isExpanded && (
                  <div style={{ marginTop: '2px' }}>
                    {group.items.map((item, itemIndex) => {
                      const itemActive = isActive(item.path)
                      return (
                        <Link
                          key={itemIndex}
                          to={item.path}
                          style={{
                            ...sidebarStyles.menuItem,
                            marginLeft: spacing.xl,
                            ...(itemActive ? sidebarStyles.menuItemActive : {}),
                          }}
                          onMouseEnter={(e) => {
                            if (!itemActive) {
                              Object.assign(e.currentTarget.style, sidebarStyles.menuItemHover)
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!itemActive) {
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.color = colors.textSecondary
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                          {!item.implemented && (
                            <span style={sidebarStyles.badge}>
                              <Sparkles className="w-3 h-3" />
                              Bientôt
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* User Section */}
        <div style={sidebarStyles.userSection}>
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={sidebarStyles.userButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.neutral[100]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <div style={sidebarStyles.avatar}>
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                  color: colors.textPrimary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: 0,
                }}>
                  {user?.fullName || 'User'}
                </p>
                <p style={{
                  fontSize: typography.sizes.xs,
                  color: colors.textSecondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: 0,
                }}>
                  {user?.email || ''}
                </p>
              </div>
              <ChevronDown className="w-4 h-4" style={{ color: colors.textSecondary, flexShrink: 0 }} />
            </div>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div style={sidebarStyles.dropdown}>
                <button
                  onClick={() => {
                    navigate('/profile')
                    setUserMenuOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.md,
                    width: '100%',
                    padding: `${spacing.sm} ${spacing.lg}`,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: colors.textPrimary,
                    fontSize: typography.sizes.sm,
                    transition: `background-color ${transitions.fast}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.neutral[50]
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <User className="w-4 h-4" style={{ color: colors.textSecondary }} />
                  <span>Mon profil</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/parametrage/conventions')
                    setUserMenuOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.md,
                    width: '100%',
                    padding: `${spacing.sm} ${spacing.lg}`,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: colors.textPrimary,
                    fontSize: typography.sizes.sm,
                    transition: `background-color ${transitions.fast}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.neutral[50]
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Settings className="w-4 h-4" style={{ color: colors.textSecondary }} />
                  <span>Paramètres</span>
                </button>
                <div style={{ height: '1px', backgroundColor: colors.divider }} />
                <button
                  onClick={() => {
                    handleLogout()
                    setUserMenuOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.md,
                    width: '100%',
                    padding: `${spacing.sm} ${spacing.lg}`,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: colors.danger[600],
                    fontSize: typography.sizes.sm,
                    transition: `background-color ${transitions.fast}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.danger[50]
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        width: '100%',
        marginLeft: isMobile ? 0 : '260px',
        transition: `margin-left ${transitions.normal}`,
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <div style={{
            padding: `${spacing.md} ${spacing.xl}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: spacing.sm,
                borderRadius: borders.radius.base,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: `background-color ${transitions.fast}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.neutral[100]
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {sidebarOpen && isMobile ? (
                <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
              ) : (
                <Menu className="w-5 h-5" style={{ color: colors.textSecondary }} />
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg }}>
              <span style={{
                fontSize: typography.sizes.sm,
                color: colors.textSecondary,
                display: isMobile ? 'none' : 'block',
              }}>
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {/* Mobile: Show only avatar */}
              <div
                className="lg:hidden"
                style={{
                  ...sidebarStyles.avatar,
                  display: isMobile ? 'flex' : 'none',
                }}
              >
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{
          padding: isMobile ? spacing.lg : spacing.xl,
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
