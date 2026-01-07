import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add } from '@mui/icons-material';

interface VersementPrevisionnelForm {
  volet?: string;
  dateVersement: string;
  montant: number;
  partenaireId?: number;
  modId?: number;
  remarques?: string;
}

interface Partenaire {
  id: number;
  nom: string;
  estMaitreOeuvreDelegue?: boolean;
}

interface AddVersementDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (versement: VersementPrevisionnelForm) => Promise<void>;
  partenaires: Partenaire[];
}

const AddVersementDialog = ({ open, onClose, onAdd, partenaires }: AddVersementDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<VersementPrevisionnelForm>({
    volet: '',
    dateVersement: new Date().toISOString().split('T')[0],
    montant: 0,
    partenaireId: undefined,
    modId: undefined,
    remarques: '',
  });

  const mods = partenaires.filter(p => p.estMaitreOeuvreDelegue);

  const handleChange = (field: keyof VersementPrevisionnelForm, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.dateVersement || formData.montant <= 0) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAdd(formData);
      setFormData({
        volet: '',
        dateVersement: new Date().toISOString().split('T')[0],
        montant: 0,
        partenaireId: undefined,
        modId: undefined,
        remarques: '',
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajouter un Versement Prévisionnel</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Volet / Composante"
              value={formData.volet}
              onChange={(e) => handleChange('volet', e.target.value)}
              placeholder="Ex: Volet 1 - Infrastructure"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Date de Versement"
              value={formData.dateVersement}
              onChange={(e) => handleChange('dateVersement', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Montant (DH)"
              value={formData.montant}
              onChange={(e) => handleChange('montant', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Partenaire Bénéficiaire</InputLabel>
              <Select
                value={formData.partenaireId || ''}
                label="Partenaire Bénéficiaire"
                onChange={(e) => handleChange('partenaireId', e.target.value ? Number(e.target.value) : undefined)}
              >
                <MenuItem value="">
                  <em>-- Sélectionner --</em>
                </MenuItem>
                {partenaires.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>MOD Responsable</InputLabel>
              <Select
                value={formData.modId || ''}
                label="MOD Responsable"
                onChange={(e) => handleChange('modId', e.target.value ? Number(e.target.value) : undefined)}
              >
                <MenuItem value="">
                  <em>-- Aucun --</em>
                </MenuItem>
                {mods.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Remarques"
              value={formData.remarques}
              onChange={(e) => handleChange('remarques', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Add />}
          disabled={loading}
          sx={{ bgcolor: '#1e40af', '&:hover': { bgcolor: '#1e3a8a' } }}
        >
          {loading ? 'Ajout...' : 'Ajouter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddVersementDialog;
