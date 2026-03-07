import { Popover, Typography, Checkbox, FormControlLabel } from '@mui/material'
import { colors, typography } from '@/lib/designSystem'

interface ColumnConfig {
  key: string
  label: string
  visible: boolean
}

interface ColumnVisibilityPopoverProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  columns: ColumnConfig[]
  onToggle: (key: string) => void
}

const ColumnVisibilityPopover = ({ anchorEl, onClose, columns, onToggle }: ColumnVisibilityPopoverProps) => (
  <Popover
    open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mt: 0.5, p: 1, minWidth: 180 } }}
  >
    <Typography sx={{
      px: 1, py: 0.5, fontSize: typography.sizes.xs,
      fontWeight: typography.weights.semibold, color: colors.textSecondary,
      textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      Colonnes visibles
    </Typography>
    {columns.map((col) => (
      <FormControlLabel key={col.key}
        control={<Checkbox size="small" checked={col.visible} onChange={() => onToggle(col.key)} sx={{ p: 0.5, ml: 0.5 }} />}
        label={col.label}
        sx={{ display: 'flex', mx: 0, '& .MuiFormControlLabel-label': { fontSize: typography.sizes.sm } }}
      />
    ))}
  </Popover>
)

export default ColumnVisibilityPopover
