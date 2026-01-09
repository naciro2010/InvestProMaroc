import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import LandingPageSimple from './pages/LandingPageSimple'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardSimple from './pages/DashboardSimple'
import ConventionsPageMUI from './pages/conventions/ConventionsPageMUI'
import ConventionWizard from './pages/conventions/ConventionWizardComplete'
import SimpleConventionForm from './pages/conventions/SimpleConventionForm'
import ConventionDetailPage from './pages/conventions/ConventionDetailPage'
import MarchesPage from './pages/marches/MarchesPage'
import MarcheDetailPage from './pages/marches/MarcheDetailPage'
import ProjetsPage from './pages/projets/ProjetsPage'
import ProjetFormPage from './pages/projets/ProjetFormPage'
import ProjetDetailPage from './pages/projets/ProjetDetailPage'
import BudgetsPage from './pages/budgets/BudgetsPage'
import DecomptesPage from './pages/decomptes/DecomptesPage'
import PaiementsPage from './pages/paiements/PaiementsPage'
import ProfilePage from './pages/ProfilePage'
import PlanAnalytiquePage from './pages/parametrage/PlanAnalytiquePage'
import ReportingAnalytiquePage from './pages/reporting/ReportingAnalytiquePage'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />
}

// Placeholder component for pages not yet created
const ComingSoon = ({ title }: { title: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600">Cette page sera bientôt disponible...</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 btn-primary"
        >
          Retour
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPageSimple />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardSimple />
              </ProtectedRoute>
            }
          />

          {/* Conventions - Focus principal */}
          <Route
            path="/conventions"
            element={
              <ProtectedRoute>
                <ConventionsPageMUI />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conventions/nouvelle"
            element={
              <ProtectedRoute>
                <ConventionWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conventions/:id/edit"
            element={
              <ProtectedRoute>
                <ConventionWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conventions/:id"
            element={
              <ProtectedRoute>
                <ConventionDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Marchés */}
          <Route
            path="/marches"
            element={
              <ProtectedRoute>
                <MarchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marches/:id"
            element={
              <ProtectedRoute>
                <MarcheDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Projets */}
          <Route
            path="/projets"
            element={
              <ProtectedRoute>
                <ProjetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projets/nouveau"
            element={
              <ProtectedRoute>
                <ProjetFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projets/:id/modifier"
            element={
              <ProtectedRoute>
                <ProjetFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projets/:id"
            element={
              <ProtectedRoute>
                <ProjetDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Budgets */}
          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <BudgetsPage />
              </ProtectedRoute>
            }
          />

          {/* Décomptes */}
          <Route
            path="/decomptes"
            element={
              <ProtectedRoute>
                <DecomptesPage />
              </ProtectedRoute>
            }
          />

          {/* Paiements */}
          <Route
            path="/paiements"
            element={
              <ProtectedRoute>
                <PaiementsPage />
              </ProtectedRoute>
            }
          />

          {/* User Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Plan Analytique Dynamique */}
          <Route
            path="/parametrage/plan-analytique"
            element={
              <ProtectedRoute>
                <PlanAnalytiquePage />
              </ProtectedRoute>
            }
          />

          {/* Reporting Analytique */}
          <Route
            path="/reporting/analytique"
            element={
              <ProtectedRoute>
                <ReportingAnalytiquePage />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
