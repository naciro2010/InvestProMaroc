import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material'
import { AccountTree as ProjetIcon } from '@mui/icons-material'
import { conventionsAPI, projetConventionsAPI } from '@/lib/api'
import { projetsAPI, Projet } from '@/lib/projetsAPI'
import { ApiAutocomplete, type AutocompleteOption } from '@/components/core'
import { colors, typography } from '@/lib/designSystem'

interface ProjetConventionRecord {
  projetId: number
}

interface ProjetOption extends AutocompleteOption {
  budgetTotal: number
  statut: string
}

const formatBudget = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

function toOption(p: { id: number; code: string; nom: string; budgetTotal: number; statut: string }): ProjetOption {
  return {
    id: p.id,
    label: `${p.code} - ${p.nom}`,
    secondaryLabel: `Budget: ${formatBudget(p.budgetTotal)} · ${p.statut}`,
    budgetTotal: p.budgetTotal,
    statut: p.statut,
  }
}

interface LinkProjetDialogProps {
  open: boolean
  conventionId: number
  onClose: () => void
  onSuccess: () => void
}

/**
 * Dialog for linking an existing projet to a convention.
 * Uses ApiAutocomplete with duplicate prevention (filters out already-linked projets).
 */
export default function LinkProjetDialog({
  open,
  conventionId,
  onClose,
  onSuccess,
}: LinkProjetDialogProps): React.ReactElement {
  const [options, setOptions] = useState<ProjetOption[]>([])
  const [selected, setSelected] = useState<ProjetOption | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      fetchAvailableProjets()
    }
  }, [open, conventionId])

  const fetchAvailableProjets = async (): Promise<void> => {
    try {
      setLoadingData(true)
      setError('')

      const [allProjetsRes, linkedRes] = await Promise.all([
        projetsAPI.getAll(),
        projetConventionsAPI.getByConvention(conventionId),
      ])

      const rawProjets = allProjetsRes.data
      const unwrapped = (rawProjets as { data?: Projet[] }).data ?? (Array.isArray(rawProjets) ? rawProjets : [])
      const linkedAssociations: ProjetConventionRecord[] = linkedRes.data.data || linkedRes.data || []
      const linkedIds = new Set<number>(linkedAssociations.map((a) => a.projetId))

      const available = unwrapped
        .filter((p) => p.id != null && !linkedIds.has(p.id!))
        .map((p) => toOption({ id: p.id!, code: p.code, nom: p.nom, budgetTotal: p.budgetTotal, statut: p.statut }))

      setOptions(available)
    } catch {
      setError('Erreur lors du chargement des projets')
    } finally {
      setLoadingData(false)
    }
  }

  const handleLink = async (): Promise<void> => {
    if (!selected) {
      setError('Veuillez selectionner un projet')
      return
    }

    setLoading(true)
    setError('')

    try {
      await conventionsAPI.linkProjet({
        projetId: selected.id,
        conventionId: conventionId,
      })
      onSuccess()
      handleClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur lors de la liaison du projet')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = (): void => {
    setSelected(null)
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: typography.weights.semibold }}>
        Lier un projet existant
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            <ApiAutocomplete
              label="Projet"
              placeholder="Rechercher par code ou nom..."
              value={selected}
              onChange={setSelected}
              options={options}
              loading={loadingData}
              required
              optionIcon={<ProjetIcon sx={{ fontSize: 16, color: colors.neutral[400] }} />}
              noOptionsText={
                <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                  Aucun projet disponible a lier
                </Typography>
              }
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} size="small">
          Annuler
        </Button>
        <Button
          onClick={handleLink}
          variant="contained"
          disabled={loading || loadingData || !selected}
          size="small"
          sx={{
            bgcolor: colors.primary[600],
            '&:hover': { bgcolor: colors.primary[700] },
            textTransform: 'none',
          }}
        >
          {loading ? 'Liaison en cours...' : 'Lier'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
