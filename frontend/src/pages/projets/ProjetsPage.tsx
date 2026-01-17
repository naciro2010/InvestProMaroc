import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
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
  FolderOpen,
} from '@mui/icons-material';
import AppLayout from '../../components/layout/AppLayout';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
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
      <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <PageHeader
            title="Projets"
            subtitle="Gestion des projets d'investissement et programmes budgétaires"
            actions={
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/projets/nouveau')}
              >
                Nouveau Projet
              </Button>
            }
          />

          {/* Statistiques */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(5, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            <StatsCard
              title="Total"
              value={stats.total || 0}
              icon={<FolderOpen />}
              color="#3b82f6"
              bgColor="#eff6ff"
            />
            <StatsCard
              title="En préparation"
              value={stats.EN_PREPARATION || 0}
              icon={<Edit />}
              color="#8b5cf6"
              bgColor="#f5f3ff"
            />
            <StatsCard
              title="En cours"
              value={stats.EN_COURS || 0}
              icon={<PlayArrow />}
              color="#10b981"
              bgColor="#d1fae5"
            />
            <StatsCard
              title="Suspendus"
              value={stats.SUSPENDU || 0}
              icon={<Pause />}
              color="#f59e0b"
              bgColor="#fef3c7"
            />
            <StatsCard
              title="En retard"
              value={stats.EN_RETARD || 0}
              icon={<Cancel />}
              color="#ef4444"
              bgColor="#fee2e2"
            />
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Liste des projets */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {projets.map((projet) => (
                <Paper
                  key={`projet-${projet.id}`}
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    border: '1px solid #e5e7eb',
                    boxShadow: 'none',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#d1d5db',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => navigate(`/projets/${projet.id}`)}
                >
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
                        onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, projet); }}
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
                  </Paper>
            ))}
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
      </Box>
    </AppLayout>
  );
};

export default ProjetsPage;
