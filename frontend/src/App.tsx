import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { LayoutContextProvider } from './contexts/LayoutContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardSimple from './pages/DashboardSimple'
import ConventionsPageMUI from './pages/conventions/ConventionsPageMUI'
import SimpleConventionForm from './pages/conventions/SimpleConventionForm'
import SousConventionWizard from './pages/conventions/SousConventionWizard'
import AvenantForm from './pages/conventions/AvenantForm'
import ConventionDetailPage from './pages/conventions/ConventionDetailPage'
import MarchesPage from './pages/marches/MarchesPage'
import MarcheDetailPage from './pages/marches/MarcheDetailPage'
import MarcheFormPage from './pages/marches/MarcheFormPage'
import MarcheWizard from './pages/marches/MarcheWizard'
import ProjetsPage from './pages/projets/ProjetsPage'
import ProjetFormPage from './pages/projets/ProjetFormPage'
import ProjetDetailPage from './pages/projets/ProjetDetailPage'
import BudgetsPage from './pages/budgets/BudgetsPage'
import BudgetFormPage from './pages/budgets/BudgetFormPage'
import BudgetDetailPage from './pages/budgets/BudgetDetailPage'
import DecomptesPage from './pages/decomptes/DecomptesPageComplete'
import DecompteWizard from './pages/decomptes/DecompteWizard'
import OrdresPaiementPage from './pages/paiements/OrdresPaiementPageComplete'
import PaiementsPage from './pages/paiements/PaiementsPageComplete'
import ProfilePage from './pages/ProfilePage'
import PlanAnalytiquePage from './pages/parametrage/PlanAnalytiquePage'
import ReportingAnalytiquePage from './pages/reporting/ReportingAnalytiquePage'
import UsersPage from './pages/users/UsersPage'
import UnderConstruction from './pages/UnderConstruction'

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
      <ThemeContextProvider>
        <LayoutContextProvider>
          <AuthProvider>
            <ToastProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
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
                <SimpleConventionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conventions/:id/edit"
            element={
              <ProtectedRoute>
                <SimpleConventionForm />
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
          <Route
            path="/conventions/:parentId/sous-conventions/nouvelle"
            element={
              <ProtectedRoute>
                <SousConventionWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conventions/:conventionId/avenants/nouveau"
            element={
              <ProtectedRoute>
                <AvenantForm />
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
            path="/marches/nouveau"
            element={
              <ProtectedRoute>
                <MarcheWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marches/:id/modifier"
            element={
              <ProtectedRoute>
                <MarcheFormPage />
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
          <Route
            path="/budgets/nouveau"
            element={
              <ProtectedRoute>
                <BudgetFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets/:id/modifier"
            element={
              <ProtectedRoute>
                <BudgetFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets/:id"
            element={
              <ProtectedRoute>
                <BudgetDetailPage />
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
          <Route
            path="/decomptes/nouveau"
            element={
              <ProtectedRoute>
                <DecompteWizard />
              </ProtectedRoute>
            }
          />

          {/* Ordres de Paiement */}
          <Route
            path="/ordres-paiement"
            element={
              <ProtectedRoute>
                <OrdresPaiementPage />
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

          {/* Users Management */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* Under Construction Pages */}
          <Route
            path="/fournisseurs"
            element={
              <ProtectedRoute>
                <UnderConstruction
                  featureName="Gestion des Fournisseurs"
                  description="Module complet pour gérer vos fournisseurs avec leurs informations fiscales (ICE, IF, RIB) et suivre leurs contrats et paiements."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comptes-bancaires"
            element={
              <ProtectedRoute>
                <UnderConstruction
                  featureName="Comptes Bancaires"
                  description="Gérez vos comptes bancaires, suivez les soldes et les opérations de rapprochement bancaire."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/depenses"
            element={
              <ProtectedRoute>
                <UnderConstruction
                  featureName="Gestion des Dépenses"
                  description="Module de suivi détaillé des dépenses avec catégorisation et analyse des coûts."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/commissions"
            element={
              <ProtectedRoute>
                <UnderConstruction
                  featureName="Calcul des Commissions"
                  description="Calculez automatiquement les commissions selon les conventions avec gestion des tranches et exclusions."
                />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
          </Routes>
            </ToastProvider>
          </AuthProvider>
        </LayoutContextProvider>
      </ThemeContextProvider>
    </Router>
  )
}

export default App
