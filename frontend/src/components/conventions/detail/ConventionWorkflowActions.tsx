import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import {
  Send,
  CheckCircle,
  Cancel,
  PlayArrow,
  Stop,
  Flag,
  Undo,
  LockOpen,
} from '@mui/icons-material'
import { conventionsAPI } from '@/lib/api'
import { colors } from '@/lib/designSystem'

interface ConventionWorkflowActionsProps {
  conventionId: number
  statut: string
  userId: number | undefined
  isAdmin: boolean
  isManager: boolean
  onSuccess: (message: string) => void
  onError: (message: string) => void
  onReload: () => void
}

const ConventionWorkflowActions = ({
  conventionId,
  statut,
  userId,
  isAdmin,
  isManager,
  onSuccess,
  onError,
  onReload,
}: ConventionWorkflowActionsProps) => {
  const [loading, setLoading] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectMotif, setRejectMotif] = useState('')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelMotif, setCancelMotif] = useState('')
  const [devaliderDialogOpen, setDevaliderDialogOpen] = useState(false)

  const executeAction = async (action: () => Promise<void>, successMsg: string, errorMsg: string) => {
    try {
      setLoading(true)
      await action()
      onSuccess(successMsg)
      onReload()
    } catch {
      onError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleSoumettre = () =>
    executeAction(
      () => conventionsAPI.soumettre(conventionId).then(() => {}),
      'Convention soumise avec succes',
      'Erreur lors de la soumission'
    )

  const handleValider = () => {
    if (!userId) return
    executeAction(
      () => conventionsAPI.valider(conventionId, userId).then(() => {}),
      'Convention validee avec succes',
      'Erreur lors de la validation'
    )
  }

  const handleRejeter = async () => {
    if (!rejectMotif.trim()) return
    try {
      setLoading(true)
      await conventionsAPI.rejeter(conventionId, rejectMotif)
      onSuccess('Convention rejetee')
      setRejectDialogOpen(false)
      setRejectMotif('')
      onReload()
    } catch {
      onError('Erreur lors du rejet')
    } finally {
      setLoading(false)
    }
  }

  const handleMettreEnCours = () =>
    executeAction(
      () => conventionsAPI.mettreEnCours(conventionId).then(() => {}),
      'Convention mise en execution',
      'Erreur lors de la mise en execution'
    )

  const handleAchever = () =>
    executeAction(
      () => conventionsAPI.achever(conventionId).then(() => {}),
      'Convention achevee avec succes',
      "Erreur lors de l'achevement"
    )

  const handleAnnuler = async () => {
    if (!cancelMotif.trim()) return
    try {
      setLoading(true)
      await conventionsAPI.annuler(conventionId, cancelMotif)
      onSuccess('Convention annulee')
      setCancelDialogOpen(false)
      setCancelMotif('')
      onReload()
    } catch {
      onError("Erreur lors de l'annulation")
    } finally {
      setLoading(false)
    }
  }

  const handleRemettreEnBrouillon = () =>
    executeAction(
      () => conventionsAPI.remettreEnBrouillon(conventionId).then(() => {}),
      'Convention remise en brouillon',
      'Erreur lors de la remise en brouillon'
    )

  const handleDevalider = async () => {
    try {
      setLoading(true)
      await conventionsAPI.devalider(conventionId)
      const targetStatut = statut === 'EN_EXECUTION' || statut === 'EN_COURS' ? 'VALIDEE' : 'SOUMIS'
      onSuccess(`Convention devalidee avec succes (retour a ${targetStatut})`)
      setDevaliderDialogOpen(false)
      onReload()
    } catch {
      onError('Erreur lors de la devalidation')
    } finally {
      setLoading(false)
    }
  }

  const canDevalider = isAdmin && (
    statut === 'VALIDEE' || statut === 'VALIDE' ||
    statut === 'EN_EXECUTION' || statut === 'EN_COURS'
  )

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {loading && <CircularProgress size={20} />}

        {statut === 'BROUILLON' && (
          <Tooltip title="Soumettre pour validation">
            <Button
              variant="contained"
              size="small"
              startIcon={<Send />}
              onClick={handleSoumettre}
              disabled={loading}
              sx={{
                bgcolor: colors.primary[600],
                '&:hover': { bgcolor: colors.primary[700] },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Soumettre
            </Button>
          </Tooltip>
        )}

        {statut === 'SOUMIS' && (isAdmin || isManager) && (
          <>
            <Tooltip title="Valider la convention">
              <Button
                variant="contained"
                size="small"
                startIcon={<CheckCircle />}
                onClick={handleValider}
                disabled={loading}
                sx={{
                  bgcolor: colors.success[600],
                  '&:hover': { bgcolor: colors.success[700] },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Valider
              </Button>
            </Tooltip>
            <Tooltip title="Rejeter la convention">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Cancel />}
                onClick={() => setRejectDialogOpen(true)}
                disabled={loading}
                sx={{
                  borderColor: colors.danger[300],
                  color: colors.danger[600],
                  '&:hover': { borderColor: colors.danger[600], bgcolor: colors.danger[25] },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Rejeter
              </Button>
            </Tooltip>
          </>
        )}

        {statut === 'REJETE' && (
          <Tooltip title="Remettre en brouillon pour correction">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Undo />}
              onClick={handleRemettreEnBrouillon}
              disabled={loading}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Remettre en brouillon
            </Button>
          </Tooltip>
        )}

        {(statut === 'VALIDEE' || statut === 'VALIDE') && (
          <Tooltip title="Demarrer l'execution">
            <Button
              variant="contained"
              size="small"
              startIcon={<PlayArrow />}
              onClick={handleMettreEnCours}
              disabled={loading}
              sx={{
                bgcolor: colors.info[600],
                '&:hover': { bgcolor: colors.info[700] },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Demarrer
            </Button>
          </Tooltip>
        )}

        {(statut === 'EN_EXECUTION' || statut === 'EN_COURS') && (
          <>
            <Tooltip title="Marquer comme achevee">
              <Button
                variant="contained"
                size="small"
                startIcon={<Flag />}
                onClick={handleAchever}
                disabled={loading}
                sx={{
                  bgcolor: colors.success[600],
                  '&:hover': { bgcolor: colors.success[700] },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Achever
              </Button>
            </Tooltip>
            <Tooltip title="Annuler la convention">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Stop />}
                onClick={() => setCancelDialogOpen(true)}
                disabled={loading}
                sx={{
                  borderColor: colors.danger[300],
                  color: colors.danger[600],
                  '&:hover': { borderColor: colors.danger[600], bgcolor: colors.danger[25] },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Annuler
              </Button>
            </Tooltip>
          </>
        )}

        {canDevalider && (
          <Tooltip title="Devalider la convention (action admin)">
            <Button
              variant="outlined"
              size="small"
              startIcon={<LockOpen />}
              onClick={() => setDevaliderDialogOpen(true)}
              disabled={loading}
              sx={{
                borderColor: colors.warning[400],
                color: colors.warning[700],
                bgcolor: colors.warning[50],
                '&:hover': {
                  borderColor: colors.warning[600],
                  bgcolor: colors.warning[100],
                },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Devalider (Admin)
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.danger[700], fontWeight: 600 }}>
          Rejeter la convention
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
            La convention sera remise en brouillon pour correction.
          </Alert>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Motif du rejet"
            value={rejectMotif}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRejectMotif(e.target.value)}
            placeholder="Decrivez les raisons du rejet..."
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setRejectDialogOpen(false); setRejectMotif('') }} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleRejeter}
            disabled={loading || !rejectMotif.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : <Cancel />}
            sx={{ bgcolor: colors.danger[600], '&:hover': { bgcolor: colors.danger[700] } }}
          >
            Confirmer le rejet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colors.danger[700], fontWeight: 600 }}>
          Annuler la convention
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, mt: 1 }}>
            Cette action est irreversible. La convention sera definitivement annulee.
          </Alert>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Motif de l'annulation"
            value={cancelMotif}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCancelMotif(e.target.value)}
            placeholder="Decrivez les raisons de l'annulation..."
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setCancelDialogOpen(false); setCancelMotif('') }} disabled={loading}>
            Retour
          </Button>
          <Button
            variant="contained"
            onClick={handleAnnuler}
            disabled={loading || !cancelMotif.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : <Stop />}
            sx={{ bgcolor: colors.danger[600], '&:hover': { bgcolor: colors.danger[700] } }}
          >
            Confirmer l'annulation
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConventionWorkflowActions
