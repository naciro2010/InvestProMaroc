import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaCheckCircle,
  FaQuoteLeft,
} from 'react-icons/fa'
import { Container, Button, Chip } from '@mui/material'

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

interface PricingPlan {
  name: string
  description: string
  features: string[]
  cta: string
  highlighted: boolean
}

interface Testimonial {
  quote: string
  author: string
  role: string
  organization: string
  avatar: string
}

interface FAQ {
  question: string
  answer: string
}

interface LandingStatsProps {
  deploymentPlans: PricingPlan[]
  testimonials: Testimonial[]
  faqs: FAQ[]
}

const LandingStats = ({ deploymentPlans, testimonials, faqs }: LandingStatsProps) => {
  const navigate = useNavigate()

  return (
    <>
      {/* Deployment Section */}
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
              {"Parcours de d\u00e9ploiement adapt\u00e9 \u00e0 votre organisation"}
            </h3>
            <p className="text-lg text-slate-300">
              {"Une approche progressive, orient\u00e9e usage et adoption m\u00e9tier"}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {deploymentPlans.map((plan, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className={`rounded-lg border ${
                  plan.highlighted
                    ? 'border-blue-500 shadow-lg shadow-blue-900/30 bg-slate-900'
                    : 'border-slate-700 bg-slate-900/60'
                } p-8 relative`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Chip label="Populaire" color="primary" size="small" />
                  </div>
                )}
                <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                <p className="text-sm text-slate-300 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm text-slate-200">
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
              Ce que disent nos utilisateurs
            </h3>
            <p className="text-lg text-slate-300">
              {"Retours d\u2019exp\u00e9rience de nos clients"}
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
                className="bg-slate-950/70 rounded-lg border border-slate-700 p-8"
              >
                <FaQuoteLeft className="text-blue-600 text-2xl mb-4" />
                <p className="text-slate-200 mb-6 leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-slate-300">{testimonial.role}</div>
                    <div className="text-xs text-slate-400">{testimonial.organization}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* FAQ Section */}
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
              {"Questions fr\u00e9quentes"}
            </h3>
            <p className="text-lg text-slate-300">
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
                className="border border-slate-700 bg-slate-900/60 rounded-lg p-6"
              >
                <h4 className="text-lg font-semibold text-white mb-3">{faq.question}</h4>
                <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>
    </>
  )
}

export default LandingStats
