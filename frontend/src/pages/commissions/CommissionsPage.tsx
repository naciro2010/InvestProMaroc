import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material'
import { Search, Calculator } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeader } from '../../components/core'
import api from '../../lib/api'
import { colors, typography, componentStyles } from '../../lib/designSystem'

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

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear())

  const [stats, setStats] = useState({
    total: 0,
    montantTotal: 0,
    montantTvaTotal: 0,
    montantTtcTotal: 0,
  })

  useEffect(() => {
    fetchCommissions()
  }, [yearFilter])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/commissions', {
        params: { year: yearFilter },
      })
      const data = response.data
      setCommissions(data)

      const montantTotal = data.reduce((sum: number, c: Commission) => sum + c.montantCommissionHt, 0)
      const montantTvaTotal = data.reduce((sum: number, c: Commission) => sum + c.montantTvaCommission, 0)
      const montantTtcTotal = data.reduce((sum: number, c: Commission) => sum + c.montantCommissionTtc, 0)

      setStats({
        total: data.length,
        montantTotal,
        montantTvaTotal,
        montantTtcTotal,
      })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur lors du chargement des commissions:', msg)
    } finally {
      setLoading(false)
    }
  }

  const filteredCommissions = commissions.filter((commission) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      commission.depense?.numeroFacture.toLowerCase().includes(searchLower) ||
      commission.depense?.fournisseur?.raisonSociale.toLowerCase().includes(searchLower) ||
      commission.convention?.numero.toLowerCase().includes(searchLower) ||
      commission.convention?.libelle.toLowerCase().includes(searchLower)
    )
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={componentStyles.pageBackground}>
        <PageHeader
          title="Commissions d'Intervention"
          breadcrumbs={[
            { label: 'Accueil', path: '/dashboard' },
            { label: 'Commissions' },
          ]}
          actions={
            <Button
              variant="contained"
              startIcon={<Calculator size={18} />}
              sx={componentStyles.buttonPrimary}
              onClick={() => alert('Calcul automatique des commissions (à implémenter)')}
            >
              Calculer Commissions
            </Button>
          }
        />

        <Box sx={{ p: 3 }}>
          {/* Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            {[
              { label: 'Total Commissions', value: stats.total.toString(), color: colors.textPrimary },
              { label: 'Montant HT', value: formatCurrency(stats.montantTotal), color: colors.success[600] },
              { label: 'TVA', value: formatCurrency(stats.montantTvaTotal), color: colors.warning[600] },
              { label: 'Montant TTC', value: formatCurrency(stats.montantTtcTotal), color: colors.info[600] },
            ].map((stat) => (
              <Box key={stat.label} sx={componentStyles.statCard}>
                <Box sx={{ p: 2.5 }}>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary, mb: 0.5 }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: stat.color }}>
                    {stat.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Toolbar */}
          <Box sx={{ ...componentStyles.card, p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher par facture, fournisseur, ou convention..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 280 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Année</InputLabel>
              <Select
                value={yearFilter.toString()}
                label="Année"
                onChange={(e: SelectChangeEvent) => setYearFilter(parseInt(e.target.value))}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Table */}
          <TableContainer sx={componentStyles.table.container}>
            <Table>
              <TableHead>
                <TableRow sx={componentStyles.table.header}>
                  <TableCell sx={componentStyles.table.headerCell}>Date</TableCell>
                  <TableCell sx={componentStyles.table.headerCell}>Facture</TableCell>
                  <TableCell sx={componentStyles.table.headerCell}>Fournisseur</TableCell>
                  <TableCell sx={componentStyles.table.headerCell}>Convention</TableCell>
                  <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'right' }}>Base</TableCell>
                  <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'right' }}>Taux (%)</TableCell>
                  <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'right' }}>Montant HT</TableCell>
                  <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'right' }}>TVA</TableCell>
                  <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'right' }}>Montant TTC</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCommissions.map((commission) => (
                  <TableRow key={commission.id} sx={componentStyles.table.row}>
                    <TableCell sx={componentStyles.table.cell}>
                      <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                        {formatDate(commission.dateCalcul)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={componentStyles.table.cell}>
                      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>
                        {commission.depense?.numeroFacture}
                      </Typography>
                    </TableCell>
                    <TableCell sx={componentStyles.table.cell}>
                      <Typography sx={{ fontSize: typography.sizes.sm }}>
                        {commission.depense?.fournisseur?.raisonSociale || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={componentStyles.table.cell}>
                      <Typography sx={{ fontSize: typography.sizes.sm }}>
                        {commission.convention?.numero}
                      </Typography>
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                        {commission.convention?.libelle}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'right' }}>
                      <Typography sx={{ fontSize: typography.sizes.sm }}>
                        {formatCurrency(commission.montantBase)}
                      </Typography>
                      <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                        {commission.baseCalcul}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'right' }}>
                      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.success[600] }}>
                        {commission.tauxCommission}%
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'right' }}>
                      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold }}>
                        {formatCurrency(commission.montantCommissionHt)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'right' }}>
                      <Typography sx={{ fontSize: typography.sizes.sm }}>
                        {formatCurrency(commission.montantTvaCommission)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'right' }}>
                      <Typography sx={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.info[600] }}>
                        {formatCurrency(commission.montantCommissionTtc)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredCommissions.length === 0 && (
              <Box sx={componentStyles.emptyState}>
                <Typography sx={{ color: colors.textSecondary }}>
                  Aucune commission trouvée
                </Typography>
              </Box>
            )}
          </TableContainer>
        </Box>
      </Box>
    </AppLayout>
  )
}
