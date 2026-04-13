import { Component, type ReactNode } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { colors } from '@/lib/designSystem'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  level?: 'page' | 'widget'
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    const isWidget = this.props.level === 'widget'

    if (isWidget) {
      return (
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            minHeight: 120,
            bgcolor: colors.danger[25],
            borderRadius: 2,
            border: `1px solid ${colors.danger[100]}`,
          }}
        >
          <AlertTriangle size={24} color={colors.danger[500]} />
          <Typography variant="body2" sx={{ color: colors.danger[700], textAlign: 'center' }}>
            Ce composant a rencontré une erreur
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshCw size={14} />}
            onClick={this.handleReset}
            sx={{ color: colors.danger[600], borderColor: colors.danger[200] }}
          >
            Réessayer
          </Button>
        </Box>
      )
    }

    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          p: 4,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: colors.danger[50],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={36} color={colors.danger[500]} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 600, color: colors.primary[800] }}>
          Une erreur est survenue
        </Typography>
        <Typography variant="body1" sx={{ color: colors.primary[500], textAlign: 'center', maxWidth: 480 }}>
          Cette page a rencontré un problème inattendu. Vous pouvez réessayer ou retourner au tableau de bord.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={this.handleReset}
          >
            Réessayer
          </Button>
          <Button
            variant="contained"
            startIcon={<Home size={16} />}
            onClick={this.handleGoHome}
            sx={{ bgcolor: colors.primary[600], '&:hover': { bgcolor: colors.primary[700] } }}
          >
            Tableau de bord
          </Button>
        </Box>
      </Box>
    )
  }
}

export default ErrorBoundary
