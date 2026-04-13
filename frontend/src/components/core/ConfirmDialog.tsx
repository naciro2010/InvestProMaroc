import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material'
import { AlertTriangle, Trash2, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { colors, typography, spacing, borders, shadows, componentStyles } from '@/lib/designSystem'

// ==================== TYPES ====================

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

// ==================== VARIANT CONFIG ====================

interface VariantConfig {
  icon: ReactNode
  iconBg: string
  iconColor: string
  confirmBg: string
  confirmHoverBg: string
}

const variantMap: Record<string, VariantConfig> = {
  danger: {
    icon: <Trash2 size={24} />,
    iconBg: colors.danger[50],
    iconColor: colors.danger[600],
    confirmBg: colors.danger[600],
    confirmHoverBg: colors.danger[700],
  },
  warning: {
    icon: <AlertTriangle size={24} />,
    iconBg: colors.warning[50],
    iconColor: colors.warning[600],
    confirmBg: colors.warning[600],
    confirmHoverBg: colors.warning[700],
  },
  info: {
    icon: <Info size={24} />,
    iconBg: colors.primary[50],
    iconColor: colors.primary[600],
    confirmBg: colors.primary[600],
    confirmHoverBg: colors.primary[700],
  },
}

// ==================== COMPONENT ====================

/**
 * ConfirmDialog - Professional confirmation dialog replacing window.confirm().
 *
 * Supports danger (delete), warning (state change), and info (neutral) variants.
 * Each variant has a matching icon and confirm button color.
 *
 * @example
 * <ConfirmDialog
 *   open={showDelete}
 *   title="Supprimer la convention"
 *   message="Cette action est irr\u00e9versible."
 *   variant="danger"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDelete(false)}
 *   loading={deleting}
 * />
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'info',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) => {
  const config = variantMap[variant] ?? variantMap.info

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-dialog-title"
      PaperProps={{ sx: componentStyles.dialog.paper }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: spacing.mui.md, pb: 0.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: borders.radius.full,
            backgroundColor: config.iconBg,
            color: config.iconColor,
            flexShrink: 0,
          }}
        >
          {config.icon}
        </Box>
        <Typography id="confirm-dialog-title" sx={componentStyles.dialog.title}>{title}</Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pl: `calc(40px + ${spacing['2xl']})` }}>
        <Typography sx={{ fontSize: typography.sizes.base, color: colors.textSecondary, lineHeight: typography.lineHeights.normal }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: spacing.mui['2xl'], pb: spacing.mui.xl, gap: spacing.mui.sm }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          sx={componentStyles.buttonSecondary}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          sx={{
            backgroundColor: config.confirmBg,
            color: colors.textOnColor,
            fontWeight: typography.weights.medium,
            fontSize: typography.sizes.base,
            textTransform: 'none',
            boxShadow: shadows.none,
            borderRadius: borders.radius.base,
            px: spacing.mui.lg,
            minWidth: 100,
            '&:hover': { backgroundColor: config.confirmHoverBg },
            '&:disabled': { opacity: 0.7, color: colors.textOnColor, backgroundColor: config.confirmBg },
          }}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
