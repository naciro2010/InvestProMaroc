import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, LinearProgress, CircularProgress, Tooltip,
} from '@mui/material'
import { ArrowDownward, ArrowUpward, AccountBalance } from '@mui/icons-material'
import { conventionsAPI, subventionsAPI, marchesAPI, versementsPrevisionnelsAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { ConventionBudgetLigneDTO, ApiResponse } from '@/types/api'
import type { Subvention, MarcheData, SituationPaiement } from './types'

// ──── Types ────

interface PartenaireData {
  id: number
  partenaireId: number
  budgetAlloue: number
}

interface VersementData {
  partenaireId?: number
  montant: number
}

interface MarcheRow extends MarcheData {
  engage: number
  depense: number
  reste: number
}

interface ConventionSyntheseCardProps {
  conventionId: number
  conventionBudget: number
  tauxCommission: number
  tauxTva: number
  commissionTTC?: number
  commissionMode?: string
  baseCalcul?: string
  refreshKey: number
}

// ──── Helpers ────

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)

const pct = (n: number) => `${n.toFixed(1)}%`

const tnum = { fontVariantNumeric: 'tabular-nums' as const }

// ──── Sub-components ────

const SynthRow = ({ label, amount, color, bold, hint, indent }: {
  label: string; amount: number; color?: string; bold?: boolean; hint?: string; indent?: boolean
}) => (
  <Tooltip title={hint || ''} placement="left" arrow>
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: 2, py: 0.75,
      pl: indent ? 4 : 2,
      '&:hover': { bgcolor: colors.neutral[50] },
      transition: 'background-color 0.15s',
    }}>
      <Typography sx={{
        fontSize: typography.sizes.sm,
        fontWeight: bold ? typography.weights.bold : typography.weights.medium,
        color: color || colors.textPrimary,
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: typography.sizes.sm,
        fontWeight: bold ? typography.weights.bold : typography.weights.semibold,
        color: color || colors.textPrimary,
        ...tnum,
        whiteSpace: 'nowrap',
      }}>
        {fmt(amount)}
      </Typography>
    </Box>
  </Tooltip>
)

const KPI = ({ label, value, color, hint }: { label: string; value: string; color: string; hint?: string }) => (
  <Tooltip title={hint || ''} placement="top" arrow>
    <Box sx={{ minWidth: 80 }}>
      <Typography sx={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color, ...tnum }}>
        {value}
      </Typography>
    </Box>
  </Tooltip>
)

// ──── Main Component ────

const ConventionSyntheseCard = ({
  conventionId, conventionBudget, tauxCommission, tauxTva,
  commissionTTC: commissionProp, commissionMode, baseCalcul, refreshKey,
}: ConventionSyntheseCardProps) => {
  const [loading, setLoading] = useState(true)
  const [totalPrevuPart, setTotalPrevuPart] = useState(0)
  const [totalRealisePart, setTotalRealisePart] = useState(0)
  const [totalSubv, setTotalSubv] = useState(0)
  const [totalBudgetLignes, setTotalBudgetLignes] = useState(0)
  const [totalEngage, setTotalEngage] = useState(0)
  const [totalDepense, setTotalDepense] = useState(0)
  const [totalPaiements, setTotalPaiements] = useState(0)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [partRes, versRes, subvRes, marchRes, blRes] = await Promise.all([
        conventionsAPI.getPartenaires(conventionId),
        versementsPrevisionnelsAPI.getByConvention(conventionId),
        subventionsAPI.getByConvention(conventionId),
        marchesAPI.getByConvention(conventionId),
        conventionsAPI.getBudgetLignes(conventionId).catch(() => ({ data: { data: [] } })),
      ])

      const parts: PartenaireData[] = partRes.data.data || partRes.data || []
      const vers: VersementData[] = versRes.data.data || versRes.data || []
      const subs: Subvention[] = subvRes.data.data || subvRes.data || []
      const marchesList: MarcheData[] = marchRes.data.data || marchRes.data || []
      const bLines: ConventionBudgetLigneDTO[] = (blRes.data as ApiResponse<ConventionBudgetLigneDTO[]>).data ?? []

      // Partenaires
      const prevuPart = parts.reduce((s, p) => s + p.budgetAlloue, 0)
      setTotalPrevuPart(prevuPart)

      // Versements by partenaire
      const versByPart = new Map<number, number>()
      vers.forEach(v => {
        if (v.partenaireId) versByPart.set(v.partenaireId, (versByPart.get(v.partenaireId) || 0) + v.montant)
      })
      setTotalRealisePart(Array.from(versByPart.values()).reduce((s, v) => s + v, 0))

      // Subventions
      setTotalSubv(subs.reduce((s, sub) => s + sub.montantTotal * (sub.tauxChange || 1), 0))

      // Budget lignes
      setTotalBudgetLignes(bLines.reduce((s, l) => s + l.montant, 0))

      // Marchés + situations paiement + paiements réalisés
      const sitMap = new Map<number, SituationPaiement>()
      let paiementsTotal = 0
      await Promise.all(marchesList.map(async m => {
        try {
          const [sitRes, paiRes] = await Promise.all([
            marchesAPI.getSituationPaiement(m.id).catch(() => null),
            marchesAPI.getPaiements(m.id).catch(() => ({ data: { data: [] } })),
          ])
          if (sitRes) sitMap.set(m.id, sitRes.data.data || sitRes.data)
          const paiements = (paiRes.data.data || paiRes.data || []) as Array<{ montantPaye?: number; montant?: number }>
          paiementsTotal += paiements.reduce((s, p) => s + ((p.montantPaye ?? p.montant ?? 0) as number), 0)
        } catch { /* */ }
      }))

      const rows: MarcheRow[] = marchesList.map(m => {
        const sit = sitMap.get(m.id)
        const engage = m.montantTtc || 0
        const depense = sit?.totalNetAPayer || 0
        return { ...m, engage, depense, reste: engage - depense }
      })

      setTotalEngage(rows.reduce((s, r) => s + r.engage, 0))
      setTotalDepense(rows.reduce((s, r) => s + r.depense, 0))
      setTotalPaiements(paiementsTotal)
    } catch { /* */ }
    finally { setLoading(false) }
  }, [conventionId])

  useEffect(() => { loadData() }, [loadData, refreshKey])

  // Computed values
  const commission = commissionProp ?? (conventionBudget * tauxCommission / 100) * (1 + tauxTva / 100)
  const totalRessources = totalPrevuPart + totalSubv
  const totalEmplois = totalEngage + commission
  const disponible = conventionBudget - totalEmplois
  const tauxCouverture = conventionBudget > 0 ? (totalRessources / conventionBudget) * 100 : 0
  const tauxEngagement = conventionBudget > 0 ? (totalEmplois / conventionBudget) * 100 : 0
  const tauxDecaissement = totalEngage > 0 ? (totalDepense / totalEngage) * 100 : 0

  if (loading) {
    return (
      <Paper sx={{ ...componentStyles.card, p: 3, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography sx={{ mt: 1, fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          Chargement de la synthese...
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, py: 1.25, bgcolor: colors.neutral[25], borderBottom: `1px solid ${colors.border}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance sx={{ fontSize: 18, color: colors.primary[600] }} />
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.primary[800], textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Synthese financiere
          </Typography>
        </Box>
        <Typography sx={{
          fontSize: typography.sizes.lg, fontWeight: typography.weights.bold,
          color: disponible >= 0 ? colors.success[700] : colors.danger[700], ...tnum,
        }}>
          {fmt(disponible)}
          <Typography component="span" sx={{ fontSize: typography.sizes.xs, ml: 0.5, color: colors.textSecondary, fontWeight: typography.weights.normal }}>
            disponible
          </Typography>
        </Typography>
      </Box>

      {/* Budget de référence */}
      <Box sx={{ bgcolor: colors.primary[25], borderBottom: `1px solid ${colors.borderSubtle}` }}>
        <SynthRow label="Budget convention" amount={conventionBudget} bold color={colors.primary[800]} />
        {totalBudgetLignes > 0 && (
          <SynthRow
            label="Lignes de depenses"
            amount={totalBudgetLignes}
            indent
            color={Math.abs(conventionBudget - totalBudgetLignes) < 1 ? colors.success[600] : colors.warning[600]}
            hint={Math.abs(conventionBudget - totalBudgetLignes) < 1 ? 'Aligne au budget' : `Ecart: ${fmt(conventionBudget - totalBudgetLignes)}`}
          />
        )}
      </Box>

      {/* RESSOURCES (Entrées) */}
      <Box sx={{ borderLeft: `4px solid ${colors.success[500]}`, borderBottom: `1px solid ${colors.borderSubtle}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, bgcolor: colors.success[25] }}>
          <ArrowDownward sx={{ fontSize: 14, color: colors.success[600] }} />
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.success[800], textTransform: 'uppercase', letterSpacing: '0.03em', flex: 1 }}>
            Ressources (Entrees)
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.success[800], ...tnum }}>
            {fmt(totalRessources)}
          </Typography>
        </Box>
        <SynthRow label="Partenaires" amount={totalPrevuPart} indent hint={`Realise: ${fmt(totalRealisePart)}`} />
        {totalSubv > 0 && (
          <SynthRow label="Subventions" amount={totalSubv} indent color={colors.success[600]} />
        )}
      </Box>

      {/* EMPLOIS (Sorties) */}
      <Box sx={{ borderLeft: `4px solid ${colors.danger[500]}`, borderBottom: `1px solid ${colors.borderSubtle}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, bgcolor: colors.danger[25] }}>
          <ArrowUpward sx={{ fontSize: 14, color: colors.danger[600] }} />
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.danger[800], textTransform: 'uppercase', letterSpacing: '0.03em', flex: 1 }}>
            Emplois (Sorties)
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.danger[800], ...tnum }}>
            {fmt(totalEmplois)}
          </Typography>
        </Box>
        <SynthRow label="Marches engages" amount={totalEngage} indent />
        {totalDepense > 0 && (
          <SynthRow label="Decomptes constates" amount={totalDepense} indent color={colors.info[600]} hint={`Reste a engager: ${fmt(totalEngage - totalDepense)}`} />
        )}
        {totalPaiements > 0 && (
          <SynthRow label="Paiements realises" amount={totalPaiements} indent color={colors.purple[600]} hint={`Reste a payer: ${fmt(totalDepense - totalPaiements)}`} />
        )}
        <SynthRow
          label={`Commission (${tauxCommission}% HT + TVA ${tauxTva}%)`}
          amount={commission}
          indent
          color={colors.warning[700]}
          hint={`Mode: ${commissionMode === 'PAR_CATEGORIE' ? 'par categorie' : 'global'} | Base: ${baseCalcul || 'Montant TTC'}`}
        />
      </Box>

      {/* KPIs */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: colors.neutral[25] }}>
        <Box sx={{ display: 'flex', gap: 2.5, mb: 1, flexWrap: 'wrap' }}>
          <KPI label="Budget" value={fmt(conventionBudget)} color={colors.textPrimary} />
          <KPI label="Couverture" value={pct(tauxCouverture)}
            color={tauxCouverture >= 100 ? colors.success[600] : colors.warning[600]}
            hint="Total ressources / Budget" />
          <KPI label="Engagement" value={pct(tauxEngagement)}
            color={tauxEngagement > 100 ? colors.danger[600] : colors.primary[600]}
            hint="Total emplois / Budget" />
          <KPI label="Decaissement" value={pct(tauxDecaissement)}
            color={colors.info[600]}
            hint="Total depense / Total engage" />
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(tauxEngagement, 100)}
          sx={{
            height: 6, borderRadius: 3, bgcolor: colors.neutral[200],
            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: tauxEngagement > 100 ? colors.danger[500] : colors.primary[500] },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>0%</Typography>
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>{pct(tauxEngagement)} engage</Typography>
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>100%</Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default ConventionSyntheseCard
