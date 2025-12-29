import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa'
import { Card, Button } from '../../components/ui'
import AppLayout from '../../components/layout/AppLayout'
import api from '../../lib/api'

interface MarcheLigne {
  id?: number
  numeroLigne: number
  designation: string
  unite?: string
  quantite?: number
  prixUnitaireHT: number
  montantHT: number
  tauxTVA: number
  montantTVA: number
  montantTTC: number
  imputationAnalytique?: Record<string, string>
  remarques?: string
}

interface Dimension {
  id: number
  code: string
  nom: string
  obligatoire: boolean
  valeurs: { code: string; libelle: string }[]
}

export default function MarcheFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  // État principal
  const [loading, setLoading] = useState(false)
  const [conventions, setConventions] = useState<any[]>([])
  const [fournisseurs, setFournisseurs] = useState<any[]>([])
  const [dimensions, setDimensions] = useState<Dimension[]>([])

  // État du marché
  const [numeroMarche, setNumeroMarche] = useState('')
  const [numAo, setNumAo] = useState('')
  const [dateMarche, setDateMarche] = useState(new Date().toISOString().split('T')[0])
  const [conventionId, setConventionId] = useState<number | null>(null)
  const [fournisseurId, setFournisseurId] = useState<number | null>(null)
  const [objet, setObjet] = useState('')
  const [montantHt, setMontantHt] = useState(0)
  const [tauxTva, setTauxTva] = useState(20)
  const [montantTva, setMontantTva] = useState(0)
  const [montantTtc, setMontantTtc] = useState(0)
  const [statut, setStatut] = useState('EN_COURS')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFinPrevue, setDateFinPrevue] = useState('')
  const [delaiExecutionMois, setDelaiExecutionMois] = useState<number | null>(null)
  const [retenueGarantie, setRetenueGarantie] = useState(0)
  const [remarques, setRemarques] = useState('')

  // État des lignes
  const [lignes, setLignes] = useState<MarcheLigne[]>([])
  const [showLigneForm, setShowLigneForm] = useState(false)

  useEffect(() => {
    fetchData()
    if (isEdit) {
      fetchMarche()
    }
  }, [id])

  useEffect(() => {
    calculerMontants()
  }, [lignes])

  const fetchData = async () => {
    try {
      const [convRes, fournRes, dimRes] = await Promise.all([
        api.get('/api/conventions'),
        api.get('/api/fournisseurs'),
        api.get('/api/dimensions')
      ])
      setConventions(convRes.data)
      setFournisseurs(fournRes.data)
      setDimensions(dimRes.data)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    }
  }

  const fetchMarche = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/marches/${id}`)
      const marche = res.data

      setNumeroMarche(marche.numeroMarche)
      setNumAo(marche.numAo || '')
      setDateMarche(marche.dateMarche)
      setConventionId(marche.convention?.id || null)
      setFournisseurId(marche.fournisseur?.id || null)
      setObjet(marche.objet)
      setMontantHt(marche.montantHt)
      setTauxTva(marche.tauxTva)
      setMontantTva(marche.montantTva)
      setMontantTtc(marche.montantTtc)
      setStatut(marche.statut)
      setDateDebut(marche.dateDebut || '')
      setDateFinPrevue(marche.dateFinPrevue || '')
      setDelaiExecutionMois(marche.delaiExecutionMois)
      setRetenueGarantie(marche.retenueGarantie || 0)
      setRemarques(marche.remarques || '')
      setLignes(marche.lignes || [])
    } catch (error) {
      console.error('Erreur chargement marché:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculerMontants = () => {
    const totalHT = lignes.reduce((sum, l) => sum + l.montantHT, 0)
    const totalTVA = lignes.reduce((sum, l) => sum + l.montantTVA, 0)
    const totalTTC = lignes.reduce((sum, l) => sum + l.montantTTC, 0)

    setMontantHt(totalHT)
    setMontantTva(totalTVA)
    setMontantTtc(totalTTC)
  }

  const ajouterLigne = () => {
    const nouvelleLigne: MarcheLigne = {
      numeroLigne: lignes.length + 1,
      designation: '',
      unite: 'u',
      quantite: 1,
      prixUnitaireHT: 0,
      montantHT: 0,
      tauxTVA: 20,
      montantTVA: 0,
      montantTTC: 0,
      imputationAnalytique: {}
    }
    setLignes([...lignes, nouvelleLigne])
    setShowLigneForm(true)
  }

  const supprimerLigne = (index: number) => {
    const newLignes = lignes.filter((_, i) => i !== index)
    // Renuméroter
    newLignes.forEach((l, i) => l.numeroLigne = i + 1)
    setLignes(newLignes)
  }

  const updateLigne = (index: number, field: keyof MarcheLigne, value: any) => {
    const newLignes = [...lignes]
    newLignes[index] = { ...newLignes[index], [field]: value }

    // Recalculer montants si besoin
    if (['quantite', 'prixUnitaireHT', 'tauxTVA'].includes(field)) {
      const ligne = newLignes[index]
      const qte = ligne.quantite || 1
      ligne.montantHT = qte * ligne.prixUnitaireHT
      ligne.montantTVA = ligne.montantHT * ligne.tauxTVA / 100
      ligne.montantTTC = ligne.montantHT + ligne.montantTVA
    }

    setLignes(newLignes)
  }

  const updateImputationLigne = (index: number, dimensionCode: string, valeurCode: string) => {
    const newLignes = [...lignes]
    newLignes[index].imputationAnalytique = {
      ...newLignes[index].imputationAnalytique,
      [dimensionCode]: valeurCode
    }
    setLignes(newLignes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const data = {
        numeroMarche,
        numAo: numAo || null,
        dateMarche,
        conventionId,
        fournisseurId,
        objet,
        montantHt,
        tauxTva,
        montantTva,
        montantTtc,
        statut,
        dateDebut: dateDebut || null,
        dateFinPrevue: dateFinPrevue || null,
        delaiExecutionMois,
        retenueGarantie,
        remarques: remarques || null,
        lignes
      }

      if (isEdit) {
        await api.put(`/api/marches/${id}`, data)
      } else {
        await api.post('/api/marches', data)
      }

      navigate('/marches')
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error)
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount)
  }

  if (loading && isEdit) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-info"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* En-tête */}
        <Card
          title={isEdit ? 'Modifier Marché' : 'Nouveau Marché'}
          actions={
            <div className="flex gap-2">
              <Button type="submit" variant="success" icon={<FaSave />} disabled={loading}>
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="secondary"
                icon={<FaTimes />}
                onClick={() => navigate('/marches')}
              >
                Annuler
              </Button>
            </div>
          }
        >
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                N° Marché *
              </label>
              <input
                type="text"
                required
                value={numeroMarche}
                onChange={(e) => setNumeroMarche(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                N° Appel d'Offres
              </label>
              <input
                type="text"
                value={numAo}
                onChange={(e) => setNumAo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Marché *
              </label>
              <input
                type="date"
                required
                value={dateMarche}
                onChange={(e) => setDateMarche(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Convention
              </label>
              <select
                value={conventionId || ''}
                onChange={(e) => setConventionId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info"
              >
                <option value="">-- Sélectionner --</option>
                {conventions.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.libelle}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fournisseur *
              </label>
              <select
                required
                value={fournisseurId || ''}
                onChange={(e) => setFournisseurId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info"
              >
                <option value="">-- Sélectionner --</option>
                {fournisseurs.map(f => (
                  <option key={f.id} value={f.id}>{f.raisonSociale}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut *
              </label>
              <select
                required
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info"
              >
                <option value="EN_COURS">En cours</option>
                <option value="VALIDE">Validé</option>
                <option value="TERMINE">Terminé</option>
                <option value="SUSPENDU">Suspendu</option>
                <option value="ANNULE">Annulé</option>
                <option value="EN_ATTENTE">En attente</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objet du Marché *
              </label>
              <textarea
                required
                rows={3}
                value={objet}
                onChange={(e) => setObjet(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Début
              </label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Fin Prévue
              </label>
              <input
                type="date"
                value={dateFinPrevue}
                onChange={(e) => setDateFinPrevue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Délai Exécution (mois)
              </label>
              <input
                type="number"
                min="0"
                value={delaiExecutionMois || ''}
                onChange={(e) => setDelaiExecutionMois(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retenue Garantie (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={retenueGarantie}
                onChange={(e) => setRetenueGarantie(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarques
              </label>
              <textarea
                rows={2}
                value={remarques}
                onChange={(e) => setRemarques(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-info"
              />
            </div>
          </div>
        </Card>

        {/* Lignes du marché */}
        <Card
          title={`Lignes du Marché (${lignes.length})`}
          actions={
            <Button
              type="button"
              variant="primary"
              icon={<FaPlus />}
              onClick={ajouterLigne}
            >
              Ajouter Ligne
            </Button>
          }
        >
          <div className="space-y-4">
            {lignes.map((ligne, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-gray-900">Ligne #{ligne.numeroLigne}</h4>
                  <button
                    type="button"
                    onClick={() => supprimerLigne(index)}
                    className="text-danger hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Désignation *
                    </label>
                    <input
                      type="text"
                      required
                      value={ligne.designation}
                      onChange={(e) => updateLigne(index, 'designation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unité
                    </label>
                    <select
                      value={ligne.unite || 'u'}
                      onChange={(e) => updateLigne(index, 'unite', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="u">Unité (u)</option>
                      <option value="m²">m²</option>
                      <option value="ml">ml</option>
                      <option value="kg">kg</option>
                      <option value="forfait">Forfait</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={ligne.quantite || 1}
                      onChange={(e) => updateLigne(index, 'quantite', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix Unit. HT (MAD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={ligne.prixUnitaireHT}
                      onChange={(e) => updateLigne(index, 'prixUnitaireHT', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant HT
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formatCurrency(ligne.montantHT)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TVA %
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ligne.tauxTVA}
                      onChange={(e) => updateLigne(index, 'tauxTVA', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant TTC
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formatCurrency(ligne.montantTTC)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 font-semibold"
                    />
                  </div>
                </div>

                {/* Imputation Analytique */}
                {dimensions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Imputation Analytique</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dimensions.map(dim => (
                        <div key={dim.code}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {dim.nom} {dim.obligatoire && <span className="text-red-500">*</span>}
                          </label>
                          <select
                            required={dim.obligatoire}
                            value={ligne.imputationAnalytique?.[dim.code] || ''}
                            onChange={(e) => updateImputationLigne(index, dim.code, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            <option value="">-- Sélectionner --</option>
                            {dim.valeurs.map(val => (
                              <option key={val.code} value={val.code}>
                                {val.code} - {val.libelle}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {lignes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune ligne ajoutée. Cliquez sur "Ajouter Ligne" pour commencer.
              </div>
            )}
          </div>

          {/* Totaux */}
          {lignes.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total HT:</span>
                    <span className="font-semibold">{formatCurrency(montantHt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total TVA:</span>
                    <span className="font-semibold">{formatCurrency(montantTva)}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2">
                    <span className="font-bold">Total TTC:</span>
                    <span className="font-bold text-info">{formatCurrency(montantTtc)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </form>
    </AppLayout>
  )
}
