import { ReactNode, useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, Building2, Map, CreditCard,
  Receipt, DollarSign, LogOut, User, Settings,
  Briefcase, ChevronDown, ChevronRight, ShoppingCart, UserCog, Menu, X, Wallet, FileCheck, Banknote, ClipboardCheck, Tags, Handshake, GripVertical, BarChart3
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { colors, typography, borders, transitions, shadows, spacing } from '@/lib/designSystem'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
  items: MenuItem[]
  key: string
}

// Storage key for menu order
const MENU_ORDER_KEY = 'investpro_menu_order'

// Get saved menu order from localStorage
const getSavedMenuOrder = (): string[] | null => {
  try {
    const saved = localStorage.getItem(MENU_ORDER_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

// Save menu order to localStorage
const saveMenuOrder = (order: string[]) => {
  try {
    localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(order))
  } catch {
    console.error('Failed to save menu order')
  }
}

// Sortable menu group component
interface SortableGroupProps {
  group: MenuGroup
  isExpanded: boolean
  hasActiveItem: boolean
  onToggle: () => void
  children: React.ReactNode
  isActive: (path: string) => boolean
}

const SortableGroup = ({ group, isExpanded, hasActiveItem, onToggle, children }: SortableGroupProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.key })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      {/* Group header - clean divider style */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `${spacing.lg} ${spacing.xl} ${spacing.xs}`,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Drag handle - appears on hover */}
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            padding: '2px',
            marginRight: spacing.xs,
            color: colors.neutral[300],
            display: 'flex',
            alignItems: 'center',
            borderRadius: borders.radius.sm,
            transition: `all ${transitions.fast}`,
            opacity: 0.4,
          }}
          title="Glisser pour réorganiser"
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.color = colors.neutral[500]
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.4'
            e.currentTarget.style.color = colors.neutral[300]
          }}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <div
          onClick={onToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            cursor: 'pointer',
          }}
        >
          <span style={{
            fontSize: typography.sizes['2xs'],
            fontWeight: typography.weights.semibold,
            color: hasActiveItem ? colors.primary[600] : colors.neutral[400],
            textTransform: 'uppercase',
            letterSpacing: typography.letterSpacing.widest,
          }}>
            {group.label}
          </span>
          <span style={{ color: colors.neutral[300], display: 'flex' }}>
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        </div>
      </div>
      {isExpanded && children}
    </div>
  )
}

/**
 * AppLayout - Main application shell
 * Design: Clean, professional, Confluence/Jira-inspired
 * Sidebar: Sober with clear visual hierarchy, left-border active indicators
 */
const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'conventions-budgets': true,
    'marches-decomptes': true,
    'paiements': true,
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

  // Close sidebar on route change on mobile + auto-expand active group
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
    // Auto-expand the group containing the active route
    const activeGroup = menuGroups.find(group =>
      group.items.some(item =>
        location.pathname === item.path || location.pathname.startsWith(item.path + '/')
      )
    )
    if (activeGroup && !expandedGroups[activeGroup.key]) {
      setExpandedGroups(prev => ({ ...prev, [activeGroup.key]: true }))
    }
  }, [location.pathname, isMobile]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }))
  }

  // Default menu groups - clean, no group icons (divider-style headers)
  const defaultMenuGroups: MenuGroup[] = [
    {
      key: 'conventions-budgets',
      label: 'Conventions & Budgets',
      items: [
        { icon: <FileText className="w-[18px] h-[18px]" />, label: 'Conventions', path: '/conventions', implemented: true },
        { icon: <Wallet className="w-[18px] h-[18px]" />, label: 'Budgets', path: '/budgets', implemented: true },
      ]
    },
    {
      key: 'marches-decomptes',
      label: 'Marchés & Décomptes',
      items: [
        { icon: <ShoppingCart className="w-[18px] h-[18px]" />, label: 'Marchés', path: '/marches', implemented: true },
        { icon: <FileCheck className="w-[18px] h-[18px]" />, label: 'Décomptes', path: '/decomptes', implemented: true },
      ]
    },
    {
      key: 'paiements',
      label: 'Paiements',
      items: [
        { icon: <ClipboardCheck className="w-[18px] h-[18px]" />, label: 'Ordres de Paiement', path: '/ordres-paiement', implemented: true },
        { icon: <Banknote className="w-[18px] h-[18px]" />, label: 'Paiements', path: '/paiements', implemented: true },
        { icon: <Receipt className="w-[18px] h-[18px]" />, label: 'Dépenses', path: '/depenses', implemented: false },
        { icon: <DollarSign className="w-[18px] h-[18px]" />, label: 'Commissions', path: '/commissions', implemented: false },
      ]
    },
    {
      key: 'projets-tiers',
      label: 'Projets & Tiers',
      items: [
        { icon: <Building2 className="w-[18px] h-[18px]" />, label: 'Projets', path: '/projets', implemented: true },
        { icon: <Users className="w-[18px] h-[18px]" />, label: 'Fournisseurs', path: '/fournisseurs', implemented: false },
        { icon: <CreditCard className="w-[18px] h-[18px]" />, label: 'Comptes Bancaires', path: '/comptes-bancaires', implemented: false },
      ]
    },
    {
      key: 'parametrage',
      label: 'Paramétrage',
      items: [
        { icon: <Settings className="w-[18px] h-[18px]" />, label: 'Paramétrage des conventions', path: '/parametrage/conventions', implemented: true },
        { icon: <Map className="w-[18px] h-[18px]" />, label: 'Axes Analytiques', path: '/parametrage/plan-analytique', implemented: true },
        { icon: <Tags className="w-[18px] h-[18px]" />, label: 'Catégories de dépenses', path: '/parametrage/categories-depenses', implemented: true },
        { icon: <Handshake className="w-[18px] h-[18px]" />, label: 'Partenaires', path: '/parametrage/partenaires', implemented: true },
      ]
    },
    {
      key: 'administration',
      label: 'Administration',
      items: [
        { icon: <UserCog className="w-[18px] h-[18px]" />, label: 'Utilisateurs', path: '/users', implemented: true },
      ]
    }
  ]

  // State for ordered menu groups (persisted)
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>(() => {
    const savedOrder = getSavedMenuOrder()
    if (savedOrder) {
      // Reorder defaultMenuGroups based on saved order
      const orderedGroups: MenuGroup[] = []
      savedOrder.forEach(key => {
        const group = defaultMenuGroups.find(g => g.key === key)
        if (group) orderedGroups.push(group)
      })
      // Add any new groups not in saved order
      defaultMenuGroups.forEach(group => {
        if (!savedOrder.includes(group.key)) {
          orderedGroups.push(group)
        }
      })
      return orderedGroups
    }
    return defaultMenuGroups
  })

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced for easier drag activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setMenuGroups((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id)
        const newIndex = items.findIndex((item) => item.key === over.id)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        // Save to localStorage
        saveMenuOrder(newOrder.map(g => g.key))
        return newOrder
      })
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Styles - Professional, sober design using only designSystem tokens
  const sidebarWidth = '264px'

  const sidebarStyles = {
    container: {
      position: 'fixed' as const,
      left: 0,
      top: 0,
      height: '100vh',
      width: sidebarWidth,
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
      padding: `${spacing.xl} ${spacing.xl}`,
      borderBottom: `1px solid ${colors.border}`,
    },
    logoIcon: {
      width: 34,
      height: 34,
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
      padding: `${spacing.sm} 0`,
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.xs,
      padding: `2px ${spacing.sm}`,
      backgroundColor: colors.neutral[100],
      color: colors.neutral[500],
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
      width: 34,
      height: 34,
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

  // Menu item style builder - returns inline styles based on active state
  const getMenuItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `10px ${spacing.xl}`,
    paddingLeft: spacing['2xl'],
    minHeight: '40px',
    color: active ? colors.primary[700] : colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: active ? typography.weights.semibold : typography.weights.medium,
    textDecoration: 'none',
    transition: `all ${transitions.fast}`,
    cursor: 'pointer',
    borderLeft: active ? `3px solid ${colors.primary[600]}` : '3px solid transparent',
    backgroundColor: active ? colors.primary[25] : 'transparent',
  })

  // Top-level nav item style (Dashboard, Reporting)
  const getTopNavStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `10px ${spacing.xl}`,
    minHeight: '42px',
    color: active ? colors.primary[700] : colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: active ? typography.weights.semibold : typography.weights.medium,
    textDecoration: 'none',
    transition: `all ${transitions.fast}`,
    cursor: 'pointer',
    borderLeft: active ? `3px solid ${colors.primary[600]}` : '3px solid transparent',
    backgroundColor: active ? colors.primary[25] : 'transparent',
  })

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
          transform: (sidebarOpen || !isMobile) ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Logo */}
        <div style={sidebarStyles.logo}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: spacing.md, textDecoration: 'none' }}>
            <div style={sidebarStyles.logoIcon}>
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <span style={{ color: colors.textPrimary, fontWeight: typography.weights.bold, fontSize: typography.sizes.lg, letterSpacing: typography.letterSpacing.tight }}>
                InvestPro
              </span>
              <span style={{ color: colors.neutral[400], fontWeight: typography.weights.normal, fontSize: typography.sizes.lg }}> Maroc</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={sidebarStyles.nav}>
          {/* Top-level quick links */}
          <Link
            to="/dashboard"
            style={getTopNavStyle(isActive('/dashboard'))}
            onMouseEnter={(e) => {
              if (!isActive('/dashboard')) {
                e.currentTarget.style.backgroundColor = colors.neutral[50]
                e.currentTarget.style.color = colors.textPrimary
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/dashboard')) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = colors.textPrimary
              }
            }}
          >
            <LayoutDashboard className="w-[18px] h-[18px]" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/reporting"
            style={getTopNavStyle(isActive('/reporting'))}
            onMouseEnter={(e) => {
              if (!isActive('/reporting')) {
                e.currentTarget.style.backgroundColor = colors.neutral[50]
                e.currentTarget.style.color = colors.textPrimary
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/reporting')) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = colors.textPrimary
              }
            }}
          >
            <BarChart3 className="w-[18px] h-[18px]" />
            <span>Reporting</span>
          </Link>

          {/* Grouped Menu Items with Drag & Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={menuGroups.map(g => g.key)}
              strategy={verticalListSortingStrategy}
            >
              {menuGroups.map((group) => {
                const isGroupExpanded = expandedGroups[group.key]
                const hasActiveItem = group.items.some(item => isActive(item.path))

                return (
                  <SortableGroup
                    key={group.key}
                    group={group}
                    isExpanded={isGroupExpanded}
                    hasActiveItem={hasActiveItem}
                    onToggle={() => toggleGroup(group.key)}
                    isActive={isActive}
                  >
                    {/* Group Items */}
                    <div style={{ paddingBottom: spacing.xs }}>
                      {group.items.map((item, itemIndex) => {
                        const itemActive = isActive(item.path)
                        return (
                          <Link
                            key={itemIndex}
                            to={item.path}
                            style={getMenuItemStyle(itemActive)}
                            onMouseEnter={(e) => {
                              if (!itemActive) {
                                e.currentTarget.style.backgroundColor = colors.neutral[50]
                                e.currentTarget.style.color = colors.textPrimary
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
                                Bientôt
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </SortableGroup>
                )
              })}
            </SortableContext>
          </DndContext>
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
        marginLeft: isMobile ? 0 : sidebarWidth,
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
