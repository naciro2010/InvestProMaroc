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
} from '@mui/material'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeaderOdoo } from '../../components/ui'
import {
  ConventionSettings,
  loadConventionSettings,
  saveConventionSettings,
} from '../../lib/settings/conventionSettings'

const SettingsPage = () => {
  const [settings, setSettings] = useState<ConventionSettings>(loadConventionSettings())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSettings(loadConventionSettings())
  }, [])

  const handleSave = () => {
    saveConventionSettings(settings)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 3000)
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
        title="Paramètres"
        subtitle="Gérez les masques et types utilisés dans les conventions"
        breadcrumbs={[
          { label: 'Accueil', path: '/dashboard' },
          { label: 'Paramètres' },
        ]}
      />

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Stack spacing={3}>
          {saved && (
            <Alert severity="success">Paramètres enregistrés avec succès.</Alert>
          )}

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
                  />
                </Stack>
              ))}
            </Stack>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSave}>
              Enregistrer les paramètres
            </Button>
          </Box>
        </Stack>
      </Container>
    </AppLayout>
  )
}

export default SettingsPage
