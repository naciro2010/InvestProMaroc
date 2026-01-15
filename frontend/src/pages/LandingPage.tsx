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
} from 'react-icons/fa'

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleOnHover = {
  rest: { scale: 1 },
  hover: { scale: 1.05 }
}

const LandingPage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <FaFileContract className="text-4xl text-blue-600" />,
      title: 'Conventions & Avenants',
      description: 'Gérez vos conventions CADRE et SPECIFIQUES avec workflow complet. Sous-conventions hiérarchiques avec héritage paramétrable.',
      color: 'from-blue-50 to-blue-100',
      stats: [
        { label: 'Conventions', value: '250+' },
        { label: 'Avenants', value: '150+' }
      ]
    },
    {
      icon: <FaClipboardCheck className="text-4xl text-green-600" />,
      title: 'Marchés Publics',
      description: 'Suivi détaillé ligne par ligne avec géolocalisation. Avenants avec impact montants/délais. Alertes automatiques.',
      color: 'from-green-50 to-green-100',
      stats: [
        { label: 'Marchés actifs', value: '48' },
        { label: 'Zones', value: '12' }
      ]
    },
    {
      icon: <FaMoneyCheckAlt className="text-4xl text-orange-600" />,
      title: 'Décomptes & Paiements',
      description: 'Du décompte à l\'OP jusqu\'au paiement. Calcul automatique des retenues. Contrôle budgétaire intégré.',
      color: 'from-orange-50 to-orange-100',
      stats: [
        { label: 'Décomptes', value: '320' },
        { label: 'Paiements', value: '280' }
      ]
    },
    {
      icon: <FaChartPie className="text-4xl text-purple-600" />,
      title: 'Analyse Multidimensionnelle',
      description: 'Dimensions illimitées configurables. Graphiques interactifs. Exports Excel instantanés.',
      color: 'from-purple-50 to-purple-100',
      stats: [
        { label: 'Dimensions', value: '12' },
        { label: 'Rapports', value: '48' }
      ]
    }
  ]

  const benefits = [
    { icon: <FaClock />, title: 'Gain de temps', desc: '-70% de temps de traitement', color: 'blue' },
    { icon: <FaCheckCircle />, title: 'Fiabilité', desc: 'Validation multi-niveaux', color: 'green' },
    { icon: <FaLock />, title: 'Sécurité', desc: 'Authentification JWT sécurisée', color: 'purple' },
    { icon: <FaChartLine />, title: 'Reporting', desc: 'Tableaux de bord temps réel', color: 'orange' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-opacity-90"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center"
              >
                <FaChartLine className="text-white text-xl" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">InvestPro Maroc</h1>
                <p className="text-xs text-gray-500">Gestion des Investissements Publics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Connexion
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Démo Gratuite
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.h2
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Pilotez vos investissements publics
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              en toute simplicité
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Solution complète pour gérer conventions, marchés, décomptes et paiements.
            <br />De la planification budgétaire jusqu'au paiement des fournisseurs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium text-lg shadow-lg flex items-center space-x-2"
            >
              <span>Essayer maintenant</span>
              <FaArrowRight />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
            >
              En savoir plus
            </motion.button>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
          >
            {['Sans installation', 'Accès immédiat', 'Données de démo'].map((text) => (
              <motion.div key={text} variants={fadeIn} className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-500" />
                <span>{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tout dans une seule plateforme
            </h3>
            <p className="text-lg text-gray-600">
              De la convention au paiement, gérez l'intégralité du processus
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover="hover"
                initial="rest"
                className="relative group"
              >
                <motion.div
                  variants={scaleOnHover}
                  className={`bg-gradient-to-br ${feature.color} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all h-full`}
                >
                  <div className="bg-white rounded-xl p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>{feature.icon}</div>
                      <div className="flex gap-2">
                        {feature.stats.map((stat, i) => (
                          <div key={i} className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi InvestPro ?
            </h3>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="bg-white rounded-xl p-6 shadow-sm transition-all"
              >
                <div className={`w-12 h-12 bg-${benefit.color}-100 rounded-lg flex items-center justify-center mb-4 text-${benefit.color}-600`}>
                  {benefit.icon}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-sm text-gray-600">{benefit.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4"
          >
            Prêt à moderniser votre gestion ?
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-8 text-blue-100"
          >
            Commencez avec un compte de démonstration
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg shadow-lg"
            >
              Essayer gratuitement
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
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
                <li>Conventions & Avenants</li>
                <li>Marchés Publics</li>
                <li>Décomptes & Paiements</li>
                <li>Analyse Multidimensionnelle</li>
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
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                github.com/naciro2010/InvestProMaroc →
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2024-2026 InvestPro Maroc. Projet Open Source.</p>
            <p className="mt-2">Made with ❤️ in Morocco 🇲🇦</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
