import {
  Box,
  Typography,
  Button,
} from '@mui/material'
import { SkipNext } from '@mui/icons-material'
import FileUpload from '../../../components/ui/FileUpload'

interface Step3Props {
  entityId: number | null
  typeEntite: string
  onSkip: () => void
}

const Step3PiecesJointes = ({ entityId, typeEntite, onSkip }: Step3Props) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pièces jointes
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Vous pouvez ajouter des documents relatifs à cette convention (PDF, images, documents Word, etc.).
        Cette étape est optionnelle, vous pourrez ajouter des pièces jointes plus tard.
      </Typography>

      <FileUpload
        typeEntite={typeEntite}
        entiteId={entityId}
        maxFiles={10}
        maxFileSize={10}
        acceptedFileTypes={[
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]}
      />

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<SkipNext />}
          onClick={onSkip}
        >
          Passer cette étape
        </Button>
      </Box>
    </Box>
  )
}

export default Step3PiecesJointes
