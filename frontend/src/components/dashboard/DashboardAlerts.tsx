import { useNavigate } from 'react-router-dom'
import { Box, Typography, Stack } from '@mui/material'
import {
  AlertTriangle, CheckCircle2, Clock, XCircle, ArrowRight,
} from 'lucide-react'
import { colors, typography, componentStyles, borders, transitions } from '@/lib/designSystem'
import { DashboardAlertDTO, RecentActivityExecDTO } from '@/lib/api'
import { SectionHeader, formatDate } from './types'
import { getStatusConfig } from '@/lib/designSystem'

interface AlertsProps {
  alerts: DashboardAlertDTO[]
}

const SEVERITY_MAP: Record<string, {
  bg: string; text: string; icon: React.ReactElement
}> = {
  danger: { bg: `${colors.danger[600]}08`, text: colors.danger[600], icon: <XCircle size={14} /> },
  warning: { bg: `${colors.warning[600]}08`, text: colors.warning[600], icon: <AlertTriangle size={14} /> },
  info: { bg: colors.neutral[50], text: colors.info[600], icon: <Clock size={14} /> },
  success: { bg: `${colors.success[600]}08`, text: colors.success[600], icon: <CheckCircle2 size={14} /> },
}

export const DashboardAlerts = ({ alerts }: AlertsProps) => {
  const navigate = useNavigate()

  return (
    <Box sx={componentStyles.card}>
      <SectionHeader icon={<AlertTriangle size={16} />} title="Alertes et notifications" />
      <Box sx={{ p: 2 }}>
        <Stack spacing={1}>
          {alerts.map((alert, idx) => {
            const cfg = SEVERITY_MAP[alert.severity] || SEVERITY_MAP.info
            return (
              <Box
                key={idx}
                onClick={() => alert.link && navigate(alert.link)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  px: 2, py: 1.5, borderRadius: borders.radius.lg,
                  bgcolor: cfg.bg,
                  cursor: alert.link ? 'pointer' : 'default',
                  transition: `all ${transitions.fast}`,
                  '&:hover': alert.link ? { opacity: 0.85 } : {},
                }}
              >
                <Box sx={{ color: cfg.text, flexShrink: 0, display: 'flex' }}>{cfg.icon}</Box>
                <Typography sx={{
                  fontSize: typography.sizes.sm, color: cfg.text,
                  fontWeight: typography.weights.medium, flex: 1,
                }}>
                  {alert.message}
                </Typography>
                {alert.link && <ArrowRight size={14} color={cfg.text} />}
              </Box>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}

interface ActivityProps {
  items: RecentActivityExecDTO[]
}

const ENTITY_ICONS: Record<string, React.ReactElement> = {
  convention: <Box sx={{ color: colors.primary[500], fontSize: 10 }}>C</Box>,
  marche: <Box sx={{ color: colors.info[500], fontSize: 10 }}>M</Box>,
  projet: <Box sx={{ color: colors.purple[500], fontSize: 10 }}>P</Box>,
  decompte: <Box sx={{ color: colors.warning[500], fontSize: 10 }}>D</Box>,
}

export const DashboardRecentActivityExec = ({ items }: ActivityProps) => {
  const navigate = useNavigate()

  return (
    <Box sx={componentStyles.card}>
      <SectionHeader icon={<Clock size={16} />} title="Activite recente" />
      <Stack spacing={0}>
        {items.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textDisabled }}>
              Aucune activite
            </Typography>
          </Box>
        ) : items.map((item) => {
          const statusCfg = getStatusConfig(item.statut)
          return (
            <Box
              key={`${item.entityType}-${item.id}`}
              onClick={() => navigate(item.path)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2.5, py: 1.25, cursor: 'pointer',
                borderBottom: `1px solid ${colors.divider}`,
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { bgcolor: colors.neutral[25] },
              }}
            >
              <Box sx={{
                width: 28, height: 28, borderRadius: borders.radius.md,
                bgcolor: colors.neutral[50],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: typography.weights.bold, fontSize: 11, flexShrink: 0,
              }}>
                {ENTITY_ICONS[item.entityType] || item.entityType[0].toUpperCase()}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Typography sx={{
                    fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
                    color: colors.textPrimary,
                  }}>
                    {item.code}
                  </Typography>
                  <Box sx={{
                    px: 0.75, py: 0.1, borderRadius: borders.radius.sm,
                    bgcolor: statusCfg.bgColor, display: 'inline-flex',
                  }}>
                    <Typography sx={{
                      fontSize: 9, fontWeight: typography.weights.semibold, color: statusCfg.textColor,
                    }}>
                      {statusCfg.label}
                    </Typography>
                  </Box>
                </Stack>
                <Typography sx={{
                  fontSize: typography.sizes.xs, color: colors.textSecondary,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.label}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: typography.sizes['2xs'], color: colors.textDisabled, flexShrink: 0 }}>
                {formatDate(item.date || undefined)}
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}
