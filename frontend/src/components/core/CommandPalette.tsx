import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import api, { conventionsAPI } from '@/lib/api'
import { colors, typography, borders, shadows, transitions } from '@/lib/designSystem'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { NAV_GROUPS } from '@/components/layout/navigation'
import type { Convention } from '@/types/entities'
import type { MarcheListItem } from '@/components/marches/list'

type CommandType = 'Écran' | 'Convention' | 'Marché' | 'Action'

interface CommandItem {
  id: string
  type: CommandType
  label: string
  context?: string
  path: string
  keywords?: string[]
}

const MAX_RECORDS = 6

const SCREEN_COMMANDS: CommandItem[] = NAV_GROUPS.flatMap(group =>
  group.items.map(item => ({
    id: `screen-${item.path}`,
    type: 'Écran' as const,
    label: item.label,
    context: group.label || 'Pilotage',
    path: item.path,
  })),
)

const ACTION_COMMANDS: CommandItem[] = [
  { id: 'new-convention', type: 'Action', label: 'Nouvelle convention', context: 'Assistant en 5 étapes', path: '/conventions/nouvelle', keywords: ['creer', 'ajouter'] },
  { id: 'new-marche', type: 'Action', label: 'Nouveau marché', context: 'Informations, prix, imputations', path: '/marches/nouveau', keywords: ['creer', 'ajouter'] },
  { id: 'new-decompte', type: 'Action', label: 'Nouveau décompte', context: 'Montants et retenues', path: '/decomptes/nouveau', keywords: ['creer', 'ajouter', 'facture'] },
  { id: 'new-projet', type: 'Action', label: 'Nouveau projet', path: '/projets/nouveau', keywords: ['creer', 'ajouter'] },
  { id: 'new-budget', type: 'Action', label: 'Nouveau budget', path: '/budgets/nouveau', keywords: ['creer', 'ajouter'] },
]

/** Normalise pour une recherche insensible aux accents et à la casse. */
const norm = (v: string | null | undefined) =>
  (v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const toArray = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[]
  const inner = (payload as { data?: unknown } | null)?.data
  return Array.isArray(inner) ? (inner as T[]) : []
}

/**
 * CommandPalette - Palette de commandes (Ctrl/⌘ K, Échap pour fermer).
 * Recherche dans les écrans, les actions, les conventions et les marchés.
 */
const CommandPalette = () => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useKeyboardShortcut({
    key: 'k',
    ctrl: true,
    handler: () => setOpen(prev => !prev),
    description: 'Recherche rapide',
    category: 'Navigation',
  })

  useKeyboardShortcut({
    key: 'Escape',
    handler: () => { if (open) setOpen(false) },
    description: 'Fermer',
    category: 'General',
  })

  // Fiches chargées à la première ouverture seulement
  const { data: conventions = [] } = useQuery<Convention[]>({
    queryKey: ['conventions', 'list'],
    queryFn: async () => toArray<Convention>((await conventionsAPI.getAll()).data),
    enabled: open,
    staleTime: 1000 * 60 * 5,
  })
  const { data: marches = [] } = useQuery<MarcheListItem[]>({
    queryKey: ['palette', 'marches'],
    queryFn: async () => toArray<MarcheListItem>((await api.get('/marches/list')).data),
    enabled: open,
    staleTime: 1000 * 60 * 5,
  })

  const filtered = useMemo<CommandItem[]>(() => {
    const q = norm(query.trim())
    const match = (...fields: (string | null | undefined)[]) => fields.some(f => norm(f).includes(q))
    if (!q) return [...ACTION_COMMANDS.slice(0, 3), ...SCREEN_COMMANDS]

    const records: CommandItem[] = [
      ...conventions
        .filter(c => match(c.code, c.numero, c.libelle))
        .slice(0, MAX_RECORDS)
        .map(c => ({ id: `conv-${c.id}`, type: 'Convention' as const, label: `${c.code} — ${c.libelle}`, context: c.numero, path: `/conventions/${c.id}` })),
      ...marches
        .filter(m => match(m.numeroMarche, m.objet, m.fournisseurNom))
        .slice(0, MAX_RECORDS)
        .map(m => ({ id: `marche-${m.id}`, type: 'Marché' as const, label: `${m.numeroMarche} — ${m.objet}`, context: m.fournisseurNom, path: `/marches/${m.id}` })),
    ]
    const commands = [...SCREEN_COMMANDS, ...ACTION_COMMANDS]
      .filter(c => match(c.label, c.context, c.type) || c.keywords?.some(k => k.includes(q)))
    return [...commands, ...records]
  }, [query, conventions, marches])

  useEffect(() => { setSelectedIndex(0) }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const run = useCallback((item: CommandItem) => {
    navigate(item.path)
    setOpen(false)
  }, [navigate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      run(filtered[selectedIndex])
    }
  }, [filtered, selectedIndex, run])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!open) return null

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(28,42,68,.34)', zIndex: 9998 }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Palette de commandes"
        style={{
          position: 'fixed', top: '12vh', left: '50%', transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)', maxWidth: 600, zIndex: 9999,
          backgroundColor: colors.surface, borderRadius: borders.radius.xl,
          boxShadow: shadows.xl, overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 18px', borderBottom: `1px solid ${colors.border}` }}>
          <Search size={16} strokeWidth={1.75} style={{ color: colors.textSecondary, flexShrink: 0 }} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Écran, convention, marché, action…"
            aria-label="Rechercher un écran, une fiche ou une action"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-activedescendant={filtered[selectedIndex] ? `cmd-${filtered[selectedIndex].id}` : undefined}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              border: 'none', outline: 'none', backgroundColor: 'transparent',
              fontSize: 16, color: colors.textPrimary, width: '100%', padding: 0,
              fontFamily: typography.fontFamily,
            }}
          />
          <kbd style={kbdStyle}>Échap</kbd>
        </div>

        <div ref={listRef} id="command-palette-results" role="listbox" style={{ maxHeight: '52vh', overflowY: 'auto', padding: 6 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '22px 16px', textAlign: 'center', color: colors.textTertiary, fontSize: 13 }}>
              Aucun résultat pour « {query} »
            </div>
          ) : filtered.map((item, idx) => {
            const isSelected = idx === selectedIndex
            return (
              <button
                key={item.id}
                id={`cmd-${item.id}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-index={idx}
                onClick={() => run(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  display: 'grid', gridTemplateColumns: '84px minmax(0, 1fr) auto', alignItems: 'baseline', gap: 12,
                  width: '100%', padding: '9px 12px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderRadius: borders.radius.item,
                  backgroundColor: isSelected ? colors.surfaceAlt : 'transparent',
                  boxShadow: isSelected ? `inset 3px 0 0 ${colors.brass.main}` : 'none',
                  transition: `background-color ${transitions.fast}`,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: colors.textTertiary }}>{item.type}</span>
                <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 500, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: 12, color: colors.textTertiary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                  {item.context}
                </span>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 18px', borderTop: `1px solid ${colors.border}`, background: colors.surfaceAlt, fontSize: 12, color: colors.textSecondary }}>
          <span><kbd style={kbdStyle}>↑↓</kbd> naviguer</span>
          <span><kbd style={kbdStyle}>↵</kbd> ouvrir</span>
          <span><kbd style={kbdStyle}>Échap</kbd> fermer</span>
        </div>
      </div>
    </>
  )
}

const kbdStyle: React.CSSProperties = {
  padding: '0 5px',
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: borders.radius.xs,
  fontSize: 10.5,
  fontFamily: typography.fontFamily,
  color: colors.textSecondary,
  whiteSpace: 'nowrap',
}

export default CommandPalette
