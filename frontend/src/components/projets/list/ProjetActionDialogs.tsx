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
  PlayArrow,
  Pause,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material'
import { ConfirmDialog } from '@/components/core'
import { colors, componentStyles } from '@/lib/designSystem'
import type { Projet } from '@/lib/projetsAPI'

interface ProjetActionDialogsProps {
  anchorEl: HTMLElement | null
  onMenuClose: () => void
  selectedProjet: Projet | null
  onAction: (action: string) => void
  motifDialogOpen: boolean
  onMotifClose: () => void
  motif: string
  onMotifChange: (value: string) => void
  onMotifConfirm: () => void
  actionType: 'suspendre' | 'annuler'
  deleteConfirmOpen: boolean
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

const ProjetActionDialogs = ({
  anchorEl, onMenuClose, selectedProjet, onAction,
  motifDialogOpen, onMotifClose, motif, onMotifChange, onMotifConfirm, actionType,
  deleteConfirmOpen, onDeleteConfirm, onDeleteCancel,
}: ProjetActionDialogsProps) => (
  <>
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
      <MenuItem onClick={() => onAction('edit')} sx={componentStyles.menuItem}>
        <Edit fontSize="small" sx={{ color: colors.textSecondary }} />
        Modifier
      </MenuItem>

      {selectedProjet?.statut === 'EN_PREPARATION' && (
        <MenuItem onClick={() => onAction('demarrer')} sx={componentStyles.menuItem}>
          <PlayArrow fontSize="small" sx={{ color: colors.success[600] }} />
          Demarrer
        </MenuItem>
      )}
      {selectedProjet?.statut === 'EN_COURS' && (
        <>
          <MenuItem onClick={() => onAction('suspendre')} sx={componentStyles.menuItem}>
            <Pause fontSize="small" sx={{ color: colors.warning[600] }} />
            Suspendre
          </MenuItem>
          <MenuItem onClick={() => onAction('terminer')} sx={componentStyles.menuItem}>
            <CheckCircle fontSize="small" sx={{ color: colors.success[600] }} />
            Terminer
          </MenuItem>
        </>
      )}
      {selectedProjet?.statut === 'SUSPENDU' && (
        <MenuItem onClick={() => onAction('reprendre')} sx={componentStyles.menuItem}>
          <PlayArrow fontSize="small" sx={{ color: colors.success[600] }} />
          Reprendre
        </MenuItem>
      )}
      {selectedProjet?.statut !== 'TERMINE' && selectedProjet?.statut !== 'ANNULE' && (
        <MenuItem onClick={() => onAction('annuler')} sx={componentStyles.menuItem}>
          <Cancel fontSize="small" sx={{ color: colors.danger[600] }} />
          Annuler
        </MenuItem>
      )}
      <Divider />
      <MenuItem onClick={() => onAction('delete')} sx={{ ...componentStyles.menuItem, color: colors.danger[600] }}>
        <Delete fontSize="small" />
        Supprimer
      </MenuItem>
    </Menu>

    <Dialog open={motifDialogOpen} onClose={onMotifClose} maxWidth="sm" fullWidth PaperProps={{ sx: componentStyles.dialog.paper }}>
      <DialogTitle sx={componentStyles.dialog.title}>
        {actionType === 'suspendre' ? 'Suspendre le projet' : 'Annuler le projet'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth multiline rows={4} label="Motif"
          value={motif} onChange={(e) => onMotifChange(e.target.value)}
          placeholder={actionType === 'suspendre' ? 'Expliquez pourquoi ce projet est suspendu...' : 'Expliquez pourquoi ce projet est annule...'}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onMotifClose} sx={componentStyles.buttonSecondary}>Annuler</Button>
        <Button onClick={onMotifConfirm} variant="contained" disabled={!motif.trim()}
          sx={actionType === 'suspendre' ? componentStyles.buttonPrimary : componentStyles.buttonDanger}>
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>

    <ConfirmDialog
      open={deleteConfirmOpen}
      title="Supprimer le projet"
      message="Cette action est irreversible. Voulez-vous continuer ?"
      variant="danger"
      confirmLabel="Supprimer"
      onConfirm={onDeleteConfirm}
      onCancel={onDeleteCancel}
    />
  </>
)

export default ProjetActionDialogs
