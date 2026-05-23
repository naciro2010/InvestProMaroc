import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material'
import { AttachMoney } from '@mui/icons-material'
import DecimalInput from '@/components/ui/DecimalInput'
import FileUpload from '@/components/ui/FileUpload'
import { colors, componentStyles } from '@/lib/designSystem'
import type { Decompte, DecompteFormData } from './types'

interface DecompteFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  selectedDecompte: Decompte | null
  formData: DecompteFormData
  onFormDataChange: (data: DecompteFormData) => void
  onCalculateNet: () => void
  isSubmitting?: boolean
}

const DecompteFormDialog = ({
  open,
  onClose,
  onSubmit,
  selectedDecompte,
  formData,
  onFormDataChange,
  onCalculateNet,
  isSubmitting = false,
}: DecompteFormDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: componentStyles.dialog.paper }}>
      <DialogTitle sx={componentStyles.dialog.title}>
        {selectedDecompte ? 'Modifier le Décompte' : 'Nouveau Décompte'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              required
              label="Numéro"
              value={formData.numero}
              onChange={(e) => onFormDataChange({ ...formData, numero: e.target.value })}
              placeholder="DEC-001"
            />
            <TextField
              fullWidth
              required
              type="date"
              label="Date"
              value={formData.dateDecompte}
              onChange={(e) => onFormDataChange({ ...formData, dateDecompte: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <DecimalInput
            fullWidth
            required
            label="Montant"
            value={formData.montant}
            onChange={(value) => onFormDataChange({ ...formData, montant: value })}
            onBlur={onCalculateNet}
            min={0}
            decimalPlaces={2}
            InputProps={{
              startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
              endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
            }}
          />

          <DecimalInput
            fullWidth
            label="Montant Retenue"
            value={formData.montantRetenue}
            onChange={(value) => onFormDataChange({ ...formData, montantRetenue: value })}
            onBlur={onCalculateNet}
            min={0}
            decimalPlaces={2}
            InputProps={{
              endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
            }}
            helperText="Retenues: garantie, pénalités, RAS..."
          />

          <TextField
            fullWidth
            label="Net à Payer"
            value={formData.netAPayer}
            InputProps={{
              readOnly: true,
              endAdornment: <InputAdornment position="end">MAD</InputAdornment>,
            }}
            sx={{ bgcolor: colors.neutral[50] }}
          />

          <DecimalInput
            fullWidth
            required
            label="Marché (ID)"
            value={formData.marcheId}
            onChange={(value) => onFormDataChange({ ...formData, marcheId: value })}
            min={0}
            decimalPlaces={0}
            helperText="ID du marché associé"
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observation"
            value={formData.observation}
            onChange={(e) => onFormDataChange({ ...formData, observation: e.target.value })}
          />

          {selectedDecompte && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Pièces jointes
              </Typography>
              <FileUpload
                typeEntite="DECOMPTE"
                entiteId={selectedDecompte.id}
                maxFiles={10}
                maxFileSize={10}
              />
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
          {selectedDecompte ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DecompteFormDialog
