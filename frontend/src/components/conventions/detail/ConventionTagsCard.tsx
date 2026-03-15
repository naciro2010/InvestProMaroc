import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Chip, IconButton, Tooltip, TextField, Button, Popover, CircularProgress
} from '@mui/material'
import { Tag, Plus, X } from 'lucide-react'
import { conventionTagsAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography } from '@/lib/designSystem'

interface TagDTO {
  id: number
  name: string
  color: string
  description: string | null
  conventionCount: number
}

interface ConventionTagsCardProps {
  conventionId: number
  canEdit?: boolean
}

const ConventionTagsCard = ({ conventionId, canEdit = true }: ConventionTagsCardProps) => {
  const { showSuccess, showError } = useToast()
  const [assignedTags, setAssignedTags] = useState<TagDTO[]>([])
  const [allTags, setAllTags] = useState<TagDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6e5dc6')
  const [creating, setCreating] = useState(false)

  const loadTags = useCallback(async () => {
    try {
      setLoading(true)
      const [assignedRes, allRes] = await Promise.all([
        conventionTagsAPI.getForConvention(conventionId),
        conventionTagsAPI.getAll(),
      ])
      setAssignedTags(assignedRes.data?.data || assignedRes.data || [])
      setAllTags(allRes.data?.data || allRes.data || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [conventionId])

  useEffect(() => { loadTags() }, [loadTags])

  const handleAssign = async (tagId: number) => {
    try {
      await conventionTagsAPI.assign(conventionId, tagId)
      showSuccess('Tag assigne')
      loadTags()
    } catch { showError('Erreur') }
  }

  const handleRemove = async (tagId: number) => {
    try {
      await conventionTagsAPI.remove(conventionId, tagId)
      showSuccess('Tag retire')
      loadTags()
    } catch { showError('Erreur') }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    setCreating(true)
    try {
      const res = await conventionTagsAPI.create({ name: newTagName.trim(), color: newTagColor })
      const tag = res.data?.data || res.data
      await conventionTagsAPI.assign(conventionId, tag.id)
      setNewTagName('')
      showSuccess('Tag cree et assigne')
      loadTags()
    } catch { showError('Erreur lors de la creation du tag') }
    finally { setCreating(false) }
  }

  const availableTags = allTags.filter(t => !assignedTags.some(at => at.id === t.id))

  const tagColors = ['#c9372c', '#0c66e4', '#6e5dc6', '#1f845a', '#227d9b', '#946f00']

  if (loading) return <CircularProgress size={16} />

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
      <Tag size={14} color={colors.textSecondary} />

      {assignedTags.map(tag => (
        <Chip key={tag.id} label={tag.name} size="small"
          onDelete={canEdit ? () => handleRemove(tag.id) : undefined}
          deleteIcon={<X size={12} />}
          sx={{
            height: 22, fontSize: '11px', fontWeight: typography.weights.medium,
            bgcolor: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}40`,
            border: `1px solid`, '& .MuiChip-deleteIcon': { color: tag.color, fontSize: 12 },
          }}
        />
      ))}

      {canEdit && (
        <>
          <Tooltip title="Ajouter un tag">
            <IconButton size="small" onClick={e => setAnchorEl(e.currentTarget)}
              sx={{ width: 22, height: 22, border: `1px dashed ${colors.border}`, borderRadius: '4px' }}>
              <Plus size={12} color={colors.textSecondary} />
            </IconButton>
          </Tooltip>

          <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            <Box sx={{ p: 2, width: 260 }}>
              <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, mb: 1 }}>
                Tags disponibles
              </Typography>

              {availableTags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                  {availableTags.map(tag => (
                    <Chip key={tag.id} label={tag.name} size="small" clickable
                      onClick={() => { handleAssign(tag.id); setAnchorEl(null) }}
                      sx={{
                        height: 22, fontSize: '11px', cursor: 'pointer',
                        bgcolor: `${tag.color}15`, color: tag.color,
                        '&:hover': { bgcolor: `${tag.color}30` },
                      }}
                    />
                  ))}
                </Box>
              )}

              <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, mb: 0.5 }}>
                Creer un nouveau tag
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                {tagColors.map(c => (
                  <Box key={c} onClick={() => setNewTagColor(c)}
                    sx={{
                      width: 20, height: 20, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                      border: newTagColor === c ? '2px solid black' : '2px solid transparent',
                    }} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <TextField size="small" placeholder="Nom du tag" value={newTagName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTagName(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleCreateTag() }}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: '12px' } }} />
                <Button size="small" variant="contained" disabled={!newTagName.trim() || creating}
                  onClick={handleCreateTag}
                  sx={{ minWidth: 0, px: 1, fontSize: '11px', textTransform: 'none' }}>
                  OK
                </Button>
              </Box>
            </Box>
          </Popover>
        </>
      )}
    </Box>
  )
}

export default ConventionTagsCard
