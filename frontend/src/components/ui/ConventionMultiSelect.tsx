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
  label = '📋 Conventions Associées',
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
          // Filter to only active conventions (BROUILLON, SOUMIS, VALIDEE)
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
        background: '#f0f9ff',
        borderLeft: '4px solid #2563eb',
        p: 3,
        borderRadius: '8px',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2563eb' }}>
        {label}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {conventions.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
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
                borderLeft: '3px solid #2563eb',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: disabled ? 'inherit' : '#e0f2fe',
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
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {convention.numero} - {convention.libelle}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
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
            backgroundColor: '#dbeafe',
            borderRadius: '6px',
            borderLeft: '3px solid #2563eb',
          }}
        >
          <Typography variant="caption" sx={{ color: '#1e40af' }}>
            <strong>{selectedConventionIds.length}</strong> convention(s) sélectionnée(s)
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default ConventionMultiSelect
