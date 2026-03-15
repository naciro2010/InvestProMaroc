import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Avatar, AvatarGroup, Tooltip, Button, CircularProgress
} from '@mui/material'
import { Bell, BellOff } from 'lucide-react'
import { conventionsAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography } from '@/lib/designSystem'

interface FollowerDTO {
  id: number
  conventionId: number
  userId: number
  userName: string
  userInitials: string
  subscriptionType: string
  createdAt: string
}

interface ConventionFollowersCardProps {
  conventionId: number
}

const ConventionFollowersCard = ({ conventionId }: ConventionFollowersCardProps) => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [followers, setFollowers] = useState<FollowerDTO[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const loadFollowers = useCallback(async () => {
    try {
      setLoading(true)
      const [followersRes, followingRes] = await Promise.all([
        conventionsAPI.getFollowers(conventionId),
        conventionsAPI.isFollowing(conventionId),
      ])
      setFollowers(followersRes.data?.data || followersRes.data || [])
      setIsFollowing(followingRes.data?.data ?? false)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [conventionId])

  useEffect(() => { loadFollowers() }, [loadFollowers])

  const toggleFollow = async () => {
    setToggling(true)
    try {
      if (isFollowing) {
        await conventionsAPI.unfollowMe(conventionId)
        showSuccess('Desabonne')
      } else {
        await conventionsAPI.followMe(conventionId)
        showSuccess('Vous suivez cette convention')
      }
      loadFollowers()
    } catch { showError('Erreur') }
    finally { setToggling(false) }
  }

  if (loading) return <CircularProgress size={16} />

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Follower avatars */}
      {followers.length > 0 && (
        <AvatarGroup max={5} sx={{
          '& .MuiAvatar-root': {
            width: 26, height: 26, fontSize: '10px', fontWeight: typography.weights.semibold,
            bgcolor: colors.primary[100], color: colors.primary[700], border: `2px solid ${colors.surface}`,
          },
        }}>
          {followers.map(f => (
            <Tooltip key={f.id} title={`${f.userName} (${f.subscriptionType === 'ALL' ? 'Tout' : f.subscriptionType === 'WORKFLOW_ONLY' ? 'Workflow' : 'Commentaires'})`}>
              <Avatar>{f.userInitials}</Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
      )}

      {/* Follow/Unfollow button */}
      <Tooltip title={isFollowing ? 'Se desabonner' : 'Suivre cette convention'}>
        <Button size="small" variant={isFollowing ? 'outlined' : 'contained'} disabled={toggling}
          onClick={toggleFollow}
          startIcon={toggling ? <CircularProgress size={12} color="inherit" /> :
            (isFollowing ? <BellOff size={14} /> : <Bell size={14} />)}
          sx={{
            height: 28, fontSize: '11px', textTransform: 'none', borderRadius: '6px',
            ...(isFollowing
              ? { borderColor: colors.border, color: colors.textSecondary }
              : { bgcolor: colors.primary[600], '&:hover': { bgcolor: colors.primary[700] } }),
          }}>
          {isFollowing ? 'Suivi' : 'Suivre'}
        </Button>
      </Tooltip>

      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
        {followers.length} abonne{followers.length !== 1 ? 's' : ''}
      </Typography>
    </Box>
  )
}

export default ConventionFollowersCard
