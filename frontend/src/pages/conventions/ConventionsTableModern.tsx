import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
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
  Collapse,
  Divider,
} from '@mui/material'
import {
  MoreVert,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Send,
  Visibility,
  KeyboardArrowDown,
  KeyboardArrowRight,
  FolderOpen,
  Description,
} from '@mui/icons-material'
import { Plus, RefreshCw, Upload } from 'lucide-react'
import { conventionsAPI } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import AppLayout from '../../components/layout/AppLayout'
import {
  StatusBadge,
  ConfirmDialog,
  ExportButton,
  ControlPanel,
} from '../../components/core'
import { colors, typography, componentStyles } from '../../lib/designSystem'
import RichTextDisplay from '../../components/ui/RichTextDisplay'
import { exportToExcel, formatCurrencyForExport, formatDateForExport } from '../../lib/exportUtils'
import ImportConventionsDialog from '../../components/conventions/ImportConventionsDialog'

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

const listStyles = componentStyles.listView

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
  const [importDialogOpen, setImportDialogOpen] = useState(false)

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
          sc => sc.code?.toLowerCase().includes(query) || sc.libelle?.toLowerCase().includes(query)
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

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, conv: Convention) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    setSelectedConvention(conv)
  }

  const handleMenuClose = () => { setAnchorEl(null) }

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
            showToast('Convention validee', 'success')
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
    } catch {
      showToast('Erreur lors de l\'action', 'error')
    }
  }

  const handleReject = async () => {
    if (!selectedConvention || !motifRejet.trim()) return
    try {
      await conventionsAPI.rejeter(selectedConvention.id, motifRejet)
      showToast('Convention rejetee', 'success')
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
      showToast('Convention supprimee', 'success')
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
        code: conv.code, type: conv.type || '-', libelle: conv.libelle,
        budget: conv.budget, statut: conv.statut, dateDebut: conv.dateDebut,
      }
      const children = (conv.sousConventions || []).map(sc => ({
        code: sc.code, type: sc.type || 'SPECIFIQUE', libelle: sc.libelle,
        budget: sc.budget, statut: sc.statut, dateDebut: sc.dateDebut,
      }))
      return [parent, ...children]
    })
    exportToExcel({
      filename: 'conventions',
      sheetName: 'Conventions',
      columns: [
        { header: 'Code', key: 'code', width: 18 },
        { header: 'Type', key: 'type', width: 14 },
        { header: 'Libelle', key: 'libelle', width: 35 },
        { header: 'Budget (MAD)', key: 'budget', width: 22, formatter: formatCurrencyForExport },
        { header: 'Statut', key: 'statut', width: 14 },
        { header: 'Date Debut', key: 'dateDebut', width: 16, formatter: formatDateForExport },
      ],
      data: exportData,
    })
  }

  // Build active filters for control panel
  const activeFilters = statusFilter !== 'ALL' ? [
    { key: 'status', label: 'Statut', value: statusFilter === 'BROUILLON' ? 'Brouillon' : statusFilter === 'SOUMIS' ? 'Soumis' : 'Valide' }
  ] : []

  // Pagination info for pager
  const paginationStart = filteredData.length > 0 ? page * rowsPerPage + 1 : 0
  const paginationEnd = Math.min((page + 1) * rowsPerPage, filteredData.length)

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        {/* Control Panel */}
        <ControlPanel
          breadcrumbs={[
            { label: 'Conventions' },
          ]}
          actions={
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => navigate('/conventions/nouvelle')}
                sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.75 }}
              >
                Nouveau
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Upload size={16} />}
                onClick={() => setImportDialogOpen(true)}
                sx={{ ...componentStyles.buttonSecondary, fontSize: typography.sizes.sm, py: 0.75 }}
              >
                Importer
              </Button>
              <ExportButton onClick={handleExport} />
              <IconButton size="small" onClick={fetchConventions} sx={{ color: colors.textSecondary }}>
                <RefreshCw size={16} />
              </IconButton>
            </>
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Rechercher par code, libelle..."
          filters={activeFilters}
          onRemoveFilter={() => setStatusFilter('ALL')}
          paginationInfo={filteredData.length > 0 ? {
            currentStart: paginationStart,
            currentEnd: paginationEnd,
            total: filteredData.length,
          } : undefined}
          onPreviousPage={() => setPage(p => Math.max(0, p - 1))}
          onNextPage={() => setPage(p => p + 1)}
        >
          {/* Status filter chips */}
          {(['ALL', 'BROUILLON', 'SOUMIS', 'VALIDE'] as const).map((status) => {
            const labelMap: Record<string, string> = {
              ALL: 'Tous', BROUILLON: 'Brouillon', SOUMIS: 'Soumis', VALIDE: 'Valide'
            }
            const countMap: Record<string, number> = {
              ALL: stats.total, BROUILLON: stats.brouillon, SOUMIS: stats.soumis, VALIDE: stats.valide
            }
            const isActive = statusFilter === status
            return (
              <Chip
                key={status}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <span>{labelMap[status]}</span>
                    <Box component="span" sx={{
                      bgcolor: isActive ? colors.primary[200] : colors.neutral[200],
                      color: isActive ? colors.primary[800] : colors.neutral[600],
                      fontSize: typography.sizes['2xs'],
                      fontWeight: typography.weights.bold,
                      borderRadius: '9999px',
                      px: 0.75,
                      minWidth: 18,
                      height: 18,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {countMap[status]}
                    </Box>
                  </Box>
                }
                size="small"
                onClick={() => setStatusFilter(status)}
                sx={isActive ? componentStyles.listPage.filterPillActive : componentStyles.listPage.filterPill}
              />
            )
          })}
        </ControlPanel>

        {/* List Table */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={listStyles.container}>
            <TableContainer>
              <Table size="small" sx={listStyles.table}>
                <TableHead>
                  <TableRow sx={listStyles.headerRow}>
                    <TableCell sx={{ width: 40, pl: 1 }} />
                    <TableCell>Convention</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Budget</TableCell>
                    <TableCell align="center">Commission</TableCell>
                    <TableCell>Periode</TableCell>
                    <TableCell>Cree par</TableCell>
                    <TableCell align="center" sx={{ width: 60 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skel-${i}`}>
                        <TableCell colSpan={8} sx={{ py: 1.5 }}>
                          <Box sx={{ height: 36, bgcolor: colors.neutral[100], borderRadius: 1, animation: 'pulse 1.5s infinite' }} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Description sx={{ fontSize: 48, color: colors.neutral[300], mb: 1 }} />
                        <Typography sx={{ color: colors.textSecondary }}>Aucune convention trouvee</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((conv) => (
                      <ConventionRow
                        key={conv.id}
                        conv={conv}
                        expanded={expandedGroups.has(conv.id)}
                        onToggle={() => toggleGroup(conv.id)}
                        onRowClick={(id) => navigate(`/conventions/${id}`)}
                        onMenuOpen={handleMenuOpen}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                      />
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
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelRowsPerPage="Par page:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                sx={{
                  borderTop: `1px solid ${colors.divider}`,
                  '.MuiTablePagination-select': { fontWeight: typography.weights.semibold },
                }}
              />
            </TableContainer>
          </Box>
        </Box>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 180, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } }}
      >
        <MenuItem onClick={() => handleAction('view')} sx={componentStyles.menuItem}>
          <Visibility fontSize="small" sx={{ color: colors.textSecondary }} />
          Voir details
        </MenuItem>
        {selectedConvention?.statut === 'BROUILLON' && (
          <>
            <MenuItem onClick={() => handleAction('edit')} sx={componentStyles.menuItem}>
              <Edit fontSize="small" sx={{ color: colors.textSecondary }} />
              Modifier
            </MenuItem>
            <MenuItem onClick={() => handleAction('submit')} sx={componentStyles.menuItem}>
              <Send fontSize="small" sx={{ color: colors.info[600] }} />
              Soumettre
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleAction('delete')} sx={{ ...componentStyles.menuItem, color: colors.danger[600] }}>
              <Delete fontSize="small" />
              Supprimer
            </MenuItem>
          </>
        )}
        {selectedConvention?.statut === 'SOUMIS' && user?.roles?.includes('ADMIN') && (
          <>
            <MenuItem onClick={() => handleAction('validate')} sx={componentStyles.menuItem}>
              <CheckCircle fontSize="small" sx={{ color: colors.success[600] }} />
              Valider
            </MenuItem>
            <MenuItem onClick={() => handleAction('reject')} sx={componentStyles.menuItem}>
              <Cancel fontSize="small" sx={{ color: colors.danger[600] }} />
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
            fullWidth multiline rows={4} label="Motif du rejet"
            value={motifRejet} onChange={(e) => setMotifRejet(e.target.value)}
            placeholder="Expliquez pourquoi cette convention est rejetee..." sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} sx={componentStyles.buttonSecondary}>Annuler</Button>
          <Button onClick={handleReject} variant="contained" disabled={!motifRejet.trim()} sx={componentStyles.buttonDanger}>Rejeter</Button>
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

      <ImportConventionsDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={fetchConventions}
        existingCodes={conventions.map(c => c.code)}
      />
    </AppLayout>
  )
}

// ==================== CONVENTION ROW MICRO-COMPONENT ====================

interface ConventionRowProps {
  conv: ConventionWithChildren
  expanded: boolean
  onToggle: () => void
  onRowClick: (id: number) => void
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, conv: Convention) => void
  formatCurrency: (amount: number) => string
  formatDate: (date?: string) => string
}

const ConventionRow = ({
  conv, expanded, onToggle, onRowClick, onMenuOpen, formatCurrency, formatDate,
}: ConventionRowProps) => {
  const hasSousConventions = conv.sousConventions && conv.sousConventions.length > 0

  return (
    <>
      {/* Parent Row */}
      <TableRow
        hover
        onClick={() => onRowClick(conv.id)}
        sx={{
          ...componentStyles.listView.dataRow,
          borderLeft: conv.type === 'CADRE' ? `3px solid ${colors.primary[600]}` : 'none',
        }}
      >
        <TableCell sx={{ pl: 1, width: 40 }}>
          {hasSousConventions && (
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggle() }}>
              {expanded ? <KeyboardArrowDown fontSize="small" /> : <KeyboardArrowRight fontSize="small" />}
            </IconButton>
          )}
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderOpen sx={{ fontSize: 18, color: conv.type === 'CADRE' ? colors.primary[600] : colors.neutral[400] }} />
            <Box>
              <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.base, color: colors.textPrimary }}>
                {conv.code}
              </Typography>
              <RichTextDisplay html={conv.libelle} variant="inline" sx={{ maxWidth: 300, display: 'block', color: colors.textSecondary }} />
            </Box>
            {hasSousConventions && (
              <Chip
                label={`${conv.sousConventions.length}`}
                size="small"
                sx={{
                  bgcolor: colors.neutral[100], fontSize: typography.sizes['2xs'],
                  fontWeight: typography.weights.bold, height: 20, minWidth: 20,
                }}
              />
            )}
          </Box>
        </TableCell>
        <TableCell><StatusBadge status={conv.statut} /></TableCell>
        <TableCell align="right">
          <Typography sx={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.base, fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(conv.budget)} MAD
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>{conv.tauxCommission}%</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
            {formatDate(conv.dateDebut)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
            {conv.createdByNom || '-'}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <IconButton size="small" onClick={(e) => onMenuOpen(e, conv)}>
            <MoreVert fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Sous-conventions (collapsed rows) */}
      {hasSousConventions && (
        <TableRow>
          <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Table size="small">
                <TableBody>
                  {conv.sousConventions.map((sc) => (
                    <TableRow
                      key={sc.id}
                      hover
                      onClick={() => onRowClick(sc.id)}
                      sx={{
                        ...componentStyles.listView.dataRow,
                        bgcolor: colors.neutral[25],
                        '&:hover': { bgcolor: colors.primary[25] },
                      }}
                    >
                      <TableCell sx={{ width: 40 }} />
                      <TableCell sx={{ pl: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Description sx={{ fontSize: 16, color: colors.neutral[400] }} />
                          <Box>
                            <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.base }}>
                              {sc.code}
                            </Typography>
                            <RichTextDisplay html={sc.libelle} variant="inline" sx={{ color: colors.textSecondary }} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><StatusBadge status={sc.statut} /></TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontSize: typography.sizes.base, fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(sc.budget)} MAD
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>{sc.tauxCommission}%</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>{formatDate(sc.dateDebut)}</Typography>
                      </TableCell>
                      <TableCell />
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => onMenuOpen(e, sc)}>
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
  )
}

export default ConventionsTableModern
