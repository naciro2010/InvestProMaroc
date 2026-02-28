import {
  Box,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
} from '@mui/material'
import { Visibility, Edit, Delete } from '@mui/icons-material'
import { StatusBadge } from '@/components/core'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { useTableSort } from '@/hooks/useTableSort'
import {
  SortableTableRow,
  useSortableTable,
  DndContext,
  SortableContext,
  verticalListSortingStrategy,
  closestCenter,
} from '@/components/core/SortableTable'
import type { MarcheListItem } from './types'

interface MarcheListTableProps {
  data: MarcheListItem[]
  rawData: MarcheListItem[]
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onRowClick: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onConventionClick: (id: number) => void
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount)

const listStyles = componentStyles.listView

export default function MarcheListTable({
  data,
  rawData,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  onEdit,
  onDelete,
  onConventionClick,
}: MarcheListTableProps) {
  const { sortedItems, sortConfig, requestSort } = useTableSort<MarcheListItem>(data, {
    key: 'numeroMarche',
    direction: 'asc',
  })

  const { items: draggableItems, sensors, handleDragEnd } = useSortableTable({
    initialItems: rawData,
    idKey: 'id',
    storageKey: 'marches-order',
  })

  // Apply drag order to sorted items (drag order takes priority for display)
  const orderedItems = (() => {
    const idOrder = new Map(draggableItems.map((item, idx) => [item.id, idx]))
    return [...sortedItems].sort((a, b) => {
      const aIdx = idOrder.get(a.id) ?? Infinity
      const bIdx = idOrder.get(b.id) ?? Infinity
      return aIdx - bIdx
    })
  })()

  const paginatedItems = orderedItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Box sx={listStyles.container}>
        <TableContainer>
          <SortableContext items={paginatedItems.map(m => m.id)} strategy={verticalListSortingStrategy}>
            <Table size="small" sx={listStyles.table}>
              <TableHead>
                <TableRow sx={listStyles.headerRow}>
                  <TableCell sx={{ width: 40, p: '8px' }} />
                  <TableCell sortDirection={sortConfig?.key === 'numeroMarche' ? sortConfig.direction : false}>
                    <TableSortLabel
                      active={sortConfig?.key === 'numeroMarche'}
                      direction={sortConfig?.key === 'numeroMarche' ? sortConfig.direction : 'asc'}
                      onClick={() => requestSort('numeroMarche')}
                    >
                      N° Marche
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>N° AO</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell sortDirection={sortConfig?.key === 'objet' ? sortConfig.direction : false}>
                    <TableSortLabel
                      active={sortConfig?.key === 'objet'}
                      direction={sortConfig?.key === 'objet' ? sortConfig.direction : 'asc'}
                      onClick={() => requestSort('objet')}
                    >
                      Objet
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Fournisseur</TableCell>
                  <TableCell>Convention</TableCell>
                  <TableCell align="right" sortDirection={sortConfig?.key === 'montantTtc' ? sortConfig.direction : false}>
                    <TableSortLabel
                      active={sortConfig?.key === 'montantTtc'}
                      direction={sortConfig?.key === 'montantTtc' ? sortConfig.direction : 'asc'}
                      onClick={() => requestSort('montantTtc')}
                    >
                      Montant TTC
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Lignes</TableCell>
                  <TableCell align="center" sortDirection={sortConfig?.key === 'statut' ? sortConfig.direction : false}>
                    <TableSortLabel
                      active={sortConfig?.key === 'statut'}
                      direction={sortConfig?.key === 'statut' ? sortConfig.direction : 'asc'}
                      onClick={() => requestSort('statut')}
                    >
                      Statut
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                      <Typography sx={{ color: colors.textSecondary }}>Aucun marche trouve</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((marche) => (
                    <SortableTableRow key={marche.id} id={marche.id} sx={listStyles.dataRow}>
                      <TableCell
                        onClick={() => onRowClick(marche.id)}
                        sx={{ cursor: 'pointer', fontWeight: typography.weights.medium, color: colors.primary[700] }}
                      >
                        {marche.numeroMarche}
                      </TableCell>
                      <TableCell
                        onClick={() => onRowClick(marche.id)}
                        sx={{ cursor: 'pointer', color: colors.textSecondary }}
                      >
                        {marche.numAo || '-'}
                      </TableCell>
                      <TableCell onClick={() => onRowClick(marche.id)} sx={{ cursor: 'pointer' }}>
                        <StatusBadge status={marche.typeMarche || 'MARCHE'} size="small" />
                      </TableCell>
                      <TableCell
                        onClick={() => onRowClick(marche.id)}
                        sx={{ cursor: 'pointer', maxWidth: 280 }}
                      >
                        <RichTextDisplay html={marche.objet} variant="inline" sx={{ maxWidth: 280 }} />
                      </TableCell>
                      <TableCell onClick={() => onRowClick(marche.id)} sx={{ cursor: 'pointer' }}>
                        {marche.fournisseurNom}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {marche.conventionId ? (
                          <Box
                            component="span"
                            onClick={() => onConventionClick(marche.conventionId!)}
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
                              '&:hover': { bgcolor: colors.primary[50], textDecoration: 'underline' },
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
                        onClick={() => onRowClick(marche.id)}
                        align="right"
                        sx={{ cursor: 'pointer', fontWeight: typography.weights.semibold, color: colors.primary[700] }}
                      >
                        {formatCurrency(marche.montantTtc)}
                      </TableCell>
                      <TableCell onClick={() => onRowClick(marche.id)} align="center" sx={{ cursor: 'pointer' }}>
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
                      <TableCell onClick={() => onRowClick(marche.id)} align="center" sx={{ cursor: 'pointer' }}>
                        <StatusBadge status={marche.statut} />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <IconButton size="small" onClick={() => onRowClick(marche.id)} sx={{ color: colors.neutral[500] }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => onEdit(marche.id)} sx={{ color: colors.neutral[500] }}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => onDelete(marche.id)} sx={{ color: colors.danger[500] }}>
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
          count={data.length}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            onRowsPerPageChange(parseInt(e.target.value, 10))
            onPageChange(0)
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Box>
    </DndContext>
  )
}
