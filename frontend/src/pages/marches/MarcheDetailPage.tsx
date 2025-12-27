import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FaArrowLeft, FaEdit, FaFileInvoice, FaShoppingCart, FaChartLine } from 'react-icons/fa'
import { XcomptaCard, XcomptaButton, StatusBadge } from '../../components/ui/xcompta'
import api from '../../lib/api'

interface Marche {
  id: number
  numeroMarche: string
  numAo?: string
  dateMarche: string
  objet: string
  montantHt: number
  montantTva: number
  montantTtc: number
  tauxTva: number
  statut: string
  dateDebut?: string
  dateFinPrevue?: string
  delaiExecutionMois?: number
  retenueGarantie: number
  remarques?: string
  fournisseur?: {
    id: number
    raisonSociale: string
    ice?: string
  }
  projet?: {
    id: number
    nom: string
    code: string
  }
}

interface Decompte {
  id: number
  numeroDecompte: string
  numeroSituation?: number
  typeDecompte: string
  montantTtc: number
  cumulActuel: number
  tauxAvancement: number
  statut: string
  dateDecompte: string
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-info"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
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
          <XcomptaButton variant="outline-info" icon={<FaEdit />}>
            Modifier
          </XcomptaButton>
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <XcomptaCard title="Montant TTC" headerColor="primary">
          <div className="text-2xl font-bold font-rubik text-xcompta-blue">
            {formatCurrency(marche.montantTtc)}
          </div>
        </XcomptaCard>

        <XcomptaCard title="Total Payé" headerColor="success">
          <div className="text-2xl font-bold font-rubik text-success">
            {formatCurrency(totalPaye)}
          </div>
        </XcomptaCard>

        <XcomptaCard title="Reste à Payer" headerColor="warning">
          <div className="text-2xl font-bold font-rubik text-warning">
            {formatCurrency(calculateResteAPayer())}
          </div>
        </XcomptaCard>

        <XcomptaCard title="Avancement" headerColor="info">
          <div className="text-2xl font-bold font-rubik text-info">
            {calculateAvancementGlobal().toFixed(1)}%
          </div>
        </XcomptaCard>
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
          <XcomptaCard title="Informations Générales" headerColor="info">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">N° Marché</dt>
                <dd className="text-sm text-gray-900 font-semibold">{marche.numeroMarche}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">N° Appel d'Offres</dt>
                <dd className="text-sm text-gray-900">{marche.numAo || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Date Marché</dt>
                <dd className="text-sm text-gray-900">{formatDate(marche.dateMarche)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Statut</dt>
                <dd className="text-sm">
                  <StatusBadge status={marche.statut === 'VALIDE' ? 'VALIDEE' : 'EN_COURS'} />
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
          </XcomptaCard>

          {/* Montants */}
          <XcomptaCard title="Détail des Montants" headerColor="success">
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
                <dd className="text-sm text-gray-900">{formatCurrency(marche.retenueGarantie)}</dd>
              </div>
            </dl>
          </XcomptaCard>

          {/* Partenaires */}
          <XcomptaCard title="Fournisseur" headerColor="warning">
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
          </XcomptaCard>

          {/* Projet */}
          <XcomptaCard title="Projet Associé" headerColor="primary">
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
          </XcomptaCard>

          {/* Remarques */}
          {marche.remarques && (
            <XcomptaCard title="Remarques" headerColor="info" className="lg:col-span-2">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{marche.remarques}</p>
            </XcomptaCard>
          )}
        </div>
      )}

      {activeTab === 'decomptes' && (
        <XcomptaCard
          title="Décomptes du Marché"
          headerColor="info"
          actions={
            <Link to={`/decomptes/nouveau?marcheId=${id}`}>
              <XcomptaButton variant="success" icon={<FaFileInvoice />}>
                Nouveau Décompte
              </XcomptaButton>
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
                        {formatCurrency(decompte.cumulActuel)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {decompte.tauxAvancement.toFixed(1)}%
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-success h-2 rounded-full"
                            style={{ width: `${Math.min(decompte.tauxAvancement, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={
                          decompte.statut === 'PAYE'
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
        </XcomptaCard>
      )}

      {activeTab === 'bonscommande' && (
        <XcomptaCard title="Bons de Commande" headerColor="warning">
          <div className="text-center py-12">
            <p className="text-gray-500">Fonctionnalité en cours de développement</p>
          </div>
        </XcomptaCard>
      )}
    </div>
  )
}
