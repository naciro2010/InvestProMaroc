import {
  Card, CardContent, Chip, Stack, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material'

interface Aggregation2DItem {
  dimension1: string
  dimension2: string
  montant: string | number
}

interface ReportingCrossTableProps {
  dim1Name: string
  dim2Name: string
  aggregation2D: Aggregation2DItem[]
  formatMontant: (montant: number) => string
}

const ReportingCrossTable = ({ dim1Name, dim2Name, aggregation2D, formatMontant }: ReportingCrossTableProps) => {
  const total = aggregation2D.reduce((sum, row) => sum + (typeof row.montant === 'number' ? row.montant : parseFloat(row.montant)), 0)

  const rows = new Set<string>()
  const cols = new Set<string>()
  const data: Record<string, Record<string, number>> = {}

  aggregation2D.forEach((item) => {
    rows.add(item.dimension1)
    cols.add(item.dimension2)
    if (!data[item.dimension1]) data[item.dimension1] = {}
    data[item.dimension1][item.dimension2] = typeof item.montant === 'number' ? item.montant : parseFloat(item.montant)
  })

  const rowList = Array.from(rows)
  const colList = Array.from(cols)

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Tableau Croisé: {dim1Name} × {dim2Name}</Typography>
            <Chip label={`Total: ${formatMontant(total)}`} color="primary" />
          </Stack>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'action.hover' }}><strong>{dim1Name} \ {dim2Name}</strong></TableCell>
                  {colList.map((col) => (
                    <TableCell key={col} align="right" sx={{ bgcolor: 'action.hover' }}><strong>{col}</strong></TableCell>
                  ))}
                  <TableCell align="right" sx={{ bgcolor: 'primary.main', color: 'white' }}><strong>Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rowList.map((row) => {
                  const rowData = data[row]
                  const rowTotal = Object.values(rowData).reduce((sum, val) => sum + val, 0)
                  return (
                    <TableRow key={row}>
                      <TableCell sx={{ bgcolor: 'action.hover' }}><strong>{row}</strong></TableCell>
                      {colList.map((col) => (
                        <TableCell key={col} align="right">{rowData[col] ? formatMontant(rowData[col]) : '-'}</TableCell>
                      ))}
                      <TableCell align="right" sx={{ bgcolor: 'action.hover' }}><strong>{formatMontant(rowTotal)}</strong></TableCell>
                    </TableRow>
                  )
                })}
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white' }}><strong>Total</strong></TableCell>
                  {colList.map((col) => {
                    const colTotal = rowList.reduce((sum, row) => sum + (data[row][col] || 0), 0)
                    return <TableCell key={col} align="right" sx={{ color: 'white' }}><strong>{formatMontant(colTotal)}</strong></TableCell>
                  })}
                  <TableCell align="right" sx={{ color: 'white' }}><strong>{formatMontant(total)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ReportingCrossTable
export type { Aggregation2DItem }
