import { useState, useEffect } from 'react'
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Typography,
  Paper,
  Alert,
} from '@mui/material'
import { conventionsAPI } from '../../lib/api'
import { colors, typography, borders } from '../../lib/designSystem'

interface Convention {
  id: number
  code: string
  numero: string
  libelle: string
  statut: string
  budget: number
}

interface ConventionMultiSelectProps {
  selectedConventionIds: number[]
  onSelectionChange: (selectedIds: number[]) => void
  label?: string
  disabled?: boolean
}

const ConventionMultiSelect = ({
  selectedConventionIds,
  onSelectionChange,
  label = 'Conventions Associées',
  disabled = false,
}: ConventionMultiSelectProps) => {
  const [conventions, setConventions] = useState<Convention[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadConventions = async () => {
      try {
        setLoading(true)
        const response = await conventionsAPI.getAll()
        if (response.data && Array.isArray(response.data)) {
          const activeConventions: Convention[] = response.data.filter(
            (c: Convention) =>
              c.statut === 'BROUILLON' || c.statut === 'SOUMIS' || c.statut === 'VALIDEE'
          )
          setConventions(activeConventions)
        }
        setError('')
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
        console.error('Erreur chargement conventions:', errorMessage)
        setError('Impossible de charger les conventions')
      } finally {
        setLoading(false)
      }
    }

    loadConventions()
  }, [])

  const handleToggle = (conventionId: number) => {
    const isSelected = selectedConventionIds.includes(conventionId)
    if (isSelected) {
      onSelectionChange(selectedConventionIds.filter((id) => id !== conventionId))
    } else {
      onSelectionChange([...selectedConventionIds, conventionId])
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={30} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        backgroundColor: colors.primary[25],
        borderLeft: `4px solid ${colors.primary[600]}`,
        p: 3,
        borderRadius: borders.radius.lg,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: typography.weights.bold,
          mb: 2,
          color: colors.primary[700],
          fontSize: typography.sizes.md,
        }}
      >
        {label}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {conventions.length === 0 ? (
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Aucune convention disponible
        </Typography>
      ) : (
        <FormGroup>
          {conventions.map((convention) => (
            <Paper
              key={convention.id}
              sx={{
                p: 2,
                mb: 1.5,
                borderLeft: `3px solid ${colors.primary[600]}`,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.2s ease',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: disabled ? 'inherit' : colors.primary[50],
                },
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedConventionIds.includes(convention.id)}
                    onChange={() => handleToggle(convention.id)}
                    disabled={disabled}
                  />
                }
                label={
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: typography.weights.semibold }}
                    >
                      {convention.numero} - {convention.libelle}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Code: {convention.code} | Statut: {convention.statut}
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', m: 0 }}
              />
            </Paper>
          ))}
        </FormGroup>
      )}

      {selectedConventionIds.length > 0 && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            backgroundColor: colors.primary[50],
            borderRadius: borders.radius.md,
            borderLeft: `3px solid ${colors.primary[600]}`,
          }}
        >
          <Typography variant="caption" sx={{ color: colors.primary[800] }}>
            <strong>{selectedConventionIds.length}</strong> convention(s) sélectionnée(s)
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default ConventionMultiSelect
