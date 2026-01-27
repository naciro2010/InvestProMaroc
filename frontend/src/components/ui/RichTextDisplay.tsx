import { useState } from 'react'
import { Box, Button, useTheme } from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'
import { stripHtml } from '@/utils/textUtils'

interface RichTextDisplayProps {
  html: string
  previewHeight?: string
  collapseLength?: number
  allowExpand?: boolean
}

const RichTextDisplay = ({
  html,
  previewHeight = '100px',
  collapseLength = 300,
  allowExpand = true,
}: RichTextDisplayProps) => {
  const [expanded, setExpanded] = useState(false)
  const theme = useTheme()
  const plainText = stripHtml(html || '')
  const isLongText = allowExpand && plainText.length > collapseLength

  return (
    <>
      <Box
        sx={{
          '& p': { margin: '0.5em 0' },
          '& ul, & ol': { marginLeft: '1.5em' },
          '& strong': { fontWeight: 600 },
          '& em': { fontStyle: 'italic' },
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
                background: `linear-gradient(transparent, ${theme.palette.background.paper})`,
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
          sx={{ mt: 1 }}
        >
          {expanded ? 'Voir moins' : 'Voir plus'}
        </Button>
      )}
    </>
  )
}

export default RichTextDisplay
