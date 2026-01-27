import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Stack,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import RichTextDisplay from '@/components/ui/RichTextDisplay';

interface ConventionFormData {
  libelle: string;
  numero: string;
  objet: string;
  typeConvention: string;
  tauxCommission: number;
  budget: number;
  baseCalcul: string | null;
  tauxTva: number;
  dateDebut: string;
  dateFin: string | null;
  description: string | null;
}

interface ValidationErrors {
  motifModification?: string;
}

interface EditStep4ReviewProps {
  formData: ConventionFormData;
  motifModification: string;
  onMotifChange: (motif: string) => void;
  errors?: ValidationErrors;
}

/**
 * Étape 4: Récapitulatif et motif de modification
 * Composant micro-frontend pour l'édition
 */
export default function EditStep4Review({
  formData,
  motifModification,
  onMotifChange,
  errors = {},
}: EditStep4ReviewProps): JSX.Element {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getTypeLabel = (type: string): string => {
    return type === 'CADRE' ? 'Convention CADRE' : 'Convention NON CADRE';
  };

  const getBaseCalculLabel = (base: string | null): string => {
    if (!base) return 'Non définie';
    switch (base) {
      case 'HT': return 'Hors Taxes (HT)';
      case 'TTC': return 'Toutes Taxes Comprises (TTC)';
      case 'TVA': return 'TVA uniquement';
      default: return base;
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
        Récapitulatif des modifications
      </Typography>

      {/* Alert motif obligatoire */}
      <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight={600}>
          Le motif de modification est obligatoire
        </Typography>
        <Typography variant="caption">
          Précisez la raison de cette modification pour assurer la traçabilité.
        </Typography>
      </Alert>

      {/* Motif de modification - CHAMP PRINCIPAL */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.light', borderLeft: '4px solid', borderColor: 'warning.main' }}>
        <TextField
          fullWidth
          required
          multiline
          rows={3}
          label="Motif de modification"
          value={motifModification}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onMotifChange(e.target.value)}
          placeholder="Expliquez pourquoi vous modifiez cette convention..."
          error={Boolean(errors.motifModification)}
          helperText={errors.motifModification || 'Ce motif sera enregistré dans l\'historique et visible par tous'}
        />
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Récapitulatif des données */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Données de la convention
      </Typography>

      <Stack spacing={2}>
        {/* Informations générales */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Informations générales
          </Typography>
          <Box sx={{ display: 'grid', gap: 1, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: '150px' }}>
                Libellé:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formData.libelle}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: '150px' }}>
                Numéro:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formData.numero}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: '150px' }}>
                Type:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {getTypeLabel(formData.typeConvention)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: '150px' }}>
                Objet:
              </Typography>
              <Box sx={{ flex: 1 }}>
                <RichTextDisplay html={formData.objet || ''} />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Paramètres financiers et Dates */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Paramètres financiers
            </Typography>
            <Box sx={{ display: 'grid', gap: 1, mt: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '150px' }}>
                  Budget:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatCurrency(formData.budget)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '150px' }}>
                  Taux commission:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formData.tauxCommission}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '150px' }}>
                  Base de calcul:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {getBaseCalculLabel(formData.baseCalcul)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '150px' }}>
                  Taux TVA:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formData.tauxTva}%
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Dates
            </Typography>
            <Box sx={{ display: 'grid', gap: 1, mt: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '120px' }}>
                  Date début:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDate(formData.dateDebut)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '120px' }}>
                  Date fin:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDate(formData.dateFin)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Description */}
        {formData.description && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
              {formData.description}
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
