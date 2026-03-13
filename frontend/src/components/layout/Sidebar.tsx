import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, Building2, Map, CreditCard,
  Receipt, DollarSign, LogOut, User, Settings, Briefcase, ChevronDown,
  ShoppingCart, UserCog, Wallet, Tags, Handshake, BarChart3, Search, X,
  Command, Sparkles,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { colors, typography, borders, transitions, shadows } from '@/lib/designSystem'
import NotificationCenter from '@/components/core/NotificationCenter'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableGroup, { MenuGroup } from './SortableGroup'

export const SIDEBAR_WIDTH = '256px'
const MENU_ORDER_KEY = 'investpro_menu_order_v2'

const getSavedMenuOrder = (): string[] | null => {
  try {
    const saved = localStorage.getItem(MENU_ORDER_KEY)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

const saveMenuOrder = (order: string[]) => {
  try { localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(order)) }
  catch { /* ignore */ }
}

const defaultMenuGroups: MenuGroup[] = [
  { key: 'operations', label: 'Operations', items: [
    { icon: <FileText className="w-4 h-4" />, label: 'Conventions', path: '/conventions', implemented: true },
    { icon: <ShoppingCart className="w-4 h-4" />, label: 'Marches', path: '/marches', implemented: true },
    { icon: <Building2 className="w-4 h-4" />, label: 'Projets', path: '/projets', implemented: true },
    { icon: <Receipt className="w-4 h-4" />, label: 'Decomptes', path: '/decomptes', implemented: true },
  ]},
  { key: 'finances', label: 'Finances', items: [
    { icon: <Wallet className="w-4 h-4" />, label: 'Budgets', path: '/budgets', implemented: true },
    { icon: <CreditCard className="w-4 h-4" />, label: 'Paiements', path: '/paiements', implemented: true },
    { icon: <DollarSign className="w-4 h-4" />, label: 'Commissions', path: '/commissions', implemented: true },
  ]},
  { key: 'referentiel', label: 'Referentiel', items: [
    { icon: <Users className="w-4 h-4" />, label: 'Fournisseurs', path: '/fournisseurs', implemented: true },
    { icon: <Handshake className="w-4 h-4" />, label: 'Partenaires', path: '/parametrage/partenaires', implemented: true },
  ]},
  { key: 'configuration', label: 'Configuration', items: [
    { icon: <Settings className="w-4 h-4" />, label: 'Parametrage', path: '/parametrage/conventions', implemented: true },
    { icon: <Map className="w-4 h-4" />, label: 'Axes Analytiques', path: '/parametrage/plan-analytique', implemented: true },
    { icon: <Tags className="w-4 h-4" />, label: 'Categories', path: '/parametrage/categories-depenses', implemented: true },
    { icon: <UserCog className="w-4 h-4" />, label: 'Utilisateurs', path: '/users', implemented: true },
  ]},
]

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
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    operations: true, finances: true, referentiel: false, configuration: false,
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

  // Track whether this is the initial mount to avoid closing sidebar on first render
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    } else if (isMobile) {
      // Close sidebar on navigation (not on initial mount)
      onClose()
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
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }))
  }

  const handleLogout = () => { logout(); navigate('/login') }

  // Close sidebar on mobile after navigation
  const handleMobileNavigate = isMobile ? onClose : undefined

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  // Filter menu items by search
  const filteredGroups = searchQuery
    ? menuGroups.map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(group => group.items.length > 0)
    : menuGroups

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
      {/* Header - Logo + close button (mobile) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: `1px solid ${colors.border}`,
      }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: 30, height: 30, backgroundColor: colors.primary[600],
            borderRadius: borders.radius.md, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span style={{
            color: colors.textPrimary, fontWeight: typography.weights.bold,
            fontSize: typography.sizes.base, letterSpacing: typography.letterSpacing.tight,
          }}>
            InvestPro
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <NotificationCenter />
          {isMobile && (
            <button onClick={onClose} style={{
              padding: '4px', backgroundColor: 'transparent', border: 'none',
              cursor: 'pointer', borderRadius: borders.radius.sm, display: 'flex',
            }}>
              <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
            </button>
          )}
        </div>
      </div>

      {/* Search box - opens Command Palette on click */}
      <div style={{ padding: '8px 12px' }}>
        <button
          onClick={() => {
            // Dispatch Ctrl+K to open Command Palette
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
            padding: '6px 10px', backgroundColor: colors.neutral[50],
            borderRadius: borders.radius.base, border: `1px solid ${colors.border}`,
            cursor: 'pointer', textAlign: 'left',
            transition: `all ${transitions.fast}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = colors.neutral[300]; e.currentTarget.style.backgroundColor = colors.surface }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.backgroundColor = colors.neutral[50] }}
        >
          <Search className="w-3.5 h-3.5" style={{ color: colors.neutral[400], flexShrink: 0 }} />
          <span style={{
            fontSize: typography.sizes.sm, color: colors.neutral[400],
            flex: 1,
          }}>
            Rechercher...
          </span>
          <kbd style={{
            padding: '1px 5px', backgroundColor: colors.neutral[100],
            border: `1px solid ${colors.neutral[200]}`, borderRadius: borders.radius.sm,
            fontSize: typography.sizes['2xs'], fontFamily: typography.fontFamilyMono,
            color: colors.neutral[500], display: 'flex', alignItems: 'center', gap: '2px',
          }}>
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>
      </div>

      {/* Local menu filter */}
      {searchQuery && (
        <div style={{ padding: '0 12px 4px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', backgroundColor: colors.primary[25],
            borderRadius: borders.radius.base, border: `1px solid ${colors.primary[200]}`,
          }}>
            <span style={{ fontSize: typography.sizes.xs, color: colors.primary[600], flex: 1 }}>
              Filtre: {searchQuery}
            </span>
            <button onClick={() => setSearchQuery('')} style={{
              padding: '2px', backgroundColor: 'transparent', border: 'none',
              cursor: 'pointer', display: 'flex',
            }}>
              <X className="w-3 h-3" style={{ color: colors.primary[400] }} />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {/* Top-level items */}
        <SidebarLink path="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" isActive={isActive} onNavigate={handleMobileNavigate} />
        <SidebarLink path="/reporting" icon={<BarChart3 className="w-4 h-4" />} label="Reporting" isActive={isActive} onNavigate={handleMobileNavigate} />
        <SidebarLink path="/generateur" icon={<Sparkles className="w-4 h-4" />} label="Générateur" isActive={isActive} onNavigate={handleMobileNavigate} />
        <SidebarLink path="/messagerie" icon={<MessageSquare className="w-4 h-4" />} label="Messagerie" isActive={isActive} onNavigate={handleMobileNavigate} />

        <div style={{ height: '1px', backgroundColor: colors.divider, margin: '6px 16px' }} />

        {/* Grouped Menu Items with Drag & Drop */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredGroups.map(g => g.key)} strategy={verticalListSortingStrategy}>
            {filteredGroups.map((group) => (
              <SortableGroup
                key={group.key}
                group={group}
                isExpanded={expandedGroups[group.key] || !!searchQuery}
                hasActiveItem={group.items.some(item => isActive(item.path))}
                onToggle={() => toggleGroup(group.key)}
                isActive={isActive}
              >
                <div style={{ paddingBottom: '2px' }}>
                  {group.items.map((item, itemIndex) => (
                    <SidebarLink
                      key={itemIndex}
                      path={item.path}
                      icon={item.icon}
                      label={item.label}
                      isActive={isActive}
                      indent
                      badge={!item.implemented ? 'Bientot' : undefined}
                      onNavigate={handleMobileNavigate}
                    />
                  ))}
                </div>
              </SortableGroup>
            ))}
          </SortableContext>
        </DndContext>
      </nav>

      {/* User Section */}
      <div style={{ borderTop: `1px solid ${colors.border}`, padding: '8px' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '8px 10px', borderRadius: borders.radius.base,
              cursor: 'pointer', backgroundColor: 'transparent', border: 'none',
              textAlign: 'left', transition: `background-color ${transitions.fast}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.neutral[50] }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <div style={{
              width: 30, height: 30, backgroundColor: colors.primary[600],
              borderRadius: borders.radius.full, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: colors.textOnColor,
              fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, flexShrink: 0,
            }}>
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                margin: 0, fontSize: typography.sizes.sm,
                fontWeight: typography.weights.medium, color: colors.textPrimary,
              }}>
                {user?.fullName || 'User'}
              </p>
              <p style={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                margin: 0, fontSize: typography.sizes.xs, color: colors.textSecondary,
              }}>
                {user?.email || ''}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5" style={{ color: colors.textSecondary, flexShrink: 0 }} />
          </button>

          {userMenuOpen && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 0, right: 0,
              marginBottom: '4px', backgroundColor: colors.surface,
              borderRadius: borders.radius.lg, border: `1px solid ${colors.border}`,
              boxShadow: shadows.lg, overflow: 'hidden',
            }}>
              <DropdownItem icon={<User className="w-4 h-4" />} label="Mon profil" onClick={() => { navigate('/profile'); setUserMenuOpen(false) }} />
              <DropdownItem icon={<Settings className="w-4 h-4" />} label="Parametres" onClick={() => { navigate('/parametrage/conventions'); setUserMenuOpen(false) }} />
              <div style={{ height: '1px', backgroundColor: colors.divider }} />
              <DropdownItem icon={<LogOut className="w-4 h-4" />} label="Deconnexion" onClick={() => { handleLogout(); setUserMenuOpen(false) }} danger />
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

// Micro-component: Single sidebar link
interface SidebarLinkProps {
  path: string
  icon: React.ReactElement
  label: string
  isActive: (path: string) => boolean
  indent?: boolean
  badge?: string
  onNavigate?: () => void
}

const SidebarLink = ({ path, icon, label, isActive, indent, badge, onNavigate }: SidebarLinkProps) => {
  const active = isActive(path)
  return (
    <Link
      to={path}
      onClick={onNavigate}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: indent ? '7px 16px 7px 36px' : '7px 16px',
        minHeight: '34px',
        color: active ? colors.primary[700] : colors.textSecondary,
        fontSize: typography.sizes.sm,
        fontWeight: active ? typography.weights.semibold : typography.weights.medium,
        textDecoration: 'none',
        transition: `all ${transitions.fast}`,
        borderLeft: active ? `3px solid ${colors.primary[600]}` : '3px solid transparent',
        backgroundColor: active ? colors.primary[25] : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) { e.currentTarget.style.backgroundColor = colors.neutral[50]; e.currentTarget.style.color = colors.textPrimary }
      }}
      onMouseLeave={(e) => {
        if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = colors.textSecondary }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '1px 6px', backgroundColor: colors.neutral[100],
          color: colors.neutral[500], fontSize: typography.sizes['2xs'],
          fontWeight: typography.weights.medium, borderRadius: borders.radius.full,
        }}>
          {badge}
        </span>
      )}
    </Link>
  )
}

// Micro-component: Dropdown menu item
interface DropdownItemProps {
  icon: React.ReactElement
  label: string
  onClick: () => void
  danger?: boolean
}

const DropdownItem = ({ icon, label, onClick, danger }: DropdownItemProps) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
      padding: '8px 16px', backgroundColor: 'transparent', border: 'none',
      cursor: 'pointer', textAlign: 'left',
      fontSize: typography.sizes.sm,
      color: danger ? colors.danger[600] : colors.textPrimary,
      transition: `background-color ${transitions.fast}`,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = danger ? colors.danger[50] : colors.neutral[50] }}
    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
  >
    <span style={{ color: danger ? undefined : colors.textSecondary, display: 'flex' }}>{icon}</span>
    <span>{label}</span>
  </button>
)

export default Sidebar
