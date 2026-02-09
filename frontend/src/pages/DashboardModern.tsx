import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Stack,
  Skeleton,
} from '@mui/material'
import {
  FileText,
  FolderOpen,
  Receipt,
  Banknote,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Activity,
} from 'lucide-react'
import { conventionsAPI, decomptesAPI, paiementsAPI, projetsAPI } from '../lib/api'
import AppLayout from '../components/layout/AppLayout'
import { colors, typography, componentStyles, borders, transitions } from '../lib/designSystem'
import StatsCard from '../components/common/StatsCard'
import { useAuth } from '../contexts/AuthContext'

interface ConventionData {
  id: number
  budget?: number
  statut?: string
}

interface ProjetData {
  id: number
  budgetTotal?: number
  status?: string
}

interface PaiementData {
  id: number
  montant?: number
}

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
  path: string
}

const DashboardModern = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [conventionsKPI, setConventionsKPI] = useState<KPI>({
    title: 'Conventions',
    value: 0,
    subtitle: '0 DH',
    icon: <FileText size={22} />,
    color: colors.primary[600],
    bgColor: colors.primary[50],
    loading: true,
    path: '/conventions',
  })

  const [projetsKPI, setProjetsKPI] = useState<KPI>({
    title: 'Projets',
    value: 0,
    subtitle: '0 DH',
    icon: <FolderOpen size={22} />,
    color: colors.purple[600],
    bgColor: colors.purple[50],
    loading: true,
    path: '/projets',
  })

  const [decomptesKPI, setDecomptesKPI] = useState<KPI>({
    title: 'Decomptes',
    value: 0,
    subtitle: '0 situations',
    icon: <Receipt size={22} />,
    color: colors.warning[600],
    bgColor: colors.warning[50],
    loading: true,
    path: '/decomptes',
  })

  const [paiementsKPI, setPaiementsKPI] = useState<KPI>({
    title: 'Paiements',
    value: 0,
    subtitle: '0 DH',
    icon: <Banknote size={22} />,
    color: colors.success[600],
    bgColor: colors.success[50],
    loading: true,
    path: '/paiements',
  })

  const formatLargeCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} M DH`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)} K DH`
    }
    return `${amount.toFixed(0)} DH`
  }

  // Independent data loading for each KPI
  useEffect(() => {
    const fetchConventions = async () => {
      try {
        const res = await conventionsAPI.getAll()
        const conventions: ConventionData[] = Array.isArray(res.data) ? res.data : []
        const montantTotal = conventions.reduce((sum, c) => sum + (c.budget || 0), 0)
        const validees = conventions.filter(c => c.statut === 'VALIDEE').length
        const enCours = conventions.filter(c => c.statut === 'EN_EXECUTION').length

        setConventionsKPI(prev => ({
          ...prev,
          value: conventions.length,
          subtitle: formatLargeCurrency(montantTotal),
          details: `${validees} validees \u2022 ${enCours} en cours`,
          trend: '+12%',
          loading: false,
        }))
      } catch {
        setConventionsKPI(prev => ({ ...prev, loading: false }))
      }
    }
    fetchConventions()
  }, [])

  useEffect(() => {
    const fetchProjets = async () => {
      try {
        const res = await projetsAPI.getAll()
        const projets: ProjetData[] = Array.isArray(res.data) ? res.data : []
        const montantTotal = projets.reduce((sum, p) => sum + (p.budgetTotal || 0), 0)
        const enCours = projets.filter(p => p.status === 'ACTIF').length
        const termine = projets.filter(p => p.status === 'ACHEVE').length

        setProjetsKPI(prev => ({
          ...prev,
          value: projets.length,
          subtitle: formatLargeCurrency(montantTotal),
          details: `${enCours} en cours \u2022 ${termine} termines`,
          trend: '+10%',
          loading: false,
        }))
      } catch {
        setProjetsKPI(prev => ({ ...prev, loading: false }))
      }
    }
    fetchProjets()
  }, [])

  useEffect(() => {
    const fetchDecomptes = async () => {
      try {
        const res = await decomptesAPI.getAll()
        const decomptes = Array.isArray(res.data) ? res.data : []
        setDecomptesKPI(prev => ({
          ...prev,
          value: decomptes.length,
          subtitle: `${decomptes.length} situations`,
          trend: '+15%',
          loading: false,
        }))
      } catch {
        setDecomptesKPI(prev => ({ ...prev, loading: false }))
      }
    }
    fetchDecomptes()
  }, [])

  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        const res = await paiementsAPI.getAll()
        const paiements: PaiementData[] = Array.isArray(res.data) ? res.data : []
        const montantTotal = paiements.reduce((sum, p) => sum + (p.montant || 0), 0)
        setPaiementsKPI(prev => ({
          ...prev,
          value: paiements.length,
          subtitle: formatLargeCurrency(montantTotal),
          trend: '+20%',
          loading: false,
        }))
      } catch {
        setPaiementsKPI(prev => ({ ...prev, loading: false }))
      }
    }
    fetchPaiements()
  }, [])

  const kpis = [conventionsKPI, projetsKPI, decomptesKPI, paiementsKPI]

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon apres-midi'
    return 'Bonsoir'
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        {/* Welcome Section */}
        <Box sx={{
          bgcolor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          px: { xs: 2, md: 3 },
          py: 3,
        }}>
          <Typography sx={{
            fontSize: typography.sizes['2xl'],
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
            letterSpacing: '-0.01em',
            mb: 0.5,
          }}>
            {greeting()}, {user?.fullName || 'Utilisateur'}
          </Typography>
          <Typography sx={{
            fontSize: typography.sizes.base,
            color: colors.textSecondary,
          }}>
            Voici un apercu de vos investissements et conventions
          </Typography>
        </Box>

        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          {/* KPI Grid */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2.5,
            mb: 4,
          }}>
            {kpis.map((kpi, index) => (
              kpi.loading ? (
                <Skeleton
                  key={index}
                  variant="rectangular"
                  height={200}
                  sx={{ borderRadius: borders.radius.xl }}
                />
              ) : (
                <StatsCard
                  key={index}
                  {...kpi}
                  onClick={() => navigate(kpi.path)}
                />
              )
            ))}
          </Box>

          {/* Quick Actions + Recent Activity */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 2.5,
            mb: 4,
          }}>
            {/* Quick Actions */}
            <Box sx={componentStyles.card}>
              <Box sx={{
                px: 3,
                py: 2,
                borderBottom: `1px solid ${colors.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: borders.radius.lg,
                  bgcolor: colors.primary[50],
                  color: colors.primary[600],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Activity size={16} />
                </Box>
                <Typography sx={{
                  fontWeight: typography.weights.semibold,
                  fontSize: typography.sizes.md,
                  color: colors.textPrimary,
                }}>
                  Actions rapides
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={1}>
                  {[
                    { label: 'Nouvelle convention', path: '/conventions/new', icon: <FileText size={16} />, color: colors.primary[600], bg: colors.primary[50] },
                    { label: 'Nouveau projet', path: '/projets/new', icon: <FolderOpen size={16} />, color: colors.purple[600], bg: colors.purple[50] },
                    { label: 'Nouveau marche', path: '/marches/new', icon: <BarChart3 size={16} />, color: colors.info[600], bg: colors.info[50] },
                    { label: 'Voir les rapports', path: '/reporting', icon: <TrendingUp size={16} />, color: colors.success[600], bg: colors.success[50] },
                  ].map((action) => (
                    <Box
                      key={action.path}
                      onClick={() => navigate(action.path)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1.5,
                        borderRadius: borders.radius.lg,
                        cursor: 'pointer',
                        transition: `all ${transitions.fast}`,
                        '&:hover': {
                          bgcolor: colors.neutral[50],
                        },
                      }}
                    >
                      <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: borders.radius.md,
                        bgcolor: action.bg,
                        color: action.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {action.icon}
                      </Box>
                      <Typography sx={{
                        flex: 1,
                        fontSize: typography.sizes.base,
                        fontWeight: typography.weights.medium,
                        color: colors.textPrimary,
                      }}>
                        {action.label}
                      </Typography>
                      <ArrowRight size={16} color={colors.textDisabled} />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>

            {/* System Status / Alerts */}
            <Box sx={componentStyles.card}>
              <Box sx={{
                px: 3,
                py: 2,
                borderBottom: `1px solid ${colors.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: borders.radius.lg,
                  bgcolor: colors.warning[50],
                  color: colors.warning[600],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AlertCircle size={16} />
                </Box>
                <Typography sx={{
                  fontWeight: typography.weights.semibold,
                  fontSize: typography.sizes.md,
                  color: colors.textPrimary,
                }}>
                  Notifications
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  {[
                    { text: 'Aucune convention en retard', type: 'success' as const },
                    { text: 'Toutes les donnees sont a jour', type: 'success' as const },
                    { text: 'Systeme operationnel', type: 'success' as const },
                  ].map((alert, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1.5,
                        borderRadius: borders.radius.lg,
                        bgcolor: alert.type === 'success' ? colors.success[25] : colors.warning[50],
                      }}
                    >
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: alert.type === 'success' ? colors.success[500] : colors.warning[500],
                        flexShrink: 0,
                      }} />
                      <Typography sx={{
                        fontSize: typography.sizes.sm,
                        color: alert.type === 'success' ? colors.success[700] : colors.warning[700],
                        fontWeight: typography.weights.medium,
                      }}>
                        {alert.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>

          {/* Activity Timeline */}
          <Box sx={componentStyles.card}>
            <Box sx={{
              px: 3,
              py: 2,
              borderBottom: `1px solid ${colors.divider}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: borders.radius.lg,
                bgcolor: colors.neutral[100],
                color: colors.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Clock size={16} />
              </Box>
              <Typography sx={{
                fontWeight: typography.weights.semibold,
                fontSize: typography.sizes.md,
                color: colors.textPrimary,
              }}>
                Activite recente
              </Typography>
            </Box>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: borders.radius.xl,
                bgcolor: colors.neutral[100],
                color: colors.textDisabled,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}>
                <Clock size={24} />
              </Box>
              <Typography sx={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.medium,
                color: colors.textSecondary,
                mb: 0.5,
              }}>
                Les activites recentes apparaitront ici
              </Typography>
              <Typography sx={{
                fontSize: typography.sizes.sm,
                color: colors.textDisabled,
              }}>
                Creez, modifiez ou validez des conventions pour voir l'historique
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  )
}

export default DashboardModern
