import { Popover, MenuItem } from '@mui/material'
import { typography } from '@/lib/designSystem'

interface GroupByOption {
  value: string
  label: string
}

interface GroupByPopoverProps {
  anchorEl: HTMLButtonElement | null
  onClose: () => void
  options: GroupByOption[]
  currentValue: string
  onChange: (value: string) => void
}

const GroupByPopover = ({ anchorEl, onClose, options, currentValue, onChange }: GroupByPopoverProps) => (
  <Popover
    open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mt: 0.5 } }}
  >
    {options.map((opt) => (
      <MenuItem key={opt.value} selected={currentValue === opt.value}
        onClick={() => { onChange(opt.value); onClose() }}
        sx={{ fontSize: typography.sizes.sm, minWidth: 160 }}>
        {opt.label}
      </MenuItem>
    ))}
  </Popover>
)

export default GroupByPopover
export type { GroupByOption }
