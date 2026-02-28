import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import { Container } from '@mui/material'

// Animation variants
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

interface Feature {
  icon: ReactNode
  title: string
  description: string
  benefits: string[]
}

interface WorkflowItem {
  step: string
  title: string
  desc: string
  icon: ReactNode
}

interface UseCase {
  icon: ReactNode
  sector: string
  description: string
  examples: string[]
}

interface Capability {
  title: string
  detail: string
}

interface LandingFeaturesProps {
  features: Feature[]
  workflow: WorkflowItem[]
  useCases: UseCase[]
  capabilities: Capability[]
}

const LandingFeatures = ({ features, workflow, useCases, capabilities }: LandingFeaturesProps) => {
  return (
    <>
      <section className="py-14 bg-slate-950 border-y border-slate-800">
        <Container maxWidth="lg">
          <div className="grid md:grid-cols-3 gap-4">
            {capabilities.map((item, index) => (
              <div key={index} className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
                <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-white mb-4">
              Tout dans une seule plateforme
            </h3>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              De la convention au paiement, g{"\u00e9"}rez l'int{"\u00e9"}gralit{"\u00e9"} du processus avec des outils puissants et intuitifs
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
                className="bg-slate-900/70 rounded-2xl border border-slate-700 p-8 shadow-xl shadow-slate-950/40"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-500/15 rounded-xl flex items-center justify-center text-blue-300 border border-blue-400/20">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-2xl font-bold text-white mb-3">{feature.title}</h4>
                    <p className="text-slate-300 mb-4 leading-relaxed">{feature.description}</p>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-slate-200">
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
      <section className="py-20 bg-slate-950">
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-white mb-4">
              {"Workflow complet de A \u00e0 Z"}
            </h3>
            <p className="text-lg text-slate-300">
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
                <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-sm text-slate-300">{item.desc}</p>
                {index < workflow.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-slate-700"></div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-slate-900">
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-white mb-4">
              Pour tous les acteurs publics
            </h3>
            <p className="text-lg text-slate-300">
              {"Adapt\u00e9 aux besoins de chaque type d\u2019organisation"}
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
                className="bg-slate-950/80 rounded-2xl border border-slate-700 p-8"
              >
                <div className="text-4xl text-blue-300 mb-4">{useCase.icon}</div>
                <h4 className="text-xl font-bold text-white mb-2">{useCase.sector}</h4>
                <p className="text-slate-300 mb-4">{useCase.description}</p>
                <div className="space-y-2">
                  {useCase.examples.map((example, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm text-slate-200">
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
    </>
  )
}

export default LandingFeatures
