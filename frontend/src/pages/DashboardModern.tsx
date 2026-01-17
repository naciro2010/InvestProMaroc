import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  IconButton,
  Typography,
  Stack,
  Skeleton,
} from '@mui/material'
import {
  FolderOpen,
  Receipt,
  Payments,
  Description,
  MoreVert,
} from '@mui/icons-material'
import { conventionsAPI, budgetsAPI, decomptesAPI, paiementsAPI, projetsAPI } from '../lib/api'
import AppLayout from '../components/layout/AppLayout'
import PageHeader from '../components/common/PageHeader'
import StatsCard from '../components/common/StatsCard'

interface KPI {
  title: string
  value: number
  subtitle: string
  details?: string
  icon: JSX.Element
  color: string
  bgColor: string
  trend?: string
  loading: boolean
}

const DashboardModern = () => {
  const navigate = useNavigate()

  // États séparés pour chaque KPI - chargement indépendant
  const [conventionsKPI, setConventionsKPI] = useState<KPI>({
    title: 'Conventions',
    value: 0,
    subtitle: '0 DH',
    icon: <Description />,
    color: '#3b82f6',
    bgColor: '#eff6ff',
    loading: true,
  })

  const [projetsKPI, setProjetsKPI] = useState<KPI>({
    title: 'Projets',
    value: 0,
    subtitle: '0 DH',
    icon: <FolderOpen />,
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    loading: true,
  })

  const [decomptesKPI, setDecomptesKPI] = useState<KPI>({
    title: 'Décomptes',
    value: 0,
    subtitle: '0 situations',
    icon: <Receipt />,
    color: '#f59e0b',
    bgColor: '#fef3c7',
    loading: true,
  })

  const [paiementsKPI, setPaiementsKPI] = useState<KPI>({
    title: 'Paiements',
    value: 0,
    subtitle: '0 DH',
    icon: <Payments />,
    color: '#10b981',
    bgColor: '#d1fae5',
    loading: true,
  })

  const formatLargeCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} M DH`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)} K DH`
    }
    return `${amount.toFixed(0)} DH`
  }

  // Chargement asynchrone indépendant pour Conventions
  useEffect(() => {
    const fetchConventions = async () => {
      try {
        const res = await conventionsAPI.getAll()
        const conventions = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || []

        const montantTotal = conventions.reduce((sum: number, c: any) => sum + (c.montant || c.budgetTotal || 0), 0)
        const validees = conventions.filter((c: any) => c.statut === 'VALIDEE').length
        const enCours = conventions.filter((c: any) => c.statut === 'EN_EXECUTION').length

        setConventionsKPI({
          title: 'Conventions',
          value: conventions.length,
          subtitle: formatLargeCurrency(montantTotal),
          details: `${validees} validées • ${enCours} en cours`,
          icon: <Description />,
          color: '#3b82f6',
          bgColor: '#eff6ff',
          trend: '+12%',
          loading: false,
        })
      } catch (error) {
        console.error('Error fetching conventions:', error)
        setConventionsKPI(prev => ({ ...prev, loading: false }))
      }
    }
    fetchConventions()
  }, [])

  // Chargement asynchrone indépendant pour Projets
  useEffect(() => {
    const fetchProjets = async () => {
      try {
        const res = await projetsAPI.getAll()
        const projets = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || []

        const montantTotal = projets.reduce((sum: number, p: any) => sum + (p.budgetTotal || 0), 0)
        const enCours = projets.filter((p: any) => p.statut === 'EN_COURS').length
        const termine = projets.filter((p: any) => p.statut === 'TERMINE').length

        setProjetsKPI({
          title: 'Projets',
          value: projets.length,
          subtitle: formatLargeCurrency(montantTotal),
          details: `${enCours} en cours • ${termine} terminés`,
          icon: <FolderOpen />,
          color: '#8b5cf6',
          bgColor: '#f5f3ff',
          trend: '+10%',
          loading: false,
        })
      } catch (error) {
        console.error('Error fetching projets:', error)
        setProjetsKPI(prev => ({ ...prev, loading: false }))
      }
    }
    fetchProjets()
  }, [])

  // Chargement asynchrone indépendant pour Décomptes
  useEffect(() => {
    const fetchDecomptes = async () => {
      try {
        const res = await decomptesAPI.getAll()
        const decomptes = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || []

        setDecomptesKPI({
          title: 'Décomptes',
          value: decomptes.length,
          subtitle: `${decomptes.length} situations`,
          icon: <Receipt />,
          color: '#f59e0b',
          bgColor: '#fef3c7',
          trend: '+15%',
          loading: false,
        })
      } catch (error) {
        console.error('Error fetching decomptes:', error)
        setDecomptesKPI(prev => ({ ...prev, loading: false }))
      }
    }
    fetchDecomptes()
  }, [])

  // Chargement asynchrone indépendant pour Paiements
  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        const res = await paiementsAPI.getAll()
        const paiements = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || []

        const montantTotal = paiements.reduce((sum: number, p: any) => sum + (p.montant || 0), 0)

        setPaiementsKPI({
          title: 'Paiements',
          value: paiements.length,
          subtitle: formatLargeCurrency(montantTotal),
          icon: <Payments />,
          color: '#10b981',
          bgColor: '#d1fae5',
          trend: '+20%',
          loading: false,
        })
      } catch (error) {
        console.error('Error fetching paiements:', error)
        setPaiementsKPI(prev => ({ ...prev, loading: false }))
      }
    }
    fetchPaiements()
  }, [])

  const kpis = [conventionsKPI, projetsKPI, decomptesKPI, paiementsKPI]

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <PageHeader
            title="Tableau de Bord"
            subtitle="Vue d'ensemble de vos investissements et conventions"
          />

          {/* KPIs Grid - Chargement progressif */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            {kpis.map((kpi, index) => (
              kpi.loading ? (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  height={180}
                  sx={{ borderRadius: '8px' }}
                />
              ) : (
                <StatsCard
                  key={index}
                  {...kpi}
                  onClick={() => {
                    if (kpi.title === 'Conventions') navigate('/conventions')
                    if (kpi.title === 'Projets') navigate('/projets')
                    if (kpi.title === 'Décomptes') navigate('/decomptes')
                    if (kpi.title === 'Paiements') navigate('/paiements')
                  }}
                />
              )
            ))}
          </Box>

          {/* Secondary Cards Row */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
              gap: 3,
            }}
          >
            {/* Activités récentes */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Activités récentes
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>

              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Chargement des données en temps réel...
                </Typography>
              </Stack>
            </Paper>

            {/* Alertes */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Alertes
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Aucune alerte pour le moment
                </Typography>
              </Stack>
            </Paper>
          </Box>
        </Container>
      </Box>
    </AppLayout>
  )
}

export default DashboardModern
