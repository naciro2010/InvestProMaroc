import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import RichTextEditor from '../../components/common/RichTextEditor'
import DecimalInput from '@/components/ui/DecimalInput'
import { budgetsAPI, conventionsAPI } from '../../lib/api'
import type { Convention } from '../../types/entities'

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
    } catch (error) {
      console.error('Erreur chargement conventions:', error)
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
        alert('Budget modifié avec succès !')
      } else {
        await budgetsAPI.create(formData)
        alert('Budget créé avec succès !')
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
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/budgets')}
            className="mb-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Retour
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Modifier le budget' : 'Nouveau budget'}
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.version}
                    onChange={(e) => handleChange('version', e.target.value)}
                    placeholder="V0, V1, V2..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: V0 (budget initial), V1, V2... (révisions)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Convention *
                  </label>
                  <select
                    required
                    value={formData.conventionId || ''}
                    onChange={(e) => handleChange('conventionId', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Sélectionner une convention --</option>
                    {conventions.map((conv) => (
                      <option key={conv.id} value={conv.id}>
                        {conv.code} - {conv.objet}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date du budget *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateBudget}
                    onChange={(e) => handleChange('dateBudget', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut *
                  </label>
                  <select
                    required
                    value={formData.statut}
                    onChange={(e) => handleChange('statut', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="BROUILLON">Brouillon</option>
                    <option value="SOUMIS">Soumis</option>
                    <option value="VALIDE">Validé</option>
                    <option value="REJETE">Rejeté</option>
                    <option value="ARCHIVE">Archivé</option>
                  </select>
                </div>

                <div>
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
                </div>

                <div>
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
                </div>
              </div>

              <div>
                <RichTextEditor
                  label="Observations"
                  value={formData.observations || ''}
                  onChange={(value) => handleChange('observations', value)}
                  placeholder="Observations ou notes concernant ce budget..."
                  minHeight={120}
                />
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/budgets')}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enregistrement...' : '💾 Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
