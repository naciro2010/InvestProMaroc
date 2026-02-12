import { Button, CircularProgress } from '@mui/material'
import { Download } from 'lucide-react'
import { colors, typography } from '@/lib/designSystem'

interface ExportButtonProps {
  onClick: () => void
  loading?: boolean
  label?: string
}

export default function ExportButton({ onClick, loading = false, label = 'Exporter' }: ExportButtonProps) {
  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={loading ? <CircularProgress size={16} /> : <Download size={16} />}
      onClick={onClick}
      disabled={loading}
      sx={{
        textTransform: 'none',
        fontWeight: typography.weights.medium,
        fontSize: typography.sizes.sm,
        borderColor: colors.neutral[300],
        color: colors.textPrimary,
        '&:hover': {
          borderColor: colors.primary[400],
          bgcolor: colors.primary[50],
        },
      }}
    >
      {label}
    </Button>
  )
}
