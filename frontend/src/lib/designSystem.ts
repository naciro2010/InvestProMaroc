/**
 * Design System - Tokens de design centralisés pour InvestPro Maroc.
 *
 * SOURCE UNIQUE DE VÉRITÉ pour toutes les valeurs de design.
 * Ce fichier remplace les couleurs en dur éparpillées dans les composants.
 *
 * ARCHITECTURE:
 * - Ce fichier exporte des constantes TypeScript fortement typées
 * - Les composants importent ce fichier au lieu de coder les valeurs en dur
 * - Les modifications visuelles se font ICI et se propagent partout
 *
 * PRINCIPES DE DESIGN:
 * - Interface professionnelle, sobre et fonctionnelle
 * - Pas de gradients dans les zones de contenu
 * - Espacement cohérent (base 8px)
 * - Hiérarchie typographique claire
 * - Ombres subtiles, pas de flashy
 */

// ==================== COULEURS ====================

export const colors = {
  /**
   * Couleur primaire - Bleu
   * Utilisée pour: boutons principaux, liens, sélection, focus
   */
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  /**
   * Succès - Vert
   * Utilisée pour: validation, statuts actifs, confirmations
   */
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    500: '#108548',
    600: '#0d6b3d',
    700: '#166534',
  },

  /**
   * Danger - Rouge
   * Utilisée pour: erreurs, suppression, alertes critiques
   */
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    500: '#dd2b0e',
    600: '#c91c00',
    700: '#b91c1c',
  },

  /**
   * Warning - Orange
   * Utilisée pour: avertissements, statuts en attente
   */
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    500: '#ab6100',
    600: '#9e5a00',
    700: '#92400e',
  },

  /**
   * Info - Bleu clair
   * Utilisée pour: informations, statuts en cours
   */
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    500: '#1f75cb',
    600: '#1068bf',
    700: '#1e40af',
  },

  /**
   * Gris - Palette neutre
   * Utilisée pour: textes, bordures, arrière-plans, séparateurs
   */
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  /** Fond de page principal */
  background: '#f5f5f5',

  /** Fond blanc (cartes, papier) */
  surface: '#ffffff',

  /** Bordure standard */
  border: '#e5e7eb',

  /** Séparateur (plus subtil que border) */
  divider: '#f0f0f0',
} as const

// ==================== TYPOGRAPHIE ====================

export const typography = {
  /**
   * Famille de polices système
   * Priorité: polices natives OS pour performance optimale
   */
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",

  fontFamilyMono:
    "Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",

  /**
   * Tailles de police
   */
  sizes: {
    /** Très petit - métadonnées, timestamps */
    xs: '0.75rem',    // 12px
    /** Petit - labels secondaires, breadcrumbs */
    sm: '0.8125rem',  // 13px
    /** Base - texte courant */
    base: '0.875rem', // 14px
    /** Moyen - sous-titres */
    md: '1rem',       // 16px
    /** Grand - titres de section */
    lg: '1.125rem',   // 18px
    /** Très grand - titres de page */
    xl: '1.5rem',     // 24px
    /** Titre principal */
    '2xl': '1.875rem', // 30px
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
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const

// ==================== ESPACEMENT ====================

export const spacing = {
  /** 4px */
  xs: '0.25rem',
  /** 8px - Base unit */
  sm: '0.5rem',
  /** 12px */
  md: '0.75rem',
  /** 16px */
  lg: '1rem',
  /** 24px */
  xl: '1.5rem',
  /** 32px */
  '2xl': '2rem',
  /** 48px */
  '3xl': '3rem',

  /**
   * Valeurs numériques MUI (1 unit = 8px)
   */
  mui: {
    xs: 0.5,  // 4px
    sm: 1,    // 8px
    md: 1.5,  // 12px
    lg: 2,    // 16px
    xl: 3,    // 24px
    '2xl': 4, // 32px
    '3xl': 6, // 48px
  },
} as const

// ==================== OMBRES ====================

export const shadows = {
  /** Pas d'ombre */
  none: 'none',
  /** Très subtile - éléments au repos */
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
  /** Standard - cartes, conteneurs */
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
  /** Hover - survol de cartes */
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
  /** Focus - modals, dropdowns */
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.06)',
} as const

// ==================== BORDURES ====================

export const borders = {
  /** Rayon standard (4px) */
  radius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px - Standard
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    full: '9999px',
  },

  /** Épaisseurs */
  width: {
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },
} as const

// ==================== TRANSITIONS ====================

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
} as const

// ==================== Z-INDEX ====================

export const zIndex = {
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
   * Carte standard (paper blanc, bordure subtile)
   */
  card: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: borders.radius.lg,
    boxShadow: shadows.none,
  },

  /**
   * Carte avec ombre subtile (hover ready)
   */
  cardElevated: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: borders.radius.lg,
    boxShadow: shadows.sm,
    transition: `box-shadow ${transitions.normal}`,
    '&:hover': {
      boxShadow: shadows.md,
    },
  },

  /**
   * Header de page (blanc, bordure bottom)
   */
  pageHeader: {
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
    px: spacing.mui.xl,
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
    px: spacing.mui.xl,
    py: spacing.mui.md,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  /**
   * Section de formulaire
   */
  formSection: {
    mb: spacing.mui['2xl'],
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
   * Bouton primaire (style flat, pas de gradient)
   */
  buttonPrimary: {
    backgroundColor: colors.primary[600],
    color: colors.surface,
    fontWeight: typography.weights.medium,
    textTransform: 'none' as const,
    boxShadow: shadows.none,
    borderRadius: borders.radius.base,
    '&:hover': {
      backgroundColor: colors.primary[700],
      boxShadow: shadows.none,
    },
    '&:disabled': {
      backgroundColor: colors.gray[300],
    },
  },

  /**
   * Bouton secondaire (outlined)
   */
  buttonSecondary: {
    borderColor: colors.gray[300],
    color: colors.gray[600],
    fontWeight: typography.weights.medium,
    textTransform: 'none' as const,
    borderRadius: borders.radius.base,
    '&:hover': {
      backgroundColor: colors.gray[50],
      borderColor: colors.gray[400],
    },
  },

  /**
   * Bouton danger
   */
  buttonDanger: {
    backgroundColor: colors.danger[600],
    color: colors.surface,
    fontWeight: typography.weights.medium,
    textTransform: 'none' as const,
    boxShadow: shadows.none,
    borderRadius: borders.radius.base,
    '&:hover': {
      backgroundColor: colors.danger[700],
    },
  },

  /**
   * Label de formulaire
   */
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[700],
    mb: 0.5,
  },

  /**
   * Texte requis (*)
   */
  requiredMark: {
    color: colors.danger[500],
    ml: 0.5,
  },
} as const

// ==================== STATUTS - Mapping couleurs ====================

export type StatusColor = 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'primary'

export interface StatusConfig {
  label: string
  color: StatusColor
  bgColor: string
  textColor: string
}

export const statusColors: Record<string, StatusConfig> = {
  BROUILLON: {
    label: 'Brouillon',
    color: 'gray',
    bgColor: colors.gray[100],
    textColor: colors.gray[700],
  },
  SOUMIS: {
    label: 'Soumis',
    color: 'warning',
    bgColor: colors.warning[50],
    textColor: colors.warning[700],
  },
  VALIDEE: {
    label: 'Valid\u00e9e',
    color: 'success',
    bgColor: colors.success[50],
    textColor: colors.success[700],
  },
  EN_EXECUTION: {
    label: 'En ex\u00e9cution',
    color: 'info',
    bgColor: colors.info[50],
    textColor: colors.info[700],
  },
  EN_COURS: {
    label: 'En cours',
    color: 'info',
    bgColor: colors.info[50],
    textColor: colors.info[700],
  },
  ACHEVE: {
    label: 'Achev\u00e9',
    color: 'success',
    bgColor: colors.success[100],
    textColor: colors.success[600],
  },
  REJETE: {
    label: 'Rejet\u00e9',
    color: 'danger',
    bgColor: colors.danger[50],
    textColor: colors.danger[700],
  },
  ANNULE: {
    label: 'Annul\u00e9',
    color: 'danger',
    bgColor: colors.danger[100],
    textColor: colors.danger[600],
  },
  EN_RETARD: {
    label: 'En retard',
    color: 'warning',
    bgColor: colors.warning[100],
    textColor: colors.warning[700],
  },
  SUSPENDU: {
    label: 'Suspendu',
    color: 'warning',
    bgColor: colors.warning[50],
    textColor: colors.warning[600],
  },
  TERMINE: {
    label: 'Termin\u00e9',
    color: 'success',
    bgColor: colors.success[50],
    textColor: colors.success[600],
  },
} as const

/**
 * Récupère la configuration d'un statut.
 * Retourne un style gris par défaut si le statut n'est pas trouvé.
 */
export function getStatusConfig(status: string): StatusConfig {
  return statusColors[status] ?? {
    label: status,
    color: 'gray' as StatusColor,
    bgColor: colors.gray[100],
    textColor: colors.gray[700],
  }
}

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
}

export default designSystem
