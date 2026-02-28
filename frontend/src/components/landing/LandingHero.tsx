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
        className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95"
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">InvestPro Maroc</h1>
                <p className="text-xs text-slate-400">Gestion Investissements Publics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', color: '#cbd5e1' }}
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
      <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.24),transparent_45%)]" />
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center max-w-4xl mx-auto relative"
          >
            <Chip
              label={"Plateforme ERP publique nouvelle g\u00e9n\u00e9ration"}
              color="primary"
              size="small"
              sx={{ mb: 3, fontWeight: 500 }}
            />
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {"Un cockpit moderne pour piloter vos investissements publics"}
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              {"Inspir\u00e9 des standards Odoo: une exp\u00e9rience claire, modulaire et productive pour g\u00e9rer conventions, march\u00e9s, d\u00e9comptes, paiements et analyse de performance dans un seul environnement."}
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
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span>Architecture web sans installation</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span>{"Interface m\u00e9tier inspir\u00e9e ERP"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span>{"Tra\u00e7abilit\u00e9 et audit natifs"}</span>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900 border-y border-slate-800">
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={fadeIn} className="text-center rounded-2xl border border-slate-700 p-5 bg-slate-950/60">
                <div className="text-blue-400 text-3xl mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-300">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>
    </>
  )
}

export default LandingHero
