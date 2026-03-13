/**
 * ChatMessage - Claude-like message bubble for the dashboard chat.
 *
 * Renders user messages as right-aligned bubbles and system responses
 * as left-aligned cards with full-width artifact children.
 */

import { Box, Typography } from '@mui/material'
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
      mb: 2,
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
    }}>
      {/* Avatar */}
      <Box sx={{
        width: 30,
        height: 30,
        borderRadius: borders.radius.full,
        backgroundColor: isUser ? colors.primary[100] : colors.neutral[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        mt: 0.25,
      }}>
        {isUser
          ? <User className="w-3.5 h-3.5" style={{ color: colors.primary[700] }} />
          : <Sparkles className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />
        }
      </Box>

      {/* Message body */}
      <Box sx={{
        maxWidth: isUser ? '70%' : '100%',
        minWidth: 0,
        flex: isUser ? undefined : 1,
      }}>
        {/* Text bubble */}
        {content && (
          <Box sx={{
            display: 'inline-block',
            px: 1.75,
            py: 1,
            borderRadius: isUser
              ? `${borders.radius.lg} ${borders.radius.lg} 4px ${borders.radius.lg}`
              : `${borders.radius.lg} ${borders.radius.lg} ${borders.radius.lg} 4px`,
            backgroundColor: isUser ? colors.primary[50] : colors.neutral[50],
            border: `1px solid ${isUser ? colors.primary[100] : colors.neutral[100]}`,
            maxWidth: isUser ? '100%' : 'fit-content',
          }}>
            <Typography sx={{
              fontSize: typography.sizes.sm,
              color: colors.textPrimary,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}>
              {content}
            </Typography>
          </Box>
        )}

        {/* Timestamp */}
        <Typography sx={{
          fontSize: '10px',
          color: colors.neutral[300],
          mt: 0.5,
          px: 0.5,
          textAlign: isUser ? 'right' : 'left',
        }}>
          {timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </Typography>

        {/* Artifact content (system only) */}
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
