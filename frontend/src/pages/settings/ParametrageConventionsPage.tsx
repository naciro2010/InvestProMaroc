import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  Stack,
  Divider,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from '@mui/material'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeaderOdoo } from '../../components/ui'
import { conventionConfigurationAPI } from '../../lib/api'
import { ConventionSettings } from '../../lib/settings/conventionSettings'
import { useConventionConfiguration } from '../../hooks/useConventionConfiguration'

const ParametrageConventionsPage = () => {
  const { configuration, loading, error, reload } = useConventionConfiguration()
  const [settings, setSettings] = useState<ConventionSettings>(configuration)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSettings(configuration)
  }, [configuration])

  const handleSave = async () => {
    try {
      setSaving(true)
      await conventionConfigurationAPI.update({
        codeMaskPattern: settings.codeMaskPattern,
        codeMaskPlaceholder: settings.codeMaskPlaceholder,
        numeroMaskPattern: settings.numeroMaskPattern,
        numeroMaskPlaceholder: settings.numeroMaskPlaceholder,
        typeConfigurations: settings.typeConventionOptions.map((option, index) => ({
          typeCode: option.value,
          libelle: option.label,
          enabled: option.enabled,
          ordreAffichage: index + 1,
        })),
      })
      setSaved(true)
      window.setTimeout(() => setSaved(false), 3000)
      reload()
    } finally {
      setSaving(false)
    }
  }

  const handleTypeOptionChange = (
    value: ConventionSettings['typeConventionOptions'][number]['value'],
    field: 'label' | 'enabled',
    newValue: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      typeConventionOptions: prev.typeConventionOptions.map((option) =>
        option.value === value
          ? {
              ...option,
              [field]: newValue,
            }
          : option
      ),
    }))
  }

  return (
    <AppLayout>
      <PageHeaderOdoo
        title="Paramétrage des conventions"
        subtitle="Gérez les masques et types utilisés pour les conventions"
        breadcrumbs={[
          { label: 'Accueil', path: '/dashboard' },
          { label: 'Paramétrage' },
          { label: 'Conventions' },
        ]}
      />

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Stack spacing={3}>
          {loading && (
            <Alert severity="info" icon={<CircularProgress size={18} />}>
              Chargement du paramétrage...
            </Alert>
          )}

          {error && <Alert severity="warning">{error}</Alert>}

          {saved && <Alert severity="success">Paramétrage enregistré avec succès.</Alert>}

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Masques de convention
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Définissez les formats attendus pour le code et le numéro de convention.
            </Typography>

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Code de convention
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Regex de validation"
                    value={settings.codeMaskPattern}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        codeMaskPattern: event.target.value,
                      }))
                    }
                    disabled={loading || saving}
                    helperText="Exemple : ^[A-Za-z0-9-]+$"
                  />
                  <TextField
                    fullWidth
                    label="Exemple de masque"
                    value={settings.codeMaskPlaceholder}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        codeMaskPlaceholder: event.target.value,
                      }))
                    }
                    disabled={loading || saving}
                    helperText="Affiché comme suggestion dans le formulaire"
                  />
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Numéro de convention
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Regex de validation"
                    value={settings.numeroMaskPattern}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        numeroMaskPattern: event.target.value,
                      }))
                    }
                    disabled={loading || saving}
                    helperText="Exemple : ^[A-Za-z0-9/-]+$"
                  />
                  <TextField
                    fullWidth
                    label="Exemple de masque"
                    value={settings.numeroMaskPlaceholder}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        numeroMaskPlaceholder: event.target.value,
                      }))
                    }
                    disabled={loading || saving}
                    helperText="Affiché comme suggestion dans le formulaire"
                  />
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Types de convention
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Activez les types disponibles et ajustez leur libellé d'affichage.
            </Typography>

            <Stack spacing={2}>
              {settings.typeConventionOptions.map((option) => (
                <Stack
                  key={option.value}
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={option.enabled}
                        onChange={(event) =>
                          handleTypeOptionChange(option.value, 'enabled', event.target.checked)
                        }
                        disabled={loading || saving}
                      />
                    }
                    label={`Activer ${option.value}`}
                  />
                  <TextField
                    fullWidth
                    label="Libellé affiché"
                    value={option.label}
                    onChange={(event) =>
                      handleTypeOptionChange(option.value, 'label', event.target.value)
                    }
                    disabled={loading || saving}
                  />
                </Stack>
              ))}
            </Stack>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSave} disabled={loading || saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer le paramétrage'}
            </Button>
          </Box>
        </Stack>
      </Container>
    </AppLayout>
  )
}

export default ParametrageConventionsPage
