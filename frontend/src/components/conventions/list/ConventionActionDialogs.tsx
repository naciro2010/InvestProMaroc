import {
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Divider,
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Send,
  Visibility,
} from '@mui/icons-material'
import { ConfirmDialog } from '@/components/core'
import { colors, componentStyles } from '@/lib/designSystem'
import type { Convention } from './ConventionListTable'

interface ConventionActionDialogsProps {
  /** Menu */
  anchorEl: HTMLElement | null
  onMenuClose: () => void
  selectedConvention: Convention | null
  isAdmin: boolean
  onAction: (action: string) => void
  /** Reject dialog */
  rejectDialogOpen: boolean
  onRejectClose: () => void
  motifRejet: string
  onMotifChange: (value: string) => void
  onRejectConfirm: () => void
  /** Delete dialog */
  deleteConfirmOpen: boolean
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

const ConventionActionDialogs = ({
  anchorEl, onMenuClose, selectedConvention, isAdmin, onAction,
  rejectDialogOpen, onRejectClose, motifRejet, onMotifChange, onRejectConfirm,
  deleteConfirmOpen, onDeleteConfirm, onDeleteCancel,
}: ConventionActionDialogsProps) => (
  <>
    {/* Context menu */}
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onMenuClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{ sx: { minWidth: 180, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } }}
    >
      <MenuItem onClick={() => onAction('view')} sx={componentStyles.menuItem}>
        <Visibility fontSize="small" sx={{ color: colors.textSecondary }} />
        Voir details
      </MenuItem>
      {selectedConvention?.statut === 'BROUILLON' && (
        <>
          <MenuItem onClick={() => onAction('edit')} sx={componentStyles.menuItem}>
            <Edit fontSize="small" sx={{ color: colors.textSecondary }} />
            Modifier
          </MenuItem>
          <MenuItem onClick={() => onAction('submit')} sx={componentStyles.menuItem}>
            <Send fontSize="small" sx={{ color: colors.info[600] }} />
            Soumettre
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => onAction('delete')} sx={{ ...componentStyles.menuItem, color: colors.danger[600] }}>
            <Delete fontSize="small" />
            Supprimer
          </MenuItem>
        </>
      )}
      {selectedConvention?.statut === 'SOUMIS' && isAdmin && (
        <>
          <MenuItem onClick={() => onAction('validate')} sx={componentStyles.menuItem}>
            <CheckCircle fontSize="small" sx={{ color: colors.success[600] }} />
            Valider
          </MenuItem>
          <MenuItem onClick={() => onAction('reject')} sx={componentStyles.menuItem}>
            <Cancel fontSize="small" sx={{ color: colors.danger[600] }} />
            Rejeter
          </MenuItem>
        </>
      )}
    </Menu>

    {/* Reject dialog */}
    <Dialog open={rejectDialogOpen} onClose={onRejectClose} maxWidth="sm" fullWidth PaperProps={{ sx: componentStyles.dialog.paper }}>
      <DialogTitle sx={componentStyles.dialog.title}>Rejeter la convention</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth multiline rows={4} label="Motif du rejet"
          value={motifRejet} onChange={(e) => onMotifChange(e.target.value)}
          placeholder="Expliquez pourquoi cette convention est rejetee..." sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onRejectClose} sx={componentStyles.buttonSecondary}>Annuler</Button>
        <Button onClick={onRejectConfirm} variant="contained" disabled={!motifRejet.trim()} sx={componentStyles.buttonDanger}>Rejeter</Button>
      </DialogActions>
    </Dialog>

    {/* Delete dialog */}
    <ConfirmDialog
      open={deleteConfirmOpen}
      title="Supprimer la convention"
      message="Cette action est irreversible. Voulez-vous continuer ?"
      variant="danger"
      confirmLabel="Supprimer"
      onConfirm={onDeleteConfirm}
      onCancel={onDeleteCancel}
    />
  </>
)

export default ConventionActionDialogs
