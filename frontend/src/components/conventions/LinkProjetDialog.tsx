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
  Chip,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { conventionsAPI, projetConventionsAPI } from '@/lib/api';
import { projetsAPI, Projet } from '@/lib/projetsAPI';
import { colors, typography } from '@/lib/designSystem';

interface ProjetListItem {
  id: number;
  code: string;
  nom: string;
  budgetTotal: number;
  statut: string;
}

interface ProjetConventionRecord {
  projetId: number;
}

interface LinkProjetDialogProps {
  open: boolean;
  conventionId: number;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal dialog for linking an existing projet to a convention.
 * Displays list of available projets with search functionality.
 * Filters out projets already linked to this convention.
 */
export default function LinkProjetDialog({
  open,
  conventionId,
  onClose,
  onSuccess,
}: LinkProjetDialogProps): JSX.Element {
  const [availableProjets, setAvailableProjets] = useState<ProjetListItem[]>([]);
  const [filteredProjets, setFilteredProjets] = useState<ProjetListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProjetId, setSelectedProjetId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProjets, setLoadingProjets] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch available projets on open (excluding already-linked ones)
  useEffect(() => {
    if (open) {
      fetchAvailableProjets();
    }
  }, [open, conventionId]);

  // Filter projets based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjets(availableProjets);
    } else {
      const query: string = searchQuery.toLowerCase();
      const filtered: ProjetListItem[] = availableProjets.filter((p: ProjetListItem) =>
        p.code.toLowerCase().includes(query) ||
        p.nom.toLowerCase().includes(query)
      );
      setFilteredProjets(filtered);
    }
  }, [searchQuery, availableProjets]);

  const fetchAvailableProjets = async (): Promise<void> => {
    try {
      setLoadingProjets(true);
      setError('');

      // Fetch all projets and already-linked associations in parallel
      const [allProjetsRes, linkedRes] = await Promise.all([
        projetsAPI.getAll(),
        projetConventionsAPI.getByConvention(conventionId),
      ]);

      // Extract data - both endpoints may wrap in ApiResponse
      const rawProjets = allProjetsRes.data;
      const unwrapped = (rawProjets as { data?: Projet[] }).data ?? (Array.isArray(rawProjets) ? rawProjets : []);
      const linkedAssociations: ProjetConventionRecord[] = linkedRes.data.data || linkedRes.data || [];

      // Build set of already-linked projet IDs
      const linkedProjetIds = new Set<number>(
        linkedAssociations.map((assoc: ProjetConventionRecord) => assoc.projetId)
      );

      // Filter out already-linked projets and map to ProjetListItem (Projet.id is optional)
      const available: ProjetListItem[] = unwrapped
        .filter((p) => p.id != null && !linkedProjetIds.has(p.id!))
        .map((p) => ({ id: p.id!, code: p.code, nom: p.nom, budgetTotal: p.budgetTotal, statut: p.statut }));

      setAvailableProjets(available);
      setFilteredProjets(available);
    } catch (err: unknown) {
      console.error('Error fetching projets:', err);
      setError('Erreur lors du chargement des projets');
    } finally {
      setLoadingProjets(false);
    }
  };

  const handleLink = async (): Promise<void> => {
    if (!selectedProjetId) {
      setError('Veuillez selectionner un projet');
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
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: typography.weights.semibold }}>
        Lier un projet existant
      </DialogTitle>

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
            {searchQuery ? 'Aucun projet trouve pour cette recherche' : 'Aucun projet disponible a lier'}
          </Typography>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredProjets.map((projet: ProjetListItem) => (
              <ListItem key={projet.id} disablePadding>
                <ListItemButton
                  selected={selectedProjetId === projet.id}
                  onClick={() => setSelectedProjetId(projet.id)}
                  sx={{
                    borderRadius: '8px',
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: colors.primary[50],
                      borderLeft: `3px solid ${colors.primary[600]}`,
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: typography.weights.medium, fontSize: typography.sizes.sm }}>
                          {projet.code}
                        </Typography>
                        <Typography sx={{ color: colors.textSecondary, fontSize: typography.sizes.sm }}>
                          - {projet.nom}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                        <Typography component="span" sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                          Budget: {formatBudget(projet.budgetTotal)}
                        </Typography>
                        <Chip label={projet.statut} size="small" sx={{ height: 20, fontSize: typography.sizes.xs }} />
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleLink}
          variant="contained"
          disabled={loading || loadingProjets || !selectedProjetId}
          sx={{
            bgcolor: colors.primary[600],
            '&:hover': { bgcolor: colors.primary[700] },
            textTransform: 'none',
          }}
        >
          {loading ? 'Liaison en cours...' : 'Lier'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
