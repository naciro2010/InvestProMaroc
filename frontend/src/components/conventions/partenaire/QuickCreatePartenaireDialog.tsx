import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import { PersonAdd as PersonAddIcon } from '@mui/icons-material'
import { colors, typography } from '@/lib/designSystem'
import { partenairesAPI } from '@/lib/api'
import type { PartenaireSimple } from './PartenaireSelector'

interface QuickCreatePartenaireDialogProps {
  open: boolean
  initialName: string
  onClose: () => void
  onCreated: (partenaire: PartenaireSimple) => void
}

const QuickCreatePartenaireDialog = ({
  open,
  initialName,
  onClose,
  onCreated,
}: QuickCreatePartenaireDialogProps) => {
  const [nom, setNom] = useState(initialName)
  const [code, setCode] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!nom) return
    setCreating(true)
    try {
      const res = await partenairesAPI.create({
        raisonSociale: nom,
        code: code || `P-${Date.now().toString(36).toUpperCase()}`,
        sigle: null,
        actif: true,
      })
      const created = res.data.data || res.data
      onCreated({
        id: created.id,
        code: created.code,
        raisonSociale: created.raisonSociale,
        sigle: created.sigle,
        actif: true,
      })
      onClose()
      setNom('')
      setCode('')
    } catch {
      // silently handle
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon sx={{ color: colors.primary[600] }} />
          Creer un nouveau partenaire
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth size="small"
            label="Raison sociale *"
            value={nom}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNom(e.target.value)}
            autoFocus
            placeholder="Nom complet du partenaire"
          />
          <TextField
            fullWidth size="small"
            label="Code"
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
            placeholder="Ex: PART-001"
            helperText="Auto-genere si vide"
          />
          <Alert severity="info" sx={{ fontSize: typography.sizes.xs }}>
            Le partenaire sera cree et immediatement selectionne.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small" disabled={creating}>Annuler</Button>
        <Button
          variant="contained" size="small"
          onClick={handleCreate}
          disabled={!nom || creating}
          startIcon={creating ? <CircularProgress size={14} /> : <PersonAddIcon />}
        >
          {creating ? 'Creation...' : 'Creer et selectionner'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuickCreatePartenaireDialog
