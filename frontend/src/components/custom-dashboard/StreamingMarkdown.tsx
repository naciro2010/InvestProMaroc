/**
 * StreamingMarkdown - Renders markdown content with streaming cursor effect.
 *
 * Uses react-markdown with remark-gfm for rich rendering (tables, lists, code).
 * Shows a blinking cursor at the end during streaming.
 * Strips JSON code blocks (visualization config) from display.
 */

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Box } from '@mui/material'
import { colors, typography, borders } from '@/lib/designSystem'

interface StreamingMarkdownProps {
  content: string
  isStreaming?: boolean
}

/** Remove ```json {...} ``` blocks from displayed markdown (they're for viz config) */
function stripJsonBlocks(text: string): string {
  return text.replace(/```json\s*\n?\{[\s\S]*?\}\s*\n?```/g, '').trim()
}

const StreamingMarkdown = ({ content, isStreaming = false }: StreamingMarkdownProps) => {
  const cleanContent = useMemo(() => stripJsonBlocks(content), [content])

  if (!cleanContent && !isStreaming) return null

  return (
    <Box sx={{
      '& > *:first-of-type': { mt: 0 },
      '& > *:last-child': { mb: 0 },
      fontSize: typography.sizes.sm,
      lineHeight: 1.7,
      color: colors.textPrimary,
      /* Headings */
      '& h1, & h2, & h3': {
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
        mt: 2,
        mb: 1,
      },
      '& h2': { fontSize: typography.sizes.base },
      '& h3': { fontSize: typography.sizes.sm },
      /* Paragraphs */
      '& p': {
        mb: 1.5,
        lineHeight: 1.7,
      },
      /* Bold */
      '& strong': {
        fontWeight: typography.weights.semibold,
        color: colors.textPrimary,
      },
      /* Lists */
      '& ul, & ol': {
        pl: 2.5,
        mb: 1.5,
      },
      '& li': {
        mb: 0.5,
        lineHeight: 1.6,
      },
      '& li::marker': {
        color: colors.primary[500],
      },
      /* Inline code */
      '& code:not(pre code)': {
        backgroundColor: colors.neutral[100],
        color: colors.primary[700],
        px: 0.75,
        py: 0.25,
        borderRadius: borders.radius.sm,
        fontSize: '0.85em',
        fontFamily: 'monospace',
      },
      /* Code blocks */
      '& pre': {
        backgroundColor: colors.neutral[50],
        border: `1px solid ${colors.neutral[200]}`,
        borderRadius: borders.radius.base,
        p: 2,
        mb: 1.5,
        overflow: 'auto',
        '& code': {
          fontSize: typography.sizes.xs,
          fontFamily: 'monospace',
        },
      },
      /* Tables */
      '& table': {
        width: '100%',
        borderCollapse: 'collapse',
        mb: 1.5,
        fontSize: typography.sizes.xs,
      },
      '& th': {
        backgroundColor: colors.neutral[50],
        borderBottom: `2px solid ${colors.neutral[200]}`,
        px: 1.5,
        py: 1,
        textAlign: 'left',
        fontWeight: typography.weights.semibold,
        color: colors.textSecondary,
      },
      '& td': {
        borderBottom: `1px solid ${colors.neutral[100]}`,
        px: 1.5,
        py: 0.75,
      },
      /* Blockquotes */
      '& blockquote': {
        borderLeft: `3px solid ${colors.primary[300]}`,
        pl: 2,
        ml: 0,
        mb: 1.5,
        color: colors.textSecondary,
        fontStyle: 'italic',
      },
      /* Horizontal rules */
      '& hr': {
        border: 'none',
        borderTop: `1px solid ${colors.neutral[200]}`,
        my: 2,
      },
    }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {cleanContent}
      </ReactMarkdown>

      {/* Streaming cursor */}
      {isStreaming && (
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: 2,
            height: '1em',
            backgroundColor: colors.primary[500],
            ml: 0.25,
            verticalAlign: 'text-bottom',
            animation: 'blink 1s step-end infinite',
            '@keyframes blink': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0 },
            },
          }}
        />
      )}
    </Box>
  )
}

export default StreamingMarkdown
