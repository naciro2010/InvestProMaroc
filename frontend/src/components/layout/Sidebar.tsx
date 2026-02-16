import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, Building2, Map, CreditCard,
  Receipt, DollarSign, LogOut, User, Settings, Briefcase, ChevronDown,
  ShoppingCart, UserCog, Wallet, FileCheck, Banknote, ClipboardCheck,
  Tags, Handshake, BarChart3
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { colors, typography, borders, transitions, shadows, spacing } from '@/lib/designSystem'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableGroup, { MenuGroup } from './SortableGroup'

export const SIDEBAR_WIDTH = '264px'

const MENU_ORDER_KEY = 'investpro_menu_order'

const getSavedMenuOrder = (): string[] | null => {
  try {
    const saved = localStorage.getItem(MENU_ORDER_KEY)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

const saveMenuOrder = (order: string[]) => {
  try { localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(order)) }
  catch { console.error('Failed to save menu order') }
}

const defaultMenuGroups: MenuGroup[] = [
  { key: 'conventions-budgets', label: 'Conventions & Budgets', items: [
    { icon: <FileText className="w-[18px] h-[18px]" />, label: 'Conventions', path: '/conventions', implemented: true },
    { icon: <Wallet className="w-[18px] h-[18px]" />, label: 'Budgets', path: '/budgets', implemented: true },
  ]},
  { key: 'execution-marches', label: 'Exécution des marchés', items: [
    { icon: <ShoppingCart className="w-[18px] h-[18px]" />, label: 'Marchés', path: '/marches', implemented: true },
    { icon: <FileCheck className="w-[18px] h-[18px]" />, label: 'Décomptes', path: '/decomptes', implemented: true },
    { icon: <Banknote className="w-[18px] h-[18px]" />, label: 'Paiements', path: '/paiements', implemented: true },
    { icon: <ClipboardCheck className="w-[18px] h-[18px]" />, label: 'Ordres de Paiement', path: '/ordres-paiement', implemented: true },
  ]},
  { key: 'contrats-documents', label: 'Contrats & Documents', items: [
    { icon: <Briefcase className="w-[18px] h-[18px]" />, label: 'Contrats', path: '/marches', implemented: true },
    { icon: <Receipt className="w-[18px] h-[18px]" />, label: 'Bons de commande', path: '/marches', implemented: true },
    { icon: <FileText className="w-[18px] h-[18px]" />, label: 'Lettres de commande', path: '/marches', implemented: true },
  ]},
  { key: 'finances', label: 'Finances', items: [
    { icon: <Receipt className="w-[18px] h-[18px]" />, label: 'Dépenses', path: '/depenses', implemented: false },
    { icon: <DollarSign className="w-[18px] h-[18px]" />, label: 'Commissions', path: '/commissions', implemented: false },
  ]},
  { key: 'projets-tiers', label: 'Projets & Tiers', items: [
    { icon: <Building2 className="w-[18px] h-[18px]" />, label: 'Projets', path: '/projets', implemented: true },
    { icon: <Users className="w-[18px] h-[18px]" />, label: 'Fournisseurs', path: '/fournisseurs', implemented: false },
    { icon: <CreditCard className="w-[18px] h-[18px]" />, label: 'Comptes Bancaires', path: '/comptes-bancaires', implemented: false },
  ]},
  { key: 'parametrage', label: 'Paramétrage', items: [
    { icon: <Settings className="w-[18px] h-[18px]" />, label: 'Paramétrage des conventions', path: '/parametrage/conventions', implemented: true },
    { icon: <Map className="w-[18px] h-[18px]" />, label: 'Axes Analytiques', path: '/parametrage/plan-analytique', implemented: true },
    { icon: <Tags className="w-[18px] h-[18px]" />, label: 'Catégories de dépenses', path: '/parametrage/categories-depenses', implemented: true },
    { icon: <Handshake className="w-[18px] h-[18px]" />, label: 'Partenaires', path: '/parametrage/partenaires', implemented: true },
  ]},
  { key: 'administration', label: 'Administration', items: [
    { icon: <UserCog className="w-[18px] h-[18px]" />, label: 'Utilisateurs', path: '/users', implemented: true },
  ]},
]

// Static styles (module-level to reduce component size)
const staticStyles = {
  logo: {
    display: 'flex', alignItems: 'center', gap: spacing.md,
    padding: `${spacing.xl} ${spacing.xl}`, borderBottom: `1px solid ${colors.border}`,
  },
  logoIcon: {
    width: 34, height: 34, backgroundColor: colors.primary[600],
    borderRadius: borders.radius.md, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  nav: { flex: 1, overflowY: 'auto' as const, padding: `${spacing.sm} 0` },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: spacing.xs,
    padding: `2px ${spacing.sm}`, backgroundColor: colors.neutral[100],
    color: colors.neutral[500], fontSize: typography.sizes['2xs'],
    fontWeight: typography.weights.medium, borderRadius: borders.radius.full,
  },
  userSection: { borderTop: `1px solid ${colors.border}`, padding: spacing.md },
  userButton: {
    display: 'flex', alignItems: 'center', gap: spacing.md, width: '100%',
    padding: `${spacing.sm} ${spacing.md}`, borderRadius: borders.radius.base,
    cursor: 'pointer', transition: `background-color ${transitions.fast}`,
  },
  avatar: {
    width: 34, height: 34, backgroundColor: colors.primary[600],
    borderRadius: borders.radius.full, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: colors.textOnColor,
    fontWeight: typography.weights.semibold, fontSize: typography.sizes.sm, flexShrink: 0,
  },
  dropdown: {
    position: 'absolute' as const, bottom: '100%', left: 0, right: 0,
    marginBottom: spacing.sm, backgroundColor: colors.surface,
    borderRadius: borders.radius.lg, border: `1px solid ${colors.border}`,
    boxShadow: shadows.lg, overflow: 'hidden',
  },
  dropdownButton: {
    display: 'flex', alignItems: 'center', gap: spacing.md, width: '100%',
    padding: `${spacing.sm} ${spacing.lg}`, backgroundColor: 'transparent',
    border: 'none', cursor: 'pointer', textAlign: 'left' as const,
    fontSize: typography.sizes.sm, transition: `background-color ${transitions.fast}`,
  },
  truncatedText: { overflow: 'hidden' as const, textOverflow: 'ellipsis' as const, whiteSpace: 'nowrap' as const, margin: 0 },
}

const getMenuItemStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: `10px ${spacing.xl}`, paddingLeft: spacing['2xl'], minHeight: '40px',
  color: active ? colors.primary[700] : colors.textSecondary,
  fontSize: typography.sizes.sm,
  fontWeight: active ? typography.weights.semibold : typography.weights.medium,
  textDecoration: 'none', transition: `all ${transitions.fast}`, cursor: 'pointer',
  borderLeft: active ? `3px solid ${colors.primary[600]}` : '3px solid transparent',
  backgroundColor: active ? colors.primary[25] : 'transparent',
})

const getTopNavStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: spacing.md,
  padding: `10px ${spacing.xl}`, minHeight: '42px',
  color: active ? colors.primary[700] : colors.textPrimary,
  fontSize: typography.sizes.base,
  fontWeight: active ? typography.weights.semibold : typography.weights.medium,
  textDecoration: 'none', transition: `all ${transitions.fast}`, cursor: 'pointer',
  borderLeft: active ? `3px solid ${colors.primary[600]}` : '3px solid transparent',
  backgroundColor: active ? colors.primary[25] : 'transparent',
})

interface SidebarProps {
  isOpen: boolean
  isMobile: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, isMobile, onClose }: SidebarProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'conventions-budgets': true, 'execution-marches': true, 'contrats-documents': true,
    'finances': true, 'projets-tiers': false, 'parametrage': false, 'administration': false,
  })

  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>(() => {
    const savedOrder = getSavedMenuOrder()
    if (savedOrder) {
      const orderedGroups: MenuGroup[] = []
      savedOrder.forEach(key => {
        const group = defaultMenuGroups.find(g => g.key === key)
        if (group) orderedGroups.push(group)
      })
      defaultMenuGroups.forEach(group => {
        if (!savedOrder.includes(group.key)) orderedGroups.push(group)
      })
      return orderedGroups
    }
    return defaultMenuGroups
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setMenuGroups((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id)
        const newIndex = items.findIndex((item) => item.key === over.id)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        saveMenuOrder(newOrder.map(g => g.key))
        return newOrder
      })
    }
  }, [])

  useEffect(() => {
    if (isMobile) onClose()
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
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }))
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  const hoverBg = (bg: string, leave: string) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = bg },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = leave },
  })

  const topLinkHover = (path: string) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isActive(path)) { e.currentTarget.style.backgroundColor = colors.neutral[50]; e.currentTarget.style.color = colors.textPrimary }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isActive(path)) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.textPrimary }
    },
  })

  const containerStyle: React.CSSProperties = {
    position: 'fixed', left: 0, top: 0, height: '100vh', width: SIDEBAR_WIDTH,
    backgroundColor: colors.surface, borderRight: `1px solid ${colors.border}`,
    display: 'flex', flexDirection: 'column', zIndex: 40,
    transition: `transform ${transitions.normal}`,
    boxShadow: isMobile ? shadows.lg : 'none',
    transform: (isOpen || !isMobile) ? 'translateX(0)' : 'translateX(-100%)',
  }

  return (
    <aside style={containerStyle}>
      {/* Logo */}
      <div style={staticStyles.logo}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: spacing.md, textDecoration: 'none' }}>
          <div style={staticStyles.logoIcon}>
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
      <nav style={staticStyles.nav}>
        <Link to="/dashboard" style={getTopNavStyle(isActive('/dashboard'))} {...topLinkHover('/dashboard')}>
          <LayoutDashboard className="w-[18px] h-[18px]" />
          <span>Dashboard</span>
        </Link>
        <Link to="/reporting" style={getTopNavStyle(isActive('/reporting'))} {...topLinkHover('/reporting')}>
          <BarChart3 className="w-[18px] h-[18px]" />
          <span>Reporting</span>
        </Link>

        {/* Grouped Menu Items with Drag & Drop */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={menuGroups.map(g => g.key)} strategy={verticalListSortingStrategy}>
            {menuGroups.map((group) => (
              <SortableGroup
                key={group.key}
                group={group}
                isExpanded={expandedGroups[group.key]}
                hasActiveItem={group.items.some(item => isActive(item.path))}
                onToggle={() => toggleGroup(group.key)}
                isActive={isActive}
              >
                <div style={{ paddingBottom: spacing.xs }}>
                  {group.items.map((item, itemIndex) => {
                    const itemActive = isActive(item.path)
                    return (
                      <Link
                        key={itemIndex}
                        to={item.path}
                        style={getMenuItemStyle(itemActive)}
                        onMouseEnter={(e) => {
                          if (!itemActive) { e.currentTarget.style.backgroundColor = colors.neutral[50]; e.currentTarget.style.color = colors.textPrimary }
                        }}
                        onMouseLeave={(e) => {
                          if (!itemActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.textSecondary }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {!item.implemented && <span style={staticStyles.badge}>Bientôt</span>}
                      </Link>
                    )
                  })}
                </div>
              </SortableGroup>
            ))}
          </SortableContext>
        </DndContext>
      </nav>

      {/* User Section */}
      <div style={staticStyles.userSection}>
        <div style={{ position: 'relative' }}>
          <div onClick={() => setUserMenuOpen(!userMenuOpen)} style={staticStyles.userButton} {...hoverBg(colors.neutral[100], 'transparent')}>
            <div style={staticStyles.avatar}>
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ ...staticStyles.truncatedText, fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textPrimary }}>
                {user?.fullName || 'User'}
              </p>
              <p style={{ ...staticStyles.truncatedText, fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                {user?.email || ''}
              </p>
            </div>
            <ChevronDown className="w-4 h-4" style={{ color: colors.textSecondary, flexShrink: 0 }} />
          </div>

          {userMenuOpen && (
            <div style={staticStyles.dropdown}>
              <button onClick={() => { navigate('/profile'); setUserMenuOpen(false) }}
                style={{ ...staticStyles.dropdownButton, color: colors.textPrimary }} {...hoverBg(colors.neutral[50], 'transparent')}>
                <User className="w-4 h-4" style={{ color: colors.textSecondary }} />
                <span>Mon profil</span>
              </button>
              <button onClick={() => { navigate('/parametrage/conventions'); setUserMenuOpen(false) }}
                style={{ ...staticStyles.dropdownButton, color: colors.textPrimary }} {...hoverBg(colors.neutral[50], 'transparent')}>
                <Settings className="w-4 h-4" style={{ color: colors.textSecondary }} />
                <span>Paramètres</span>
              </button>
              <div style={{ height: '1px', backgroundColor: colors.divider }} />
              <button onClick={() => { handleLogout(); setUserMenuOpen(false) }}
                style={{ ...staticStyles.dropdownButton, color: colors.danger[600] }} {...hoverBg(colors.danger[50], 'transparent')}>
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
