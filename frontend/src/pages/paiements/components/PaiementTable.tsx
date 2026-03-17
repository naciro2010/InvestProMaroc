import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  IconButton,
} from '@mui/material'
import { Edit2, Trash2, CreditCard } from 'lucide-react'
import { StatusBadge } from '@/components/core'
import { colors, typography, componentStyles, borders } from '@/lib/designSystem'
import { type SortConfig } from '@/hooks/useTableSort'
import { Paiement, modeReglementLabels } from './types'

const listStyles = componentStyles.listView

interface PaiementTableProps {
  paiements: Paiement[]
  sortConfig: SortConfig<Paiement> | null
  requestSort: (key: keyof Paiement) => void
  onEdit: (paiement: Paiement) => void
  onDelete: (id: number) => void
  page: number
  rowsPerPage: number
  totalCount: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  formatCurrency: (amount: number) => string
}

const PaiementTable = ({
  paiements,
  sortConfig,
  requestSort,
  onEdit,
  onDelete,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  formatCurrency,
}: PaiementTableProps) => {
  return (
    <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
      <Box sx={listStyles.container}>
        <TableContainer>
          <Table size="small" sx={listStyles.table}>
            <TableHead>
              <TableRow sx={listStyles.headerRow}>
                <TableCell sortDirection={sortConfig?.key === 'numeroPaiement' ? sortConfig.direction : false}>
                  <TableSortLabel active={sortConfig?.key === 'numeroPaiement'} direction={sortConfig?.key === 'numeroPaiement' ? sortConfig.direction : 'asc'} onClick={() => requestSort('numeroPaiement')}>Numero</TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortConfig?.key === 'datePaiement' ? sortConfig.direction : false}>
                  <TableSortLabel active={sortConfig?.key === 'datePaiement'} direction={sortConfig?.key === 'datePaiement' ? sortConfig.direction : 'asc'} onClick={() => requestSort('datePaiement')}>Date</TableSortLabel>
                </TableCell>
                <TableCell>Beneficiaire</TableCell>
                <TableCell sortDirection={sortConfig?.key === 'modeReglement' ? sortConfig.direction : false}>
                  <TableSortLabel active={sortConfig?.key === 'modeReglement'} direction={sortConfig?.key === 'modeReglement' ? sortConfig.direction : 'asc'} onClick={() => requestSort('modeReglement')}>Mode Reglement</TableSortLabel>
                </TableCell>
                <TableCell align="right" sortDirection={sortConfig?.key === 'montant' ? sortConfig.direction : false}>
                  <TableSortLabel active={sortConfig?.key === 'montant'} direction={sortConfig?.key === 'montant' ? sortConfig.direction : 'asc'} onClick={() => requestSort('montant')}>Montant</TableSortLabel>
                </TableCell>
                <TableCell align="center" sortDirection={sortConfig?.key === 'statut' ? sortConfig.direction : false}>
                  <TableSortLabel active={sortConfig?.key === 'statut'} direction={sortConfig?.key === 'statut' ? sortConfig.direction : 'asc'} onClick={() => requestSort('statut')}>Statut</TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paiements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Box>
                      <CreditCard size={40} color={colors.textDisabled} style={{ marginBottom: 12 }} />
                      <Typography sx={{ color: colors.textSecondary, fontWeight: typography.weights.medium }}>
                        Aucun paiement trouve
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paiements.map((paiement) => (
                  <TableRow
                    key={paiement.id}
                    sx={listStyles.dataRow}
                    onClick={() => onEdit(paiement)}
                  >
                    <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
                      {paiement.numeroPaiement}
                    </TableCell>
                    <TableCell sx={{ color: colors.textSecondary }}>
                      {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>{paiement.beneficiaire || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: borders.radius.full,
                        bgcolor: colors.neutral[100],
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.medium,
                        color: colors.textSecondary,
                      }}>
                        <CreditCard size={12} />
                        {modeReglementLabels[paiement.modeReglement] || paiement.modeReglement}
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                      {formatCurrency(paiement.montant)}
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge status={paiement.statut || 'EN_ATTENTE'} size="small" />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <IconButton size="small" onClick={() => onEdit(paiement)} sx={{ color: colors.neutral[500] }}>
                          <Edit2 size={14} />
                        </IconButton>
                        <IconButton size="small" onClick={() => onDelete(paiement.id)} sx={{ color: colors.danger[500] }}>
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
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            onRowsPerPageChange(parseInt(e.target.value, 10))
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Box>
    </Box>
  )
}

export default PaiementTable
