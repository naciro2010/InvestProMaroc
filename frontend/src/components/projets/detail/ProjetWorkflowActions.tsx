import { useState } from 'react'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { PlayArrow, Pause, Done } from '@mui/icons-material'
import { projetsAPI } from '@/lib/projetsAPI'
import { colors, typography, componentStyles } from '@/lib/designSystem'

interface ProjetWorkflowActionsProps {
  projetId: number
  statut: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
  onReload: () => void
}

const ProjetWorkflowActions = ({ projetId, statut, onSuccess, onError, onReload }: ProjetWorkflowActionsProps) => {
  const [suspendDialog, setSuspendDialog] = useState(false)
  const [motif, setMotif] = useState('')
  const [confirmTerminer, setConfirmTerminer] = useState(false)

  const handleDemarrer = async () => {
    try {
      await projetsAPI.demarrer(projetId)
      onSuccess('Projet demarre avec succes')
      onReload()
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Erreur lors du demarrage')
    }
  }

  const handleSuspendre = async () => {
    if (!motif.trim()) return
    try {
      await projetsAPI.suspendre(projetId, motif)
      onSuccess('Projet suspendu')
      setSuspendDialog(false)
      setMotif('')
      onReload()
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Erreur lors de la suspension')
    }
  }

  const handleReprendre = async () => {
    try {
      await projetsAPI.reprendre(projetId)
      onSuccess('Projet repris')
      onReload()
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Erreur lors de la reprise')
    }
  }

  const handleTerminer = async () => {
    try {
      await projetsAPI.terminer(projetId)
      onSuccess('Projet termine avec succes')
      setConfirmTerminer(false)
      onReload()
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Erreur lors de la cloture')
    }
  }

  const buttonSx = { fontSize: typography.sizes.sm, py: 0.5 }

  return (
    <>
      {statut === 'EN_PREPARATION' && (
        <Button
          variant="contained"
          size="small"
          startIcon={<PlayArrow />}
          onClick={handleDemarrer}
          sx={{ ...componentStyles.buttonSuccess, ...buttonSx }}
        >
          Demarrer
        </Button>
      )}

      {statut === 'EN_COURS' && (
        <>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Pause />}
            onClick={() => setSuspendDialog(true)}
            sx={{ ...componentStyles.buttonSecondary, ...buttonSx, borderColor: colors.warning[300], color: colors.warning[700] }}
          >
            Suspendre
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Done />}
            onClick={() => setConfirmTerminer(true)}
            sx={{ ...componentStyles.buttonSuccess, ...buttonSx }}
          >
            Terminer
          </Button>
        </>
      )}

      {statut === 'SUSPENDU' && (
        <Button
          variant="contained"
          size="small"
          startIcon={<PlayArrow />}
          onClick={handleReprendre}
          sx={{ ...componentStyles.buttonPrimary, ...buttonSx }}
        >
          Reprendre
        </Button>
      )}

      {/* Suspend Dialog */}
      <Dialog
        open={suspendDialog}
        onClose={() => setSuspendDialog(false)}
        PaperProps={{ sx: componentStyles.dialog.paper }}
      >
        <DialogTitle sx={componentStyles.dialog.title}>Suspendre le projet</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Motif de suspension"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDialog(false)} sx={componentStyles.buttonSecondary}>Annuler</Button>
          <Button onClick={handleSuspendre} variant="contained" disabled={!motif.trim()} sx={componentStyles.buttonPrimary}>Confirmer</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Terminer Dialog */}
      <Dialog
        open={confirmTerminer}
        onClose={() => setConfirmTerminer(false)}
        PaperProps={{ sx: componentStyles.dialog.paper }}
      >
        <DialogTitle sx={componentStyles.dialog.title}>Terminer le projet</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          Confirmer la cloture du projet ? Cette action est irreversible.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmTerminer(false)} sx={componentStyles.buttonSecondary}>Annuler</Button>
          <Button onClick={handleTerminer} variant="contained" sx={componentStyles.buttonSuccess}>Confirmer</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProjetWorkflowActions
