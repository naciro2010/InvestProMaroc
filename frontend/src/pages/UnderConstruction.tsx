import { useNavigate } from 'react-router-dom'
import { Construction, ArrowLeft, Home, Sparkles } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'

interface UnderConstructionProps {
  featureName?: string
  description?: string
}

const UnderConstruction = ({
  featureName = "Cette fonctionnalité",
  description = "Nous travaillons activement sur cette nouvelle fonctionnalité pour améliorer votre expérience."
}: UnderConstructionProps) => {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto px-4">
          {/* Animated Construction Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-primary-100 rounded-full animate-pulse"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <Construction className="w-24 h-24 text-primary-600 animate-bounce" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
                {featureName}
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </h1>
              <p className="text-xl text-gray-600">En cours de développement</p>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-8 border border-primary-100">
              <p className="text-gray-700 text-lg leading-relaxed">
                {description}
              </p>

              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Développement en cours</span>
                </div>
                <span className="text-gray-300">•</span>
                <span>Disponible prochainement</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <Home className="w-5 h-5" />
                Tableau de bord
              </button>
            </div>
          </div>

          {/* Features Timeline */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h3 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
              Roadmap des fonctionnalités
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✓</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Phase 1</p>
                <p className="text-xs text-gray-500 mt-1">Fondations</p>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-primary-500 text-center shadow-md">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Construction className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-sm font-medium text-primary-900">Phase 2</p>
                <p className="text-xs text-primary-600 mt-1">En développement</p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 text-center opacity-60">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⏳</span>
                </div>
                <p className="text-sm font-medium text-gray-900">Phase 3</p>
                <p className="text-xs text-gray-500 mt-1">À venir</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default UnderConstruction
