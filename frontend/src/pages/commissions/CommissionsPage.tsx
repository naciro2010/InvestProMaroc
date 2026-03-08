import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  MenuItem,
  TextField,
} from '@mui/material'
import { Calculator, RefreshCw } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { ControlPanel, ExportButton } from '@/components/core'
import api from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { exportToExcel, formatCurrencyForExport } from '@/lib/exportUtils'

interface Commission {
  id: number
  dateCalcul: string
  baseCalcul: string
  montantBase: number
  tauxCommission: number
  tauxTva: number
  montantCommissionHt: number
  montantTvaCommission: number
  montantCommissionTtc: number
  depense?: {
    id: number
    numeroFacture: string
    fournisseur?: {
      raisonSociale: string
    }
  }
  convention?: {
    id: number
    numero: string
    libelle: string
  }
}

const styles = componentStyles.listPage
const listStyles = componentStyles.listView

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear())
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  useEffect(() => { fetchCommissions() }, [yearFilter])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/commissions', { params: { year: yearFilter } })
      setCommissions(response.data)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur chargement commissions:', msg)
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const montantHt = commissions.reduce((s, c) => s + c.montantCommissionHt, 0)
    const montantTva = commissions.reduce((s, c) => s + c.montantTvaCommission, 0)
    const montantTtc = commissions.reduce((s, c) => s + c.montantCommissionTtc, 0)
    return { total: commissions.length, montantHt, montantTva, montantTtc }
  }, [commissions])

  const filteredCommissions = useMemo(() => {
    if (!searchTerm) return commissions
    const q = searchTerm.toLowerCase()
    return commissions.filter(c =>
      c.depense?.numeroFacture?.toLowerCase().includes(q) ||
      c.depense?.fournisseur?.raisonSociale?.toLowerCase().includes(q) ||
      c.convention?.numero?.toLowerCase().includes(q) ||
      c.convention?.libelle?.toLowerCase().includes(q)
    )
  }, [commissions, searchTerm])

  const paginatedCommissions = useMemo(() => {
    const start = page * rowsPerPage
    return filteredCommissions.slice(start, start + rowsPerPage)
  }, [filteredCommissions, page, rowsPerPage])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' MAD'

  const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '-'

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const handleExport = () => {
    const exportData: Record<string, unknown>[] = filteredCommissions.map(c => ({
      date: c.dateCalcul,
      facture: c.depense?.numeroFacture || '-',
      fournisseur: c.depense?.fournisseur?.raisonSociale || '-',
      convention: c.convention?.numero || '-',
      base: c.montantBase,
      taux: c.tauxCommission,
      montantHt: c.montantCommissionHt,
      tva: c.montantTvaCommission,
      montantTtc: c.montantCommissionTtc,
    }))
    exportToExcel({
      filename: 'commissions',
      sheetName: 'Commissions',
      columns: [
        { header: 'Date', key: 'date', width: 14 },
        { header: 'Facture', key: 'facture', width: 18 },
        { header: 'Fournisseur', key: 'fournisseur', width: 25 },
        { header: 'Convention', key: 'convention', width: 18 },
        { header: 'Base (MAD)', key: 'base', width: 20, formatter: formatCurrencyForExport },
        { header: 'Taux (%)', key: 'taux', width: 12 },
        { header: 'Montant HT (MAD)', key: 'montantHt', width: 20, formatter: formatCurrencyForExport },
        { header: 'TVA (MAD)', key: 'tva', width: 18, formatter: formatCurrencyForExport },
        { header: 'Montant TTC (MAD)', key: 'montantTtc', width: 20, formatter: formatCurrencyForExport },
      ],
      data: exportData,
    })
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

  const pStart = filteredCommissions.length > 0 ? page * rowsPerPage + 1 : 0
  const pEnd = Math.min((page + 1) * rowsPerPage, filteredCommissions.length)

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: colors.background }}>
        <ControlPanel
          breadcrumbs={[{ label: 'Commissions' }]}
          actions={
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<Calculator size={16} />}
                onClick={() => alert('Calcul automatique des commissions (a implementer)')}
                sx={{ ...componentStyles.buttonPrimary, fontSize: typography.sizes.sm, py: 0.75 }}
              >
                Calculer
              </Button>
              <ExportButton onClick={handleExport} />
              <IconButton size="small" onClick={fetchCommissions} sx={{ color: colors.textSecondary }}>
                <RefreshCw size={16} />
              </IconButton>
            </>
          }
          searchValue={searchTerm}
          onSearchChange={(v) => { setSearchTerm(v); setPage(0) }}
          searchPlaceholder="Rechercher par facture, fournisseur, convention..."
          paginationInfo={filteredCommissions.length > 0 ? { currentStart: pStart, currentEnd: pEnd, total: filteredCommissions.length } : undefined}
          onPreviousPage={() => setPage(p => Math.max(0, p - 1))}
          onNextPage={() => setPage(p => p + 1)}
        >
          <TextField
            select
            size="small"
            value={yearFilter.toString()}
            onChange={(e) => { setYearFilter(parseInt(e.target.value)); setPage(0) }}
            sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { fontSize: typography.sizes.sm } }}
          >
            {years.map(y => <MenuItem key={y} value={y.toString()}>{y}</MenuItem>)}
          </TextField>
          {!loading && (
            <Chip
              label={`${stats.total} commissions — HT: ${(stats.montantHt / 1000000).toFixed(2)}M — TTC: ${(stats.montantTtc / 1000000).toFixed(2)}M`}
              size="small"
              sx={{ bgcolor: colors.neutral[100], color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, height: 24, ml: 'auto' }}
            />
          )}
        </ControlPanel>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={listStyles.container}>
            <TableContainer>
              <Table size="small" sx={listStyles.table}>
                <TableHead>
                  <TableRow sx={listStyles.headerRow}>
                    <TableCell>Date</TableCell>
                    <TableCell>Facture</TableCell>
                    <TableCell>Fournisseur</TableCell>
                    <TableCell>Convention</TableCell>
                    <TableCell align="right">Base</TableCell>
                    <TableCell align="right">Taux</TableCell>
                    <TableCell align="right">Montant HT</TableCell>
                    <TableCell align="right">TVA</TableCell>
                    <TableCell align="right">Montant TTC</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedCommissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                        <Typography sx={{ color: colors.textSecondary }}>Aucune commission trouvee</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCommissions.map((c) => (
                      <TableRow key={c.id} sx={listStyles.dataRow}>
                        <TableCell sx={{ color: colors.textSecondary }}>{formatDate(c.dateCalcul)}</TableCell>
                        <TableCell sx={{ fontWeight: typography.weights.medium }}>{c.depense?.numeroFacture || '-'}</TableCell>
                        <TableCell>{c.depense?.fournisseur?.raisonSociale || '-'}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: typography.sizes.sm }}>{c.convention?.numero || '-'}</Typography>
                          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{c.convention?.libelle || ''}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontSize: typography.sizes.sm }}>{formatCurrency(c.montantBase)}</Typography>
                          <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>{c.baseCalcul}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: typography.weights.semibold, color: colors.success[600] }}>
                          {c.tauxCommission}%
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: typography.weights.bold }}>
                          {formatCurrency(c.montantCommissionHt)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: colors.textSecondary }}>
                          {formatCurrency(c.montantTvaCommission)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: typography.weights.bold, color: colors.info[600] }}>
                          {formatCurrency(c.montantCommissionTtc)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredCommissions.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
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
