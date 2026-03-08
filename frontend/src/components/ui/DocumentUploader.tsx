import { useState, useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Button,
  Alert,
} from '@mui/material'
import {
  CloudUpload,
  Delete,
  InsertDriveFile,
  Download,
} from '@mui/icons-material'
import { colors, borders, transitions } from '@/lib/designSystem'

interface Document {
  id?: number
  nom: string
  nomOriginal: string
  typeMime: string
  taille: number
  dateUpload?: string
  file?: File
}

interface DocumentUploaderProps {
  documents: Document[]
  onDocumentsChange: (documents: Document[]) => void
  maxSize?: number // en MB
  acceptedTypes?: string[]
  disabled?: boolean
}

const DocumentUploader = ({
  documents,
  onDocumentsChange,
  maxSize = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'],
  disabled = false,
}: DocumentUploaderProps) => {
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `Le fichier "${file.name}" dépasse la taille maximale de ${maxSize}MB`
    }

    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(fileExt)) {
      return `Le type de fichier "${fileExt}" n'est pas accepté`
    }

    return null
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || disabled) return

    setError('')
    const newDocuments: Document[] = []
    let hasError = false

    Array.from(files).forEach((file) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        hasError = true
        return
      }

      newDocuments.push({
        nom: file.name,
        nomOriginal: file.name,
        typeMime: file.type,
        taille: file.size,
        file,
      })
    })

    if (!hasError && newDocuments.length > 0) {
      onDocumentsChange([...documents, ...newDocuments])
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleRemove = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index)
    onDocumentsChange(newDocuments)
  }

  return (
    <Box>
      {/* Zone de drop */}
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          border: dragActive
            ? `2px dashed ${colors.primary[400]}`
            : `2px dashed ${colors.neutral[300]}`,
          backgroundColor: dragActive
            ? colors.primary[25]
            : disabled
              ? colors.neutral[50]
              : colors.neutral[25],
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: `all ${transitions.normal}`,
          boxShadow: 'none',
          '&:hover': !disabled
            ? {
                borderColor: colors.primary[400],
                backgroundColor: colors.primary[25],
              }
            : {},
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <CloudUpload
            sx={{
              fontSize: 48,
              color: disabled ? colors.textDisabled : colors.primary[500],
              mb: 2,
            }}
          />
          <Typography variant="h6" gutterBottom>
            Glissez-déposez vos fichiers ici
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }} gutterBottom>
            ou
          </Typography>
          <Button
            variant="outlined"
            component="span"
            disabled={disabled}
            sx={{ mt: 1 }}
          >
            Parcourir les fichiers
          </Button>
          <Typography
            variant="caption"
            display="block"
            sx={{ mt: 2, color: colors.textSecondary }}
          >
            Types acceptés: {acceptedTypes.join(', ')} | Taille max: {maxSize}MB
          </Typography>
        </label>
      </Paper>

      {/* Messages d'erreur */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Liste des documents */}
      {documents.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Fichiers ({documents.length})
          </Typography>
          <List>
            {documents.map((doc, index) => (
              <ListItem
                key={index}
                sx={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: borders.radius.md,
                  mb: 1,
                  backgroundColor: colors.surface,
                }}
              >
                <InsertDriveFile sx={{ mr: 2, color: colors.primary[500] }} />
                <ListItemText
                  primary={doc.nomOriginal}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={formatFileSize(doc.taille)}
                        size="small"
                        variant="outlined"
                      />
                      {doc.dateUpload && (
                        <Chip
                          label={new Date(doc.dateUpload).toLocaleDateString('fr-FR')}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {doc.id && (
                    <IconButton
                      edge="end"
                      aria-label="télécharger"
                      sx={{ mr: 1 }}
                      onClick={() => {
                        // TODO: Implémenter le téléchargement
                        console.log('Télécharger:', doc.id)
                      }}
                    >
                      <Download />
                    </IconButton>
                  )}
                  <IconButton
                    edge="end"
                    aria-label="supprimer"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  )
}

export default DocumentUploader
