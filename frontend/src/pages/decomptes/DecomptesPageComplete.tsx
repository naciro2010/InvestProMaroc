import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material'
import { Plus, RefreshCw, List, LayoutGrid } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import api, { decomptesAPI } from '../../lib/api'
import { ControlPanel, ExportButton } from '../../components/core'
import { colors, typography, componentStyles, getStatusConfig } from '../../lib/designSystem'
import { exportToExcel, formatCurrencyForExport, formatDateForExport } from '../../lib/exportUtils'
import { useTableSort } from '@/hooks/useTableSort'
import { DecompteTable, DecompteFormDialog, DecompteKanbanView } from './components'
import type { Decompte, DecompteFormData } from './components'

const styles = componentStyles.listPage

const INITIAL_FORM_DATA: DecompteFormData = {
  numero: '',
  dateDecompte: new Date().toISOString().split('T')[0],
  montant: 0,
  montantRetenue: 0,
  netAPayer: 0,
  observation: '',
  marcheId: 0,
}

const DecomptesPage = () => {
  const [decomptes, setDecomptes] = useState<Decompte[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDecompte, setSelectedDecompte] = useState<Decompte | null>(null)
  const [formData, setFormData] = useState<DecompteFormData>(INITIAL_FORM_DATA)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  useEffect(() => { loadDecomptes() }, [])

  const loadDecomptes = async () => {
    setLoading(true)
    try {
      const response = await api.get('/decomptes/list')
      setDecomptes(response.data)
    } catch (error) {
      console.error('Erreur chargement décomptes:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => ({
    total: decomptes.length,
    EN_ATTENTE: decomptes.filter(d => d.statut === 'EN_ATTENTE').length,
    VALIDE: decomptes.filter(d => d.statut === 'VALIDE').length,
    REJETE: decomptes.filter(d => d.statut === 'REJETE').length,
    PAYE: decomptes.filter(d => d.statut === 'PAYE').length,
  }), [decomptes])

  const filteredDecomptes = useMemo(() => {
    return decomptes.filter(d => {
      if (searchTerm && !d.numero?.toLowerCase().includes(searchTerm.toLowerCase())) return false
      if (statutFilter !== 'ALL' && d.statut !== statutFilter) return false
      return true
    })
  }, [decomptes, searchTerm, statutFilter])

  const { sortedItems: sortedDecomptes, sortConfig, requestSort } = useTableSort<Decompte>(filteredDecomptes, { key: 'numero', direction: 'asc' })

  const paginatedDecomptes = useMemo(() => {
    const start = page * rowsPerPage
    return sortedDecomptes.slice(start, start + rowsPerPage)
  }, [sortedDecomptes, page, rowsPerPage])

  const handleOpenDialog = (decompte: Decompte | null = null) => {
    if (decompte) {
      setSelectedDecompte(decompte)
      setFormData({
        numero: decompte.numero,
        dateDecompte: decompte.dateDecompte,
        montant: decompte.montant,
        montantRetenue: decompte.montantRetenue,
        netAPayer: decompte.netAPayer,
        observation: decompte.observation || '',
        marcheId: decompte.marcheId,
      })
    } else {
      setSelectedDecompte(null)
      setFormData(INITIAL_FORM_DATA)
    }
    setOpenDialog(true)
  }

  const handleSubmit = async () => {
    try {
      if (selectedDecompte) {
        await decomptesAPI.update(selectedDecompte.id, { ...formData })
      } else {
        await decomptesAPI.create({ ...formData })
      }
      setOpenDialog(false)
      setSelectedDecompte(null)
      loadDecomptes()
    } catch (error) {
      console.error('Erreur sauvegarde décompte:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression ?')) return
    try {
      await decomptesAPI.delete(id)
      loadDecomptes()
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const calculateNetAPayer = () => {
    const net = Math.round(((formData.montant || 0) - (formData.montantRetenue || 0)) * 100) / 100
    setFormData(prev => ({ ...prev, netAPayer: net }))
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' MAD'

  const handleExport = () => {
    const exportData: Record<string, unknown>[] = filteredDecomptes.map(d => ({
      numero: d.numero, dateDecompte: d.dateDecompte, montant: d.montant, netAPayer: d.netAPayer, statut: d.statut,
    }))
    exportToExcel({
      filename: 'decomptes',
      sheetName: 'Décomptes',
      columns: [
        { header: 'Numéro', key: 'numero', width: 18 },
        { header: 'Date', key: 'dateDecompte', width: 16, formatter: formatDateForExport },
        { header: 'Montant Brut (MAD)', key: 'montant', width: 22, formatter: formatCurrencyForExport },
        { header: 'Net à Payer (MAD)', key: 'netAPayer', width: 22, formatter: formatCurrencyForExport },
        { header: 'Statut', key: 'statut', width: 14 },
      ],
      data: exportData,
    })
  }

  const handleCardMove = (itemId: string, _fromCol: string, toCol: string) => {
    setDecomptes(prev => prev.map(d => d.id === Number(itemId) ? { ...d, statut: toCol } : d))
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
          breadcrumbs={[{ label: 'Decomptes' }]}
          actions={
            <>
              <IconButton size="small" onClick={() => setViewMode('list')} sx={{ color: viewMode === 'list' ? colors.primary[600] : colors.textSecondary }}>
                <List size={18} />
              </IconButton>
              <IconButton size="small" onClick={() => setViewMode('kanban')} sx={{ color: viewMode === 'kanban' ? colors.primary[600] : colors.textSecondary }}>
                <LayoutGrid size={18} />
              </IconButton>
              <Button variant="contained" size="small" startIcon={<Plus size={16} />} onClick={() => handleOpenDialog()} sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.75 }}>
                Nouveau
              </Button>
              <ExportButton onClick={handleExport} />
              <IconButton size="small" onClick={loadDecomptes} sx={{ color: colors.textSecondary }}>
                <RefreshCw size={16} />
              </IconButton>
            </>
          }
          searchValue={searchTerm}
          onSearchChange={(value: string) => { setSearchTerm(value); setPage(0) }}
          searchPlaceholder="Rechercher par numero, marche..."
          paginationInfo={{
            currentStart: filteredDecomptes.length === 0 ? 0 : page * rowsPerPage + 1,
            currentEnd: Math.min((page + 1) * rowsPerPage, filteredDecomptes.length),
            total: filteredDecomptes.length,
          }}
          onPreviousPage={() => setPage(prev => Math.max(0, prev - 1))}
          onNextPage={() => setPage(prev => prev + 1)}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {(['ALL', 'EN_ATTENTE', 'VALIDE', 'REJETE', 'PAYE'] as const).map((statut) => {
              const count = statut === 'ALL' ? decomptes.length : (stats[statut as keyof typeof stats] || 0)
              const isActive = statutFilter === statut
              const lps = componentStyles.listPage
              return (
                <Chip
                  key={statut}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{statut === 'ALL' ? 'Tous' : getStatusConfig(statut).label}</span>
                      <Box component="span" sx={isActive ? lps.countBadge : lps.countBadgeInactive}>{count}</Box>
                    </Box>
                  }
                  onClick={() => { setStatutFilter(statut); setPage(0) }}
                  sx={isActive ? lps.filterPillActive : lps.filterPill}
                />
              )
            })}
          </Box>
        </ControlPanel>

        <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
          {viewMode === 'list' ? (
            <DecompteTable
              decomptes={paginatedDecomptes}
              sortConfig={sortConfig}
              requestSort={requestSort}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={filteredDecomptes.length}
              onPageChange={setPage}
              onRowsPerPageChange={(rpp) => { setRowsPerPage(rpp); setPage(0) }}
              formatCurrency={formatCurrency}
            />
          ) : (
            <DecompteKanbanView
              decomptes={filteredDecomptes}
              onCardMove={handleCardMove}
              formatCurrency={formatCurrency}
            />
          )}
        </Box>

        <DecompteFormDialog
          open={openDialog}
          onClose={() => { setOpenDialog(false); setSelectedDecompte(null) }}
          onSubmit={handleSubmit}
          selectedDecompte={selectedDecompte}
          formData={formData}
          onFormDataChange={setFormData}
          onCalculateNet={calculateNetAPayer}
        />
      </Box>
    </AppLayout>
  )
}

export default DecomptesPage
