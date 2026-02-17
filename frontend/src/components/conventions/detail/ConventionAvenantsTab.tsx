import { Box, Container, Paper, Typography, Chip, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip } from '@mui/material'
import { History, Visibility } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import RichTextDisplay from '../../ui/RichTextDisplay'

interface Convention {
  id: number
  numero: string
  dateSignature: string
  budget: number
}

interface Avenant {
  id: number
  numeroAvenant: string
  dateAvenant: string
  statut: string
  objet: string
  type: string
}

interface ConventionAvenantsTabProps {
  convention: Convention
  avenants: Avenant[]
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
  getStatusColor: (statut: string) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

const ConventionAvenantsTab = ({ convention, avenants, formatCurrency, formatDate, getStatusColor }: ConventionAvenantsTabProps) => {
  const navigate = useNavigate()

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" icon={<History />}>
          <Typography variant="body2" fontWeight={600}>
            Convention initiale : {convention.numero}
          </Typography>
          <Typography variant="caption">
            Signée le {formatDate(convention.dateSignature)} • Montant : {formatCurrency(convention.budget)}
          </Typography>
        </Alert>
      </Box>

      {avenants.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="100px">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="A" size="small" color="warning" />
                    Numéro
                  </Box>
                </TableCell>
                <TableCell>Objet</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {avenants.map((avenant, index) => (
                <TableRow key={avenant.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {avenant.numeroAvenant}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avenant #{index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <RichTextDisplay html={avenant.objet || ''} collapseLength={100} allowExpand />
                  </TableCell>
                  <TableCell>
                    <Chip label={avenant.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(avenant.dateAvenant)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={avenant.statut} size="small" color={getStatusColor(avenant.statut)} />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Voir les détails">
                      <IconButton size="small" onClick={() => navigate(`/conventions/${convention.id}/avenants/${avenant.id}`)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Aucun avenant pour cette convention
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Les modifications futures de la convention seront enregistrées comme avenants
          </Typography>
        </Paper>
      )}
    </Container>
  )
}

export default ConventionAvenantsTab
