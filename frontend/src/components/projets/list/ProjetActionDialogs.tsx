import {
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
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
import { colors, componentStyles } from '@/lib/designSystem'
import type { Projet } from '@/lib/projetsAPI'

interface ProjetActionDialogsProps {
  anchorEl: HTMLElement | null
  selectedProjet: Projet | null
  onMenuClose: () => void
  onNavigateDetail: () => void
  onNavigateEdit: () => void
  onDemarrer: () => void
  onSuspendre: () => void
  onReprendre: () => void
  onTerminer: () => void
  onAnnuler: () => void
  onDelete: () => void
  motifDialogOpen: boolean
  motif: string
  onMotifChange: (value: string) => void
  onMotifSubmit: () => void
  onMotifClose: () => void
  actionType: 'suspendre' | 'annuler'
}

const ProjetActionDialogs = ({
  anchorEl,
  selectedProjet,
  onMenuClose,
  onNavigateDetail,
  onNavigateEdit,
  onDemarrer,
  onSuspendre,
  onReprendre,
  onTerminer,
  onAnnuler,
  onDelete,
  motifDialogOpen,
  motif,
  onMotifChange,
  onMotifSubmit,
  onMotifClose,
  actionType,
}: ProjetActionDialogsProps) => {
  return (
    <>
      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onMenuClose}>
        <MenuItem onClick={onNavigateDetail}>
          <Visibility fontSize="small" sx={{ mr: 1 }} /> Details
        </MenuItem>
        {selectedProjet?.statut === 'EN_PREPARATION' && (
          <MenuItem onClick={onDemarrer}>
            <PlayArrow fontSize="small" sx={{ mr: 1 }} /> Demarrer
          </MenuItem>
        )}
        {selectedProjet?.statut === 'EN_COURS' && (
          <>
            <MenuItem onClick={onSuspendre}>
              <Pause fontSize="small" sx={{ mr: 1 }} /> Suspendre
            </MenuItem>
            <MenuItem onClick={onTerminer}>
              <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Terminer
            </MenuItem>
          </>
        )}
        {selectedProjet?.statut === 'SUSPENDU' && (
          <MenuItem onClick={onReprendre}>
            <PlayArrow fontSize="small" sx={{ mr: 1 }} /> Reprendre
          </MenuItem>
        )}
        {selectedProjet?.statut !== 'TERMINE' && (
          <MenuItem onClick={onAnnuler}>
            <Cancel fontSize="small" sx={{ mr: 1 }} /> Annuler
          </MenuItem>
        )}
        <MenuItem onClick={onNavigateEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Modifier
        </MenuItem>
        <MenuItem onClick={onDelete} sx={{ color: colors.danger[600] }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Supprimer
        </MenuItem>
      </Menu>

      {/* Motif Dialog */}
      <Dialog
        open={motifDialogOpen}
        onClose={onMotifClose}
        PaperProps={{ sx: componentStyles.dialog.paper }}
      >
        <DialogTitle sx={componentStyles.dialog.title}>
          {actionType === 'suspendre' ? 'Suspendre le projet' : 'Annuler le projet'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Motif"
            value={motif}
            onChange={(e) => onMotifChange(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onMotifClose} sx={componentStyles.buttonSecondary}>
            Annuler
          </Button>
          <Button
            onClick={onMotifSubmit}
            variant="contained"
            sx={actionType === 'suspendre' ? componentStyles.buttonPrimary : componentStyles.buttonDanger}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProjetActionDialogs
