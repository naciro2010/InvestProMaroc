/**
 * ChatMessage - Claude-like message bubble for the dashboard chat.
 *
 * Renders user messages as right-aligned bubbles (plain text) and system responses
 * as left-aligned cards with markdown rendering and full-width artifact children.
 */

import { Box, Typography } from '@mui/material'
import { User, Sparkles } from 'lucide-react'
import { colors, typography, borders } from '@/lib/designSystem'
import StreamingMarkdown from './StreamingMarkdown'

interface ChatMessageProps {
  type: 'user' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
  children?: React.ReactNode
}

const ChatMessage = ({ type, content, timestamp, isStreaming = false, children }: ChatMessageProps) => {
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
            {isUser ? (
              <Typography sx={{
                fontSize: typography.sizes.sm,
                color: colors.textPrimary,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}>
                {content}
              </Typography>
            ) : (
              <StreamingMarkdown content={content} isStreaming={isStreaming} />
            )}
          </Box>
        )}

        {/* Streaming indicator when no content yet */}
        {!content && isStreaming && (
          <Box sx={{
            display: 'inline-block',
            px: 1.75,
            py: 1,
            borderRadius: `${borders.radius.lg} ${borders.radius.lg} ${borders.radius.lg} 4px`,
            backgroundColor: colors.neutral[50],
            border: `1px solid ${colors.neutral[100]}`,
          }}>
            <StreamingMarkdown content="" isStreaming />
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
