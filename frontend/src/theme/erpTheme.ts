import { createTheme, ThemeOptions } from '@mui/material/styles'
import { colors, typography, borders, shadows, gradients } from '../lib/designSystem'

/**
 * ERP Theme « Registre » - généré à partir des tokens de designSystem.ts
 *
 * Source unique : designSystem.ts
 * Ce fichier traduit ces tokens en ThemeOptions MUI : tous les composants
 * MUI (boutons, champs, onglets, tableaux, dialogues…) héritent du style.
 */

const serif = typography.fontFamilySerif

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary[600],
      light: colors.primary[400],
      dark: colors.primary[700],
      contrastText: colors.textOnColor,
    },
    secondary: {
      main: colors.brass.main,
      light: colors.brass.light,
      dark: colors.purple[700],
      contrastText: colors.textOnColor,
    },
    error: {
      main: colors.danger[600],
      light: colors.danger[100],
      dark: colors.danger[700],
      contrastText: colors.textOnColor,
    },
    warning: {
      main: colors.warning[700],
      light: colors.warning[100],
      dark: colors.warning[800],
      contrastText: colors.textOnColor,
    },
    info: {
      main: colors.info[700],
      light: colors.info[100],
      dark: colors.info[800],
      contrastText: colors.textOnColor,
    },
    success: {
      main: colors.success[700],
      light: colors.success[100],
      dark: colors.success[800],
      contrastText: colors.textOnColor,
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
    action: {
      hover: 'rgba(247, 243, 234, 0.7)',
      selected: colors.primary[50],
    },
  },

  typography: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    h1: { fontFamily: serif, fontSize: 30, fontWeight: 500, color: colors.textPrimary, lineHeight: 1.15 },
    h2: { fontFamily: serif, fontSize: 30, fontWeight: 500, color: colors.textPrimary, lineHeight: 1.15 },
    h3: { fontFamily: serif, fontSize: 24, fontWeight: 500, color: colors.textPrimary, lineHeight: 1.2 },
    h4: { fontFamily: serif, fontSize: 18, fontWeight: 500, color: colors.textPrimary, lineHeight: 1.3 },
    h5: { fontSize: 15, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.4 },
    h6: { fontSize: 14, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.4 },
    subtitle1: { fontSize: 14, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.5 },
    subtitle2: { fontSize: 13, fontWeight: 600, color: colors.neutral[700], lineHeight: 1.5 },
    body1: { fontSize: 14, color: colors.textPrimary, lineHeight: 1.5 },
    body2: { fontSize: 13, color: colors.neutral[700], lineHeight: 1.5 },
    caption: { fontSize: 12, color: colors.textTertiary, lineHeight: 1.4 },
    overline: { fontSize: 11, fontWeight: 600, color: colors.textSecondary, letterSpacing: '0.02em', textTransform: 'none' },
    button: { textTransform: 'none' as const, fontWeight: 600, fontSize: 13 },
  },

  spacing: 8,

  shape: {
    borderRadius: parseInt(borders.radius.base, 10) || 6,
  },

  shadows: [
    'none',
    shadows.sm,
    shadows.panel,
    shadows.panel,
    shadows.lg,
    shadows.lg,
    shadows.lg,
    shadows.lg,
    shadows.lg,
    shadows.xl,
    shadows.xl, shadows.xl, shadows.xl, shadows.xl, shadows.xl,
    shadows.xl, shadows.xl, shadows.xl, shadows.xl, shadows.xl,
    shadows.xl, shadows.xl, shadows.xl, shadows.xl, shadows.xl,
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background,
          fontVariantNumeric: 'tabular-nums',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 600,
          fontSize: 13,
          borderRadius: borders.radius.base,
          boxShadow: 'none',
          transition: 'filter .15s ease, border-color .15s ease, background-color .15s ease, box-shadow .15s ease',
          '&:hover': { boxShadow: 'none' },
        },
        sizeMedium: { minHeight: 36, paddingLeft: 16, paddingRight: 16 },
        sizeSmall: { minHeight: 30, paddingLeft: 12, paddingRight: 12 },
        contained: {
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: gradients.primaryButton,
          color: colors.textOnColor,
          boxShadow: shadows.primaryButton,
          '&:hover': { background: gradients.primaryButton, filter: 'brightness(1.08)', boxShadow: shadows.primaryButton },
          '&.Mui-disabled': { background: colors.neutral[200], color: colors.textDisabled, boxShadow: 'none' },
        },
        containedError: {
          backgroundColor: colors.danger[600],
          color: colors.textOnColor,
          '&:hover': { backgroundColor: colors.danger[700] },
        },
        outlined: {
          fontWeight: 500,
          backgroundColor: colors.surface,
        },
        outlinedPrimary: {
          borderColor: colors.fieldBorder,
          color: colors.textPrimary,
          '&:hover': { borderColor: colors.textSecondary, backgroundColor: colors.surface },
        },
        outlinedInherit: {
          borderColor: colors.fieldBorder,
          '&:hover': { borderColor: colors.textSecondary },
        },
        outlinedError: {
          borderColor: colors.danger[200],
          color: colors.danger[600],
          '&:hover': { borderColor: colors.danger[200], backgroundColor: colors.danger[50] },
        },
        text: {
          fontWeight: 500,
        },
        textPrimary: {
          color: colors.textPrimary,
          '&:hover': { backgroundColor: colors.surfaceAlt },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: borders.radius.base,
          '&:hover': { backgroundColor: colors.surfaceAlt },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: colors.surface },
        rounded: { borderRadius: borders.radius.lg },
        elevation1: { boxShadow: shadows.panel },
        outlined: { borderColor: colors.border },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borders.radius.lg,
          boxShadow: shadows.panel,
          border: 'none',
        },
      },
    },

    MuiCardHeader: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${colors.border}`, padding: '14px 24px 12px' },
        title: { fontFamily: serif, fontSize: 18, fontWeight: 500, color: colors.textPrimary },
        subheader: { fontSize: 12, color: colors.textTertiary },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: { padding: '16px 24px', '&:last-child': { paddingBottom: 20 } },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          borderRadius: borders.radius.base,
          boxShadow: shadows.fieldInset,
          transition: 'box-shadow .15s ease',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.fieldBorder },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.textSecondary },
          '&.Mui-focused': { boxShadow: shadows.focus },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary[600], borderWidth: '1px' },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: colors.danger[600] },
          '&.Mui-disabled': { backgroundColor: colors.surfaceAlt, boxShadow: 'none' },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: colors.textSecondary,
          '&.Mui-focused': { color: colors.textPrimary },
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: { fontSize: 12, marginLeft: 2 },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: { backgroundColor: colors.surface },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surfaceAlt,
          '& .MuiTableCell-head': { backgroundColor: colors.surfaceAlt },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: colors.borderSubtle, fontSize: 13.5, padding: '9px 12px' },
        head: {
          fontWeight: 600,
          fontSize: 12,
          color: colors.textTertiary,
          borderBottom: `1px solid ${colors.border}`,
          whiteSpace: 'nowrap',
        },
        stickyHeader: { backgroundColor: colors.surfaceAlt },
        footer: { fontWeight: 600, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': { backgroundColor: 'rgba(247, 243, 234, 0.7)' },
          '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: colors.primary[50] },
        },
      },
    },

    MuiTablePagination: {
      styleOverrides: {
        root: { borderTop: `1px solid ${colors.borderSubtle}`, color: colors.textSecondary },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: 11, borderRadius: borders.radius.full },
        sizeSmall: { height: 20 },
        label: { paddingLeft: 9, paddingRight: 9 },
        filled: { backgroundColor: colors.neutral[100], color: colors.textSecondary },
        outlined: { borderColor: colors.border },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${colors.border}`, minHeight: 42 },
        indicator: { backgroundColor: colors.brass.main, height: 2 },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          fontSize: 13.5,
          minHeight: 42,
          color: colors.textSecondary,
          '&:hover': { color: colors.textPrimary },
          '&.Mui-selected': { color: colors.textPrimary, fontWeight: 600 },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borders.radius.xl,
          boxShadow: shadows.xl,
          backgroundColor: colors.surface,
        },
      },
    },

    MuiBackdrop: {
      styleOverrides: {
        root: {
          '&:not(.MuiBackdrop-invisible)': { backgroundColor: 'rgba(28, 42, 68, 0.34)' },
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: serif,
          fontSize: 20,
          fontWeight: 500,
          color: colors.textPrimary,
          padding: '18px 24px 12px',
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: { padding: '12px 24px 16px' },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          backgroundColor: colors.surfaceAlt,
          borderTop: `1px solid ${colors.border}`,
          gap: 8,
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: colors.surface, borderColor: colors.border },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: borders.radius.lg,
          boxShadow: `0 20px 44px -16px rgba(28, 42, 68, 0.45), 0 0 0 1px ${colors.border}`,
        },
        list: { padding: 6 },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: 13.5,
          borderRadius: borders.radius.item,
          '&:hover': { backgroundColor: colors.surfaceAlt },
          '&.Mui-selected': { backgroundColor: colors.primary[50] },
        },
      },
    },

    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: borders.radius.lg,
          boxShadow: `0 20px 44px -16px rgba(28, 42, 68, 0.45), 0 0 0 1px ${colors.border}`,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.ink.main,
          color: colors.onDark.primary,
          fontSize: 12,
          borderRadius: borders.radius.base,
          boxShadow: `inset 0 0 0 1px ${colors.brass.halo}`,
        },
        arrow: { color: colors.ink.main },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '0 6px 6px 0',
          fontSize: 12.5,
          borderLeft: '3px solid',
          alignItems: 'center',
        },
        standardInfo: { backgroundColor: colors.info[50], color: colors.info[800], borderLeftColor: colors.info[800] },
        standardSuccess: { backgroundColor: colors.success[50], color: colors.success[700], borderLeftColor: colors.success[700] },
        standardWarning: { backgroundColor: colors.warning[50], color: colors.warning[700], borderLeftColor: colors.warning[700] },
        standardError: { backgroundColor: colors.danger[50], color: colors.danger[600], borderLeftColor: colors.danger[600] },
        icon: { color: 'inherit !important' },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 999, backgroundColor: colors.neutral[100] },
        bar: { borderRadius: 999 },
        barColorPrimary: { backgroundColor: colors.primary[600] },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: colors.neutral[100] },
        rounded: { borderRadius: borders.radius.lg },
      },
    },

    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: colors.neutral[100],
          padding: 3,
          borderRadius: borders.radius.base,
          gap: 2,
        },
        grouped: {
          border: 'none !important',
          borderRadius: `${borders.radius.sm} !important`,
        },
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontSize: 13,
          fontWeight: 500,
          color: colors.textSecondary,
          padding: '4px 11px',
          '&:hover': { backgroundColor: 'rgba(255, 253, 248, 0.6)' },
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: colors.surface,
            color: colors.textPrimary,
            fontWeight: 600,
            boxShadow: shadows.raised,
          },
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: colors.primary[600], opacity: 1 },
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colors.fieldBorder,
          '&.Mui-checked': { color: colors.primary[600] },
        },
      },
    },

    MuiRadio: {
      styleOverrides: {
        root: {
          color: colors.fieldBorder,
          '&.Mui-checked': { color: colors.primary[600] },
        },
      },
    },

    MuiBreadcrumbs: {
      styleOverrides: {
        root: { fontSize: 12, color: colors.textSecondary },
        separator: { color: colors.textDisabled },
      },
    },

    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: colors.neutral[200],
          '&.Mui-active': { color: colors.primary[600] },
          '&.Mui-completed': { color: colors.success[700] },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: colors.border },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: borders.radius.lg,
          boxShadow: shadows.panel,
          '&:before': { display: 'none' },
        },
      },
    },
  },
}

export const erpTheme = createTheme(themeOptions)
export default erpTheme
