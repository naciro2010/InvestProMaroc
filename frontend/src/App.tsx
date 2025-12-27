import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import LandingPageMassari from './pages/LandingPageMassari'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardMassari from './pages/DashboardMassari'
import ProjetsCRUD from './pages/ProjetsCRUD'
import FournisseursCRUD from './pages/FournisseursCRUD'
import AxesAnalytiquesCRUD from './pages/AxesAnalytiquesCRUD'
import ComptesBancairesCRUD from './pages/ComptesBancairesCRUD'
import DepensesCRUD from './pages/DepensesCRUD'
import MarchesPage from './pages/marches/MarchesPage'
import MarcheDetailPage from './pages/marches/MarcheDetailPage'
import ConventionsPage from './pages/conventions/ConventionsPage'
import CommissionsPage from './pages/commissions/CommissionsPage'
import UsersPage from './pages/users/UsersPage'
import ProfilePage from './pages/ProfilePage'

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
          <Route path="/" element={<LandingPageMassari />} />
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
                <DashboardMassari />
              </ProtectedRoute>
            }
          />

          {/* Référentiels - CRUD Pages */}
          <Route
            path="/conventions"
            element={
              <ProtectedRoute>
                <ConventionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projets"
            element={
              <ProtectedRoute>
                <ProjetsCRUD />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fournisseurs"
            element={
              <ProtectedRoute>
                <FournisseursCRUD />
              </ProtectedRoute>
            }
          />
          <Route
            path="/axes-analytiques"
            element={
              <ProtectedRoute>
                <AxesAnalytiquesCRUD />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comptes-bancaires"
            element={
              <ProtectedRoute>
                <ComptesBancairesCRUD />
              </ProtectedRoute>
            }
          />

          {/* Operations */}
          <Route
            path="/depenses"
            element={
              <ProtectedRoute>
                <DepensesCRUD />
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

          {/* User Management */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ComingSoon title="Paramètres" />
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
