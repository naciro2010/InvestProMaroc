import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { LayoutContextProvider } from './contexts/LayoutContext'
import { CircularProgress, Box, Typography } from '@mui/material'
import CommandPalette from './components/core/CommandPalette'
import KeyboardShortcutsHelp from './components/core/KeyboardShortcutsHelp'
import ErrorBoundary from './components/core/ErrorBoundary'
import RouteProgress from './components/core/RouteProgress'
import ScrollToTop from './components/core/ScrollToTop'
import { useGoShortcuts } from './hooks/useGoShortcuts'

// Eager load - Critical path pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

// Lazy load - All other pages (code splitting)
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardModern = lazy(() => import('./pages/DashboardModern'))

// Conventions
const ConventionsTableModern = lazy(() => import('./pages/conventions/ConventionsTableModern'))
const ConventionWizardComplete = lazy(() => import('./pages/conventions/ConventionWizardComplete'))
const SousConventionWizard = lazy(() => import('./pages/conventions/SousConventionWizard'))
const AvenantForm = lazy(() => import('./pages/conventions/AvenantForm'))
const AvenantDetailPage = lazy(() => import('./pages/conventions/AvenantDetailPage'))
const ConventionDetailPageModern = lazy(() => import('./pages/conventions/ConventionDetailPageModern'))
const ParametrageConventionsPage = lazy(() => import('./pages/settings/ParametrageConventionsPage'))

// Marchés
const MarchesPage = lazy(() => import('./pages/marches/MarchesPage'))
const MarcheDetailPageModern = lazy(() => import('./pages/marches/MarcheDetailPageModern'))
const MarcheWizard = lazy(() => import('./pages/marches/MarcheWizard'))

// Projets
const ProjetsPage = lazy(() => import('./pages/projets/ProjetsPage'))
const ProjetWizard = lazy(() => import('./pages/projets/ProjetWizard'))
const ProjetDetailPageModern = lazy(() => import('./pages/projets/ProjetDetailPageModern'))

// Budgets
const BudgetsPage = lazy(() => import('./pages/budgets/BudgetsPage'))
const BudgetWizard = lazy(() => import('./pages/budgets/BudgetWizard'))
const BudgetDetailPageModern = lazy(() => import('./pages/budgets/BudgetDetailPageModern'))

// Fournisseurs
const FournisseursPage = lazy(() => import('./pages/fournisseurs/FournisseursPage'))

// Décomptes
const DecomptesPageComplete = lazy(() => import('./pages/decomptes/DecomptesPageComplete'))
const DecompteDetailPageModern = lazy(() => import('./pages/decomptes/DecompteDetailPageModern'))
const DecompteWizard = lazy(() => import('./pages/decomptes/DecompteWizard'))

// Paiements & Ordres de Paiement
const PaiementsPageComplete = lazy(() => import('./pages/paiements/PaiementsPageComplete'))
const OrdresPaiementPageComplete = lazy(() => import('./pages/paiements/OrdresPaiementPageComplete'))

// Commissions
const CommissionsPage = lazy(() => import('./pages/commissions/CommissionsPage'))

// Settings & Parametrage
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const PlanAnalytiquePage = lazy(() => import('./pages/parametrage/PlanAnalytiquePage'))
const CategoriesDepensesPage = lazy(() => import('./pages/parametrage/CategoriesDepensesPage'))
const PartenairesPage = lazy(() => import('./pages/parametrage/PartenairesPage'))

// Reporting & Others
const SelectWithQuickCreateDemo = lazy(() => import('./pages/examples/SelectWithQuickCreateDemo'))
const UsersPage = lazy(() => import('./pages/users/UsersPage'))
const UnderConstruction = lazy(() => import('./pages/UnderConstruction'))
const TeamMessagingPage = lazy(() => import('./pages/TeamMessagingPage'))
const CustomDashboardPage = lazy(() => import('./pages/custom-dashboard/CustomDashboardPage'))

// Loading fallback component
const PageLoader = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      bgcolor: 'background.default',
    }}
  >
    <CircularProgress size={36} thickness={4} color="primary" />
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      Chargement…
    </Typography>
  </Box>
)

/**
 * Get the base path from Vite's BASE_URL environment variable
 */
const getBasePath = (): string => {
  const base = import.meta.env.BASE_URL
  return base.endsWith('/') ? base.slice(0, -1) : base
}

// Protected Route Component with Error Boundary
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  return isAuthenticated ? (
    <ErrorBoundary level="page">
      {children}
    </ErrorBoundary>
  ) : (
    <Navigate to="/login" replace />
  )
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
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

// Global features that require Router context (hooks need to be inside Router)
const GlobalFeatures = () => {
  useGoShortcuts()
  return (
    <>
      <RouteProgress />
      <ScrollToTop />
      <CommandPalette />
      <KeyboardShortcutsHelp />
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename={getBasePath()}>
        <ThemeContextProvider>
          <LayoutContextProvider>
            <AuthProvider>
              <ToastProvider>
                <GlobalFeatures />
                <Suspense fallback={<PageLoader />}>
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
                      path="/conventions/:id"
                      element={
                        <ProtectedRoute>
                          <ConventionDetailPageModern />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/conventions/:id/edit"
                      element={
                        <ProtectedRoute>
                          <ConventionWizardComplete />
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
                    <Route
                      path="/conventions/:conventionId/avenants/:avenantId"
                      element={
                        <ProtectedRoute>
                          <AvenantDetailPage />
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
                      path="/marches/:id"
                      element={
                        <ProtectedRoute>
                          <MarcheDetailPageModern />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/marches/:marcheId/decomptes/nouveau"
                      element={
                        <ProtectedRoute>
                          <DecompteWizard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Décomptes */}
                    <Route
                      path="/decomptes"
                      element={
                        <ProtectedRoute>
                          <DecomptesPageComplete />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/decomptes/:id"
                      element={
                        <ProtectedRoute>
                          <DecompteDetailPageModern />
                        </ProtectedRoute>
                      }
                    />

                    {/* Paiements & Ordres de Paiement */}
                    <Route
                      path="/paiements"
                      element={
                        <ProtectedRoute>
                          <PaiementsPageComplete />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/ordres-paiement"
                      element={
                        <ProtectedRoute>
                          <OrdresPaiementPageComplete />
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
                      path="/budgets/:id"
                      element={
                        <ProtectedRoute>
                          <BudgetDetailPageModern />
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

                    {/* Parametrage */}
                    <Route
                      path="/parametrage/conventions"
                      element={
                        <ProtectedRoute>
                          <ParametrageConventionsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/parametrage/plan-analytique"
                      element={
                        <ProtectedRoute>
                          <PlanAnalytiquePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/parametrage/categories-depenses"
                      element={
                        <ProtectedRoute>
                          <CategoriesDepensesPage />
                        </ProtectedRoute>
                      }
                    />
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

                    {/* Custom Dashboard Generator */}
                    <Route
                      path="/generateur"
                      element={
                        <ProtectedRoute>
                          <CustomDashboardPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/messagerie"
                      element={
                        <ProtectedRoute>
                          <TeamMessagingPage />
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
                          <FournisseursPage />
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
                          <CommissionsPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch all - 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </ToastProvider>
            </AuthProvider>
          </LayoutContextProvider>
        </ThemeContextProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App
