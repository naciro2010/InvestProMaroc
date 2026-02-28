import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material'
import { Add, Refresh } from '@mui/icons-material'
import AppLayout from '@/components/layout/AppLayout'
import MarchesMapView from '@/components/ui/MarchesMapView'
import { ControlPanel, ExportButton } from '@/components/core'
import ConfirmDialog from '@/components/core/ConfirmDialog'
import { MarcheListTable, type MarcheListItem } from '@/components/marches/list'
import { useToast } from '@/contexts/ToastContext'
import api from '@/lib/api'
import { colors, typography, componentStyles, getStatusConfig } from '@/lib/designSystem'
import { exportToExcel, formatCurrencyForExport } from '@/lib/exportUtils'

const STATUT_FILTERS = ['ALL', 'EN_COURS', 'VALIDE', 'TERMINE', 'SUSPENDU', 'ANNULE'] as const

export default function MarchesPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [marches, setMarches] = useState<MarcheListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatut, setSelectedStatut] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchMarches() }, [])

  const fetchMarches = async () => {
    try {
      setLoading(true)
      const response = await api.get('/marches/list')
      setMarches(response.data)
    } catch {
      showError('Erreur lors du chargement des marches')
    } finally {
      setLoading(false)
    }
  }

  const filteredMarches = marches.filter(m => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (!(
        m.numeroMarche.toLowerCase().includes(q) ||
        m.objet.toLowerCase().includes(q) ||
        m.fournisseurNom.toLowerCase().includes(q) ||
        (m.conventionLibelle?.toLowerCase() ?? '').includes(q)
      )) return false
    }
    if (selectedStatut !== 'ALL' && m.statut !== selectedStatut) return false
    return true
  })

  const handleDelete = (id: number) => setDeleteConfirm({ open: true, id })

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
      sheetName: 'Marches',
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

  const pStart = filteredMarches.length > 0 ? page * rowsPerPage + 1 : 0
  const pEnd = Math.min((page + 1) * rowsPerPage, filteredMarches.length)

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
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
          onSearchChange={(value) => { setSearchTerm(value); setPage(0) }}
          searchPlaceholder="Rechercher par code, objet..."
          paginationInfo={{ currentStart: pStart, currentEnd: pEnd, total: filteredMarches.length }}
          onPreviousPage={() => setPage((prev) => Math.max(0, prev - 1))}
          onNextPage={() => setPage((prev) => prev + 1)}
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode as 'list' | 'map')}
          availableViews={['list', 'map']}
        >
          {STATUT_FILTERS.map((statut) => {
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
                onClick={() => { setSelectedStatut(statut); setPage(0) }}
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

        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3, pt: 2 }}>
          {viewMode === 'map' && (
            <Box sx={{ mt: 2 }}>
              <MarchesMapView marches={filteredMarches} />
            </Box>
          )}

          {viewMode === 'list' && (
            <MarcheListTable
              data={filteredMarches}
              rawData={marches}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={(rpp) => { setRowsPerPage(rpp); setPage(0) }}
              onRowClick={(id) => navigate(`/marches/${id}`)}
              onEdit={(id) => navigate(`/marches/${id}/modifier`)}
              onDelete={handleDelete}
              onConventionClick={(id) => navigate(`/conventions/${id}`)}
            />
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
