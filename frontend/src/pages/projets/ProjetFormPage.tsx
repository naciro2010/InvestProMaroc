import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TextField, MenuItem, Alert, Box, CircularProgress, Typography, Button } from '@mui/material'
import { Eye, ArrowLeft } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import {
  StickyActionBar,
  FormGroup,
  FormField,
  ControlPanel,
  FormView,
  Notebook,
  StatusBadge,
  type StatusStep,
} from '@/components/core'
import RichTextEditor from '@/components/common/RichTextEditor'
import DecimalInput from '@/components/ui/DecimalInput'
import { projetsAPI, Projet } from '@/lib/projetsAPI'
import { ProjetEditInfoPanel } from '@/components/projets/edit'
import { useToast } from '@/contexts/ToastContext'
import { colors, typography, componentStyles } from '@/lib/designSystem'

const STATUS_STEPS: StatusStep[] = [
  { value: 'EN_PREPARATION', label: 'Preparation' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'TERMINE', label: 'Termine' },
]

const ProjetFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isEdit && id) loadProjet(parseInt(id))
  }, [id, isEdit])

  const loadProjet = async (projetId: number) => {
    try {
      setLoading(true)
      const response = await projetsAPI.getById(projetId)
      setFormData(response.data)
    } catch {
      setError('Erreur lors du chargement du projet')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Projet, value: string | number | boolean) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (isEdit && id) {
        await projetsAPI.update(parseInt(id), formData)
        showToast('Projet mis a jour avec succes', 'success')
      } else {
        await projetsAPI.create(formData)
        showToast('Projet cree avec succes', 'success')
      }
      navigate('/projets')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
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
          ...(isEdit && formData.code ? [{ label: formData.code, path: `/projets/${id}` }] : []),
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
        actions={
          <>
            {isEdit && <StatusBadge status={formData.statut || 'EN_PREPARATION'} size="small" />}
            {isEdit && (
              <Button size="small" startIcon={<Eye size={14} />} onClick={() => navigate(`/projets/${id}`)}
                sx={{ ...componentStyles.buttonSecondary, textTransform: 'none', fontSize: typography.sizes.sm }}>
                Voir
              </Button>
            )}
            <Button size="small" startIcon={<ArrowLeft size={14} />} onClick={() => navigate('/projets')}
              sx={{ ...componentStyles.buttonGhost, textTransform: 'none', fontSize: typography.sizes.sm }}>
              Liste
            </Button>
          </>
        }
        hideBottomRow
      />

      <Box sx={{ bgcolor: colors.background, minHeight: 'calc(100vh - 48px)' }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 3, p: 3, maxWidth: 1280, mx: 'auto' }}>
            {/* Main form area */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <FormView
                isEditing={true}
                statusSteps={STATUS_STEPS}
                currentStatus={formData.statut || 'EN_PREPARATION'}
              >
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                )}

                <Notebook
                  tabs={[
                    {
                      label: 'Informations generales',
                      content: (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <FormGroup columns={2}>
                            <FormField>
                              <TextField label="Code" required fullWidth size="small" value={formData.code}
                                onChange={(e) => handleChange('code', e.target.value)} disabled={isEdit} placeholder="PRJ-2024-001" />
                            </FormField>
                            <FormField>
                              <TextField label="Statut" required fullWidth size="small" select value={formData.statut}
                                onChange={(e) => handleChange('statut', e.target.value)}>
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
                              <TextField label="Nom du projet" required fullWidth size="small" value={formData.nom}
                                onChange={(e) => handleChange('nom', e.target.value)} />
                            </FormField>
                          </FormGroup>
                          <FormGroup columns={1}>
                            <FormField>
                              <RichTextEditor label="Description" value={formData.description || ''}
                                onChange={(value) => handleChange('description', value)} placeholder="Description du projet..." minHeight={120} />
                            </FormField>
                          </FormGroup>
                        </Box>
                      ),
                    },
                    {
                      label: 'Budget & Planning',
                      content: (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <FormGroup columns={2}>
                            <FormField>
                              <DecimalInput value={formData.budgetTotal || 0} onChange={(value) => handleChange('budgetTotal', value)}
                                min={0} decimalPlaces={2} label="Budget Total (DH)" required fullWidth size="small" />
                            </FormField>
                            <FormField>
                              <DecimalInput value={formData.dureeMois || 0} onChange={(value) => handleChange('dureeMois', value)}
                                min={1} decimalPlaces={0} label="Duree (mois)" fullWidth size="small" />
                            </FormField>
                            <FormField>
                              <TextField label="Date de debut" type="date" fullWidth size="small" value={formData.dateDebut || ''}
                                onChange={(e) => handleChange('dateDebut', e.target.value)} InputLabelProps={{ shrink: true }} />
                            </FormField>
                            <FormField>
                              <TextField label="Localisation" fullWidth size="small" value={formData.localisation || ''}
                                onChange={(e) => handleChange('localisation', e.target.value)} />
                            </FormField>
                          </FormGroup>
                        </Box>
                      ),
                    },
                    {
                      label: 'Details',
                      content: (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <FormGroup columns={1}>
                            <FormField>
                              <RichTextEditor label="Objectifs" value={formData.objectifs || ''}
                                onChange={(value) => handleChange('objectifs', value)} placeholder="Objectifs du projet..." minHeight={100} />
                            </FormField>
                          </FormGroup>
                          <FormGroup columns={1}>
                            <FormField>
                              <RichTextEditor label="Remarques" value={formData.remarques || ''}
                                onChange={(value) => handleChange('remarques', value)} placeholder="Remarques ou observations..." minHeight={80} />
                            </FormField>
                          </FormGroup>
                        </Box>
                      ),
                    },
                  ]}
                />
              </FormView>

              <Box sx={{ mt: 2 }}>
                <StickyActionBar title={isEdit ? 'Modifier le projet' : 'Nouveau projet'} showBack backUrl="/projets" isSubmitting={saving} submitType="submit" />
              </Box>
            </Box>

            {/* Info sidebar */}
            <Box sx={{ width: 280, flexShrink: 0, display: { xs: 'none', lg: 'block' } }}>
              <Box sx={{ position: 'sticky', top: 16 }}>
                <ProjetEditInfoPanel
                  metadata={{ statut: formData.statut || 'EN_PREPARATION', createdAt: formData.createdAt, updatedAt: formData.updatedAt }}
                  budgetTotal={formData.budgetTotal || 0}
                  pourcentageAvancement={formData.pourcentageAvancement || 0}
                  isNew={!isEdit}
                />
              </Box>
            </Box>
          </Box>
        </form>
      </Box>
    </AppLayout>
  )
}

export default ProjetFormPage
