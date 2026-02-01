import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { conventionsAPI, partenairesAPI } from '@/lib/api';

interface PartenaireSimple {
  id: number;
  code: string;
  raisonSociale: string;
  sigle: string | null;
  actif: boolean;
}

interface ConventionPartenaireEdit {
  id: number;
  partenaireId: number;
  partenaireNom: string;
  budgetAlloue: number;
  pourcentage: number;
  estMaitreOeuvre: boolean;
  estMaitreOeuvreDelegue: boolean;
  remarques?: string;
}

interface AddPartenaireDialogProps {
  open: boolean;
  conventionId: number;
  onClose: () => void;
  onSuccess: () => void;
  editData?: ConventionPartenaireEdit | null;
}

interface FormData {
  partenaireId: number;
  budgetAlloue: string;
  pourcentage: string;
  estMaitreOeuvre: boolean;
  estMaitreOeuvreDelegue: boolean;
  remarques: string;
}

interface ValidationErrors {
  partenaireId?: string;
  budgetAlloue?: string;
  pourcentage?: string;
}

/**
 * Modal dialog for adding/editing a partenaire in a convention
 * Allows selecting partenaire, setting budget, percentage, and roles (MO/MOD)
 */
export default function AddPartenaireDialog({
  open,
  conventionId,
  onClose,
  onSuccess,
  editData,
}: AddPartenaireDialogProps): JSX.Element {
  const isEditMode = Boolean(editData);
  const [partenaires, setPartenaires] = useState<PartenaireSimple[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPartenaires, setLoadingPartenaires] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState<FormData>({
    partenaireId: 0,
    budgetAlloue: '',
    pourcentage: '',
    estMaitreOeuvre: false,
    estMaitreOeuvreDelegue: false,
    remarques: '',
  });

  // Initialize form data when editing
  useEffect(() => {
    if (open && editData) {
      setFormData({
        partenaireId: editData.partenaireId,
        budgetAlloue: editData.budgetAlloue.toString(),
        pourcentage: editData.pourcentage.toString(),
        estMaitreOeuvre: editData.estMaitreOeuvre,
        estMaitreOeuvreDelegue: editData.estMaitreOeuvreDelegue,
        remarques: editData.remarques || '',
      });
    }
  }, [open, editData]);

  // Fetch available partenaires on mount
  useEffect(() => {
    if (open) {
      fetchPartenaires();
    }
  }, [open]);

  const fetchPartenaires = async (): Promise<void> => {
    try {
      setLoadingPartenaires(true);
      const response = await partenairesAPI.getAllActive();
      const data = response.data.data as PartenaireSimple[];
      setPartenaires(data);
    } catch (err) {
      console.error('Error fetching partenaires:', err);
      setError('Erreur lors du chargement des partenaires');
    } finally {
      setLoadingPartenaires(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate partenaire selection
    if (formData.partenaireId === 0) {
      errors.partenaireId = 'Veuillez sélectionner un partenaire';
    }

    // Validate budget
    const budget: number = parseFloat(formData.budgetAlloue);
    if (!formData.budgetAlloue || isNaN(budget)) {
      errors.budgetAlloue = 'Le budget est obligatoire';
    } else if (budget < 0) {
      errors.budgetAlloue = 'Le budget doit être positif';
    } else if (budget > 999999999999) {
      errors.budgetAlloue = 'Le budget ne peut pas dépasser 999 999 999 999 MAD';
    }

    // Validate pourcentage
    const pct: number = parseFloat(formData.pourcentage);
    if (!formData.pourcentage || isNaN(pct)) {
      errors.pourcentage = 'Le pourcentage est obligatoire';
    } else if (pct < 0) {
      errors.pourcentage = 'Le pourcentage doit être positif';
    } else if (pct > 100) {
      errors.pourcentage = 'Le pourcentage ne peut pas dépasser 100%';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        budgetAlloue: parseFloat(formData.budgetAlloue),
        pourcentage: parseFloat(formData.pourcentage),
        estMaitreOeuvre: formData.estMaitreOeuvre,
        estMaitreOeuvreDelegue: formData.estMaitreOeuvreDelegue,
        remarques: formData.remarques || undefined,
      };

      if (isEditMode && editData) {
        // Update existing partenaire
        await conventionsAPI.updatePartenaire(conventionId, editData.id, payload);
      } else {
        // Add new partenaire
        await conventionsAPI.addPartenaire(conventionId, {
          partenaireId: formData.partenaireId,
          ...payload,
        });
      }

      onSuccess();
      handleClose();
    } catch (err: unknown) {
      console.error('Error saving partenaire:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(isEditMode ? 'Erreur lors de la modification du partenaire' : 'Erreur lors de l\'ajout du partenaire');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (): void => {
    setFormData({
      partenaireId: 0,
      budgetAlloue: '',
      pourcentage: '',
      estMaitreOeuvre: false,
      estMaitreOeuvreDelegue: false,
      remarques: '',
    });
    setValidationErrors({});
    setError('');
    onClose();
  };

  const handleFieldChange = (field: keyof FormData, value: string | number | boolean): void => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors((prev: ValidationErrors) => {
        const newErrors: ValidationErrors = { ...prev };
        delete newErrors[field as keyof ValidationErrors];
        return newErrors;
      });
    }
  };

  const getPartenaireLabel = (p: PartenaireSimple): string => {
    return p.sigle ? `${p.code} - ${p.sigle}` : `${p.code} - ${p.raisonSociale}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? 'Modifier le partenaire' : 'Ajouter un partenaire'}</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loadingPartenaires && !isEditMode ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Partenaire Selection - Disabled in edit mode */}
            {isEditMode ? (
              <TextField
                fullWidth
                label="Partenaire"
                value={editData?.partenaireNom || ''}
                disabled
                helperText="Le partenaire ne peut pas être modifié"
              />
            ) : (
              <FormControl fullWidth required error={Boolean(validationErrors.partenaireId)}>
                <InputLabel>Partenaire</InputLabel>
                <Select
                  value={formData.partenaireId}
                  label="Partenaire"
                  onChange={(e) => handleFieldChange('partenaireId', e.target.value as number)}
                >
                  <MenuItem value={0} disabled>
                    Sélectionner un partenaire
                  </MenuItem>
                  {partenaires.map((p: PartenaireSimple) => (
                    <MenuItem key={p.id} value={p.id}>
                      {getPartenaireLabel(p)}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.partenaireId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {validationErrors.partenaireId}
                  </Typography>
                )}
              </FormControl>
            )}

            {/* Budget and Pourcentage */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                required
                label="Budget alloué (MAD)"
                type="number"
                value={formData.budgetAlloue}
                onChange={(e) => handleFieldChange('budgetAlloue', e.target.value)}
                error={Boolean(validationErrors.budgetAlloue)}
                helperText={validationErrors.budgetAlloue || 'Montant en dirhams'}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                fullWidth
                required
                label="Pourcentage (%)"
                type="number"
                value={formData.pourcentage}
                onChange={(e) => handleFieldChange('pourcentage', e.target.value)}
                error={Boolean(validationErrors.pourcentage)}
                helperText={validationErrors.pourcentage || '% du budget total'}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Box>

            {/* Roles (MO/MOD) */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.estMaitreOeuvre}
                    onChange={(e) => handleFieldChange('estMaitreOeuvre', e.target.checked)}
                  />
                }
                label="Maître d'œuvre (MO)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.estMaitreOeuvreDelegue}
                    onChange={(e) => handleFieldChange('estMaitreOeuvreDelegue', e.target.checked)}
                  />
                }
                label="Maître d'œuvre délégué (MOD)"
              />
            </Box>

            {/* Remarques */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Remarques"
              value={formData.remarques}
              onChange={(e) => handleFieldChange('remarques', e.target.value)}
              helperText="Observations ou notes complémentaires (optionnel)"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || (loadingPartenaires && !isEditMode)}
        >
          {loading
            ? (isEditMode ? 'Modification...' : 'Ajout en cours...')
            : (isEditMode ? 'Modifier' : 'Ajouter')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}
