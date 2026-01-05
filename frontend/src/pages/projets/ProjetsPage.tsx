import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add,
  MoreVert,
  PlayArrow,
  Pause,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import AppLayout from '../../components/layout/AppLayout';
import { projetsAPI, Projet } from '../../lib/projetsAPI';

const ProjetsPage = () => {
  const navigate = useNavigate();
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});

  // Dialog states
  const [motifDialog, setMotifDialog] = useState(false);
  const [motif, setMotif] = useState('');
  const [actionType, setActionType] = useState<'suspendre' | 'annuler'>('suspendre');

  useEffect(() => {
    loadProjets();
    loadStats();
  }, []);

  const loadProjets = async () => {
    try {
      setLoading(true);
      const response = await projetsAPI.getAll();
      setProjets(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await projetsAPI.getStatistiques();
      setStats(response.data);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projet: Projet) => {
    setAnchorEl(event.currentTarget);
    setSelectedProjet(projet);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProjet(null);
  };

  const handleDemarrer = async () => {
    if (!selectedProjet?.id) return;
    try {
      await projetsAPI.demarrer(selectedProjet.id);
      loadProjets();
      loadStats();
      handleMenuClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors du démarrage');
    }
  };

  const handleSuspendre = () => {
    setActionType('suspendre');
    setMotif('');
    setMotifDialog(true);
    handleMenuClose();
  };

  const handleReprendre = async () => {
    if (!selectedProjet?.id) return;
    try {
      await projetsAPI.reprendre(selectedProjet.id);
      loadProjets();
      loadStats();
      handleMenuClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la reprise');
    }
  };

  const handleTerminer = async () => {
    if (!selectedProjet?.id) return;
    if (!window.confirm('Confirmer la clôture du projet ?')) return;
    try {
      await projetsAPI.terminer(selectedProjet.id);
      loadProjets();
      loadStats();
      handleMenuClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la clôture');
    }
  };

  const handleAnnuler = () => {
    setActionType('annuler');
    setMotif('');
    setMotifDialog(true);
    handleMenuClose();
  };

  const handleMotifSubmit = async () => {
    if (!selectedProjet?.id) return;
    try {
      if (actionType === 'suspendre') {
        await projetsAPI.suspendre(selectedProjet.id, motif);
      } else {
        await projetsAPI.annuler(selectedProjet.id, motif);
      }
      loadProjets();
      loadStats();
      setMotifDialog(false);
      setMotif('');
    } catch (err: any) {
      alert(err.response?.data?.message || `Erreur lors de l'${actionType === 'suspendre' ? 'suspension' : 'annulation'}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedProjet?.id) return;
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      await projetsAPI.delete(selectedProjet.id);
      loadProjets();
      loadStats();
      handleMenuClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_PREPARATION': return 'info';
      case 'EN_COURS': return 'primary';
      case 'SUSPENDU': return 'warning';
      case 'TERMINE': return 'success';
      case 'ANNULE': return 'error';
      default: return 'default';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'EN_PREPARATION': return 'En préparation';
      case 'EN_COURS': return 'En cours';
      case 'SUSPENDU': return 'Suspendu';
      case 'TERMINE': return 'Terminé';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  };

  const formatMontant = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(2)} M DH`;
    }
    return `${montant.toLocaleString('fr-MA')} DH`;
  };

  return (
    <AppLayout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              📁 Projets
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/projets/nouveau')}
              sx={{ bgcolor: '#1e40af', '&:hover': { bgcolor: '#1e3a8a' } }}
            >
              Nouveau Projet
            </Button>
          </Box>

          {/* Statistiques */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#f0f9ff', borderLeft: '4px solid #3b82f6' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Total</Typography>
                  <Typography variant="h4" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                    {stats.total || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#eff6ff', borderLeft: '4px solid #60a5fa' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">En préparation</Typography>
                  <Typography variant="h4" sx={{ color: '#60a5fa', fontWeight: 700 }}>
                    {stats.EN_PREPARATION || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#ecfdf5', borderLeft: '4px solid #10b981' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">En cours</Typography>
                  <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 700 }}>
                    {stats.EN_COURS || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Suspendus</Typography>
                  <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                    {stats.SUSPENDU || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: '#fee2e2', borderLeft: '4px solid #ef4444' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">En retard</Typography>
                  <Typography variant="h4" sx={{ color: '#ef4444', fontWeight: 700 }}>
                    {stats.EN_RETARD || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Liste des projets */}
          <Grid container spacing={3}>
            {projets.map((projet) => (
              <Grid item xs={12} md={6} lg={4} key={projet.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {projet.code}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
                          {projet.nom}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, projet)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    <Chip
                      label={getStatutLabel(projet.statut)}
                      color={getStatutColor(projet.statut)}
                      size="small"
                      sx={{ mb: 2 }}
                    />

                    {projet.description && (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {projet.description.substring(0, 100)}...
                      </Typography>
                    )}

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary">
                        Avancement
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={projet.pourcentageAvancement}
                        sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {projet.pourcentageAvancement}%
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Budget:</strong> {formatMontant(projet.budgetTotal)}
                      </Typography>
                    </Box>

                    {projet.dateDebut && (
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                        Début: {new Date(projet.dateDebut).toLocaleDateString('fr-FR')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Menu contextuel */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => navigate(`/projets/${selectedProjet?.id}`)}>
            <Visibility fontSize="small" sx={{ mr: 1 }} /> Détails
          </MenuItem>
          {selectedProjet?.statut === 'EN_PREPARATION' && (
            <MenuItem onClick={handleDemarrer}>
              <PlayArrow fontSize="small" sx={{ mr: 1 }} /> Démarrer
            </MenuItem>
          )}
          {selectedProjet?.statut === 'EN_COURS' && (
            <>
              <MenuItem onClick={handleSuspendre}>
                <Pause fontSize="small" sx={{ mr: 1 }} /> Suspendre
              </MenuItem>
              <MenuItem onClick={handleTerminer}>
                <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Terminer
              </MenuItem>
            </>
          )}
          {selectedProjet?.statut === 'SUSPENDU' && (
            <MenuItem onClick={handleReprendre}>
              <PlayArrow fontSize="small" sx={{ mr: 1 }} /> Reprendre
            </MenuItem>
          )}
          {selectedProjet?.statut !== 'TERMINE' && (
            <MenuItem onClick={handleAnnuler}>
              <Cancel fontSize="small" sx={{ mr: 1 }} /> Annuler
            </MenuItem>
          )}
          <MenuItem onClick={() => navigate(`/projets/${selectedProjet?.id}/modifier`)}>
            <Edit fontSize="small" sx={{ mr: 1 }} /> Modifier
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Delete fontSize="small" sx={{ mr: 1 }} /> Supprimer
          </MenuItem>
        </Menu>

        {/* Dialog pour motif */}
        <Dialog open={motifDialog} onClose={() => setMotifDialog(false)}>
          <DialogTitle>
            {actionType === 'suspendre' ? 'Suspendre le projet' : 'Annuler le projet'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motif"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMotifDialog(false)}>Annuler</Button>
            <Button
              onClick={handleMotifSubmit}
              variant="contained"
              color={actionType === 'suspendre' ? 'warning' : 'error'}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppLayout>
  );
};

export default ProjetsPage;
