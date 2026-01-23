import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material'
import {
  CloudUpload,
  Delete,
  Download,
  Description,
  Edit,
  Close,
} from '@mui/icons-material'
import { piecesJointesAPI } from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'

interface FileUploadProps {
  typeEntite: string
  entiteId: number | null
  readonly?: boolean
  maxFiles?: number
  maxFileSize?: number // en MB
  acceptedFileTypes?: string[]
}

interface PieceJointe {
  id: number
  nom: string
  nomOriginal: string
  typeMime: string
  taille: number
  tailleFormatee: string
  extension: string
  description: string | null
  downloadUrl: string
  dateUpload: string
  uploadedByName: string | null
}

const FileUpload = ({
  typeEntite,
  entiteId,
  readonly = false,
  maxFiles = 10,
  maxFileSize = 10, // MB
  acceptedFileTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}: FileUploadProps) => {
  const [files, setFiles] = useState<PieceJointe[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [editDialog, setEditDialog] = useState<{ open: boolean; file: PieceJointe | null }>({
    open: false,
    file: null
  })
  const [description, setDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (entiteId) {
      loadFiles()
    }
  }, [entiteId, typeEntite])

  const loadFiles = async () => {
    if (!entiteId) return

    setLoading(true)
    try {
      const { data } = await piecesJointesAPI.getAll(typeEntite, entiteId)
      setFiles(data.data || [])
    } catch (error) {
      console.error('Erreur chargement fichiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || !entiteId || readonly) return

    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} fichiers autorisés`)
      return
    }

    setUploading(true)

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]

      // Vérifier la taille
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`${file.name}: Fichier trop volumineux (max ${maxFileSize} MB)`)
        continue
      }

      // Vérifier le type
      if (acceptedFileTypes.length > 0 && !acceptedFileTypes.includes(file.type)) {
        alert(`${file.name}: Type de fichier non autorisé`)
        continue
      }

      try {
        await piecesJointesAPI.upload(file, typeEntite, entiteId)
      } catch (error: unknown) {
        console.error('Erreur upload:', error)
        alert(`Erreur upload ${file.name}: ${getErrorMessage(error, 'Erreur lors du téléchargement')}`)
      }
    }

    setUploading(false)
    await loadFiles()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDownload = async (file: PieceJointe) => {
    try {
      const { data } = await piecesJointesAPI.download(file.id)

      // Créer un blob et télécharger
      const blob = new Blob([data], { type: file.typeMime })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.nomOriginal
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      alert('Erreur lors du téléchargement du fichier')
    }
  }

  const handleDelete = async (fileId: number) => {
    if (!confirm('Confirmer la suppression de ce fichier ?')) return

    try {
      await piecesJointesAPI.delete(fileId)
      await loadFiles()
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression du fichier')
    }
  }

  const handleEditDescription = (file: PieceJointe) => {
    setDescription(file.description || '')
    setEditDialog({ open: true, file })
  }

  const handleSaveDescription = async () => {
    if (!editDialog.file) return

    try {
      await piecesJointesAPI.update(editDialog.file.id, { description })
      setEditDialog({ open: false, file: null })
      await loadFiles()
    } catch (error) {
      console.error('Erreur mise à jour:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const getFileIcon = (extension: string) => {
    // Retourner une icône selon l'extension
    return <Description />
  }

  if (!entiteId) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
        <Typography color="text.secondary" align="center">
          Enregistrez d'abord l'élément pour pouvoir ajouter des pièces jointes
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pièces jointes ({files.length}/{maxFiles})
      </Typography>

      {/* Zone de drop */}
      {!readonly && (
        <Paper
          sx={{
            p: 3,
            mb: 2,
            border: '2px dashed',
            borderColor: dragOver ? 'primary.main' : 'grey.300',
            bgcolor: dragOver ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="body1" gutterBottom>
              Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Maximum {maxFileSize} MB par fichier • {maxFiles} fichiers max
            </Typography>
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => handleFileSelect(e.target.files)}
            accept={acceptedFileTypes.join(',')}
          />
        </Paper>
      )}

      {/* Barre de progression */}
      {uploading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Liste des fichiers */}
      {loading ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Chargement...</Typography>
        </Box>
      ) : files.length === 0 ? (
        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography color="text.secondary" align="center">
            Aucune pièce jointe
          </Typography>
        </Paper>
      ) : (
        <List>
          {files.map((file) => (
            <ListItem
              key={file.id}
              sx={{
                mb: 1,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Box sx={{ mr: 2 }}>{getFileIcon(file.extension)}</Box>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {file.nomOriginal}
                    <Chip label={file.extension.toUpperCase()} size="small" />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      {file.tailleFormatee} • {new Date(file.dateUpload).toLocaleDateString('fr-FR')}
                      {file.uploadedByName && ` • par ${file.uploadedByName}`}
                    </Typography>
                    {file.description && (
                      <Typography variant="caption" color="text.secondary">
                        {file.description}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton size="small" onClick={() => handleDownload(file)} title="Télécharger">
                  <Download />
                </IconButton>
                {!readonly && (
                  <>
                    <IconButton size="small" onClick={() => handleEditDescription(file)} title="Modifier">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(file.id)} color="error" title="Supprimer">
                      <Delete />
                    </IconButton>
                  </>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Dialog d'édition de description */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, file: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          Modifier la description
          <IconButton
            onClick={() => setEditDialog({ open: false, file: null })}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, file: null })}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveDescription}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default FileUpload
