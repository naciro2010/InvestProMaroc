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
                {"D\u00e9mo Gratuite"}
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
              label={"Version 1.0 \u2014 Maintenant disponible"}
              color="primary"
              size="small"
              sx={{ mb: 3, fontWeight: 500 }}
            />
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {"Pilotez vos investissements publics avec pr\u00e9cision"}
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {"Solution compl\u00e8te pour g\u00e9rer conventions, march\u00e9s, d\u00e9comptes et paiements. De la planification budg\u00e9taire jusqu\u2019au r\u00e8glement des fournisseurs, en passant par l\u2019analyse multidimensionnelle en temps r\u00e9el."}
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
                <span>{"Acc\u00e8s imm\u00e9diat"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-600" />
                <span>{"Donn\u00e9es de d\u00e9mo"}</span>
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
    </>
  )
}

export default LandingHero
