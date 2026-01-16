import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa'
import AppLayout from '../../components/layout/AppLayout'
import { Card, Button, Badge } from '../../components/ui'
import { budgetsAPI } from '../../lib/api'
import type { Budget, StatutBudget } from '../../types/entities'

export default function BudgetDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [budget, setBudget] = useState<Budget | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchBudget(parseInt(id))
    }
  }, [id])

  const fetchBudget = async (budgetId: number) => {
    try {
      setLoading(true)
      const response = await budgetsAPI.getById(budgetId)
      setBudget(response.data.data || response.data)
    } catch (error) {
      console.error('Erreur chargement budget:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!budget || !id) return
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) return

    try {
      await budgetsAPI.delete(parseInt(id))
      alert('Budget supprimé avec succès')
      navigate('/budgets')
    } catch (error) {
      console.error('Erreur suppression budget:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-MA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatutBadge = (statut: StatutBudget) => {
    const config: Record<StatutBudget, { variant: 'success' | 'danger' | 'warning' | 'info' | 'gray'; label: string }> = {
      BROUILLON: { variant: 'gray', label: 'Brouillon' },
      SOUMIS: { variant: 'warning', label: 'Soumis' },
      VALIDE: { variant: 'success', label: 'Validé' },
      REJETE: { variant: 'danger', label: 'Rejeté' },
      ARCHIVE: { variant: 'gray', label: 'Archivé' },
    }
    const cfg = config[statut]
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    )
  }

  if (!budget) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Budget non trouvé</p>
          <button
            onClick={() => navigate('/budgets')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retour à la liste
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/budgets')}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budget {budget.version}</h1>
              <p className="text-gray-600 mt-1">Détails du budget</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              icon={<FaEdit />}
              onClick={() => navigate(`/budgets/${budget.id}/modifier`)}
            >
              Modifier
            </Button>
            <Button
              variant="danger"
              icon={<FaTrash />}
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </div>
        </div>

        {/* Informations générales */}
        <Card title="Informations Générales">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Version</label>
              <p className="text-lg font-semibold text-gray-900">{budget.version}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Statut</label>
              <div>{getStatutBadge(budget.statut)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Date du budget</label>
              <p className="text-lg text-gray-900">{formatDate(budget.dateBudget)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Convention</label>
              <p className="text-lg text-gray-900">
                {budget.convention?.code || '-'} - {budget.convention?.objet || '-'}
              </p>
            </div>
          </div>
        </Card>

        {/* Montants */}
        <Card title="Montants">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-blue-700 mb-1">Plafond Convention</label>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(budget.plafondConvention)}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-green-700 mb-1">Total Budget</label>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(budget.totalBudget)}</p>
            </div>

            <div className={`p-4 rounded-lg ${budget.deltaMontant && budget.deltaMontant < 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delta</label>
              <p className={`text-2xl font-bold ${budget.deltaMontant && budget.deltaMontant < 0 ? 'text-red-900' : 'text-gray-900'}`}>
                {budget.deltaMontant ? (
                  <>
                    {budget.deltaMontant > 0 ? '+' : ''}
                    {formatCurrency(budget.deltaMontant)}
                  </>
                ) : (
                  '-'
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* Observations */}
        {budget.observations && (
          <Card title="Observations">
            <p className="text-gray-700 whitespace-pre-wrap">{budget.observations}</p>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
