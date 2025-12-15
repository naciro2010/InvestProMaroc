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
  Target,
  Award,
  MapPin,
  Mail,
  Phone,
  ChevronRight,
} from 'lucide-react'

const LandingPageMassari = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Calculator,
      title: 'Calcul Automatique',
      description:
        'Calcul automatique des commissions d\'intervention et retenues fiscales marocaines (TVA, RG, IS)',
    },
    {
      icon: Shield,
      title: 'Conformité Fiscale',
      description:
        '100% conforme aux normes marocaines (IF, ICE, RIB 24 chiffres, retenues légales)',
    },
    {
      icon: FileText,
      title: 'Import Massif',
      description:
        'Import Excel/CSV de centaines de factures avec validation automatique et mapping intelligent',
    },
    {
      icon: BarChart3,
      title: 'Reporting Temps Réel',
      description:
        'Tableaux de bord interactifs avec KPIs, graphiques et exports Excel/PDF professionnels',
    },
    {
      icon: Users,
      title: 'Validation Multi-Niveaux',
      description:
        'Workflow d\'approbation hiérarchique avec traçabilité complète et historique',
    },
    {
      icon: Download,
      title: 'Export Comptabilité',
      description:
        'Exports compatibles avec vos logiciels comptables (Sage, Odoo, SAP) en 1 clic',
    },
  ]

  const problems = [
    {
      problem: 'Excel chronophage',
      solution: 'Automatisation intelligente',
      icon: Clock,
    },
    {
      problem: 'Erreurs de calcul',
      solution: 'Calculs fiables à 100%',
      icon: CheckCircle,
    },
    {
      problem: 'Reporting complexe',
      solution: 'Exports en 1 clic',
      icon: Download,
    },
  ]

  const stats = [
    { value: '85%', label: 'Temps gagné', icon: Zap },
    { value: '0', label: 'Erreur de calcul', icon: Target },
    { value: '100%', label: 'Conforme', icon: Shield },
    { value: '3 clics', label: 'Pour exporter', icon: Download },
  ]

  const testimonials = [
    {
      quote:
        'MASSARI a transformé notre processus financier. Nous gagnons 85% de temps sur la gestion des dépenses et commissions.',
      author: 'Directeur Financier',
      company: 'Rabat Région Aménagement',
      avatar: '👨‍💼',
    },
    {
      quote:
        'La conformité fiscale automatique nous évite les erreurs coûteuses. Un outil indispensable pour le secteur public.',
      author: 'Chef Comptable',
      company: 'RRA - Département Finances',
      avatar: '👩‍💼',
    },
  ]

  const faqs = [
    {
      question: 'MASSARI est-il conforme au CGNC marocain ?',
      answer:
        'Oui, MASSARI est 100% conforme aux normes comptables marocaines (CGNC) et aux réglementations fiscales en vigueur.',
    },
    {
      question: 'Peut-on intégrer MASSARI avec Sage ou Odoo ?',
      answer:
        'Absolument. MASSARI propose des exports compatibles avec les principaux ERP du marché (Sage, Odoo, SAP).',
    },
    {
      question: 'Quelle formation est nécessaire ?',
      answer:
        'Formation de 2 jours incluse avec support vidéo et documentation complète. Interface intuitive pensée pour les non-techniciens.',
    },
    {
      question: 'Quel support est disponible ?',
      answer:
        'Support technique dédié 6j/7 par email, téléphone et tickets. Mises à jour gratuites incluses.',
    },
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MASSARI</h1>
                <p className="text-xs text-gray-500">By RRA</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn-primary"
              >
                Essayer la Démo
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-orange-50 relative overflow-hidden">
        {/* Moroccan Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231E3A8A' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
                🇲🇦 Solution Marocaine pour le Secteur Public
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                MASSARI
                <span className="block text-primary-600 mt-2">
                  Maîtrisez vos Investissements
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                La solution moderne de gestion des dépenses d'investissement et calcul
                automatique des commissions pour{' '}
                <span className="font-semibold text-primary-600">
                  Rabat Région Aménagement
                </span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4"
                >
                  <span>Essayer la Démo</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="btn-secondary flex items-center justify-center space-x-2 text-lg px-8 py-4">
                  <span>Voir Vidéo</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8">
                  <div className="bg-white rounded-xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">Dépense Totale</div>
                      <div className="text-2xl font-bold text-primary-600">
                        2,450,000 MAD
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary-500 to-orange-500"
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Commission</div>
                        <div className="text-lg font-bold text-orange-600">
                          85,750 MAD
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Retenues</div>
                        <div className="text-lg font-bold text-amber-600">
                          245,000 MAD
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Net à Payer</div>
                        <div className="text-lg font-bold text-green-600">
                          2,290,750 MAD
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-green-500 text-white rounded-xl p-4 shadow-xl"
              >
                <CheckCircle className="w-8 h-8" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-orange-500 text-white rounded-xl p-4 shadow-xl"
              >
                <Calculator className="w-8 h-8" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problems → Solutions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              De l'Excel au Cloud
            </h2>
            <p className="text-xl text-gray-600">
              Transformez votre gestion financière
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {problems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-red-500 font-semibold">❌ {item.problem}</div>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-lg p-3">
                    <item.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-green-600 font-semibold text-lg">
                    ✓ {item.solution}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités Complètes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce dont vous avez besoin en une seule plateforme
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary-200"
              >
                <div className="bg-gradient-to-br from-primary-100 to-orange-100 rounded-lg p-3 w-fit mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Des Résultats Mesurables
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-primary-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-lg"
              >
                <div className="text-6xl mb-4">{testimonial.avatar}</div>
                <p className="text-lg text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Questions Fréquentes
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start">
                  <span className="text-primary-600 mr-3">Q:</span>
                  {faq.question}
                </h3>
                <p className="text-gray-600 ml-8">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 via-primary-700 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Prêt à moderniser votre gestion ?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Rejoignez les organismes publics qui ont déjà fait le choix de l'efficacité
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Demander une Démo</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Contacter l'équipe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">MASSARI</h3>
                  <p className="text-xs text-gray-400">By RRA</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Solution moderne de gestion financière pour le secteur public marocain
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tarification
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Confidentialité
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Rabat, Maroc</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>contact@massari.ma</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+212 5 37 XX XX XX</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 MASSARI by Rabat Région Aménagement. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPageMassari
