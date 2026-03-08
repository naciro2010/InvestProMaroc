import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaChartLine,
  FaArrowRight,
} from 'react-icons/fa'
import { Container, Button } from '@mui/material'

const LandingCTA = () => {
  const navigate = useNavigate()

  return (
    <>
      {/* CTA Section */}
      <section className="py-20 bg-primary-700 text-white border-y border-primary-200">
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h3 className="text-4xl font-bold mb-4">
              {"Pr\u00eat \u00e0 moderniser votre gestion des conventions et investissements ?"}
            </h3>
            <p className="text-xl mb-8 text-primary-100">
              {"Offrez \u00e0 vos \u00e9quipes une exp\u00e9rience claire, structur\u00e9e et orient\u00e9e ex\u00e9cution, avec un suivi complet de chaque dossier."}
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
                Demander une d\u00e9monstration
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
                <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                  <FaChartLine className="text-white" />
                </div>
                <span className="font-bold text-white">InvestPro Maroc</span>
              </div>
              <p className="text-sm text-gray-400">
                {"Solution compl\u00e8te de gestion des investissements publics"}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">{"Fonctionnalit\u00e9s"}</h4>
              <ul className="space-y-2 text-sm">
                <li>Conventions & Avenants</li>
                <li>{"March\u00e9s G\u00e9olocalis\u00e9s"}</li>
                <li>{"D\u00e9comptes & Paiements"}</li>
                <li>Analyse Multidimensionnelle</li>
                <li>Reporting & Exports</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Secteurs</h4>
              <ul className="space-y-2 text-sm">
                <li>{"Collectivit\u00e9s Locales"}</li>
                <li>Etablissements Publics</li>
                <li>{"Minist\u00e8res & Agences"}</li>
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
                className="text-primary-300 hover:text-primary-200 transition-colors text-sm inline-flex items-center space-x-1"
              >
                <span>github.com/naciro2010/InvestProMaroc</span>
                <FaArrowRight className="text-xs" />
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>{"© 2024-2026 InvestPro Maroc. Projet Open Source sous licence MIT."}</p>
            <p className="mt-2">Made with care in Morocco</p>
          </div>
        </Container>
      </footer>
    </>
  )
}

export default LandingCTA
