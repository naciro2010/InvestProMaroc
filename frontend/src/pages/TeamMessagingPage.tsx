import { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material'
import { Send } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import ControlPanel from '@/components/core/ControlPanel'
import { collaborationAPI, ConversationItem, TeamMessage } from '@/lib/collaborationAPI'
import api from '@/lib/api'
import { colors, typography, borders, shadows, spacing, componentStyles } from '@/lib/designSystem'

interface SimpleUser { id: number; fullName: string; username: string }

const TeamMessagingPage = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [users, setUsers] = useState<SimpleUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [messages, setMessages] = useState<TeamMessage[]>([])
  const [newMessage, setNewMessage] = useState('')

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId])

  const fetchConversations = async () => {
    const res = await collaborationAPI.getConversations()
    setConversations(res.data.data)
  }

  const fetchUsers = async () => {
    const res = await api.get('/users')
    const list = Array.isArray(res.data?.data) ? res.data.data : res.data
    setUsers((list || []).map((u: { id: number; fullName?: string; username: string }) => ({ id: u.id, fullName: u.fullName || u.username, username: u.username })))
  }

  const fetchMessages = async (userId: number) => {
    const res = await collaborationAPI.getConversationWith(userId)
    setMessages(res.data.data)
  }

  useEffect(() => {
    fetchConversations()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (!selectedUserId && conversations.length > 0) setSelectedUserId(conversations[0].userId)
  }, [conversations, selectedUserId])

  useEffect(() => {
    if (!selectedUserId) return
    fetchMessages(selectedUserId)
  }, [selectedUserId])

  const handleSend = async () => {
    if (!selectedUserId || !newMessage.trim()) return
    await collaborationAPI.sendMessage(selectedUserId, newMessage.trim())
    setNewMessage('')
    fetchMessages(selectedUserId)
    fetchConversations()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', backgroundColor: colors.background }}>
        <ControlPanel
          breadcrumbs={[{ label: 'Messagerie' }]}
          hideBottomRow
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: spacing.mui.lg, p: spacing.mui['2xl'], height: 'calc(100vh - 8rem)' }}>
          {/* Sidebar - Conversations */}
          <Box sx={{ ...componentStyles.card, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: spacing.mui.lg, borderBottom: `1px solid ${colors.border}` }}>
              <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.md, color: colors.textPrimary }}>
                Conversations
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: spacing.mui.sm }}>
              {conversations.map(conv => (
                <Box
                  key={conv.userId}
                  onClick={() => setSelectedUserId(conv.userId)}
                  sx={{
                    p: spacing.mui.md,
                    mb: spacing.mui.xs,
                    borderRadius: borders.radius.lg,
                    cursor: 'pointer',
                    backgroundColor: selectedUserId === conv.userId ? colors.primary[25] : 'transparent',
                    border: selectedUserId === conv.userId ? `1px solid ${colors.primary[200]}` : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: selectedUserId === conv.userId ? colors.primary[25] : colors.neutral[50],
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing.mui.sm }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: borders.radius.full,
                      backgroundColor: colors.primary[600], display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: colors.textOnColor,
                      fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs, flexShrink: 0,
                    }}>
                      {conv.userName.charAt(0).toUpperCase()}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                        {conv.userName}
                      </Typography>
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.lastMessage}
                      </Typography>
                    </Box>
                    {conv.unreadCount > 0 && (
                      <Box sx={{
                        minWidth: 20, height: 20, borderRadius: borders.radius.full,
                        backgroundColor: colors.primary[600], color: colors.textOnColor,
                        fontSize: typography.sizes['2xs'], fontWeight: typography.weights.semibold,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.5,
                      }}>
                        {conv.unreadCount}
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ p: spacing.mui.md, borderTop: `1px solid ${colors.border}` }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: typography.sizes.sm }}>Nouveau message vers</InputLabel>
                <Select
                  label="Nouveau message vers"
                  value={selectedUserId ?? ''}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  sx={{ fontSize: typography.sizes.sm }}
                >
                  {users.map(u => <MenuItem key={u.id} value={u.id}>{u.fullName}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Main - Messages */}
          <Box sx={{ ...componentStyles.card, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: spacing.mui.lg, borderBottom: `1px solid ${colors.border}` }}>
              <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.md, color: colors.textPrimary }}>
                {selectedUser ? `Discussion avec ${selectedUser.fullName}` : 'Sélectionnez un membre'}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: spacing.mui.lg, display: 'flex', flexDirection: 'column', gap: spacing.mui.md }}>
              {messages.map(msg => {
                const isSent = msg.recipientId === selectedUserId
                return (
                  <Box key={msg.id} sx={{
                    maxWidth: '70%',
                    alignSelf: isSent ? 'flex-end' : 'flex-start',
                  }}>
                    <Typography sx={{ fontSize: typography.sizes['2xs'], color: colors.textSecondary, mb: 0.5, textAlign: isSent ? 'right' : 'left' }}>
                      {msg.senderName}
                    </Typography>
                    <Box sx={{
                      p: spacing.mui.md,
                      borderRadius: borders.radius.lg,
                      backgroundColor: isSent ? colors.primary[50] : colors.neutral[50],
                      border: `1px solid ${isSent ? colors.primary[100] : colors.neutral[100]}`,
                    }}>
                      <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                        {msg.content}
                      </Typography>
                    </Box>
                  </Box>
                )
              })}
            </Box>

            <Box sx={{ p: spacing.mui.lg, borderTop: `1px solid ${colors.border}`, display: 'flex', gap: spacing.mui.sm }}>
              <TextField
                fullWidth
                size="small"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrire un message..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: borders.radius.lg } }}
              />
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={!newMessage.trim()}
                sx={{
                  ...componentStyles.buttonPrimary,
                  minWidth: 'auto',
                  px: spacing.mui.lg,
                  borderRadius: borders.radius.lg,
                }}
                startIcon={<Send size={16} />}
              >
                Envoyer
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  )
}

export default TeamMessagingPage
