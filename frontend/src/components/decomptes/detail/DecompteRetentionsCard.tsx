import { Paper, Typography, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Stack, Box } from '@mui/material'
import { Security, AccountBalance, Warning, TrendingDown } from '@mui/icons-material'
import { colors } from '@/lib/designSystem'

interface Retenue {
  id: number
  typeRetenue: 'GARANTIE' | 'RAS' | 'PENALITES' | 'AVANCES'
  montant: number
  tauxPourcent?: number
  libelle?: string
}

interface DecompteRetentionsCardProps {
  retenues: Retenue[]
  totalRetenues: number
  formatCurrency: (amount: number) => string
}

const DecompteRetentionsCard = ({ retenues, totalRetenues, formatCurrency }: DecompteRetentionsCardProps) => {
  const getRetenueIcon = (type: string) => {
    switch (type) {
      case 'GARANTIE':
        return <Security fontSize="small" />
      case 'RAS':
        return <AccountBalance fontSize="small" />
      case 'PENALITES':
        return <Warning fontSize="small" />
      case 'AVANCES':
        return <TrendingDown fontSize="small" />
      default:
        return null
    }
  }

  const getRetenueColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    switch (type) {
      case 'GARANTIE':
        return 'info'
      case 'RAS':
        return 'secondary'
      case 'PENALITES':
        return 'error'
      case 'AVANCES':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getRetenueLabel = (type: string) => {
    switch (type) {
      case 'GARANTIE':
        return 'Retenue de Garantie'
      case 'RAS':
        return 'Retenue à la Source (RAS)'
      case 'PENALITES':
        return 'Pénalités'
      case 'AVANCES':
        return 'Remboursement Avances'
      default:
        return type
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Security color="primary" />
          <Typography variant="h6" fontWeight={600} color="primary">
            Retenues
          </Typography>
        </Stack>
        <Chip label={`${retenues.length} retenue(s)`} color="default" size="small" />
      </Stack>
      <Divider sx={{ mb: 3 }} />

      {retenues.length > 0 ? (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Libellé</TableCell>
                  <TableCell align="center">Taux %</TableCell>
                  <TableCell align="right">Montant</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {retenues.map((retenue) => (
                  <TableRow key={retenue.id} hover>
                    <TableCell>
                      <Chip
                        {...(getRetenueIcon(retenue.typeRetenue) && { icon: getRetenueIcon(retenue.typeRetenue)! })}
                        label={getRetenueLabel(retenue.typeRetenue)}
                        color={getRetenueColor(retenue.typeRetenue)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{retenue.libelle || '-'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {retenue.tauxPourcent ? `${retenue.tauxPourcent}%` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="error.main">
                        {formatCurrency(retenue.montant)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Total */}
          <Box sx={{ mt: 2, p: 2, bgcolor: colors.danger[50], borderRadius: 1, border: '1px solid', borderColor: 'error.light' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body1" fontWeight={600}>
                Total Retenues
              </Typography>
              <Typography variant="h6" fontWeight={700} color="error.main">
                {formatCurrency(totalRetenues)}
              </Typography>
            </Stack>
          </Box>
        </>
      ) : (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Security sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Aucune retenue appliquée
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

export default DecompteRetentionsCard
