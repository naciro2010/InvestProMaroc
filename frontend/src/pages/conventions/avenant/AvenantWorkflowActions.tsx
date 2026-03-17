import { Box, Button, CircularProgress } from '@mui/material'
import { Send, CheckCircle, Cancel, Edit } from '@mui/icons-material'

interface AvenantWorkflowActionsProps {
  canSoumettre: boolean
  canValider: boolean
  canEdit: boolean
  workflowLoading: boolean
  onSoumettre: () => void
  onValider: () => void
  onReject: () => void
  onEdit: () => void
}

const AvenantWorkflowActions = ({
  canSoumettre, canValider, canEdit, workflowLoading,
  onSoumettre, onValider, onReject, onEdit,
}: AvenantWorkflowActionsProps) => (
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    {workflowLoading && <CircularProgress size={20} />}
    {canSoumettre && (
      <Button variant="contained" color="primary" size="small" startIcon={<Send />} onClick={onSoumettre} disabled={workflowLoading}>
        Soumettre
      </Button>
    )}
    {canValider && (
      <>
        <Button variant="contained" color="success" size="small" startIcon={<CheckCircle />} onClick={onValider} disabled={workflowLoading}>
          Valider
        </Button>
        <Button variant="outlined" color="error" size="small" startIcon={<Cancel />} onClick={onReject} disabled={workflowLoading}>
          Rejeter
        </Button>
      </>
    )}
    {canEdit && (
      <Button variant="outlined" size="small" startIcon={<Edit />} onClick={onEdit}>
        Modifier
      </Button>
    )}
  </Box>
)

export default AvenantWorkflowActions
