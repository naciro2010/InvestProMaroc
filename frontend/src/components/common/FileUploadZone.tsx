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
  LinearProgress,
} from '@mui/material'
import {
  CloudUpload,
  Delete,
  InsertDriveFile,
  Image as ImageIcon,
  PictureAsPdf,
} from '@mui/icons-material'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  progress?: number
}

interface FileUploadZoneProps {
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  label?: string
}

const FileUploadZone = ({
  files,
  onFilesChange,
  maxFiles = 10,
  maxSizeMB = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
  label = 'Pièces jointes',
}: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon color="primary" />
    if (type === 'application/pdf') return <PictureAsPdf color="error" />
    return <InsertDriveFile color="action" />
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Le fichier ${file.name} dépasse la taille maximale de ${maxSizeMB}MB`
    }

    // Check file type
    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0]
        return file.type.startsWith(baseType)
      }
      return file.type === type
    })

    if (!isAccepted) {
      return `Le type de fichier ${file.name} n'est pas accepté`
    }

    return null
  }

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return

      const newFiles: UploadedFile[] = []
      const errors: string[] = []

      // Check max files limit
      if (files.length + fileList.length > maxFiles) {
        setError(`Vous ne pouvez télécharger que ${maxFiles} fichiers maximum`)
        return
      }

      Array.from(fileList).forEach((file) => {
        const validationError = validateFile(file)
        if (validationError) {
          errors.push(validationError)
          return
        }

        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
        }

        newFiles.push(uploadedFile)

        // Simulate upload with FileReader
        const reader = new FileReader()
        reader.onload = (e) => {
          uploadedFile.url = e.target?.result as string
          uploadedFile.progress = 100
          onFilesChange([...files, ...newFiles])
        }
        reader.readAsDataURL(file)
      })

      if (errors.length > 0) {
        setError(errors[0])
      } else {
        setError(null)
        onFilesChange([...files, ...newFiles])
      }
    },
    [files, maxFiles, onFilesChange]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleRemove = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id))
    setError(null)
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
        {label}
      </Typography>

      {/* Upload Zone */}
      <Paper
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging ? 'action.hover' : 'background.paper',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />

        <Typography variant="body1" gutterBottom>
          Glissez-déposez vos fichiers ici
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          ou cliquez pour parcourir
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Chip
            label={`Max ${maxFiles} fichiers`}
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip
            label={`Max ${maxSizeMB}MB par fichier`}
            size="small"
          />
        </Box>
      </Paper>

      {/* Error Message */}
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file) => (
            <ListItem
              key={file.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <Box sx={{ mr: 2 }}>{getFileIcon(file.type)}</Box>

              <ListItemText
                primary={file.name}
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                    {file.progress !== undefined && file.progress < 100 && (
                      <LinearProgress
                        variant="determinate"
                        value={file.progress}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                }
              />

              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleRemove(file.id)} size="small">
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {files.length} / {maxFiles} fichiers
      </Typography>
    </Box>
  )
}

export default FileUploadZone
