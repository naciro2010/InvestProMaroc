import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Skeleton, Tooltip } from '@mui/material'
import { Panel, HighlightBlock, DualProgress } from '@/components/core'
import { conventionsAPI, subventionsAPI, marchesAPI, versementsPrevisionnelsAPI } from '@/lib/api'
import { colors, typography } from '@/lib/designSystem'
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

/** Montant sans devise (l'en-tête précise « Montants en MAD »). */
const fmtN = (n: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

const fmt = (n: number) => `${fmtN(n)} MAD`

const pct = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`

const tnum = { fontVariantNumeric: 'tabular-nums' as const }

// ──── Sub-components ────

const SynthRow = ({ label, amount, color, bold, hint, indent }: {
  label: string; amount: number; color?: string; bold?: boolean; hint?: string; indent?: number
}) => (
  <Tooltip title={hint || ''} placement="left" arrow>
    <Box sx={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1.5,
      px: 2.5, py: 0.6, pl: 2.5 + (indent ?? 0) * 1.5,
    }}>
      <Typography sx={{
        fontSize: indent ? '12.5px' : '13.5px',
        fontWeight: bold ? typography.weights.bold : typography.weights.normal,
        color: color || (indent ? colors.textSecondary : colors.textPrimary),
        lineHeight: 1.35,
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: indent ? '12.5px' : '13.5px',
        fontWeight: bold ? typography.weights.bold : typography.weights.normal,
        color: color || (indent ? colors.textSecondary : colors.textPrimary),
        ...tnum,
        whiteSpace: 'nowrap',
      }}>
        {fmtN(amount)}
      </Typography>
    </Box>
  </Tooltip>
)

const KPI = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <Tooltip title={hint || ''} placement="top" arrow>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '12px', color: colors.textSecondary }}>{label}</Typography>
      <Typography sx={{ fontSize: '13.5px', fontWeight: typography.weights.bold, color: colors.textPrimary, ...tnum }}>{value}</Typography>
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

  const tauxPaye = conventionBudget > 0 ? (totalPaiements / conventionBudget) * 100 : 0

  if (loading) {
    return (
      <Panel title="Synthèse financière">
        <Skeleton variant="rounded" height={260} />
      </Panel>
    )
  }

  return (
    <Panel title="Synthèse financière" flush>
      <Box sx={{ py: 1 }}>
        <SynthRow label="Budget convention" amount={conventionBudget} bold />
        {totalBudgetLignes > 0 && (
          <SynthRow
            label="lignes de dépenses"
            amount={totalBudgetLignes}
            indent={1}
            color={Math.abs(conventionBudget - totalBudgetLignes) < 1 ? undefined : colors.warning[700]}
            hint={Math.abs(conventionBudget - totalBudgetLignes) < 1 ? 'Aligné sur le budget' : `Écart : ${fmt(conventionBudget - totalBudgetLignes)}`}
          />
        )}

        <Box sx={{ mt: 1 }}>
          <SynthRow label="Ressources" amount={totalRessources} bold color={colors.success[700]} hint="Entrées : partenaires et subventions" />
          <SynthRow label="partenaires" amount={totalPrevuPart} indent={1} hint={`Réalisé : ${fmt(totalRealisePart)}`} />
          {totalSubv > 0 && <SynthRow label="subventions" amount={totalSubv} indent={1} />}
        </Box>

        <Box sx={{ mt: 1 }}>
          <SynthRow label="Emplois" amount={totalEmplois} bold color={colors.danger[600]} hint="Sorties : marchés engagés et commission" />
          <SynthRow label="marchés engagés" amount={totalEngage} indent={1} />
          {totalDepense > 0 && (
            <SynthRow label="dont décomptés" amount={totalDepense} indent={2} hint={`Reste à décompter : ${fmt(totalEngage - totalDepense)}`} />
          )}
          {totalPaiements > 0 && (
            <SynthRow label="dont payés" amount={totalPaiements} indent={2} hint={`Reste à payer : ${fmt(totalDepense - totalPaiements)}`} />
          )}
          <SynthRow
            label={`Commission (${tauxCommission} % HT + TVA ${tauxTva} %)`}
            amount={commission}
            indent={1}
            hint={`Mode : ${commissionMode === 'PAR_CATEGORIE' ? 'par catégorie' : 'global'} · Base : ${baseCalcul || 'Montant TTC'}`}
          />
        </Box>
      </Box>

      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <HighlightBlock label="Disponible" value={fmtN(disponible)} />
      </Box>

      <Box sx={{ px: 2.5, pb: 2 }}>
        <DualProgress engaged={tauxEngagement} paid={tauxPaye} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, mt: 1.25 }}>
          <KPI label="Couverture" value={pct(tauxCouverture)} hint="Total ressources / budget" />
          <KPI label="Engagement" value={pct(tauxEngagement)} hint="Total emplois / budget" />
          <KPI label="Décaissement" value={pct(tauxDecaissement)} hint="Total décompté / total engagé" />
        </Box>
      </Box>
    </Panel>
  )
}

export default ConventionSyntheseCard
