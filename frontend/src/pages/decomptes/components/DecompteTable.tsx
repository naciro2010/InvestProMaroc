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
import { Eye, Edit2, Trash2 } from 'lucide-react'
import { StatusBadge } from '@/components/core'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import type { Decompte } from './types'
import type { SortConfig } from '@/hooks/useTableSort'

const listViewStyles = componentStyles.listView

interface DecompteTableProps {
  decomptes: Decompte[]
  sortConfig: SortConfig<Decompte> | null
  requestSort: (key: keyof Decompte) => void
  onEdit: (decompte: Decompte) => void
  onDelete: (id: number) => void
  page: number
  rowsPerPage: number
  totalCount: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rpp: number) => void
  formatCurrency: (amount: number) => string
}

const DecompteTable = ({
  decomptes,
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
}: DecompteTableProps) => {
  return (
    <Box sx={listViewStyles.container}>
      <TableContainer>
        <Table size="small" sx={listViewStyles.table}>
          <TableHead>
            <TableRow sx={listViewStyles.headerRow}>
              <TableCell sortDirection={sortConfig?.key === 'numero' ? sortConfig.direction : false}>
                <TableSortLabel active={sortConfig?.key === 'numero'} direction={sortConfig?.key === 'numero' ? sortConfig.direction : 'asc'} onClick={() => requestSort('numero')}>Numéro</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig?.key === 'dateDecompte' ? sortConfig.direction : false}>
                <TableSortLabel active={sortConfig?.key === 'dateDecompte'} direction={sortConfig?.key === 'dateDecompte' ? sortConfig.direction : 'asc'} onClick={() => requestSort('dateDecompte')}>Date</TableSortLabel>
              </TableCell>
              <TableCell align="right" sortDirection={sortConfig?.key === 'montant' ? sortConfig.direction : false}>
                <TableSortLabel active={sortConfig?.key === 'montant'} direction={sortConfig?.key === 'montant' ? sortConfig.direction : 'asc'} onClick={() => requestSort('montant')}>Montant</TableSortLabel>
              </TableCell>
              <TableCell align="right">Retenue</TableCell>
              <TableCell align="right" sortDirection={sortConfig?.key === 'netAPayer' ? sortConfig.direction : false}>
                <TableSortLabel active={sortConfig?.key === 'netAPayer'} direction={sortConfig?.key === 'netAPayer' ? sortConfig.direction : 'asc'} onClick={() => requestSort('netAPayer')}>Net à Payer</TableSortLabel>
              </TableCell>
              <TableCell align="center" sortDirection={sortConfig?.key === 'statut' ? sortConfig.direction : false}>
                <TableSortLabel active={sortConfig?.key === 'statut'} direction={sortConfig?.key === 'statut' ? sortConfig.direction : 'asc'} onClick={() => requestSort('statut')}>Statut</TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {decomptes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography sx={{ color: colors.textSecondary }}>Aucun décompte trouvé</Typography>
                </TableCell>
              </TableRow>
            ) : (
              decomptes.map((decompte) => (
                <TableRow
                  key={decompte.id}
                  sx={listViewStyles.dataRow}
                  onClick={() => onEdit(decompte)}
                >
                  <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.primary[700] }}>
                    {decompte.numero}
                  </TableCell>
                  <TableCell sx={{ color: colors.textSecondary }}>
                    {new Date(decompte.dateDecompte).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(decompte.montant)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: colors.textSecondary }}>
                    {formatCurrency(decompte.montantRetenue)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.bold, color: colors.primary[700] }}>
                    {formatCurrency(decompte.netAPayer)}
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge status={decompte.statut || 'EN_ATTENTE'} />
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <IconButton size="small" onClick={() => onEdit(decompte)} aria-label="Voir le décompte" sx={{ color: colors.neutral[500] }}>
                        <Eye size={14} aria-hidden="true" />
                      </IconButton>
                      <IconButton size="small" onClick={() => onEdit(decompte)} aria-label="Modifier le décompte" sx={{ color: colors.neutral[500] }}>
                        <Edit2 size={14} aria-hidden="true" />
                      </IconButton>
                      <IconButton size="small" onClick={() => onDelete(decompte.id)} aria-label="Supprimer le décompte" sx={{ color: colors.danger[500] }}>
                        <Trash2 size={14} aria-hidden="true" />
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
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Lignes par page"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />
    </Box>
  )
}

export default DecompteTable
