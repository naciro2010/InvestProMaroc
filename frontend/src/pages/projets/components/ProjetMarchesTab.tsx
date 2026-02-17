import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Skeleton,
} from '@mui/material'
import { Visibility } from '@mui/icons-material'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import { api } from '../../../lib/api'
import { Marche, formatCurrency, getStatusColor } from './projetDetailTypes'

interface ProjetMarchesTabProps {
  projetId: number
}

const ProjetMarchesTab = ({ projetId }: ProjetMarchesTabProps) => {
  const navigate = useNavigate()
  const [marches, setMarches] = useState<Marche[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMarches = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/marches/projet/${projetId}`)
        setMarches(res.data.data || res.data || [])
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur chargement marches'
        console.error(message)
        setMarches([])
      } finally {
        setLoading(false)
      }
    }
    loadMarches()
  }, [projetId])

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Skeleton variant="rectangular" height={200} />
      </Container>
    )
  }

  return (
    <Container maxWidth="xl">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Objet</TableCell>
              <TableCell>Fournisseur</TableCell>
              <TableCell align="right">Montant TTC</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marches.map((marche) => (
              <TableRow key={marche.id} hover>
                <TableCell>{marche.code}</TableCell>
                <TableCell><RichTextDisplay html={marche.objet} variant="inline" /></TableCell>
                <TableCell>{marche.fournisseurNom || '-'}</TableCell>
                <TableCell align="right">{formatCurrency(marche.montantTTC)}</TableCell>
                <TableCell>
                  <Chip label={marche.statut} size="small" color={getStatusColor(marche.statut)} />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => navigate(`/marches/${marche.id}`)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {marches.length === 0 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Aucun marche lie a ce projet
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default ProjetMarchesTab
