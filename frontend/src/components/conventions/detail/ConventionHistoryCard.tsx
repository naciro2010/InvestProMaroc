import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { conventionsAPI } from '@/lib/api';

interface ConventionModification {
  id: number;
  conventionId: number;
  modifieParId: number;
  modifieParNom: string;
  dateModification: string;
  motifModification: string;
  donneesAvant: Record<string, string | number | null>;
  donneesApres: Record<string, string | number | null>;
  champsModifies: string[];
  typeModification: string;
  createdAt: string;
}

interface ConventionHistoryCardProps {
  conventionId: number;
}

const fieldLabels: Record<string, string> = {
  libelle: 'Libellé',
  numero: 'Numéro',
  objet: 'Objet',
  typeConvention: 'Type',
  tauxCommission: 'Taux de commission',
  budget: 'Budget',
  baseCalcul: 'Base de calcul',
  tauxTva: 'Taux TVA',
  dateDebut: 'Date de début',
  dateFin: 'Date de fin',
  description: 'Description',
};

export default function ConventionHistoryCard({
  conventionId,
}: ConventionHistoryCardProps): JSX.Element {
  const [modifications, setModifications] = useState<ConventionModification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadHistory = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await conventionsAPI.getHistorique(conventionId);
        setModifications(response.data.data || []);
      } catch (err) {
        setError('Erreur lors du chargement de l\'historique');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [conventionId]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (modifications.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <HistoryIcon color="primary" />
            <Typography variant="h6">Historique des modifications</Typography>
          </Box>
          <Alert severity="info">Aucune modification enregistrée</Alert>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string): string => {
    const date: Date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatValue = (value: string | number | null): string => {
    if (value === null || value === '') return '-';
    return String(value);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <HistoryIcon color="primary" fontSize="large" />
          <Typography variant="h6">Historique des modifications</Typography>
          <Chip
            label={`${modifications.length} modification${modifications.length > 1 ? 's' : ''}`}
            color="primary"
            size="small"
          />
        </Box>

        <Stack spacing={3}>
          {modifications.map((modification: ConventionModification, index: number) => (
            <Paper
              key={modification.id}
              elevation={3}
              sx={{
                p: 3,
                borderLeft: 4,
                borderColor: 'primary.main',
                position: 'relative'
              }}
            >
              {/* Header with date and user */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <CalendarIcon fontSize="small" color="primary" />
                    <Typography variant="body2" fontWeight={600}>
                      {formatDate(modification.dateModification)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {modification.modifieParNom}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  icon={<EditIcon />}
                  label={modification.typeModification}
                  size="small"
                  color={modification.typeModification === 'STATUS_CHANGE' ? 'warning' : 'default'}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Motif */}
              <Box mb={2}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Motif de modification
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50', borderLeft: 3, borderColor: 'warning.main' }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    "{modification.motifModification}"
                  </Typography>
                </Paper>
              </Box>

              {/* Modified fields */}
              <Box mb={2}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Champs modifiés ({modification.champsModifies.length})
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {modification.champsModifies.map((champ: string) => (
                    <Chip
                      key={champ}
                      label={fieldLabels[champ] || champ}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  ))}
                </Box>
              </Box>

              {/* Changes detail */}
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Détails des changements
                </Typography>
                <Stack spacing={1.5} sx={{ pl: 2 }}>
                  {modification.champsModifies.map((champ: string) => {
                    const avant: string = formatValue(modification.donneesAvant[champ]);
                    const apres: string = formatValue(modification.donneesApres[champ]);

                    if (avant === apres) return null;

                    return (
                      <Box
                        key={champ}
                        sx={{
                          p: 1.5,
                          bgcolor: 'grey.50',
                          borderRadius: 1,
                          borderLeft: 3,
                          borderColor: 'divider'
                        }}
                      >
                        <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
                          {fieldLabels[champ] || champ}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Chip
                            label={avant}
                            size="small"
                            sx={{
                              textDecoration: 'line-through',
                              bgcolor: 'error.lighter',
                              color: 'error.dark'
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">→</Typography>
                          <Chip
                            label={apres}
                            size="small"
                            sx={{
                              bgcolor: 'success.lighter',
                              color: 'success.dark',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              {/* Modification number indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                #{modifications.length - index}
              </Box>
            </Paper>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
