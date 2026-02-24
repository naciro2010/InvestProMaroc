/**
 * Design System v3.0 - InvestPro Maroc
 *
 * STYLE: Epure, sobre, professionnel
 * Professional design system: functional density + clean whitespace + subtle accents
 *
 * PRINCIPES:
 * - Couleurs desaturees et douces (pas de couleurs "flashy")
 * - Beaucoup de blanc et gris clair
 * - Micro-interactions subtiles (pas de translateY, pas de glow)
 * - Espacement genereux, hierarchie visuelle claire
 * - Flat design, ombres quasi-inexistantes
 */

// ==================== COULEURS ====================

export const colors = {
  /**
   * Primaire - Bleu-gris professionnel (desature)
   */
  primary: {
    25: '#f8f9fb',
    50: '#eef2f6',
    100: '#d8e0ea',
    200: '#adbdd3',
    300: '#8199b5',
    400: '#5f7d9e',
    500: '#486a8e',
    600: '#3b5998', // Main - bleu sobre
    700: '#334d80',
    800: '#263a5e',
    900: '#1c2d49',
  },

  /**
   * Succes - Vert sauge (desature, doux)
   */
  success: {
    25: '#f6f9f7',
    50: '#edf5ef',
    100: '#d4e8d9',
    200: '#a8d4b2',
    300: '#7cbe8c',
    400: '#5aab6d',
    500: '#4a9660',
    600: '#3d7f52', // Main
    700: '#336a45',
    800: '#234a31',
    900: '#1a3724',
  },

  /**
   * Danger - Rouge terre (desature, calme)
   */
  danger: {
    25: '#fdf7f7',
    50: '#faeeed',
    100: '#f2d5d2',
    200: '#e0a8a3',
    300: '#cc7e77',
    400: '#bb5f57',
    500: '#a84d45',
    600: '#93403a', // Main
    700: '#7b3531',
    800: '#542422',
    900: '#3d1b19',
  },

  /**
   * Warning - Ambre doux (desature)
   */
  warning: {
    25: '#fdfaf5',
    50: '#faf3e3',
    100: '#f0e0b8',
    200: '#e2c880',
    300: '#d4af4d',
    400: '#c49d30',
    500: '#ad8a20',
    600: '#8f7218', // Main
    700: '#755e15',
    800: '#4d3e0e',
    900: '#382d0a',
  },

  /**
   * Info - Bleu ardoise (calme, subtil)
   */
  info: {
    25: '#f6f9fa',
    50: '#eaf1f4',
    100: '#cedfea',
    200: '#a3c5d6',
    300: '#78abc2',
    400: '#5695b0',
    500: '#42809d',
    600: '#366b84', // Main
    700: '#2d596e',
    800: '#1f3d4c',
    900: '#162d38',
  },

  /**
   * Purple - Accent subtil (lavande desature)
   */
  purple: {
    25: '#f9f8fb',
    50: '#f0eef6',
    100: '#ddd8ec',
    200: '#b9b0d4',
    300: '#9a8dbe',
    400: '#8074ab',
    500: '#6d6199',
    600: '#5b5187', // Main
    700: '#4c4372',
    800: '#342f50',
    900: '#27233c',
  },

  /**
   * Gris - Palette neutre (tons chauds, pas froids)
   */
  neutral: {
    0: '#ffffff',
    25: '#fafafa',
    50: '#f5f5f6',
    100: '#eeeff0',
    200: '#dddee0',
    300: '#b8babe',
    400: '#8e9196',
    500: '#6b6f75',
    600: '#4f5359',
    700: '#383c42',
    800: '#24272d',
    900: '#16181c',
  },

  // Aliases
  gray: {
    50: '#f5f5f6',
    100: '#eeeff0',
    200: '#dddee0',
    300: '#b8babe',
    400: '#8e9196',
    500: '#6b6f75',
    600: '#4f5359',
    700: '#383c42',
    800: '#24272d',
    900: '#16181c',
  },

  /** Fond de page - gris tres clair, presque blanc */
  background: '#f5f5f6',

  /** Fond blanc */
  surface: '#ffffff',

  /** Sidebar */
  sidebarBg: '#fafafa',

  /** Bordure standard - tres douce */
  border: '#e2e3e5',

  /** Bordure subtile */
  borderSubtle: '#eeeff0',

  /** Separateur */
  divider: '#f0f0f1',

  /** Texte principal - gris fonce, pas noir */
  textPrimary: '#24272d',

  /** Texte secondaire */
  textSecondary: '#6b6f75',

  /** Texte desactive */
  textDisabled: '#8e9196',

  /** Texte sur fond colore */
  textOnColor: '#ffffff',

  /** Lien - bleu calme */
  link: '#3b5998',
  linkHover: '#334d80',
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
    borderRadius: borders.radius.lg,
    boxShadow: shadows.none,
  },

  /**
   * Carte avec ombre subtile
   */
  cardElevated: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: borders.radius.lg,
    boxShadow: shadows.xs,
    transition: `border-color ${transitions.normal}`,
    '&:hover': {
      borderColor: colors.neutral[300],
    },
  },

  /**
   * Carte interactive (cliquable) - hover discret
   */
  cardInteractive: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: borders.radius.lg,
    boxShadow: 'none',
    transition: `all ${transitions.normal}`,
    cursor: 'pointer',
    '&:hover': {
      borderColor: colors.primary[300],
      backgroundColor: colors.primary[25],
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
   * Stat card (Dashboard KPIs) - clean, no gimmicks
   */
  statCard: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: borders.radius.lg,
    p: spacing.mui['2xl'],
    transition: `border-color ${transitions.normal}`,
    '&:hover': {
      borderColor: colors.neutral[300],
    },
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
    border: `1px solid ${colors.border}`,
    borderRadius: borders.radius.lg,
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
   * List Page - Modern listing style
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
      borderRadius: borders.radius.lg,
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
    /** Pill de filtre actif - subtil, pas flashy */
    filterPillActive: {
      bgcolor: colors.primary[50],
      color: colors.primary[700],
      fontWeight: typography.weights.semibold,
      border: `1px solid ${colors.primary[200]}`,
      borderRadius: borders.radius.full,
      '&:hover': { bgcolor: colors.primary[100] },
    },
    /** Pill de filtre inactif */
    filterPill: {
      bgcolor: 'transparent',
      color: colors.textSecondary,
      fontWeight: typography.weights.medium,
      border: `1px solid ${colors.neutral[200]}`,
      borderRadius: borders.radius.full,
      '&:hover': {
        bgcolor: colors.neutral[50],
        borderColor: colors.neutral[300],
      },
    },
    /** Badge de compteur (pill active) */
    countBadge: {
      bgcolor: colors.primary[200],
      color: colors.primary[800],
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
      bgcolor: colors.neutral[100],
      color: colors.neutral[500],
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
      borderRadius: borders.radius.lg,
      boxShadow: shadows.lg,
    },
    title: {
      fontWeight: typography.weights.semibold,
      fontSize: typography.sizes.lg,
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
    borderRadius: borders.radius.base,
    mx: 0.5,
    '&:hover': {
      bgcolor: colors.neutral[50],
    },
  },

  // ==================== MODERN PANEL STYLES ====================

  /**
   * Control panel (top bar with breadcrumb, search, actions)
   */
  controlPanel: {
    container: {
      bgcolor: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      px: { xs: 2, md: 3 },
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
      borderTop: `1px solid ${colors.divider}`,
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
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.medium,
      color: colors.textPrimary,
      textDecoration: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap' as const,
      '&:hover': {
        color: colors.primary[600],
      },
    },
    breadcrumbCurrent: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
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
      display: 'flex',
      border: `1px solid ${colors.neutral[300]}`,
      borderRadius: borders.radius.base,
      overflow: 'hidden',
    },
    viewSwitcherButton: {
      p: 0.75,
      borderRadius: 0,
      minWidth: 36,
      color: colors.textSecondary,
      '&:hover': {
        bgcolor: colors.neutral[50],
      },
    },
    viewSwitcherButtonActive: {
      p: 0.75,
      borderRadius: 0,
      minWidth: 36,
      bgcolor: colors.primary[50],
      color: colors.primary[700],
      '&:hover': {
        bgcolor: colors.primary[100],
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
    /** Filter tag */
    filterTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      px: 1.25,
      py: 0.5,
      bgcolor: colors.primary[50],
      color: colors.primary[700],
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      borderRadius: borders.radius.base,
      border: `1px solid ${colors.primary[200]}`,
      cursor: 'pointer',
      '&:hover': {
        bgcolor: colors.primary[100],
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
      border: `1px solid ${colors.border}`,
      borderRadius: borders.radius.lg,
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
      gap: { xs: 1, sm: 0 },
      bgcolor: colors.neutral[25],
      borderBottom: `1px solid ${colors.border}`,
    },
    /** Status bar buttons */
    statusBarButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    },
    /** Status pipeline (connected dots) */
    statusPipeline: {
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      overflowX: 'auto' as const,
      maxWidth: '100%',
      '&::-webkit-scrollbar': { display: 'none' },
    },
    /** Future/inactive step - very muted */
    statusPipelineStep: {
      px: 1.5,
      py: 0.5,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.normal,
      color: colors.neutral[400],
      bgcolor: colors.neutral[50],
      borderRight: `1px solid ${colors.neutral[200]}`,
      cursor: 'default',
      whiteSpace: 'nowrap' as const,
      '&:first-of-type': {
        borderRadius: `${borders.radius.full} 0 0 ${borders.radius.full}`,
      },
      '&:last-of-type': {
        borderRadius: `0 ${borders.radius.full} ${borders.radius.full} 0`,
        borderRight: 'none',
      },
    },
    /** Active/current step - Odoo-style filled primary */
    statusPipelineStepActive: {
      px: 1.5,
      py: 0.5,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: '#fff',
      bgcolor: colors.primary[600],
      borderRight: `1px solid ${colors.primary[700]}`,
      cursor: 'default',
      whiteSpace: 'nowrap' as const,
      '&:first-of-type': {
        borderRadius: `${borders.radius.full} 0 0 ${borders.radius.full}`,
      },
      '&:last-of-type': {
        borderRadius: `0 ${borders.radius.full} ${borders.radius.full} 0`,
        borderRight: 'none',
      },
    },
    /** Done/completed step - green with checkmark space */
    statusPipelineStepDone: {
      px: 1.5,
      py: 0.5,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.success[700],
      bgcolor: colors.success[50],
      borderRight: `1px solid ${colors.success[100]}`,
      cursor: 'default',
      whiteSpace: 'nowrap' as const,
      '&:first-of-type': {
        borderRadius: `${borders.radius.full} 0 0 ${borders.radius.full}`,
      },
      '&:last-of-type': {
        borderRadius: `0 ${borders.radius.full} ${borders.radius.full} 0`,
        borderRight: 'none',
      },
    },
    /** Danger variant for rejected/cancelled statuses */
    statusPipelineStepDanger: {
      px: 1.5,
      py: 0.5,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      color: '#fff',
      bgcolor: colors.danger[600],
      borderRight: `1px solid ${colors.danger[700]}`,
      cursor: 'default',
      whiteSpace: 'nowrap' as const,
      '&:first-of-type': {
        borderRadius: `${borders.radius.full} 0 0 ${borders.radius.full}`,
      },
      '&:last-of-type': {
        borderRadius: `0 ${borders.radius.full} ${borders.radius.full} 0`,
        borderRight: 'none',
      },
    },
    /** Sheet (main content area of form) */
    sheet: {
      p: { xs: 2, sm: 3 },
    },
    /** Title field (editable h1) */
    titleField: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
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
      bgcolor: colors.neutral[50],
      px: 2,
      py: 1.25,
      borderBottom: `1px solid ${colors.border}`,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.textPrimary,
      textTransform: 'uppercase' as const,
      letterSpacing: typography.letterSpacing.wide,
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
      minHeight: 40,
      '& .MuiTab-root': {
        textTransform: 'none' as const,
        fontWeight: typography.weights.medium,
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        minHeight: 40,
        py: 1,
        '&.Mui-selected': {
          color: colors.primary[700],
          fontWeight: typography.weights.semibold,
        },
      },
      '& .MuiTabs-indicator': {
        backgroundColor: colors.primary[600],
        height: 2,
      },
    },
    /** Chatter (right side panel / activity log) */
    chatter: {
      borderLeft: { xs: 'none', md: `1px solid ${colors.border}` },
      borderTop: { xs: `1px solid ${colors.border}`, md: 'none' },
      bgcolor: colors.neutral[25],
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
      border: `1px solid ${colors.border}`,
      borderRadius: borders.radius.lg,
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
      bgcolor: colors.neutral[50],
      '& .MuiTableCell-head': {
        fontWeight: typography.weights.semibold,
        fontSize: typography.sizes.xs,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.04em',
        color: colors.textSecondary,
        py: 1,
        px: 1.5,
        borderBottom: `2px solid ${colors.border}`,
        whiteSpace: 'nowrap' as const,
        userSelect: 'none' as const,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: colors.neutral[100],
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
      bgcolor: colors.neutral[50],
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
      bgcolor: colors.neutral[50],
      borderTop: `2px solid ${colors.border}`,
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
      bgcolor: colors.background,
      minHeight: '100vh',
    },
    /** Header bar (breadcrumbs + cancel) */
    header: {
      bgcolor: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      px: { xs: 2, md: 3 },
      py: 1.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
    },
    /** Step indicator bar */
    stepBar: {
      bgcolor: colors.neutral[25],
      borderBottom: `1px solid ${colors.border}`,
      px: { xs: 2, md: 3 },
      py: 1.25,
      display: 'flex',
      alignItems: 'center',
      justifyContent: { xs: 'flex-start', sm: 'center' },
      gap: 0,
      overflowX: 'auto' as const,
      '&::-webkit-scrollbar': { display: 'none' },
    },
    /** Step pill (default / future) */
    step: {
      px: 2,
      py: 0.5,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.textSecondary,
      bgcolor: colors.neutral[100],
      borderRight: `1px solid ${colors.border}`,
      cursor: 'default',
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      whiteSpace: 'nowrap' as const,
      transition: `all ${transitions.fast}`,
      '&:first-of-type': {
        borderRadius: `${borders.radius.full} 0 0 ${borders.radius.full}`,
      },
      '&:last-of-type': {
        borderRadius: `0 ${borders.radius.full} ${borders.radius.full} 0`,
        borderRight: 'none',
      },
    },
    /** Active step pill */
    stepActive: {
      px: 2,
      py: 0.5,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.primary[700],
      bgcolor: colors.primary[100],
      borderRight: `1px solid ${colors.primary[200]}`,
      cursor: 'default',
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      whiteSpace: 'nowrap' as const,
      '&:first-of-type': {
        borderRadius: `${borders.radius.full} 0 0 ${borders.radius.full}`,
      },
      '&:last-of-type': {
        borderRadius: `0 ${borders.radius.full} ${borders.radius.full} 0`,
        borderRight: 'none',
      },
    },
    /** Done step pill */
    stepDone: {
      px: 2,
      py: 0.5,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: colors.success[700],
      bgcolor: colors.success[50],
      borderRight: `1px solid ${colors.success[100]}`,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      whiteSpace: 'nowrap' as const,
      transition: `all ${transitions.fast}`,
      '&:hover': {
        bgcolor: colors.success[100],
      },
      '&:first-of-type': {
        borderRadius: `${borders.radius.full} 0 0 ${borders.radius.full}`,
      },
      '&:last-of-type': {
        borderRadius: `0 ${borders.radius.full} ${borders.radius.full} 0`,
        borderRight: 'none',
      },
    },
    /** Step number badge */
    stepNumber: {
      width: 20,
      height: 20,
      borderRadius: borders.radius.full,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: typography.sizes['2xs'],
      fontWeight: typography.weights.bold,
      flexShrink: 0,
    },
    stepNumberDefault: {
      bgcolor: colors.neutral[300],
      color: colors.surface,
    },
    stepNumberActive: {
      bgcolor: colors.primary[600],
      color: colors.surface,
    },
    stepNumberDone: {
      bgcolor: colors.success[600],
      color: colors.surface,
    },
    /** Content sheet */
    sheet: {
      maxWidth: 960,
      mx: 'auto',
      my: 3,
      px: { xs: 2, md: 0 },
    },
    /** Inner card */
    card: {
      bgcolor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: borders.radius.lg,
      p: { xs: 2, md: 3 },
    },
    /** Navigation bar (bottom) */
    navBar: {
      maxWidth: 960,
      mx: 'auto',
      px: { xs: 2, md: 0 },
      pb: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
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
      border: `1px solid ${colors.border}`,
      borderRadius: borders.radius.lg,
      bgcolor: colors.surface,
      overflow: 'hidden',
      mb: 2,
      transition: `border-color ${transitions.normal}`,
      '&:hover': {
        borderColor: colors.neutral[300],
      },
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
      bgcolor: colors.neutral[25],
      borderBottom: `1px solid ${colors.divider}`,
      transition: `background-color ${transitions.fast}`,
      '&:hover': {
        bgcolor: colors.neutral[50],
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
      bgcolor: colors.neutral[25],
      transition: `background-color ${transitions.fast}`,
      '&:hover': {
        bgcolor: colors.neutral[50],
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
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: colors.textPrimary,
      flex: 1,
      textTransform: 'uppercase' as const,
      letterSpacing: typography.letterSpacing.wide,
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
}

export const statusColors: Record<string, StatusConfig> = {
  BROUILLON: {
    label: 'Brouillon',
    color: 'neutral',
    bgColor: colors.neutral[100],
    textColor: colors.neutral[600],
    dotColor: colors.neutral[400],
  },
  SOUMIS: {
    label: 'Soumis',
    color: 'warning',
    bgColor: colors.warning[50],
    textColor: colors.warning[700],
    dotColor: colors.warning[400],
  },
  VALIDE: {
    label: 'Valide',
    color: 'success',
    bgColor: colors.success[50],
    textColor: colors.success[700],
    dotColor: colors.success[400],
  },
  VALIDEE: {
    label: 'Validee',
    color: 'success',
    bgColor: colors.success[50],
    textColor: colors.success[700],
    dotColor: colors.success[400],
  },
  EN_EXECUTION: {
    label: 'En execution',
    color: 'info',
    bgColor: colors.info[50],
    textColor: colors.info[700],
    dotColor: colors.info[400],
  },
  EN_COURS: {
    label: 'En cours',
    color: 'info',
    bgColor: colors.info[50],
    textColor: colors.info[700],
    dotColor: colors.info[400],
  },
  ACHEVE: {
    label: 'Acheve',
    color: 'success',
    bgColor: colors.success[100],
    textColor: colors.success[700],
    dotColor: colors.success[500],
  },
  TERMINE: {
    label: 'Termine',
    color: 'success',
    bgColor: colors.success[100],
    textColor: colors.success[700],
    dotColor: colors.success[500],
  },
  REJETE: {
    label: 'Rejete',
    color: 'danger',
    bgColor: colors.danger[50],
    textColor: colors.danger[700],
    dotColor: colors.danger[400],
  },
  ANNULE: {
    label: 'Annule',
    color: 'danger',
    bgColor: colors.danger[50],
    textColor: colors.danger[600],
    dotColor: colors.danger[400],
  },
  EN_RETARD: {
    label: 'En retard',
    color: 'danger',
    bgColor: colors.danger[50],
    textColor: colors.danger[700],
    dotColor: colors.danger[400],
  },
  SUSPENDU: {
    label: 'Suspendu',
    color: 'warning',
    bgColor: colors.warning[50],
    textColor: colors.warning[700],
    dotColor: colors.warning[400],
  },
  ACTIF: {
    label: 'Actif',
    color: 'success',
    bgColor: colors.success[50],
    textColor: colors.success[700],
    dotColor: colors.success[400],
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
    dotColor: colors.purple[400],
  },
  URGENT: {
    label: 'Urgent',
    color: 'danger',
    bgColor: colors.danger[50],
    textColor: colors.danger[700],
    dotColor: colors.danger[400],
  },
  CADRE: {
    label: 'Cadre',
    color: 'primary',
    bgColor: colors.primary[50],
    textColor: colors.primary[700],
    dotColor: colors.primary[400],
  },
  SPECIFIQUE: {
    label: 'Specifique',
    color: 'purple',
    bgColor: colors.purple[50],
    textColor: colors.purple[700],
    dotColor: colors.purple[400],
  },
  EN_PREPARATION: {
    label: 'En preparation',
    color: 'neutral',
    bgColor: colors.neutral[100],
    textColor: colors.neutral[600],
    dotColor: colors.neutral[400],
  },
  // Type marché (procurement mode)
  MARCHE: {
    label: 'Marché',
    color: 'primary',
    bgColor: colors.primary[50],
    textColor: colors.primary[700],
    dotColor: colors.primary[400],
  },
  CONTRAT: {
    label: 'Contrat',
    color: 'info',
    bgColor: colors.info[50],
    textColor: colors.info[700],
    dotColor: colors.info[400],
  },
  BON_DE_COMMANDE: {
    label: 'Bon de commande',
    color: 'purple',
    bgColor: colors.purple[50],
    textColor: colors.purple[700],
    dotColor: colors.purple[400],
  },
  LETTRE_DE_COMMANDE: {
    label: 'Lettre de commande',
    color: 'warning',
    bgColor: colors.warning[50],
    textColor: colors.warning[700],
    dotColor: colors.warning[400],
  },
  // Nature prestation
  TRAVAUX: {
    label: 'Travaux',
    color: 'primary',
    bgColor: colors.primary[50],
    textColor: colors.primary[700],
    dotColor: colors.primary[400],
  },
  FOURNITURES: {
    label: 'Fournitures',
    color: 'info',
    bgColor: colors.info[50],
    textColor: colors.info[700],
    dotColor: colors.info[400],
  },
  SERVICES: {
    label: 'Services',
    color: 'purple',
    bgColor: colors.purple[50],
    textColor: colors.purple[700],
    dotColor: colors.purple[400],
  },
  ETUDES: {
    label: 'Études',
    color: 'warning',
    bgColor: colors.warning[50],
    textColor: colors.warning[700],
    dotColor: colors.warning[400],
  },
  // Ordres de service types
  COMMENCEMENT: {
    label: 'Commencement',
    color: 'success',
    bgColor: colors.success[50],
    textColor: colors.success[700],
    dotColor: colors.success[400],
  },
  ARRET: {
    label: 'Arrêt',
    color: 'danger',
    bgColor: colors.danger[50],
    textColor: colors.danger[700],
    dotColor: colors.danger[400],
  },
  REPRISE: {
    label: 'Reprise',
    color: 'info',
    bgColor: colors.info[50],
    textColor: colors.info[700],
    dotColor: colors.info[400],
  },
  RECEPTION_PROVISOIRE: {
    label: 'Réception provisoire',
    color: 'warning',
    bgColor: colors.warning[50],
    textColor: colors.warning[700],
    dotColor: colors.warning[400],
  },
  RECEPTION_DEFINITIVE: {
    label: 'Réception définitive',
    color: 'success',
    bgColor: colors.success[100],
    textColor: colors.success[700],
    dotColor: colors.success[500],
  },
  // Payment statuses
  NON_PAYE: {
    label: 'Non paye',
    color: 'danger',
    bgColor: colors.danger[50],
    textColor: colors.danger[700],
    dotColor: colors.danger[400],
  },
  PAYE_PARTIEL: {
    label: 'Paye partiellement',
    color: 'warning',
    bgColor: colors.warning[50],
    textColor: colors.warning[700],
    dotColor: colors.warning[400],
  },
  PAYE_TOTAL: {
    label: 'Paye totalement',
    color: 'success',
    bgColor: colors.success[50],
    textColor: colors.success[700],
    dotColor: colors.success[400],
  },
  EXECUTE: {
    label: 'Execute',
    color: 'success',
    bgColor: colors.success[50],
    textColor: colors.success[700],
    dotColor: colors.success[400],
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
  primary: colors.primary[400],
  secondary: colors.purple[400],
  tertiary: colors.info[400],
  success: colors.success[400],
  warning: colors.warning[400],
  danger: colors.danger[400],
  neutral: colors.neutral[300],
  palette: [
    colors.primary[400],
    colors.info[400],
    colors.success[400],
    colors.purple[400],
    colors.warning[400],
    colors.danger[400],
    colors.primary[200],
    colors.info[200],
    colors.success[200],
    colors.purple[200],
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
