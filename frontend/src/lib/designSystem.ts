/**
 * Design System v6.0 - InvestPro Maroc — style « Registre »
 *
 * Bleu nuit, filet laiton, ivoire, titres Garamond.
 *
 * PRINCIPES:
 * - Encre bleu nuit (#1c2a44) pour le texte et l'action principale
 * - Laiton (#a58a4a) comme unique accent : filets, onglet actif, compteurs
 * - Fonds ivoire chauds, panneaux #fffdf8 à ombre douce
 * - Titres et grands chiffres en EB Garamond, texte en Source Sans 3
 * - Chiffres tabulaires partout, montants alignés à droite
 * - Statuts en pastilles à 5 tons (ok / attention / erreur / info / neutre)
 *
 * Les clés historiques (primary, success, neutral…) sont conservées et
 * remappées sur la palette Registre : tous les écrans en héritent.
 */

// ==================== COULEURS ====================

export const colors = {
  /**
   * Primaire - Bleu nuit (encre). 600 = teinte principale.
   * Les teintes claires sont chaudes pour s'accorder au fond ivoire.
   */
  primary: {
    25: '#f7f3ea',
    50: '#e3e7ef',
    100: '#d5dbe6',
    200: '#c9d0de',
    300: '#9aa6bd',
    400: '#56657f',
    500: '#2f4160',
    600: '#1c2a44', // Main - encre bleu nuit
    700: '#16223a', // hover
    800: '#111a2d',
    900: '#0b1220',
  },

  /**
   * Succès - Vert sapin (ton « ok »)
   */
  success: {
    25: '#f1f6f2',
    50: '#e1ede5',
    100: '#d0e3d6',
    200: '#bfd6c7',
    300: '#8fb89c',
    400: '#5e9474',
    500: '#3a7552',
    600: '#2e6a47', // Main
    700: '#245b3c',
    800: '#1c4a30',
    900: '#143823',
  },

  /**
   * Danger - Brique (ton « erreur »)
   */
  danger: {
    25: '#fbf2f0',
    50: '#f6e3df',
    100: '#f0d4ce',
    200: '#e6c4bd',
    300: '#d4968a',
    400: '#bf6556',
    500: '#a83e30', // Main
    600: '#8e2a1f',
    700: '#7a2219',
    800: '#651b14',
    900: '#4f150f',
  },

  /**
   * Warning - Ocre (ton « attention »)
   */
  warning: {
    25: '#fbf6ea',
    50: '#f5ead2',
    100: '#efe0bd',
    200: '#e6d2a6',
    300: '#d6b56f',
    400: '#c49a45',
    500: '#a87c24', // Main
    600: '#93691a',
    700: '#7d5a12',
    800: '#65480e',
    900: '#4d370b',
  },

  /**
   * Info - Ardoise (ton « info »)
   */
  info: {
    25: '#f3f5f9',
    50: '#e3e7ef',
    100: '#d5dbe6',
    200: '#c9d0de',
    300: '#9aa6bd',
    400: '#6d7c98',
    500: '#4a5a78', // Main
    600: '#34466a',
    700: '#24344f',
    800: '#1c2a44',
    900: '#131d31',
  },

  /**
   * Purple (clé historique) - remappé sur le laiton, accent secondaire
   */
  purple: {
    25: '#faf6ec',
    50: '#f3ecd9',
    100: '#ebdfc0',
    200: '#dccaa0',
    300: '#c9b27a',
    400: '#b79c5f',
    500: '#a58a4a', // Main
    600: '#8c7439',
    700: '#735e2d',
    800: '#5b4a23',
    900: '#43371a',
  },

  /**
   * Gris chauds (papier / encre)
   */
  neutral: {
    0: '#fffdf8',
    25: '#f7f3ea',
    50: '#f2ede2',
    100: '#ece5d6',
    200: '#ddd5c4',
    300: '#c9c0ad',
    400: '#a39d90',
    500: '#6f6f68',
    600: '#5f6068',
    700: '#3d4556',
    800: '#24344f',
    900: '#1c2a44',
  },

  // Aliases
  gray: {
    50: '#f2ede2',
    100: '#ece5d6',
    200: '#ddd5c4',
    300: '#c9c0ad',
    400: '#a39d90',
    500: '#6f6f68',
    600: '#5f6068',
    700: '#3d4556',
    800: '#24344f',
    900: '#1c2a44',
  },

  /** Laiton - accent unique (filets, onglet actif, compteurs) */
  brass: {
    main: '#a58a4a',
    light: '#c9b27a',
    rule: 'rgba(165, 138, 74, 0.5)',
    halo: 'rgba(165, 138, 74, 0.38)',
    selection: 'rgba(165, 138, 74, 0.26)',
  },

  /** Encre bleu nuit (fonds sombres : en-tête, blocs « Net à payer ») */
  ink: {
    main: '#1c2a44',
    light: '#24344f',
    lighter: '#2f4160',
  },

  /** Texte sur fond sombre */
  onDark: {
    primary: '#f3eee3',
    secondary: '#cfc9bc',
    tertiary: '#9a9486',
    subtleBg: 'rgba(243, 238, 227, 0.12)',
    hoverBg: 'rgba(243, 238, 227, 0.07)',
    border: 'rgba(243, 238, 227, 0.18)',
  },

  /** Fond de page ivoire */
  background: '#efe9dd',

  /** Surface / panneau */
  surface: '#fffdf8',

  /** Surface secondaire (en-têtes de tableau, pieds de panneau) */
  surfaceAlt: '#f7f3ea',

  /** Menu latéral */
  sidebarBg: '#efe9dd',

  /** Bordure de panneau */
  border: '#ddd5c4',

  /** Bordure fine (lignes de tableau) */
  borderSubtle: '#ece5d6',

  /** Bordure de champ */
  fieldBorder: '#c9c0ad',

  /** Séparateur */
  divider: '#ece5d6',

  /** Texte principal - encre */
  textPrimary: '#1c2a44',

  /** Texte secondaire */
  textSecondary: '#5f6068',

  /** Texte tertiaire (en-têtes de colonnes, aides) */
  textTertiary: '#6f6f68',

  /** Texte désactivé */
  textDisabled: '#a39d90',

  /** Texte sur fond coloré */
  textOnColor: '#f3eee3',

  /** Lien */
  link: '#1c2a44',
  linkHover: '#a58a4a',
} as const

/**
 * Tons de statut Registre (fond / texte / bordure)
 */
export type ToneKey = 'ok' | 'w' | 'e' | 'i' | 'n'

export const tones: Record<ToneKey, { bg: string; fg: string; bd: string }> = {
  ok: { bg: '#e1ede5', fg: '#245b3c', bd: '#bfd6c7' },
  w: { bg: '#f5ead2', fg: '#7d5a12', bd: '#e6d2a6' },
  e: { bg: '#f6e3df', fg: '#8e2a1f', bd: '#e6c4bd' },
  i: { bg: '#e3e7ef', fg: '#1c2a44', bd: '#c9d0de' },
  n: { bg: '#ece5d6', fg: '#5f6068', bd: '#ddd5c4' },
}

/**
 * Dégradés autorisés (réservés à l'ossature et aux blocs de synthèse)
 */
export const gradients = {
  /** En-tête d'application */
  header: 'linear-gradient(180deg, #24344f 0%, #1c2a44 100%)',
  /** Bouton primaire */
  primaryButton: 'linear-gradient(180deg, #2f4160, #1c2a44)',
  /** Bloc « Net / Disponible / Reste à payer » */
  highlight: 'linear-gradient(135deg, #24344f, #1c2a44)',
  /** Halo du fond de page */
  pageHalo: 'radial-gradient(1100px 520px at 12% -8%, rgba(255,253,248,.85), rgba(255,253,248,0) 62%)',
} as const

// ==================== TYPOGRAPHIE ====================

export const typography = {
  /** Texte : Source Sans 3 */
  fontFamily:
    "'Source Sans 3', 'Segoe UI', system-ui, -apple-system, sans-serif",

  /** Titres et grands chiffres : EB Garamond */
  fontFamilySerif:
    "'EB Garamond', Georgia, 'Times New Roman', serif",

  fontFamilyMono:
    "'SF Mono', Menlo, Monaco, Consolas, monospace",

  /**
   * Tailles de police (scale harmonique)
   */
  sizes: {
    /** 11px - Micro labels, timestamps */
    '2xs': '0.6875rem',
    /** 12px - Métadonnées, badges */
    xs: '0.75rem',
    /** 13px - Labels secondaires, breadcrumbs */
    sm: '0.8125rem',
    /** 14px - Texte courant (base) */
    base: '0.875rem',
    /** 16px - Sous-titres */
    md: '1rem',
    /** 18px - Titres de section */
    lg: '1.125rem',
    /** 20px - Titres de page secondaires */
    xl: '1.25rem',
    /** 24px - Titres de page */
    '2xl': '1.5rem',
    /** 30px - Titre principal, dashboard */
    '3xl': '1.875rem',
    /** 36px - Hero sections */
    '4xl': '2.25rem',
  },

  /**
   * Poids de police
   */
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  /**
   * Hauteurs de ligne
   */
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  /**
   * Letter spacing
   */
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const

// ==================== ESPACEMENT ====================

export const spacing = {
  /** 2px */
  '2xs': '0.125rem',
  /** 4px */
  xs: '0.25rem',
  /** 8px - Base unit */
  sm: '0.5rem',
  /** 12px */
  md: '0.75rem',
  /** 16px */
  lg: '1rem',
  /** 20px */
  xl: '1.25rem',
  /** 24px */
  '2xl': '1.5rem',
  /** 32px */
  '3xl': '2rem',
  /** 40px */
  '4xl': '2.5rem',
  /** 48px */
  '5xl': '3rem',
  /** 64px */
  '6xl': '4rem',

  /**
   * Valeurs numériques MUI (1 unit = 8px)
   */
  mui: {
    '2xs': 0.25, // 2px
    xs: 0.5,     // 4px
    sm: 1,       // 8px
    md: 1.5,     // 12px
    lg: 2,       // 16px
    xl: 2.5,     // 20px
    '2xl': 3,    // 24px
    '3xl': 4,    // 32px
    '4xl': 5,    // 40px
    '5xl': 6,    // 48px
  },

  /**
   * Espacements de page
   */
  page: {
    paddingX: '2.5rem',   // 40px
    paddingY: '1.75rem',  // 28px
    maxWidth: '1320px',
    gutter: '1.5rem',     // 24px
  },
} as const

// ==================== OMBRES ====================

export const shadows = {
  /** Pas d'ombre */
  none: 'none',
  /** Très subtile - bordure virtuelle */
  xs: '0 1px 2px rgba(28, 42, 68, 0.06)',
  /** Légère - éléments au repos */
  sm: '0 1px 1px rgba(28, 42, 68, 0.04), 0 1px 0 rgba(28, 42, 68, 0.03)',
  /** Panneau Registre */
  md: '0 1px 1px rgba(28, 42, 68, 0.04), 0 1px 0 rgba(28, 42, 68, 0.03), 0 14px 34px -20px rgba(28, 42, 68, 0.24)',
  /** Élevée - menus déroulants, popovers */
  lg: '0 2px 4px rgba(28, 42, 68, 0.08), 0 12px 26px -14px rgba(28, 42, 68, 0.35)',
  /** Modale */
  xl: '0 30px 60px -20px rgba(28, 42, 68, 0.55)',
  /** Panneau (alias explicite) */
  panel: '0 1px 1px rgba(28, 42, 68, 0.04), 0 1px 0 rgba(28, 42, 68, 0.03), 0 14px 34px -20px rgba(28, 42, 68, 0.24)',
  /** Bouton primaire */
  primaryButton: '0 1px 2px rgba(28, 42, 68, 0.25), 0 10px 22px -12px rgba(28, 42, 68, 0.55)',
  /** Élément actif du segmenté / du menu */
  raised: '0 1px 2px rgba(28, 42, 68, 0.1)',
  /** Ombre interne des champs */
  fieldInset: 'inset 0 1px 2px rgba(28, 42, 68, 0.045)',
  /** Focus ring - halo encre */
  focus: '0 0 0 3px rgba(28, 42, 68, 0.12)',
  /** Focus ring danger */
  focusDanger: '0 0 0 3px rgba(142, 42, 31, 0.16)',
} as const

// ==================== BORDURES ====================

export const borders = {
  /** Rayon standard */
  radius: {
    none: '0',
    xs: '3px',      // radius-xs
    sm: '4px',      // Badges, tags (radius-sm)
    base: '6px',    // Boutons, champs
    md: '6px',      // Petits blocs
    item: '8px',    // Items de menu
    lg: '10px',     // Panneaux
    xl: '12px',     // Modales
    '2xl': '16px',  // Large panels
    full: '9999px', // Pills, avatars (radius-pill)
  },

  /** Épaisseurs */
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
  },
} as const

// ==================== TRANSITIONS ====================

export const transitions = {
  /** Interactions rapides */
  fast: '120ms ease',
  /** Standard */
  normal: '150ms ease',
  /** Animations (groupes du menu) */
  slow: '250ms ease',
  /** Tiroir mobile */
  slower: '280ms cubic-bezier(0.2, 0.7, 0.2, 1)',
  /** Timing functions */
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// ==================== Z-INDEX ====================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const

// ==================== BREAKPOINTS ====================

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 900,
  lg: 1240,
  xl: 1440,
  '2xl': 1536,
} as const

// ==================== COMPOSANTS - Styles pré-définis ====================

/**
 * Styles réutilisables pour les composants MUI (sx prop).
 * Importez et spread dans vos sx props.
 */
export const componentStyles = {
  /**
   * Fond de page standard
   */
  pageBackground: {
    backgroundColor: colors.background,
    minHeight: '100vh',
  },

  /**
   * Carte standard (Confluence style)
   */
  card: {
    backgroundColor: colors.surface,
    border: 'none',
    borderRadius: borders.radius.lg,
    boxShadow: shadows.panel,
  },

  /**
   * Carte avec ombre subtile
   */
  cardElevated: {
    backgroundColor: colors.surface,
    border: 'none',
    borderRadius: borders.radius.lg,
    boxShadow: shadows.panel,
    transition: `box-shadow ${transitions.normal}`,
    '&:hover': {
      boxShadow: shadows.lg,
    },
  },

  /**
   * Carte interactive (cliquable) - hover discret
   */
  cardInteractive: {
    backgroundColor: colors.surface,
    border: 'none',
    borderRadius: borders.radius.lg,
    boxShadow: shadows.panel,
    transition: `box-shadow ${transitions.normal}`,
    cursor: 'pointer',
    '&:hover': {
      boxShadow: shadows.lg,
    },
  },

  /**
   * Titre de panneau (H4 Garamond + filet bas)
   */
  panelTitle: {
    fontFamily: typography.fontFamilySerif,
    fontWeight: typography.weights.medium,
    fontSize: '18px',
    lineHeight: 1.3,
    color: colors.textPrimary,
    m: 0,
    px: 3,
    pt: 1.75,
    pb: 1.5,
    borderBottom: `1px solid ${colors.border}`,
  },

  /**
   * Titre de page (H2 Garamond 30px)
   */
  pageTitle: {
    fontFamily: typography.fontFamilySerif,
    fontWeight: typography.weights.medium,
    fontSize: { xs: '26px', md: '30px' },
    lineHeight: 1.15,
    color: colors.textPrimary,
    letterSpacing: 0,
  },

  /**
   * Surtitre de page (précédé d'un filet laiton 22×1)
   */
  eyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px',
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    '&::before': {
      content: '""',
      width: 22,
      height: '1px',
      backgroundColor: colors.brass.main,
      flexShrink: 0,
    },
  },

  /**
   * Bloc « Net / Disponible / Reste à payer »
   */
  highlightBlock: {
    background: gradients.highlight,
    color: colors.onDark.primary,
    borderRadius: borders.radius.lg,
    boxShadow: `inset 0 0 0 1px ${colors.brass.halo}`,
    px: 2,
    py: 1.75,
  },

  /**
   * Chiffre KPI (Garamond 30px)
   */
  kpiValue: {
    fontFamily: typography.fontFamilySerif,
    fontWeight: typography.weights.medium,
    fontSize: '30px',
    lineHeight: 1.1,
    color: colors.textPrimary,
    fontVariantNumeric: 'tabular-nums',
  },

  /**
   * Header de page (Confluence style)
   */
  pageHeader: {
    backgroundColor: 'transparent',
    px: 0,
    pt: 0,
    pb: spacing.mui.xl,
  },

  /**
   * Action bar sticky (en haut du formulaire)
   */
  stickyActionBar: {
    position: 'sticky' as const,
    top: 0,
    zIndex: zIndex.sticky,
    backgroundColor: 'rgba(255, 253, 248, 0.94)',
    borderBottom: `1px solid ${colors.border}`,
    px: spacing.mui['2xl'],
    py: spacing.mui.md,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(8px)',
    boxShadow: shadows.sm,
  },

  /**
   * Section de formulaire
   */
  formSection: {
    mb: spacing.mui['3xl'],
  },

  /**
   * Grille formulaire 2 colonnes
   */
  formGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: spacing.mui.lg,
  },

  /**
   * Champ full-width (occupe les 2 colonnes)
   */
  formFieldFullWidth: {
    gridColumn: { md: '1 / -1' },
  },

  /**
   * Bouton primaire (Atlassian style)
   */
  buttonPrimary: {
    background: gradients.primaryButton,
    backgroundColor: colors.primary[600],
    color: colors.textOnColor,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
    textTransform: 'none' as const,
    boxShadow: shadows.primaryButton,
    borderRadius: borders.radius.base,
    minHeight: 36,
    px: spacing.mui.lg,
    py: 0,
    '&:hover': {
      background: gradients.primaryButton,
      filter: 'brightness(1.08)',
      boxShadow: shadows.primaryButton,
    },
    '&:focus-visible': {
      boxShadow: `${shadows.primaryButton}, ${shadows.focus}`,
    },
    '&:disabled': {
      background: colors.neutral[200],
      color: colors.textDisabled,
      boxShadow: shadows.none,
    },
  },

  /**
   * Bouton secondaire (outlined)
   */
  buttonSecondary: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.fieldBorder}`,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    fontSize: typography.sizes.sm,
    textTransform: 'none' as const,
    borderRadius: borders.radius.base,
    minHeight: 36,
    px: spacing.mui.lg,
    py: 0,
    '&:hover': {
      backgroundColor: colors.surface,
      borderColor: colors.textSecondary,
    },
    '&:focus-visible': {
      boxShadow: shadows.focus,
    },
  },

  /**
   * Bouton ghost (sans bordure)
   */
  buttonGhost: {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    fontSize: typography.sizes.sm,
    textTransform: 'none' as const,
    borderRadius: borders.radius.base,
    px: spacing.mui.md,
    py: spacing.mui.sm,
    '&:hover': {
      backgroundColor: colors.surfaceAlt,
      color: colors.textPrimary,
    },
  },

  /**
   * Bouton danger (contour brique)
   */
  buttonDanger: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.danger[200]}`,
    color: colors.danger[600],
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
    textTransform: 'none' as const,
    boxShadow: shadows.none,
    borderRadius: borders.radius.base,
    minHeight: 36,
    px: spacing.mui.lg,
    py: 0,
    '&:hover': {
      backgroundColor: colors.danger[50],
    },
    '&:focus-visible': {
      boxShadow: shadows.focusDanger,
    },
  },

  /**
   * Bouton success
   */
  buttonSuccess: {
    backgroundColor: colors.success[700],
    color: colors.textOnColor,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
    textTransform: 'none' as const,
    boxShadow: shadows.none,
    borderRadius: borders.radius.base,
    px: spacing.mui.lg,
    py: spacing.mui.sm,
    '&:hover': {
      backgroundColor: colors.success[800],
    },
  },

  /**
   * Bouton pointillé (« + Ajouter… »)
   */
  buttonDashed: {
    backgroundColor: 'transparent',
    border: `1px dashed ${colors.fieldBorder}`,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    fontSize: typography.sizes.sm,
    textTransform: 'none' as const,
    borderRadius: borders.radius.base,
    minHeight: 34,
    px: 1.75,
    '&:hover': {
      backgroundColor: 'transparent',
      borderColor: colors.textSecondary,
      color: colors.textPrimary,
    },
  },

  /**
   * Label de formulaire
   */
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    mb: 0.75,
    display: 'block',
  },

  /**
   * Texte requis (*)
   */
  requiredMark: {
    color: colors.danger[500],
    ml: 0.5,
  },

  /**
   * Input field standard
   */
  inputField: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: colors.surface,
      borderRadius: borders.radius.base,
      fontSize: typography.sizes.base,
      '& fieldset': {
        borderColor: colors.fieldBorder,
      },
      '&:hover fieldset': {
        borderColor: colors.textSecondary,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary[600],
        borderWidth: '1px',
      },
      '&.Mui-focused': {
        boxShadow: shadows.focus,
      },
    },
  },

  /**
   * Sidebar styles
   */
  sidebar: {
    container: {
      backgroundColor: colors.sidebarBg,
      borderRight: `1px solid ${colors.border}`,
      width: 264,
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
      px: spacing.md,
      py: spacing.sm,
      mx: spacing.sm,
      borderRadius: borders.radius.base,
      color: colors.textSecondary,
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.medium,
      transition: `all ${transitions.fast}`,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: colors.neutral[100],
        color: colors.textPrimary,
      },
    },
    menuItemActive: {
      backgroundColor: colors.primary[50],
      color: colors.primary[700],
      '&:hover': {
        backgroundColor: colors.primary[100],
        color: colors.primary[700],
      },
    },
    groupHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: spacing.md,
      py: spacing.xs,
      mx: spacing.sm,
      borderRadius: borders.radius.base,
      color: colors.textSecondary,
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: colors.neutral[50],
      },
    },
  },

  /**
   * Table styles
   */
  table: {
    container: {
      backgroundColor: colors.surface,
      border: 'none',
      borderRadius: borders.radius.lg,
      boxShadow: shadows.panel,
      overflow: 'hidden',
    },
    header: {
      backgroundColor: colors.surfaceAlt,
      borderBottom: `1px solid ${colors.border}`,
    },
    headerCell: {
      fontWeight: typography.weights.semibold,
      fontSize: typography.sizes.xs,
      color: colors.textTertiary,
      py: spacing.mui.md,
      px: spacing.mui.lg,
    },
    row: {
      borderBottom: `1px solid ${colors.divider}`,
      transition: `background-color ${transitions.fast}`,
      '&:hover': {
        backgroundColor: 'rgba(247, 243, 234, 0.7)',
      },
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    cell: {
      fontSize: typography.sizes.base,
      color: colors.textPrimary,
      py: spacing.mui.md,
      px: spacing.mui.lg,
    },
  },

  /**
   * Stat card (Dashboard KPIs) - clean, no gimmicks
   */
  statCard: {
    backgroundColor: colors.surface,
    border: 'none',
    borderRadius: borders.radius.lg,
    boxShadow: shadows.panel,
    px: 2.5,
    py: 2,
  },

  /**
   * Stat card icon - subtle round container
   */
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: borders.radius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /**
   * Detail page section card
   */
  sectionCard: {
    backgroundColor: colors.surface,
    border: 'none',
    borderRadius: borders.radius.lg,
    boxShadow: shadows.panel,
    overflow: 'hidden',
  },

  /**
   * Section card header
   */
  sectionCardHeader: {
    px: spacing.mui['2xl'],
    pt: 1.75,
    pb: 1.5,
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /**
   * Section card body
   */
  sectionCardBody: {
    px: spacing.mui['2xl'],
    py: spacing.mui.lg,
  },

  /**
   * Info row for detail pages (label: value pairs)
   */
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    py: spacing.mui.md,
    borderBottom: `1px solid ${colors.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },

  /**
   * Info label
   */
  infoLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    minWidth: 160,
    flexShrink: 0,
  },

  /**
   * Info value
   */
  infoValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    flex: 1,
  },

  /**
   * Trend badge (positive/negative)
   */
  trendBadgeUp: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    px: 1,
    py: 0.25,
    borderRadius: borders.radius.full,
    backgroundColor: colors.success[50],
    color: colors.success[700],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },

  trendBadgeDown: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    px: 1,
    py: 0.25,
    borderRadius: borders.radius.full,
    backgroundColor: colors.danger[50],
    color: colors.danger[700],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },

  /**
   * Empty state
   */
  emptyState: {
    textAlign: 'center' as const,
    py: spacing.mui['5xl'],
    px: spacing.mui['2xl'],
    color: colors.textSecondary,
  },

  /**
   * Breadcrumb
   */
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    '& a': {
      color: colors.textSecondary,
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
      '&:hover': {
        color: colors.linkHover,
      },
    },
    '& .separator': {
      color: colors.neutral[400],
    },
  },

  /**
   * List Page - Modern listing style
   * Utiliser pour toutes les pages de listing
   */
  listPage: {
    /** Container principal */
    container: {
      minHeight: '100%',
      bgcolor: 'transparent',
    },
    /** Header de page avec titre et actions */
    header: {
      bgcolor: 'transparent',
      px: 0,
      pt: 0,
      pb: 2.5,
    },
    /** Titre principal */
    title: {
      fontFamily: typography.fontFamilySerif,
      fontWeight: typography.weights.medium,
      color: colors.textPrimary,
      fontSize: { xs: '26px', md: '30px' },
      lineHeight: 1.15,
      letterSpacing: 0,
      mb: 0.75,
    },
    /** Sous-titre / stats */
    subtitle: {
      color: colors.textSecondary,
      fontSize: typography.sizes.sm,
    },
    /** Toolbar de recherche/filtres */
    toolbar: {
      px: 0,
      py: 1.5,
      bgcolor: 'transparent',
      display: 'flex',
      gap: 1.5,
      alignItems: 'center',
      flexWrap: 'wrap' as const,
    },
    /** Champ de recherche */
    searchField: {
      width: { xs: '100%', sm: 320 },
      '& .MuiOutlinedInput-root': {
        bgcolor: colors.surface,
        borderRadius: borders.radius.base,
        fontSize: typography.sizes.base,
        boxShadow: shadows.fieldInset,
        transition: `all ${transitions.normal}`,
        '& fieldset': {
          borderColor: colors.fieldBorder,
        },
        '&:hover fieldset': {
          borderColor: colors.textSecondary,
        },
        '&.Mui-focused': {
          boxShadow: shadows.focus,
          '& fieldset': {
            borderColor: colors.primary[600],
            borderWidth: '1px',
          },
        },
      },
    },
    /** Container de la table */
    tableContainer: {
      borderRadius: borders.radius.lg,
      border: 'none',
      boxShadow: shadows.panel,
      overflow: 'hidden',
      bgcolor: colors.surface,
    },
    /** Header de table */
    tableHeader: {
      bgcolor: colors.surfaceAlt,
      '& th': {
        fontWeight: typography.weights.semibold,
        color: colors.textTertiary,
        fontSize: typography.sizes.xs,
        bgcolor: colors.surfaceAlt,
        py: 1.25,
        borderBottom: `1px solid ${colors.border}`,
      },
    },
    /** Ligne de table cliquable */
    tableRowClickable: {
      cursor: 'pointer',
      transition: `background-color ${transitions.fast}`,
      '&:hover': {
        bgcolor: colors.primary[25],
      },
      '& td': {
        borderBottom: `1px solid ${colors.divider}`,
      },
    },
    /** Ligne enfant (sous-convention, sous-item) */
    tableRowChild: {
      cursor: 'pointer',
      bgcolor: colors.surface,
      '&:hover': {
        bgcolor: colors.primary[25],
      },
      '& td': {
        borderBottom: `1px solid ${colors.divider}`,
      },
    },
    /** Pill de filtre actif - subtil, pas flashy */
    filterPillActive: {
      bgcolor: colors.surface,
      color: colors.textPrimary,
      fontWeight: typography.weights.semibold,
      border: `1px solid ${colors.fieldBorder}`,
      boxShadow: shadows.raised,
      borderRadius: borders.radius.base,
      '&:hover': { bgcolor: colors.surface },
    },
    /** Pill de filtre inactif */
    filterPill: {
      bgcolor: 'transparent',
      color: colors.textSecondary,
      fontWeight: typography.weights.medium,
      border: `1px solid transparent`,
      borderRadius: borders.radius.base,
      '&:hover': {
        bgcolor: 'rgba(255, 253, 248, 0.6)',
        color: colors.textPrimary,
      },
    },
    /** Badge de compteur (pill active) */
    countBadge: {
      bgcolor: colors.ink.main,
      color: colors.onDark.primary,
      fontSize: typography.sizes['2xs'],
      fontWeight: typography.weights.bold,
      minWidth: 20,
      height: 20,
      borderRadius: borders.radius.full,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 0.75,
    },
    /** Count badge (pill inactive) */
    countBadgeInactive: {
      bgcolor: 'transparent',
      color: colors.textTertiary,
      fontSize: typography.sizes['2xs'],
      fontWeight: typography.weights.bold,
      minWidth: 20,
      height: 20,
      borderRadius: borders.radius.full,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 0.75,
    },
    /** Empty state container */
    emptyState: {
      textAlign: 'center' as const,
      py: 8,
      px: 3,
    },
  },

  /**
   * Dialog styles - modern modal design
   */
  dialog: {
    paper: {
      borderRadius: borders.radius.xl,
      boxShadow: shadows.xl,
      bgcolor: colors.surface,
    },
    title: {
      fontFamily: typography.fontFamilySerif,
      fontWeight: typography.weights.medium,
      fontSize: '20px',
      color: colors.textPrimary,
      pb: 1,
    },
  },

  /**
   * Numeric input field - Excel-style
   * Right-aligned, tabular-nums, French formatting
   * Used by DecimalInput component for ALL numeric fields
   */
  numericInput: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: colors.surface,
      borderRadius: borders.radius.base,
      fontSize: typography.sizes.base,
      '& fieldset': {
        borderColor: colors.fieldBorder,
      },
      '&:hover fieldset': {
        borderColor: colors.textSecondary,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary[600],
        borderWidth: '1px',
      },
      '&.Mui-focused': {
        boxShadow: shadows.focus,
      },
    },
    '& .MuiOutlinedInput-input': {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
      fontFamily: typography.fontFamily,
    },
  },

  /**
   * Rich text display - renders HTML content from RichTextEditor
   * Use for libellé, objet, description fields that may contain rich HTML
   */
  richTextDisplay: {
    /** Full block display for detail pages */
    block: {
      fontSize: typography.sizes.base,
      color: colors.textPrimary,
      lineHeight: typography.lineHeights.relaxed,
      wordBreak: 'break-word' as const,
      '& p': { margin: '0.25em 0' },
      '& p:first-of-type': { marginTop: 0 },
      '& p:last-of-type': { marginBottom: 0 },
      '& ul, & ol': { marginLeft: '1.5em', marginTop: '0.25em', marginBottom: '0.25em' },
      '& li': { marginBottom: '0.15em' },
      '& strong': { fontWeight: typography.weights.semibold },
      '& em': { fontStyle: 'italic' },
      '& a': { color: colors.link, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
      '& h1, & h2, & h3': { fontWeight: typography.weights.bold, margin: '0.5em 0 0.25em' },
      '& blockquote': {
        borderLeft: `3px solid ${colors.neutral[300]}`,
        paddingLeft: '1em',
        margin: '0.5em 0',
        color: colors.textSecondary,
      },
      '& pre, & code': {
        fontFamily: typography.fontFamilyMono,
        fontSize: '0.9em',
        backgroundColor: colors.neutral[50],
        borderRadius: borders.radius.sm,
      },
      '& pre': { padding: '0.75em', margin: '0.5em 0', overflow: 'auto' },
      '& code': { padding: '0.15em 0.3em' },
    },
    /** Inline display for tables - strips to single line, plain text */
    inline: {
      fontSize: typography.sizes.sm,
      color: colors.textPrimary,
      overflow: 'hidden' as const,
      textOverflow: 'ellipsis' as const,
      whiteSpace: 'nowrap' as const,
      maxWidth: 300,
    },
    /** Compact display for cards - limited height */
    compact: {
      fontSize: typography.sizes.sm,
      color: colors.textPrimary,
      lineHeight: typography.lineHeights.normal,
      wordBreak: 'break-word' as const,
      '& p': { margin: '0.15em 0' },
      '& p:first-of-type': { marginTop: 0 },
      '& p:last-of-type': { marginBottom: 0 },
      '& ul, & ol': { marginLeft: '1.25em', marginTop: '0.15em', marginBottom: '0.15em' },
      '& strong': { fontWeight: typography.weights.semibold },
      '& em': { fontStyle: 'italic' },
      '& a': { color: colors.link, textDecoration: 'none' },
    },
    /** Container box for rich text in detail pages */
    container: {
      p: 1.5,
      bgcolor: colors.neutral[25],
      borderRadius: borders.radius.md,
      border: `1px solid ${colors.borderSubtle}`,
    },
  },

  /**
   * Modern action menu item
   */
  menuItem: {
    fontSize: typography.sizes.sm,
    py: 1,
    px: 2,
    gap: 1.5,
    borderRadius: borders.radius.lg,
    mx: 0.5,
    '&:hover': {
      bgcolor: colors.surfaceAlt,
    },
  },

  // ==================== MODERN PANEL STYLES ====================

  /**
   * Control panel (top bar with breadcrumb, search, actions)
   */
  controlPanel: {
    container: {
      bgcolor: 'transparent',
      px: 0,
      py: 0,
    },
    /** Top row: breadcrumbs + actions */
    topRow: {
      display: 'flex',
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
      flexDirection: { xs: 'column', sm: 'row' },
      py: 1.5,
      minHeight: 48,
      gap: { xs: 1, sm: 2 },
    },
    /** Bottom row: search + filters + group by */
    bottomRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      py: 1,
      flexWrap: 'wrap' as const,
    },
    /** Breadcrumb trail */
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      minWidth: 0,
      flex: 1,
    },
    breadcrumbLink: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.medium,
      color: colors.textSecondary,
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
      cursor: 'pointer',
      whiteSpace: 'nowrap' as const,
      '&:hover': {
        color: colors.brass.main,
      },
    },
    breadcrumbCurrent: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.medium,
      color: colors.textSecondary,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden' as const,
      textOverflow: 'ellipsis' as const,
    },
    breadcrumbSeparator: {
      color: colors.neutral[400],
      mx: 0.25,
      flexShrink: 0,
    },
    /** Action buttons group */
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      flexShrink: 0,
      flexWrap: 'wrap' as const,
    },
    /** View switcher (list/kanban/map) */
    viewSwitcher: {
      display: 'inline-flex',
      bgcolor: colors.neutral[100],
      borderRadius: borders.radius.base,
      p: '3px',
      gap: '2px',
    },
    viewSwitcherButton: {
      p: 0.75,
      borderRadius: borders.radius.sm,
      minWidth: 32,
      color: colors.textSecondary,
      '&:hover': {
        color: colors.textPrimary,
      },
    },
    viewSwitcherButtonActive: {
      p: 0.75,
      borderRadius: borders.radius.sm,
      minWidth: 32,
      bgcolor: colors.surface,
      color: colors.textPrimary,
      boxShadow: shadows.raised,
      '&:hover': {
        bgcolor: colors.surface,
      },
    },
    /** Search bar */
    searchBar: {
      flex: 1,
      maxWidth: 480,
      '& .MuiOutlinedInput-root': {
        bgcolor: colors.surface,
        borderRadius: borders.radius.base,
        fontSize: typography.sizes.base,
        height: 36,
        '& fieldset': {
          borderColor: colors.fieldBorder,
        },
        '&:hover fieldset': {
          borderColor: colors.textSecondary,
        },
        '&.Mui-focused fieldset': {
          borderColor: colors.primary[600],
          borderWidth: '1px',
        },
        '&.Mui-focused': {
          boxShadow: shadows.focus,
        },
      },
    },
    /** Filter tag */
    filterTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      px: 1.25,
      py: 0.5,
      bgcolor: colors.info[50],
      color: colors.textPrimary,
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.medium,
      borderRadius: borders.radius.full,
      border: `1px solid ${colors.info[200]}`,
      cursor: 'pointer',
      '&:hover': {
        bgcolor: colors.surface,
      },
    },
    /** Pager (1-20 / 55) */
    pager: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      whiteSpace: 'nowrap' as const,
    },
  },

  /**
   * Form view (view mode + inline edit)
   */
  formView: {
    /** Container */
    container: {
      bgcolor: colors.surface,
      border: 'none',
      borderRadius: borders.radius.lg,
      boxShadow: shadows.panel,
      overflow: 'hidden',
    },
    /** Status bar (top of form with status pills) */
    statusBar: {
      display: 'flex',
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
      flexDirection: { xs: 'column', sm: 'row' },
      px: { xs: 2, sm: 3 },
      py: 1.5,
      gap: { xs: 1, sm: 2 },
      bgcolor: colors.surfaceAlt,
      borderBottom: `1px solid ${colors.border}`,
    },
    /** Status bar buttons */
    statusBarButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      flexWrap: 'wrap' as const,
    },
    /** Circuit (pastilles numérotées) */
    statusPipeline: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      flexWrap: 'wrap' as const,
      maxWidth: '100%',
    },
    /** Étape à venir */
    statusPipelineStep: {
      pl: 0.5,
      pr: 1.5,
      py: 0.5,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.textSecondary,
      bgcolor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: borders.radius.full,
      cursor: 'default',
      whiteSpace: 'nowrap' as const,
    },
    /** Étape courante : bleu nuit cerclé de laiton */
    statusPipelineStepActive: {
      pl: 0.5,
      pr: 1.5,
      py: 0.5,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
      bgcolor: colors.surface,
      border: `1px solid ${colors.border}`,
      boxShadow: shadows.raised,
      borderRadius: borders.radius.full,
      cursor: 'default',
      whiteSpace: 'nowrap' as const,
    },
    /** Étape faite : ✓ vert */
    statusPipelineStepDone: {
      pl: 0.5,
      pr: 1.5,
      py: 0.5,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.textPrimary,
      bgcolor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: borders.radius.full,
      cursor: 'default',
      whiteSpace: 'nowrap' as const,
    },
    /** Rejeté / annulé : rouge « ! » */
    statusPipelineStepDanger: {
      pl: 0.5,
      pr: 1.5,
      py: 0.5,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: colors.danger[600],
      bgcolor: colors.danger[50],
      border: `1px solid ${colors.danger[200]}`,
      borderRadius: borders.radius.full,
      cursor: 'default',
      whiteSpace: 'nowrap' as const,
    },
    /** Pastille numérotée du circuit */
    statusStepMarker: {
      width: 22,
      height: 22,
      borderRadius: borders.radius.full,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: typography.weights.bold,
      flexShrink: 0,
      mr: 0.75,
    },
    statusStepMarkerFuture: {
      bgcolor: colors.surface,
      color: colors.textSecondary,
      border: `1px solid ${colors.fieldBorder}`,
    },
    statusStepMarkerActive: {
      bgcolor: colors.ink.main,
      color: colors.onDark.primary,
      boxShadow: `0 0 0 2px ${colors.brass.main}`,
    },
    statusStepMarkerDone: {
      bgcolor: colors.success[700],
      color: colors.onDark.primary,
    },
    statusStepMarkerDanger: {
      bgcolor: colors.danger[600],
      color: colors.onDark.primary,
    },
    /** Sheet (main content area of form) */
    sheet: {
      p: { xs: 2, sm: 3 },
    },
    /** Title field (editable h1) */
    titleField: {
      fontFamily: typography.fontFamilySerif,
      fontSize: '30px',
      lineHeight: 1.15,
      fontWeight: typography.weights.medium,
      color: colors.textPrimary,
      border: 'none',
      outline: 'none',
      width: '100%',
      p: 0,
      mb: 1,
      '&:hover': {
        bgcolor: colors.primary[25],
      },
      '&:focus': {
        bgcolor: colors.primary[25],
        outline: `2px solid ${colors.primary[400]}`,
        borderRadius: borders.radius.sm,
      },
    },
    /** Group (bordered section inside sheet) */
    group: {
      border: `1px solid ${colors.border}`,
      borderRadius: borders.radius.md,
      overflow: 'hidden',
      mb: 2,
    },
    /** Group header */
    groupTitle: {
      bgcolor: colors.surfaceAlt,
      px: 2,
      py: 1.25,
      borderBottom: `1px solid ${colors.border}`,
      fontFamily: typography.fontFamilySerif,
      fontSize: '17px',
      fontWeight: typography.weights.medium,
      color: colors.textPrimary,
    },
    /** Group body */
    groupBody: {
      p: 2,
    },
    /** Field row (label + value in form) */
    fieldRow: {
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'baseline' },
      py: 0.75,
      minHeight: { xs: 'auto', sm: 36 },
      gap: { xs: 0.25, sm: 0 },
      '&:not(:last-child)': {
        borderBottom: `1px solid ${colors.divider}`,
      },
    },
    /** Field label */
    fieldLabel: {
      width: { xs: '100%', sm: 180 },
      flexShrink: 0,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.textSecondary,
      pr: { xs: 0, sm: 2 },
    },
    /** Field value (view mode) */
    fieldValue: {
      flex: 1,
      fontSize: typography.sizes.base,
      color: colors.textPrimary,
      fontWeight: typography.weights.medium,
      minHeight: 24,
      display: 'flex',
      alignItems: 'center',
    },
    /** Editable field value (hover to show editable) */
    fieldValueEditable: {
      flex: 1,
      fontSize: typography.sizes.base,
      color: colors.textPrimary,
      fontWeight: typography.weights.medium,
      minHeight: 24,
      display: 'flex',
      alignItems: 'center',
      px: 0.75,
      py: 0.25,
      mx: -0.75,
      borderRadius: borders.radius.sm,
      cursor: 'text',
      transition: `background-color ${transitions.fast}`,
      '&:hover': {
        bgcolor: colors.primary[25],
      },
    },
    /** Field value as link (navigable) */
    fieldValueLink: {
      flex: 1,
      fontSize: typography.sizes.base,
      color: colors.primary[600],
      fontWeight: typography.weights.medium,
      cursor: 'pointer',
      textDecoration: 'none',
      '&:hover': {
        color: colors.primary[700],
        textDecoration: 'underline',
      },
    },
    /** Monetary field */
    fieldValueMoney: {
      flex: 1,
      fontSize: typography.sizes.base,
      color: colors.textPrimary,
      fontWeight: typography.weights.semibold,
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'right' as const,
    },
    /** Inline edit input */
    inlineInput: {
      '& .MuiOutlinedInput-root': {
        fontSize: typography.sizes.base,
        '& fieldset': {
          borderColor: colors.primary[300],
        },
        '&.Mui-focused fieldset': {
          borderColor: colors.primary[500],
          borderWidth: '2px',
        },
      },
      '& .MuiOutlinedInput-input': {
        py: 0.5,
        px: 0.75,
      },
    },
    /** Notebook (tabbed sections) */
    notebook: {
      mt: 2,
    },
    notebookTabs: {
      borderBottom: `1px solid ${colors.border}`,
      minHeight: 42,
      flex: 1,
      '& .MuiTab-root': {
        textTransform: 'none' as const,
        fontWeight: typography.weights.medium,
        fontSize: '13.5px',
        color: colors.textSecondary,
        minHeight: 42,
        minWidth: 0,
        px: 1.5,
        py: 1,
        '&:hover': { color: colors.textPrimary },
        '&.Mui-selected': {
          color: colors.textPrimary,
          fontWeight: typography.weights.semibold,
        },
      },
      '& .MuiTabs-indicator': {
        backgroundColor: colors.brass.main,
        height: 2,
      },
    },
    /** Chatter (right side panel / activity log) */
    chatter: {
      borderLeft: { xs: 'none', md: `1px solid ${colors.border}` },
      borderTop: { xs: `1px solid ${colors.border}`, md: 'none' },
      bgcolor: colors.surfaceAlt,
      p: 2,
      minWidth: { xs: '100%', md: 320 },
      maxWidth: { xs: '100%', md: 400 },
    },
  },

  /**
   * List view with inline editing
   */
  listView: {
    container: {
      bgcolor: colors.surface,
      border: 'none',
      borderRadius: borders.radius.lg,
      boxShadow: shadows.panel,
      overflow: 'hidden',
    },
    /** Table in list view */
    table: {
      '& .MuiTableCell-root': {
        py: 0.75,
        px: 1.5,
        fontSize: typography.sizes.base,
        borderBottom: `1px solid ${colors.divider}`,
      },
    },
    /** Header row */
    headerRow: {
      bgcolor: colors.surfaceAlt,
      '& .MuiTableCell-head': {
        fontWeight: typography.weights.semibold,
        fontSize: typography.sizes.xs,
        color: colors.textTertiary,
        bgcolor: colors.surfaceAlt,
        py: 1.25,
        px: 1.5,
        borderBottom: `1px solid ${colors.border}`,
        whiteSpace: 'nowrap' as const,
        userSelect: 'none' as const,
        cursor: 'pointer',
        '&:hover': {
          color: colors.textPrimary,
        },
      },
    },
    /** Data row */
    dataRow: {
      transition: `background-color ${transitions.fast}`,
      cursor: 'pointer',
      '&:hover': {
        bgcolor: colors.primary[25],
      },
      '& .MuiTableCell-body': {
        color: colors.textPrimary,
      },
    },
    /** Selected row */
    dataRowSelected: {
      bgcolor: colors.primary[50],
      '&:hover': {
        bgcolor: colors.primary[100],
      },
    },
    /** Checkbox column */
    checkboxCell: {
      width: 42,
      px: 0.5,
    },
    /** Editable cell (click to edit inline) */
    editableCell: {
      cursor: 'text',
      '&:hover': {
        bgcolor: colors.primary[25],
        outline: `1px solid ${colors.primary[200]}`,
        borderRadius: borders.radius.sm,
      },
    },
    /** Quick create row (bottom of table) */
    quickCreateRow: {
      bgcolor: colors.neutral[25],
      borderTop: `2px solid ${colors.border}`,
      '& .MuiTableCell-body': {
        py: 1,
        color: colors.textSecondary,
      },
    },
    /** Optional group header row */
    groupHeaderRow: {
      bgcolor: 'rgba(247, 243, 234, 0.6)',
      cursor: 'pointer',
      '&:hover': {
        bgcolor: colors.neutral[100],
      },
      '& .MuiTableCell-body': {
        fontWeight: typography.weights.semibold,
        fontSize: typography.sizes.sm,
        color: colors.textPrimary,
        py: 0.75,
      },
    },
    /** Aggregation footer */
    footerRow: {
      bgcolor: colors.surfaceAlt,
      borderTop: `1px solid ${colors.border}`,
      '& .MuiTableCell-body': {
        fontWeight: typography.weights.semibold,
        fontSize: typography.sizes.sm,
        color: colors.textPrimary,
        py: 1,
      },
    },
  },

  /**
   * Wizard view – multi-step form creation flow
   */
  wizardView: {
    /** Outer container */
    container: {
      minWidth: 0,
    },
    /** En-tête : surtitre + titre */
    header: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 2,
      flexWrap: 'wrap' as const,
      pb: 2.5,
    },
    /** Étapes : cartes numérotées */
    stepBar: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(160px, 1fr))' },
      gap: 1.25,
      mb: 2.5,
    },
    /** Étape à venir */
    step: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
      px: 1.5,
      py: 1.25,
      borderRadius: borders.radius.lg,
      bgcolor: colors.surface,
      boxShadow: shadows.sm,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.textSecondary,
      cursor: 'default',
      minWidth: 0,
    },
    /** Étape active */
    stepActive: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
      px: 1.5,
      py: 1.25,
      borderRadius: borders.radius.lg,
      bgcolor: colors.surface,
      boxShadow: shadows.panel,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
      cursor: 'default',
      minWidth: 0,
    },
    /** Étape faite (cliquable pour revenir) */
    stepDone: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
      px: 1.5,
      py: 1.25,
      borderRadius: borders.radius.lg,
      bgcolor: colors.surface,
      boxShadow: shadows.sm,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.textPrimary,
      cursor: 'pointer',
      minWidth: 0,
      transition: `box-shadow ${transitions.fast}`,
      '&:hover': { boxShadow: shadows.lg },
    },
    /** Pastille numérotée */
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: borders.radius.full,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: typography.weights.bold,
      flexShrink: 0,
    },
    stepNumberDefault: {
      bgcolor: colors.surface,
      color: colors.textSecondary,
      border: `1px solid ${colors.fieldBorder}`,
    },
    stepNumberActive: {
      bgcolor: colors.ink.main,
      color: colors.onDark.primary,
      boxShadow: `0 0 0 2px ${colors.brass.main}`,
    },
    stepNumberDone: {
      bgcolor: colors.success[700],
      color: colors.onDark.primary,
    },
    /** Content sheet */
    sheet: {
      minWidth: 0,
    },
    /** Panneau de l'étape */
    card: {
      bgcolor: colors.surface,
      borderRadius: borders.radius.lg,
      boxShadow: shadows.panel,
      p: { xs: 2, md: 3 },
    },
    /** Pied de l'assistant (Précédent / Suivant) */
    navBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      mt: 2,
      px: { xs: 2, md: 3 },
      py: 1.5,
      bgcolor: colors.surfaceAlt,
      borderRadius: borders.radius.lg,
      boxShadow: shadows.sm,
    },
  },

  /**
   * Resizable Section - Collapsible & resizable content panels.
   * Used to wrap detail page sections so users can collapse, resize,
   * and arrange visible content. Persists state in localStorage.
   *
   * Usage:
   *   import { ResizableSection } from '@/components/core'
   *   <ResizableSection title="Budget" storageKey="conv-budget">
   *     <MyCardContent />
   *   </ResizableSection>
   */
  resizableSection: {
    /** Outer container */
    container: {
      border: 'none',
      borderRadius: borders.radius.lg,
      bgcolor: colors.surface,
      boxShadow: shadows.panel,
      overflow: 'hidden',
      mb: 2,
    },
    /** Clickable header bar */
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 2,
      py: 1,
      cursor: 'pointer',
      userSelect: 'none' as const,
      bgcolor: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      transition: `background-color ${transitions.fast}`,
      '&:hover': {
        bgcolor: colors.surfaceAlt,
      },
    },
    /** Collapsed header (no bottom border) */
    headerCollapsed: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 2,
      py: 1,
      cursor: 'pointer',
      userSelect: 'none' as const,
      bgcolor: colors.surface,
      transition: `background-color ${transitions.fast}`,
      '&:hover': {
        bgcolor: colors.surfaceAlt,
      },
    },
    /** Chevron icon area */
    chevron: {
      display: 'flex',
      alignItems: 'center',
      color: colors.textSecondary,
      flexShrink: 0,
      transition: `transform ${transitions.fast}`,
    },
    /** Section icon */
    icon: {
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    },
    /** Section title */
    title: {
      fontFamily: typography.fontFamilySerif,
      fontSize: '18px',
      fontWeight: typography.weights.medium,
      color: colors.textPrimary,
      flex: 1,
    },
    /** Actions slot (right side of header) */
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      flexShrink: 0,
    },
    /** Scrollable content area */
    content: {
      p: 2,
    },
    /** Bottom resize handle */
    resizeHandle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 10,
      cursor: 'row-resize',
      color: colors.neutral[300],
      bgcolor: colors.neutral[25],
      borderTop: `1px solid ${colors.divider}`,
      transition: `all ${transitions.fast}`,
      '&:hover': {
        bgcolor: colors.neutral[100],
        color: colors.neutral[500],
        height: 14,
      },
    },
  },
} as const

// ==================== STATUTS - Mapping couleurs ====================

export type StatusColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary' | 'purple'

export interface StatusConfig {
  label: string
  color: StatusColor
  bgColor: string
  textColor: string
  dotColor: string
  borderColor: string
}

/** Ton Registre associé à chaque famille de couleur */
const toneOfColor: Record<StatusColor, ToneKey> = {
  success: 'ok',
  warning: 'w',
  danger: 'e',
  info: 'i',
  primary: 'i',
  neutral: 'n',
  purple: 'n',
}

/** Ton Registre d'une famille de couleur de statut. */
export const toneOf = (color: StatusColor): ToneKey => toneOfColor[color]

const status = (label: string, color: StatusColor): StatusConfig => {
  const t = tones[toneOfColor[color]]
  return { label, color, bgColor: t.bg, textColor: t.fg, dotColor: t.fg, borderColor: t.bd }
}

export const statusColors: Record<string, StatusConfig> = {
  BROUILLON: status('Brouillon', 'neutral'),
  SOUMIS: status('Soumis', 'warning'),
  VALIDE: status('Validé', 'success'),
  VALIDEE: status('Validée', 'success'),
  EN_EXECUTION: status('En exécution', 'info'),
  EN_COURS: status('En cours', 'info'),
  ACHEVE: status('Achevé', 'neutral'),
  TERMINE: status('Terminé', 'neutral'),
  REJETE: status('Rejeté', 'danger'),
  ANNULE: status('Annulé', 'danger'),
  EN_RETARD: status('En retard', 'danger'),
  SUSPENDU: status('Suspendu', 'danger'),
  ACTIF: status('Actif', 'success'),
  INACTIF: status('Inactif', 'neutral'),
  NOUVEAU: status('Nouveau', 'purple'),
  URGENT: status('Urgent', 'danger'),
  CADRE: status('Cadre', 'neutral'),
  SPECIFIQUE: status('Spécifique', 'neutral'),
  EN_PREPARATION: status('En préparation', 'neutral'),
  MARCHE: status('Marché', 'neutral'),
  CONTRAT: status('Contrat', 'info'),
  BON_DE_COMMANDE: status('Bon de commande', 'purple'),
  LETTRE_DE_COMMANDE: status('Lettre de commande', 'warning'),
  TRAVAUX: status('Travaux', 'primary'),
  FOURNITURES: status('Fournitures', 'info'),
  SERVICES: status('Services', 'purple'),
  ETUDES: status('Études', 'warning'),
  COMMENCEMENT: status('Commencement', 'success'),
  ARRET: status('Arrêt', 'danger'),
  REPRISE: status('Reprise', 'info'),
  RECEPTION_PROVISOIRE: status('Réception provisoire', 'warning'),
  RECEPTION_DEFINITIVE: status('Réception définitive', 'success'),
  NON_PAYE: status('Non payé', 'danger'),
  PAYE_PARTIEL: status('Payé en partie', 'warning'),
  PAYE_TOTAL: status('Payé', 'success'),
  EXECUTE: status('Exécuté', 'success'),
}

/**
 * Recupere la configuration d'un statut.
 * Retourne un style neutre par defaut si le statut n'est pas trouve.
 */
export function getStatusConfig(status: string): StatusConfig {
  const normalizedStatus = status?.toUpperCase().replace(/-/g, '_')
  const humanized = status
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ')
    : 'Inconnu'
  return statusColors[normalizedStatus] ?? {
    label: humanized,
    color: 'neutral' as StatusColor,
    bgColor: tones.n.bg,
    textColor: tones.n.fg,
    dotColor: tones.n.fg,
    borderColor: tones.n.bd,
  }
}

/**
 * Couleurs pour les graphiques (charts)
 */
export const chartColors = {
  primary: colors.primary[600],
  secondary: colors.brass.main,
  tertiary: colors.info[400],
  success: colors.success[500],
  warning: colors.warning[400],
  danger: colors.danger[400],
  neutral: colors.neutral[300],
  palette: [
    colors.primary[600],
    colors.brass.main,
    colors.success[500],
    colors.info[400],
    colors.brass.light,
    colors.danger[400],
    colors.primary[300],
    colors.warning[400],
    colors.success[300],
    colors.neutral[400],
  ],
} as const

// ==================== EXPORT PAR DÉFAUT ====================

const designSystem = {
  colors,
  tones,
  gradients,
  typography,
  spacing,
  shadows,
  borders,
  transitions,
  zIndex,
  breakpoints,
  componentStyles,
  statusColors,
  getStatusConfig,
  chartColors,
}

export default designSystem
