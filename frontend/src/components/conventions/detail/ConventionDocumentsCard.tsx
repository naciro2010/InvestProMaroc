import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, Typography, Button, IconButton, Tooltip, CircularProgress, Chip, TextField
} from '@mui/material'
import { FileText, Upload, Download, Trash2, File, Image, FileSpreadsheet } from 'lucide-react'
import { piecesJointesAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography } from '@/lib/designSystem'

interface PieceJointeDTO {
  id: number
  nom: string
  nomOriginal: string
  typeMime: string
  taille: number
  description: string | null
  typeEntite: string
  entiteId: number
  dateUpload: string
  uploadedByName: string | null
}

interface ConventionDocumentsCardProps {
  conventionId: number
  canEdit?: boolean
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

const getFileIcon = (mime: string) => {
  if (mime.startsWith('image/')) return <Image size={16} color={colors.success[600]} />
  if (mime.includes('spreadsheet') || mime.includes('excel')) return <FileSpreadsheet size={16} color={colors.success[600]} />
  if (mime.includes('pdf')) return <FileText size={16} color={colors.danger[600]} />
  return <File size={16} color={colors.primary[600]} />
}

const ConventionDocumentsCard = ({ conventionId, canEdit = true }: ConventionDocumentsCardProps) => {
  const { showSuccess, showError } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<PieceJointeDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [description, setDescription] = useState('')

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const res = await piecesJointesAPI.getAll('CONVENTION', conventionId)
      setDocuments(res.data?.data || res.data || [])
    } catch { setDocuments([]) }
    finally { setLoading(false) }
  }, [conventionId])

  useEffect(() => { loadDocuments() }, [loadDocuments])

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      await piecesJointesAPI.upload(file, 'CONVENTION', conventionId, description || undefined)
      showSuccess('Document telecharge')
      setDescription('')
      loadDocuments()
    } catch { showError('Erreur lors du telechargement') }
    finally { setUploading(false) }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDownload = async (doc: PieceJointeDTO) => {
    try {
      const res = await piecesJointesAPI.download(doc.id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', doc.nomOriginal)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch { showError('Erreur de telechargement') }
  }

  const handleDelete = async (docId: number) => {
    try {
      await piecesJointesAPI.delete(docId)
      showSuccess('Document supprime')
      loadDocuments()
    } catch { showError('Erreur de suppression') }
  }

  return (
    <Box>
      {/* Upload section */}
      {canEdit && (
        <Box sx={{ mb: 2, p: 1.5, borderRadius: '8px', border: `1px dashed ${colors.border}`, bgcolor: colors.neutral[50], textAlign: 'center' }}>
          <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <TextField size="small" placeholder="Description (optionnelle)" value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              sx={{ flex: 1, maxWidth: 300, '& .MuiOutlinedInput-root': { fontSize: typography.sizes.sm } }} />
            <Button size="small" variant="contained" startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <Upload size={14} />}
              onClick={() => fileInputRef.current?.click()} disabled={uploading}
              sx={{ textTransform: 'none', fontSize: typography.sizes.sm }}>
              Ajouter un fichier
            </Button>
          </Box>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            PDF, images, feuilles de calcul, documents... (max 10 MB)
          </Typography>
        </Box>
      )}

      {/* Documents list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : documents.length === 0 ? (
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, textAlign: 'center', py: 3 }}>
          Aucun document attache
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {documents.map(doc => (
            <Box key={doc.id} sx={{
              display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: '6px',
              border: `1px solid ${colors.border}`, '&:hover': { bgcolor: colors.neutral[50] },
            }}>
              {getFileIcon(doc.typeMime)}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.nomOriginal}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                    {formatSize(doc.taille)}
                  </Typography>
                  {doc.description && (
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                      - {doc.description}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                    {new Date(doc.dateUpload).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
              </Box>
              <Chip label={doc.typeMime.split('/')[1]?.toUpperCase() || 'FILE'} size="small"
                sx={{ height: 20, fontSize: '10px', bgcolor: colors.neutral[100], color: colors.neutral[600] }} />
              <Tooltip title="Telecharger">
                <IconButton size="small" onClick={() => handleDownload(doc)}
                  sx={{ color: colors.primary[600] }}>
                  <Download size={14} />
                </IconButton>
              </Tooltip>
              {canEdit && (
                <Tooltip title="Supprimer">
                  <IconButton size="small" onClick={() => handleDelete(doc.id)}
                    sx={{ color: colors.danger[600] }}>
                    <Trash2 size={14} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default ConventionDocumentsCard
