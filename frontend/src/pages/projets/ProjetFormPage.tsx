import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
  Alert,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import AppLayout from '../../components/layout/AppLayout';
import { projetsAPI, Projet } from '../../lib/projetsAPI';

const ProjetFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<Partial<Projet>>({
    code: '',
    nom: '',
    description: '',
    budgetTotal: 0,
    dateDebut: '',
    dureeMois: 12,
    statut: 'EN_PREPARATION',
    pourcentageAvancement: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      loadProjet(parseInt(id));
    }
  }, [id, isEdit]);

  const loadProjet = async (projetId: number) => {
    try {
      const response = await projetsAPI.getById(projetId);
      setFormData(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement du projet');
    }
  };

  const handleChange = (field: keyof Projet, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit && id) {
        await projetsAPI.update(parseInt(id), formData);
        alert('Projet modifié avec succès !');
      } else {
        await projetsAPI.create(formData);
        alert('Projet créé avec succès !');
      }
      navigate('/projets');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/projets')}
            sx={{ mb: 2 }}
          >
            Retour
          </Button>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            {isEdit ? 'Modifier le projet' : 'Nouveau projet'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Code"
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    disabled={isEdit}
                    placeholder="PRJ-2024-001"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Nom du projet"
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Budget Total (DH)"
                    value={formData.budgetTotal}
                    onChange={(e) => handleChange('budgetTotal', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Statut"
                    value={formData.statut}
                    onChange={(e) => handleChange('statut', e.target.value)}
                  >
                    <MenuItem value="EN_PREPARATION">En préparation</MenuItem>
                    <MenuItem value="EN_COURS">En cours</MenuItem>
                    <MenuItem value="SUSPENDU">Suspendu</MenuItem>
                    <MenuItem value="TERMINE">Terminé</MenuItem>
                    <MenuItem value="ANNULE">Annulé</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date de début"
                    value={formData.dateDebut || ''}
                    onChange={(e) => handleChange('dateDebut', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Durée (mois)"
                    value={formData.dureeMois || ''}
                    onChange={(e) => handleChange('dureeMois', parseInt(e.target.value) || 0)}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Localisation"
                    value={formData.localisation || ''}
                    onChange={(e) => handleChange('localisation', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Objectifs"
                    value={formData.objectifs || ''}
                    onChange={(e) => handleChange('objectifs', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Remarques"
                    value={formData.remarques || ''}
                    onChange={(e) => handleChange('remarques', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/projets')}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={loading}
                      sx={{ bgcolor: '#1e40af', '&:hover': { bgcolor: '#1e3a8a' } }}
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default ProjetFormPage;
