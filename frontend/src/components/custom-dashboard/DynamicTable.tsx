/**
 * DynamicTable - Renders fetched data as a MUI table with sorting and formatting.
 */

import React, { useState, useMemo } from 'react'
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TableSortLabel, TablePagination, Paper, Typography,
} from '@mui/material'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import StatusBadge from '@/components/core/StatusBadge'
import type { FetchedData, ColumnDef, DataRow } from './dataFetcher'

interface DynamicTableProps {
  data: FetchedData
  title: string
}

type SortOrder = 'asc' | 'desc'

function formatCellValue(value: string | number, col: ColumnDef): string | React.ReactNode {
  if (col.type === 'number' && typeof value === 'number') {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
  if (col.type === 'date' && typeof value === 'string' && value) {
    try {
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
    } catch {
      return value
    }
  }
  return String(value ?? '')
}

const DynamicTable = ({ data, title }: DynamicTableProps) => {
  const [orderBy, setOrderBy] = useState<string>(data.columns[0]?.key || '')
  const [order, setOrder] = useState<SortOrder>('asc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleSort = (columnKey: string) => {
    const isAsc = orderBy === columnKey && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(columnKey)
  }

  const sortedRows = useMemo(() => {
    return [...data.rows].sort((a: DataRow, b: DataRow) => {
      const aVal = a[orderBy]
      const bVal = b[orderBy]
      if (aVal === bVal) return 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal ?? '')
      const bStr = String(bVal ?? '')
      return order === 'asc' ? aStr.localeCompare(bStr, 'fr') : bStr.localeCompare(aStr, 'fr')
    })
  }, [data.rows, orderBy, order])

  const paginatedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.textPrimary }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          {data.totalCount} élément{data.totalCount > 1 ? 's' : ''}
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ ...componentStyles.card, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: colors.neutral[50] }}>
              {data.columns.map((col: ColumnDef) => (
                <TableCell
                  key={col.key}
                  align={col.align || 'left'}
                  sx={{
                    fontWeight: typography.weights.semibold,
                    fontSize: typography.sizes.xs,
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    borderBottom: `2px solid ${colors.border}`,
                  }}
                >
                  <TableSortLabel
                    active={orderBy === col.key}
                    direction={orderBy === col.key ? order : 'asc'}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row: DataRow, idx: number) => (
              <TableRow
                key={idx}
                hover
                sx={{
                  '&:last-child td': { borderBottom: 0 },
                  transition: 'background-color 0.1s ease',
                }}
              >
                {data.columns.map((col: ColumnDef) => (
                  <TableCell
                    key={col.key}
                    align={col.align || 'left'}
                    sx={{
                      fontSize: typography.sizes.sm,
                      color: colors.textPrimary,
                      py: 1.5,
                    }}
                  >
                    {col.type === 'status' ? (
                      <StatusBadge status={String(row[col.key] ?? '')} />
                    ) : (
                      formatCellValue(row[col.key], col)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={data.columns.length} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
                    Aucune donnée disponible
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {/* Summary footer row for numeric columns */}
            {data.rows.length > 0 && data.columns.some(c => c.type === 'number') && (
              <TableRow sx={{ backgroundColor: colors.primary[25], borderTop: `2px solid ${colors.primary[200]}` }}>
                {data.columns.map((col: ColumnDef) => {
                  if (col.type === 'number') {
                    const allValues = data.rows.map(r => typeof r[col.key] === 'number' ? r[col.key] as number : 0)
                    const total = allValues.reduce((s, v) => s + v, 0)
                    return (
                      <TableCell
                        key={`total-${col.key}`}
                        align="right"
                        sx={{
                          fontSize: typography.sizes.sm,
                          fontWeight: typography.weights.bold,
                          color: colors.primary[700],
                          py: 1.5,
                        }}
                      >
                        {col.key === 'rank' || col.key === 'percentage'
                          ? ''
                          : `Σ ${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(total)}`
                        }
                      </TableCell>
                    )
                  }
                  // First string column shows "TOTAL"
                  const isFirstStringCol = data.columns.findIndex(c => c.type === 'string' || c.type === 'status') === data.columns.indexOf(col)
                  return (
                    <TableCell
                      key={`total-${col.key}`}
                      align="left"
                      sx={{
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.bold,
                        color: colors.primary[700],
                        py: 1.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {isFirstStringCol ? `TOTAL (${data.totalCount} éléments)` : ''}
                    </TableCell>
                  )
                })}
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data.rows.length > 10 && (
          <TablePagination
            component="div"
            count={data.rows.length}
            page={page}
            onPageChange={(_event: unknown, newPage: number) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} sur ${count}`}
          />
        )}
      </TableContainer>
    </Box>
  )
}

export default DynamicTable
