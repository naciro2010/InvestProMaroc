/**
 * Design System v2.0 - InvestPro Maroc
 *
 * INSPIRATION: Confluence + Jira + Odoo
 * - Épuré et professionnel (Confluence)
 * - Dense et fonctionnel (Jira)
 * - Moderne et accessible (Odoo)
 *
 * SOURCE UNIQUE DE VÉRITÉ pour toutes les valeurs de design.
 * Ce fichier remplace les couleurs en dur éparpillées dans les composants.
 *
 * PRINCIPES DE DESIGN:
 * - Interface professionnelle, sobre et fonctionnelle
 * - Pas de gradients dans les zones de contenu
 * - Espacement cohérent (base 8px)
 * - Hiérarchie typographique claire
 * - Ombres subtiles, pas de flashy
 * - Accessibilité (contraste WCAG AA)
 */

// ==================== COULEURS ====================

export const colors = {
  /**
   * Couleur primaire - Bleu Atlassian
   * Utilisée pour: boutons principaux, liens, sélection, focus
   */
  primary: {
    25: '#f5f8ff',
    50: '#e9f2ff',
    100: '#cce0ff',
    200: '#85b8ff',
    300: '#579dff',
    400: '#388bff',
    500: '#1d7afc',
    600: '#0c66e4', // Main brand color
    700: '#0055cc',
    800: '#09326c',
    900: '#092957',
  },

  /**
   * Succès - Vert
   * Utilisée pour: validation, statuts actifs, confirmations
   */
  success: {
    25: '#f3fcf5',
    50: '#dcfff1',
    100: '#baf3db',
    200: '#7ee2b8',
    300: '#4bce97',
    400: '#2abb7f',
    500: '#22a06b',
    600: '#1f845a', // Main success
    700: '#216e4e',
    800: '#164b35',
    900: '#133527',
  },

  /**
   * Danger - Rouge
   * Utilisée pour: erreurs, suppression, alertes critiques
   */
  danger: {
    25: '#fff5f5',
    50: '#ffedeb',
    100: '#ffd5d2',
    200: '#fd9891',
    300: '#f87168',
    400: '#f15b50',
    500: '#e2483d',
    600: '#c9372c', // Main danger
    700: '#ae2e24',
    800: '#5d1f1a',
    900: '#42221f',
  },

  /**
   * Warning - Jaune/Orange
   * Utilisée pour: avertissements, statuts en attente
   */
  warning: {
    25: '#fffdf5',
    50: '#fff7d6',
    100: '#f8e6a0',
    200: '#f5cd47',
    300: '#e2b203',
    400: '#cf9f02',
    500: '#b38600',
    600: '#946f00', // Main warning
    700: '#7f5f01',
    800: '#533f04',
    900: '#3d2e00',
  },

  /**
   * Info - Bleu clair / Teal
   * Utilisée pour: informations, statuts en cours
   */
  info: {
    25: '#f3fcff',
    50: '#e7f9ff',
    100: '#c6edfb',
    200: '#9dd9ee',
    300: '#6cc3e0',
    400: '#42b2d7',
    500: '#2898bd',
    600: '#227d9b', // Main info
    700: '#206a83',
    800: '#164555',
    900: '#103c4b',
  },

  /**
   * Purple - Accent secondaire (Odoo inspired)
   * Utilisée pour: highlights, badges spéciaux
   */
  purple: {
    25: '#faf5ff',
    50: '#f3e8ff',
    100: '#dfd8fd',
    200: '#b8acf6',
    300: '#9f8fef',
    400: '#8f7ee7',
    500: '#8270db',
    600: '#6e5dc6', // Main purple
    700: '#5e4db2',
    800: '#352c63',
    900: '#2b273f',
  },

  /**
   * Gris - Palette neutre (Atlassian Neutral)
   * Utilisée pour: textes, bordures, arrière-plans, séparateurs
   */
  neutral: {
    0: '#ffffff',
    25: '#fafbfc',
    50: '#f7f8f9',
    100: '#f1f2f4',
    200: '#dcdfe4',
    300: '#b3b9c4',
    400: '#8590a2',
    500: '#626f86',
    600: '#44546f',
    700: '#2c3e5d',
    800: '#172b4d',
    900: '#091e42',
  },

  // Aliases pour compatibilité
  gray: {
    50: '#fafbfc',
    100: '#f7f8f9',
    200: '#dcdfe4',
    300: '#b3b9c4',
    400: '#8590a2',
    500: '#626f86',
    600: '#44546f',
    700: '#2c3e5d',
    800: '#172b4d',
    900: '#091e42',
  },

  /** Fond de page principal */
  background: '#f7f8f9',

  /** Fond blanc (cartes, papier) */
  surface: '#ffffff',

  /** Fond de sidebar */
  sidebarBg: '#fafbfc',

  /** Bordure standard */
  border: '#dcdfe4',

  /** Bordure subtile */
  borderSubtle: '#ebecf0',

  /** Séparateur (plus subtil que border) */
  divider: '#f1f2f4',

  /** Texte principal */
  textPrimary: '#172b4d',

  /** Texte secondaire */
  textSecondary: '#626f86',

  /** Texte désactivé */
  textDisabled: '#8590a2',

  /** Texte sur fond coloré */
  textOnColor: '#ffffff',

  /** Lien */
  link: '#0c66e4',
  linkHover: '#0055cc',
} as const

// ==================== TYPOGRAPHIE ====================

export const typography = {
  /**
   * Famille de polices système optimisée
   * Priorité: Inter > System > fallbacks
   */
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, 'Helvetica Neue', sans-serif",

  fontFamilyMono:
    "'JetBrains Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace",

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
    paddingX: '1.5rem',   // 24px
    paddingY: '1.5rem',   // 24px
    maxWidth: '1280px',
    gutter: '1.5rem',     // 24px
  },
} as const

// ==================== OMBRES ====================

export const shadows = {
  /** Pas d'ombre */
  none: 'none',
  /** Très subtile - bordure virtuelle */
  xs: '0 1px 2px 0 rgba(9, 30, 66, 0.04)',
  /** Légère - cartes au repos */
  sm: '0 1px 3px rgba(9, 30, 66, 0.08), 0 0 1px rgba(9, 30, 66, 0.08)',
  /** Standard - cartes hover */
  md: '0 4px 8px -2px rgba(9, 30, 66, 0.08), 0 0 1px rgba(9, 30, 66, 0.08)',
  /** Élevée - dropdowns, popovers */
  lg: '0 8px 16px -4px rgba(9, 30, 66, 0.12), 0 0 1px rgba(9, 30, 66, 0.12)',
  /** Très élevée - modals */
  xl: '0 16px 32px -8px rgba(9, 30, 66, 0.16), 0 0 1px rgba(9, 30, 66, 0.12)',
  /** Focus ring */
  focus: '0 0 0 2px #ffffff, 0 0 0 4px #388bff',
  /** Focus ring danger */
  focusDanger: '0 0 0 2px #ffffff, 0 0 0 4px #f15b50',
} as const

// ==================== BORDURES ====================

export const borders = {
  /** Rayon standard */
  radius: {
    none: '0',
    xs: '2px',
    sm: '3px',      // Badges, tags
    base: '4px',    // Boutons, inputs
    md: '6px',      // Cards petites
    lg: '8px',      // Cards standard
    xl: '12px',     // Panels, modals
    '2xl': '16px',  // Large panels
    full: '9999px', // Pills, avatars
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
  fast: '100ms ease-out',
  /** Standard */
  normal: '150ms ease-out',
  /** Animations */
  slow: '250ms ease-out',
  /** Transitions longues */
  slower: '350ms ease-out',
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
  md: 768,
  lg: 1024,
  xl: 1280,
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
    border: `1px solid ${colors.border}`,
    borderRadius: borders.radius.xl,
    boxShadow: shadows.none,
  },

  /**
   * Carte avec ombre subtile (hover ready)
   */
  cardElevated: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: borders.radius.xl,
    boxShadow: shadows.sm,
    transition: `all ${transitions.slow}`,
    '&:hover': {
      boxShadow: shadows.md,
      borderColor: colors.border,
    },
  },

  /**
   * Carte interactive (cliquable)
   */
  cardInteractive: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: borders.radius.xl,
    boxShadow: shadows.sm,
    transition: `all ${transitions.slow}`,
    cursor: 'pointer',
    '&:hover': {
      boxShadow: shadows.md,
      borderColor: colors.primary[200],
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: shadows.sm,
    },
  },

  /**
   * Header de page (Confluence style)
   */
  pageHeader: {
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
    px: spacing.mui['2xl'],
    py: spacing.mui.lg,
  },

  /**
   * Action bar sticky (en haut du formulaire)
   */
  stickyActionBar: {
    position: 'sticky' as const,
    top: 0,
    zIndex: zIndex.sticky,
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
    px: spacing.mui['2xl'],
    py: spacing.mui.md,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(8px)',
    boxShadow: shadows.xs,
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
    backgroundColor: colors.primary[600],
    color: colors.textOnColor,
    fontWeight: typography.weights.medium,
    fontSize: typography.sizes.base,
    textTransform: 'none' as const,
    boxShadow: shadows.none,
    borderRadius: borders.radius.base,
    px: spacing.mui.lg,
    py: spacing.mui.sm,
    '&:hover': {
      backgroundColor: colors.primary[700],
      boxShadow: shadows.none,
    },
    '&:focus-visible': {
      boxShadow: shadows.focus,
    },
    '&:disabled': {
      backgroundColor: colors.neutral[200],
      color: colors.textDisabled,
    },
  },

  /**
   * Bouton secondaire (outlined)
   */
  buttonSecondary: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.neutral[300]}`,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    fontSize: typography.sizes.base,
    textTransform: 'none' as const,
    borderRadius: borders.radius.base,
    px: spacing.mui.lg,
    py: spacing.mui.sm,
    '&:hover': {
      backgroundColor: colors.neutral[100],
      borderColor: colors.neutral[400],
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
    fontSize: typography.sizes.base,
    textTransform: 'none' as const,
    borderRadius: borders.radius.base,
    px: spacing.mui.md,
    py: spacing.mui.sm,
    '&:hover': {
      backgroundColor: colors.neutral[100],
      color: colors.textPrimary,
    },
  },

  /**
   * Bouton danger
   */
  buttonDanger: {
    backgroundColor: colors.danger[600],
    color: colors.textOnColor,
    fontWeight: typography.weights.medium,
    fontSize: typography.sizes.base,
    textTransform: 'none' as const,
    boxShadow: shadows.none,
    borderRadius: borders.radius.base,
    px: spacing.mui.lg,
    py: spacing.mui.sm,
    '&:hover': {
      backgroundColor: colors.danger[700],
    },
    '&:focus-visible': {
      boxShadow: shadows.focusDanger,
    },
  },

  /**
   * Bouton success
   */
  buttonSuccess: {
    backgroundColor: colors.success[600],
    color: colors.textOnColor,
    fontWeight: typography.weights.medium,
    fontSize: typography.sizes.base,
    textTransform: 'none' as const,
    boxShadow: shadows.none,
    borderRadius: borders.radius.base,
    px: spacing.mui.lg,
    py: spacing.mui.sm,
    '&:hover': {
      backgroundColor: colors.success[700],
    },
  },

  /**
   * Label de formulaire
   */
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
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
        borderColor: colors.neutral[300],
      },
      '&:hover fieldset': {
        borderColor: colors.neutral[400],
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary[500],
        borderWidth: '2px',
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
      textTransform: 'uppercase' as const,
      letterSpacing: typography.letterSpacing.wider,
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
      border: `1px solid ${colors.border}`,
      borderRadius: borders.radius.lg,
      overflow: 'hidden',
    },
    header: {
      backgroundColor: colors.neutral[50],
      borderBottom: `1px solid ${colors.border}`,
    },
    headerCell: {
      fontWeight: typography.weights.semibold,
      fontSize: typography.sizes.xs,
      textTransform: 'uppercase' as const,
      letterSpacing: typography.letterSpacing.wide,
      color: colors.textSecondary,
      py: spacing.mui.md,
      px: spacing.mui.lg,
    },
    row: {
      borderBottom: `1px solid ${colors.divider}`,
      transition: `background-color ${transitions.fast}`,
      '&:hover': {
        backgroundColor: colors.neutral[25],
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
   * Stat card (Dashboard KPIs) - Modern elevated design
   */
  statCard: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: borders.radius.xl,
    p: spacing.mui['2xl'],
    transition: `all ${transitions.slow}`,
    position: 'relative' as const,
    overflow: 'hidden',
    '&:hover': {
      borderColor: colors.primary[200],
      boxShadow: shadows.md,
      transform: 'translateY(-2px)',
    },
  },

  /**
   * Stat card accent strip (left colored border)
   */
  statCardAccent: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    borderRadius: '4px 0 0 4px',
  },

  /**
   * Stat card icon container - modern circular design
   */
  statCardIcon: {
    width: 48,
    height: 48,
    borderRadius: borders.radius.xl,
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
    border: `1px solid ${colors.border}`,
    borderRadius: borders.radius.xl,
    overflow: 'hidden',
  },

  /**
   * Section card header
   */
  sectionCardHeader: {
    px: spacing.mui['2xl'],
    py: spacing.mui.lg,
    borderBottom: `1px solid ${colors.divider}`,
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
      color: colors.link,
      textDecoration: 'none',
      '&:hover': {
        color: colors.linkHover,
        textDecoration: 'underline',
      },
    },
    '& .separator': {
      color: colors.neutral[400],
    },
  },

  /**
   * List Page - Style moderne inspiré Odoo/Confluence
   * Utiliser pour toutes les pages de listing
   */
  listPage: {
    /** Container principal */
    container: {
      minHeight: '100vh',
      bgcolor: colors.background,
    },
    /** Header de page avec titre et actions */
    header: {
      bgcolor: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      px: { xs: 2, md: 3 },
      py: 2.5,
    },
    /** Titre principal */
    title: {
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
      fontSize: typography.sizes['2xl'],
      letterSpacing: '-0.01em',
      mb: 0.5,
    },
    /** Sous-titre / stats */
    subtitle: {
      color: colors.textSecondary,
      fontSize: typography.sizes.sm,
    },
    /** Toolbar de recherche/filtres */
    toolbar: {
      px: { xs: 2, md: 3 },
      py: 1.5,
      bgcolor: colors.surface,
      borderBottom: `1px solid ${colors.divider}`,
      display: 'flex',
      gap: 1.5,
      alignItems: 'center',
      flexWrap: 'wrap' as const,
    },
    /** Champ de recherche */
    searchField: {
      width: { xs: '100%', sm: 320 },
      '& .MuiOutlinedInput-root': {
        bgcolor: colors.neutral[50],
        borderRadius: borders.radius.lg,
        fontSize: typography.sizes.base,
        transition: `all ${transitions.normal}`,
        '& fieldset': {
          borderColor: 'transparent',
        },
        '&:hover': {
          bgcolor: colors.surface,
          '& fieldset': {
            borderColor: colors.neutral[300],
          },
        },
        '&.Mui-focused': {
          bgcolor: colors.surface,
          '& fieldset': {
            borderColor: colors.primary[400],
            borderWidth: '2px',
          },
        },
      },
    },
    /** Container de la table */
    tableContainer: {
      borderRadius: borders.radius.xl,
      border: `1px solid ${colors.border}`,
      overflow: 'hidden',
      bgcolor: colors.surface,
    },
    /** Header de table */
    tableHeader: {
      bgcolor: colors.neutral[50],
      '& th': {
        fontWeight: typography.weights.semibold,
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        py: 1.5,
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
      bgcolor: colors.neutral[25],
      '&:hover': {
        bgcolor: colors.primary[25],
      },
      '& td': {
        borderBottom: `1px solid ${colors.divider}`,
      },
    },
    /** Pill de filtre actif */
    filterPillActive: {
      bgcolor: colors.primary[600],
      color: colors.textOnColor,
      fontWeight: typography.weights.semibold,
      border: `1px solid ${colors.primary[600]}`,
      borderRadius: borders.radius.full,
      '&:hover': { bgcolor: colors.primary[700] },
    },
    /** Pill de filtre inactif */
    filterPill: {
      bgcolor: colors.surface,
      color: colors.textSecondary,
      fontWeight: typography.weights.medium,
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: borders.radius.full,
      '&:hover': {
        bgcolor: colors.neutral[50],
        borderColor: colors.neutral[300],
      },
    },
    /** Badge de compteur */
    countBadge: {
      bgcolor: 'rgba(255,255,255,0.2)',
      color: 'inherit',
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
    /** Count badge for inactive pills */
    countBadgeInactive: {
      bgcolor: colors.neutral[100],
      color: colors.neutral[600],
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
    },
    title: {
      fontWeight: typography.weights.semibold,
      fontSize: typography.sizes.lg,
      color: colors.textPrimary,
      pb: 1,
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
    borderRadius: borders.radius.base,
    mx: 0.5,
    '&:hover': {
      bgcolor: colors.neutral[50],
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
}

export const statusColors: Record<string, StatusConfig> = {
  // Workflow Convention/Projet
  BROUILLON: {
    label: 'Brouillon',
    color: 'neutral',
    bgColor: colors.neutral[100],
    textColor: colors.neutral[700],
    dotColor: colors.neutral[400],
  },
  SOUMIS: {
    label: 'Soumis',
    color: 'warning',
    bgColor: colors.warning[50],
    textColor: colors.warning[700],
    dotColor: colors.warning[500],
  },
  VALIDE: {
    label: 'Validé',
    color: 'success',
    bgColor: colors.success[50],
    textColor: colors.success[700],
    dotColor: colors.success[500],
  },
  VALIDEE: {
    label: 'Validée',
    color: 'success',
    bgColor: colors.success[50],
    textColor: colors.success[700],
    dotColor: colors.success[500],
  },
  EN_EXECUTION: {
    label: 'En exécution',
    color: 'info',
    bgColor: colors.info[50],
    textColor: colors.info[700],
    dotColor: colors.info[500],
  },
  EN_COURS: {
    label: 'En cours',
    color: 'info',
    bgColor: colors.info[50],
    textColor: colors.info[700],
    dotColor: colors.info[500],
  },
  ACHEVE: {
    label: 'Achevé',
    color: 'success',
    bgColor: colors.success[100],
    textColor: colors.success[700],
    dotColor: colors.success[600],
  },
  TERMINE: {
    label: 'Terminé',
    color: 'success',
    bgColor: colors.success[100],
    textColor: colors.success[700],
    dotColor: colors.success[600],
  },
  REJETE: {
    label: 'Rejeté',
    color: 'danger',
    bgColor: colors.danger[50],
    textColor: colors.danger[700],
    dotColor: colors.danger[500],
  },
  ANNULE: {
    label: 'Annulé',
    color: 'danger',
    bgColor: colors.danger[100],
    textColor: colors.danger[600],
    dotColor: colors.danger[500],
  },
  EN_RETARD: {
    label: 'En retard',
    color: 'danger',
    bgColor: colors.danger[50],
    textColor: colors.danger[700],
    dotColor: colors.danger[500],
  },
  SUSPENDU: {
    label: 'Suspendu',
    color: 'warning',
    bgColor: colors.warning[50],
    textColor: colors.warning[700],
    dotColor: colors.warning[500],
  },

  // Types supplémentaires
  ACTIF: {
    label: 'Actif',
    color: 'success',
    bgColor: colors.success[50],
    textColor: colors.success[700],
    dotColor: colors.success[500],
  },
  INACTIF: {
    label: 'Inactif',
    color: 'neutral',
    bgColor: colors.neutral[100],
    textColor: colors.neutral[600],
    dotColor: colors.neutral[400],
  },
  NOUVEAU: {
    label: 'Nouveau',
    color: 'purple',
    bgColor: colors.purple[50],
    textColor: colors.purple[700],
    dotColor: colors.purple[500],
  },
  URGENT: {
    label: 'Urgent',
    color: 'danger',
    bgColor: colors.danger[50],
    textColor: colors.danger[700],
    dotColor: colors.danger[500],
  },

  // Convention types
  CADRE: {
    label: 'Cadre',
    color: 'primary',
    bgColor: colors.primary[50],
    textColor: colors.primary[700],
    dotColor: colors.primary[500],
  },
  SPECIFIQUE: {
    label: 'Spécifique',
    color: 'purple',
    bgColor: colors.purple[50],
    textColor: colors.purple[700],
    dotColor: colors.purple[500],
  },
} as const

/**
 * Récupère la configuration d'un statut.
 * Retourne un style neutre par défaut si le statut n'est pas trouvé.
 */
export function getStatusConfig(status: string): StatusConfig {
  const normalizedStatus = status?.toUpperCase().replace(/-/g, '_')
  return statusColors[normalizedStatus] ?? {
    label: status || 'Inconnu',
    color: 'neutral' as StatusColor,
    bgColor: colors.neutral[100],
    textColor: colors.neutral[700],
    dotColor: colors.neutral[400],
  }
}

/**
 * Couleurs pour les graphiques (charts)
 */
export const chartColors = {
  primary: colors.primary[500],
  secondary: colors.purple[500],
  tertiary: colors.info[500],
  success: colors.success[500],
  warning: colors.warning[500],
  danger: colors.danger[500],
  neutral: colors.neutral[400],
  // Palette étendue pour charts multiples
  palette: [
    colors.primary[500],
    colors.purple[500],
    colors.info[500],
    colors.success[500],
    colors.warning[500],
    colors.danger[500],
    colors.primary[300],
    colors.purple[300],
    colors.info[300],
    colors.success[300],
  ],
} as const

// ==================== EXPORT PAR DÉFAUT ====================

const designSystem = {
  colors,
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
