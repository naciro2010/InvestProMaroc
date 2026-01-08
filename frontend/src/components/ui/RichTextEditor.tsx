import { useEffect, useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Box, FormHelperText } from '@mui/material'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: boolean
  helperText?: string
  minHeight?: number
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Saisissez le texte...',
  error = false,
  helperText,
  minHeight = 200
}: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null)

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link'],
      [{ color: [] }, { background: [] }],
      ['clean']
    ]
  }

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
    'color',
    'background'
  ]

  return (
    <Box>
      <Box
        sx={{
          '& .quill': {
            border: error ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.23)',
            borderRadius: 1,
            '&:hover': {
              borderColor: error ? '#d32f2f' : 'rgba(0, 0, 0, 0.87)'
            }
          },
          '& .ql-toolbar': {
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            bgcolor: '#f5f5f5'
          },
          '& .ql-container': {
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            minHeight: `${minHeight}px`,
            fontSize: '14px',
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
          },
          '& .ql-editor': {
            minHeight: `${minHeight}px`
          }
        }}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      </Box>
      {helperText && (
        <FormHelperText error={error} sx={{ ml: 2 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  )
}

export default RichTextEditor
