import { useState, useEffect, useRef } from 'react';
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
  useMediaQuery,
  useTheme,
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
import { GripVertical } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import { projetsAPI, Projet } from '../../lib/projetsAPI';
import {
  useSortableTable,
  useSortable,
  DndContext,
  SortableContext,
  verticalListSortingStrategy,
  closestCenter,
} from '../../components/core/SortableTable';
import { CSS } from '@dnd-kit/utilities';
import { colors, transitions } from '../../lib/designSystem';

// Composant carte projet draggable
interface SortableProjetCardProps {
  projet: Projet;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, projet: Projet) => void;
  onClick: () => void;
  getStatutColor: (statut: string) => 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  getStatutLabel: (statut: string) => string;
  formatMontant: (montant: number) => string;
}

const SortableProjetCard = ({
  projet,
  onMenuOpen,
  onClick,
  getStatutColor,
  getStatutLabel,
  formatMontant,
}: SortableProjetCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: projet.id ?? 0 });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        p: { xs: 2, md: 3 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        border: `1px solid ${colors.border}`,
        boxShadow: 'none',
        borderRadius: '12px',
        transition: `all ${transitions.normal}`,
        bgcolor: isDragging ? colors.primary[50] : 'white',
        '&:hover': {
          borderColor: colors.neutral[300],
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          transform: isDragging ? undefined : 'translateY(-2px)',
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: { xs: 1.5, md: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, flex: 1, minWidth: 0 }}>
          {/* Drag Handle - Hidden on mobile */}
          <Box
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            sx={{
              cursor: 'grab',
              color: colors.neutral[400],
              '&:hover': { color: colors.neutral[600] },
              transition: `color ${transitions.fast}`,
              mt: 0.5,
              display: { xs: 'none', md: 'block' },
            }}
          >
            <GripVertical className="w-4 h-4" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="textSecondary">
              {projet.code}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mt: 0.5,
                fontSize: { xs: '0.95rem', md: '1.25rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {projet.nom}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onMenuOpen(e, projet); }}
        >
          <MoreVert />
        </IconButton>
      </Box>

      <Chip
        label={getStatutLabel(projet.statut)}
        color={getStatutColor(projet.statut)}
        size="small"
        sx={{ mb: { xs: 1.5, md: 2 }, alignSelf: 'flex-start' }}
      />

      {projet.description && (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            mb: { xs: 1.5, md: 2 },
            display: { xs: 'none', sm: '-webkit-box' },
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {projet.description}
        </Typography>
      )}

      <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="caption" color="textSecondary">
            Avancement
          </Typography>
          <Typography variant="caption" color="textSecondary" fontWeight={600}>
            {projet.pourcentageAvancement}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={projet.pourcentageAvancement}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
          <strong>Budget:</strong> {formatMontant(projet.budgetTotal)}
        </Typography>
        {projet.dateDebut && (
          <Typography variant="caption" color="textSecondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {new Date(projet.dateDebut).toLocaleDateString('fr-FR')}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

const ProjetsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [rawProjets, setRawProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [statutFilter, setStatutFilter] = useState<string>('ALL');

  // Ref for scrolling to cards when clicking stats
  const cardsRef = useRef<HTMLDivElement>(null);

  // Handle stat card click - filter and scroll to cards
  const handleStatClick = (statut: string) => {
    setStatutFilter(statut);
    setTimeout(() => {
      cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Dialog states
  const [motifDialog, setMotifDialog] = useState(false);
  const [motif, setMotif] = useState('');
  const [actionType, setActionType] = useState<'suspendre' | 'annuler'>('suspendre');

  // Drag & drop avec persistance localStorage
  const {
    items: projets,
    sensors,
    handleDragEnd,
  } = useSortableTable({
    initialItems: rawProjets,
    idKey: 'id',
    storageKey: 'projets-order',
  });

  useEffect(() => {
    loadProjets();
    loadStats();
  }, []);

  const loadProjets = async () => {
    try {
      setLoading(true);
      const response = await projetsAPI.getAll();
      setRawProjets(response.data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des projets';
      setError(errorMessage);
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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors du démarrage');
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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la reprise');
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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la clôture');
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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : `Erreur lors de l'${actionType === 'suspendre' ? 'suspension' : 'annulation'}`);
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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const getStatutColor = (statut: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
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

  // Filter projets based on selected statut
  const filteredProjets = statutFilter === 'ALL'
    ? projets
    : projets.filter(p => p.statut === statutFilter);

  return (
    <AppLayout>
      <Box sx={{ minHeight: '100vh', py: { xs: 2, md: 4 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <PageHeader
            title="Projets"
            subtitle="Gestion des projets d'investissement et programmes budgétaires"
            actions={
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/projets/nouveau')}
                sx={{ px: { xs: 2, md: 3 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Nouveau Projet</Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Nouveau</Box>
              </Button>
            }
          />

          {/* Statistiques - Clickable to filter and scroll */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
              gap: { xs: 2, md: 3 },
              mb: { xs: 3, md: 4 },
            }}
          >
            <StatsCard
              title="Total"
              value={stats.total || 0}
              icon={<FolderOpen />}
              color="#3b82f6"
              bgColor="#eff6ff"
              onClick={() => handleStatClick('ALL')}
            />
            <StatsCard
              title={isMobile ? "Prép." : "En préparation"}
              value={stats.EN_PREPARATION || 0}
              icon={<Edit />}
              color="#8b5cf6"
              bgColor="#f5f3ff"
              onClick={() => handleStatClick('EN_PREPARATION')}
            />
            <StatsCard
              title="En cours"
              value={stats.EN_COURS || 0}
              icon={<PlayArrow />}
              color="#10b981"
              bgColor="#d1fae5"
              onClick={() => handleStatClick('EN_COURS')}
            />
            <StatsCard
              title="Suspendus"
              value={stats.SUSPENDU || 0}
              icon={<Pause />}
              color="#f59e0b"
              bgColor="#fef3c7"
              onClick={() => handleStatClick('SUSPENDU')}
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

          {/* Filter status indicator */}
          {statutFilter !== 'ALL' && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Filtré par: <strong>{getStatutLabel(statutFilter)}</strong>
              </Typography>
              <Chip
                label="Effacer"
                size="small"
                onClick={() => setStatutFilter('ALL')}
                onDelete={() => setStatutFilter('ALL')}
              />
            </Box>
          )}

          {/* Liste des projets avec Drag & Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredProjets.map(p => p.id ?? 0)}
              strategy={verticalListSortingStrategy}
            >
              <Box
                ref={cardsRef}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                  gap: { xs: 2, md: 3 },
                }}
              >
                {filteredProjets.length === 0 ? (
                  <Box sx={{ gridColumn: '1 / -1', py: 6, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Aucun projet trouvé
                    </Typography>
                  </Box>
                ) : (
                  filteredProjets.map((projet) => (
                    <SortableProjetCard
                      key={projet.id}
                      projet={projet}
                      onMenuOpen={handleMenuOpen}
                      onClick={() => navigate(`/projets/${projet.id}`)}
                      getStatutColor={getStatutColor}
                      getStatutLabel={getStatutLabel}
                      formatMontant={formatMontant}
                    />
                  ))
                )}
              </Box>
            </SortableContext>
          </DndContext>

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
