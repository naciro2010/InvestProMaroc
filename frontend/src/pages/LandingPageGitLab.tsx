import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle,
  Calculator,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Download,
  Clock,
  Layers,
  GitBranch,
  Database,
  Workflow,
  ChevronRight,
  Building2,
  Briefcase,
  Star,
  Globe,
  Lock,
  Activity,
} from 'lucide-react'

const LandingPageGitLab = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Workflow,
      title: 'Gestion des Conventions d\'Intervention',
      description: 'Créez et gérez vos conventions avec suivi des taux de commission, périodes de validité et bases de calcul (HT/TTC). Historisation automatique de tous les changements.',
      details: [
        'Types multiples: Cadre, Non-Cadre, Spécifique, Avenant',
        'Taux de commission personnalisables par convention',
        'Périodes de validité avec alertes d\'expiration',
        'Calcul automatique selon la base (HT ou TTC)',
      ],
    },
    {
      icon: Building2,
      title: 'Projets d\'Investissement',
      description: 'Suivez tous vos projets avec responsables, statuts et budget. Vue consolidée multi-projets avec suivi en temps réel des dépenses et commissions.',
      details: [
        'Gestion complète du cycle de vie projet',
        'Affectation des responsables et équipes',
        'Suivi budgétaire en temps réel',
        'Statuts personnalisables (Validé, En cours, Achevé, etc.)',
      ],
    },
    {
      icon: Users,
      title: 'Base Fournisseurs Complète',
      description: 'Centralisez tous vos fournisseurs avec validation automatique ICE (15 chiffres), IF et gestion spécifique des non-résidents pour conformité fiscale.',
      details: [
        'Validation ICE automatique (15 chiffres)',
        'Gestion IF et identifiant fiscal',
        'Support fournisseurs non-résidents',
        'Historique complet des transactions',
      ],
    },
    {
      icon: Database,
      title: 'Axes Analytiques Multi-dimensionnels',
      description: 'Créez des dimensions analytiques personnalisées pour un reporting précis. Analyses croisées par département, activité, région ou toute autre dimension métier.',
      details: [
        'Dimensions analytiques illimitées',
        'Affectation multi-axes par dépense',
        'Reporting croisé et consolidé',
        'Export des analyses en Excel',
      ],
    },
    {
      icon: GitBranch,
      title: 'Comptes Bancaires',
      description: 'Gérez vos comptes bancaires avec validation RIB marocain (24 chiffres). Suivi des mouvements et rapprochements automatiques.',
      details: [
        'Validation RIB 24 chiffres automatique',
        'Multi-comptes et multi-devises',
        'Rapprochement bancaire simplifié',
        'Historique complet des opérations',
      ],
    },
    {
      icon: Calculator,
      title: 'Calcul Automatique des Commissions',
      description: 'Calcul intelligent avec historisation des taux au moment de la saisie. TVA 20% automatique et génération des retenues fiscales (IS 10%, Garantie, Non-résidents).',
      details: [
        'Calcul automatique multi-bases (HT/TTC)',
        'TVA 20% appliquée automatiquement',
        'Retenues fiscales: IS 10%, Garantie, Non-résidents',
        'Historisation des taux à la date de saisie',
      ],
    },
    {
      icon: FileText,
      title: 'Gestion Avancée des Dépenses',
      description: 'Saisie rapide avec validation automatique. Association multi-dimensionnelle: projet, fournisseur, convention, axes analytiques, compte bancaire.',
      details: [
        'Saisie simplifiée avec auto-complétion',
        'Validation des montants et taux',
        'Pièces jointes (factures, BCs, etc.)',
        'États: Brouillon, Validée, Payée, Annulée',
      ],
    },
    {
      icon: BarChart3,
      title: 'Reporting et Analytics Puissants',
      description: 'Tableaux de bord interactifs avec KPIs en temps réel. Filtrage avancé par période, projet, fournisseur, convention, axe analytique ou compte.',
      details: [
        'Dashboard global avec KPIs métier',
        'Top projets et top fournisseurs',
        'Filtres multi-critères avancés',
        'Graphiques et visualisations dynamiques',
      ],
    },
    {
      icon: Download,
      title: 'Exports Excel Professionnels',
      description: 'Exportez vos dépenses, commissions et statistiques en un clic. Formats compatibles avec Excel, Sage, Odoo et SAP pour intégration comptable.',
      details: [
        'Export Excel formaté et professionnel',
        'Exports comptables (Sage, Odoo, SAP)',
        'Personnalisation des colonnes',
        'Exports planifiés automatiques',
      ],
    },
    {
      icon: Shield,
      title: '100% Conforme Réglementation Marocaine',
      description: 'Validations automatiques de tous les identifiants fiscaux. Calculs conformes aux normes fiscales marocaines en vigueur.',
      details: [
        'Validation ICE 15 chiffres',
        'Validation RIB 24 chiffres',
        'Retenues fiscales conformes',
        'TVA selon règles marocaines',
      ],
    },
    {
      icon: Lock,
      title: 'Sécurité et Contrôle d\'Accès',
      description: 'Authentification sécurisée JWT. Gestion des rôles: Admin, Manager, User avec permissions granulaires par module.',
      details: [
        'Authentification JWT sécurisée',
        'Rôles et permissions granulaires',
        'Audit trail complet',
        'Sessions sécurisées',
      ],
    },
    {
      icon: Activity,
      title: 'API REST Moderne et Performante',
      description: '28+ endpoints REST avec Kotlin, Spring Boot 3.2.5. Documentation Swagger complète pour intégrations tierces.',
      details: [
        '28+ endpoints REST documentés',
        'Architecture moderne (Kotlin, Spring Boot)',
        'Documentation Swagger/OpenAPI',
        'Webhooks pour événements métier',
      ],
    },
  ]

  const stats = [
    { value: '85%', label: 'Temps gagné vs Excel', icon: Zap },
    { value: '100%', label: 'Conformité fiscale', icon: Shield },
    { value: '< 2s', label: 'Temps de réponse', icon: Activity },
    { value: '24/7', label: 'Disponibilité', icon: Globe },
  ]

  const benefits = [
    {
      title: 'Gain de Temps Massif',
      description: 'Automatisez 85% de vos tâches répétitives. Finies les heures perdues sur Excel et les calculs manuels.',
      icon: Clock,
      color: 'from-gitlab-orange to-red-500',
    },
    {
      title: 'Zéro Erreur de Calcul',
      description: 'Calculs fiables à 100% avec historisation. Plus aucune erreur coûteuse dans vos commissions et retenues.',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Conformité Garantie',
      description: 'Validations automatiques ICE, IF, RIB. Respect total de la réglementation fiscale marocaine.',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Décisions Éclairées',
      description: 'Dashboards en temps réel avec KPIs et analytics. Pilotez vos investissements avec données fiables.',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
  ]

  const useCases = [
    {
      title: 'Établissements Publics',
      description: 'Agences d\'urbanisme, régies autonomes, établissements publics',
      icon: Building2,
      examples: ['CRI - Centres Régionaux d\'Investissement', 'Agences de Développement', 'Régies Autonomes'],
    },
    {
      title: 'Secteur Privé',
      description: 'Entreprises gérant des projets d\'investissement complexes',
      icon: Briefcase,
      examples: ['Groupes industriels', 'Holdings', 'Promoteurs immobiliers'],
    },
    {
      title: 'Cabinets & Consultants',
      description: 'Experts comptables et cabinets conseil accompagnant leurs clients',
      icon: Users,
      examples: ['Experts comptables', 'Cabinets d\'audit', 'Consultants financiers'],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation GitLab-style */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gitlab-orange rounded flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">InvestPro Maroc</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-gitlab-orange text-white rounded">
                SaaS
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gitlab-orange hover:bg-gitlab-orange-dark rounded transition-colors"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-gitlab-orange rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                <span>Solution 100% Marocaine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Gérez vos investissements{' '}
                <span className="text-gitlab-orange">intelligemment</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                La plateforme SaaS complète pour la gestion des dépenses d'investissement et le calcul automatique des commissions d'intervention. Conforme à 100% à la réglementation marocaine.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-white bg-gitlab-orange hover:bg-gitlab-orange-dark rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  <span>Démarrer gratuitement</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all"
                >
                  <span>Découvrir les fonctionnalités</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-3xl font-bold text-gray-900">500+</p>
                  <p className="text-sm text-gray-600">Entreprises utilisatrices</p>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-gitlab-orange text-gitlab-orange" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">4.9/5 satisfaction clients</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-lg shadow-2xl border border-gray-200 p-6 sm:p-8">
                {/* Mock Dashboard */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Dépenses</p>
                      <p className="text-2xl font-bold text-gray-900">2.45M MAD</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">+12.5%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Commissions</p>
                      <p className="text-2xl font-bold text-gray-900">61K MAD</p>
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Validé</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: 'Infrastructure A', progress: 75, amount: '850K' },
                      { name: 'Équipements IT', progress: 45, amount: '420K' },
                      { name: 'Bâtiment B', progress: 90, amount: '1.2M' },
                    ].map((project, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-700">{project.name}</span>
                          <span className="text-gray-600">{project.amount} MAD</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gitlab-orange transition-all duration-1000"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gitlab-orange rounded-lg opacity-20 blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-green-500 rounded-lg opacity-20 blur-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-gitlab-orange mx-auto mb-3" />
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm sm:text-base text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir <span className="text-gitlab-orange">InvestPro</span> ?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Une solution complète qui transforme la gestion de vos investissements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-xl p-6 border border-gray-200 hover:border-gitlab-orange hover:shadow-xl transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${benefit.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités <span className="text-gitlab-orange">complètes</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              12 modules métier intégrés pour gérer tous les aspects de vos investissements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 3) * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-gray-200 hover:border-gitlab-orange transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 p-2.5 bg-orange-100 rounded-lg">
                    <feature.icon className="w-6 h-6 text-gitlab-orange" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ul className="space-y-2">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pour qui ?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Une solution adaptée à tous les acteurs de l'investissement au Maroc
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border border-gray-200 hover:border-gitlab-orange hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gitlab-orange rounded-lg flex items-center justify-center mb-6">
                  <useCase.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-600 mb-6">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.examples.map((example, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-gitlab-orange rounded-full" />
                      {example}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gitlab-orange via-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Prêt à transformer votre gestion ?
            </h2>
            <p className="text-lg sm:text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
              Rejoignez des centaines d'entreprises marocaines qui font confiance à InvestPro pour gérer leurs investissements
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-gitlab-orange bg-white hover:bg-gray-50 rounded-lg transition-all shadow-xl hover:shadow-2xl"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-white hover:bg-white/10 rounded-lg transition-all"
              >
                Se connecter
              </button>
            </div>

            <p className="mt-8 text-orange-100 text-sm">
              Aucune carte bancaire requise • Démarrage en 2 minutes • Support en français
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gitlab-orange rounded flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold">InvestPro Maroc</span>
              </div>
              <p className="text-gray-400 text-sm">
                Gestion d'investissement intelligente pour le Maroc
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2024 InvestPro Maroc. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Made with ❤️ in Morocco</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPageGitLab
