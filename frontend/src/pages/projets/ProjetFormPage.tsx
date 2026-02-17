import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import RichTextEditor from '@/components/common/RichTextEditor';
import { projetsAPI, Projet } from '@/lib/projetsAPI';
import DecimalInput from '@/components/ui/DecimalInput';

const ProjetFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<Partial<Projet>>({
    code: '',
    nom: '',
    description: '',
    budgetTotal: 0,
    dateDebut: '',
    dureeMois: 12,
    statut: 'EN_PREPARATION',
    pourcentageAvancement: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      loadProjet(parseInt(id));
    }
  }, [id, isEdit]);

  const loadProjet = async (projetId: number) => {
    try {
      const response = await projetsAPI.getById(projetId);
      setFormData(response.data);
    } catch (err: unknown) {
      setError('Erreur lors du chargement du projet');
    }
  };

  const handleChange = (field: keyof Projet, value: string | number | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit && id) {
        await projetsAPI.update(parseInt(id), formData);
        alert('Projet modifié avec succès !');
      } else {
        await projetsAPI.create(formData);
        alert('Projet créé avec succès !');
      }
      navigate('/projets');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/projets')}
            className="mb-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Retour
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Modifier le projet' : 'Nouveau projet'}
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
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    disabled={isEdit}
                    placeholder="PRJ-2024-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
                    <option value="EN_PREPARATION">En préparation</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="SUSPENDU">Suspendu</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="ANNULE">Annulé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <RichTextEditor
                  label="Description"
                  value={formData.description || ''}
                  onChange={(value) => handleChange('description', value)}
                  placeholder="Description du projet..."
                  minHeight={120}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
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
                </div>

                <div>
                  <DecimalInput
                    value={formData.dureeMois || 0}
                    onChange={(value) => handleChange('dureeMois', value)}
                    min={1}
                    decimalPlaces={0}
                    label="Durée (mois)"
                    fullWidth
                    size="small"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.dateDebut || ''}
                    onChange={(e) => handleChange('dateDebut', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={formData.localisation || ''}
                    onChange={(e) => handleChange('localisation', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <RichTextEditor
                  label="Objectifs"
                  value={formData.objectifs || ''}
                  onChange={(value) => handleChange('objectifs', value)}
                  placeholder="Objectifs du projet..."
                  minHeight={100}
                />
              </div>

              <div>
                <RichTextEditor
                  label="Remarques"
                  value={formData.remarques || ''}
                  onChange={(value) => handleChange('remarques', value)}
                  placeholder="Remarques ou observations..."
                  minHeight={80}
                />
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/projets')}
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
  );
};

export default ProjetFormPage;
