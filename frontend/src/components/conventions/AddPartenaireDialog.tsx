import React, { useState, useEffect, useRef } from 'react';
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
  LinearProgress,
  Divider,
} from '@mui/material';
import { conventionsAPI, partenairesAPI, versementsPrevisionnelsAPI } from '@/lib/api';
import { colors, typography, borders } from '@/lib/designSystem';
import DecimalInput from '@/components/ui/DecimalInput';

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
  conventionBudget?: number;
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
  versementDate: string;
  versementMontant: string;
  versementVolet: string;
  imputationPoste: string;
  imputationMontant: string;
}

interface ValidationErrors {
  partenaireId?: string;
  budgetAlloue?: string;
  pourcentage?: string;
}

type SyncSource = 'budget' | 'pourcentage' | 'none';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount);

/**
 * Modal dialog for adding/editing a partenaire in a convention.
 * Includes versement previsionnel and imputation previsionnelle fields.
 */
export default function AddPartenaireDialog({
  open,
  conventionId,
  conventionBudget,
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
  const syncSourceRef = useRef<SyncSource>('none');

  const defaultFormData: FormData = {
    partenaireId: 0,
    budgetAlloue: '',
    pourcentage: '',
    estMaitreOeuvre: false,
    estMaitreOeuvreDelegue: false,
    remarques: '',
    versementDate: '',
    versementMontant: '',
    versementVolet: '',
    imputationPoste: '',
    imputationMontant: '',
  };

  const [formData, setFormData] = useState<FormData>(defaultFormData);

  useEffect(() => {
    if (open && editData) {
      setFormData({
        ...defaultFormData,
        partenaireId: editData.partenaireId,
        budgetAlloue: editData.budgetAlloue.toString(),
        pourcentage: editData.pourcentage.toString(),
        estMaitreOeuvre: editData.estMaitreOeuvre,
        estMaitreOeuvreDelegue: editData.estMaitreOeuvreDelegue,
        remarques: editData.remarques || '',
      });
    }
  }, [open, editData]);

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

    if (formData.partenaireId === 0) {
      errors.partenaireId = 'Veuillez selectionner un partenaire';
    }

    const budget: number = parseFloat(formData.budgetAlloue);
    if (!formData.budgetAlloue || isNaN(budget)) {
      errors.budgetAlloue = 'Le budget est obligatoire';
    } else if (budget < 0) {
      errors.budgetAlloue = 'Le budget doit etre positif';
    } else if (budget > 999999999999) {
      errors.budgetAlloue = 'Le budget ne peut pas depasser 999 999 999 999 MAD';
    }

    const pct: number = parseFloat(formData.pourcentage);
    if (!formData.pourcentage || isNaN(pct)) {
      errors.pourcentage = 'Le pourcentage est obligatoire';
    } else if (pct < 0) {
      errors.pourcentage = 'Le pourcentage doit etre positif';
    } else if (pct > 100) {
      errors.pourcentage = 'Le pourcentage ne peut pas depasser 100%';
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
        await conventionsAPI.updatePartenaire(conventionId, editData.id, payload);
      } else {
        await conventionsAPI.addPartenaire(conventionId, {
          partenaireId: formData.partenaireId,
          ...payload,
        });

        // Create versement previsionnel if fields are filled
        const versementMontant = parseFloat(formData.versementMontant);
        if (formData.versementDate && !isNaN(versementMontant) && versementMontant > 0) {
          try {
            await versementsPrevisionnelsAPI.create(conventionId, {
              partenaireId: formData.partenaireId,
              dateVersement: formData.versementDate,
              montant: versementMontant,
              montantPrevu: versementMontant,
              volet: formData.versementVolet || null,
            });
          } catch (versErr) {
            console.error('Error creating versement previsionnel:', versErr);
          }
        }
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
    setFormData(defaultFormData);
    setValidationErrors({});
    setError('');
    syncSourceRef.current = 'none';
    onClose();
  };

  const handleBudgetChange = (value: string): void => {
    syncSourceRef.current = 'budget';
    const newFormData: FormData = { ...formData, budgetAlloue: value };

    if (conventionBudget && conventionBudget > 0) {
      const budgetNum = parseFloat(value);
      if (!isNaN(budgetNum) && budgetNum >= 0) {
        const calculatedPct = (budgetNum / conventionBudget) * 100;
        newFormData.pourcentage = calculatedPct.toFixed(2);
      }
    }

    setFormData(newFormData);
    clearFieldError('budgetAlloue');
  };

  const handlePourcentageChange = (value: string): void => {
    syncSourceRef.current = 'pourcentage';
    const newFormData: FormData = { ...formData, pourcentage: value };

    if (conventionBudget && conventionBudget > 0) {
      const pctNum = parseFloat(value);
      if (!isNaN(pctNum) && pctNum >= 0) {
        const calculatedBudget = (pctNum / 100) * conventionBudget;
        newFormData.budgetAlloue = calculatedBudget.toFixed(2);
      }
    }

    setFormData(newFormData);
    clearFieldError('pourcentage');
  };

  const clearFieldError = (field: keyof ValidationErrors): void => {
    if (validationErrors[field]) {
      setValidationErrors((prev: ValidationErrors) => {
        const newErrors: ValidationErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string | number | boolean): void => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }));
    if (validationErrors[field as keyof ValidationErrors]) {
      clearFieldError(field as keyof ValidationErrors);
    }
  };

  const getPartenaireLabel = (p: PartenaireSimple): string => {
    return p.sigle ? `${p.code} - ${p.sigle}` : `${p.code} - ${p.raisonSociale}`;
  };

  const budgetNum = parseFloat(formData.budgetAlloue) || 0;
  const hasBudgetInfo = conventionBudget !== undefined && conventionBudget > 0;
  const remainingAfterAllocation = hasBudgetInfo ? conventionBudget - budgetNum : 0;
  const allocationPct = hasBudgetInfo ? (budgetNum / conventionBudget) * 100 : 0;

  const sectionTitleSx = {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'auto' },
          maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, fontSize: typography.sizes.lg }}>
        {isEditMode ? 'Modifier le partenaire' : 'Ajouter un partenaire'}
      </DialogTitle>

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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1.5 }}>
            {/* Budget info banner */}
            {hasBudgetInfo && (
              <Box sx={{
                p: 1.5, borderRadius: borders.radius.md,
                bgcolor: colors.primary[25],
                border: `1px solid ${colors.primary[100]}`,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography sx={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                    Budget convention
                  </Typography>
                  <Typography sx={{
                    fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
                    color: colors.primary[700],
                  }}>
                    {formatCurrency(conventionBudget)}
                  </Typography>
                </Box>
                {budgetNum > 0 && (
                  <>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(allocationPct, 100)}
                      sx={{
                        height: 3, borderRadius: borders.radius.full, mb: 0.5,
                        bgcolor: colors.neutral[100],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: borders.radius.full,
                          bgcolor: remainingAfterAllocation < 0 ? colors.danger[500] : colors.primary[500],
                        },
                      }}
                    />
                    <Typography sx={{
                      fontSize: '11px',
                      color: remainingAfterAllocation < 0 ? colors.danger[600] : colors.textSecondary,
                    }}>
                      {remainingAfterAllocation >= 0
                        ? `Restant: ${formatCurrency(remainingAfterAllocation)}`
                        : `Depassement: ${formatCurrency(Math.abs(remainingAfterAllocation))}`
                      }
                    </Typography>
                  </>
                )}
              </Box>
            )}

            {/* Section: Partenaire */}
            <Typography sx={sectionTitleSx}>Partenaire</Typography>

            {isEditMode ? (
              <TextField
                fullWidth size="small"
                label="Partenaire"
                value={editData?.partenaireNom || ''}
                disabled
                helperText="Le partenaire ne peut pas etre modifie"
              />
            ) : (
              <FormControl fullWidth size="small" required error={Boolean(validationErrors.partenaireId)}>
                <InputLabel>Partenaire</InputLabel>
                <Select
                  value={formData.partenaireId}
                  label="Partenaire"
                  onChange={(e) => handleFieldChange('partenaireId', e.target.value as number)}
                >
                  <MenuItem value={0} disabled>
                    Selectionner un partenaire
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

            {/* Budget & % */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <DecimalInput
                fullWidth size="small" required
                label="Budget alloue (MAD)"
                value={parseFloat(formData.budgetAlloue) || 0}
                onChange={(value) => handleBudgetChange(value.toString())}
                decimalPlaces={2}
                min={0}
                error={Boolean(validationErrors.budgetAlloue)}
                helperText={validationErrors.budgetAlloue || (hasBudgetInfo ? 'Auto-calcul du %' : '')}
              />
              <DecimalInput
                fullWidth size="small" required
                label="Pourcentage (%)"
                value={parseFloat(formData.pourcentage) || 0}
                onChange={(value) => handlePourcentageChange(value.toString())}
                decimalPlaces={2}
                min={0}
                max={100}
                error={Boolean(validationErrors.pourcentage)}
                helperText={validationErrors.pourcentage || (hasBudgetInfo ? 'Auto-calcul du budget' : '')}
              />
            </Box>

            {/* Roles */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox size="small"
                    checked={formData.estMaitreOeuvre}
                    onChange={(e) => handleFieldChange('estMaitreOeuvre', e.target.checked)}
                  />
                }
                label={<Typography sx={{ fontSize: typography.sizes.sm }}>Maitre d'oeuvre (MO)</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox size="small"
                    checked={formData.estMaitreOeuvreDelegue}
                    onChange={(e) => handleFieldChange('estMaitreOeuvreDelegue', e.target.checked)}
                  />
                }
                label={<Typography sx={{ fontSize: typography.sizes.sm }}>Maitre d'oeuvre delegue (MOD)</Typography>}
              />
            </Box>

            <Divider sx={{ borderColor: colors.borderSubtle }} />

            {/* Section: Versement previsionnel */}
            <Typography sx={sectionTitleSx}>Versement previsionnel (optionnel)</Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth size="small"
                label="Date versement"
                type="date"
                value={formData.versementDate}
                onChange={(e) => handleFieldChange('versementDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <DecimalInput
                fullWidth size="small"
                label="Montant (MAD)"
                value={parseFloat(formData.versementMontant) || 0}
                onChange={(value) => handleFieldChange('versementMontant', value.toString())}
                decimalPlaces={2}
                min={0}
              />
              <TextField
                fullWidth size="small"
                label="Volet"
                value={formData.versementVolet}
                onChange={(e) => handleFieldChange('versementVolet', e.target.value)}
                placeholder="Ex: Tranche 1"
              />
            </Box>

            <Divider sx={{ borderColor: colors.borderSubtle }} />

            {/* Section: Imputation previsionnelle */}
            <Typography sx={sectionTitleSx}>Imputation previsionnelle (optionnel)</Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth size="small"
                label="Poste / Compte"
                value={formData.imputationPoste}
                onChange={(e) => handleFieldChange('imputationPoste', e.target.value)}
                placeholder="Ex: 6141 - Fournitures"
              />
              <DecimalInput
                fullWidth size="small"
                label="Montant (MAD)"
                value={parseFloat(formData.imputationMontant) || 0}
                onChange={(value) => handleFieldChange('imputationMontant', value.toString())}
                decimalPlaces={2}
                min={0}
              />
            </Box>

            {/* Remarques */}
            <TextField
              fullWidth size="small"
              multiline rows={2}
              label="Remarques"
              value={formData.remarques}
              onChange={(e) => handleFieldChange('remarques', e.target.value)}
              placeholder="Notes complementaires (optionnel)"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} size="small">
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || (loadingPartenaires && !isEditMode)}
          size="small"
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
