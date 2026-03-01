import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Container, Skeleton, Alert } from '@mui/material'
import AppLayout from '@/components/layout/AppLayout'
import {
  ControlPanel, FormView, FieldGroup, Field, Notebook, StatusBadge,
  InlineEditField, EditFieldDialog,
  type StatusStep,
} from '@/components/core'
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

const DIALOG_LABELS: Record<string, string> = {
  description: 'Description',
  objectifs: 'Objectifs',
  remarques: 'Remarques',
}

interface DialogFieldState {
  key: string
  label: string
  value: string
  mode: 'richtext' | 'textarea'
}

const ProjetDetailPageModern = () => {
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projet, setProjet] = useState<Projet | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogField, setDialogField] = useState<DialogFieldState | null>(null)

  const projetId = id ? parseInt(id) : 0

  const loadProjet = useCallback(async (pid: number) => {
    try {
      setLoading(true)
      const response = await projetsAPI.getById(pid)
      setProjet(response.data as Projet)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du projet')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (projetId) loadProjet(projetId)
  }, [projetId, loadProjet])

  const handleFieldSave = async (fieldKey: string, value: string | number | null) => {
    if (!projet || !projet.id) return
    const payload = {
      nom: projet.nom,
      description: projet.description || '',
      statut: projet.statut,
      budgetTotal: projet.budgetTotal,
      dureeMois: projet.dureeMois ?? 12,
      dateDebut: projet.dateDebut || '',
      localisation: projet.localisation || '',
      pourcentageAvancement: projet.pourcentageAvancement,
      objectifs: projet.objectifs || '',
      remarques: projet.remarques || '',
      [fieldKey]: value,
    }
    await projetsAPI.update(projet.id, payload)
    await loadProjet(projet.id)
    showToast('Projet mis a jour', 'success')
  }

  const openFieldDialog = (fieldKey: string, value: string) => {
    setDialogField({ key: fieldKey, label: DIALOG_LABELS[fieldKey] || fieldKey, value, mode: 'textarea' })
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
            isEditing={false}
            statusSteps={effectiveSteps}
            currentStatus={projet.statut}
          >
            {/* Title */}
            <Box sx={{ fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.textPrimary, mb: 0.5 }}>
              {projet.nom}
            </Box>
            <Box sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 3 }}>
              Code: {projet.code}{projet.conventionNumero ? ` · Convention: ${projet.conventionNumero}` : ''}
            </Box>

            {/* Informations */}
            <Box sx={{ mb: 3 }}>
              <FieldGroup title="Informations" columns={3}>
                <InlineEditField config={{ fieldKey: 'code', label: 'Code', type: 'text', value: projet.code || '', editable: false }} onSave={handleFieldSave} />
                <InlineEditField config={{ fieldKey: 'nom', label: 'Nom', type: 'text', value: projet.nom || '', editable: canEdit }} onSave={handleFieldSave} />
                <InlineEditField config={{ fieldKey: 'statut', label: 'Statut', type: 'select', value: projet.statut, options: STATUT_OPTIONS, editable: canEdit, displayValue: <StatusBadge status={projet.statut} /> }} onSave={handleFieldSave} />
                <InlineEditField config={{ fieldKey: 'pourcentageAvancement', label: 'Avancement', type: 'number', value: projet.pourcentageAvancement, editable: canEdit, displayValue: `${projet.pourcentageAvancement}%`, inputProps: { min: 0, max: 100, step: 0.1 } }} onSave={handleFieldSave} />
                <InlineEditField config={{ fieldKey: 'budgetTotal', label: 'Budget total', type: 'number', value: projet.budgetTotal, editable: canEdit, isMoney: true, inputProps: { min: 0, step: 0.01 } }} onSave={handleFieldSave} />
                <Field label="Budget consomme" value={formatCurrency(projet.budgetConsomme)} isMoney />
                {projet.estEnRetard && (
                  <Field label="Retard" value={<StatusBadge status="REJETE" />} />
                )}
              </FieldGroup>
            </Box>

            {/* Budget & Planning */}
            <Box sx={{ mb: 3 }}>
              <FieldGroup title="Budget & Planning" columns={3}>
                <InlineEditField config={{ fieldKey: 'dureeMois', label: 'Duree (mois)', type: 'number', value: projet.dureeMois ?? 0, editable: canEdit, displayValue: projet.dureeMois ? `${projet.dureeMois} mois` : '-', inputProps: { min: 1 } }} onSave={handleFieldSave} />
                <InlineEditField config={{ fieldKey: 'dateDebut', label: 'Date debut', type: 'date', value: projet.dateDebut || '', editable: canEdit }} onSave={handleFieldSave} />
                <InlineEditField config={{ fieldKey: 'localisation', label: 'Localisation', type: 'text', value: projet.localisation || '', editable: canEdit }} onSave={handleFieldSave} />
              </FieldGroup>
            </Box>

            {/* Details */}
            <Box sx={{ mb: 3 }}>
              <FieldGroup title="Details" columns={1}>
                <InlineEditField config={{ fieldKey: 'description', label: 'Description', type: 'richtext', value: projet.description || '', editable: canEdit, fullWidth: true }} onSave={handleFieldSave} onOpenDialog={openFieldDialog} />
                <InlineEditField config={{ fieldKey: 'objectifs', label: 'Objectifs', type: 'richtext', value: projet.objectifs || '', editable: canEdit, fullWidth: true }} onSave={handleFieldSave} onOpenDialog={openFieldDialog} />
                <InlineEditField config={{ fieldKey: 'remarques', label: 'Remarques', type: 'richtext', value: projet.remarques || '', editable: canEdit, fullWidth: true }} onSave={handleFieldSave} onOpenDialog={openFieldDialog} />
              </FieldGroup>
            </Box>

            {/* Stats Cards */}
            <ProjetStatsCards
              budgetTotal={projet.budgetTotal}
              pourcentageAvancement={projet.pourcentageAvancement}
              budgetConsomme={projet.budgetConsomme}
              estEnRetard={projet.estEnRetard}
              formatCurrency={formatCurrency}
            />

            {/* Progress Bar */}
            <ProjetProgressBar pourcentageAvancement={projet.pourcentageAvancement} />

            {/* Notebook Tabs */}
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
          </FormView>
        </Container>
      </Box>

      {/* Edit Field Dialog for rich text / textarea fields */}
      {dialogField && (
        <EditFieldDialog
          open
          onClose={() => setDialogField(null)}
          onSave={handleFieldSave}
          fieldKey={dialogField.key}
          fieldLabel={dialogField.label}
          currentValue={dialogField.value}
          mode={dialogField.mode}
        />
      )}
    </AppLayout>
  )
}

export default ProjetDetailPageModern
