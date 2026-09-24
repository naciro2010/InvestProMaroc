/**
 * Navigation « Registre » - source unique du menu latéral, du fil d'Ariane
 * de l'en-tête et du surtitre par défaut des pages.
 *
 * Le menu ne contient que de la navigation, rangée par thèmes en langage
 * courant. Les compteurs (« à valider », « à payer ») sont résolus par le
 * menu à partir du tableau de bord exécutif.
 */

export type NavCounterKey = 'conventionsAValider' | 'decomptesAPayer'

export interface NavItem {
  label: string
  path: string
  counter?: NavCounterKey
  /** Autres préfixes d'URL rattachés à cet item (fiches, assistants) */
  matches?: string[]
}

export interface NavGroup {
  key: string
  /** Titre du groupe (vide pour le groupe « Accueil ») */
  label: string
  /** Ligne d'aide 11px sous le titre */
  hint?: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    key: 'accueil',
    label: '',
    items: [{ label: 'Accueil', path: '/dashboard' }],
  },
  {
    key: 'conventions',
    label: 'Conventions',
    hint: 'accords et financements',
    items: [
      { label: 'Toutes les conventions', path: '/conventions', counter: 'conventionsAValider' },
      { label: 'Projets', path: '/projets' },
      { label: 'Versements prévus', path: '/versements-previsionnels' },
      { label: 'Avenants', path: '/avenants' },
    ],
  },
  {
    key: 'travaux',
    label: 'Suivi des travaux',
    hint: 'marchés et décomptes',
    items: [
      { label: 'Marchés', path: '/marches' },
      { label: 'Décomptes', path: '/decomptes', counter: 'decomptesAPayer' },
      { label: 'Ordres de paiement', path: '/ordres-paiement' },
      { label: 'Paiements', path: '/paiements' },
    ],
  },
  {
    key: 'finances',
    label: 'Finances',
    hint: 'budgets et rapports',
    items: [
      { label: 'Budgets', path: '/budgets' },
      { label: 'Commissions', path: '/commissions' },
      { label: 'Rapports', path: '/reporting' },
    ],
  },
  {
    key: 'carnet',
    label: "Carnet d'adresses",
    hint: 'fournisseurs et partenaires',
    items: [
      { label: 'Fournisseurs', path: '/fournisseurs' },
      { label: 'Partenaires', path: '/parametrage/partenaires' },
    ],
  },
  {
    key: 'outils',
    label: 'Outils',
    items: [
      { label: 'Générateur de tableaux', path: '/generateur' },
      { label: 'Messagerie', path: '/messagerie' },
    ],
  },
  {
    key: 'reglages',
    label: 'Réglages',
    items: [
      { label: 'Paramètres des conventions', path: '/parametrage/conventions' },
      { label: 'Axes analytiques', path: '/parametrage/plan-analytique' },
      { label: 'Catégories de dépenses', path: '/parametrage/categories-depenses' },
      { label: 'Utilisateurs et droits', path: '/users' },
    ],
  },
]

/** Groupes ouverts par défaut (le groupe de l'écran courant l'est toujours) */
export const DEFAULT_OPEN_GROUPS: Record<string, boolean> = {
  conventions: true,
  travaux: true,
  finances: true,
  carnet: false,
  outils: false,
  reglages: false,
}

export const NAV_COUNTER_LABELS: Record<NavCounterKey, string> = {
  conventionsAValider: 'à valider',
  decomptesAPayer: 'à payer',
}

/** Vrai si l'URL courante relève de cet item (liste, fiche ou assistant). */
export const isNavItemActive = (item: NavItem, pathname: string): boolean => {
  const prefixes = [item.path, ...(item.matches ?? [])]
  return prefixes.some(p => pathname === p || pathname.startsWith(p + '/'))
}

/** Retrouve le groupe et l'item correspondant à une URL. */
export const findNavLocation = (pathname: string): { group: NavGroup; item: NavItem } | null => {
  for (const group of NAV_GROUPS) {
    const item = group.items.find(i => isNavItemActive(i, pathname))
    if (item) return { group, item }
  }
  return null
}
