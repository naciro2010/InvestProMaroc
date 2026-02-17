import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Collapse,
  Skeleton,
  Tooltip,
  Divider,
} from '@mui/material'
import {
  Add,
  MoreVert,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Send,
  Visibility,
  Search,
  KeyboardArrowDown,
  KeyboardArrowRight,
  FolderOpen,
  Description,
  Refresh,
} from '@mui/icons-material'
import { conventionsAPI } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import AppLayout from '../../components/layout/AppLayout'
import StatusBadge from '../../components/core/StatusBadge'
import ConfirmDialog from '../../components/core/ConfirmDialog'
import { ExportButton, PageHeader } from '../../components/core'
import { colors, typography, componentStyles } from '../../lib/designSystem'
import RichTextDisplay from '../../components/ui/RichTextDisplay'
import { FileText } from 'lucide-react'
import { exportToExcel, formatCurrencyForExport, formatDateForExport } from '../../lib/exportUtils'

// Types
type StatutConvention = 'BROUILLON' | 'SOUMIS' | 'VALIDE'

interface Convention {
  id: number
  code: string
  numero: string
  libelle: string
  statut: StatutConvention
  type?: 'CADRE' | 'SPECIFIQUE'
  budget: number
  tauxCommission: number
  dateDebut: string
  dateFin?: string
  isLocked: boolean
  createdByNom?: string
  parentConventionId?: number
  sousConventionsCount?: number
}

interface ConventionWithChildren extends Convention {
  sousConventions: Convention[]
}

// Styles from design system
const styles = componentStyles.listPage

const ConventionsTableModern = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()

  // State
  const [conventions, setConventions] = useState<Convention[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatutConvention | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedConvention, setSelectedConvention] = useState<Convention | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [motifRejet, setMotifRejet] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Fetch data
  useEffect(() => {
    fetchConventions()
  }, [])

  const fetchConventions = async () => {
    try {
      setLoading(true)
      const response = await conventionsAPI.getAll()
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || [])
      setConventions(data)
    } catch (error) {
      console.error('Erreur:', error)
      showToast('Erreur lors du chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Group conventions: parents with their children
  const groupedData = useMemo((): ConventionWithChildren[] => {
    const parents = conventions.filter(c => !c.parentConventionId)
    const children = conventions.filter(c => c.parentConventionId)

    return parents.map(parent => ({
      ...parent,
      sousConventions: children.filter(c => c.parentConventionId === parent.id),
    }))
  }, [conventions])

  // Filter and search
  const filteredData = useMemo(() => {
    return groupedData.filter(conv => {
      if (statusFilter !== 'ALL' && conv.statut !== statusFilter) return false

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchParent =
          conv.code?.toLowerCase().includes(query) ||
          conv.libelle?.toLowerCase().includes(query) ||
          conv.numero?.toLowerCase().includes(query)
        const matchChildren = conv.sousConventions?.some(
          sc =>
            sc.code?.toLowerCase().includes(query) ||
            sc.libelle?.toLowerCase().includes(query)
        )
        return matchParent || matchChildren
      }
      return true
    })
  }, [groupedData, statusFilter, searchQuery])

  // Pagination
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage
    return filteredData.slice(start, start + rowsPerPage)
  }, [filteredData, page, rowsPerPage])

  // Stats
  const stats = useMemo(() => ({
    total: conventions.length,
    brouillon: conventions.filter(c => c.statut === 'BROUILLON').length,
    soumis: conventions.filter(c => c.statut === 'SOUMIS').length,
    valide: conventions.filter(c => c.statut === 'VALIDE').length,
  }), [conventions])

  // Handlers
  const toggleGroup = (id: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleRowClick = (id: number) => {
    navigate(`/conventions/${id}`)
  }

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, conv: Convention) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    setSelectedConvention(conv)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleAction = async (action: string) => {
    if (!selectedConvention) return
    handleMenuClose()

    try {
      switch (action) {
        case 'view':
          navigate(`/conventions/${selectedConvention.id}`)
          break
        case 'edit':
          navigate(`/conventions/${selectedConvention.id}/edit`)
          break
        case 'submit':
          await conventionsAPI.soumettre(selectedConvention.id)
          showToast('Convention soumise', 'success')
          fetchConventions()
          break
        case 'validate':
          if (user?.id) {
            await conventionsAPI.valider(selectedConvention.id, user.id)
            showToast('Convention validée', 'success')
            fetchConventions()
          }
          break
        case 'reject':
          setRejectDialogOpen(true)
          break
        case 'delete':
          setDeleteConfirmOpen(true)
          break
      }
    } catch (error) {
      showToast('Erreur lors de l\'action', 'error')
    }
  }

  const handleReject = async () => {
    if (!selectedConvention || !motifRejet.trim()) return
    try {
      await conventionsAPI.rejeter(selectedConvention.id, motifRejet)
      showToast('Convention rejetée', 'success')
      setRejectDialogOpen(false)
      setMotifRejet('')
      fetchConventions()
    } catch {
      showToast('Erreur lors du rejet', 'error')
    }
  }

  const confirmDelete = async () => {
    if (!selectedConvention) return
    try {
      await conventionsAPI.delete(selectedConvention.id)
      showToast('Convention supprimée avec succès', 'success')
      fetchConventions()
    } catch {
      showToast('Erreur lors de la suppression', 'error')
    } finally {
      setDeleteConfirmOpen(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
    return amount.toLocaleString('fr-FR')
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Export handler
  const handleExport = () => {
    const exportData = filteredData.flatMap(conv => {
      const parent: Record<string, unknown> = {
        code: conv.code,
        type: conv.type || '-',
        libelle: conv.libelle,
        budget: conv.budget,
        statut: conv.statut,
        dateDebut: conv.dateDebut,
      }
      const children = (conv.sousConventions || []).map(sc => ({
        code: sc.code,
        type: sc.type || 'SPECIFIQUE',
        libelle: sc.libelle,
        budget: sc.budget,
        statut: sc.statut,
        dateDebut: sc.dateDebut,
      }))
      return [parent, ...children]
    })
    exportToExcel({
      filename: 'conventions',
      sheetName: 'Conventions',
      columns: [
        { header: 'Code', key: 'code', width: 18 },
        { header: 'Type', key: 'type', width: 14 },
        { header: 'Libellé', key: 'libelle', width: 35 },
        { header: 'Budget (MAD)', key: 'budget', width: 22, formatter: formatCurrencyForExport },
        { header: 'Statut', key: 'statut', width: 14 },
        { header: 'Date Début', key: 'dateDebut', width: 16, formatter: formatDateForExport },
      ],
      data: exportData,
    })
  }

  // Filter pill component
  const FilterPill = ({
    label,
    count,
    active,
    onClick,
  }: {
    label: string
    count: number
    active: boolean
    onClick: () => void
  }) => (
    <Chip
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>{label}</span>
          <Box component="span" sx={active ? styles.countBadge : styles.countBadgeInactive}>{count}</Box>
        </Box>
      }
      onClick={onClick}
      sx={active ? styles.filterPillActive : styles.filterPill}
    />
  )

  return (
    <AppLayout>
      <Box sx={styles.container}>
        {/* Header */}
        <Box sx={styles.header}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={styles.title}>
                Conventions
              </Typography>
              <Typography variant="body2" sx={styles.subtitle}>
                {stats.total} convention{stats.total > 1 ? 's' : ''} • {stats.valide} validée{stats.valide > 1 ? 's' : ''}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/conventions/nouvelle')}
              sx={{
                ...componentStyles.buttonPrimary,
                px: 3,
              }}
            >
              Nouvelle Convention
            </Button>
          </Box>

          {/* Filter Pills */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <FilterPill
              label="Tous"
              count={stats.total}
              active={statusFilter === 'ALL'}
              onClick={() => setStatusFilter('ALL')}
            />
            <FilterPill
              label="Brouillon"
              count={stats.brouillon}
              active={statusFilter === 'BROUILLON'}
              onClick={() => setStatusFilter('BROUILLON')}
            />
            <FilterPill
              label="En attente"
              count={stats.soumis}
              active={statusFilter === 'SOUMIS'}
              onClick={() => setStatusFilter('SOUMIS')}
            />
            <FilterPill
              label="Validées"
              count={stats.valide}
              active={statusFilter === 'VALIDE'}
              onClick={() => setStatusFilter('VALIDE')}
            />
          </Box>
        </Box>

        {/* Toolbar */}
        <Box sx={styles.toolbar}>
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: colors.textSecondary, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={styles.searchField}
          />
          <Box sx={{ flex: 1 }} />
          <ExportButton onClick={handleExport} />
          <Tooltip title="Rafraîchir">
            <IconButton onClick={fetchConventions} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Table */}
        <Box sx={{ p: 3 }}>
          <TableContainer component={Paper} sx={styles.tableContainer}>
            <Table size="small">
              <TableHead>
                <TableRow sx={styles.tableHeader}>
                  <TableCell sx={{ width: 40, pl: 1 }} />
                  <TableCell>Convention</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Budget</TableCell>
                  <TableCell align="center">Commission</TableCell>
                  <TableCell>Période</TableCell>
                  <TableCell>Créé par</TableCell>
                  <TableCell align="center" sx={{ width: 60 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton variant="rectangular" height={40} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Description sx={{ fontSize: 48, color: colors.neutral[300], mb: 1 }} />
                      <Typography color="text.secondary">Aucune convention trouvée</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((conv) => (
                    <>
                      {/* Parent Row */}
                      <TableRow
                        key={conv.id}
                        hover
                        onClick={() => handleRowClick(conv.id)}
                        sx={{
                          ...styles.tableRowClickable,
                          borderLeft: conv.type === 'CADRE' ? `3px solid ${colors.primary[600]}` : 'none',
                        }}
                      >
                        <TableCell sx={{ pl: 1 }}>
                          {conv.sousConventions && conv.sousConventions.length > 0 && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleGroup(conv.id)
                              }}
                            >
                              {expandedGroups.has(conv.id) ? (
                                <KeyboardArrowDown fontSize="small" />
                              ) : (
                                <KeyboardArrowRight fontSize="small" />
                              )}
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FolderOpen
                              sx={{
                                fontSize: 18,
                                color: conv.type === 'CADRE' ? colors.primary[600] : colors.neutral[400],
                              }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary }}
                              >
                                {conv.code}
                              </Typography>
                              <RichTextDisplay html={conv.libelle} variant="inline" sx={{ maxWidth: 300, display: 'block', color: colors.textSecondary }} />
                            </Box>
                            {conv.sousConventions && conv.sousConventions.length > 0 && (
                              <Chip
                                label={`${conv.sousConventions.length} sous-conv.`}
                                size="small"
                                sx={styles.countBadge}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={conv.statut} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: typography.weights.semibold }}>
                            {formatCurrency(conv.budget)} MAD
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${conv.tauxCommission}%`}
                            size="small"
                            sx={{
                              bgcolor: colors.neutral[100],
                              fontWeight: typography.weights.semibold,
                              fontSize: typography.sizes.xs,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            {formatDate(conv.dateDebut)} → {formatDate(conv.dateFin)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            {conv.createdByNom || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, conv)}>
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* Sous-conventions (collapsed rows) */}
                      {conv.sousConventions && conv.sousConventions.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                            <Collapse in={expandedGroups.has(conv.id)} timeout="auto" unmountOnExit>
                              <Table size="small">
                                <TableBody>
                                  {conv.sousConventions.map((sc) => (
                                    <TableRow
                                      key={sc.id}
                                      hover
                                      onClick={() => handleRowClick(sc.id)}
                                      sx={styles.tableRowChild}
                                    >
                                      <TableCell sx={{ width: 40 }} />
                                      <TableCell sx={{ pl: 6 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Description sx={{ fontSize: 16, color: colors.neutral[400] }} />
                                          <Box>
                                            <Typography variant="body2" sx={{ fontWeight: typography.weights.medium }}>
                                              {sc.code}
                                            </Typography>
                                            <RichTextDisplay html={sc.libelle} variant="inline" sx={{ color: colors.textSecondary }} />
                                          </Box>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <StatusBadge status={sc.statut} />
                                      </TableCell>
                                      <TableCell align="right">
                                        <Typography variant="body2">
                                          {formatCurrency(sc.budget)} MAD
                                        </Typography>
                                      </TableCell>
                                      <TableCell align="center">
                                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                          {sc.tauxCommission}%
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                          {formatDate(sc.dateDebut)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell />
                                      <TableCell align="center">
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, sc)}>
                                          <MoreVert fontSize="small" />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              sx={{
                borderTop: `1px solid ${colors.divider}`,
                '.MuiTablePagination-select': { fontWeight: typography.weights.semibold },
              }}
            />
          </TableContainer>
        </Box>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { minWidth: 180, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
        }}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <Visibility fontSize="small" sx={{ mr: 1.5, color: colors.textSecondary }} />
          Voir détails
        </MenuItem>
        {selectedConvention?.statut === 'BROUILLON' && (
          <>
            <MenuItem onClick={() => handleAction('edit')}>
              <Edit fontSize="small" sx={{ mr: 1.5, color: colors.textSecondary }} />
              Modifier
            </MenuItem>
            <MenuItem onClick={() => handleAction('submit')}>
              <Send fontSize="small" sx={{ mr: 1.5, color: colors.info[600] }} />
              Soumettre
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleAction('delete')} sx={{ color: colors.danger[600] }}>
              <Delete fontSize="small" sx={{ mr: 1.5 }} />
              Supprimer
            </MenuItem>
          </>
        )}
        {selectedConvention?.statut === 'SOUMIS' && user?.roles?.includes('ADMIN') && (
          <>
            <MenuItem onClick={() => handleAction('validate')}>
              <CheckCircle fontSize="small" sx={{ mr: 1.5, color: colors.success[600] }} />
              Valider
            </MenuItem>
            <MenuItem onClick={() => handleAction('reject')}>
              <Cancel fontSize="small" sx={{ mr: 1.5, color: colors.danger[600] }} />
              Rejeter
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: componentStyles.dialog.paper }}>
        <DialogTitle sx={componentStyles.dialog.title}>Rejeter la convention</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Motif du rejet"
            value={motifRejet}
            onChange={(e) => setMotifRejet(e.target.value)}
            placeholder="Expliquez pourquoi cette convention est rejetée..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} sx={componentStyles.buttonSecondary}>Annuler</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            disabled={!motifRejet.trim()}
            sx={componentStyles.buttonDanger}
          >
            Rejeter
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Supprimer la convention"
        message="Cette action est irreversible. Voulez-vous continuer ?"
        variant="danger"
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </AppLayout>
  )
}

export default ConventionsTableModern
