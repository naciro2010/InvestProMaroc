import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material'
import { Add, Visibility, LinkOff, FolderOpen, Business } from '@mui/icons-material'
import StatusBadge from '@/components/core/StatusBadge'
import { colors, typography, componentStyles } from '@/lib/designSystem'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount)

// ============ PROJETS TAB ============

interface Projet {
  id: number
  code: string
  designation: string
  budgetTotal: number
  statut: string
}

interface ConventionProjetsTabProps {
  projets: Projet[]
  onLinkProjet: () => void
  onUnlinkProjet: (projetId: number) => void
}

export const ConventionProjetsTab = ({ projets, onLinkProjet, onUnlinkProjet }: ConventionProjetsTabProps) => {
  const navigate = useNavigate()

  return (
    <Box sx={{ px: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary, fontSize: typography.sizes.md }}>
          Projets lies ({projets.length})
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={onLinkProjet}
          sx={{
            bgcolor: colors.primary[600],
            '&:hover': { bgcolor: colors.primary[700] },
            textTransform: 'none',
            fontWeight: typography.weights.medium,
          }}
        >
          Lier un projet
        </Button>
      </Box>

      {projets.length > 0 ? (
        <Paper sx={{ ...componentStyles.card, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                  <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Designation</TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Budget Total</TableCell>
                  <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</TableCell>
                  <TableCell align="center" sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em', width: 90 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projets.map((projet) => (
                  <TableRow key={projet.id} sx={{ '&:hover': { bgcolor: colors.neutral[25] }, cursor: 'pointer' }} onClick={() => navigate(`/projets/${projet.id}`)}>
                    <TableCell>
                      <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.primary[600] }}>
                        {projet.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                        {projet.designation}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                        {formatCurrency(projet.budgetTotal)}
                      </Typography>
                    </TableCell>
                    <TableCell><StatusBadge status={projet.statut} size="small" /></TableCell>
                    <TableCell align="center" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Voir les details">
                          <IconButton size="small" onClick={() => navigate(`/projets/${projet.id}`)} sx={{ color: colors.primary[600] }}>
                            <Visibility sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delier ce projet">
                          <IconButton size="small" onClick={() => onUnlinkProjet(projet.id)} sx={{ color: colors.danger[500] }}>
                            <LinkOff sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper sx={{ ...componentStyles.card, py: 5, textAlign: 'center' }}>
          <FolderOpen sx={{ fontSize: 40, color: colors.neutral[300], mb: 1.5 }} />
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 1 }}>
            Aucun projet lie a cette convention
          </Typography>
          <Button
            size="small"
            startIcon={<Add />}
            onClick={onLinkProjet}
            sx={{ textTransform: 'none', color: colors.primary[600] }}
          >
            Lier un projet
          </Button>
        </Paper>
      )}
    </Box>
  )
}

// ============ MARCHES TAB ============

interface Marche {
  id: number
  numeroMarche: string
  objet: string
  montantTtc: number
  statut: string
  fournisseurNom?: string
}

interface ConventionMarchesTabProps {
  marches: Marche[]
  onLinkMarche: () => void
  onUnlinkMarche: (marcheId: number) => void
}

export const ConventionMarchesTab = ({ marches, onLinkMarche, onUnlinkMarche }: ConventionMarchesTabProps) => {
  const navigate = useNavigate()

  return (
    <Box sx={{ px: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography sx={{ fontWeight: typography.weights.semibold, color: colors.textPrimary, fontSize: typography.sizes.md }}>
          Marches lies ({marches.length})
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={onLinkMarche}
          sx={{
            bgcolor: colors.primary[600],
            '&:hover': { bgcolor: colors.primary[700] },
            textTransform: 'none',
            fontWeight: typography.weights.medium,
          }}
        >
          Lier un marche
        </Button>
      </Box>

      {marches.length > 0 ? (
        <Paper sx={{ ...componentStyles.card, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                  <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Objet</TableCell>
                  <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fournisseur</TableCell>
                  <TableCell align="right" sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Montant TTC</TableCell>
                  <TableCell sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</TableCell>
                  <TableCell align="center" sx={{ fontWeight: typography.weights.semibold, color: colors.textSecondary, fontSize: typography.sizes.xs, textTransform: 'uppercase', letterSpacing: '0.05em', width: 90 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marches.map((marche) => (
                  <TableRow key={marche.id} sx={{ '&:hover': { bgcolor: colors.neutral[25] }, cursor: 'pointer' }} onClick={() => navigate(`/marches/${marche.id}`)}>
                    <TableCell>
                      <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.primary[600] }}>
                        {marche.numeroMarche}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textPrimary, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {marche.objet}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                        {marche.fournisseurNom || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm, color: colors.textPrimary }}>
                        {formatCurrency(marche.montantTtc)}
                      </Typography>
                    </TableCell>
                    <TableCell><StatusBadge status={marche.statut} size="small" /></TableCell>
                    <TableCell align="center" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Voir les details">
                          <IconButton size="small" onClick={() => navigate(`/marches/${marche.id}`)} sx={{ color: colors.primary[600] }}>
                            <Visibility sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delier ce marche">
                          <IconButton size="small" onClick={() => onUnlinkMarche(marche.id)} sx={{ color: colors.danger[500] }}>
                            <LinkOff sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper sx={{ ...componentStyles.card, py: 5, textAlign: 'center' }}>
          <Business sx={{ fontSize: 40, color: colors.neutral[300], mb: 1.5 }} />
          <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary, mb: 1 }}>
            Aucun marche lie a cette convention
          </Typography>
          <Button
            size="small"
            startIcon={<Add />}
            onClick={onLinkMarche}
            sx={{ textTransform: 'none', color: colors.primary[600] }}
          >
            Lier un marche
          </Button>
        </Paper>
      )}
    </Box>
  )
}
