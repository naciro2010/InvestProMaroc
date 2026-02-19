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
import AppLayout from '../../components/layout/AppLayout'
import {
  StickyActionBar,
  FormLayout,
  FormPageSection,
  FormGroup,
  FormField,
  ControlPanel,
} from '@/components/core'
import RichTextEditor from '../../components/common/RichTextEditor'
import DecimalInput from '@/components/ui/DecimalInput'
import { budgetsAPI, conventionsAPI } from '../../lib/api'
import type { Convention } from '../../types/entities'
import { colors } from '../../lib/designSystem'

const extractList = <T,>(responseData: unknown): T[] => {
  if (Array.isArray(responseData)) return responseData as T[]
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    const nested = (responseData as { data?: unknown }).data
    if (Array.isArray(nested)) return nested as T[]
  }
  return []
}

export default function BudgetFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [conventions, setConventions] = useState<Convention[]>([])
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    version: '',
    conventionId: undefined as number | undefined,
    dateBudget: new Date().toISOString().split('T')[0],
    plafondConvention: 0,
    totalBudget: 0,
    statut: 'BROUILLON' as const,
    observations: '',
  })

  useEffect(() => {
    fetchConventions()
    if (isEdit && id) {
      fetchBudget(parseInt(id))
    }
  }, [id, isEdit])

  const fetchConventions = async () => {
    try {
      const response = await conventionsAPI.getAll()
      setConventions(extractList<Convention>(response.data))
    } catch (err: unknown) {
      console.error('Erreur chargement conventions:', err)
    }
  }

  const fetchBudget = async (budgetId: number) => {
    try {
      setLoading(true)
      const response = await budgetsAPI.getById(budgetId)
      const budget = response.data.data || response.data
      setFormData({
        version: budget.version,
        conventionId: budget.convention?.id,
        dateBudget: budget.dateBudget,
        plafondConvention: budget.plafondConvention,
        totalBudget: budget.totalBudget,
        statut: budget.statut,
        observations: budget.observations || '',
      })
    } catch {
      setError('Erreur lors du chargement du budget')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number | undefined) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEdit && id) {
        await budgetsAPI.update(parseInt(id), formData)
      } else {
        await budgetsAPI.create(formData)
      }
      navigate('/budgets')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      setError(errorMessage)
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
          { label: 'Budgets', path: '/budgets' },
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
        hideBottomRow
      />
      <Box sx={{ bgcolor: colors.background, minHeight: 'calc(100vh - 48px)' }}>
        <form onSubmit={handleSubmit}>
          <StickyActionBar
            title={isEdit ? 'Modifier le budget' : 'Nouveau budget'}
            showBack
            backUrl="/budgets"
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
                    label="Version"
                    required
                    fullWidth
                    size="small"
                    value={formData.version}
                    onChange={(e) => handleChange('version', e.target.value)}
                    placeholder="V0, V1, V2..."
                    helperText="Format: V0 (budget initial), V1, V2... (revisions)"
                  />
                </FormField>
                <FormField>
                  <TextField
                    label="Convention"
                    required
                    fullWidth
                    size="small"
                    select
                    value={formData.conventionId || ''}
                    onChange={(e) => handleChange('conventionId', e.target.value ? parseInt(e.target.value) : undefined)}
                  >
                    <MenuItem value="">-- Selectionner une convention --</MenuItem>
                    {conventions.map((conv) => (
                      <MenuItem key={conv.id} value={conv.id}>
                        {conv.code} - {conv.objet}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
              </FormGroup>
              <FormGroup columns={2}>
                <FormField>
                  <TextField
                    label="Date du budget"
                    type="date"
                    required
                    fullWidth
                    size="small"
                    value={formData.dateBudget}
                    onChange={(e) => handleChange('dateBudget', e.target.value)}
                    InputLabelProps={{ shrink: true }}
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
                    <MenuItem value="BROUILLON">Brouillon</MenuItem>
                    <MenuItem value="SOUMIS">Soumis</MenuItem>
                    <MenuItem value="VALIDE">Valide</MenuItem>
                    <MenuItem value="REJETE">Rejete</MenuItem>
                    <MenuItem value="ARCHIVE">Archive</MenuItem>
                  </TextField>
                </FormField>
              </FormGroup>
            </FormPageSection>

            <FormPageSection title="Montants">
              <FormGroup columns={2}>
                <FormField>
                  <DecimalInput
                    value={formData.plafondConvention}
                    onChange={(value) => handleChange('plafondConvention', value)}
                    min={0}
                    decimalPlaces={2}
                    label="Plafond Convention (DH)"
                    required
                    fullWidth
                    size="small"
                  />
                </FormField>
                <FormField>
                  <DecimalInput
                    value={formData.totalBudget}
                    onChange={(value) => handleChange('totalBudget', value)}
                    min={0}
                    decimalPlaces={2}
                    label="Total Budget (DH)"
                    required
                    fullWidth
                    size="small"
                  />
                </FormField>
              </FormGroup>
            </FormPageSection>

            <FormPageSection title="Observations">
              <FormGroup columns={1}>
                <FormField>
                  <RichTextEditor
                    label="Observations"
                    value={formData.observations || ''}
                    onChange={(value) => handleChange('observations', value)}
                    placeholder="Observations ou notes concernant ce budget..."
                    minHeight={120}
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
