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
import { Storefront as MarcheIcon } from '@mui/icons-material'
import { conventionsAPI, marchesAPI } from '@/lib/api'
import { ApiAutocomplete, type AutocompleteOption } from '@/components/core'
import { colors, typography } from '@/lib/designSystem'

interface Marche {
  id: number
  numeroMarche: string
  objet: string
  montantTtc: number
  statut: string
  fournisseurNom?: string
}

interface LinkMarcheDialogProps {
  open: boolean
  conventionId: number
  onClose: () => void
  onSuccess: () => void
}

interface MarcheOption extends AutocompleteOption {
  montantTtc: number
  statut: string
}

const formatMontant = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

function toOption(m: Marche): MarcheOption {
  const label = `${m.numeroMarche} - ${m.objet.length > 60 ? m.objet.substring(0, 60) + '...' : m.objet}`
  const secondary = `${formatMontant(m.montantTtc)}${m.fournisseurNom ? ` · ${m.fournisseurNom}` : ''} · ${m.statut}`
  return { id: m.id, label, secondaryLabel: secondary, montantTtc: m.montantTtc, statut: m.statut }
}

/**
 * Dialog for linking an existing marche to a convention.
 * Uses ApiAutocomplete for search with rich option display.
 */
export default function LinkMarcheDialog({
  open,
  conventionId,
  onClose,
  onSuccess,
}: LinkMarcheDialogProps): React.ReactElement {
  const [options, setOptions] = useState<MarcheOption[]>([])
  const [selected, setSelected] = useState<MarcheOption | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      fetchMarches()
    }
  }, [open])

  const fetchMarches = async (): Promise<void> => {
    try {
      setLoadingData(true)
      const response = await marchesAPI.getAll()
      const data = response.data.data as Marche[]
      setOptions(data.map(toOption))
    } catch {
      setError('Erreur lors du chargement des marches')
    } finally {
      setLoadingData(false)
    }
  }

  const handleLink = async (): Promise<void> => {
    if (!selected) {
      setError('Veuillez selectionner un marche')
      return
    }

    setLoading(true)
    setError('')

    try {
      await conventionsAPI.linkMarche(conventionId, selected.id)
      onSuccess()
      handleClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur lors de la liaison du marche')
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
        Lier un marche existant
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
              label="Marche"
              placeholder="Rechercher par numero, objet ou fournisseur..."
              value={selected}
              onChange={setSelected}
              options={options}
              loading={loadingData}
              required
              optionIcon={<MarcheIcon sx={{ fontSize: 16, color: colors.neutral[400] }} />}
              noOptionsText={
                <Typography sx={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                  Aucun marche disponible
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
