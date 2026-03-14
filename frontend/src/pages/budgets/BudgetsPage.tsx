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
  TableSortLabel,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material'
import { Plus, RefreshCw, Eye, Edit2, Trash2, List, LayoutGrid } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, StatusBadge, ExportButton } from '@/components/core'
import { budgetsAPI } from '@/lib/api'
import type { Budget, StatutBudget } from '@/types/entities'
import { colors, typography, componentStyles, getStatusConfig } from '@/lib/designSystem'
import { useTableSort } from '@/hooks/useTableSort'
import { BudgetKanbanView } from './components'

// Styles from design system
const styles = componentStyles.listPage
const listStyles = componentStyles.listView

export default function BudgetsPage() {
  const navigate = useNavigate()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await budgetsAPI.getAll()
      setBudgets(response.data.data || response.data || [])
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur chargement budgets:', msg)
    } finally {
      setLoading(false)
    }
  }

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: budgets.length,
      BROUILLON: budgets.filter(b => b.statut === 'BROUILLON').length,
      SOUMIS: budgets.filter(b => b.statut === 'SOUMIS').length,
      VALIDE: budgets.filter(b => b.statut === 'VALIDE').length,
      REJETE: budgets.filter(b => b.statut === 'REJETE').length,
      ARCHIVE: budgets.filter(b => b.statut === 'ARCHIVE').length,
    }
  }, [budgets])

  // Filtrage
  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      const query = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm ||
        budget.version.toLowerCase().includes(query) ||
        (budget.convention?.code?.toLowerCase() ?? '').includes(query) ||
        (budget.convention?.libelle?.toLowerCase() ?? '').includes(query)
      const matchesStatut = statutFilter === 'ALL' || budget.statut === statutFilter
      return matchesSearch && matchesStatut
    })
  }, [budgets, searchTerm, statutFilter])

  const { sortedItems: sortedBudgets, sortConfig, requestSort } = useTableSort<Budget>(filteredBudgets, { key: 'version', direction: 'asc' })

  // Pagination
  const paginatedBudgets = useMemo(() => {
    const start = page * rowsPerPage
    return sortedBudgets.slice(start, start + rowsPerPage)
  }, [sortedBudgets, page, rowsPerPage])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(amount / 1000000) + ' M'
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression de ce budget ?')) return
    try {
      await budgetsAPI.delete(id)
      fetchBudgets()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur suppression:', msg)
    }
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

  const paginationStart = sortedBudgets.length > 0 ? page * rowsPerPage + 1 : 0
  const paginationEnd = Math.min((page + 1) * rowsPerPage, sortedBudgets.length)

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        {/* Control Panel */}
        <ControlPanel
          breadcrumbs={[{ label: 'Budgets' }]}
          actions={
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => navigate('/budgets/nouveau')}
                sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.75 }}
              >
                Nouveau Budget
              </Button>
              <Box sx={{ display: 'flex', border: `1px solid ${colors.border}`, borderRadius: 1, overflow: 'hidden' }}>
                <IconButton size="small" onClick={() => setViewMode('list')} sx={{ borderRadius: 0, bgcolor: viewMode === 'list' ? colors.primary[50] : 'transparent', color: viewMode === 'list' ? colors.primary[600] : colors.textSecondary }}>
                  <List size={16} />
                </IconButton>
                <IconButton size="small" onClick={() => setViewMode('kanban')} sx={{ borderRadius: 0, bgcolor: viewMode === 'kanban' ? colors.primary[50] : 'transparent', color: viewMode === 'kanban' ? colors.primary[600] : colors.textSecondary }}>
                  <LayoutGrid size={16} />
                </IconButton>
              </Box>
              <IconButton size="small" onClick={fetchBudgets} sx={{ color: colors.textSecondary }}>
                <RefreshCw size={16} />
              </IconButton>
            </>
          }
          searchValue={searchTerm}
          onSearchChange={(value: string) => { setSearchTerm(value); setPage(0); }}
          searchPlaceholder="Rechercher par convention, exercice..."
          paginationInfo={sortedBudgets.length > 0 ? {
            currentStart: paginationStart,
            currentEnd: paginationEnd,
            total: sortedBudgets.length,
          } : undefined}
          onPreviousPage={() => setPage(p => Math.max(0, p - 1))}
          onNextPage={() => setPage(p => p + 1)}
        >
          {/* Status filter chips */}
          {(['ALL', 'BROUILLON', 'SOUMIS', 'VALIDE', 'REJETE', 'ARCHIVE'] as const).map((statut) => {
            const count = statut === 'ALL' ? budgets.length : (stats[statut as keyof typeof stats] || 0)
            const isActive = statutFilter === statut
            return (
              <Chip
                key={statut}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <span>{statut === 'ALL' ? 'Tous' : getStatusConfig(statut).label}</span>
                    <Box component="span" sx={isActive ? styles.countBadge : styles.countBadgeInactive}>{count}</Box>
                  </Box>
                }
                size="small"
                onClick={() => { setStatutFilter(statut); setPage(0); }}
                sx={isActive ? styles.filterPillActive : styles.filterPill}
              />
            )
          })}
        </ControlPanel>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <BudgetKanbanView
            budgets={filteredBudgets}
            onCardMove={() => { /* Status change via DnD - could implement API call */ }}
            formatCurrency={formatCurrency}
            onBudgetClick={(id) => navigate(`/budgets/${id}`)}
          />
        )}

        {/* List View */}
        {viewMode === 'list' && <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={listStyles.container}>
            <TableContainer>
              <Table size="small" sx={listStyles.table}>
                <TableHead>
                  <TableRow sx={listStyles.headerRow}>
                    <TableCell sortDirection={sortConfig?.key === 'version' ? sortConfig.direction : false}>
                      <TableSortLabel active={sortConfig?.key === 'version'} direction={sortConfig?.key === 'version' ? sortConfig.direction : 'asc'} onClick={() => requestSort('version')}>Version</TableSortLabel>
                    </TableCell>
                    <TableCell>Convention</TableCell>
                    <TableCell sortDirection={sortConfig?.key === 'dateBudget' ? sortConfig.direction : false}>
                      <TableSortLabel active={sortConfig?.key === 'dateBudget'} direction={sortConfig?.key === 'dateBudget' ? sortConfig.direction : 'asc'} onClick={() => requestSort('dateBudget')}>Date</TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={sortConfig?.key === 'plafondConvention' ? sortConfig.direction : false}>
                      <TableSortLabel active={sortConfig?.key === 'plafondConvention'} direction={sortConfig?.key === 'plafondConvention' ? sortConfig.direction : 'asc'} onClick={() => requestSort('plafondConvention')}>Plafond</TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sortDirection={sortConfig?.key === 'totalBudget' ? sortConfig.direction : false}>
                      <TableSortLabel active={sortConfig?.key === 'totalBudget'} direction={sortConfig?.key === 'totalBudget' ? sortConfig.direction : 'asc'} onClick={() => requestSort('totalBudget')}>Total Budget</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Delta</TableCell>
                    <TableCell align="center" sortDirection={sortConfig?.key === 'statut' ? sortConfig.direction : false}>
                      <TableSortLabel active={sortConfig?.key === 'statut'} direction={sortConfig?.key === 'statut' ? sortConfig.direction : 'asc'} onClick={() => requestSort('statut')}>Statut</TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedBudgets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Typography sx={{ color: colors.textSecondary }}>Aucun budget trouvé</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBudgets.map((budget) => (
                      <TableRow
                        key={budget.id}
                        sx={listStyles.dataRow}
                        onClick={() => navigate(`/budgets/${budget.id}`)}
                      >
                        <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
                          {budget.version}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {budget.convention ? (
                            <Box
                              component="span"
                              onClick={() => navigate(`/conventions/${budget.convention.id}`)}
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.75,
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
                              {budget.convention.code || budget.convention.libelle}
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
                              Aucune convention
                            </Box>
                          )}
                        </TableCell>
                        <TableCell sx={{ color: colors.textSecondary }}>
                          {formatDate(budget.dateBudget)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: typography.weights.medium }}>
                          {formatCurrency(budget.plafondConvention)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: typography.weights.semibold }}>
                          {formatCurrency(budget.totalBudget)}
                        </TableCell>
                        <TableCell align="right">
                          {budget.deltaMontant && (
                            <Typography
                              component="span"
                              sx={{
                                color: budget.deltaMontant > 0 ? colors.success[600] : colors.danger[600],
                                fontWeight: typography.weights.medium,
                                fontSize: typography.sizes.sm,
                              }}
                            >
                              {budget.deltaMontant > 0 ? '+' : ''}{formatCurrency(budget.deltaMontant)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <StatusBadge status={budget.statut} />
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton size="small" onClick={() => navigate(`/budgets/${budget.id}`)} sx={{ color: colors.neutral[500] }}>
                              <Eye size={14} />
                            </IconButton>
                            <IconButton size="small" onClick={() => navigate(`/budgets/${budget.id}`)} sx={{ color: colors.neutral[500] }}>
                              <Edit2 size={14} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(budget.id)} sx={{ color: colors.danger[500] }}>
                              <Trash2 size={14} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredBudgets.length}
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
        </Box>}
      </Box>
    </AppLayout>
  )
}
