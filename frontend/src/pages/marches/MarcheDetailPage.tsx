import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FaArrowLeft, FaEdit, FaFileInvoice, FaShoppingCart, FaChartLine } from 'react-icons/fa'
import { Card, Button, StatusBadge } from '../../components/ui'
import AppLayout from '../../components/layout/AppLayout'
import api from '../../lib/api'
import { Marche as MarcheType, Decompte as DecompteType, Fournisseur } from '../../types/entities'

// Marche étendu avec champs calculés
interface Marche extends Omit<MarcheType, 'montantHT' | 'montantTVA' | 'montantTTC' | 'tauxTVA'> {
  montantHt: number
  montantTva: number
  montantTtc: number
  tauxTva: number
  fournisseur?: Partial<Fournisseur>
  projet?: {
    id: number
    nom: string
    code: string
  }
}

// Decompte étendu avec champs calculés
interface Decompte extends DecompteType {
  numeroSituation?: number
  typeDecompte?: string
  montantTtc: number
  tauxAvancement?: number
}

export default function MarcheDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [marche, setMarche] = useState<Marche | null>(null)
  const [decomptes, setDecomptes] = useState<Decompte[]>([])
  const [totalPaye, setTotalPaye] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'decomptes' | 'bonscommande'>('details')

  useEffect(() => {
    fetchMarcheDetails()
  }, [id])

  const fetchMarcheDetails = async () => {
    try {
      setLoading(true)
      const [marcheRes, decomptesRes, totalPayeRes] = await Promise.all([
        api.get(`/api/marches/${id}`),
        api.get(`/api/decomptes/marche/${id}`),
        api.get(`/api/decomptes/marche/${id}/total-paye`)
      ])

      setMarche(marcheRes.data)
      setDecomptes(decomptesRes.data)
      setTotalPaye(totalPayeRes.data.totalPaye)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
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

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-MA')
  }

  const calculateResteAPayer = () => {
    if (!marche) return 0
    return marche.montantTtc - totalPaye
  }

  const calculateAvancementGlobal = () => {
    if (!marche || marche.montantTtc === 0) return 0
    return (totalPaye / marche.montantTtc) * 100
  }

  if (loading || !marche) {
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
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/marches')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-xl text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold font-rubik text-gray-800">
              Marché {marche.numeroMarche}
            </h1>
            <p className="text-gray-600">{marche.objet}</p>
          </div>
        </div>
        <Link to={`/marches/${id}/edit`}>
          <Button variant="secondary" icon={<FaEdit />}>
            Modifier
          </Button>
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Montant TTC">
          <div className="text-2xl font-bold font-rubik text-info">
            {formatCurrency(marche.montantTtc)}
          </div>
        </Card>

        <Card title="Total Payé">
          <div className="text-2xl font-bold font-rubik text-success">
            {formatCurrency(totalPaye)}
          </div>
        </Card>

        <Card title="Reste à Payer">
          <div className="text-2xl font-bold font-rubik text-warning">
            {formatCurrency(calculateResteAPayer())}
          </div>
        </Card>

        <Card title="Avancement">
          <div className="text-2xl font-bold font-rubik text-info">
            {calculateAvancementGlobal().toFixed(1)}%
          </div>
        </Card>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-info text-info'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaFileInvoice className="inline mr-2" />
            Détails du Marché
          </button>
          <button
            onClick={() => setActiveTab('decomptes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'decomptes'
                ? 'border-info text-info'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaChartLine className="inline mr-2" />
            Décomptes ({decomptes.length})
          </button>
          <button
            onClick={() => setActiveTab('bonscommande')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bonscommande'
                ? 'border-info text-info'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaShoppingCart className="inline mr-2" />
            Bons de Commande
          </button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations générales */}
          <Card title="Informations Générales">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">N° Marché</dt>
                <dd className="text-sm text-gray-900 font-semibold">{marche.numeroMarche}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">N° Appel d'Offres</dt>
                <dd className="text-sm text-gray-900">{marche.numAO || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Date Marché</dt>
                <dd className="text-sm text-gray-900">{formatDate(marche.dateMarche)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Statut</dt>
                <dd className="text-sm">
                  <StatusBadge status={marche.statut === 'VALIDE' ? 'VALIDEE' : marche.statut === 'TERMINE' ? 'ACHEVE' : 'EN_COURS'} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Date Début</dt>
                <dd className="text-sm text-gray-900">{formatDate(marche.dateDebut)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Date Fin Prévue</dt>
                <dd className="text-sm text-gray-900">{formatDate(marche.dateFinPrevue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Délai d'exécution</dt>
                <dd className="text-sm text-gray-900">
                  {marche.delaiExecutionMois ? `${marche.delaiExecutionMois} mois` : '-'}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Montants */}
          <Card title="Détail des Montants">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Montant HT</dt>
                <dd className="text-sm text-gray-900 font-semibold">
                  {formatCurrency(marche.montantHt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">
                  TVA ({marche.tauxTva}%)
                </dt>
                <dd className="text-sm text-gray-900">{formatCurrency(marche.montantTva)}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <dt className="text-base font-semibold text-gray-700">Montant TTC</dt>
                <dd className="text-base font-bold text-success">
                  {formatCurrency(marche.montantTtc)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Retenue de Garantie</dt>
                <dd className="text-sm text-gray-900">{formatCurrency(marche.retenueGarantie ?? 0)}</dd>
              </div>
            </dl>
          </Card>

          {/* Partenaires */}
          <Card title="Fournisseur">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Raison Sociale</dt>
                <dd className="text-sm text-gray-900 font-semibold">
                  {marche.fournisseur?.raisonSociale || '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">ICE</dt>
                <dd className="text-sm text-gray-900">{marche.fournisseur?.ice || '-'}</dd>
              </div>
            </dl>
          </Card>

          {/* Projet */}
          <Card title="Projet Associé">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Code Projet</dt>
                <dd className="text-sm text-gray-900 font-semibold">
                  {marche.projet?.code || '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Nom Projet</dt>
                <dd className="text-sm text-gray-900">{marche.projet?.nom || '-'}</dd>
              </div>
            </dl>
          </Card>

          {/* Remarques */}
          {marche.remarques && (
            <Card title="Remarques" className="lg:col-span-2">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{marche.remarques}</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'decomptes' && (
        <Card
          title="Décomptes du Marché"
          actions={
            <Link to={`/decomptes/nouveau?marcheId=${id}`}>
              <Button variant="success" icon={<FaFileInvoice />}>
                Nouveau Décompte
              </Button>
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    N° Situation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    N° Décompte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Cumul
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Avancement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {decomptes.map((decompte) => (
                  <tr key={decompte.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {decompte.numeroSituation || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{decompte.numeroDecompte}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-info text-white">
                        {decompte.typeDecompte}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(decompte.dateDecompte)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(decompte.montantTtc)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-info">
                        {formatCurrency(decompte.cumulActuel ?? 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {(decompte.tauxAvancement ?? 0).toFixed(1)}%
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-success h-2 rounded-full"
                            style={{ width: `${Math.min(decompte.tauxAvancement ?? 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={
                          decompte.statut === 'PAYE_TOTAL' || decompte.statut === 'PAYE_PARTIEL'
                            ? 'VALIDEE'
                            : decompte.statut === 'VALIDE'
                            ? 'ACHEVE'
                            : 'EN_COURS'
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {decomptes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun décompte enregistré</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'bonscommande' && (
        <Card title="Bons de Commande">
          <div className="text-center py-12">
            <p className="text-gray-500">Fonctionnalité en cours de développement</p>
          </div>
        </Card>
      )}
      </div>
    </AppLayout>
  )
}
