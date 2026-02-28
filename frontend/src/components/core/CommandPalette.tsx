import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, ShoppingCart, Building2, Wallet, Receipt,
  LayoutDashboard, BarChart3, Users, Settings, Search,
  Handshake, Tags, Map, UserCog, CreditCard, Plus,
  ArrowRight,
} from 'lucide-react'
import { colors, typography, borders, shadows, transitions } from '@/lib/designSystem'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactElement
  action: () => void
  category: string
  keywords?: string[]
}

const CommandPalette = () => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Toggle palette
  useKeyboardShortcut({
    key: 'k',
    ctrl: true,
    handler: () => setOpen(prev => !prev),
    description: 'Recherche rapide',
    category: 'Navigation',
  })

  // Close on Escape
  useKeyboardShortcut({
    key: 'Escape',
    handler: () => { if (open) setOpen(false) },
    description: 'Fermer',
    category: 'General',
  })

  const goTo = useCallback((path: string) => {
    navigate(path)
    setOpen(false)
  }, [navigate])

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, action: () => goTo('/dashboard'), category: 'Navigation', keywords: ['accueil', 'home'] },
    { id: 'conventions', label: 'Conventions', icon: <FileText size={18} />, action: () => goTo('/conventions'), category: 'Navigation', keywords: ['contrat', 'accord'] },
    { id: 'marches', label: 'Marches', icon: <ShoppingCart size={18} />, action: () => goTo('/marches'), category: 'Navigation', keywords: ['procurement', 'contrat'] },
    { id: 'projets', label: 'Projets', icon: <Building2 size={18} />, action: () => goTo('/projets'), category: 'Navigation', keywords: ['programme', 'investissement'] },
    { id: 'budgets', label: 'Budgets', icon: <Wallet size={18} />, action: () => goTo('/budgets'), category: 'Navigation', keywords: ['finance', 'comptabilite'] },
    { id: 'decomptes', label: 'Decomptes', icon: <Receipt size={18} />, action: () => goTo('/decomptes'), category: 'Navigation', keywords: ['facture', 'paiement'] },
    { id: 'paiements', label: 'Paiements', icon: <CreditCard size={18} />, action: () => goTo('/paiements'), category: 'Navigation', keywords: ['reglement', 'virement'] },
    { id: 'fournisseurs', label: 'Fournisseurs', icon: <Users size={18} />, action: () => goTo('/fournisseurs'), category: 'Navigation', keywords: ['prestataire', 'entreprise'] },
    { id: 'reporting', label: 'Reporting', icon: <BarChart3 size={18} />, action: () => goTo('/reporting'), category: 'Navigation', keywords: ['rapport', 'statistiques', 'analyse'] },
    { id: 'partenaires', label: 'Partenaires', icon: <Handshake size={18} />, action: () => goTo('/parametrage/partenaires'), category: 'Navigation' },
    { id: 'utilisateurs', label: 'Utilisateurs', icon: <UserCog size={18} />, action: () => goTo('/users'), category: 'Navigation' },
    { id: 'axes', label: 'Axes Analytiques', icon: <Map size={18} />, action: () => goTo('/parametrage/plan-analytique'), category: 'Configuration', keywords: ['dimension', 'analytique'] },
    { id: 'categories', label: 'Categories de Depenses', icon: <Tags size={18} />, action: () => goTo('/parametrage/categories-depenses'), category: 'Configuration' },
    { id: 'parametrage', label: 'Parametrage', icon: <Settings size={18} />, action: () => goTo('/parametrage/conventions'), category: 'Configuration' },

    // Quick actions
    { id: 'new-convention', label: 'Nouvelle Convention', description: 'Creer une convention', icon: <Plus size={18} />, action: () => goTo('/conventions/nouvelle'), category: 'Actions rapides', keywords: ['creer', 'ajouter'] },
    { id: 'new-marche', label: 'Nouveau Marche', description: 'Creer un marche', icon: <Plus size={18} />, action: () => goTo('/marches/nouveau'), category: 'Actions rapides', keywords: ['creer', 'ajouter'] },
    { id: 'new-projet', label: 'Nouveau Projet', description: 'Creer un projet', icon: <Plus size={18} />, action: () => goTo('/projets/nouveau'), category: 'Actions rapides', keywords: ['creer', 'ajouter'] },
    { id: 'new-budget', label: 'Nouveau Budget', description: 'Creer un budget', icon: <Plus size={18} />, action: () => goTo('/budgets/nouveau'), category: 'Actions rapides', keywords: ['creer', 'ajouter'] },
  ], [goTo])

  // Filter commands
  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords?.some(k => k.includes(q))
    )
  }, [query, commands])

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  }, [filtered])

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      filtered[selectedIndex].action()
    }
  }, [filtered, selectedIndex])

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!open) return null

  let flatIndex = -1

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9998, backdropFilter: 'blur(4px)',
        }}
      />

      {/* Palette */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 560, zIndex: 9999,
        backgroundColor: colors.surface, borderRadius: borders.radius.xl,
        border: `1px solid ${colors.border}`, boxShadow: shadows.xl,
        overflow: 'hidden',
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderBottom: `1px solid ${colors.border}`,
        }}>
          <Search size={18} style={{ color: colors.textSecondary, flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher une page, une action..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              border: 'none', outline: 'none', backgroundColor: 'transparent',
              fontSize: typography.sizes.base, color: colors.textPrimary,
              width: '100%', padding: 0, fontFamily: typography.fontFamily,
            }}
          />
          <kbd style={{
            padding: '2px 6px', backgroundColor: colors.neutral[100],
            color: colors.textSecondary, fontSize: typography.sizes.xs,
            borderRadius: borders.radius.sm, border: `1px solid ${colors.neutral[200]}`,
            fontFamily: typography.fontFamilyMono, whiteSpace: 'nowrap',
          }}>
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 360, overflowY: 'auto', padding: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: '24px 16px', textAlign: 'center',
              color: colors.textSecondary, fontSize: typography.sizes.sm,
            }}>
              Aucun resultat pour &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div style={{
                  padding: '6px 8px', fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.semibold, color: colors.textSecondary,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {category}
                </div>
                {items.map(item => {
                  flatIndex++
                  const idx = flatIndex
                  const isSelected = idx === selectedIndex
                  return (
                    <button
                      key={item.id}
                      data-index={idx}
                      onClick={() => item.action()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        width: '100%', padding: '8px 10px', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                        borderRadius: borders.radius.md,
                        backgroundColor: isSelected ? colors.primary[50] : 'transparent',
                        transition: `background-color ${transitions.fast}`,
                      }}
                    >
                      <span style={{
                        color: isSelected ? colors.primary[600] : colors.textSecondary,
                        display: 'flex', flexShrink: 0,
                      }}>
                        {item.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontSize: typography.sizes.base,
                          fontWeight: typography.weights.medium,
                          color: isSelected ? colors.primary[700] : colors.textPrimary,
                        }}>
                          {item.label}
                        </span>
                        {item.description && (
                          <span style={{
                            fontSize: typography.sizes.sm,
                            color: colors.textSecondary, marginLeft: 8,
                          }}>
                            {item.description}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <ArrowRight size={14} style={{ color: colors.primary[400], flexShrink: 0 }} />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '8px 16px', borderTop: `1px solid ${colors.border}`,
          fontSize: typography.sizes.xs, color: colors.textSecondary,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <kbd style={kbdStyle}>&#8593;&#8595;</kbd> naviguer
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <kbd style={kbdStyle}>&#9166;</kbd> ouvrir
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <kbd style={kbdStyle}>Esc</kbd> fermer
          </span>
        </div>
      </div>
    </>
  )
}

const kbdStyle: React.CSSProperties = {
  padding: '1px 5px',
  backgroundColor: colors.neutral[100],
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: borders.radius.sm,
  fontSize: typography.sizes['2xs'],
  fontFamily: typography.fontFamilyMono,
}

export default CommandPalette
