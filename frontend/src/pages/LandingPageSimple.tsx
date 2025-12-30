import { useNavigate } from 'react-router-dom'
import {
  FaChartLine,
  FaFileContract,
  FaMoneyCheckAlt,
  FaClipboardCheck,
  FaUserShield,
  FaFileExport,
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaLock,
  FaChartPie,
  FaBell,
  FaUserTie,
  FaUsers,
  FaCalculator,
  FaArrowRight
} from 'react-icons/fa'

const LandingPageSimple = () => {
  const navigate = useNavigate()

  const demoAccounts = [
    {
      username: 'admin',
      password: 'demo123',
      role: 'Administrateur',
      icon: <FaUserShield className="text-4xl text-red-600" />,
      description: 'Accès complet au système',
      features: ['Gestion utilisateurs', 'Configuration globale', 'Tous les modules']
    },
    {
      username: 'manager',
      password: 'demo123',
      role: 'Responsable',
      icon: <FaUserTie className="text-4xl text-blue-600" />,
      description: 'Gestion opérationnelle',
      features: ['Conventions', 'Marchés', 'Validation budgétaire']
    },
    {
      username: 'gestionnaire',
      password: 'demo123',
      role: 'Gestionnaire',
      icon: <FaUsers className="text-4xl text-green-600" />,
      description: 'Saisie et suivi',
      features: ['Décomptes', 'Suivi paiements', 'Reporting']
    },
    {
      username: 'comptable',
      password: 'demo123',
      role: 'Comptable',
      icon: <FaCalculator className="text-4xl text-purple-600" />,
      description: 'Validation financière',
      features: ['Contrôle budgétaire', 'Validation', 'Rapprochement']
    },
  ]

  const handleQuickLogin = (username: string, password: string) => {
    sessionStorage.setItem('demo_username', username)
    sessionStorage.setItem('demo_password', password)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">InvestPro Maroc</h1>
                <p className="text-xs text-gray-500">Gestion des Investissements Publics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Démo Gratuite
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Pilotez vos investissements publics en toute simplicité
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Une plateforme complète pour gérer l'ensemble du cycle de vie de vos conventions et marchés publics :
            de la planification budgétaire jusqu'au paiement des fournisseurs.
          </p>
          <div className="flex items-center justify-center space-x-4 mb-12">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>Essayer maintenant</span>
              <FaArrowRight />
            </button>
            <button
              onClick={() => document.getElementById('demo-accounts')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
            >
              Voir les comptes démo
            </button>
          </div>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500" />
              <span>Sans installation</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500" />
              <span>Accès immédiat</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaCheckCircle className="text-green-500" />
              <span>Données de démo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features - Visual */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin dans une seule plateforme
            </h3>
            <p className="text-lg text-gray-600">
              De la convention au paiement, gérez l'intégralité du processus
            </p>
          </div>

          {/* Feature 1: Conventions */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
                  <FaFileContract />
                  <span className="font-medium">Conventions d'Intervention</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  Gérez vos conventions avec un workflow intelligent
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Créez et suivez vos conventions cadres, spécifiques ou avenants avec un système de validation
                  complet. Associez plusieurs projets, définissez les montants et les partenaires en quelques clics.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Workflow de validation (Brouillon → Soumis → Validé)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Gestion des avenants avec traçabilité complète</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Association multi-projets et calcul automatique des commissions</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Historique et versioning pour audit complet</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-xl">
                <div className="bg-white rounded-lg p-6 shadow-md mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Convention</div>
                      <div className="font-bold text-gray-900">CONV/2024/001</div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Validée
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">Infrastructure IT 2024</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Montant</div>
                      <div className="font-bold text-gray-900">4,8M DH</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Projets</div>
                      <div className="font-bold text-gray-900">3 projets</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">15</div>
                    <div className="text-sm text-gray-600">Marchés actifs</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-600">Décomptes validés</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Marchés */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 shadow-xl">
                  <div className="bg-white rounded-lg p-6 shadow-md mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Marché</div>
                        <div className="font-bold text-gray-900">M-2024-INF-001</div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        En cours
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Travaux Infrastructure Réseau</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ligne 1: Câblage</span>
                        <span className="font-medium">450,000 DH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ligne 2: Équipements</span>
                        <span className="font-medium">850,000 DH</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                        <span>Total TTC</span>
                        <span className="text-green-600">1,560,000 DH</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Avancement</span>
                      <span className="font-bold text-gray-900">65%</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-full mb-4">
                  <FaClipboardCheck />
                  <span className="font-medium">Marchés Publics</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  Suivez vos marchés ligne par ligne avec précision
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Gérez chaque marché avec un détail ligne par ligne, suivez les avenants et contrôlez l'avancement.
                  Chaque ligne peut être imputée sur plusieurs dimensions analytiques pour un suivi précis.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Décomposition détaillée par lignes avec quantités et prix unitaires</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Calcul automatique HT/TVA/TTC et retenues de garantie</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Gestion des avenants avec impact sur montants et délais</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Alertes automatiques sur dépassements et retards</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 3: Analytics */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-4">
                  <FaChartPie />
                  <span className="font-medium">Analyse Multidimensionnelle</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  Analysez vos dépenses selon vos propres critères
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Créez vos propres dimensions d'analyse (Budget, Projet, Secteur, Département, Phase...)
                  et obtenez des rapports instantanés. Exportez vos données vers Excel en un clic.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Dimensions illimitées configurables selon vos besoins</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Graphiques interactifs : évolution, répartition, top 10</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Filtres dynamiques par période et par dimension</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Export Excel avec vos filtres et graphiques</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 shadow-xl">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Répartition par Secteur</div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Infrastructure</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Digital</span>
                          <span className="font-medium">30%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Formation</span>
                          <span className="font-medium">25%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">12</div>
                      <div className="text-xs text-gray-500">Dimensions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">156</div>
                      <div className="text-xs text-gray-500">Valeurs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">48</div>
                      <div className="text-xs text-gray-500">Rapports</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Paiements */}
          <div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 shadow-xl">
                  <div className="bg-white rounded-lg p-6 shadow-md mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Décompte</div>
                        <div className="font-bold text-gray-900">DC-2024-003</div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Validé
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Montant HT</span>
                        <span className="font-medium">850,000 DH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">TVA (20%)</span>
                        <span className="font-medium">170,000 DH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Retenue garantie (7%)</span>
                        <span className="font-medium text-red-600">-71,400 DH</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                        <span>Net à payer</span>
                        <span className="text-green-600">948,600 DH</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FaClock className="text-orange-500" />
                        <span className="text-sm text-gray-600">OP en attente</span>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Créer OP
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full mb-4">
                  <FaMoneyCheckAlt />
                  <span className="font-medium">Décomptes & Paiements</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">
                  Du décompte au paiement en quelques clics
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Validez les décomptes, générez automatiquement les ordres de paiement avec calcul des retenues,
                  et suivez l'exécution jusqu'au paiement effectif. Tout est tracé et auditable.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Workflow complet: Décompte → Ordre de Paiement → Paiement</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Calcul automatique des retenues (garantie, RAS, pénalités)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Contrôle disponibilité budgétaire avant validation</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Historique complet et rapprochement bancaire</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir InvestPro ?
            </h3>
            <p className="text-lg text-gray-600">
              Des avantages concrets pour votre organisation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FaClock className="text-blue-600 text-xl" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Gain de temps</h4>
              <p className="text-sm text-gray-600">
                Automatisation des calculs et workflows. Réduisez le temps de traitement de 70%.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Fiabilité</h4>
              <p className="text-sm text-gray-600">
                Éliminez les erreurs de saisie avec les contrôles automatiques et la validation multi-niveaux.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FaSearch className="text-purple-600 text-xl" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Traçabilité</h4>
              <p className="text-sm text-gray-600">
                Historique complet de toutes les opérations. Audit trail pour la conformité.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <FaFileExport className="text-orange-600 text-xl" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Reporting</h4>
              <p className="text-sm text-gray-600">
                Rapports instantanés et tableaux de bord personnalisables. Export Excel en un clic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Accounts Section */}
      <section id="demo-accounts" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Testez gratuitement avec un compte de démonstration
            </h3>
            <p className="text-lg text-gray-600 mb-2">
              Pas d'inscription nécessaire. Cliquez sur un profil pour vous connecter instantanément.
            </p>
            <p className="text-sm text-gray-500">
              Toutes les données sont fictives et réinitialisées régulièrement
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {demoAccounts.map((account, index) => (
              <div
                key={index}
                onClick={() => handleQuickLogin(account.username, account.password)}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {account.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{account.role}</h4>
                    <p className="text-sm text-gray-600 mb-3">{account.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {account.features.map((feature, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4 text-gray-500">
                        <span>
                          <strong>Login:</strong> {account.username}
                        </span>
                        <span>
                          <strong>Mot de passe:</strong> {account.password}
                        </span>
                      </div>
                      <FaArrowRight className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-lg">
              <FaLock />
              <span className="text-sm font-medium">
                Connexion sécurisée • Données de démonstration • Sans engagement
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-4xl font-bold mb-4">
            Prêt à moderniser la gestion de vos investissements ?
          </h3>
          <p className="text-xl mb-8 text-blue-100">
            Commencez dès maintenant avec un compte de démonstration
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg shadow-lg"
            >
              Essayer gratuitement
            </button>
            <button
              onClick={() => window.location.href = 'mailto:contact@investpro.ma'}
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium text-lg"
            >
              Nous contacter
            </button>
          </div>
          <p className="mt-6 text-sm text-blue-200">
            Des questions ? Écrivez-nous à contact@investpro.ma
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-white" />
                </div>
                <span className="font-bold text-white">InvestPro Maroc</span>
              </div>
              <p className="text-sm text-gray-400">
                Solution complète de gestion des investissements publics
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Fonctionnalités</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Conventions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Marchés</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Décomptes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analyse</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>contact@investpro.ma</li>
                <li>+212 5XX XX XX XX</li>
                <li className="pt-2">
                  <a href="https://github.com/naciro2010/InvestProMaroc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    GitHub →
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2024-2025 InvestPro Maroc. Tous droits réservés.</p>
            <p className="mt-2">Made with ❤️ in Morocco 🇲🇦</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPageSimple
