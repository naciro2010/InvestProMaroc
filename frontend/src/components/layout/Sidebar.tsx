import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useExecutiveDashboard, selectNavCounters } from '@/hooks/useExecutiveDashboard'
import { NAV_GROUPS, DEFAULT_OPEN_GROUPS, NavGroup, findNavLocation, isNavItemActive } from './navigation'
import SidebarNavGroup, { SidebarNavItem } from './SidebarNavGroup'
import SidebarCreateMenu from './SidebarCreateMenu'
import SidebarRecents from './SidebarRecents'
import SidebarFooter from './SidebarFooter'

const MENU_ORDER_KEY = 'investpro_menu_order_v2'
const MENU_OPEN_KEY = 'investpro_menu_open_v1'

const readJson = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

const writeJson = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

const [HOME_GROUP, ...SORTABLE_GROUPS] = NAV_GROUPS

const initialGroups = (): NavGroup[] => {
  const saved = readJson<string[]>(MENU_ORDER_KEY)
  if (!Array.isArray(saved)) return SORTABLE_GROUPS
  const ordered = saved
    .map(key => SORTABLE_GROUPS.find(g => g.key === key))
    .filter((g): g is NavGroup => Boolean(g))
  return [...ordered, ...SORTABLE_GROUPS.filter(g => !saved.includes(g.key))]
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  /** Vrai sous 900px : le menu est un tiroir */
  isDrawer: boolean
}

/**
 * Menu latéral unique (256px) : Créer, Rechercher, groupes repliables,
 * consultés récemment, pied utilisateur. Tiroir sous 900px.
 */
const Sidebar = ({ isOpen, onClose, isDrawer }: SidebarProps) => {
  const { pathname } = useLocation()
  const { data } = useExecutiveDashboard()
  const counters = selectNavCounters(data)
  const [groups, setGroups] = useState<NavGroup[]>(initialGroups)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () => ({ ...DEFAULT_OPEN_GROUPS, ...(readJson<Record<string, boolean>>(MENU_OPEN_KEY) ?? {}) }),
  )

  // Le groupe de l'écran courant est toujours ouvert
  useEffect(() => {
    const location = findNavLocation(pathname)
    if (location && !openGroups[location.group.key]) {
      setOpenGroups(prev => {
        const next = { ...prev, [location.group.key]: true }
        writeJson(MENU_OPEN_KEY, next)
        return next
      })
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Échap ferme le tiroir
  useEffect(() => {
    if (!isDrawer || !isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isDrawer, isOpen, onClose])

  const toggleGroup = (key: string) => setOpenGroups(prev => {
    const next = { ...prev, [key]: !prev[key] }
    writeJson(MENU_OPEN_KEY, next)
    return next
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setGroups(items => {
      const next = arrayMove(
        items,
        items.findIndex(g => g.key === active.id),
        items.findIndex(g => g.key === over.id),
      )
      writeJson(MENU_ORDER_KEY, next.map(g => g.key))
      return next
    })
  }, [])

  const activeItem = findNavLocation(pathname)?.item
  const isItemActive = (path: string) => activeItem?.path === path
  const onNavigate = isDrawer ? onClose : undefined
  const home = HOME_GROUP.items[0]

  const openPalette = () => {
    onNavigate?.()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
  }

  return (
    <>
      {isDrawer && isOpen && (
        <button type="button" className="app-sidebar-backdrop" aria-label="Fermer le menu" onClick={onClose} />
      )}
      <aside
        id="app-sidebar"
        className="app-sidebar"
        data-open={isOpen}
        aria-label="Menu principal"
        aria-hidden={isDrawer && !isOpen ? true : undefined}
      >
        <div className="app-sidebar-scroll">
          <SidebarCreateMenu onNavigate={onNavigate} />

          <button type="button" className="nav-search" onClick={openPalette} aria-label="Rechercher (Ctrl K)">
            <span>Rechercher…</span>
            <kbd>Ctrl K</kbd>
          </button>

          <nav aria-label="Navigation">
            <SidebarNavItem
              root
              label={home.label}
              path={home.path}
              active={isNavItemActive(home, pathname)}
              onNavigate={onNavigate}
            />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={groups.map(g => g.key)} strategy={verticalListSortingStrategy}>
                {groups.map(group => (
                  <SidebarNavGroup
                    key={group.key}
                    group={group}
                    isOpen={Boolean(openGroups[group.key])}
                    onToggle={() => toggleGroup(group.key)}
                    isItemActive={isItemActive}
                    counters={counters}
                    onNavigate={onNavigate}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </nav>

          <SidebarRecents onNavigate={onNavigate} />
        </div>

        <SidebarFooter onNavigate={onNavigate} />
      </aside>
    </>
  )
}

export default Sidebar
