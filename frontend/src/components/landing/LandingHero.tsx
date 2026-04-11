import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaChartLine,
  FaCheckCircle,
  FaArrowRight,
} from 'react-icons/fa'
import { Box, Container, Button, Chip } from '@mui/material'

// Animation variants (subtils, ERP-style)
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

interface StatItem {
  value: string
  label: string
  icon: ReactNode
}

interface LandingHeroProps {
  stats: StatItem[]
}

const LandingHero = ({ stats }: LandingHeroProps) => {
  const navigate = useNavigate()

  return (
    <>
      {/* Header/Navbar */}
      <motion.nav
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95"
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
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
                sx={{ textTransform: 'none', color: 'inherit' }}
              >
                Connexion
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', boxShadow: 'none' }}
              >
                {"D\u00e9mo Gratuite"}
              </Button>
            </div>
          </Box>
        </Container>
      </motion.nav>

      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1b2e45 0%, #2D4A6F 50%, #476693 100%)' }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center max-w-4xl mx-auto relative"
          >
            <Chip
              label={"Plateforme ERP publique nouvelle g\u00e9n\u00e9ration"}
              size="small"
              sx={{ mb: 3, fontWeight: 500, bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
            />
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {"La plateforme claire et structurée pour piloter vos conventions publiques"}
            </h2>
            <p className="text-xl text-primary-200 mb-8 leading-relaxed">
              {"Inspirée des meilleures pratiques ERP, InvestPro centralise le cycle complet: convention cadre/spécifique, marchés, suivi de réalisation, décomptes, ordres de paiement et tableaux de bord analytiques pour un pilotage précis et collaboratif."}
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
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-primary-200">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-success-600" />
                <span>Architecture web sans installation</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-success-600" />
                <span>{"Interface m\u00e9tier inspir\u00e9e ERP"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-success-600" />
                <span>{"Tra\u00e7abilit\u00e9 et audit natifs"}</span>
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
              <motion.div key={index} variants={fadeIn} className="text-center rounded-2xl border border-gray-200 p-5 bg-gray-50">
                <div className="text-primary-600 text-3xl mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>
    </>
  )
}

export default LandingHero
