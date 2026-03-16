import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, TextField, Button, Avatar, IconButton, Tooltip, CircularProgress, Chip
} from '@mui/material'
import { Send, Reply, Trash2, MessageCircle, Lock } from 'lucide-react'
import { conventionsAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography, componentStyles } from '@/lib/designSystem'

// ──── Types ────

interface CommentDTO {
  id: number
  conventionId: number
  authorId: number
  authorName: string
  authorInitials: string
  content: string
  commentType: string
  parentCommentId: number | null
  replies: CommentDTO[]
  mentions: number[]
  createdAt: string
  updatedAt: string
}

interface ConventionCommentsCardProps {
  conventionId: number
}

// ──── Helpers ────

const timeAgo = (date: string): string => {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'A l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Il y a ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return d.toLocaleDateString('fr-FR')
}

const typeBadge: Record<string, { label: string; color: string; bg: string }> = {
  COMMENT: { label: 'Commentaire', color: colors.primary[700], bg: colors.primary[50] },
  NOTE_INTERNE: { label: 'Note interne', color: colors.warning[700], bg: colors.warning[50] },
  SYSTEM: { label: 'Systeme', color: colors.neutral[500], bg: colors.neutral[100] },
}

// ──── Single Comment ────

const CommentItem = ({
  comment, currentUserId, onReply, onDelete, depth = 0
}: {
  comment: CommentDTO
  currentUserId: number | undefined
  onReply: (parentId: number) => void
  onDelete: (commentId: number) => void
  depth?: number
}) => {
  const badge = typeBadge[comment.commentType] || typeBadge.COMMENT

  return (
    <Box sx={{ ml: depth * 4, mb: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Avatar sx={{
          width: 32, height: 32, fontSize: typography.sizes.xs,
          bgcolor: comment.commentType === 'SYSTEM' ? colors.neutral[300] : colors.primary[100],
          color: comment.commentType === 'SYSTEM' ? colors.neutral[600] : colors.primary[700],
        }}>
          {comment.authorInitials}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
              {comment.authorName}
            </Typography>
            {comment.commentType !== 'COMMENT' && (
              <Chip label={badge.label} size="small" icon={comment.commentType === 'NOTE_INTERNE' ? <Lock size={10} /> : undefined}
                sx={{ height: 18, fontSize: '10px', bgcolor: badge.bg, color: badge.color, '& .MuiChip-icon': { color: badge.color } }} />
            )}
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              {timeAgo(comment.createdAt)}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {comment.content}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
            <Tooltip title="Repondre">
              <IconButton size="small" onClick={() => onReply(comment.id)}
                sx={{ p: 0.25, color: colors.textSecondary, '&:hover': { color: colors.primary[600] } }}>
                <Reply size={14} />
              </IconButton>
            </Tooltip>
            {currentUserId === comment.authorId && (
              <Tooltip title="Supprimer">
                <IconButton size="small" onClick={() => onDelete(comment.id)}
                  sx={{ p: 0.25, color: colors.textSecondary, '&:hover': { color: colors.danger[600] } }}>
                  <Trash2 size={14} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
      {comment.replies?.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} currentUserId={currentUserId}
              onReply={onReply} onDelete={onDelete} depth={depth + 1} />
          ))}
        </Box>
      )}
    </Box>
  )
}

// ──── Main Component ────

const ConventionCommentsCard = ({ conventionId }: ConventionCommentsCardProps) => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [comments, setComments] = useState<CommentDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState<'COMMENT' | 'NOTE_INTERNE'>('COMMENT')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadComments = useCallback(async () => {
    try {
      setLoading(true)
      const res = await conventionsAPI.getComments(conventionId)
      setComments(res.data?.data || res.data || [])
    } catch { setComments([]) }
    finally { setLoading(false) }
  }, [conventionId])

  useEffect(() => { loadComments() }, [loadComments])

  const handleSubmit = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      await conventionsAPI.addComment(conventionId, {
        content: newComment.trim(),
        commentType,
        parentCommentId: replyTo ?? undefined,
      })
      setNewComment('')
      setReplyTo(null)
      showSuccess('Commentaire ajoute')
      loadComments()
    } catch { showError('Erreur lors de l\'ajout du commentaire') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (commentId: number) => {
    try {
      await conventionsAPI.deleteComment(conventionId, commentId)
      showSuccess('Commentaire supprime')
      loadComments()
    } catch { showError('Erreur lors de la suppression') }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <MessageCircle size={16} color={colors.primary[600]} />
        <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
          Discussion ({comments.length})
        </Typography>
      </Box>

      {/* New comment form */}
      <Box sx={{ mb: 2, p: 1.5, borderRadius: '8px', border: `1px solid ${colors.border}`, bgcolor: colors.surface }}>
        {replyTo && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 1 }}>
            <Reply size={12} color={colors.primary[600]} />
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.primary[600] }}>
              Reponse au commentaire #{replyTo}
            </Typography>
            <Button size="small" onClick={() => setReplyTo(null)}
              sx={{ fontSize: '10px', textTransform: 'none', minWidth: 0, color: colors.textSecondary }}>
              Annuler
            </Button>
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Chip label="Commentaire" size="small" variant={commentType === 'COMMENT' ? 'filled' : 'outlined'}
            onClick={() => setCommentType('COMMENT')}
            sx={{ cursor: 'pointer', fontSize: '11px', ...(commentType === 'COMMENT' ? { bgcolor: colors.primary[50], color: colors.primary[700] } : {}) }} />
          <Chip label="Note interne" size="small" variant={commentType === 'NOTE_INTERNE' ? 'filled' : 'outlined'}
            icon={<Lock size={10} />}
            onClick={() => setCommentType('NOTE_INTERNE')}
            sx={{ cursor: 'pointer', fontSize: '11px', ...(commentType === 'NOTE_INTERNE' ? { bgcolor: colors.warning[50], color: colors.warning[700] } : {}) }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth size="small" multiline maxRows={4}
            placeholder="Ecrire un commentaire..."
            value={newComment} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: typography.sizes.sm } }}
          />
          <IconButton onClick={handleSubmit} disabled={!newComment.trim() || submitting}
            sx={{ ...componentStyles.buttonPrimary, width: 36, height: 36, borderRadius: '8px' }}>
            {submitting ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
          </IconButton>
        </Box>
      </Box>

      {/* Comments list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : comments.length === 0 ? (
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, textAlign: 'center', py: 3 }}>
          Aucun commentaire. Soyez le premier a commenter !
        </Typography>
      ) : (
        <Box>
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} currentUserId={user?.id}
              onReply={setReplyTo} onDelete={handleDelete} />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default ConventionCommentsCard
