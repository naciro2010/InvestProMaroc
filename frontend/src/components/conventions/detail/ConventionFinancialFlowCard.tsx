import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, Chip, CircularProgress, LinearProgress,
} from '@mui/material'
import { Edit, Delete, ChevronRight, AddCircleOutline, ArrowDownward, ArrowUpward } from '@mui/icons-material'
import { conventionsAPI, subventionsAPI, marchesAPI, versementsPrevisionnelsAPI } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import SubventionFormDialog from '../SubventionFormDialog'
import LinkMarcheDialog from '../LinkMarcheDialog'
import MarcheDetailDrawer from './MarcheDetailDrawer'
import PartenaireDetailDrawer from './PartenaireDetailDrawer'
import type { Subvention, MarcheData, SituationPaiement, VersementPrevisionnel } from './types'

interface PartenaireData {
  id: number; partenaireId: number; partenaireCode: string; partenaireNom: string
  partenaireSigle: string | null; budgetAlloue: number; pourcentage: number
  commissionIntervention: number | null; estMaitreOeuvre: boolean; estMaitreOeuvreDelegue: boolean
  remarques: string | null
}

interface MarcheRow extends MarcheData { engage: number; depense: number; reste: number }

interface ConventionFinancialFlowCardProps {
  conventionId: number
  conventionBudget: number
  tauxCommission: number
  tauxTva: number
  commissionTTC?: number
  canEdit: boolean
  refreshKey: number
  onAddPartenaire: () => void
  onEditPartenaire: (p: PartenaireData) => void
  onAddVersement: () => void
  onRefresh?: () => void
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)
const pct = (n: number) => `${n.toFixed(1)}%`
const th = { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.textSecondary, textTransform: 'uppercase' as const, letterSpacing: '0.03em', py: 0.75, px: 1.5 }
const td = { fontSize: typography.sizes.xs, py: 0.5, px: 1.5 }
const num = { fontVariantNumeric: 'tabular-nums' as const }
const clickRow = { cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] } }

const ConventionFinancialFlowCard = ({
  conventionId, conventionBudget, tauxCommission, tauxTva, commissionTTC: commissionProp,
  canEdit, refreshKey, onAddPartenaire, onEditPartenaire, onAddVersement, onRefresh,
}: ConventionFinancialFlowCardProps) => {
  const [partenaires, setPartenaires] = useState<PartenaireData[]>([])
  const [versements, setVersements] = useState<VersementPrevisionnel[]>([])
  const [subventions, setSubventions] = useState<Subvention[]>([])
  const [marcheRows, setMarcheRows] = useState<MarcheRow[]>([])
  const [loading, setLoading] = useState(true)
  const [subvDialogOpen, setSubvDialogOpen] = useState(false)
  const [editingSubv, setEditingSubv] = useState<Subvention | null>(null)
  const [linkMarcheOpen, setLinkMarcheOpen] = useState(false)
  const [selPartenaire, setSelPartenaire] = useState<PartenaireData | null>(null)
  const [selMarcheId, setSelMarcheId] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [partRes, versRes, subvRes, marchRes] = await Promise.all([
        conventionsAPI.getPartenaires(conventionId),
        versementsPrevisionnelsAPI.getByConvention(conventionId),
        subventionsAPI.getByConvention(conventionId),
        marchesAPI.getByConvention(conventionId),
      ])
      const parts: PartenaireData[] = partRes.data.data || partRes.data || []
      const vers: VersementPrevisionnel[] = versRes.data.data || versRes.data || []
      const subs: Subvention[] = subvRes.data.data || subvRes.data || []
      const marchesList: MarcheData[] = marchRes.data.data || marchRes.data || []

      setPartenaires(parts); setVersements(vers); setSubventions(subs)

      const sitMap = new Map<number, SituationPaiement>()
      await Promise.all(marchesList.map(async m => {
        try { const r = await marchesAPI.getSituationPaiement(m.id); sitMap.set(m.id, r.data.data || r.data) }
        catch { /* no situation */ }
      }))
      setMarcheRows(marchesList.map(m => {
        const sit = sitMap.get(m.id)
        const engage = m.montantTtc || 0, depense = sit?.totalNetAPayer || 0
        return { ...m, engage, depense, reste: engage - depense }
      }))
    } catch { /* silently handle */ } finally { setLoading(false) }
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

  // Aggregate versements per partenaire
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
  const solde = conventionBudget - totalEngage
  const tauxUsage = conventionBudget > 0 ? (totalEngage / conventionBudget) * 100 : 0
  const cols = canEdit ? 6 : 5

  if (loading) return (
    <Paper sx={{ ...componentStyles.card, p: 3, textAlign: 'center' }}>
      <CircularProgress size={24} />
      <Typography sx={{ mt: 1, fontSize: typography.sizes.sm, color: colors.textSecondary }}>Chargement...</Typography>
    </Paper>
  )

  const selMarche = marcheRows.find(m => m.id === selMarcheId)

  return (
    <Paper sx={{ ...componentStyles.card, p: 0, overflow: 'hidden' }}>
      {/* ═══ RESSOURCES (Entrées) ═══ */}
      <Box sx={{ borderLeft: `4px solid ${colors.success[500]}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, bgcolor: colors.success[25] }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArrowDownward sx={{ fontSize: 16, color: colors.success[600] }} />
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.success[800], textTransform: 'uppercase' }}>
              Ressources (Entrees)
            </Typography>
          </Box>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.success[700], ...num }}>{fmt(totalPrevuIn)}</Typography>
        </Box>
        <TableContainer><Table size="small">
          <TableHead><TableRow sx={{ bgcolor: colors.neutral[50] }}>
            <TableCell sx={th}>Source</TableCell>
            <TableCell sx={{ ...th, width: 90 }}>Type</TableCell>
            <TableCell align="right" sx={th}>Prevu</TableCell>
            <TableCell align="right" sx={th}>Realise</TableCell>
            <TableCell align="right" sx={th}>Reste</TableCell>
            {canEdit && <TableCell align="center" sx={{ ...th, width: 70 }}>Actions</TableCell>}
          </TableRow></TableHead>
          <TableBody>
            {partenaires.map(p => {
              const realise = versByPart.get(p.partenaireId) || 0
              const reste = p.budgetAlloue - realise
              const role = p.estMaitreOeuvre ? 'MO' : p.estMaitreOeuvreDelegue ? 'MOD' : 'Partenaire'
              return (
                <TableRow key={`p-${p.id}`} onClick={() => setSelPartenaire(p)} sx={clickRow}>
                  <TableCell sx={td}><Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>{p.partenaireSigle || p.partenaireNom}</Typography></TableCell>
                  <TableCell sx={td}><Chip label={role} size="small" sx={{ height: 20, fontSize: '10px', bgcolor: colors.info[50], color: colors.info[700] }} /></TableCell>
                  <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, ...num }}>{fmt(p.budgetAlloue)}</Typography></TableCell>
                  <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, color: realise > 0 ? colors.success[600] : colors.textSecondary, ...num }}>{realise > 0 ? fmt(realise) : '—'}</Typography></TableCell>
                  <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: reste > 0 ? colors.warning[600] : colors.success[600], ...num }}>{fmt(reste)}</Typography></TableCell>
                  {canEdit && <TableCell align="center" sx={td}>
                    <IconButton size="small" onClick={e => { e.stopPropagation(); onEditPartenaire(p) }}><Edit sx={{ fontSize: 14, color: colors.neutral[500] }} /></IconButton>
                    <IconButton size="small" onClick={e => { e.stopPropagation(); deletePart(p.id) }}><Delete sx={{ fontSize: 14, color: colors.danger[400] }} /></IconButton>
                  </TableCell>}
                </TableRow>
              )
            })}
            {subventions.length > 0 && <TableRow><TableCell colSpan={cols} sx={{ py: 0.25, bgcolor: colors.neutral[25] }}>
              <Chip label="Subventions" size="small" sx={{ height: 18, fontSize: '10px', bgcolor: colors.success[100], color: colors.success[700] }} />
            </TableCell></TableRow>}
            {subventions.map(s => {
              const mad = s.montantTotal * (s.tauxChange || 1)
              return (
                <TableRow key={`s-${s.id}`} sx={{ '&:hover': { bgcolor: colors.primary[25] } }}>
                  <TableCell sx={td}><Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>{s.organismeBailleur}</Typography></TableCell>
                  <TableCell sx={td}><Chip label={s.typeSubvention || 'Subv.'} size="small" sx={{ height: 20, fontSize: '10px', bgcolor: colors.success[50], color: colors.success[700] }} /></TableCell>
                  <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, ...num }}>{fmt(mad)}</Typography></TableCell>
                  <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>—</Typography></TableCell>
                  <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.warning[600], ...num }}>{fmt(mad)}</Typography></TableCell>
                  {canEdit && <TableCell align="center" sx={td}>
                    <IconButton size="small" onClick={() => { setEditingSubv(s); setSubvDialogOpen(true) }}><Edit sx={{ fontSize: 14, color: colors.neutral[500] }} /></IconButton>
                    <IconButton size="small" onClick={() => deleteSubv(s.id)}><Delete sx={{ fontSize: 14, color: colors.danger[400] }} /></IconButton>
                  </TableCell>}
                </TableRow>
              )
            })}
            <TableRow sx={{ bgcolor: colors.success[25] }}>
              <TableCell colSpan={2} sx={{ ...td, fontWeight: typography.weights.bold }}>Total Ressources</TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, ...num }}>{fmt(totalPrevuIn)}</TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, color: colors.success[700], ...num }}>{fmt(totalRealiseIn)}</TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, color: colors.warning[700], ...num }}>{fmt(totalPrevuIn - totalRealiseIn)}</TableCell>
              {canEdit && <TableCell sx={td} />}
            </TableRow>
            {canEdit && <>
              <TableRow onClick={onAddPartenaire} sx={{ ...clickRow, '& td': { borderBottom: 0 } }}>
                <TableCell colSpan={cols} sx={td}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddCircleOutline sx={{ fontSize: 14, color: colors.primary[500] }} />
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.primary[600] }}>Ajouter un partenaire</Typography>
                </Box></TableCell>
              </TableRow>
              <TableRow onClick={onAddVersement} sx={{ ...clickRow, '& td': { borderBottom: 0 } }}>
                <TableCell colSpan={cols} sx={td}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddCircleOutline sx={{ fontSize: 14, color: colors.warning[500] }} />
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.warning[600] }}>Ajouter un versement</Typography>
                </Box></TableCell>
              </TableRow>
              <TableRow onClick={() => { setEditingSubv(null); setSubvDialogOpen(true) }} sx={{ ...clickRow, '& td': { borderBottom: 0 } }}>
                <TableCell colSpan={cols} sx={td}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddCircleOutline sx={{ fontSize: 14, color: colors.success[500] }} />
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.success[600] }}>Ajouter une subvention</Typography>
                </Box></TableCell>
              </TableRow>
            </>}
          </TableBody>
        </Table></TableContainer>
      </Box>

      {/* ═══ EMPLOIS (Sorties) ═══ */}
      <Box sx={{ borderLeft: `4px solid ${colors.danger[500]}`, borderTop: `1px solid ${colors.border}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, bgcolor: colors.danger[25] }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArrowUpward sx={{ fontSize: 16, color: colors.danger[600] }} />
            <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.danger[800], textTransform: 'uppercase' }}>
              Emplois (Sorties)
            </Typography>
          </Box>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.danger[700], ...num }}>{fmt(totalEngage + commission)}</Typography>
        </Box>
        <TableContainer><Table size="small">
          <TableHead><TableRow sx={{ bgcolor: colors.neutral[50] }}>
            <TableCell sx={th}>Rubrique</TableCell>
            <TableCell align="right" sx={th}>Engage</TableCell>
            <TableCell align="right" sx={th}>Depense</TableCell>
            <TableCell align="right" sx={th}>Reste a payer</TableCell>
            <TableCell sx={{ ...th, width: 32 }} />
          </TableRow></TableHead>
          <TableBody>
            {marcheRows.map(m => (
              <Tooltip key={m.id} title="Voir le detail du marche" placement="left" arrow enterDelay={500}>
                <TableRow onClick={() => setSelMarcheId(m.id)} sx={clickRow}>
                  <TableCell sx={td}>
                    <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.primary[700] }}>{m.objet || m.numeroMarche}</Typography>
                    {m.fournisseurNom && <Typography sx={{ fontSize: '10px', color: colors.textSecondary }}>{m.fournisseurNom}</Typography>}
                  </TableCell>
                  <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, ...num }}>{fmt(m.engage)}</Typography></TableCell>
                  <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, color: m.depense > 0 ? colors.success[600] : colors.textSecondary, ...num }}>{m.depense > 0 ? fmt(m.depense) : '—'}</Typography></TableCell>
                  <TableCell align="right" sx={td}><Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: m.reste > 0 ? colors.warning[600] : colors.success[600], ...num }}>{fmt(m.reste)}</Typography></TableCell>
                  <TableCell sx={{ ...td, px: 0.5 }}><ChevronRight sx={{ fontSize: 16, color: colors.neutral[400] }} /></TableCell>
                </TableRow>
              </Tooltip>
            ))}
            {marcheRows.length === 0 && <TableRow><TableCell colSpan={5} sx={{ ...td, textAlign: 'center', py: 2 }}>
              <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>Aucun marche lie</Typography>
            </TableCell></TableRow>}
            <TableRow sx={{ bgcolor: colors.warning[25] }}>
              <TableCell sx={{ ...td, fontWeight: typography.weights.semibold, color: colors.warning[800] }}>Commission ({tauxCommission}% + TVA {tauxTva}%)</TableCell>
              <TableCell sx={td} /><TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, color: colors.warning[700], ...num }}>{fmt(commission)}</TableCell>
              <TableCell sx={td} /><TableCell sx={td} />
            </TableRow>
            <TableRow sx={{ bgcolor: colors.danger[25] }}>
              <TableCell sx={{ ...td, fontWeight: typography.weights.bold }}>Total Emplois</TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, ...num }}>{fmt(totalEngage)}</TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, color: colors.success[700], ...num }}>{fmt(totalDepense)}</TableCell>
              <TableCell align="right" sx={{ ...td, fontWeight: typography.weights.bold, color: colors.warning[700], ...num }}>{fmt(totalEngage - totalDepense)}</TableCell>
              <TableCell sx={td} />
            </TableRow>
            {canEdit && <TableRow onClick={() => setLinkMarcheOpen(true)} sx={{ ...clickRow, '& td': { borderBottom: 0 } }}>
              <TableCell colSpan={5} sx={td}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddCircleOutline sx={{ fontSize: 14, color: colors.primary[500] }} />
                <Typography sx={{ fontSize: typography.sizes.xs, color: colors.primary[600] }}>Lier un marche</Typography>
              </Box></TableCell>
            </TableRow>}
          </TableBody>
        </Table></TableContainer>
      </Box>

      {/* ═══ SOLDE ═══ */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderTop: `2px solid ${colors.border}`, bgcolor: colors.neutral[25] }}>
        <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
          Budget {fmt(conventionBudget)} — Engage {fmt(totalEngage)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: solde >= 0 ? colors.success[700] : colors.danger[700] }}>
            Disponible: {fmt(solde)}
          </Typography>
          <LinearProgress variant="determinate" value={Math.min(tauxUsage, 100)}
            sx={{ width: 60, height: 5, borderRadius: 3, bgcolor: colors.neutral[200],
              '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: tauxUsage > 100 ? colors.danger[500] : colors.primary[500] } }} />
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{pct(tauxUsage)}</Typography>
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
        versements={versements.map(v => ({ id: v.id, partenaireId: v.partenaireId, dateVersement: '', montant: v.montant, montantPrevu: v.montantPrevu }))} />
      <MarcheDetailDrawer open={selMarcheId !== null} onClose={() => setSelMarcheId(null)}
        marcheId={selMarcheId} marcheLabel={selMarche?.objet ?? ''} marcheEngagement={selMarche?.engage ?? 0}
        marcheDepenses={selMarche?.depense ?? 0} marcheResteAPayer={selMarche?.reste ?? 0} />
    </Paper>
  )
}

export default ConventionFinancialFlowCard
