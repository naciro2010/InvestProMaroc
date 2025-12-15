import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Shield, Zap, BarChart3, CheckCircle2,
  ArrowRight, Sparkles, Briefcase, Users, Award,
  Globe, Lock, Clock, ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Gestion Intelligente',
      description: 'Suivez vos dépenses d\'investissement en temps réel avec des tableaux de bord intuitifs',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Calcul Automatique',
      description: 'Calculez automatiquement les commissions d\'intervention selon vos conventions',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Sécurité Maximale',
      description: 'Vos données sont protégées avec un chiffrement de niveau entreprise',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Performance Optimale',
      description: 'Une application rapide et réactive pour une productivité maximale',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const stats = [
    { value: '99.9%', label: 'Disponibilité' },
    { value: '< 100ms', label: 'Temps de réponse' },
    { value: '10,000+', label: 'Transactions/mois' },
    { value: '24/7', label: 'Support client' }
  ]

  const benefits = [
    'Conformité totale avec la réglementation marocaine',
    'TVA 20%, IF, ICE et retenues automatiques',
    'Export Excel personnalisé et professionnel',
    'Rapports détaillés et tableaux de bord',
    'Multi-projets et multi-fournisseurs',
    'Historique complet des opérations'
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                InvestPro
              </span>
              <span className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-full">
                Maroc
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Commencer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 opacity-60" />

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-10 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />

        <div className="container-custom relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">
                  Solution 100% Marocaine
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Gérez vos{' '}
                <span className="gradient-text">
                  investissements
                </span>
                {' '}avec intelligence
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                La plateforme complète pour la gestion des dépenses d'investissement
                et le calcul automatique des commissions d'intervention au Maroc.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="btn-primary flex items-center space-x-2 text-lg"
                >
                  <span>Démarrer gratuitement</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="btn-secondary flex items-center space-x-2 text-lg"
                >
                  <span>En savoir plus</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-12 flex items-center space-x-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rejoint par</p>
                  <p className="text-lg font-bold text-gray-900">500+ entreprises</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl transform rotate-12" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl transform -rotate-12 opacity-50" />

                <div className="relative space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Dépenses totales</p>
                      <p className="text-2xl font-bold text-gray-900">2,450,000 MAD</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary-600" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600">Commissions</p>
                      <p className="text-lg font-bold text-green-600">61,250 MAD</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600">Projets actifs</p>
                      <p className="text-lg font-bold text-blue-600">12</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: 'Projet Infrastructure', progress: 75, amount: '850K' },
                      { name: 'Équipements IT', progress: 45, amount: '420K' },
                      { name: 'Bâtiment A', progress: 90, amount: '1.2M' }
                    ].map((project, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{project.name}</span>
                          <span className="text-gray-600">{project.amount} MAD</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container-custom">
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
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-primary-100">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Fonctionnalités{' '}
              <span className="gradient-text">puissantes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer efficacement vos investissements
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Pourquoi choisir{' '}
                <span className="gradient-text">InvestPro</span> ?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Une solution complète et conforme à la réglementation marocaine
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-gray-700">{benefit}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Globe />, label: 'Multi-devises', color: 'from-blue-500 to-cyan-500' },
                  { icon: <Lock />, label: 'Sécurisé', color: 'from-green-500 to-emerald-500' },
                  { icon: <Clock />, label: 'Temps réel', color: 'from-purple-500 to-pink-500' },
                  { icon: <Award />, label: 'Certifié', color: 'from-orange-500 to-red-500' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-xl p-6 shadow-lg text-center"
                  >
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${item.color} text-white mb-3`}>
                      {item.icon}
                    </div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Prêt à transformer votre gestion d'investissement ?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des centaines d'entreprises marocaines qui font confiance à InvestPro
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-4 px-8 rounded-lg transition-all duration-200"
              >
                Se connecter
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">InvestPro</span>
              </div>
              <p className="text-gray-400">
                Gestion d'investissement intelligente pour le Maroc
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 InvestPro Maroc. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
