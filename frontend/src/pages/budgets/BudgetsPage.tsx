import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  CircularProgress,
  InputAdornment,
} from '@mui/material'
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material'
import AppLayout from '../../components/layout/AppLayout'
import { budgetsAPI } from '../../lib/api'
import type { Budget, StatutBudget } from '../../types/entities'
import { colors, typography, componentStyles, getStatusConfig } from '../../lib/designSystem'

// Styles from design system
const styles = componentStyles.listPage

// Status Badge utilisant le design system
const StatusBadge = ({ status }: { status: string }) => {
  const config = getStatusConfig(status)
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: '4px',
        bgcolor: config.bgColor,
        color: config.textColor,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.semibold,
      }}
    >
      {config.label}
    </Box>
  )
}

export default function BudgetsPage() {
  const navigate = useNavigate()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')

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
    } catch (error) {
      console.error('Erreur chargement budgets:', error)
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

  // Pagination
  const paginatedBudgets = useMemo(() => {
    const start = page * rowsPerPage
    return filteredBudgets.slice(start, start + rowsPerPage)
  }, [filteredBudgets, page, rowsPerPage])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(amount / 1000000) + ' M'
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-MA')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmer la suppression de ce budget ?')) return
    try {
      await budgetsAPI.delete(id)
      fetchBudgets()
    } catch (error) {
      console.error('Erreur suppression:', error)
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

  return (
    <AppLayout>
      <Box sx={styles.container}>
        {/* Header */}
        <Box sx={styles.header}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={styles.title}>Budgets</Typography>
              <Typography sx={styles.subtitle}>
                Gestion des budgets avec versions (V0, V1, V2...)
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/budgets/nouveau')}
              sx={{ textTransform: 'none', fontWeight: typography.weights.semibold }}
            >
              Nouveau Budget
            </Button>
          </Box>
        </Box>

        {/* Toolbar avec filtres */}
        <Box sx={styles.toolbar}>
          <TextField
            placeholder="Rechercher par version, convention..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            size="small"
            sx={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: colors.textSecondary, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['ALL', 'BROUILLON', 'SOUMIS', 'VALIDE', 'REJETE', 'ARCHIVE'].map((statut) => {
              const count = statut === 'ALL' ? budgets.length : (stats[statut as keyof typeof stats] || 0)
              const isActive = statutFilter === statut
              return (
                <Chip
                  key={statut}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{statut === 'ALL' ? 'Tous' : getStatusConfig(statut).label}</span>
                      <Box component="span" sx={styles.countBadge}>{count}</Box>
                    </Box>
                  }
                  onClick={() => { setStatutFilter(statut); setPage(0); }}
                  sx={isActive ? styles.filterPillActive : styles.filterPill}
                />
              )
            })}
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={styles.tableContainer}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={styles.tableHeader}>
                    <TableCell>Version</TableCell>
                    <TableCell>Convention</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Plafond</TableCell>
                    <TableCell align="right">Total Budget</TableCell>
                    <TableCell align="right">Delta</TableCell>
                    <TableCell align="center">Statut</TableCell>
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
                        sx={styles.tableRowClickable}
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
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/budgets/${budget.id}`)}
                              sx={{ color: colors.neutral[500] }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/budgets/${budget.id}/modifier`)}
                              sx={{ color: colors.neutral[500] }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(budget.id)}
                              sx={{ color: colors.danger[500] }}
                            >
                              <Delete fontSize="small" />
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
        </Box>
      </Box>
    </AppLayout>
  )
}
