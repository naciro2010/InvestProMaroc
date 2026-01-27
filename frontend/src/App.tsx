import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { LayoutContextProvider } from './contexts/LayoutContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardModern from './pages/DashboardModern'
import ConventionsTableModern from './pages/conventions/ConventionsTableModern'
import ConventionWizardComplete from './pages/conventions/ConventionWizardComplete'
import SousConventionWizard from './pages/conventions/SousConventionWizard'
import AvenantForm from './pages/conventions/AvenantForm'
import ConventionDetailPageModern from './pages/conventions/ConventionDetailPageModern'
import ConventionEditPageComplete from './pages/conventions/ConventionEditPageComplete'
import ParametrageConventionsPage from './pages/settings/ParametrageConventionsPage'
import MarchesPage from './pages/marches/MarchesPage'
import MarcheDetailPageModern from './pages/marches/MarcheDetailPageModern'
import MarcheFormPage from './pages/marches/MarcheFormPage'
import MarcheWizard from './pages/marches/MarcheWizard'
import ProjetsPage from './pages/projets/ProjetsPage'
import ProjetFormPage from './pages/projets/ProjetFormPage'
import ProjetWizard from './pages/projets/ProjetWizard'
import ProjetDetailPageModern from './pages/projets/ProjetDetailPageModern'
import BudgetsPage from './pages/budgets/BudgetsPage'
import BudgetFormPage from './pages/budgets/BudgetFormPage'
import BudgetWizard from './pages/budgets/BudgetWizard'
import BudgetDetailPageModern from './pages/budgets/BudgetDetailPageModern'
import DecomptesPage from './pages/decomptes/DecomptesPageComplete'
import DecompteWizard from './pages/decomptes/DecompteWizard'
import OrdresPaiementPage from './pages/paiements/OrdresPaiementPageComplete'
import PaiementsPage from './pages/paiements/PaiementsPageComplete'
import VersementsPrevisionnelsPage from './pages/versements/VersementsPrevisionnelsPage'
import ProfilePage from './pages/ProfilePage'
import PlanAnalytiquePage from './pages/parametrage/PlanAnalytiquePage'
import CategoriesDepensesPage from './pages/parametrage/CategoriesDepensesPage'
import PartenairesPage from './pages/parametrage/PartenairesPage'
import SelectWithQuickCreateDemo from './pages/examples/SelectWithQuickCreateDemo'
import ReportingAnalytiquePage from './pages/reporting/ReportingAnalytiquePage'
import UsersPage from './pages/users/UsersPage'
import UnderConstruction from './pages/UnderConstruction'

/**
 * Get the base path from Vite's BASE_URL environment variable
 * This is automatically set by Vite based on the 'base' option in vite.config.ts
 * - Development/Railway: '/'
 * - GitHub Pages: '/InvestProMaroc/'
 */
const getBasePath = (): string => {
  const base = import.meta.env.BASE_URL
  // Ensure it doesn't end with a trailing slash (Router handles this internally)
  return base.endsWith('/') ? base.slice(0, -1) : base
}

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

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename={getBasePath()}>
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
                        <DashboardModern />
                      </ProtectedRoute>
                    }
                  />

                  {/* Conventions - Focus principal */}
                  <Route
                    path="/conventions"
                    element={
                      <ProtectedRoute>
                        <ConventionsTableModern />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/conventions/nouvelle"
                    element={
                      <ProtectedRoute>
                        <ConventionWizardComplete />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/conventions/:id/edit"
                    element={
                      <ProtectedRoute>
                        <ConventionEditPageComplete />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/conventions/:id"
                    element={
                      <ProtectedRoute>
                        <ConventionDetailPageModern />
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
                    path="/parametrage/conventions"
                    element={
                      <ProtectedRoute>
                        <ParametrageConventionsPage />
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
                <MarcheDetailPageModern />
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
                <ProjetWizard />
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
                <ProjetDetailPageModern />
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
                <BudgetWizard />
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
                <BudgetDetailPageModern />
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

          {/* Versements Prévisionnels */}
          <Route
            path="/versements-previsionnels"
            element={
              <ProtectedRoute>
                <VersementsPrevisionnelsPage />
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

          {/* Catégories de dépenses (Référentiel) */}
          <Route
            path="/parametrage/categories-depenses"
            element={
              <ProtectedRoute>
                <CategoriesDepensesPage />
              </ProtectedRoute>
            }
          />

          {/* Partenaires (Référentiel) */}
          <Route
            path="/parametrage/partenaires"
            element={
              <ProtectedRoute>
                <PartenairesPage />
              </ProtectedRoute>
            }
          />

          {/* SelectWithQuickCreate Demo */}
          <Route
            path="/examples/select-with-quick-create"
            element={
              <ProtectedRoute>
                <SelectWithQuickCreateDemo />
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
    </QueryClientProvider>
  )
}

export default App
