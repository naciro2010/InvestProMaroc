import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Chip, IconButton, Alert, CircularProgress } from '@mui/material'
import { Plus, RefreshCw } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel } from '@/components/core'
import ConfirmDialog from '@/components/core/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import { projetsAPI, Projet } from '@/lib/projetsAPI'
import {
  useSortableTable,
  DndContext,
  SortableContext,
  verticalListSortingStrategy,
  closestCenter,
} from '@/components/core/SortableTable'
import { SortableProjetCard, ProjetActionDialogs } from '@/components/projets/list'
import { colors, typography, componentStyles, getStatusConfig } from '@/lib/designSystem'

const styles = componentStyles.listPage

const formatMontant = (montant: number): string => {
  if (montant >= 1000000) return `${(montant / 1000000).toFixed(2)} M DH`
  return `${montant.toLocaleString('fr-FR')} DH`
}

const STATUS_FILTERS = ['ALL', 'EN_PREPARATION', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'ANNULE']

const ProjetsPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [rawProjets, setRawProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [statutFilter, setStatutFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(12)

  // Dialog states
  const [motifDialog, setMotifDialog] = useState(false)
  const [motif, setMotif] = useState('')
  const [actionType, setActionType] = useState<'suspendre' | 'annuler'>('suspendre')
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} })

  const { items: projets, sensors, handleDragEnd } = useSortableTable({
    initialItems: rawProjets,
    idKey: 'id',
    storageKey: 'projets-order',
  })

  useEffect(() => { loadProjets(); loadStats() }, [])

  const loadProjets = async () => {
    try {
      setLoading(true)
      const response = await projetsAPI.getAll()
      setRawProjets(response.data)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await projetsAPI.getStatistiques()
      setStats(response.data)
    } catch { /* stats are non-critical */ }
  }

  const refresh = () => { loadProjets(); loadStats() }

  const filteredProjets = useMemo(() => {
    return projets.filter(p => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        if (!(p.code.toLowerCase().includes(q) || p.nom.toLowerCase().includes(q) || (p.description?.toLowerCase() ?? '').includes(q))) return false
      }
      if (statutFilter !== 'ALL' && p.statut !== statutFilter) return false
      return true
    })
  }, [projets, searchTerm, statutFilter])

  const paginatedProjets = useMemo(() => {
    return filteredProjets.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
  }, [filteredProjets, page, rowsPerPage])

  // Action handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projet: Projet) => {
    setAnchorEl(event.currentTarget); setSelectedProjet(projet)
  }
  const handleMenuClose = () => { setAnchorEl(null); setSelectedProjet(null) }

  const handleDemarrer = async () => {
    if (!selectedProjet?.id) return
    handleMenuClose()
    try { await projetsAPI.demarrer(selectedProjet.id); showToast('Projet demarre', 'success'); refresh() }
    catch (err: unknown) { showToast(err instanceof Error ? err.message : 'Erreur lors du demarrage', 'error') }
  }

  const handleSuspendre = () => { setActionType('suspendre'); setMotif(''); setMotifDialog(true); handleMenuClose() }
  const handleAnnuler = () => { setActionType('annuler'); setMotif(''); setMotifDialog(true); handleMenuClose() }

  const handleReprendre = async () => {
    if (!selectedProjet?.id) return
    handleMenuClose()
    try { await projetsAPI.reprendre(selectedProjet.id); showToast('Projet repris', 'success'); refresh() }
    catch (err: unknown) { showToast(err instanceof Error ? err.message : 'Erreur lors de la reprise', 'error') }
  }

  const handleTerminer = () => {
    handleMenuClose()
    setConfirmDialog({ open: true, title: 'Terminer le projet', message: 'Confirmer la cloture du projet ?', onConfirm: async () => {
      if (!selectedProjet?.id) return
      try { await projetsAPI.terminer(selectedProjet.id); showToast('Projet termine', 'success'); refresh() }
      catch (err: unknown) { showToast(err instanceof Error ? err.message : 'Erreur lors de la cloture', 'error') }
      setConfirmDialog(prev => ({ ...prev, open: false }))
    }})
  }

  const handleDelete = () => {
    handleMenuClose()
    setConfirmDialog({ open: true, title: 'Supprimer le projet', message: 'Confirmer la suppression ? Cette action est irreversible.', onConfirm: async () => {
      if (!selectedProjet?.id) return
      try { await projetsAPI.delete(selectedProjet.id); showToast('Projet supprime', 'success'); refresh() }
      catch (err: unknown) { showToast(err instanceof Error ? err.message : 'Erreur lors de la suppression', 'error') }
      setConfirmDialog(prev => ({ ...prev, open: false }))
    }})
  }

  const handleMotifSubmit = async () => {
    if (!selectedProjet?.id) return
    try {
      if (actionType === 'suspendre') await projetsAPI.suspendre(selectedProjet.id, motif)
      else await projetsAPI.annuler(selectedProjet.id, motif)
      showToast(actionType === 'suspendre' ? 'Projet suspendu' : 'Projet annule', 'success')
      refresh()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : `Erreur lors de l'${actionType === 'suspendre' ? 'suspension' : 'annulation'}`, 'error')
    }
    setMotifDialog(false); setMotif('')
  }

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={40} />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        <ControlPanel
          breadcrumbs={[{ label: 'Projets' }]}
          actions={
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => navigate('/projets/nouveau')}
                sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.75 }}
              >
                Nouveau
              </Button>
              <IconButton size="small" onClick={refresh} sx={{ color: colors.textSecondary }}>
                <RefreshCw size={16} />
              </IconButton>
            </>
          }
          searchValue={searchTerm}
          onSearchChange={(value) => { setSearchTerm(value); setPage(0) }}
          searchPlaceholder="Rechercher par code, designation..."
          paginationInfo={{
            currentStart: filteredProjets.length === 0 ? 0 : page * rowsPerPage + 1,
            currentEnd: Math.min((page + 1) * rowsPerPage, filteredProjets.length),
            total: filteredProjets.length,
          }}
          onPreviousPage={() => setPage(prev => Math.max(0, prev - 1))}
          onNextPage={() => setPage(prev => prev + 1)}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((statut) => {
              const count = statut === 'ALL' ? projets.length : (stats[statut] || 0)
              const isActive = statutFilter === statut
              return (
                <Chip
                  key={statut}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{statut === 'ALL' ? 'Tous' : getStatusConfig(statut).label}</span>
                      <Box component="span" sx={isActive ? styles.countBadge : styles.countBadgeInactive}>{count}</Box>
                    </Box>
                  }
                  onClick={() => { setStatutFilter(statut); setPage(0) }}
                  sx={isActive ? styles.filterPillActive : styles.filterPill}
                />
              )
            })}
          </Box>
        </ControlPanel>

        <Box sx={{ px: 3, pb: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={paginatedProjets.map(p => p.id ?? 0)} strategy={verticalListSortingStrategy}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
                {paginatedProjets.length === 0 ? (
                  <Box sx={{ gridColumn: '1 / -1', py: 8, textAlign: 'center' }}>
                    <Typography sx={{ color: colors.textSecondary }}>Aucun projet trouve</Typography>
                  </Box>
                ) : (
                  paginatedProjets.map((projet) => (
                    <SortableProjetCard
                      key={projet.id}
                      projet={projet}
                      onMenuOpen={handleMenuOpen}
                      onClick={() => navigate(`/projets/${projet.id}`)}
                      formatMontant={formatMontant}
                    />
                  ))
                )}
              </Box>
            </SortableContext>
          </DndContext>
        </Box>

        <ProjetActionDialogs
          anchorEl={anchorEl}
          selectedProjet={selectedProjet}
          onMenuClose={handleMenuClose}
          onNavigateDetail={() => { handleMenuClose(); navigate(`/projets/${selectedProjet?.id}`) }}
          onNavigateEdit={() => { handleMenuClose(); navigate(`/projets/${selectedProjet?.id}`) }}
          onDemarrer={handleDemarrer}
          onSuspendre={handleSuspendre}
          onReprendre={handleReprendre}
          onTerminer={handleTerminer}
          onAnnuler={handleAnnuler}
          onDelete={handleDelete}
          motifDialogOpen={motifDialog}
          motif={motif}
          onMotifChange={setMotif}
          onMotifSubmit={handleMotifSubmit}
          onMotifClose={() => setMotifDialog(false)}
          actionType={actionType}
        />

        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        />
      </Box>
    </AppLayout>
  )
}

export default ProjetsPage
