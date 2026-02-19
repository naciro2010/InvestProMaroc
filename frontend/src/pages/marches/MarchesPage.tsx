import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  IconButton,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
} from '@mui/material'
import {
  Add,
  Visibility,
  Edit,
  Delete,
  Refresh,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import MarchesMapView from '../../components/ui/MarchesMapView'
import { ControlPanel, StatusBadge, ExportButton } from '../../components/core'
import ConfirmDialog from '../../components/core/ConfirmDialog'
import { useToast } from '../../contexts/ToastContext'
import api from '../../lib/api'
import { colors, typography, componentStyles, getStatusConfig } from '../../lib/designSystem'
import RichTextDisplay from '../../components/ui/RichTextDisplay'
import { exportToExcel, formatCurrencyForExport } from '../../lib/exportUtils'
import { useTableSort } from '@/hooks/useTableSort'
import {
  SortableTableRow,
  useSortableTable,
  DndContext,
  SortableContext,
  verticalListSortingStrategy,
  closestCenter,
} from '../../components/core/SortableTable'

// Interface correspondant exactement au MarcheListDTO du backend
interface MarcheListItem {
  id: number
  numeroMarche: string
  numAo: string | null
  dateMarche: string
  fournisseurId: number
  fournisseurCode: string
  fournisseurNom: string
  fournisseurIce: string | null
  conventionId: number | null
  conventionNumero: string | null
  conventionLibelle: string | null
  objet: string
  typeMarche: string
  naturePrestation: string
  montantHt: number
  tauxTva: number
  montantTva: number
  montantTtc: number
  statut: string
  dateDebut: string | null
  dateFinPrevue: string | null
  delaiExecutionMois: number | null
  adresse: string | null
  latitude: number | null
  longitude: number | null
  zoneGeographique: string | null
  nbLignes: number
  nbAvenants: number
  nbDecomptes: number
  actif: boolean
}

// Styles from design system
const listStyles = componentStyles.listView

export default function MarchesPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [rawMarches, setRawMarches] = useState<MarcheListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatut, setSelectedStatut] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Drag & drop avec persistance localStorage
  const {
    items: marches,
    sensors,
    handleDragEnd,
  } = useSortableTable({
    initialItems: rawMarches,
    idKey: 'id',
    storageKey: 'marches-order',
  })

  useEffect(() => {
    fetchMarches()
  }, [])

  const fetchMarches = async () => {
    try {
      setLoading(true)
      // Use optimized /list endpoint instead of full /marches endpoint
      // This follows micro-frontends pattern: each component loads only what it needs
      const response = await api.get('/marches/list')
      setRawMarches(response.data)
    } catch {
      showError('Erreur lors du chargement des marches')
    } finally {
      setLoading(false)
    }
  }

  // Filtre les marchés (calcul dérivé, pas de state)
  const filteredMarches = marches.filter(m => {
    // Filtre par recherche
    if (searchTerm) {
      const query = searchTerm.toLowerCase()
      if (!(
        m.numeroMarche.toLowerCase().includes(query) ||
        m.objet.toLowerCase().includes(query) ||
        m.fournisseurNom.toLowerCase().includes(query) ||
        (m.conventionLibelle?.toLowerCase() ?? '').includes(query)
      )) {
        return false
      }
    }

    // Filtre par statut
    if (selectedStatut !== 'ALL' && m.statut !== selectedStatut) {
      return false
    }

    return true
  })

  const { sortedItems: sortedMarches, sortConfig, requestSort } = useTableSort<MarcheListItem>(filteredMarches, { key: 'numeroMarche', direction: 'asc' })

  const handleDelete = (id: number) => {
    setDeleteConfirm({ open: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      await api.delete(`/marches/${deleteConfirm.id}`)
      showSuccess('Marche supprime avec succes')
      fetchMarches()
    } catch {
      showError('Erreur lors de la suppression')
    } finally {
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount)
  }

  // Pagination des marchés filtrés et triés
  const paginatedMarches = useMemo(() => {
    const start = page * rowsPerPage
    return sortedMarches.slice(start, start + rowsPerPage)
  }, [sortedMarches, page, rowsPerPage])

  // Export handler
  const handleExport = () => {
    const exportData: Record<string, unknown>[] = filteredMarches.map(m => ({
      numeroMarche: m.numeroMarche,
      objet: m.objet,
      montantHt: m.montantHt,
      montantTtc: m.montantTtc,
      convention: m.conventionNumero || m.conventionLibelle || '-',
      statut: m.statut,
    }))
    exportToExcel({
      filename: 'marches',
      sheetName: 'Marchés',
      columns: [
        { header: 'Code', key: 'numeroMarche', width: 18 },
        { header: 'Objet', key: 'objet', width: 35 },
        { header: 'Montant HT (MAD)', key: 'montantHt', width: 22, formatter: formatCurrencyForExport },
        { header: 'Montant TTC (MAD)', key: 'montantTtc', width: 22, formatter: formatCurrencyForExport },
        { header: 'Convention', key: 'convention', width: 20 },
        { header: 'Statut', key: 'statut', width: 14 },
      ],
      data: exportData,
    })
  }

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={40} />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.neutral[50] }}>
        <ControlPanel
          breadcrumbs={[{ label: 'Marches' }]}
          actions={
            <>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/marches/nouveau')}
                sx={componentStyles.buttonPrimary}
              >
                Nouveau Marche
              </Button>
              <ExportButton onClick={handleExport} />
              <IconButton size="small" onClick={fetchMarches} sx={{ color: colors.textSecondary }}>
                <Refresh fontSize="small" />
              </IconButton>
            </>
          }
          searchValue={searchTerm}
          onSearchChange={(value) => { setSearchTerm(value); setPage(0); }}
          searchPlaceholder="Rechercher par code, objet..."
          paginationInfo={{
            currentStart: filteredMarches.length === 0 ? 0 : page * rowsPerPage + 1,
            currentEnd: Math.min((page + 1) * rowsPerPage, filteredMarches.length),
            total: filteredMarches.length,
          }}
          onPreviousPage={() => setPage((prev) => Math.max(0, prev - 1))}
          onNextPage={() => setPage((prev) => prev + 1)}
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode as 'list' | 'map')}
          availableViews={['list', 'map']}
        >
          {/* Status filter chips */}
          {['ALL', 'EN_COURS', 'VALIDE', 'TERMINE', 'SUSPENDU', 'ANNULE'].map((statut) => {
            const count = statut === 'ALL' ? marches.length : marches.filter(m => m.statut === statut).length
            const isActive = selectedStatut === statut
            return (
              <Chip
                key={statut}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{statut === 'ALL' ? 'Tous' : getStatusConfig(statut).label}</span>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 20,
                        height: 18,
                        borderRadius: '9px',
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.bold,
                        px: 0.5,
                        bgcolor: isActive ? 'rgba(255,255,255,0.3)' : colors.neutral[200],
                        color: isActive ? 'inherit' : colors.textSecondary,
                      }}
                    >
                      {count}
                    </Box>
                  </Box>
                }
                size="small"
                onClick={() => { setSelectedStatut(statut); setPage(0); }}
                sx={isActive ? componentStyles.controlPanel.filterTag : {
                  bgcolor: colors.neutral[50],
                  color: colors.textSecondary,
                  border: `1px solid ${colors.neutral[300]}`,
                  borderRadius: '6px',
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: colors.neutral[100] },
                }}
              />
            )
          })}
        </ControlPanel>

        {/* Main Content Area */}
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3, pt: 2 }}>
          {/* Map View */}
          {viewMode === 'map' && (
            <Box sx={{ mt: 2 }}>
              <MarchesMapView marches={filteredMarches} />
            </Box>
          )}

          {/* Table View */}
          {viewMode === 'list' && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Box sx={listStyles.container}>
                <TableContainer>
                  <SortableContext items={paginatedMarches.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    <Table size="small" sx={listStyles.table}>
                      <TableHead>
                        <TableRow sx={listStyles.headerRow}>
                          <TableCell sx={{ width: 40, p: '8px' }} />
                          <TableCell sortDirection={sortConfig?.key === 'numeroMarche' ? sortConfig.direction : false}>
                            <TableSortLabel active={sortConfig?.key === 'numeroMarche'} direction={sortConfig?.key === 'numeroMarche' ? sortConfig.direction : 'asc'} onClick={() => requestSort('numeroMarche')}>N° Marché</TableSortLabel>
                          </TableCell>
                          <TableCell>N° AO</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell sortDirection={sortConfig?.key === 'objet' ? sortConfig.direction : false}>
                            <TableSortLabel active={sortConfig?.key === 'objet'} direction={sortConfig?.key === 'objet' ? sortConfig.direction : 'asc'} onClick={() => requestSort('objet')}>Objet</TableSortLabel>
                          </TableCell>
                          <TableCell>Fournisseur</TableCell>
                          <TableCell>Convention</TableCell>
                          <TableCell align="right" sortDirection={sortConfig?.key === 'montantTtc' ? sortConfig.direction : false}>
                            <TableSortLabel active={sortConfig?.key === 'montantTtc'} direction={sortConfig?.key === 'montantTtc' ? sortConfig.direction : 'asc'} onClick={() => requestSort('montantTtc')}>Montant TTC</TableSortLabel>
                          </TableCell>
                          <TableCell align="center">Lignes</TableCell>
                          <TableCell align="center" sortDirection={sortConfig?.key === 'statut' ? sortConfig.direction : false}>
                            <TableSortLabel active={sortConfig?.key === 'statut'} direction={sortConfig?.key === 'statut' ? sortConfig.direction : 'asc'} onClick={() => requestSort('statut')}>Statut</TableSortLabel>
                          </TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedMarches.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                              <Typography sx={{ color: colors.textSecondary }}>Aucun marché trouvé</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedMarches.map((marche) => (
                            <SortableTableRow
                              key={marche.id}
                              id={marche.id}
                              sx={listStyles.dataRow}
                            >
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                sx={{ cursor: 'pointer', fontWeight: typography.weights.medium, color: colors.primary[700] }}
                              >
                                {marche.numeroMarche}
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                sx={{ cursor: 'pointer', color: colors.textSecondary }}
                              >
                                {marche.numAo || '-'}
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                sx={{ cursor: 'pointer' }}
                              >
                                <StatusBadge status={marche.typeMarche || 'MARCHE'} size="small" />
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                sx={{ cursor: 'pointer', maxWidth: 280 }}
                              >
                                <RichTextDisplay html={marche.objet} variant="inline" sx={{ maxWidth: 280 }} />
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                sx={{ cursor: 'pointer' }}
                              >
                                {marche.fournisseurNom}
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                {marche.conventionId ? (
                                  <Box
                                    component="span"
                                    onClick={() => navigate(`/conventions/${marche.conventionId}`)}
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      cursor: 'pointer',
                                      color: colors.primary[700],
                                      fontWeight: typography.weights.medium,
                                      fontSize: typography.sizes.sm,
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: '4px',
                                      '&:hover': {
                                        bgcolor: colors.primary[50],
                                        textDecoration: 'underline',
                                      },
                                    }}
                                  >
                                    {marche.conventionNumero || marche.conventionLibelle || '-'}
                                  </Box>
                                ) : (
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: '4px',
                                      bgcolor: colors.neutral[100],
                                      color: colors.textSecondary,
                                      fontSize: typography.sizes.xs,
                                      fontWeight: typography.weights.medium,
                                    }}
                                  >
                                    Aucune
                                  </Box>
                                )}
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                align="right"
                                sx={{ cursor: 'pointer', fontWeight: typography.weights.semibold, color: colors.primary[700] }}
                              >
                                {formatCurrency(marche.montantTtc)}
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                align="center"
                                sx={{ cursor: 'pointer' }}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 24,
                                    height: 24,
                                    borderRadius: '6px',
                                    bgcolor: colors.primary[100],
                                    color: colors.primary[700],
                                    fontWeight: typography.weights.semibold,
                                    fontSize: typography.sizes.xs,
                                    px: 1,
                                  }}
                                >
                                  {marche.nbLignes}
                                </Box>
                              </TableCell>
                              <TableCell
                                onClick={() => navigate(`/marches/${marche.id}`)}
                                align="center"
                                sx={{ cursor: 'pointer' }}
                              >
                                <StatusBadge status={marche.statut} />
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/marches/${marche.id}`)}
                                    sx={{ color: colors.neutral[500] }}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/marches/${marche.id}/modifier`)}
                                    sx={{ color: colors.neutral[500] }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(marche.id)}
                                    sx={{ color: colors.danger[500] }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </SortableTableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </SortableContext>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredMarches.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10))
                    setPage(0)
                  }}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  labelRowsPerPage="Lignes par page"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                />
              </Box>
            </DndContext>
          )}
        </Box>
      </Box>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Supprimer le marche"
        message="Cette action est irreversible. Voulez-vous continuer ?"
        variant="danger"
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </AppLayout>
  )
}
