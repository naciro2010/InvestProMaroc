import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack, ArrowForward, Save } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { conventionsAPI } from '@/lib/api';
import EditStep1Info from '@/components/conventions/edit/EditStep1Info';
import EditStep2Finances from '@/components/conventions/edit/EditStep2Finances';
import EditStep3Dates from '@/components/conventions/edit/EditStep3Dates';
import EditStep4Review from '@/components/conventions/edit/EditStep4Review';
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateAllSteps,
  validateMotif,
  canSubmitForm,
  type ValidationErrors,
  type StepValidation,
} from '@/utils/conventionValidation';

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

const steps: string[] = [
  'Informations générales',
  'Paramètres financiers',
  'Dates',
  'Récapitulatif et motif'
];

/**
 * Page d'édition de convention avec wizard multi-étapes
 * Charge les données existantes et permet la modification avec historique
 */
export default function ConventionEditPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const [formData, setFormData] = useState<ConventionFormData>({
    libelle: '',
    numero: '',
    objet: '',
    typeConvention: 'CADRE',
    tauxCommission: 0,
    budget: 0,
    baseCalcul: null,
    tauxTva: 20,
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: null,
    description: null,
  });

  const [motifModification, setMotifModification] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  /**
   * Charger les données de la convention existante
   */
  useEffect(() => {
    const loadConvention = async (): Promise<void> => {
      if (!id) {
        setError('ID de convention manquant');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await conventionsAPI.getById(parseInt(id, 10));
        const convention = response.data.data;

        // Vérifier que la convention peut être modifiée
        if (convention.statut !== 'BROUILLON') {
          setError('Seules les conventions en BROUILLON peuvent être modifiées');
          setLoading(false);
          return;
        }

        // Charger les données dans le formulaire
        setFormData({
          libelle: convention.libelle || '',
          numero: convention.numero || '',
          objet: convention.objet || '',
          typeConvention: convention.typeConvention || 'CADRE',
          tauxCommission: convention.tauxCommission || 0,
          budget: convention.budget || 0,
          baseCalcul: convention.baseCalcul || null,
          tauxTva: convention.tauxTva || 20,
          dateDebut: convention.dateDebut || new Date().toISOString().split('T')[0],
          dateFin: convention.dateFin || null,
          description: convention.description || null,
        });

        setLoading(false);
      } catch (err: unknown) {
        console.error('Erreur chargement convention:', err);
        setError('Erreur lors du chargement de la convention');
        setLoading(false);
      }
    };

    loadConvention();
  }, [id]);

  /**
   * Effet pour valider le motif de modification (étape 4)
   */
  useEffect(() => {
    if (activeStep === 3) {
      const motifValidation: StepValidation = validateMotif(motifModification);
      setValidationErrors((prev: ValidationErrors) => ({
        ...prev,
        motifModification: motifValidation.errors.motifModification,
      }));
    }
  }, [motifModification, activeStep]);

  /**
   * Mise à jour du formulaire (appelé par les composants enfants)
   * Valide en temps réel pour afficher les erreurs
   */
  const handleFormChange = (updates: Partial<ConventionFormData>): void => {
    const newFormData: ConventionFormData = { ...formData, ...updates };
    setFormData(newFormData);

    // Valider l'étape courante pour afficher les erreurs
    let validation: StepValidation;
    switch (activeStep) {
      case 0:
        validation = validateStep1(newFormData);
        break;
      case 1:
        validation = validateStep2(newFormData);
        break;
      case 2:
        validation = validateStep3(newFormData);
        break;
      default:
        validation = { isValid: true, errors: {} };
    }

    setValidationErrors(validation.errors);
  };

  /**
   * Vérifie si on peut passer à l'étape suivante
   */
  const canGoNext = (): boolean => {
    let validation: StepValidation;
    switch (activeStep) {
      case 0:
        validation = validateStep1(formData);
        break;
      case 1:
        validation = validateStep2(formData);
        break;
      case 2:
        validation = validateStep3(formData);
        break;
      default:
        return true;
    }
    return validation.isValid;
  };

  /**
   * Vérifie si on peut soumettre le formulaire
   */
  const canSubmit = (): boolean => {
    return canSubmitForm(formData, motifModification);
  };

  /**
   * Navigation entre les étapes
   */
  const handleNext = (): void => {
    // Valider l'étape courante avant de passer à la suivante
    if (!canGoNext()) {
      setError('Veuillez corriger les erreurs avant de continuer');
      return;
    }
    setError(null);
    setActiveStep((prev: number) => prev + 1);
  };

  const handleBack = (): void => {
    setError(null);
    setActiveStep((prev: number) => prev - 1);
  };

  /**
   * Soumission finale avec motif
   */
  const handleSubmit = async (): Promise<void> => {
    // Valider toutes les étapes et le motif
    if (!canSubmit()) {
      const allValidation: StepValidation = validateAllSteps(formData);
      const motifValidation: StepValidation = validateMotif(motifModification);

      if (!motifValidation.isValid) {
        setError(motifValidation.errors.motifModification || 'Le motif de modification est obligatoire');
      } else if (!allValidation.isValid) {
        setError('Veuillez corriger toutes les erreurs avant de soumettre');
      }
      return;
    }

    if (!id || !user) {
      setError('Données manquantes pour la modification');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const request = {
        motifModification: motifModification.trim(),
        modifieParId: user.id,
        ...formData,
      };

      await conventionsAPI.updateWithHistory(parseInt(id, 10), request);

      // Rediriger vers la page de détail
      navigate(`/conventions/${id}`);
    } catch (err: unknown) {
      console.error('Erreur modification convention:', err);
      setError('Erreur lors de la modification de la convention');
      setSubmitting(false);
    }
  };

  /**
   * Rendu du contenu de l'étape active
   */
  const renderStepContent = (): JSX.Element => {
    switch (activeStep) {
      case 0:
        return (
          <EditStep1Info
            formData={formData}
            onChange={handleFormChange}
            errors={validationErrors}
          />
        );
      case 1:
        return (
          <EditStep2Finances
            formData={formData}
            onChange={handleFormChange}
            errors={validationErrors}
          />
        );
      case 2:
        return (
          <EditStep3Dates
            formData={formData}
            onChange={handleFormChange}
            errors={validationErrors}
          />
        );
      case 3:
        return (
          <EditStep4Review
            formData={formData}
            motifModification={motifModification}
            onMotifChange={setMotifModification}
            errors={validationErrors}
          />
        );
      default:
        return <Typography>Étape inconnue</Typography>;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !formData.libelle) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button onClick={() => navigate('/conventions')} startIcon={<ArrowBack />}>
          Retour à la liste
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          onClick={() => navigate(`/conventions/${id}`)}
          startIcon={<ArrowBack />}
          variant="outlined"
        >
          Annuler
        </Button>
        <Typography variant="h4" sx={{ flex: 1 }}>
          Modifier la convention: {formData.numero}
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label: string) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Message d'erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Contenu de l'étape */}
        <Box sx={{ mb: 4, minHeight: '400px' }}>
          {renderStepContent()}
        </Box>

        {/* Boutons de navigation */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0 || submitting}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Précédent
          </Button>

          <Box sx={{ flex: 1 }} />

          {activeStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext() || submitting}
              endIcon={<ArrowForward />}
              variant="contained"
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit() || submitting}
              startIcon={<Save />}
              variant="contained"
              color="primary"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
