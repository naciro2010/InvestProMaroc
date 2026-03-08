import { createTheme, ThemeOptions } from '@mui/material/styles'

/**
 * ERP-inspired Theme
 *
 * Design principles:
 * - Minimaliste et épuré
 * - Backgrounds blancs
 * - Bordures subtiles
 * - Typography sobre
 * - Spacing cohérent (8px base)
 * - Couleurs naturelles
 */

// Professional ERP-style palette
const colors = {
  // Neutrals
  gray50: '#f8f9fa',
  gray100: '#e9ecef',
  gray200: '#dee2e6',
  gray300: '#ced4da',
  gray400: '#adb5bd',
  gray500: '#6c757d',
  gray600: '#495057',
  gray700: '#343a40',
  gray800: '#212529',

  // Primary (bleu sobre)
  primary: '#007bff',
  primaryHover: '#0056b3',
  primaryLight: '#e7f3ff',

  // Status colors
  success: '#28a745',
  successLight: '#d4edda',
  warning: '#ffc107',
  warningLight: '#fff3cd',
  danger: '#dc3545',
  dangerLight: '#f8d7da',
  info: '#17a2b8',
  infoLight: '#d1ecf1',

  // Backgrounds
  bgPage: '#f8f9fa',
  bgCard: '#ffffff',
  bgHover: '#f1f3f5',
  bgActive: '#e7f3ff',
}

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      light: colors.primaryLight,
      dark: colors.primaryHover,
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.gray600,
      light: colors.gray400,
      dark: colors.gray800,
      contrastText: '#ffffff',
    },
    error: {
      main: colors.danger,
      light: colors.dangerLight,
    },
    warning: {
      main: colors.warning,
      light: colors.warningLight,
    },
    info: {
      main: colors.info,
      light: colors.infoLight,
    },
    success: {
      main: colors.success,
      light: colors.successLight,
    },
    background: {
      default: colors.bgPage,
      paper: colors.bgCard,
    },
    text: {
      primary: colors.gray800,
      secondary: colors.gray600,
      disabled: colors.gray400,
    },
    divider: colors.gray200,
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,

    h1: {
      fontSize: 28,
      fontWeight: 600,
      color: colors.gray800,
      lineHeight: 1.3,
    },
    h2: {
      fontSize: 24,
      fontWeight: 600,
      color: colors.gray800,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: 600,
      color: colors.gray700,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: 18,
      fontWeight: 600,
      color: colors.gray700,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: 16,
      fontWeight: 600,
      color: colors.gray600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: 14,
      fontWeight: 600,
      color: colors.gray600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: 14,
      fontWeight: 600,
      color: colors.gray700,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: 13,
      fontWeight: 600,
      color: colors.gray600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: 14,
      color: colors.gray700,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 13,
      color: colors.gray600,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      color: colors.gray500,
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: 14,
    },
  },

  spacing: 8, // Base unit: 8px

  shape: {
    borderRadius: 4, // Subtle rounded corners
  },

  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.08)',
    '0 2px 4px rgba(0, 0, 0, 0.08)',
    '0 3px 6px rgba(0, 0, 0, 0.08)',
    '0 4px 8px rgba(0, 0, 0, 0.08)',
    '0 6px 12px rgba(0, 0, 0, 0.10)',
    '0 8px 16px rgba(0, 0, 0, 0.10)',
    'none', 'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none', 'none',
  ],

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: colors.primary,
          '&:hover': {
            backgroundColor: colors.primaryHover,
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${colors.gray200}`,
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: colors.gray300,
            },
            '&:hover fieldset': {
              borderColor: colors.gray400,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
              borderWidth: '1px', // Thin borders
            },
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.gray400,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.primary,
            borderWidth: '1px',
          },
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.gray50,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: colors.gray200,
          fontSize: 14,
        },
        head: {
          fontWeight: 600,
          color: colors.gray700,
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: colors.bgHover,
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: 12,
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.gray200}`,
        },
        indicator: {
          backgroundColor: colors.primary,
          height: 2,
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: 14,
          color: colors.gray600,
          '&.Mui-selected': {
            color: colors.primary,
          },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
        standardInfo: {
          backgroundColor: colors.infoLight,
          color: colors.gray800,
        },
        standardSuccess: {
          backgroundColor: colors.successLight,
          color: colors.gray800,
        },
        standardWarning: {
          backgroundColor: colors.warningLight,
          color: colors.gray800,
        },
        standardError: {
          backgroundColor: colors.dangerLight,
          color: colors.gray800,
        },
      },
    },

    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          color: colors.gray400,
        },
      },
    },
  },
}

export const erpTheme = createTheme(themeOptions)
/** @deprecated Use erpTheme instead */
export const investProTheme = erpTheme

export { colors }
