import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Stack,
  Skeleton,
  Chip,
} from '@mui/material'
import {
  FileText,
  FolderOpen,
  Receipt,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Eye,
  Plus,
  BarChart3,
} from 'lucide-react'
import { conventionsAPI, marchesAPI } from '@/lib/api'
import { colors, typography, componentStyles, borders, transitions, getStatusConfig } from '@/lib/designSystem'
import {
  ConventionData,
  MarcheData,
  RecentItem,
  DashboardSectionProps,
  SectionHeader,
  formatDate,
  extractApiData,
} from './types'

interface AlertItem {
  text: string
  type: 'success' | 'warning' | 'info'
}

const ALERT_COLORS = {
  success: { bg: colors.success[25], dot: colors.success[400], text: colors.success[700], icon: <CheckCircle2 size={14} /> },
  warning: { bg: colors.warning[25], dot: colors.warning[400], text: colors.warning[700], icon: <AlertTriangle size={14} /> },
  info: { bg: colors.neutral[50], dot: colors.info[400], text: colors.info[700], icon: <Clock size={14} /> },
}

const QUICK_ACTIONS = [
  { label: 'Nouvelle convention', path: '/conventions/new', icon: <FileText size={16} /> },
  { label: 'Nouveau projet', path: '/projets/new', icon: <FolderOpen size={16} /> },
  { label: 'Nouveau marche', path: '/marches/new', icon: <BarChart3 size={16} /> },
  { label: 'Reporting', path: '/reporting', icon: <TrendingUp size={16} /> },
]

const DashboardRecentActivity = ({ refreshKey }: DashboardSectionProps) => {
  const navigate = useNavigate()
  const [conventions, setConventions] = useState<ConventionData[]>([])
  const [marches, setMarches] = useState<MarcheData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      try {
        const [convRes, marchRes] = await Promise.allSettled([
          conventionsAPI.getAll(),
          marchesAPI.getAll(),
        ])
        if (cancelled) return
        if (convRes.status === 'fulfilled') setConventions(extractApiData<ConventionData>(convRes.value))
        if (marchRes.status === 'fulfilled') setMarches(extractApiData<MarcheData>(marchRes.value))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [refreshKey])

  const recentItems: RecentItem[] = useMemo(() => {
    const items: RecentItem[] = []
    conventions.slice(0, 5).forEach(c => {
      items.push({
        id: c.id, code: c.code || `CONV-${c.id}`, label: c.objet || 'Convention',
        status: c.statut || 'BROUILLON', date: c.updatedAt || c.createdAt || '',
        type: 'convention', path: `/conventions/${c.id}`,
      })
    })
    marches.slice(0, 3).forEach(m => {
      items.push({
        id: m.id, code: m.code || `M-${m.id}`, label: m.objet || 'Marche',
        status: m.statut || 'BROUILLON', date: m.createdAt || '',
        type: 'marche', path: `/marches/${m.id}`,
      })
    })
    return items
      .sort((a, b) => {
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      .slice(0, 6)
  }, [conventions, marches])

  const alerts: AlertItem[] = useMemo(() => {
    const items: AlertItem[] = []
    const pendingSoumis = conventions.filter(c => c.statut === 'SOUMIS').length
    if (pendingSoumis > 0) {
      items.push({ text: `${pendingSoumis} convention${pendingSoumis > 1 ? 's' : ''} en attente de validation`, type: 'warning' })
    }
    const brouillons = conventions.filter(c => c.statut === 'BROUILLON').length
    if (brouillons > 0) {
      items.push({ text: `${brouillons} brouillon${brouillons > 1 ? 's' : ''} a finaliser`, type: 'info' })
    }
    const enExecution = conventions.filter(c => c.statut === 'EN_EXECUTION').length
    if (enExecution > 0) {
      items.push({ text: `${enExecution} convention${enExecution > 1 ? 's' : ''} en cours d'execution`, type: 'success' })
    }
    if (items.length === 0) {
      items.push({ text: 'Toutes les conventions sont a jour', type: 'success' })
    }
    return items
  }, [conventions])

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
      gap: 2.5,
    }}>
      {/* Recent Activity */}
      <Box sx={componentStyles.card}>
        <SectionHeader
          icon={<Clock size={16} />}
          title="Activite recente"
          action={
            <Typography onClick={() => navigate('/conventions')} sx={{
              fontSize: typography.sizes.xs, color: colors.link, cursor: 'pointer',
              fontWeight: typography.weights.medium, '&:hover': { textDecoration: 'underline' },
            }}>
              Voir tout
            </Typography>
          }
        />
        {loading ? (
          <Stack spacing={0} sx={{ p: 0 }}>
            {[1, 2, 3, 4].map(i => (
              <Box key={i} sx={{ px: 3, py: 1.5 }}><Skeleton height={40} /></Box>
            ))}
          </Stack>
        ) : recentItems.length > 0 ? (
          <Stack spacing={0}>
            {recentItems.map((item) => {
              const statusCfg = getStatusConfig(item.status)
              return (
                <Box
                  key={`${item.type}-${item.id}`}
                  onClick={() => navigate(item.path)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1.5,
                    cursor: 'pointer', transition: `background-color ${transitions.fast}`,
                    borderBottom: `1px solid ${colors.divider}`,
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: colors.neutral[25] },
                  }}
                >
                  <Box sx={{
                    width: 34, height: 34, borderRadius: borders.radius.md,
                    bgcolor: colors.neutral[50], color: colors.neutral[500],
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {item.type === 'convention' ? <FileText size={16} />
                      : item.type === 'marche' ? <Receipt size={16} />
                      : <FolderOpen size={16} />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography sx={{
                        fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
                        color: colors.textPrimary,
                      }}>
                        {item.code}
                      </Typography>
                      <Chip label={statusCfg.label} size="small" sx={{
                        height: 20, fontSize: typography.sizes['2xs'],
                        fontWeight: typography.weights.semibold,
                        bgcolor: statusCfg.bgColor, color: statusCfg.textColor,
                        '& .MuiChip-label': { px: 1 },
                      }} />
                    </Stack>
                    <Typography sx={{
                      fontSize: typography.sizes.xs, color: colors.textSecondary,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: typography.sizes['2xs'], color: colors.textDisabled, flexShrink: 0 }}>
                    {formatDate(item.date)}
                  </Typography>
                  <Eye size={14} color={colors.textDisabled} />
                </Box>
              )
            })}
          </Stack>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Clock size={32} color={colors.textDisabled} style={{ marginBottom: 8 }} />
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
              Les activites recentes apparaitront ici
            </Typography>
          </Box>
        )}
      </Box>

      {/* Right Column: Alerts + Quick Actions */}
      <Stack spacing={2.5}>
        {/* Alerts */}
        <Box sx={componentStyles.card}>
          <SectionHeader icon={<AlertTriangle size={16} />} title="Alertes" />
          <Box sx={{ p: 2 }}>
            <Stack spacing={1}>
              {alerts.map((alert, idx) => {
                const ac = ALERT_COLORS[alert.type]
                return (
                  <Box key={idx} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 2, py: 1.5, borderRadius: borders.radius.lg, bgcolor: ac.bg,
                  }}>
                    <Box sx={{ color: ac.dot, flexShrink: 0 }}>{ac.icon}</Box>
                    <Typography sx={{
                      fontSize: typography.sizes.sm, color: ac.text,
                      fontWeight: typography.weights.medium,
                    }}>
                      {alert.text}
                    </Typography>
                  </Box>
                )
              })}
            </Stack>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box sx={componentStyles.card}>
          <SectionHeader icon={<Plus size={16} />} title="Actions rapides" />
          <Box sx={{ p: 1.5 }}>
            <Stack spacing={0.5}>
              {QUICK_ACTIONS.map((action) => (
                <Box
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 2, py: 1.5, borderRadius: borders.radius.lg,
                    cursor: 'pointer', transition: `all ${transitions.fast}`,
                    '&:hover': { bgcolor: colors.neutral[50] },
                  }}
                >
                  <Box sx={{
                    width: 32, height: 32, borderRadius: borders.radius.md,
                    bgcolor: colors.neutral[100], color: colors.neutral[500],
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {action.icon}
                  </Box>
                  <Typography sx={{
                    flex: 1, fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.medium, color: colors.textPrimary,
                  }}>
                    {action.label}
                  </Typography>
                  <ArrowRight size={14} color={colors.textDisabled} />
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Box>
  )
}

export default DashboardRecentActivity
