import { Box, Paper, Typography, Chip, Divider, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert } from '@mui/material'
import { Visibility } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface SousConvention {
  id: number
  code: string
  numero: string
  libelle: string
  statut: string
  budget: number
  dateDebut: string
}

interface ConventionSousConventionsCardProps {
  typeConvention: 'CADRE' | 'SPECIFIQUE'
  sousConventions: SousConvention[]
  formatCurrency: (amount: number) => string
  getStatusColor: (statut: string) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  setActiveTab: (tab: number) => void
}

const ConventionSousConventionsCard = ({
  typeConvention,
  sousConventions,
  formatCurrency,
  getStatusColor,
  setActiveTab,
}: ConventionSousConventionsCardProps) => {
  const navigate = useNavigate()

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600} color="primary">
          {typeConvention === 'CADRE' ? 'Conventions Spécifiques' : 'Convention Parent'}
        </Typography>
        {typeConvention === 'CADRE' && (
          <Chip label={`${sousConventions.length} Conv. spéc.`} color="secondary" size="small" sx={{ fontWeight: 600 }} />
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />

      {typeConvention === 'CADRE' ? (
        <>
          {sousConventions.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Libellé</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Montant</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sousConventions.slice(0, 4).map((sc) => (
                    <TableRow key={sc.id} hover onClick={() => navigate(`/conventions/${sc.id}`)} sx={{ cursor: 'pointer' }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {sc.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {sc.libelle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={sc.statut} size="small" color={getStatusColor(sc.statut)} />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(sc.budget)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Aucune convention spécifique rattachée
              </Typography>
            </Box>
          )}
          {sousConventions.length > 4 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button size="small" onClick={() => setActiveTab(1)} endIcon={<Visibility />}>
                Voir toutes ({sousConventions.length})
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Cette convention est de type SPÉCIFIQUE
          </Typography>
          <Alert severity="info" sx={{ mt: 1 }}>
            Pour voir la convention cadre parente, consultez l'onglet "Détail de la convention"
          </Alert>
        </Box>
      )}
    </Paper>
  )
}

export default ConventionSousConventionsCard
