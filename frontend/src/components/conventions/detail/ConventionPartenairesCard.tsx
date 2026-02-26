import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material'
import { Edit, Delete, ArrowUpward, ChevronRight, AddCircleOutline } from '@mui/icons-material'
import { conventionsAPI } from '@/lib/api'
import { colors, borders, typography } from '@/lib/designSystem'
import PartenaireDetailDrawer from './PartenaireDetailDrawer'

interface ConventionPartenaireData {
  id: number
  partenaireId: number
  partenaireCode: string
  partenaireNom: string
  partenaireSigle: string | null
  budgetAlloue: number
  pourcentage: number
  commissionIntervention: number | null
  estMaitreOeuvre: boolean
  estMaitreOeuvreDelegue: boolean
  remarques: string | null
}

interface VersementPrevisionnel {
  id: number
  partenaireId?: number
  montant: number
  montantPrevu?: number
}

interface ConventionPartenairesCardProps {
  conventionId: number
  conventionBudget?: number
  canEdit?: boolean
  parentConventionId?: number
  versements?: VersementPrevisionnel[]
  onAddClick: () => void
  onEditClick?: (partenaire: ConventionPartenaireData) => void
}

const formatCurrency = (amount: number): string => {
  const millions = amount / 1_000_000
  return `${millions.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`
}

const formatCurrencyFull = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

/**
 * ConventionPartenairesCard - Pure content for ResizableSection.
 * No Paper wrapper or redundant header - ResizableSection provides those.
 */
const ConventionPartenairesCard = ({
  conventionId,
  conventionBudget = 0,
  canEdit = false,
  parentConventionId,
  versements = [],
  onAddClick,
  onEditClick,
}: ConventionPartenairesCardProps) => {
  const [partenaires, setPartenaires] = useState<ConventionPartenaireData[]>([])
  const [parentPartenaires, setParentPartenaires] = useState<ConventionPartenaireData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingParent, setLoadingParent] = useState(false)
  const [selectedPartenaire, setSelectedPartenaire] = useState<ConventionPartenaireData | null>(null)

  const isSousConvention = !!parentConventionId

  useEffect(() => {
    loadPartenaires()
    if (parentConventionId) loadParentPartenaires()
  }, [conventionId, parentConventionId])

  const loadPartenaires = async () => {
    try {
      setLoading(true)
      const response = await conventionsAPI.getPartenaires(conventionId)
      const data = response.data.data || response.data || []
      setPartenaires(Array.isArray(data) ? data : [])
    } catch {
      setPartenaires([])
    } finally {
      setLoading(false)
    }
  }

  const loadParentPartenaires = async () => {
    if (!parentConventionId) return
    try {
      setLoadingParent(true)
      const response = await conventionsAPI.getPartenaires(parentConventionId)
      const data = response.data.data || response.data || []
      setParentPartenaires(Array.isArray(data) ? data : [])
    } catch {
      setParentPartenaires([])
    } finally {
      setLoadingParent(false)
    }
  }

  const handleDelete = async (partenaireId: number) => {
    if (!window.confirm('Supprimer ce partenaire ?')) return
    try {
      await conventionsAPI.deletePartenaire(conventionId, partenaireId)
      loadPartenaires()
    } catch { /* handled silently */ }
  }

  // Aggregate versements per partenaire
  const versementsByPartenaire = new Map<number, number>()
  versements.forEach(v => {
    if (v.partenaireId) {
      const current = versementsByPartenaire.get(v.partenaireId) || 0
      versementsByPartenaire.set(v.partenaireId, current + (v.montantPrevu || v.montant))
    }
  })

  const totalBudget = partenaires.reduce((sum, p) => sum + p.budgetAlloue, 0)
  const totalVersements = Array.from(versementsByPartenaire.values()).reduce((s, v) => s + v, 0)
  const parentPartenaireIds = new Set(parentPartenaires.map(p => p.partenaireId))

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>

  if (partenaires.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: canEdit ? 1.5 : 0 }}>
          {isSousConvention ? 'Aucun partenaire propre a cette sous-convention' : 'Aucun partenaire defini'}
        </Typography>
        {canEdit && (
          <Box
            onClick={onAddClick}
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', py: 0.75, px: 2, borderRadius: 1, '&:hover': { bgcolor: colors.primary[25] } }}
          >
            <AddCircleOutline sx={{ fontSize: 16, color: colors.primary[500] }} />
            <Typography sx={{ fontSize: typography.sizes.sm, color: colors.primary[600], fontWeight: typography.weights.medium }}>
              Ajouter un partenaire
            </Typography>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box>
      {/* Parent partenaires info */}
      {isSousConvention && !loadingParent && parentPartenaires.length > 0 && (
        <Box sx={{ mb: 1.5, p: 1.5, bgcolor: colors.primary[25], borderRadius: borders.radius.md, border: `1px solid ${colors.primary[100]}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <ArrowUpward sx={{ fontSize: 14, color: colors.primary[600] }} />
            <Typography sx={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, color: colors.primary[600], textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Convention principale
            </Typography>
            <Chip label={parentPartenaires.length} size="small" sx={{ height: 18, fontSize: '10px', bgcolor: colors.primary[100], color: colors.primary[700] }} />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {parentPartenaires.map(p => (
              <Chip key={p.id}
                label={`${p.partenaireSigle || p.partenaireCode} - ${formatCurrency(p.budgetAlloue)} (${p.pourcentage.toFixed(1)}%)`}
                size="small" variant="outlined"
                sx={{
                  fontSize: typography.sizes.xs,
                  borderColor: partenaires.some(own => own.partenaireId === p.partenaireId) ? colors.success[300] : colors.neutral[300],
                  color: colors.textPrimary,
                  bgcolor: partenaires.some(own => own.partenaireId === p.partenaireId) ? colors.success[25] : 'transparent',
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: colors.neutral[50] }}>
              <TableCell sx={thStyle}>Partenaire</TableCell>
              <TableCell align="right" sx={thStyle}>Budget</TableCell>
              <TableCell align="right" sx={thStyle}>%</TableCell>
              <TableCell align="right" sx={thStyle}>Vers. prev.</TableCell>
              <TableCell sx={thStyle}>Role</TableCell>
              {isSousConvention && <TableCell sx={thStyle}>Source</TableCell>}
              {canEdit && <TableCell align="center" sx={{ ...thStyle, width: 80 }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {partenaires.map(p => {
              const isFromParent = parentPartenaireIds.has(p.partenaireId)
              const versTotal = versementsByPartenaire.get(p.partenaireId) || 0
              return (
                <Tooltip key={p.id} title="Cliquer pour voir le detail" placement="left" arrow enterDelay={600}>
                <TableRow
                  onClick={() => setSelectedPartenaire(p)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] }, bgcolor: selectedPartenaire?.id === p.id ? colors.primary[25] : 'transparent' }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                      {p.partenaireSigle || p.partenaireCode}
                    </Typography>
                    <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{p.partenaireNom}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.primary[700] }}>
                      {formatCurrency(p.budgetAlloue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontSize: typography.sizes.sm }}>{p.pourcentage.toFixed(2)}%</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{
                      fontSize: typography.sizes.sm,
                      fontWeight: versTotal > 0 ? typography.weights.medium : typography.weights.normal,
                      color: versTotal > 0 ? colors.warning[700] : colors.textSecondary,
                    }}>
                      {versTotal > 0 ? formatCurrencyFull(versTotal) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {p.estMaitreOeuvre && <Chip label="MO" size="small" sx={{ bgcolor: colors.info[100], color: colors.info[700], fontSize: typography.sizes.xs, height: 22 }} />}
                      {p.estMaitreOeuvreDelegue && <Chip label="MOD" size="small" sx={{ bgcolor: colors.purple[100], color: colors.purple[700], fontSize: typography.sizes.xs, height: 22 }} />}
                      {!p.estMaitreOeuvre && !p.estMaitreOeuvreDelegue && <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>-</Typography>}
                    </Box>
                  </TableCell>
                  {isSousConvention && (
                    <TableCell>
                      {isFromParent ? (
                        <Chip icon={<ArrowUpward sx={{ fontSize: 12 }} />} label="Principale" size="small"
                          sx={{ height: 22, fontSize: '10px', bgcolor: colors.primary[50], color: colors.primary[700], border: `1px solid ${colors.primary[200]}` }} />
                      ) : (
                        <Chip label="Propre" size="small" sx={{ height: 22, fontSize: '10px', bgcolor: colors.neutral[50], color: colors.textSecondary, border: `1px solid ${colors.neutral[200]}` }} />
                      )}
                    </TableCell>
                  )}
                  {canEdit && (
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.25 }}>
                        {onEditClick && (
                          <Tooltip title="Modifier">
                            <IconButton size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEditClick(p) }}>
                              <Edit sx={{ fontSize: 15, color: colors.neutral[500] }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Supprimer">
                          <IconButton size="small" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(p.id) }}>
                            <Delete sx={{ fontSize: 15, color: colors.danger[500] }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
                </Tooltip>
              )
            })}
            {/* Total */}
            <TableRow sx={{ bgcolor: colors.neutral[50] }}>
              <TableCell sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm, color: colors.primary[700] }}>
                {formatCurrency(totalBudget)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm }}>100%</TableCell>
              <TableCell align="right" sx={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.sm, color: colors.warning[700] }}>
                {totalVersements > 0 ? formatCurrencyFull(totalVersements) : '-'}
              </TableCell>
              <TableCell colSpan={isSousConvention ? (canEdit ? 3 : 2) : (canEdit ? 2 : 1)} />
            </TableRow>
            {/* Odoo-style add line */}
            {canEdit && (
              <TableRow
                onClick={onAddClick}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: colors.primary[25] }, '& td': { borderBottom: 0 } }}
              >
                <TableCell colSpan={isSousConvention ? (canEdit ? 8 : 7) : (canEdit ? 7 : 6)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <AddCircleOutline sx={{ fontSize: 16, color: colors.primary[500] }} />
                    <Typography sx={{ fontSize: typography.sizes.sm, color: colors.primary[600], fontWeight: typography.weights.medium }}>
                      Ajouter un partenaire
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Drawer */}
      <PartenaireDetailDrawer
        open={selectedPartenaire !== null}
        onClose={() => setSelectedPartenaire(null)}
        partenaire={selectedPartenaire}
        conventionId={conventionId}
        conventionBudget={conventionBudget}
        versements={versements.map(v => ({
          id: v.id,
          partenaireId: v.partenaireId,
          dateVersement: '',
          montant: v.montant,
          montantPrevu: v.montantPrevu,
        }))}
      />
    </Box>
  )
}

const thStyle = {
  fontWeight: typography.weights.semibold,
  fontSize: typography.sizes.xs,
  color: colors.textSecondary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}

export default ConventionPartenairesCard
