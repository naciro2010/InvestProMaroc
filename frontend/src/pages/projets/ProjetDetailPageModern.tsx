import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Container, Skeleton, Alert, TextField, MenuItem } from '@mui/material'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, FormView, FieldGroup, Field, Notebook, StatusBadge, type StatusStep } from '@/components/core'
import { useToast } from '@/contexts/ToastContext'
import { projetsAPI } from '@/lib/projetsAPI'
import { ProjetStatsCards, ProjetProgressBar, ProjetChartTab, ProjetWorkflowActions } from '@/components/projets/detail'
import {
  ProjetInfoCard,
  ProjetConventionsTab,
  ProjetMarchesTab,
  ProjetBudgetSection,
  ProjetHistoriqueTab,
  Projet,
  formatCurrency,
} from './components'
import { colors, typography } from '@/lib/designSystem'

/** Form data shape for inline editing */
interface ProjetEditForm {
  nom: string
  description: string
  statut: string
  budgetTotal: number
  dureeMois: number
  dateDebut: string
  localisation: string
  pourcentageAvancement: number
  objectifs: string
  remarques: string
}

const STATUT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'EN_PREPARATION', label: 'En preparation' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'TERMINE', label: 'Termine' },
  { value: 'ANNULE', label: 'Annule' },
]

const STATUS_STEPS: StatusStep[] = [
  { value: 'EN_PREPARATION', label: 'Preparation' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'TERMINE', label: 'Termine' },
]

const buildFormFromProjet = (p: Projet): ProjetEditForm => ({
  nom: p.nom || '',
  description: p.description || '',
  statut: p.statut || 'EN_PREPARATION',
  budgetTotal: p.budgetTotal ?? 0,
  dureeMois: p.dureeMois ?? 12,
  dateDebut: p.dateDebut || '',
  localisation: p.localisation || '',
  pourcentageAvancement: p.pourcentageAvancement ?? 0,
  objectifs: p.objectifs || '',
  remarques: p.remarques || '',
})

const inputSx = { '& .MuiInputBase-root': { fontSize: typography.sizes.sm } }

const ProjetDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projet, setProjet] = useState<Projet | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<ProjetEditForm>(buildFormFromProjet({} as Projet))

  const projetId = id ? parseInt(id) : 0

  const loadProjet = useCallback(async (pid: number) => {
    try {
      setLoading(true)
      const response = await projetsAPI.getById(pid)
      const data = response.data as Projet
      setProjet(data)
      setForm(buildFormFromProjet(data))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du projet')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (projetId) loadProjet(projetId)
  }, [projetId, loadProjet])

  const handleFieldChange = (field: keyof ProjetEditForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!projet?.id) return
    try {
      setIsSaving(true)
      await projetsAPI.update(projet.id, {
        nom: form.nom,
        description: form.description,
        statut: form.statut,
        budgetTotal: form.budgetTotal,
        dureeMois: form.dureeMois,
        dateDebut: form.dateDebut,
        localisation: form.localisation,
        pourcentageAvancement: form.pourcentageAvancement,
        objectifs: form.objectifs,
        remarques: form.remarques,
      })
      showToast('Projet mis a jour avec succes', 'success')
      setIsEditing(false)
      await loadProjet(projet.id)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      showToast(axiosErr.response?.data?.message || 'Erreur lors de la sauvegarde', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (projet) setForm(buildFormFromProjet(projet))
    setIsEditing(false)
  }

  const handleToggleEdit = () => {
    if (projet) setForm(buildFormFromProjet(projet))
    setIsEditing(true)
  }

  const generateProgressData = () => {
    if (!projet) return []
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    return Array.from({ length: currentMonth + 1 }, (_, i) => ({
      mois: months[i],
      avancement: Math.min((i + 1) * (projet.pourcentageAvancement / (currentMonth + 1)), projet.pourcentageAvancement),
      planifie: (i + 1) * (100 / 12),
    }))
  }

  const effectiveSteps: StatusStep[] = (() => {
    if (!projet) return STATUS_STEPS
    if (projet.statut === 'ANNULE') return [
      ...STATUS_STEPS.slice(0, 3),
      { value: 'ANNULE', label: 'Annule', variant: 'danger' as const },
    ]
    return STATUS_STEPS
  })()

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
          <Box sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.border}`, px: 3, py: 1.5 }}>
            <Skeleton variant="text" width={300} height={32} />
          </Box>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Container>
        </Box>
      </AppLayout>
    )
  }

  if (error || !projet) {
    return (
      <AppLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Projet non trouve'}</Alert>
        </Container>
      </AppLayout>
    )
  }

  const canEdit = projet.statut === 'EN_PREPARATION'

  return (
    <AppLayout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
        <ControlPanel
          breadcrumbs={[
            { label: 'Projets', path: '/projets' },
            { label: projet.code || `#${projet.id}` },
          ]}
          actions={
            <ProjetWorkflowActions
              projetId={projetId}
              statut={projet.statut}
              onSuccess={(msg) => showToast(msg, 'success')}
              onError={(msg) => showToast(msg, 'error')}
              onReload={() => loadProjet(projetId)}
            />
          }
          hideBottomRow
        />

        <Container maxWidth="xl" sx={{ py: 3 }}>
          <FormView
            isEditing={isEditing}
            onToggleEdit={canEdit ? handleToggleEdit : undefined}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
            statusSteps={effectiveSteps}
            currentStatus={projet.statut}
          >
            {/* Title */}
            <Box sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.textPrimary, mb: 0.5 }}>
              {isEditing ? form.nom : projet.nom}
            </Box>
            <Box sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3 }}>
              Code: {projet.code}{projet.conventionNumero ? ` · Convention: ${projet.conventionNumero}` : ''}
            </Box>

            {/* Informations */}
            <Box sx={{ mb: 3 }}>
              <FieldGroup title="Informations" columns={3}>
                <Field label="Code" value={projet.code} />
                <Field label="Nom" value={projet.nom} isEditing={isEditing} required
                  editContent={<TextField fullWidth size="small" value={form.nom} sx={inputSx}
                    onChange={(e) => handleFieldChange('nom', e.target.value)} />} />
                <Field label="Statut" value={<StatusBadge status={projet.statut} />} isEditing={isEditing}
                  editContent={
                    <TextField fullWidth size="small" select value={form.statut} sx={inputSx}
                      onChange={(e) => handleFieldChange('statut', e.target.value)}>
                      {STATUT_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField>
                  } />
                <Field label="Avancement" value={`${projet.pourcentageAvancement}%`} isEditing={isEditing}
                  editContent={<TextField fullWidth size="small" type="number" value={form.pourcentageAvancement} sx={inputSx}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    onChange={(e) => handleFieldChange('pourcentageAvancement', parseFloat(e.target.value) || 0)} />} />
                <Field label="Budget total" value={formatCurrency(projet.budgetTotal)} isMoney isEditing={isEditing}
                  editContent={<TextField fullWidth size="small" type="number" value={form.budgetTotal} sx={inputSx}
                    inputProps={{ min: 0, step: 0.01 }}
                    onChange={(e) => handleFieldChange('budgetTotal', parseFloat(e.target.value) || 0)} />} />
                <Field label="Budget consomme" value={formatCurrency(projet.budgetConsomme)} isMoney />
                {(projet.estEnRetard || isEditing) && !isEditing && (
                  <Field label="Retard" value={<StatusBadge status="REJETE" />} />
                )}
              </FieldGroup>
            </Box>

            {/* Budget & Planning (visible in edit mode) */}
            {isEditing && (
              <Box sx={{ mb: 3 }}>
                <FieldGroup title="Budget & Planning" columns={3}>
                  <Field label="Duree (mois)" value={projet.dureeMois ? `${projet.dureeMois} mois` : '-'} isEditing
                    editContent={<TextField fullWidth size="small" type="number" value={form.dureeMois} sx={inputSx}
                      inputProps={{ min: 1 }}
                      onChange={(e) => handleFieldChange('dureeMois', parseInt(e.target.value) || 1)} />} />
                  <Field label="Date debut" value={projet.dateDebut || '-'} isEditing
                    editContent={<TextField fullWidth size="small" type="date" value={form.dateDebut} sx={inputSx}
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => handleFieldChange('dateDebut', e.target.value)} />} />
                  <Field label="Localisation" value={projet.localisation || '-'} isEditing
                    editContent={<TextField fullWidth size="small" value={form.localisation} sx={inputSx}
                      onChange={(e) => handleFieldChange('localisation', e.target.value)} />} />
                </FieldGroup>
              </Box>
            )}

            {/* Details (visible in edit mode) */}
            {isEditing && (
              <Box sx={{ mb: 3 }}>
                <FieldGroup title="Details" columns={1}>
                  <Field label="Description" value={projet.description || '-'} isEditing fullWidth
                    editContent={<TextField fullWidth size="small" multiline minRows={3} value={form.description} sx={inputSx}
                      onChange={(e) => handleFieldChange('description', e.target.value)} />} />
                  <Field label="Objectifs" value={projet.objectifs || '-'} isEditing fullWidth
                    editContent={<TextField fullWidth size="small" multiline minRows={2} value={form.objectifs} sx={inputSx}
                      onChange={(e) => handleFieldChange('objectifs', e.target.value)} />} />
                  <Field label="Remarques" value={projet.remarques || '-'} isEditing fullWidth
                    editContent={<TextField fullWidth size="small" multiline minRows={2} value={form.remarques} sx={inputSx}
                      onChange={(e) => handleFieldChange('remarques', e.target.value)} />} />
                </FieldGroup>
              </Box>
            )}

            {/* Stats and Progress (hidden during edit) */}
            {!isEditing && (
              <>
                <ProjetStatsCards
                  budgetTotal={projet.budgetTotal}
                  pourcentageAvancement={projet.pourcentageAvancement}
                  budgetConsomme={projet.budgetConsomme}
                  estEnRetard={projet.estEnRetard}
                  formatCurrency={formatCurrency}
                />
                <ProjetProgressBar pourcentageAvancement={projet.pourcentageAvancement} />
              </>
            )}

            {/* Notebook tabs (hidden during edit) */}
            {!isEditing && (
              <Box sx={{ mt: 3 }}>
                <Notebook
                  tabs={[
                    {
                      label: 'Informations',
                      content: (
                        <Box>
                          <ProjetInfoCard projetId={projetId} />
                          <Box sx={{ mt: 3 }}>
                            <ProjetBudgetSection projetId={projetId} />
                          </Box>
                        </Box>
                      ),
                    },
                    { label: 'Conventions', content: <ProjetConventionsTab projetId={projetId} /> },
                    { label: 'Marches lies', content: <ProjetMarchesTab projetId={projetId} /> },
                    { label: 'Avancement', content: <ProjetChartTab chartData={generateProgressData()} /> },
                    { label: 'Historique', content: <ProjetHistoriqueTab projetId={projetId} /> },
                  ]}
                />
              </Box>
            )}
          </FormView>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default ProjetDetailPageModern
