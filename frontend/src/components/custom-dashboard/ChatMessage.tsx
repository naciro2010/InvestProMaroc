/**
 * ChatMessage - Chat bubble component for conversational dashboard UI.
 * Displays user instructions and system responses in a chat-like format.
 */

import { Box, Typography, Paper } from '@mui/material'
import { User, Sparkles } from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'

interface ChatMessageProps {
  type: 'user' | 'system'
  content: string
  timestamp: Date
  children?: React.ReactNode
}

const ChatMessage = ({ type, content, timestamp, children }: ChatMessageProps) => {
  const isUser = type === 'user'

  return (
    <Box sx={{
      display: 'flex',
      gap: 1.5,
      mb: 2.5,
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
    }}>
      {/* Avatar */}
      <Box sx={{
        width: 32,
        height: 32,
        borderRadius: borders.radius.full,
        backgroundColor: isUser ? colors.primary[100] : colors.neutral[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        mt: 0.5,
      }}>
        {isUser
          ? <User className="w-4 h-4" style={{ color: colors.primary[700] }} />
          : <Sparkles className="w-4 h-4" style={{ color: colors.primary[600] }} />
        }
      </Box>

      {/* Message body */}
      <Box sx={{ maxWidth: '80%', minWidth: 0 }}>
        <Paper sx={{
          px: 2,
          py: 1.5,
          borderRadius: borders.radius.lg,
          backgroundColor: isUser ? colors.primary[50] : colors.surface,
          border: `1px solid ${isUser ? colors.primary[200] : colors.border}`,
          boxShadow: 'none',
        }}>
          <Typography sx={{
            fontSize: typography.sizes.sm,
            color: colors.textPrimary,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
          }}>
            {content}
          </Typography>
        </Paper>

        {/* Timestamp */}
        <Typography sx={{
          fontSize: typography.sizes['2xs'],
          color: colors.neutral[400],
          mt: 0.5,
          px: 0.5,
          textAlign: isUser ? 'right' : 'left',
        }}>
          {timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </Typography>

        {/* Widget content (system messages only) */}
        {!isUser && children && (
          <Box sx={{ mt: 1.5 }}>
            {children}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ChatMessage
