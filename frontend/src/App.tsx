import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import LandingPageSimple from './pages/LandingPageSimple'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardSimple from './pages/DashboardSimple'
import ConventionsPage from './pages/conventions/ConventionsPage'
import ConventionFormPage from './pages/conventions/ConventionFormPage'
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
                <ConventionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conventions/nouvelle"
            element={
              <ProtectedRoute>
                <ConventionFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conventions/:id/edit"
            element={
              <ProtectedRoute>
                <ConventionFormPage />
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

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
