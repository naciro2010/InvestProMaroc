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
import { api } from '@/lib/api'
import { colors, typography, componentStyles } from '@/lib/designSystem'
import { Marche, formatCurrency } from './projetDetailTypes'

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
        console.error(err instanceof Error ? err.message : 'Erreur chargement marches')
        setMarches([])
      } finally {
        setLoading(false)
      }
    }
    loadMarches()
  }, [projetId])

  if (loading) {
    return <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '8px' }} />
  }

  if (marches.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          Aucun marche lie a ce projet
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
            <TableCell sx={componentStyles.table.headerCell}>Objet</TableCell>
            <TableCell sx={componentStyles.table.headerCell}>Fournisseur</TableCell>
            <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'right' }}>Montant TTC</TableCell>
            <TableCell sx={componentStyles.table.headerCell}>Statut</TableCell>
            <TableCell sx={{ ...componentStyles.table.headerCell, textAlign: 'center' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {marches.map((marche) => (
            <TableRow key={marche.id} sx={componentStyles.table.row}>
              <TableCell sx={componentStyles.table.cell}>{marche.code}</TableCell>
              <TableCell sx={componentStyles.table.cell}>
                <RichTextDisplay html={marche.objet} variant="inline" />
              </TableCell>
              <TableCell sx={componentStyles.table.cell}>{marche.fournisseurNom || '-'}</TableCell>
              <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'right' }}>{formatCurrency(marche.montantTTC)}</TableCell>
              <TableCell sx={componentStyles.table.cell}>
                <StatusBadge status={marche.statut} size="small" />
              </TableCell>
              <TableCell sx={{ ...componentStyles.table.cell, textAlign: 'center' }}>
                <IconButton size="small" onClick={() => navigate(`/marches/${marche.id}`)} sx={{ color: colors.primary[600] }}>
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

export default ProjetMarchesTab
