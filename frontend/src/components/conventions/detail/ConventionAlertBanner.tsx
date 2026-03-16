import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { Box, Typography, IconButton, Collapse } from '@mui/material'
import {
  Warning, Error, Info, CheckCircle,
  TrendingDown, CalendarMonth, AccountBalance,
  ExpandMore, ExpandLess, Close,
} from '@mui/icons-material'
import { colors, typography, borders, transitions } from '@/lib/designSystem'
import { conventionsAPI } from '@/lib/api'
import type { ConventionDetailEnrichedDTO } from '@/types/api'

// ──── Types ────

interface AlertItem {
  id: string
  severity: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  icon: ReactNode
}

interface ConventionAlertBannerProps {
  convention: {
    id: number; budget: number; tauxCommission: number
    statut: string; dateDebut: string; dateFin?: string
    typeConvention: 'CADRE' | 'SPECIFIQUE'
    objet?: string; libelle: string
  }
  enrichedData: ConventionDetailEnrichedDTO | null
  refreshKey?: number
}

// ──── Severity config ────

const severityConfig: Record<string, { bg: string; border: string; iconColor: string; text: string }> = {
  error: { bg: colors.danger[25], border: colors.danger[200], iconColor: colors.danger[600], text: colors.danger[800] },
  warning: { bg: colors.warning[25], border: colors.warning[200], iconColor: colors.warning[600], text: colors.warning[800] },
  info: { bg: colors.info[25], border: colors.info[200], iconColor: colors.info[600], text: colors.info[800] },
  success: { bg: colors.success[25], border: colors.success[200], iconColor: colors.success[600], text: colors.success[800] },
}

// ──── Main Component ────

const ConventionAlertBanner = ({ convention, enrichedData, refreshKey }: ConventionAlertBannerProps) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState(true)
  const [budgetLignesTotal, setBudgetLignesTotal] = useState<number | null>(null)

  const loadBudgetData = useCallback(async () => {
    try {
      const res = await conventionsAPI.getBudgetLignes(convention.id)
      const lignes = res.data.data || res.data || []
      const total = (lignes as Array<{ montant: number }>).reduce((s, l) => s + l.montant, 0)
      setBudgetLignesTotal(total)
    } catch { setBudgetLignesTotal(null) }
  }, [convention.id])

  useEffect(() => { loadBudgetData() }, [loadBudgetData, refreshKey])

  useEffect(() => {
    const newAlerts: AlertItem[] = []

    // 1. Budget overrun check
    if (budgetLignesTotal !== null && budgetLignesTotal > convention.budget * 1.001) {
      const ecart = budgetLignesTotal - convention.budget
      newAlerts.push({
        id: 'budget-overrun',
        severity: 'error',
        title: 'Depassement budgetaire',
        message: `Les lignes de depenses (${fmt(budgetLignesTotal)}) depassent le budget (${fmt(convention.budget)}) de ${fmt(ecart)}.`,
        icon: <TrendingDown sx={{ fontSize: 18 }} />,
      })
    }

    // 2. Deadline approaching / expired
    if (convention.dateFin) {
      const now = new Date()
      const fin = new Date(convention.dateFin)
      const daysLeft = Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysLeft < 0 && convention.statut !== 'ACHEVE' && convention.statut !== 'ANNULE') {
        newAlerts.push({
          id: 'deadline-expired',
          severity: 'error',
          title: 'Echeance depassee',
          message: `La date de fin etait le ${fmtDate(convention.dateFin)} (il y a ${Math.abs(daysLeft)} jours). Veuillez mettre a jour le statut.`,
          icon: <CalendarMonth sx={{ fontSize: 18 }} />,
        })
      } else if (daysLeft >= 0 && daysLeft <= 30 && convention.statut !== 'ACHEVE') {
        newAlerts.push({
          id: 'deadline-soon',
          severity: 'warning',
          title: 'Echeance proche',
          message: `La convention arrive a echeance dans ${daysLeft} jour(s) (${fmtDate(convention.dateFin)}).`,
          icon: <CalendarMonth sx={{ fontSize: 18 }} />,
        })
      }
    }

    // 3. No projects linked
    if (enrichedData && enrichedData.nombreProjets === 0 && convention.statut !== 'BROUILLON') {
      newAlerts.push({
        id: 'no-projets',
        severity: 'info',
        title: 'Aucun projet associe',
        message: 'Aucun projet n\'est lie a cette convention. Ajoutez des projets pour suivre la realisation.',
        icon: <Info sx={{ fontSize: 18 }} />,
      })
    }

    // 4. No partners allocated
    if (enrichedData && enrichedData.nombrePartenaires === 0 && convention.statut !== 'BROUILLON') {
      newAlerts.push({
        id: 'no-partenaires',
        severity: 'warning',
        title: 'Aucun partenaire',
        message: 'Aucun partenaire n\'a ete ajoute. Les ressources financieres ne sont pas tracees.',
        icon: <AccountBalance sx={{ fontSize: 18 }} />,
      })
    }

    // 5. Missing objet/description
    if (!convention.objet || convention.objet.trim() === '') {
      newAlerts.push({
        id: 'missing-objet',
        severity: 'info',
        title: 'Description manquante',
        message: 'L\'objet de la convention n\'est pas renseigne. Ajoutez une description pour plus de clarte.',
        icon: <Info sx={{ fontSize: 18 }} />,
      })
    }

    // 6. Low realization rate warning
    if (enrichedData && enrichedData.tauxRealisation !== undefined) {
      if (convention.dateFin) {
        const now = new Date()
        const debut = new Date(convention.dateDebut)
        const fin = new Date(convention.dateFin)
        const totalDuration = fin.getTime() - debut.getTime()
        const elapsed = now.getTime() - debut.getTime()
        const timeProgress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0
        if (timeProgress > 50 && enrichedData.tauxRealisation < 20 && convention.statut === 'EN_EXECUTION') {
          newAlerts.push({
            id: 'low-realisation',
            severity: 'warning',
            title: 'Taux de realisation faible',
            message: `${timeProgress.toFixed(0)}% du temps ecoule mais seulement ${enrichedData.tauxRealisation.toFixed(0)}% realise.`,
            icon: <Warning sx={{ fontSize: 18 }} />,
          })
        }
      }
    }

    // 7. Convention fully executed - success
    if (convention.statut === 'ACHEVE') {
      newAlerts.push({
        id: 'completed',
        severity: 'success',
        title: 'Convention achevee',
        message: 'Cette convention a ete cloturee avec succes.',
        icon: <CheckCircle sx={{ fontSize: 18 }} />,
      })
    }

    setAlerts(newAlerts)
  }, [convention, enrichedData, budgetLignesTotal])

  const visibleAlerts = alerts.filter((a: AlertItem) => !dismissed.has(a.id))
  if (visibleAlerts.length === 0) return null

  return (
    <Box sx={{ mb: 1.5 }}>
      {/* Header toggle */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer',
          px: 1, py: 0.5, borderRadius: borders.radius.sm,
          '&:hover': { bgcolor: colors.neutral[50] },
          transition: `background-color ${transitions.fast}`,
        }}
      >
        {visibleAlerts.some((a: AlertItem) => a.severity === 'error')
          ? <Error sx={{ fontSize: 16, color: colors.danger[500] }} />
          : visibleAlerts.some((a: AlertItem) => a.severity === 'warning')
            ? <Warning sx={{ fontSize: 16, color: colors.warning[500] }} />
            : <Info sx={{ fontSize: 16, color: colors.info[500] }} />}
        <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, flex: 1 }}>
          {visibleAlerts.length} alerte{visibleAlerts.length > 1 ? 's' : ''}
        </Typography>
        {expanded ? <ExpandLess sx={{ fontSize: 16, color: colors.textSecondary }} /> : <ExpandMore sx={{ fontSize: 16, color: colors.textSecondary }} />}
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5 }}>
          {visibleAlerts.map((alert: AlertItem) => {
            const cfg = severityConfig[alert.severity]
            return (
              <Box
                key={alert.id}
                sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 1,
                  px: 1.5, py: 1, borderRadius: borders.radius.md,
                  bgcolor: cfg.bg, border: `1px solid ${cfg.border}`,
                }}
              >
                <Box sx={{ color: cfg.iconColor, mt: 0.25 }}>{alert.icon}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: cfg.text }}>
                    {alert.title}
                  </Typography>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: cfg.text, opacity: 0.85, mt: 0.15 }}>
                    {alert.message}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setDismissed((prev: Set<string>) => new Set(prev).add(alert.id))}
                  sx={{ p: 0.25, color: cfg.iconColor, opacity: 0.5, '&:hover': { opacity: 1 } }}>
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            )
          })}
        </Box>
      </Collapse>
    </Box>
  )
}

// Helpers
const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')

export default ConventionAlertBanner
