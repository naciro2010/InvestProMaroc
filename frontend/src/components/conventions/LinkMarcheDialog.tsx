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
import { conventionsAPI, marchesAPI } from '@/lib/api';

interface Marche {
  id: number;
  numeroMarche: string;
  objet: string;
  montantTtc: number;
  statut: string;
  fournisseurNom?: string;
}

interface LinkMarcheDialogProps {
  open: boolean;
  conventionId: number;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal dialog for linking an existing marché to a convention
 * Displays list of available marchés with search functionality
 */
export default function LinkMarcheDialog({
  open,
  conventionId,
  onClose,
  onSuccess,
}: LinkMarcheDialogProps): JSX.Element {
  const [marches, setMarches] = useState<Marche[]>([]);
  const [filteredMarches, setFilteredMarches] = useState<Marche[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMarcheId, setSelectedMarcheId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMarches, setLoadingMarches] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch available marchés on mount
  useEffect(() => {
    if (open) {
      fetchMarches();
    }
  }, [open]);

  // Filter marchés based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMarches(marches);
    } else {
      const query: string = searchQuery.toLowerCase();
      const filtered: Marche[] = marches.filter((m: Marche) =>
        m.numeroMarche.toLowerCase().includes(query) ||
        m.objet.toLowerCase().includes(query) ||
        (m.fournisseurNom && m.fournisseurNom.toLowerCase().includes(query))
      );
      setFilteredMarches(filtered);
    }
  }, [searchQuery, marches]);

  const fetchMarches = async (): Promise<void> => {
    try {
      setLoadingMarches(true);
      const response = await marchesAPI.getAll();
      const data = response.data.data as Marche[];
      setMarches(data);
      setFilteredMarches(data);
    } catch (err) {
      console.error('Error fetching marchés:', err);
      setError('Erreur lors du chargement des marchés');
    } finally {
      setLoadingMarches(false);
    }
  };

  const handleLink = async (): Promise<void> => {
    if (!selectedMarcheId) {
      setError('Veuillez sélectionner un marché');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await conventionsAPI.linkMarche(conventionId, selectedMarcheId);

      onSuccess();
      handleClose();
    } catch (err: unknown) {
      console.error('Error linking marché:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur lors de la liaison du marché');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (): void => {
    setSearchQuery('');
    setSelectedMarcheId(null);
    setError('');
    onClose();
  };

  const formatMontant = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Lier un marché existant</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search Field */}
        <TextField
          fullWidth
          placeholder="Rechercher par numéro, objet ou fournisseur..."
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

        {loadingMarches ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredMarches.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            {searchQuery ? 'Aucun marché trouvé pour cette recherche' : 'Aucun marché disponible'}
          </Typography>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredMarches.map((marche: Marche) => (
              <ListItem key={marche.id} disablePadding>
                <ListItemButton
                  selected={selectedMarcheId === marche.id}
                  onClick={() => setSelectedMarcheId(marche.id)}
                >
                  <ListItemText
                    primary={`${marche.numeroMarche} - ${marche.objet.substring(0, 80)}${marche.objet.length > 80 ? '...' : ''}`}
                    secondary={`Montant TTC: ${formatMontant(marche.montantTtc)}${marche.fournisseurNom ? ` • Fournisseur: ${marche.fournisseurNom}` : ''} • Statut: ${marche.statut}`}
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
          disabled={loading || loadingMarches || !selectedMarcheId}
        >
          {loading ? 'Liaison en cours...' : 'Lier'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
