import { describe, it, expect, beforeEach } from 'vitest'
import { findNavLocation, isNavItemActive, NAV_GROUPS } from '@/components/layout/navigation'
import { pushRecentRecord } from '@/hooks/useRecentRecords'
import { formatMillions, formatPercent } from '@/lib/utils'
import { getStatusConfig, tones, toneOf } from '@/lib/designSystem'

/** Normalise les espaces insécables des formats fr-FR */
const plain = (s: string) => s.replace(/\s/g, ' ')

describe('navigation Registre', () => {
  it('rattache une fiche à son item de menu', () => {
    expect(findNavLocation('/conventions/12')?.item.path).toBe('/conventions')
    expect(findNavLocation('/marches/4/decomptes/nouveau')?.group.key).toBe('travaux')
    expect(findNavLocation('/dashboard')?.group.key).toBe('accueil')
  })

  it('ne confond pas deux préfixes proches', () => {
    const partenaires = NAV_GROUPS.flatMap(g => g.items).find(i => i.path === '/parametrage/partenaires')!
    expect(isNavItemActive(partenaires, '/parametrage/conventions')).toBe(false)
    expect(findNavLocation('/inconnu')).toBeNull()
  })
})

describe('consultés récemment', () => {
  beforeEach(() => localStorage.clear())

  it('garde les 4 dernières fiches, sans doublon, la plus récente en tête', () => {
    for (let i = 1; i <= 5; i++) {
      pushRecentRecord({ key: `convention-${i}`, type: 'convention', code: `C${i}`, label: '', path: `/conventions/${i}` })
    }
    pushRecentRecord({ key: 'convention-3', type: 'convention', code: 'C3', label: '', path: '/conventions/3' })
    const stored = JSON.parse(localStorage.getItem('investpro_recents_v1') ?? '[]') as { key: string }[]
    expect(stored.map(r => r.key)).toEqual(['convention-3', 'convention-5', 'convention-4', 'convention-2'])
  })
})

describe('formats', () => {
  it('formate les montants en millions et les pourcentages à la française', () => {
    expect(plain(formatMillions(1_071_500_000))).toBe('1 071,5 M')
    expect(plain(formatPercent(30.44))).toBe('30,4 %')
    expect(plain(formatPercent(Number.NaN))).toBe('0,0 %')
  })
})

describe('statuts', () => {
  it('associe chaque statut à un ton Registre', () => {
    expect(getStatusConfig('VALIDEE')).toMatchObject({ label: 'Validée', bgColor: tones.ok.bg })
    expect(getStatusConfig('SOUMIS').textColor).toBe(tones.w.fg)
    expect(toneOf(getStatusConfig('REJETE').color)).toBe('e')
  })

  it('humanise un statut inconnu au lieu d’afficher le code brut', () => {
    expect(getStatusConfig('EN_ATTENTE').label).toBe('En attente')
  })
})
