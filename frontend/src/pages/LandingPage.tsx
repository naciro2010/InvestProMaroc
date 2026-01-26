import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaChartLine,
  FaFileContract,
  FaMoneyCheckAlt,
  FaClipboardCheck,
  FaCheckCircle,
  FaArrowRight,
  FaUsers,
  FaClock,
  FaLock,
  FaChartPie,
  FaMapMarkerAlt,
  FaExchangeAlt,
  FaFileInvoiceDollar,
  FaShieldAlt,
  FaMobileAlt,
  FaRocket,
  FaTrophy,
  FaGlobe,
  FaBuilding,
  FaUniversity,
  FaLandmark,
  FaQuoteLeft,
} from 'react-icons/fa'
import { Box, Container, Button, Chip } from '@mui/material'

// Animation variants (subtils, Odoo-style)
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
}

const LandingPage = () => {
  const navigate = useNavigate()

  // Stats clés
  const stats = [
    { value: '10,000+', label: 'Conventions gérées', icon: <FaFileContract /> },
    { value: '250M MAD', label: 'Budget suivi', icon: <FaMoneyCheckAlt /> },
    { value: '70%', label: 'Gain de temps', icon: <FaClock /> },
    { value: '99.9%', label: 'Disponibilité', icon: <FaShieldAlt /> },
  ]

  // Features principales
  const features = [
    {
      icon: <FaFileContract className="text-3xl" />,
      title: 'Conventions & Avenants',
      description: 'Gérez vos conventions CADRE et SPECIFIQUES avec workflow complet (BROUILLON → SOUMIS → VALIDEE → EN_EXECUTION → ACHEVE). Sous-conventions hiérarchiques avec héritage de paramètres.',
      benefits: [
        'Workflow avec validation multi-niveaux',
        'Historique complet des avenants (JSONB)',
        'Héritage paramétrable des taux et bases',
        'Calcul automatique des commissions',
      ],
    },
    {
      icon: <FaMapMarkerAlt className="text-3xl" />,
      title: 'Marchés Géolocalisés',
      description: 'Suivi détaillé ligne par ligne avec géolocalisation OpenStreetMap. Avenants avec impact montants et délais. Alertes automatiques sur seuils.',
      benefits: [
        'Carte interactive avec Leaflet',
        'Suivi ligne par ligne avec imputations',
        'Avenants avec tracking complet',
        'Zones géographiques configurables',
      ],
    },
    {
      icon: <FaFileInvoiceDollar className="text-3xl" />,
      title: 'Décomptes & Paiements',
      description: 'De la situation de travaux au paiement fournisseur. Calcul automatique des retenues (garantie, RAS, pénalités). Contrôle budgétaire en temps réel.',
      benefits: [
        'Workflow Décompte → OP → Paiement',
        'Calcul automatique des retenues',
        'Rapprochement bancaire intégré',
        'Export comptable (PDF, Excel)',
      ],
    },
    {
      icon: <FaChartPie className="text-3xl" />,
      title: 'Analyse Multidimensionnelle',
      description: 'Plan analytique dynamique avec dimensions illimitées (Budget, Projet, Secteur, Département, Phase...). Graphiques interactifs. Exports Excel instantanés.',
      benefits: [
        'Dimensions configurables (JSONB)',
        'Graphiques Recharts interactifs',
        'Filtres dynamiques multicritères',
        'Exports Excel/PDF avec ExcelJS',
      ],
    },
  ]

  // Workflow complet
  const workflow = [
    { step: '1', title: 'Convention', desc: 'Création et validation', icon: <FaFileContract /> },
    { step: '2', title: 'Projet', desc: 'Planification budgétaire', icon: <FaChartLine /> },
    { step: '3', title: 'Marché', desc: 'Appels d\'offres et attribution', icon: <FaClipboardCheck /> },
    { step: '4', title: 'Décompte', desc: 'Situation de travaux', icon: <FaFileInvoiceDollar /> },
    { step: '5', title: 'Paiement', desc: 'Règlement fournisseur', icon: <FaMoneyCheckAlt /> },
  ]

  // Use cases par secteur
  const useCases = [
    {
      icon: <FaUniversity />,
      sector: 'Collectivités Locales',
      description: 'Régions, Provinces, Communes',
      examples: ['Conventions d\'investissement', 'Marchés de voirie', 'Equipements publics'],
    },
    {
      icon: <FaBuilding />,
      sector: 'Etablissements Publics',
      description: 'ONEE, ADM, ONDA, Ports',
      examples: ['Grands projets d\'infrastructure', 'Maintenance réseau', 'Investissements techniques'],
    },
    {
      icon: <FaLandmark />,
      sector: 'Ministères & Agences',
      description: 'Administration centrale',
      examples: ['Programmes sectoriels', 'Projets interministériels', 'Coopération internationale'],
    },
    {
      icon: <FaGlobe />,
      sector: 'Organismes Internationaux',
      description: 'ONG, Bailleurs de fonds',
      examples: ['Programmes de développement', 'Subventions projets', 'Monitoring financier'],
    },
  ]

  // Pricing (exemple commercial)
  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Gratuit',
      description: 'Idéal pour découvrir la plateforme',
      features: [
        '10 conventions maximum',
        '5 utilisateurs',
        'Support email',
        'Données de démo',
        'Exports Excel basiques',
      ],
      cta: 'Essayer gratuitement',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '15,000 MAD/mois',
      description: 'Pour les organisations moyennes',
      features: [
        'Conventions illimitées',
        '25 utilisateurs',
        'Support prioritaire',
        'Formation incluse',
        'Exports avancés',
        'API REST complète',
        'Hébergement sécurisé',
      ],
      cta: 'Demander une démo',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Sur devis',
      description: 'Solution sur-mesure pour grandes organisations',
      features: [
        'Tout Professional +',
        'Utilisateurs illimités',
        'Support dédié 24/7',
        'Personnalisation UI',
        'Intégrations ERP',
        'SLA 99.9%',
        'Formation sur site',
        'Hébergement dédié',
      ],
      cta: 'Nous contacter',
      highlighted: false,
    },
  ]

  // Témoignages (fictifs pour démo)
  const testimonials = [
    {
      quote: "InvestPro a transformé notre gestion financière. Nous avons réduit de 70% le temps de traitement des décomptes.",
      author: 'Mohamed ALAMI',
      role: 'Directeur Financier',
      organization: 'Région Casablanca-Settat',
      avatar: '🏛️',
    },
    {
      quote: "La géolocalisation des marchés et le suivi ligne par ligne nous donnent une visibilité totale sur nos investissements.",
      author: 'Fatima BENALI',
      role: 'Responsable Marchés',
      organization: 'Agence pour l\'Aménagement',
      avatar: '🏗️',
    },
    {
      quote: "L'analyse multidimensionnelle nous permet de piloter notre budget avec une précision inégalée.",
      author: 'Ahmed TAZI',
      role: 'Contrôleur de Gestion',
      organization: 'Etablissement Public',
      avatar: '📊',
    },
  ]

  // FAQ
  const faqs = [
    {
      question: 'Quelle est la différence entre convention CADRE et SPECIFIQUE ?',
      answer: 'Les conventions CADRE définissent les règles générales de calcul de commissions et peuvent avoir des sous-conventions SPECIFIQUES qui héritent ou surchargent les paramètres (taux, base de calcul, TVA).',
    },
    {
      question: 'Comment fonctionne le plan analytique dynamique ?',
      answer: 'Contrairement aux systèmes rigides, notre plan analytique utilise PostgreSQL JSONB pour supporter un nombre illimité de dimensions configurables (Budget, Projet, Secteur, Département, Phase, etc.).',
    },
    {
      question: 'Les données sont-elles sécurisées ?',
      answer: 'Absolument. Authentification JWT avec refresh tokens, chiffrement SSL/TLS, audit trail complet (createdBy, createdAt, updatedAt), et soft deletes pour traçabilité.',
    },
    {
      question: 'Puis-je exporter mes données ?',
      answer: 'Oui, exports Excel (ExcelJS) et PDF disponibles sur toutes les pages. Les exports incluent les données tabulaires et les graphiques.',
    },
    {
      question: 'Quelle est la stack technique ?',
      answer: 'Backend Kotlin + Spring Boot 3.4.1 + PostgreSQL 16. Frontend React 18 + TypeScript + Vite + MUI. Architecture micro-frontend + micro-services REST.',
    },
    {
      question: 'Proposez-vous une formation ?',
      answer: 'Oui, formation initiale incluse dans les plans Professional et Enterprise. Documentation complète et vidéos tutoriels disponibles.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar */}
      <motion.nav
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95"
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">InvestPro Maroc</h1>
                <p className="text-xs text-gray-500">Gestion Investissements Publics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                Connexion
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', boxShadow: 'none' }}
              >
                Démo Gratuite
              </Button>
            </div>
          </Box>
        </Container>
      </motion.nav>

      {/* Hero Section */}
      <section className="py-20 bg-gray-50">
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center max-w-4xl mx-auto"
          >
            <Chip
              label="Version 1.0 — Maintenant disponible"
              color="primary"
              size="small"
              sx={{ mb: 3, fontWeight: 500 }}
            />
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Pilotez vos investissements publics avec précision
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Solution complète pour gérer conventions, marchés, décomptes et paiements.
              De la planification budgétaire jusqu'au règlement des fournisseurs,
              en passant par l'analyse multidimensionnelle en temps réel.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                endIcon={<FaArrowRight />}
                sx={{ textTransform: 'none', px: 4, py: 1.5, boxShadow: 'none' }}
              >
                Essayer maintenant
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                sx={{ textTransform: 'none', px: 4, py: 1.5 }}
              >
                En savoir plus
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span>Sans installation</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span>Accès immédiat</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span>Données de démo</span>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={fadeIn} className="text-center">
                <div className="text-blue-600 text-3xl mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Tout dans une seule plateforme
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              De la convention au paiement, gérez l'intégralité du processus avec des outils puissants et intuitifs
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-white rounded-lg border border-gray-200 p-8"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                    <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                          <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-white">
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Workflow complet de A à Z
            </h3>
            <p className="text-lg text-gray-600">
              Un processus fluide de la planification au paiement
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col md:flex-row items-center justify-between gap-4"
          >
            {workflow.map((item, index) => (
              <motion.div key={index} variants={fadeIn} className="flex flex-col items-center text-center flex-1">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-3">
                  {item.step}
                </div>
                <div className="text-2xl text-blue-600 mb-2">{item.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
                {index < workflow.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200"></div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50">
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Pour tous les acteurs publics
            </h3>
            <p className="text-lg text-gray-600">
              Adapté aux besoins de chaque type d'organisation
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-8"
          >
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-white rounded-lg border border-gray-200 p-8"
              >
                <div className="text-4xl text-blue-600 mb-4">{useCase.icon}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{useCase.sector}</h4>
                <p className="text-gray-600 mb-4">{useCase.description}</p>
                <div className="space-y-2">
                  {useCase.examples.map((example, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span>{example}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Tarifs adaptés à votre taille
            </h3>
            <p className="text-lg text-gray-600">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className={`rounded-lg border ${
                  plan.highlighted
                    ? 'border-blue-600 shadow-lg'
                    : 'border-gray-200'
                } p-8 relative`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Chip label="Populaire" color="primary" size="small" />
                  </div>
                )}
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                <div className="text-3xl font-bold text-blue-600 mb-2">{plan.price}</div>
                <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                      <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none', boxShadow: 'none' }}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h3>
            <p className="text-lg text-gray-600">
              Retours d'expérience de nos clients
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-white rounded-lg border border-gray-200 p-8"
              >
                <FaQuoteLeft className="text-blue-600 text-2xl mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-xs text-gray-500">{testimonial.organization}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h3>
            <p className="text-lg text-gray-600">
              Tout ce que vous devez savoir
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-3xl mx-auto space-y-6"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="border border-gray-200 rounded-lg p-6"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h4>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h3 className="text-4xl font-bold mb-4">
              Prêt à moderniser votre gestion ?
            </h3>
            <p className="text-xl mb-8 text-blue-100">
              Rejoignez les organisations qui font confiance à InvestPro Maroc
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  textTransform: 'none',
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'gray.50',
                  },
                }}
              >
                Essayer gratuitement
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <Container maxWidth="lg">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
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
                <li>Conventions & Avenants</li>
                <li>Marchés Géolocalisés</li>
                <li>Décomptes & Paiements</li>
                <li>Analyse Multidimensionnelle</li>
                <li>Reporting & Exports</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Secteurs</h4>
              <ul className="space-y-2 text-sm">
                <li>Collectivités Locales</li>
                <li>Etablissements Publics</li>
                <li>Ministères & Agences</li>
                <li>Organismes Internationaux</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Projet Open Source</h4>
              <p className="text-sm text-gray-400 mb-2">
                Contribuez sur GitHub
              </p>
              <a
                href="https://github.com/naciro2010/InvestProMaroc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm inline-flex items-center space-x-1"
              >
                <span>github.com/naciro2010/InvestProMaroc</span>
                <FaArrowRight className="text-xs" />
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2024-2026 InvestPro Maroc. Projet Open Source sous licence MIT.</p>
            <p className="mt-2">Made with care in Morocco</p>
          </div>
        </Container>
      </footer>
    </div>
  )
}

export default LandingPage
