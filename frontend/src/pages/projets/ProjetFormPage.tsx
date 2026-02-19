import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  TextField,
  MenuItem,
  Alert,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material'
import AppLayout from '@/components/layout/AppLayout'
import {
  StickyActionBar,
  FormLayout,
  FormPageSection,
  FormGroup,
  FormField,
  ControlPanel,
} from '@/components/core'
import RichTextEditor from '@/components/common/RichTextEditor'
import DecimalInput from '@/components/ui/DecimalInput'
import { projetsAPI, Projet } from '@/lib/projetsAPI'
import { colors } from '@/lib/designSystem'

const ProjetFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState<Partial<Projet>>({
    code: '',
    nom: '',
    description: '',
    budgetTotal: 0,
    dateDebut: '',
    dureeMois: 12,
    statut: 'EN_PREPARATION',
    pourcentageAvancement: 0,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isEdit && id) {
      loadProjet(parseInt(id))
    }
  }, [id, isEdit])

  const loadProjet = async (projetId: number) => {
    try {
      const response = await projetsAPI.getById(projetId)
      setFormData(response.data)
    } catch {
      setError('Erreur lors du chargement du projet')
    }
  }

  const handleChange = (field: keyof Projet, value: string | number | boolean) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEdit && id) {
        await projetsAPI.update(parseInt(id), formData)
      } else {
        await projetsAPI.create(formData)
      }
      navigate('/projets')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography>Chargement...</Typography>
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ControlPanel
        breadcrumbs={[
          { label: 'Projets', path: '/projets' },
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
        hideBottomRow
      />
      <Box sx={{ bgcolor: colors.background, minHeight: 'calc(100vh - 48px)' }}>
        <form onSubmit={handleSubmit}>
          <StickyActionBar
            title={isEdit ? 'Modifier le projet' : 'Nouveau projet'}
            showBack
            backUrl="/projets"
            isSubmitting={loading}
            submitType="submit"
          />

          {error && (
            <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 0 }, pt: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          <FormLayout maxWidth={900}>
            <FormPageSection title="Informations generales" divider={false}>
              <FormGroup columns={2}>
                <FormField>
                  <TextField
                    label="Code"
                    required
                    fullWidth
                    size="small"
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    disabled={isEdit}
                    placeholder="PRJ-2024-001"
                  />
                </FormField>
                <FormField>
                  <TextField
                    label="Statut"
                    required
                    fullWidth
                    size="small"
                    select
                    value={formData.statut}
                    onChange={(e) => handleChange('statut', e.target.value)}
                  >
                    <MenuItem value="EN_PREPARATION">En preparation</MenuItem>
                    <MenuItem value="EN_COURS">En cours</MenuItem>
                    <MenuItem value="SUSPENDU">Suspendu</MenuItem>
                    <MenuItem value="TERMINE">Termine</MenuItem>
                    <MenuItem value="ANNULE">Annule</MenuItem>
                  </TextField>
                </FormField>
              </FormGroup>
              <FormGroup columns={1}>
                <FormField>
                  <TextField
                    label="Nom du projet"
                    required
                    fullWidth
                    size="small"
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', e.target.value)}
                  />
                </FormField>
              </FormGroup>
              <FormGroup columns={1}>
                <FormField>
                  <RichTextEditor
                    label="Description"
                    value={formData.description || ''}
                    onChange={(value) => handleChange('description', value)}
                    placeholder="Description du projet..."
                    minHeight={120}
                  />
                </FormField>
              </FormGroup>
            </FormPageSection>

            <FormPageSection title="Budget et planning">
              <FormGroup columns={2}>
                <FormField>
                  <DecimalInput
                    value={formData.budgetTotal || 0}
                    onChange={(value) => handleChange('budgetTotal', value)}
                    min={0}
                    decimalPlaces={2}
                    label="Budget Total (DH)"
                    required
                    fullWidth
                    size="small"
                  />
                </FormField>
                <FormField>
                  <DecimalInput
                    value={formData.dureeMois || 0}
                    onChange={(value) => handleChange('dureeMois', value)}
                    min={1}
                    decimalPlaces={0}
                    label="Duree (mois)"
                    fullWidth
                    size="small"
                  />
                </FormField>
                <FormField>
                  <TextField
                    label="Date de debut"
                    type="date"
                    fullWidth
                    size="small"
                    value={formData.dateDebut || ''}
                    onChange={(e) => handleChange('dateDebut', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </FormField>
                <FormField>
                  <TextField
                    label="Localisation"
                    fullWidth
                    size="small"
                    value={formData.localisation || ''}
                    onChange={(e) => handleChange('localisation', e.target.value)}
                  />
                </FormField>
              </FormGroup>
            </FormPageSection>

            <FormPageSection title="Details supplementaires">
              <FormGroup columns={1}>
                <FormField>
                  <RichTextEditor
                    label="Objectifs"
                    value={formData.objectifs || ''}
                    onChange={(value) => handleChange('objectifs', value)}
                    placeholder="Objectifs du projet..."
                    minHeight={100}
                  />
                </FormField>
              </FormGroup>
              <FormGroup columns={1}>
                <FormField>
                  <RichTextEditor
                    label="Remarques"
                    value={formData.remarques || ''}
                    onChange={(value) => handleChange('remarques', value)}
                    placeholder="Remarques ou observations..."
                    minHeight={80}
                  />
                </FormField>
              </FormGroup>
            </FormPageSection>
          </FormLayout>
        </form>
      </Box>
    </AppLayout>
  )
}

export default ProjetFormPage
