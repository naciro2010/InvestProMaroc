import { Box, Container, Typography, Button, Card, CardContent, Stack } from '@mui/material'
import {
  AccountBalance,
  TrendingUp,
  Security,
  Speed,
  Analytics,
  CloudDone,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const LandingPageSimple = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <AccountBalance sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Gestion des Conventions',
      description: 'Gérez vos conventions d\'intervention avec workflow complet de validation et versioning.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Suivi Budgétaire',
      description: 'Budgets avec versions (V0, V1, V2...) et contrôle automatique des plafonds.',
    },
    {
      icon: <Analytics sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Plan Analytique Dynamique',
      description: 'Créez vos propres dimensions d\'analyse : région, marché, phase, etc.',
    },
    {
      icon: <Security sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Sécurité Renforcée',
      description: 'Authentification JWT, rôles et permissions, audit trail complet.',
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Performance Optimale',
      description: 'Backend Kotlin + Spring Boot, frontend React moderne, PostgreSQL optimisé.',
    },
    {
      icon: <CloudDone sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Cloud Ready',
      description: 'Déploiement Docker, compatible Railway, Heroku, et infrastructure cloud.',
    },
  ]

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
              InvestPro Maroc
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={() => navigate('/login')}>
                Connexion
              </Button>
              <Button variant="contained" onClick={() => navigate('/register')}>
                Démarrer
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 12,
          pb: 10,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" maxWidth={800} mx="auto">
            <Typography
              variant="h2"
              fontWeight={600}
              gutterBottom
              sx={{ color: 'text.primary' }}
            >
              Gestion Intelligente des Dépenses d'Investissement
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.6 }}
            >
              Plateforme complète pour gérer vos conventions, budgets, décomptes et paiements
              avec un système analytique flexible et puissant.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ px: 4 }}
              >
                Commencer gratuitement
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ px: 4 }}
              >
                Se connecter
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" fontWeight={600} gutterBottom>
              Fonctionnalités Principales
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth={600} mx="auto">
              Une plateforme moderne et complète pour la gestion de vos investissements publics
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
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
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box mb={2}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
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
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
              gap: 4,
              textAlign: 'center',
            }}
          >
            <Box>
              <Typography variant="h3" fontWeight={600}>
                100%
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Sécurisé
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={600}>
                &lt; 200ms
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Temps de Réponse
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

      {/* CTA Section */}
      <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" fontWeight={600} gutterBottom>
              Prêt à démarrer ?
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={4}>
              Créez votre compte gratuitement et commencez à gérer vos investissements dès
              aujourd'hui
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
            >
              Créer un compte gratuit
            </Button>
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
            </Box>
            <Box textAlign={{ xs: 'center', md: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                © 2024 InvestPro Maroc. Tous droits réservés.
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
