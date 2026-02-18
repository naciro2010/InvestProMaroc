import { useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'
import { stripHtml } from '@/utils/textUtils'
import { componentStyles } from '@/lib/designSystem'

type RichTextVariant = 'block' | 'inline' | 'compact'

interface RichTextDisplayProps {
  /** HTML content string from RichTextEditor */
  html: string
  /** Display variant: block (detail pages), inline (tables), compact (cards) */
  variant?: RichTextVariant
  /** Max height before collapse (block/compact only) */
  previewHeight?: string
  /** Plain text length threshold before collapse kicks in */
  collapseLength?: number
  /** Enable expand/collapse for long content */
  allowExpand?: boolean
  /** Additional sx styles */
  sx?: Record<string, unknown>
}

/**
 * RichTextDisplay - Renders HTML content from RichTextEditor
 *
 * Centralized component for displaying rich text fields (libellé, objet, description).
 * Uses design system styles from componentStyles.richTextDisplay.
 *
 * Variants:
 * - **block**: Full rich text rendering with all formatting. For detail pages.
 * - **inline**: Plain text, single line with ellipsis. For table cells.
 * - **compact**: Smaller rich text with limited spacing. For cards and summaries.
 */
const RichTextDisplay = ({
  html,
  variant = 'block',
  previewHeight = '120px',
  collapseLength = 300,
  allowExpand = true,
  sx: sxProp,
}: RichTextDisplayProps) => {
  const [expanded, setExpanded] = useState(false)

  if (!html) return null

  const plainText = stripHtml(html)

  // Inline variant: render plain text only (for tables)
  if (variant === 'inline') {
    return (
      <Typography
        component="span"
        sx={{
          ...componentStyles.richTextDisplay.inline,
          ...sxProp,
        }}
        title={plainText}
      >
        {plainText}
      </Typography>
    )
  }

  // Block and compact variants: render rich HTML
  const styles = variant === 'compact'
    ? componentStyles.richTextDisplay.compact
    : componentStyles.richTextDisplay.block

  const isLongText = allowExpand && plainText.length > collapseLength

  return (
    <>
      <Box
        sx={{
          ...styles,
          ...sxProp,
          maxHeight: expanded || !isLongText ? 'none' : previewHeight,
          overflow: 'hidden',
          position: 'relative',
          '&::after': !expanded && isLongText
            ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40px',
                background: 'linear-gradient(transparent, white)',
                pointerEvents: 'none',
              }
            : {},
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {isLongText && (
        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          sx={{ mt: 0.5, textTransform: 'none', fontSize: '0.75rem' }}
        >
          {expanded ? 'Voir moins' : 'Voir plus'}
        </Button>
      )}
    </>
  )
}

export default RichTextDisplay
