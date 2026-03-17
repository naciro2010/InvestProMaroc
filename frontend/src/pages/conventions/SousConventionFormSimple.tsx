import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Alert, Box,
} from '@mui/material'
import { Save, Close } from '@mui/icons-material'
import RichTextEditor from '../../components/ui/RichTextEditor'
import { conventionsAPI } from '../../lib/api'
import { typography, colors } from '../../lib/designSystem'
import { AxiosError } from 'axios'
import {
  ParentBudgetInfo,
  ParentPartenairesInfo,
  ParametresSection,
} from './sous-convention'
import type {
  ParentConventionInfo,
  EditingSousConventionData,
  ParentPartenaireData,
  SousConventionFormData,
} from './sous-convention'

interface SousConventionFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  parentConvention: ParentConventionInfo
  editingSousConvention?: EditingSousConventionData | null
}

const SousConventionFormSimple = ({
  open, onClose, onSuccess, parentConvention, editingSousConvention,
}: SousConventionFormProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [heriteParametres, setHeriteParametres] = useState(true)
  const [parentPartenaires, setParentPartenaires] = useState<ParentPartenaireData[]>([])
  const [loadingPartenaires, setLoadingPartenaires] = useState(false)

  const defaultForm = (): SousConventionFormData => ({
    code: '', numero: '', libelle: '', objet: '',
    dateConvention: new Date().toISOString().split('T')[0],
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: '',
    budget: '',
    tauxCommission: String(parentConvention.tauxCommission),
    baseCalcul: parentConvention.baseCalcul,
    tauxTva: String(parentConvention.tauxTva),
  })

  const [formData, setFormData] = useState<SousConventionFormData>(defaultForm)

  useEffect(() => {
    if (editingSousConvention) {
      setFormData({
        code: editingSousConvention.code || '',
        numero: editingSousConvention.numero || '',
        libelle: editingSousConvention.libelle || '',
        objet: editingSousConvention.objet || '',
        dateConvention: editingSousConvention.dateConvention || new Date().toISOString().split('T')[0],
        dateDebut: editingSousConvention.dateDebut || new Date().toISOString().split('T')[0],
        dateFin: editingSousConvention.dateFin || '',
        budget: String(editingSousConvention.budget || ''),
        tauxCommission: String(editingSousConvention.tauxCommission || parentConvention.tauxCommission),
        baseCalcul: editingSousConvention.baseCalcul || parentConvention.baseCalcul,
        tauxTva: String(editingSousConvention.tauxTva || parentConvention.tauxTva),
      })
      setHeriteParametres(editingSousConvention.heriteParametres ?? true)
    } else {
      setFormData(defaultForm())
      setHeriteParametres(true)
    }
  }, [editingSousConvention, parentConvention, open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && parentConvention.id) {
      setLoadingPartenaires(true)
      conventionsAPI.getPartenaires(parentConvention.id)
        .then(response => {
          const data = response.data.data || response.data || []
          setParentPartenaires(Array.isArray(data) ? data : [])
        })
        .catch(() => setParentPartenaires([]))
        .finally(() => setLoadingPartenaires(false))
    }
  }, [open, parentConvention.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...formData,
        budget: parseFloat(formData.budget),
        tauxCommission: parseFloat(formData.tauxCommission),
        tauxTva: parseFloat(formData.tauxTva),
        typeConvention: 'SPECIFIQUE',
        heriteParametres,
        dateFin: formData.dateFin || null,
      }
      if (editingSousConvention) {
        await conventionsAPI.updateSousConvention(editingSousConvention.id, payload)
      } else {
        await conventionsAPI.createSousConvention(parentConvention.id, payload)
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message as string)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur lors de l\'enregistrement')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingSousConvention ? 'Modifier' : 'Creer'} une Sous-Convention
        <Box sx={{ mt: 0.5, fontSize: typography.sizes.sm, color: colors.textSecondary }}>
          Convention Parente: {parentConvention.numero} - {parentConvention.libelle}
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

            <ParentBudgetInfo parentConvention={parentConvention} />
            <ParentPartenairesInfo partenaires={parentPartenaires} loading={loadingPartenaires} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required fullWidth size="small" />
              <TextField label="Numero" value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} required fullWidth size="small" />
            </Stack>

            <TextField label="Libelle" value={formData.libelle} onChange={(e) => setFormData({ ...formData, libelle: e.target.value })} required fullWidth size="small" />

            <RichTextEditor label="Objet / Description" value={formData.objet} onChange={(content) => setFormData({ ...formData, objet: content })} placeholder="Description detaillee de la sous-convention..." minHeight="100px" />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Date Convention" type="date" value={formData.dateConvention} onChange={(e) => setFormData({ ...formData, dateConvention: e.target.value })} required fullWidth size="small" InputLabelProps={{ shrink: true }} />
              <TextField label="Date Debut" type="date" value={formData.dateDebut} onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })} required fullWidth size="small" InputLabelProps={{ shrink: true }} />
              <TextField label="Date Fin" type="date" value={formData.dateFin} onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Stack>

            <ParametresSection
              heriteParametres={heriteParametres}
              onHeriteChange={setHeriteParametres}
              formData={formData}
              onFormDataChange={setFormData}
              parentConvention={parentConvention}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} startIcon={<Close />} disabled={loading}>Annuler</Button>
          <Button type="submit" variant="contained" startIcon={<Save />} disabled={loading}>
            {loading ? 'Enregistrement...' : editingSousConvention ? 'Modifier' : 'Creer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default SousConventionFormSimple
