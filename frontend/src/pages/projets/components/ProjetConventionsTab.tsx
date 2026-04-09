import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
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
import { StatusBadge } from '@/components/core'
import { conventionsAPI, projetConventionsAPI } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { projetsAPI } from '@/lib/projetsAPI'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { Convention, ProjetConventionAssociation, Projet, formatCurrency, formatDate } from './projetDetailTypes'

interface ProjetConventionsTabProps {
  projetId: number
}

const ProjetConventionsTab = ({ projetId }: ProjetConventionsTabProps) => {
  const navigate = useNavigate()
  const { showError } = useToast()
  const [conventions, setConventions] = useState<Convention[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConventions = async () => {
      try {
        setLoading(true)
        const allConventions: Convention[] = []
        const seenIds = new Set<number>()

        let directConventionId: number | undefined
        try {
          const projetRes = await projetsAPI.getById(projetId)
          const projetData = projetRes.data as Projet
          directConventionId = projetData.conventionId
        } catch { /* continue */ }

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
        } catch { /* continue */ }

        if (directConventionId && !seenIds.has(directConventionId)) {
          try {
            const convResponse = await conventionsAPI.getById(directConventionId)
            const convData = convResponse.data?.data || convResponse.data
            if (convData) allConventions.push(convData as Convention)
          } catch { /* ignore */ }
        }

        setConventions(allConventions)
      } catch {
        showError('Erreur lors du chargement des conventions du projet')
      } finally {
        setLoading(false)
      }
    }
    loadConventions()
  }, [projetId])

  if (loading) {
    return <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '8px' }} />
  }

  if (conventions.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          Aucune convention liee a ce projet
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer sx={componentStyles.table.container}>
      <Table>
        <TableHead>
          <TableRow sx={componentStyles.table.header}>
            <TableCell sx={componentStyles.table.headerCell}>Code</TableCell>
            <TableCell sx={componentStyles.table.headerCell}>Numero</TableCell>
            <TableCell sx={componentStyles.table.headerCell}>Libelle</TableCell>
            <TableCell sx={componentStyles.table.headerCell}>Statut</TableCell>
            <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'right' }}>Budget</TableCell>
            <TableCell sx={componentStyles.table.headerCell}>Date Debut</TableCell>
            <TableCell sx={componentStyles.table.headerCell}>Date Fin</TableCell>
            <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'center' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {conventions.map((conv) => (
            <TableRow key={conv.id} sx={componentStyles.table.row}>
              <TableCell sx={componentStyles.table.cell}>{conv.code}</TableCell>
              <TableCell sx={componentStyles.table.cell}>{conv.numero}</TableCell>
              <TableCell sx={{ ...componentStyles.table.cell, fontWeight: typography.weights.medium }}>
                <RichTextDisplay html={conv.libelle} variant="inline" />
              </TableCell>
              <TableCell sx={componentStyles.table.cell}>
                <StatusBadge status={conv.statut} size="small" />
              </TableCell>
              <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'right' }}>{formatCurrency(conv.budget)}</TableCell>
              <TableCell sx={componentStyles.table.cell}>{conv.dateDebut ? formatDate(conv.dateDebut) : '-'}</TableCell>
              <TableCell sx={componentStyles.table.cell}>{conv.dateFin ? formatDate(conv.dateFin) : '-'}</TableCell>
              <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'center' }}>
                <IconButton size="small" onClick={() => navigate(`/conventions/${conv.id}`)} sx={{ color: colors.primary[600] }}>
                  <Visibility fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ProjetConventionsTab
