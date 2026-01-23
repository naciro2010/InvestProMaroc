import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { conventionsAPI, projetsAPI } from '@/lib/api';

interface Projet {
  id: number;
  code: string;
  nom: string;
  budgetTotal: number;
  statut: string;
}

interface LinkProjetDialogProps {
  open: boolean;
  conventionId: number;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal dialog for linking an existing projet to a convention
 * Displays list of available projets with search functionality
 */
export default function LinkProjetDialog({
  open,
  conventionId,
  onClose,
  onSuccess,
}: LinkProjetDialogProps): JSX.Element {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [filteredProjets, setFilteredProjets] = useState<Projet[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProjetId, setSelectedProjetId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProjets, setLoadingProjets] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch available projets on mount
  useEffect(() => {
    if (open) {
      fetchProjets();
    }
  }, [open]);

  // Filter projets based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjets(projets);
    } else {
      const query: string = searchQuery.toLowerCase();
      const filtered: Projet[] = projets.filter((p: Projet) =>
        p.code.toLowerCase().includes(query) ||
        p.nom.toLowerCase().includes(query)
      );
      setFilteredProjets(filtered);
    }
  }, [searchQuery, projets]);

  const fetchProjets = async (): Promise<void> => {
    try {
      setLoadingProjets(true);
      const response = await projetsAPI.getAll();
      const data = response.data.data as Projet[];
      setProjets(data);
      setFilteredProjets(data);
    } catch (err) {
      console.error('Error fetching projets:', err);
      setError('Erreur lors du chargement des projets');
    } finally {
      setLoadingProjets(false);
    }
  };

  const handleLink = async (): Promise<void> => {
    if (!selectedProjetId) {
      setError('Veuillez sélectionner un projet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await conventionsAPI.linkProjet({
        projetId: selectedProjetId,
        conventionId: conventionId,
      });

      onSuccess();
      handleClose();
    } catch (err: unknown) {
      console.error('Error linking projet:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur lors de la liaison du projet');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (): void => {
    setSearchQuery('');
    setSelectedProjetId(null);
    setError('');
    onClose();
  };

  const formatBudget = (amount: number): string => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Lier un projet existant</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search Field */}
        <TextField
          fullWidth
          placeholder="Rechercher par code ou nom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {loadingProjets ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredProjets.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            {searchQuery ? 'Aucun projet trouvé pour cette recherche' : 'Aucun projet disponible'}
          </Typography>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredProjets.map((projet: Projet) => (
              <ListItem key={projet.id} disablePadding>
                <ListItemButton
                  selected={selectedProjetId === projet.id}
                  onClick={() => setSelectedProjetId(projet.id)}
                >
                  <ListItemText
                    primary={`${projet.code} - ${projet.nom}`}
                    secondary={`Budget: ${formatBudget(projet.budgetTotal)} • Statut: ${projet.statut}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleLink}
          variant="contained"
          disabled={loading || loadingProjets || !selectedProjetId}
        >
          {loading ? 'Liaison en cours...' : 'Lier'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
