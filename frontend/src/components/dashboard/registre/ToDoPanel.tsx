import { Box, ButtonBase } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { DashboardAlertDTO } from '@/lib/api'
import { Panel } from '@/components/core'
import { colors, tones, ToneKey } from '@/lib/designSystem'

interface ToDoPanelProps {
  alerts: DashboardAlertDTO[]
}

const SEVERITY_TONE: Record<string, ToneKey> = { danger: 'e', warning: 'w', info: 'n', success: 'ok' }

const TYPE_TITLES: Record<string, string> = {
  RETARD_MARCHE: 'En retard',
  CONVENTION_EN_ATTENTE: 'À valider',
  BROUILLONS: 'Brouillons',
  DECOMPTE_A_VALIDER: 'Décomptes à valider',
  EN_EXECUTION: 'En exécution',
  OK: 'À jour',
}

const SEVERITY_TITLES: Record<string, string> = { danger: 'Urgent', warning: 'À traiter', info: 'À finaliser', success: 'Information' }

/** « À traiter » : alertes cliquables à bordure colorée. */
const ToDoPanel = ({ alerts }: ToDoPanelProps) => {
  const navigate = useNavigate()

  return (
    <Panel title="À traiter" flush>
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {alerts.length === 0 && (
          <Box sx={{ px: 1, py: 1, fontSize: 13, color: colors.textTertiary }}>Rien à traiter pour le moment.</Box>
        )}
        {alerts.map((a, i) => {
          const t = tones[SEVERITY_TONE[a.severity] ?? 'n']
          const title = TYPE_TITLES[a.type] ?? SEVERITY_TITLES[a.severity] ?? 'À traiter'
          return (
            <ButtonBase
              key={`${a.type}-${i}`}
              disabled={!a.link}
              onClick={() => a.link && navigate(a.link)}
              sx={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                px: 1.75,
                py: 1.25,
                borderLeft: `3px solid ${t.fg}`,
                borderRadius: '0 6px 6px 0',
                bgcolor: t.bg,
                color: t.fg,
                transition: 'filter .15s ease',
                '&:hover': { filter: 'brightness(.98)' },
                '&.Mui-disabled': { color: t.fg },
              }}
            >
              <Box sx={{ fontSize: 13, fontWeight: 700 }}>{title}{a.link ? ' ›' : ''}</Box>
              <Box sx={{ fontSize: 13, lineHeight: 1.4 }}>{a.message}</Box>
            </ButtonBase>
          )
        })}
      </Box>
    </Panel>
  )
}

export default ToDoPanel
