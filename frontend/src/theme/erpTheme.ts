import { createTheme, ThemeOptions } from '@mui/material/styles'
import { colors, typography, borders } from '../lib/designSystem'

/**
 * ERP Theme - Generated from designSystem.ts tokens
 *
 * Single source of truth: designSystem.ts
 * This file converts those tokens into a MUI ThemeOptions object.
 */

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary[600],
      light: colors.primary[100],
      dark: colors.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.neutral[600],
      light: colors.neutral[400],
      dark: colors.neutral[800],
      contrastText: '#ffffff',
    },
    error: {
      main: colors.danger[600],
      light: colors.danger[100],
      dark: colors.danger[700],
    },
    warning: {
      main: colors.warning[600],
      light: colors.warning[100],
      dark: colors.warning[700],
    },
    info: {
      main: colors.info[600],
      light: colors.info[100],
      dark: colors.info[700],
    },
    success: {
      main: colors.success[600],
      light: colors.success[100],
      dark: colors.success[700],
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      disabled: colors.textDisabled,
    },
    divider: colors.border,
  },

  typography: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    h1: { fontSize: 28, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.3 },
    h2: { fontSize: 24, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.3 },
    h3: { fontSize: 20, fontWeight: 600, color: colors.neutral[700], lineHeight: 1.4 },
    h4: { fontSize: 18, fontWeight: 600, color: colors.neutral[700], lineHeight: 1.4 },
    h5: { fontSize: 16, fontWeight: 600, color: colors.neutral[600], lineHeight: 1.4 },
    h6: { fontSize: 14, fontWeight: 600, color: colors.neutral[600], lineHeight: 1.4 },
    subtitle1: { fontSize: 14, fontWeight: 600, color: colors.neutral[700], lineHeight: 1.5 },
    subtitle2: { fontSize: 13, fontWeight: 600, color: colors.neutral[600], lineHeight: 1.5 },
    body1: { fontSize: 14, color: colors.neutral[700], lineHeight: 1.5 },
    body2: { fontSize: 13, color: colors.neutral[600], lineHeight: 1.5 },
    caption: { fontSize: 12, color: colors.neutral[500], lineHeight: 1.4 },
    button: { textTransform: 'none' as const, fontWeight: 500, fontSize: 14 },
  },

  spacing: 8,

  shape: {
    borderRadius: parseInt(borders.radius.md, 10) || 6,
  },

  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06)',
    '0 2px 4px rgba(0,0,0,0.06)',
    '0 3px 6px rgba(0,0,0,0.07)',
    '0 4px 8px rgba(0,0,0,0.07)',
    '0 6px 12px rgba(0,0,0,0.08)',
    '0 8px 16px rgba(0,0,0,0.08)',
    'none', 'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none', 'none',
    'none', 'none', 'none', 'none', 'none', 'none',
  ],

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          backgroundColor: colors.primary[600],
          '&:hover': { backgroundColor: colors.primary[700] },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation1: { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: `1px solid ${colors.border}`,
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: colors.neutral[300] },
            '&:hover fieldset': { borderColor: colors.neutral[400] },
            '&.Mui-focused fieldset': { borderColor: colors.primary[600], borderWidth: '1px' },
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.neutral[400] },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary[600], borderWidth: '1px' },
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: { backgroundColor: colors.neutral[50] },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: colors.neutral[200], fontSize: 14 },
        head: { fontWeight: 600, color: colors.neutral[700] },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: colors.neutral[50] },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, fontSize: 12 },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${colors.neutral[200]}` },
        indicator: { backgroundColor: colors.primary[600], height: 2 },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          fontSize: 14,
          color: colors.neutral[600],
          '&.Mui-selected': { color: colors.primary[600] },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 4 },
        standardInfo: { backgroundColor: colors.info[50], color: colors.textPrimary },
        standardSuccess: { backgroundColor: colors.success[50], color: colors.textPrimary },
        standardWarning: { backgroundColor: colors.warning[50], color: colors.textPrimary },
        standardError: { backgroundColor: colors.danger[50], color: colors.textPrimary },
      },
    },

    MuiBreadcrumbs: {
      styleOverrides: {
        separator: { color: colors.neutral[400] },
      },
    },
  },
}

export const erpTheme = createTheme(themeOptions)
export default erpTheme
