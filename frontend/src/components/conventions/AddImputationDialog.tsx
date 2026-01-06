import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Grid,
} from '@mui/material';
import { Add } from '@mui/icons-material';

interface ImputationPrevisionnelleForm {
  volet?: string;
  dateDemarrage: string;
  delaiMois: number;
  remarques?: string;
}

interface AddImputationDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (imputation: ImputationPrevisionnelleForm) => Promise<void>;
}

const AddImputationDialog = ({ open, onClose, onAdd }: AddImputationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ImputationPrevisionnelleForm>({
    volet: '',
    dateDemarrage: new Date().toISOString().split('T')[0],
    delaiMois: 12,
    remarques: '',
  });

  const handleChange = (field: keyof ImputationPrevisionnelleForm, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.dateDemarrage || formData.delaiMois <= 0) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAdd(formData);
      setFormData({
        volet: '',
        dateDemarrage: new Date().toISOString().split('T')[0],
        delaiMois: 12,
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
      <DialogTitle>Ajouter une Imputation Prévisionnelle</DialogTitle>
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
              label="Date de Démarrage"
              value={formData.dateDemarrage}
              onChange={(e) => handleChange('dateDemarrage', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Délai (mois)"
              value={formData.delaiMois}
              onChange={(e) => handleChange('delaiMois', parseInt(e.target.value) || 0)}
              inputProps={{ min: 1 }}
            />
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

export default AddImputationDialog;
