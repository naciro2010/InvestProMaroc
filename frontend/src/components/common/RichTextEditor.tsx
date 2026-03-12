import { useMemo } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Box, Typography } from '@mui/material'
import { colors } from '@/lib/designSystem'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  minHeight?: number
  readOnly?: boolean
}

const RichTextEditor = ({
  value,
  onChange,
  label,
  placeholder = 'Saisissez votre texte...',
  error,
  required = false,
  minHeight = 200,
  readOnly = false,
}: RichTextEditorProps) => {
  // Configuration des modules Quill
  const modules = useMemo(
    () => ({
      toolbar: readOnly
        ? false
        : [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ align: [] }],
            ['link'],
            ['clean'],
          ],
    }),
    [readOnly]
  )

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'align',
    'link',
  ]

  return (
    <Box>
      {label && (
        <Typography
          variant="subtitle2"
          gutterBottom
          fontWeight={600}
          sx={{ mb: 1 }}
        >
          {label}
          {required && (
            <Typography component="span" color="error" sx={{ ml: 0.5 }}>
              *
            </Typography>
          )}
        </Typography>
      )}

      <Box
        sx={{
          border: '1px solid',
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          '& .quill': {
            bgcolor: 'background.paper',
          },
          '& .ql-toolbar': {
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: colors.neutral[25],
            display: readOnly ? 'none' : 'block',
          },
          '& .ql-container': {
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            minHeight: `${minHeight}px`,
            fontSize: '14px',
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
          },
          '& .ql-editor': {
            minHeight: `${minHeight}px`,
            '&.ql-blank::before': {
              color: colors.neutral[400],
              fontStyle: 'normal',
            },
          },
        }}
      >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  )
}

export default RichTextEditor
