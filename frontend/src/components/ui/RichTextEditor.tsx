import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Box, Typography } from '@mui/material'

/**
 * RichTextEditor Component
 *
 * Reusable rich text editor with formatting options:
 * - Text formatting (bold, italic, underline, strike)
 * - Colors and background colors
 * - Font families and sizes
 * - Lists (ordered, unordered)
 * - Links and images
 * - Text alignment
 *
 * Props:
 * - value: Current HTML content
 * - onChange: Callback when content changes
 * - label: Optional label for the editor
 * - placeholder: Placeholder text
 * - readOnly: Set to true for read-only mode
 * - minHeight: Minimum height of editor (default: 200px)
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
  // Quill toolbar configuration
  const modules = {
    toolbar: readOnly
      ? false
      : [
          // Text formatting
          ['bold', 'italic', 'underline', 'strike'],

          // Colors
          [{ color: [] }, { background: [] }],

          // Font family
          [{ font: [] }],

          // Font size
          [{ size: ['small', false, 'large', 'huge'] }],

          // Text alignment
          [{ align: [] }],

          // Lists
          [{ list: 'ordered' }, { list: 'bullet' }],

          // Indent
          [{ indent: '-1' }, { indent: '+1' }],

          // Links and images
          ['link', 'image'],

          // Code block
          ['code-block'],

          // Clear formatting
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
          sx={{ mb: 1, fontWeight: 600, color: 'gray.700' }}
        >
          {label}
        </Typography>
      )}
      <Box
        sx={{
          '.ql-container': {
            fontSize: '16px',
            fontFamily: 'inherit',
            border: '1px solid #e5e7eb',
            borderRadius: '0 0 4px 4px',
            backgroundColor: 'white',
          },
          '.ql-editor': {
            minHeight: minHeight,
            padding: '12px',
            backgroundColor: 'white',
          },
          '.ql-toolbar': {
            border: '1px solid #e5e7eb',
            borderRadius: '4px 4px 0 0',
            backgroundColor: '#f9fafb',
          },
          '.ql-toolbar.ql-snow .ql-stroke': {
            stroke: '#6b7280',
          },
          '.ql-toolbar.ql-snow .ql-fill': {
            fill: '#6b7280',
          },
          '.ql-toolbar.ql-snow .ql-picker-label': {
            color: '#6b7280',
          },
          '.ql-toolbar.ql-snow button:hover .ql-stroke': {
            stroke: '#2563eb',
          },
          '.ql-toolbar.ql-snow button:hover .ql-fill': {
            fill: '#2563eb',
          },
          '.ql-toolbar.ql-snow button.ql-active .ql-stroke': {
            stroke: '#2563eb',
          },
          '.ql-toolbar.ql-snow button.ql-active .ql-fill': {
            fill: '#2563eb',
          },
          '.ql-snow.ql-toolbar button.ql-active,': {
            color: '#2563eb',
          },
          '.ql-snow a': {
            color: '#2563eb',
          },
          '.ql-editor.ql-blank::before': {
            color: '#9ca3af',
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
