import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaSave, FaArrowLeft } from 'react-icons/fa'
import AppLayout from '../../components/layout/AppLayout'
import { Card, Button } from '../../components/ui'
import api from '../../lib/api'

interface ConventionFormData {
  numero: string
  code: string
  libelle: string
  typeConvention: 'CADRE' | 'NON_CADRE' | 'SPECIFIQUE' | 'AVENANT'
  statut: 'VALIDEE' | 'EN_COURS' | 'ACHEVE' | 'EN_RETARD' | 'ANNULE'
  dateConvention: string
  budget: number
  tauxCommission: number
  dateDebut: string
  dateFin: string
}

export default function ConventionFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ConventionFormData>({
    numero: '',
    code: '',
    libelle: '',
    typeConvention: 'CADRE',
    statut: 'EN_COURS',
    dateConvention: new Date().toISOString().split('T')[0],
    budget: 0,
    tauxCommission: 2.5,
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
  })

  useEffect(() => {
    if (isEdit) {
      fetchConvention()
    }
  }, [id])

  const fetchConvention = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/conventions/${id}`)
      const data = response.data
      setFormData({
        ...data,
        dateConvention: data.dateConvention?.split('T')[0] || '',
        dateDebut: data.dateDebut?.split('T')[0] || '',
        dateFin: data.dateFin?.split('T')[0] || '',
      })
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      alert('Erreur lors du chargement de la convention')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (isEdit) {
        await api.put(`/api/conventions/${id}`, formData)
      } else {
        await api.post('/api/conventions', formData)
      }
      navigate('/conventions')
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'tauxCommission' ? parseFloat(value) || 0 : value
    }))
  }

  if (loading && isEdit) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gitlab-orange"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Modifier Convention' : 'Nouvelle Convention'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Modifier les informations de la convention' : 'Créer une nouvelle convention d\'intervention'}
            </p>
          </div>
          <Button
            variant="secondary"
            icon={<FaArrowLeft />}
            onClick={() => navigate('/conventions')}
          >
            Retour
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card title="Informations de la Convention">
            <div className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="numero"
                    required
                    value={formData.numero}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gitlab-orange focus:border-transparent"
                    placeholder="CONV-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    required
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gitlab-orange focus:border-transparent"
                    placeholder="CONV001"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Libellé <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  name="libelle"
                  required
                  value={formData.libelle}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gitlab-orange focus:border-transparent"
                  placeholder="Convention d'intervention pour..."
                />
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de Convention <span className="text-danger-500">*</span>
                  </label>
                  <select
                    name="typeConvention"
                    required
                    value={formData.typeConvention}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gitlab-orange focus:border-transparent"
                  >
                    <option value="CADRE">Cadre</option>
                    <option value="NON_CADRE">Non-Cadre</option>
                    <option value="SPECIFIQUE">Spécifique</option>
                    <option value="AVENANT">Avenant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut <span className="text-danger-500">*</span>
                  </label>
                  <select
                    name="statut"
                    required
                    value={formData.statut}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gitlab-orange focus:border-transparent"
                  >
                    <option value="EN_COURS">En cours</option>
                    <option value="VALIDEE">Validée</option>
                    <option value="ACHEVE">Achevé</option>
                    <option value="EN_RETARD">En retard</option>
                    <option value="ANNULE">Annulé</option>
                  </select>
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Convention <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateConvention"
                    required
                    value={formData.dateConvention}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gitlab-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Début <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateDebut"
                    required
                    value={formData.dateDebut}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gitlab-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Fin
                  </label>
                  <input
                    type="date"
                    name="dateFin"
                    value={formData.dateFin}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gitlab-orange focus:border-transparent"
                  />
                </div>
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (MAD) <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="budget"
                    required
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gitlab-orange focus:border-transparent"
                    placeholder="1000000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taux Commission (%) <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="tauxCommission"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.tauxCommission}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gitlab-orange focus:border-transparent"
                    placeholder="2.5"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/conventions')}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  icon={<FaSave />}
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </AppLayout>
  )
}
