import { Box, Container, Typography, Button, Card, CardContent, Stack, Chip, Alert, AlertTitle } from '@mui/material'
import {
  AccountBalance,
  TrendingUp,
  Security,
  Speed,
  Analytics,
  CloudDone,
  Assessment,
  AccountBalanceWallet,
  Description,
  VerifiedUser,
  AdminPanelSettings,
  Business,
  Person,
  Calculate,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const LandingPageSimple = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <AccountBalance sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Conventions d\'Intervention',
      description: 'Gestion complète des conventions avec workflow de validation, types multiples (CADRE, SPÉCIFIQUE, AVENANT) et versioning.',
      status: 'Implémenté',
    },
    {
      icon: <Description sx={{ fontSize: 48, color: 'success.main' }} />,
      title: 'Marchés Publics',
      description: 'CRUD complet des marchés avec lignes détaillées, avenants, suivi délais, et imputation analytique JSONB par ligne.',
      status: 'Implémenté',
    },
    {
      icon: <Analytics sx={{ fontSize: 48, color: 'success.main' }} />,
      title: 'Plan Analytique Dynamique',
      description: 'Système flexible avec dimensions configurables (Budget, Projet, Secteur, etc.), reporting interactif, et export Excel.',
      status: 'Implémenté',
    },
    {
      icon: <Assessment sx={{ fontSize: 48, color: 'warning.main' }} />,
      title: 'Décomptes & OP',
      description: 'Entités complètes avec imputation JSONB, workflow de validation, calcul automatique des retenues.',
      status: 'Backend OK',
    },
    {
      icon: <AccountBalanceWallet sx={{ fontSize: 48, color: 'warning.main' }} />,
      title: 'Paiements',
      description: 'Suivi des paiements avec imputation analytique, rapprochement bancaire, journal des paiements.',
      status: 'Backend OK',
    },
    {
      icon: <Calculate sx={{ fontSize: 48, color: 'success.main' }} />,
      title: 'Commissions',
      description: 'Calcul automatique des commissions d\'intervention avec base paramétrable et taux personnalisés.',
      status: 'Implémenté',
    },
    {
      icon: <Security sx={{ fontSize: 48, color: 'success.main' }} />,
      title: 'Sécurité JWT',
      description: 'Authentification JWT avec refresh tokens, rôles (ADMIN, MANAGER, USER), et permissions granulaires.',
      status: 'Implémenté',
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: 'success.main' }} />,
      title: 'Performance Optimale',
      description: 'Backend Kotlin 2.0.21 + Spring Boot 3.3.5, React 18 + TypeScript, PostgreSQL avec JSONB optimisé.',
      status: 'Implémenté',
    },
  ]

  const demoAccounts = [
    {
      icon: <AdminPanelSettings sx={{ fontSize: 40, color: 'error.main' }} />,
      username: 'admin',
      password: 'demo123',
      role: 'Administrateur',
      description: 'Accès complet - Gestion utilisateurs, configuration système',
      color: 'error',
    },
    {
      icon: <Business sx={{ fontSize: 40, color: 'primary.main' }} />,
      username: 'manager',
      password: 'demo123',
      role: 'Manager',
      description: 'Gestion complète des conventions, marchés, et budgets',
      color: 'primary',
    },
    {
      icon: <VerifiedUser sx={{ fontSize: 40, color: 'info.main' }} />,
      username: 'gestionnaire',
      password: 'demo123',
      role: 'Gestionnaire',
      description: 'Saisie et suivi des décomptes, ordres de paiement',
      color: 'info',
    },
    {
      icon: <Calculate sx={{ fontSize: 40, color: 'success.main' }} />,
      username: 'comptable',
      password: 'demo123',
      role: 'Comptable',
      description: 'Validation financière, contrôle budgétaire',
      color: 'success',
    },
    {
      icon: <Person sx={{ fontSize: 40, color: 'warning.main' }} />,
      username: 'consultant',
      password: 'demo123',
      role: 'Consultant',
      description: 'Consultation et reporting - Lecture seule',
      color: 'warning',
    },
  ]

  const handleQuickLogin = (username: string, password: string) => {
    // Stocker les credentials pour auto-fill sur la page de login
    sessionStorage.setItem('demo_username', username)
    sessionStorage.setItem('demo_password', password)
    navigate('/login')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Implémenté':
        return 'success'
      case 'Backend OK':
        return 'warning'
      case 'En développement':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={600} color="primary">
              🏦 InvestPro Maroc
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={() => navigate('/login')}>
                Connexion
              </Button>
              <Button variant="contained" onClick={() => navigate('/dashboard')}>
                Démo
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          pt: 12,
          pb: 10,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" maxWidth={900} mx="auto">
            <Typography
              variant="h2"
              fontWeight={600}
              gutterBottom
            >
              Gestion Intelligente des Dépenses d'Investissement
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, lineHeight: 1.8, opacity: 0.95 }}
            >
              Plateforme complète pour gérer vos conventions, marchés, décomptes et paiements
              avec un système analytique flexible et puissant basé sur PostgreSQL JSONB.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              <Chip label="Kotlin 2.0.21" sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 600 }} />
              <Chip label="Spring Boot 3.3.5" sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 600 }} />
              <Chip label="React 18 + TypeScript" sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 600 }} />
              <Chip label="PostgreSQL 14+" sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 600 }} />
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Demo Accounts Section - NOUVEAU */}
      <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight={600} gutterBottom>
              🚀 Testez Immédiatement
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth={700} mx="auto">
              Utilisez un compte de démonstration pour explorer la plateforme sans inscription
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 4 }}>
            <AlertTitle><strong>Comment tester ?</strong></AlertTitle>
            Cliquez sur un profil ci-dessous pour vous connecter automatiquement et découvrir les fonctionnalités selon le rôle.
          </Alert>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
            }}
          >
            {demoAccounts.map((account, index) => (
              <Card
                key={index}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleQuickLogin(account.username, account.password)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box>{account.icon}</Box>
                    <Box flex={1}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Typography variant="h6" fontWeight={600}>
                          {account.role}
                        </Typography>
                        <Chip
                          label={account.username}
                          size="small"
                          color={account.color as any}
                          variant="outlined"
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mb={2} lineHeight={1.6}>
                        {account.description}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          <strong>Login:</strong> {account.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Mot de passe:</strong> {account.password}
                        </Typography>
                        <Button size="small" variant="outlined">
                          Connexion →
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight={600} gutterBottom>
              ✨ Fonctionnalités Implémentées
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth={700} mx="auto">
              Une plateforme moderne et complète pour la gestion de vos investissements publics
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: 3,
            }}
          >
            {features.map((feature, index) => (
              <Card
                key={index}
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box mb={2}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Chip
                    label={feature.status}
                    size="small"
                    color={getStatusColor(feature.status) as any}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'primary.main', py: 8, color: 'white' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' },
              gap: 4,
              textAlign: 'center',
            }}
          >
            <Box>
              <Typography variant="h3" fontWeight={600}>
                15+
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Tables DB
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={600}>
                100%
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Sécurisé JWT
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={600}>
                JSONB
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Analytique Flexible
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={600}>
                24/7
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Disponibilité
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Tech Stack Section */}
      <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight={600} gutterBottom>
              🔧 Stack Technique
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Technologies modernes et éprouvées
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 4,
            }}
          >
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={600} mb={3} color="primary">
                  Backend
                </Typography>
                <Stack spacing={1.5}>
                  <Typography>✓ Kotlin 2.0.21 + Spring Boot 3.3.5</Typography>
                  <Typography>✓ Spring Data JPA + Hibernate</Typography>
                  <Typography>✓ PostgreSQL 14+ avec JSONB</Typography>
                  <Typography>✓ Flyway Migration Management</Typography>
                  <Typography>✓ Spring Security + JWT</Typography>
                  <Typography>✓ OpenAPI 3.0 / Swagger UI</Typography>
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={600} mb={3} color="primary">
                  Frontend
                </Typography>
                <Stack spacing={1.5}>
                  <Typography>✓ React 18 + TypeScript 5.x</Typography>
                  <Typography>✓ Vite 5.x ultra-rapide</Typography>
                  <Typography>✓ Material-UI (MUI)</Typography>
                  <Typography>✓ Recharts (graphiques interactifs)</Typography>
                  <Typography>✓ React Router v6</Typography>
                  <Typography>✓ Axios + JWT Interceptors</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 12, bgcolor: 'background.default' }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" fontWeight={600} gutterBottom>
              Prêt à commencer ?
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={4}>
              Utilisez un compte de démo ci-dessus ou créez votre propre compte
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
              >
                Essayer maintenant
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => window.open('https://github.com/naciro2010/InvestProMaroc', '_blank')}
                sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
              >
                Voir sur GitHub
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            textAlign={{ xs: 'center', md: 'left' }}
          >
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                InvestPro Maroc
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Plateforme de gestion des dépenses d'investissement
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Kotlin 2.0.21 • Spring Boot 3.3.5 • React 18 • PostgreSQL
              </Typography>
            </Box>
            <Box textAlign={{ xs: 'center', md: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                © 2024-2025 InvestPro Maroc. Tous droits réservés.
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Made with ❤️ in Morocco 🇲🇦
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPageSimple
