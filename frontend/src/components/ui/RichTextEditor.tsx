import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Box, Typography } from '@mui/material'
import { colors, typography } from '@/lib/designSystem'

/**
 * RichTextEditor Component
 *
 * Reusable rich text editor with formatting options.
 * Uses Odoo design system tokens for consistent styling.
 */

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  label?: string
  placeholder?: string
  readOnly?: boolean
  minHeight?: string
}

const RichTextEditor = ({
  value,
  onChange,
  label,
  placeholder = 'Entrez votre texte formaté ici...',
  readOnly = false,
  minHeight = '200px',
}: RichTextEditorProps) => {
  const modules = {
    toolbar: readOnly
      ? false
      : [
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ font: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ align: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          ['link', 'image'],
          ['code-block'],
          ['clean'],
        ],
  }

  const formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'font',
    'size',
    'align',
    'list',
    'indent',
    'link',
    'image',
    'code-block',
  ]

  return (
    <Box>
      {label && (
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1,
            fontWeight: typography.weights.semibold,
            color: colors.textPrimary,
          }}
        >
          {label}
        </Typography>
      )}
      <Box
        sx={{
          '.ql-container': {
            fontSize: '16px',
            fontFamily: 'inherit',
            border: `1px solid ${colors.border}`,
            borderRadius: '0 0 4px 4px',
            backgroundColor: colors.surface,
          },
          '.ql-editor': {
            minHeight: minHeight,
            padding: '12px',
            backgroundColor: colors.surface,
          },
          '.ql-toolbar': {
            border: `1px solid ${colors.border}`,
            borderRadius: '4px 4px 0 0',
            backgroundColor: colors.neutral[50],
          },
          '.ql-toolbar.ql-snow .ql-stroke': {
            stroke: colors.textSecondary,
          },
          '.ql-toolbar.ql-snow .ql-fill': {
            fill: colors.textSecondary,
          },
          '.ql-toolbar.ql-snow .ql-picker-label': {
            color: colors.textSecondary,
          },
          '.ql-toolbar.ql-snow button:hover .ql-stroke': {
            stroke: colors.primary[600],
          },
          '.ql-toolbar.ql-snow button:hover .ql-fill': {
            fill: colors.primary[600],
          },
          '.ql-toolbar.ql-snow button.ql-active .ql-stroke': {
            stroke: colors.primary[600],
          },
          '.ql-toolbar.ql-snow button.ql-active .ql-fill': {
            fill: colors.primary[600],
          },
          '.ql-snow.ql-toolbar button.ql-active,': {
            color: colors.primary[600],
          },
          '.ql-snow a': {
            color: colors.link,
          },
          '.ql-editor.ql-blank::before': {
            color: colors.textDisabled,
            fontStyle: 'italic',
          },
        }}
      >
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={readOnly}
          theme={readOnly ? 'bubble' : 'snow'}
        />
      </Box>
    </Box>
  )
}

export default RichTextEditor
