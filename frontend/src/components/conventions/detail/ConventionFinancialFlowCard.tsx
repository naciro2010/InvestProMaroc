import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, Chip, CircularProgress, LinearProgress,
} from '@mui/material'
import { Edit, Delete, ChevronRight, AddCircleOutline, ArrowDownward, ArrowUpward } from '@mui/icons-material'
import { PieChart } from 'lucide-react'
import { conventionsAPI, subventionsAPI, marchesAPI, versementsPrevisionnelsAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import SubventionFormDialog from '../SubventionFormDialog'
import LinkMarcheDialog from '../LinkMarcheDialog'
import MarcheDetailDrawer from './MarcheDetailDrawer'
import PartenaireDetailDrawer from './PartenaireDetailDrawer'
import SubventionDetailDrawer from './SubventionDetailDrawer'
import ConventionBudgetLignesInline from './ConventionBudgetLignesInline'
import type { Subvention, MarcheData, SituationPaiement, VersementPrevisionnel } from './types'
import type { ConventionBudgetLigneDTO, ApiResponse } from '@/types/api'

interface PartenaireData {
  id: number; partenaireId: number; partenaireCode: string; partenaireNom: string
  partenaireSigle: string | null; budgetAlloue: number; pourcentage: number
  commissionIntervention: number | null; estMaitreOeuvre: boolean; estMaitreOeuvreDelegue: boolean
  remarques: string | null
}
interface MarcheRow extends MarcheData { engage: number; depense: number; reste: number }
interface ConventionFinancialFlowCardProps {
  conventionId: number; conventionBudget: number; tauxCommission: number; tauxTva: number
  commissionTTC?: number; commissionMode?: string; baseCalcul?: string
  canEdit: boolean; refreshKey: number
  onAddPartenaire: () => void; onEditPartenaire: (p: PartenaireData) => void; onAddVersement: () => void
  onRefresh?: () => void
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)
const pct = (n: number) => `${n.toFixed(1)}%`
const th = { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase' as const, letterSpacing: '0.03em', py: 0.75, px: 1.5 }
const td = { fontSize: typography.sizes.xs, py: 0.5, px: 1.5 }
const tnum = { fontVariantNumeric: 'tabular-nums' as const }
const clickRow = { cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] } }

const SectionHdr = ({ icon, label, total, color, bg }: { icon: React.ReactNode; label: string; total: string; color: string; bg: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, bgcolor: bg }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{icon}
      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color, textTransform: 'uppercase' }}>{label}</Typography>
    </Box>
    <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color, ...tnum }}>{total}</Typography>
  </Box>
)

const ProgressBar = ({ value, color }: { value: number; color?: string }) => (
  <LinearProgress variant="determinate" value={Math.min(value, 100)} sx={{ height: 4, borderRadius: 2, bgcolor: colors.neutral[100],
    '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: color || (value >= 100 ? colors.success[500] : colors.primary[400]) } }} />
)

const ConventionFinancialFlowCard = ({
  conventionId, conventionBudget, tauxCommission, tauxTva, commissionTTC: commissionProp,
  commissionMode, baseCalcul, canEdit, refreshKey, onAddPartenaire, onEditPartenaire, onAddVersement, onRefresh,
}: ConventionFinancialFlowCardProps) => {
  const [partenaires, setPartenaires] = useState<PartenaireData[]>([])
  const [versements, setVersements] = useState<VersementPrevisionnel[]>([])
  const [subventions, setSubventions] = useState<Subvention[]>([])
  const [marcheRows, setMarcheRows] = useState<MarcheRow[]>([])
  const [budgetLignes, setBudgetLignes] = useState<ConventionBudgetLigneDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [subvDialogOpen, setSubvDialogOpen] = useState(false)
  const [editingSubv, setEditingSubv] = useState<Subvention | null>(null)
  const [linkMarcheOpen, setLinkMarcheOpen] = useState(false)
  const [selPartenaire, setSelPartenaire] = useState<PartenaireData | null>(null)
  const [selMarcheId, setSelMarcheId] = useState<number | null>(null)
  const [selSubvention, setSelSubvention] = useState<Subvention | null>(null)

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
      const vers: VersementPrevisionnel[] = versRes.data.data || versRes.data || []
      const subs: Subvention[] = subvRes.data.data || subvRes.data || []
      const marchesList: MarcheData[] = marchRes.data.data || marchRes.data || []
      const bLines: ConventionBudgetLigneDTO[] = (blRes.data as ApiResponse<ConventionBudgetLigneDTO[]>).data ?? []
      setPartenaires(parts); setVersements(vers); setSubventions(subs); setBudgetLignes(bLines)
      const sitMap = new Map<number, SituationPaiement>()
      await Promise.all(marchesList.map(async m => {
        try { const r = await marchesAPI.getSituationPaiement(m.id); sitMap.set(m.id, r.data.data || r.data) } catch { /* */ }
      }))
      setMarcheRows(marchesList.map(m => {
        const sit = sitMap.get(m.id)
        const engage = m.montantTtc || 0, depense = sit?.totalNetAPayer || 0
        return { ...m, engage, depense, reste: engage - depense }
      }))
    } catch { /* */ } finally { setLoading(false) }
  }, [conventionId])

  useEffect(() => { loadData() }, [loadData, refreshKey])

  const deletePart = async (id: number) => {
    if (!window.confirm('Supprimer ce partenaire ?')) return
    try { await conventionsAPI.deletePartenaire(conventionId, id); loadData(); onRefresh?.() } catch { /* */ }
  }
  const deleteSubv = async (id: number) => {
    if (!window.confirm('Supprimer cette subvention ?')) return
    try { await subventionsAPI.delete(id); loadData(); onRefresh?.() } catch { /* */ }
  }

  // Aggregations
  const versByPart = new Map<number, number>()
  versements.forEach(v => { if (v.partenaireId) versByPart.set(v.partenaireId, (versByPart.get(v.partenaireId) || 0) + v.montant) })
  const totalPrevuPart = partenaires.reduce((s, p) => s + p.budgetAlloue, 0)
  const totalRealisePart = Array.from(versByPart.values()).reduce((s, v) => s + v, 0)
  const totalSubv = subventions.reduce((s, sub) => s + sub.montantTotal * (sub.tauxChange || 1), 0)
  const totalPrevuIn = totalPrevuPart + totalSubv
  const totalRealiseIn = totalRealisePart
  const totalEngage = marcheRows.reduce((s, r) => s + r.engage, 0)
  const totalDepense = marcheRows.reduce((s, r) => s + r.depense, 0)
  const commission = commissionProp ?? (conventionBudget * tauxCommission / 100) * (1 + tauxTva / 100)
  const totalBudgetLignes = budgetLignes.reduce((s, l) => s + l.montant, 0)
  const disponible = conventionBudget - totalEngage - commission
  const tauxCouverture = conventionBudget > 0 ? (totalPrevuIn / conventionBudget) * 100 : 0
  const tauxEngagement = conventionBudget > 0 ? ((totalEngage + commission) / conventionBudget) * 100 : 0
  const tauxDecaissement = totalEngage > 0 ? (totalDepense / totalEngage) * 100 : 0
  const resCols = canEdit ? 8 : 7
  const selMarche = marcheRows.find(m => m.id === selMarcheId)

  if (loading) return (
    <Paper sx={{ ...componentStyles.card, p: 3, textAlign: 'center' }}>
      <CircularProgress size={24} />
      <Typography sx={{ mt: 1, fontSize: typography.sizes.sm, color: colors.textSecondary }}>Chargement des donnees financieres...</Typography>
    </Paper>
  )

  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>

      {/* ═══ SECTION 1: RÉPARTITION BUDGÉTAIRE PAR CATÉGORIE (Inline Edit) ═══ */}
      <Box>
        <SectionHdr icon={<PieChart size={16} color={colors.primary[600]} />} label="Repartition budgetaire par categorie" total={fmt(totalBudgetLignes)} color={colors.primary[800]} bg={colors.primary[25]} />
        <ConventionBudgetLignesInline
          conventionId={conventionId}
          canEdit={canEdit}
          onDataChanged={() => { loadData(); onRefresh?.() }}
        />
      </Box>

      {/* ═══ SECTION 2: RESSOURCES (Entrées) ═══ */}
      <Box sx={{ borderLeft: `4px solid ${colors.success[500]}`, borderTop: `1px solid ${colors.border}` }}>
        <SectionHdr icon={<ArrowDownward sx={{ fontSize: 16, color: colors.success[600] }} />} label="Ressources (Entrees)" total={fmt(totalPrevuIn)} color={colors.success[800]} bg={colors.success[25]} />
        <TableContainer><Table size="small">
          <TableHead><TableRow sx={{ bgcolor: colors.neutral[50] }}>
            <TableCell sx={th}>Source</TableCell>
            <TableCell sx={{ ...th, width: 80 }}>Type</TableCell>
            <TableCell align="right" sx={th}>Prevu</TableCell>
            <TableCell align="right" sx={th}>Realise</TableCell>
            <TableCell align="right" sx={th}>Reste</TableCell>
            <TableCell sx={{ ...th, width: 55 }}>Taux</TableCell>
            {canEdit && <TableCell align="center" sx={{ ...th, width: 70 }}>Actions</TableCell>}
          </TableRow></TableHead>
          <TableBody>
            {partenaires.map(p => {
              const realise = versByPart.get(p.partenaireId) || 0
              const reste = p.budgetAlloue - realise
              const taux = p.budgetAlloue > 0 ? (realise / p.budgetAlloue) * 100 : 0
              const role = p.estMaitreOeuvre ? 'MO' : p.estMaitreOeuvreDelegue ? 'MOD' : 'Part.'
              return (
                <Tooltip key={`p-${p.id}`} title="Cliquer pour voir les versements et le detail" placement="left" arrow enterDelay={500}>
                  <TableRow onClick={() => setSelPartenaire(p)} sx={clickRow}>
                    <TableCell sx={td}>
                      <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>{p.partenaireSigle || p.partenaireNom}</Typography>
                      <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>{p.partenaireCode} - {pct(p.pourcentage)} du budget</Typography>
                    </TableCell>
                    <TableCell sx={td}><Chip label={role} size="small" sx={{ height: 20, fontSize: '10px', bgcolor: colors.info[50], color: colors.info[700] }} /></TableCell>
                    <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, ...tnum }}>{fmt(p.budgetAlloue)}</Typography></TableCell>
                    <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, color: realise > 0 ? colors.success[600] : colors.textSecondary, fontWeight: realise > 0 ? typography.weights.medium : undefined, ...tnum }}>{realise > 0 ? fmt(realise) : '—'}</Typography></TableCell>
                    <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, color: reste > 0 ? colors.warning[600] : colors.success[600], ...tnum }}>{fmt(reste)}</Typography></TableCell>
                    <TableCell sx={td}><ProgressBar value={taux} /></TableCell>
                    {canEdit && <TableCell align="center" sx={td}>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); onEditPartenaire(p) }}><Edit sx={{ fontSize: 14, color: colors.neutral[500] }} /></IconButton>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); deletePart(p.id) }}><Delete sx={{ fontSize: 14, color: colors.danger[400] }} /></IconButton>
                    </TableCell>}
                  </TableRow>
                </Tooltip>
              )
            })}
            {subventions.length > 0 && <TableRow><TableCell colSpan={resCols} sx={{ py: 0.25, bgcolor: colors.neutral[25] }}>
              <Typography sx={{ fontSize: '10px', fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase' }}>Subventions & financements externes</Typography>
            </TableCell></TableRow>}
            {subventions.map(s => {
              const mad = s.montantTotal * (s.tauxChange || 1)
              const deviseInfo = s.devise !== 'MAD' ? ` (${s.devise})` : ''
              return (
                <Tooltip key={`s-${s.id}`} title="Cliquer pour voir le detail de la subvention" placement="left" arrow enterDelay={500}>
                  <TableRow onClick={() => setSelSubvention(s)} sx={clickRow}>
                    <TableCell sx={td}>
                      <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>{s.organismeBailleur}</Typography>
                      {deviseInfo && <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>Devise: {s.devise} (taux: {s.tauxChange || 1})</Typography>}
                      {s.conditions && <Typography sx={{ fontSize: '10px', color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{s.conditions}</Typography>}
                    </TableCell>
                    <TableCell sx={td}><Chip label={s.typeSubvention || 'Subv.'} size="small" sx={{ height: 20, fontSize: '10px', bgcolor: colors.success[50], color: colors.success[700] }} /></TableCell>
                    <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, ...tnum }}>{fmt(mad)}</Typography></TableCell>
                    <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>—</Typography></TableCell>
                    <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, color: colors.warning[600], ...tnum }}>{fmt(mad)}</Typography></TableCell>
                    <TableCell sx={td}><ProgressBar value={0} /></TableCell>
                    {canEdit && <TableCell align="center" sx={td}>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); setEditingSubv(s); setSubvDialogOpen(true) }}><Edit sx={{ fontSize: 14, color: colors.neutral[500] }} /></IconButton>
                      <IconButton size="small" onClick={e => { e.stopPropagation(); deleteSubv(s.id) }}><Delete sx={{ fontSize: 14, color: colors.danger[400] }} /></IconButton>
                    </TableCell>}
                  </TableRow>
                </Tooltip>
              )
            })}
            <TableRow sx={{ bgcolor: colors.success[25] }}>
              <TableCell colSpan={2} sx={{ ...td, fontWeight: typography.weights.bold }}>Total Ressources</TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, ...tnum }}>{fmt(totalPrevuIn)}</TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, color: colors.success[700], ...tnum }}>{fmt(totalRealiseIn)}</TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, color: colors.warning[700], ...tnum }}>{fmt(totalPrevuIn - totalRealiseIn)}</TableCell>
              <TableCell sx={td}><Typography sx={{ fontSize: '10px', fontWeight: typography.weights.bold, color: colors.textSecondary }}>{pct(tauxCouverture)}</Typography></TableCell>
              {canEdit && <TableCell sx={td} />}
            </TableRow>
            {canEdit && <>
              <TableRow onClick={onAddPartenaire} sx={{ ...clickRow, '& td': { borderBottom: 0 } }}>
                <TableCell colSpan={resCols} sx={td}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddCircleOutline sx={{ fontSize: 14, color: colors.primary[500] }} /><Typography sx={{ fontSize: typography.sizes.xs, color: colors.primary[600] }}>Ajouter un partenaire</Typography>
                </Box></TableCell>
              </TableRow>
              <TableRow onClick={onAddVersement} sx={{ ...clickRow, '& td': { borderBottom: 0 } }}>
                <TableCell colSpan={resCols} sx={td}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddCircleOutline sx={{ fontSize: 14, color: colors.warning[500] }} /><Typography sx={{ fontSize: typography.sizes.xs, color: colors.warning[600] }}>Ajouter un versement</Typography>
                </Box></TableCell>
              </TableRow>
              <TableRow onClick={() => { setEditingSubv(null); setSubvDialogOpen(true) }} sx={{ ...clickRow, '& td': { borderBottom: 0 } }}>
                <TableCell colSpan={resCols} sx={td}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddCircleOutline sx={{ fontSize: 14, color: colors.success[500] }} /><Typography sx={{ fontSize: typography.sizes.xs, color: colors.success[600] }}>Ajouter une subvention</Typography>
                </Box></TableCell>
              </TableRow>
            </>}
          </TableBody>
        </Table></TableContainer>
      </Box>

      {/* ═══ SECTION 3: EMPLOIS (Sorties) ═══ */}
      <Box sx={{ borderLeft: `4px solid ${colors.danger[500]}`, borderTop: `1px solid ${colors.border}` }}>
        <SectionHdr icon={<ArrowUpward sx={{ fontSize: 16, color: colors.danger[600] }} />} label="Emplois (Sorties)" total={fmt(totalEngage + commission)} color={colors.danger[800]} bg={colors.danger[25]} />
        <TableContainer><Table size="small">
          <TableHead><TableRow sx={{ bgcolor: colors.neutral[50] }}>
            <TableCell sx={th}>Rubrique</TableCell>
            <TableCell align="right" sx={th}>Engage</TableCell>
            <TableCell align="right" sx={th}>Depense</TableCell>
            <TableCell align="right" sx={th}>Reste a payer</TableCell>
            <TableCell sx={{ ...th, width: 55 }}>Taux</TableCell>
            <TableCell sx={{ ...th, width: 24 }} />
          </TableRow></TableHead>
          <TableBody>
            {marcheRows.map(m => {
              const taux = m.engage > 0 ? (m.depense / m.engage) * 100 : 0
              return (
                <Tooltip key={m.id} title="Cliquer pour voir decomptes, paiements et chaine de calcul" placement="left" arrow enterDelay={500}>
                  <TableRow onClick={() => setSelMarcheId(m.id)} sx={clickRow}>
                    <TableCell sx={td}>
                      <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.primary[700] }}>{m.objet || m.numeroMarche}</Typography>
                      <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>{m.fournisseurNom ? `${m.fournisseurNom} - ` : ''}{m.numeroMarche}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, ...tnum }}>{fmt(m.engage)}</Typography></TableCell>
                    <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, color: m.depense > 0 ? colors.success[600] : colors.textSecondary, fontWeight: m.depense > 0 ? typography.weights.medium : undefined, ...tnum }}>{m.depense > 0 ? fmt(m.depense) : '—'}</Typography></TableCell>
                    <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, color: m.reste > 0 ? colors.warning[600] : colors.success[600], ...tnum }}>{fmt(m.reste)}</Typography></TableCell>
                    <TableCell sx={td}><ProgressBar value={taux} /></TableCell>
                    <TableCell sx={{ ...td, px: 0.5 }}><ChevronRight sx={{ fontSize: 16, color: colors.neutral[400] }} /></TableCell>
                  </TableRow>
                </Tooltip>
              )
            })}
            {marcheRows.length === 0 && <TableRow><TableCell colSpan={6} sx={{ ...td, textAlign: 'center', py: 2 }}>
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Aucun marche lie a cette convention</Typography>
            </TableCell></TableRow>}
            <TableRow sx={{ bgcolor: colors.warning[25] }}>
              <TableCell sx={{ ...td, fontWeight: typography.weights.semibold, color: colors.warning[800] }}>
                <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold }}>Commission ({tauxCommission}% HT + TVA {tauxTva}%)</Typography>
                <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>
                  Mode: {commissionMode === 'PAR_CATEGORIE' ? 'par categorie de depense' : 'global'} | Base: {baseCalcul || 'Montant TTC'}
                </Typography>
              </TableCell>
              <TableCell sx={td} />
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, color: colors.warning[700], ...tnum }}>{fmt(commission)}</TableCell>
              <TableCell colSpan={3} sx={td} />
            </TableRow>
            <TableRow sx={{ bgcolor: colors.danger[25] }}>
              <TableCell sx={{ ...td, fontWeight: typography.weights.bold }}>Total Emplois</TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, ...tnum }}>{fmt(totalEngage)}</TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, color: colors.success[700], ...tnum }}>{fmt(totalDepense + commission)}</TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, color: colors.warning[700], ...tnum }}>{fmt(totalEngage - totalDepense)}</TableCell>
              <TableCell colSpan={2} sx={td} />
            </TableRow>
            {canEdit && <TableRow onClick={() => setLinkMarcheOpen(true)} sx={{ ...clickRow, '& td': { borderBottom: 0 } }}>
              <TableCell colSpan={6} sx={td}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddCircleOutline sx={{ fontSize: 14, color: colors.primary[500] }} /><Typography sx={{ fontSize: typography.sizes.xs, color: colors.primary[600] }}>Lier un marche</Typography>
              </Box></TableCell>
            </TableRow>}
          </TableBody>
        </Table></TableContainer>
      </Box>

      {/* ═══ SECTION 4: SYNTHÈSE FINANCIÈRE ═══ */}
      <Box sx={{ borderTop: `2px solid ${colors.border}`, bgcolor: colors.neutral[25], px: 2, py: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Synthese financiere</Typography>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: disponible >= 0 ? colors.success[700] : colors.danger[700], ...tnum }}>
            Disponible: {fmt(disponible)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2.5, mb: 1, flexWrap: 'wrap' }}>
          <KPI label="Budget" value={fmt(conventionBudget)} color={colors.textPrimary} />
          <KPI label="Couverture" value={pct(tauxCouverture)} color={tauxCouverture >= 100 ? colors.success[600] : colors.warning[600]} hint="Total ressources / Budget" />
          <KPI label="Engagement" value={pct(tauxEngagement)} color={tauxEngagement > 100 ? colors.danger[600] : colors.primary[600]} hint="Total emplois / Budget" />
          <KPI label="Decaissement" value={pct(tauxDecaissement)} color={colors.info[600]} hint="Total depense / Total engage" />
        </Box>
        <LinearProgress variant="determinate" value={Math.min(tauxEngagement, 100)}
          sx={{ height: 6, borderRadius: 3, bgcolor: colors.neutral[200],
            '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: tauxEngagement > 100 ? colors.danger[500] : colors.primary[500] } }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>0%</Typography>
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>{pct(tauxEngagement)} engage</Typography>
          <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>100%</Typography>
        </Box>
      </Box>

      {/* Dialogs & Drawers */}
      <SubventionFormDialog open={subvDialogOpen} conventionId={conventionId}
        onClose={() => { setSubvDialogOpen(false); setEditingSubv(null) }}
        onSuccess={() => { loadData(); setSubvDialogOpen(false); setEditingSubv(null); onRefresh?.() }}
        editingSubvention={editingSubv} />
      <LinkMarcheDialog open={linkMarcheOpen} conventionId={conventionId}
        onClose={() => setLinkMarcheOpen(false)}
        onSuccess={() => { loadData(); setLinkMarcheOpen(false); onRefresh?.() }} />
      <PartenaireDetailDrawer open={selPartenaire !== null} onClose={() => setSelPartenaire(null)}
        partenaire={selPartenaire} conventionId={conventionId} conventionBudget={conventionBudget}
        versements={versements.map(v => ({ id: v.id, partenaireId: v.partenaireId, dateVersement: v.dateVersement || '', montant: v.montant, montantPrevu: v.montantPrevu }))} />
      <MarcheDetailDrawer open={selMarcheId !== null} onClose={() => setSelMarcheId(null)}
        marcheId={selMarcheId} marcheLabel={selMarche?.objet ?? ''} marcheEngagement={selMarche?.engage ?? 0}
        marcheDepenses={selMarche?.depense ?? 0} marcheResteAPayer={selMarche?.reste ?? 0} />
      <SubventionDetailDrawer open={selSubvention !== null} onClose={() => setSelSubvention(null)}
        subvention={selSubvention} allSubventions={subventions} conventionBudget={conventionBudget} />
    </Paper>
  )
}

const KPI = ({ label, value, color, hint }: { label: string; value: string; color: string; hint?: string }) => (
  <Tooltip title={hint || ''} placement="top" arrow>
    <Box sx={{ minWidth: 80 }}>
      <Typography sx={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</Typography>
      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color, ...tnum }}>{value}</Typography>
    </Box>
  </Tooltip>
)

export default ConventionFinancialFlowCard
