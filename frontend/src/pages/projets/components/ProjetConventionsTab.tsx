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
import { conventionsAPI, projetConventionsAPI } from '../../../lib/api'
import { projetsAPI } from '../../../lib/projetsAPI'
import { Convention, ProjetConventionAssociation, Projet, formatCurrency, formatDate } from './projetDetailTypes'

interface ProjetConventionsTabProps {
  projetId: number
}

const ProjetConventionsTab = ({ projetId }: ProjetConventionsTabProps) => {
  const navigate = useNavigate()
  const [conventions, setConventions] = useState<Convention[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConventions = async () => {
      try {
        setLoading(true)
        const allConventions: Convention[] = []
        const seenIds = new Set<number>()

        // 1. Load direct FK conventionId from the projet
        let directConventionId: number | undefined
        try {
          const projetRes = await projetsAPI.getById(projetId)
          const projetData = projetRes.data as Projet
          directConventionId = projetData.conventionId
        } catch {
          // Projet load failed, continue
        }

        // 2. Load conventions from junction table (many-to-many)
        try {
          const junctionRes = await projetConventionsAPI.getByProjet(projetId)
          const associations: ProjetConventionAssociation[] = junctionRes.data.data || junctionRes.data || []
          associations.forEach((assoc: ProjetConventionAssociation) => {
            if (!seenIds.has(assoc.conventionId)) {
              seenIds.add(assoc.conventionId)
              allConventions.push({
                id: assoc.conventionId,
                code: assoc.conventionCode,
                numero: assoc.conventionNumero,
                libelle: assoc.conventionLibelle,
                statut: assoc.conventionStatut,
                budget: assoc.conventionBudget,
                dateDebut: '',
              })
            }
          })
        } catch {
          // Junction table query failed, continue with direct FK
        }

        // 3. Also load direct FK convention if not already in the list
        if (directConventionId && !seenIds.has(directConventionId)) {
          try {
            const convResponse = await conventionsAPI.getById(directConventionId)
            const convData = convResponse.data?.data || convResponse.data
            if (convData) {
              allConventions.push(convData as Convention)
            }
          } catch {
            // Direct convention load failed, ignore
          }
        }

        setConventions(allConventions)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur chargement conventions'
        console.error(message)
      } finally {
        setLoading(false)
      }
    }
    loadConventions()
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
              <TableCell>Numero</TableCell>
              <TableCell>Libelle</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Budget</TableCell>
              <TableCell>Date Debut</TableCell>
              <TableCell>Date Fin</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conventions.map((conv) => (
              <TableRow key={conv.id} hover>
                <TableCell>{conv.code}</TableCell>
                <TableCell>{conv.numero}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{conv.libelle}</TableCell>
                <TableCell>
                  <Chip label={conv.statut} size="small" color="info" />
                </TableCell>
                <TableCell align="right">{formatCurrency(conv.budget)}</TableCell>
                <TableCell>{formatDate(conv.dateDebut)}</TableCell>
                <TableCell>{conv.dateFin ? formatDate(conv.dateFin) : '-'}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => navigate(`/conventions/${conv.id}`)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {conventions.length === 0 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Aucune convention liee a ce projet
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default ProjetConventionsTab
