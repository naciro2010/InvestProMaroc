import { Button, CircularProgress } from '@mui/material'
import { Download } from 'lucide-react'
import { componentStyles } from '@/lib/designSystem'

interface ExportButtonProps {
  onClick: () => void
  loading?: boolean
  label?: string
}

export default function ExportButton({ onClick, loading = false, label = 'Exporter' }: ExportButtonProps) {
  return (
    <Button
      variant="outlined"
      startIcon={loading ? <CircularProgress size={16} /> : <Download size={16} strokeWidth={1.75} />}
      onClick={onClick}
      disabled={loading}
      sx={componentStyles.buttonSecondary}
    >
      {label}
    </Button>
  )
}
