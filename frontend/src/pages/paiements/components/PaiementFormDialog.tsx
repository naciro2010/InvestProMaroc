import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material'
import { AttachMoney } from '@mui/icons-material'
import FileUpload from '@/components/ui/FileUpload'
import DecimalInput from '@/components/ui/DecimalInput'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { Paiement, PaiementFormData } from './types'

interface PaiementFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  selectedPaiement: Paiement | null
  formData: PaiementFormData
  onFormDataChange: (data: PaiementFormData) => void
  isSubmitting?: boolean
}

const PaiementFormDialog = ({
  open,
  onClose,
  onSubmit,
  selectedPaiement,
  formData,
  onFormDataChange,
  isSubmitting = false,
}: PaiementFormDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: componentStyles.dialog.paper }}
    >
      <DialogTitle sx={componentStyles.dialog.title}>
        {selectedPaiement ? 'Modifier le Paiement' : 'Nouveau Paiement'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              required
              label="Numero Paiement"
              value={formData.numeroPaiement}
              onChange={(e) => onFormDataChange({ ...formData, numeroPaiement: e.target.value })}
              placeholder="PAI-001"
            />
            <TextField
              fullWidth
              required
              type="date"
              label="Date de Paiement"
              value={formData.datePaiement}
              onChange={(e) => onFormDataChange({ ...formData, datePaiement: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <DecimalInput
              fullWidth
              required
              label="Montant"
              value={formData.montant}
              onChange={(value) => onFormDataChange({ ...formData, montant: value })}
              decimalPlaces={2}
              min={0}
              InputProps={{
                startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              required
              select
              label="Mode de Reglement"
              value={formData.modeReglement}
              onChange={(e) => onFormDataChange({ ...formData, modeReglement: e.target.value })}
            >
              <MenuItem value="VIREMENT">Virement</MenuItem>
              <MenuItem value="CHEQUE">Cheque</MenuItem>
              <MenuItem value="ESPECES">Especes</MenuItem>
              <MenuItem value="CARTE">Carte Bancaire</MenuItem>
              <MenuItem value="PRELEVEMENT">Prelevement</MenuItem>
            </TextField>
          </Stack>

          <TextField
            fullWidth
            required
            label="Beneficiaire"
            value={formData.beneficiaire}
            onChange={(e) => onFormDataChange({ ...formData, beneficiaire: e.target.value })}
          />

          <TextField
            fullWidth
            label="Reference Bancaire"
            value={formData.referenceBancaire}
            onChange={(e) => onFormDataChange({ ...formData, referenceBancaire: e.target.value })}
          />

          <DecimalInput
            fullWidth
            required
            label="Ordre de Paiement (ID)"
            value={formData.ordrePaiementId}
            onChange={(value) => onFormDataChange({ ...formData, ordrePaiementId: value })}
            decimalPlaces={0}
            min={0}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observation"
            value={formData.observation}
            onChange={(e) => onFormDataChange({ ...formData, observation: e.target.value })}
          />

          {selectedPaiement && (
            <Box>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary, mb: 1 }}>
                Pieces jointes
              </Typography>
              <FileUpload typeEntite="PAIEMENT" entiteId={selectedPaiement.id} maxFiles={10} maxFileSize={10} />
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting} sx={componentStyles.buttonSecondary}>Annuler</Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          sx={componentStyles.buttonPrimary}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {selectedPaiement ? 'Modifier' : 'Creer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PaiementFormDialog
