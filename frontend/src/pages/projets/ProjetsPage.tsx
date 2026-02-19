import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
} from '@mui/material'
import {
  Add,
  MoreVert,
  PlayArrow,
  Pause,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Visibility,
  Refresh,
} from '@mui/icons-material'
import { GripVertical } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { ControlPanel, StatusBadge } from '../../components/core'
import ConfirmDialog from '../../components/core/ConfirmDialog'
import { useToast } from '../../contexts/ToastContext'
import { projetsAPI, Projet } from '../../lib/projetsAPI'
import {
  useSortableTable,
  useSortable,
  DndContext,
  SortableContext,
  verticalListSortingStrategy,
  closestCenter,
} from '../../components/core/SortableTable'
import { CSS } from '@dnd-kit/utilities'
import { colors, typography, transitions, componentStyles, getStatusConfig } from '../../lib/designSystem'

// Styles from design system
const styles = componentStyles.listPage

// Composant carte projet draggable
interface SortableProjetCardProps {
  projet: Projet
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, projet: Projet) => void
  onClick: () => void
  formatMontant: (montant: number) => string
}

const SortableProjetCard = ({
  projet,
  onMenuOpen,
  onClick,
  formatMontant,
}: SortableProjetCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: projet.id ?? 0 })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        ...componentStyles.cardInteractive,
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDragging ? colors.primary[50] : colors.surface,
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, flex: 1, minWidth: 0 }}>
          {/* Drag Handle */}
          <Box
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            sx={{
              cursor: 'grab',
              color: colors.neutral[400],
              '&:hover': { color: colors.neutral[600] },
              transition: `color ${transitions.fast}`,
              mt: 0.5,
            }}
          >
            <GripVertical className="w-4 h-4" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
              {projet.code}
            </Typography>
            <Typography
              sx={{
                fontWeight: typography.weights.semibold,
                mt: 0.5,
                fontSize: typography.sizes.lg,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {projet.nom}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onMenuOpen(e, projet); }}
        >
          <MoreVert />
        </IconButton>
      </Box>

      <Box sx={{ mb: 2 }}>
        <StatusBadge status={projet.statut} />
      </Box>

      {projet.description && (
        <Typography
          sx={{
            mb: 2,
            color: colors.textSecondary,
            fontSize: typography.sizes.sm,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {projet.description}
        </Typography>
      )}

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            Avancement
          </Typography>
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, fontWeight: typography.weights.semibold }}>
            {projet.pourcentageAvancement}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={projet.pourcentageAvancement}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: colors.neutral[100],
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              bgcolor: projet.pourcentageAvancement >= 80 ? colors.success[400]
                : projet.pourcentageAvancement >= 40 ? colors.primary[400]
                : colors.warning[400],
            },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
        <Typography sx={{ fontSize: typography.sizes.sm }}>
          <strong>Budget:</strong> {formatMontant(projet.budgetTotal)}
        </Typography>
        {projet.dateDebut && (
          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
            {new Date(projet.dateDebut).toLocaleDateString('fr-FR')}
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

const ProjetsPage = () => {
  const navigate = useNavigate()
  const [rawProjets, setRawProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [statutFilter, setStatutFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(12)

  // Dialog states
  const [motifDialog, setMotifDialog] = useState(false)
  const [motif, setMotif] = useState('')
  const [actionType, setActionType] = useState<'suspendre' | 'annuler'>('suspendre')

  // Drag & drop avec persistance localStorage
  const {
    items: projets,
    sensors,
    handleDragEnd,
  } = useSortableTable({
    initialItems: rawProjets,
    idKey: 'id',
    storageKey: 'projets-order',
  })

  useEffect(() => {
    loadProjets()
    loadStats()
  }, [])

  const loadProjets = async () => {
    try {
      setLoading(true)
      const response = await projetsAPI.getAll()
      setRawProjets(response.data)
      setError(null)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des projets'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await projetsAPI.getStatistiques()
      setStats(response.data)
    } catch (err) {
      console.error('Erreur chargement stats:', err)
    }
  }

  // Filtrage
  const filteredProjets = useMemo(() => {
    return projets.filter(p => {
      // Filtre par recherche
      if (searchTerm) {
        const query = searchTerm.toLowerCase()
        if (!(
          p.code.toLowerCase().includes(query) ||
          p.nom.toLowerCase().includes(query) ||
          (p.description?.toLowerCase() ?? '').includes(query)
        )) {
          return false
        }
      }
      // Filtre par statut
      if (statutFilter !== 'ALL' && p.statut !== statutFilter) {
        return false
      }
      return true
    })
  }, [projets, searchTerm, statutFilter])

  // Pagination
  const paginatedProjets = useMemo(() => {
    const start = page * rowsPerPage
    return filteredProjets.slice(start, start + rowsPerPage)
  }, [filteredProjets, page, rowsPerPage])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projet: Projet) => {
    setAnchorEl(event.currentTarget)
    setSelectedProjet(projet)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedProjet(null)
  }

  const handleDemarrer = async () => {
    if (!selectedProjet?.id) return
    try {
      await projetsAPI.demarrer(selectedProjet.id)
      loadProjets()
      loadStats()
      handleMenuClose()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors du démarrage')
    }
  }

  const handleSuspendre = () => {
    setActionType('suspendre')
    setMotif('')
    setMotifDialog(true)
    handleMenuClose()
  }

  const handleReprendre = async () => {
    if (!selectedProjet?.id) return
    try {
      await projetsAPI.reprendre(selectedProjet.id)
      loadProjets()
      loadStats()
      handleMenuClose()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la reprise')
    }
  }

  const handleTerminer = async () => {
    if (!selectedProjet?.id) return
    if (!window.confirm('Confirmer la clôture du projet ?')) return
    try {
      await projetsAPI.terminer(selectedProjet.id)
      loadProjets()
      loadStats()
      handleMenuClose()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la clôture')
    }
  }

  const handleAnnuler = () => {
    setActionType('annuler')
    setMotif('')
    setMotifDialog(true)
    handleMenuClose()
  }

  const handleMotifSubmit = async () => {
    if (!selectedProjet?.id) return
    try {
      if (actionType === 'suspendre') {
        await projetsAPI.suspendre(selectedProjet.id, motif)
      } else {
        await projetsAPI.annuler(selectedProjet.id, motif)
      }
      loadProjets()
      loadStats()
      setMotifDialog(false)
      setMotif('')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : `Erreur lors de l'${actionType === 'suspendre' ? 'suspension' : 'annulation'}`)
    }
  }

  const handleDelete = async () => {
    if (!selectedProjet?.id) return
    if (!window.confirm('Confirmer la suppression ?')) return
    try {
      await projetsAPI.delete(selectedProjet.id)
      loadProjets()
      loadStats()
      handleMenuClose()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  const formatMontant = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(2)} M DH`
    }
    return `${montant.toLocaleString('fr-MA')} DH`
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
      <Box sx={styles.container}>
        {/* Control Panel */}
        <ControlPanel
          breadcrumbs={[{ label: 'Projets' }]}
          actions={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={() => { loadProjets(); loadStats(); }}
                sx={{ color: colors.textSecondary }}
              >
                <Refresh fontSize="small" />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/projets/nouveau')}
                sx={componentStyles.buttonPrimary}
              >
                Nouveau Projet
              </Button>
            </Box>
          }
          searchValue={searchTerm}
          onSearchChange={(value) => { setSearchTerm(value); setPage(0); }}
          searchPlaceholder="Rechercher par code, designation..."
          paginationInfo={{
            currentStart: filteredProjets.length === 0 ? 0 : page * rowsPerPage + 1,
            currentEnd: Math.min((page + 1) * rowsPerPage, filteredProjets.length),
            total: filteredProjets.length,
          }}
          onPreviousPage={() => setPage((prev) => Math.max(0, prev - 1))}
          onNextPage={() => setPage((prev) => prev + 1)}
        >
          {/* Status filter chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['ALL', 'EN_PREPARATION', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'ANNULE'].map((statut) => {
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
                  onClick={() => { setStatutFilter(statut); setPage(0); }}
                  sx={isActive ? styles.filterPillActive : styles.filterPill}
                />
              )
            })}
          </Box>
        </ControlPanel>

        {/* Main Content Area */}
        <Box sx={{ px: 3, pb: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Liste des projets avec Drag & Drop */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={paginatedProjets.map(p => p.id ?? 0)} strategy={verticalListSortingStrategy}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                  gap: 3,
                }}
              >
                {paginatedProjets.length === 0 ? (
                  <Box sx={{ gridColumn: '1 / -1', py: 8, textAlign: 'center' }}>
                    <Typography sx={{ color: colors.textSecondary }}>
                      Aucun projet trouvé
                    </Typography>
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

        {/* Menu contextuel */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => navigate(`/projets/${selectedProjet?.id}`)}>
            <Visibility fontSize="small" sx={{ mr: 1 }} /> Détails
          </MenuItem>
          {selectedProjet?.statut === 'EN_PREPARATION' && (
            <MenuItem onClick={handleDemarrer}>
              <PlayArrow fontSize="small" sx={{ mr: 1 }} /> Démarrer
            </MenuItem>
          )}
          {selectedProjet?.statut === 'EN_COURS' && (
            <>
              <MenuItem onClick={handleSuspendre}>
                <Pause fontSize="small" sx={{ mr: 1 }} /> Suspendre
              </MenuItem>
              <MenuItem onClick={handleTerminer}>
                <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Terminer
              </MenuItem>
            </>
          )}
          {selectedProjet?.statut === 'SUSPENDU' && (
            <MenuItem onClick={handleReprendre}>
              <PlayArrow fontSize="small" sx={{ mr: 1 }} /> Reprendre
            </MenuItem>
          )}
          {selectedProjet?.statut !== 'TERMINE' && (
            <MenuItem onClick={handleAnnuler}>
              <Cancel fontSize="small" sx={{ mr: 1 }} /> Annuler
            </MenuItem>
          )}
          <MenuItem onClick={() => navigate(`/projets/${selectedProjet?.id}/modifier`)}>
            <Edit fontSize="small" sx={{ mr: 1 }} /> Modifier
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: colors.danger[600] }}>
            <Delete fontSize="small" sx={{ mr: 1 }} /> Supprimer
          </MenuItem>
        </Menu>

        {/* Dialog pour motif */}
        <Dialog open={motifDialog} onClose={() => setMotifDialog(false)} PaperProps={{ sx: componentStyles.dialog.paper }}>
          <DialogTitle sx={componentStyles.dialog.title}>
            {actionType === 'suspendre' ? 'Suspendre le projet' : 'Annuler le projet'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motif"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMotifDialog(false)} sx={componentStyles.buttonSecondary}>Annuler</Button>
            <Button
              onClick={handleMotifSubmit}
              variant="contained"
              sx={actionType === 'suspendre' ? componentStyles.buttonPrimary : componentStyles.buttonDanger}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  )
}

export default ProjetsPage
