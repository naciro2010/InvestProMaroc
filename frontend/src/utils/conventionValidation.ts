/**
 * Validation utilities for Convention forms
 * Ensures data consistency and field coherence
 */

export interface ConventionFormData {
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

export interface ValidationErrors {
  libelle?: string;
  numero?: string;
  objet?: string;
  typeConvention?: string;
  tauxCommission?: string;
  budget?: string;
  baseCalcul?: string;
  tauxTva?: string;
  dateDebut?: string;
  dateFin?: string;
  description?: string;
  motifModification?: string;
}

export interface StepValidation {
  isValid: boolean;
  errors: ValidationErrors;
}

/**
 * Valide l'étape 1: Informations générales
 */
export function validateStep1(formData: ConventionFormData): StepValidation {
  const errors: ValidationErrors = {};

  // Libellé (obligatoire, 3-200 caractères)
  if (!formData.libelle || formData.libelle.trim().length === 0) {
    errors.libelle = 'Le libellé est obligatoire';
  } else if (formData.libelle.trim().length < 3) {
    errors.libelle = 'Le libellé doit contenir au moins 3 caractères';
  } else if (formData.libelle.length > 200) {
    errors.libelle = 'Le libellé ne peut pas dépasser 200 caractères';
  }

  // Numéro (obligatoire, format CONV-YYYY-XXX)
  if (!formData.numero || formData.numero.trim().length === 0) {
    errors.numero = 'Le numéro est obligatoire';
  } else if (!/^[A-Z]+-\d{4}-\d{3,}$/.test(formData.numero)) {
    errors.numero = 'Format invalide. Exemple: CONV-2026-001';
  }

  // Objet (obligatoire, 10-1000 caractères)
  if (!formData.objet || formData.objet.trim().length === 0) {
    errors.objet = "L'objet est obligatoire";
  } else if (formData.objet.trim().length < 10) {
    errors.objet = "L'objet doit contenir au moins 10 caractères";
  } else if (formData.objet.length > 1000) {
    errors.objet = "L'objet ne peut pas dépasser 1000 caractères";
  }

  // Type (obligatoire)
  if (!formData.typeConvention || !['CADRE', 'NON_CADRE'].includes(formData.typeConvention)) {
    errors.typeConvention = 'Le type de convention est obligatoire';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Valide l'étape 2: Paramètres financiers
 */
export function validateStep2(formData: ConventionFormData): StepValidation {
  const errors: ValidationErrors = {};

  // Budget (obligatoire, > 0)
  if (formData.budget === null || formData.budget === undefined) {
    errors.budget = 'Le budget est obligatoire';
  } else if (formData.budget <= 0) {
    errors.budget = 'Le budget doit être supérieur à 0';
  } else if (formData.budget > 999999999999) {
    errors.budget = 'Le budget ne peut pas dépasser 999 999 999 999 MAD';
  }

  // Taux de commission (obligatoire, 0-100)
  if (formData.tauxCommission === null || formData.tauxCommission === undefined) {
    errors.tauxCommission = 'Le taux de commission est obligatoire';
  } else if (formData.tauxCommission < 0) {
    errors.tauxCommission = 'Le taux de commission ne peut pas être négatif';
  } else if (formData.tauxCommission > 100) {
    errors.tauxCommission = 'Le taux de commission ne peut pas dépasser 100%';
  }

  // Base de calcul (optionnel, mais doit être valide si fournie)
  if (formData.baseCalcul && !['HT', 'TTC', 'TVA'].includes(formData.baseCalcul)) {
    errors.baseCalcul = 'Base de calcul invalide';
  }

  // Taux TVA (obligatoire, 0-20)
  if (formData.tauxTva === null || formData.tauxTva === undefined) {
    errors.tauxTva = 'Le taux TVA est obligatoire';
  } else if (formData.tauxTva < 0) {
    errors.tauxTva = 'Le taux TVA ne peut pas être négatif';
  } else if (formData.tauxTva > 20) {
    errors.tauxTva = 'Le taux TVA ne peut pas dépasser 20%';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Valide l'étape 3: Dates et description
 */
export function validateStep3(formData: ConventionFormData): StepValidation {
  const errors: ValidationErrors = {};

  // Date de début (obligatoire)
  if (!formData.dateDebut || formData.dateDebut.trim().length === 0) {
    errors.dateDebut = 'La date de début est obligatoire';
  } else {
    const dateDebut: Date = new Date(formData.dateDebut);
    if (isNaN(dateDebut.getTime())) {
      errors.dateDebut = 'Date de début invalide';
    }
  }

  // Date de fin (optionnel, mais doit être >= dateDebut si fournie)
  if (formData.dateFin && formData.dateFin.trim().length > 0) {
    const dateDebut: Date = new Date(formData.dateDebut);
    const dateFin: Date = new Date(formData.dateFin);

    if (isNaN(dateFin.getTime())) {
      errors.dateFin = 'Date de fin invalide';
    } else if (dateFin < dateDebut) {
      errors.dateFin = 'La date de fin doit être postérieure à la date de début';
    }
  }

  // Description (optionnel, mais max 5000 caractères si fournie)
  if (formData.description && formData.description.length > 5000) {
    errors.description = 'La description ne peut pas dépasser 5000 caractères';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Valide toutes les étapes (pour l'étape 4: Review)
 */
export function validateAllSteps(formData: ConventionFormData): StepValidation {
  const step1: StepValidation = validateStep1(formData);
  const step2: StepValidation = validateStep2(formData);
  const step3: StepValidation = validateStep3(formData);

  return {
    isValid: step1.isValid && step2.isValid && step3.isValid,
    errors: {
      ...step1.errors,
      ...step2.errors,
      ...step3.errors,
    },
  };
}

/**
 * Valide le motif de modification (étape 4)
 */
export function validateMotif(motif: string): StepValidation {
  const errors: ValidationErrors = {};

  if (!motif || motif.trim().length === 0) {
    errors.motifModification = 'Le motif de modification est obligatoire';
  } else if (motif.trim().length < 10) {
    errors.motifModification = 'Le motif doit contenir au moins 10 caractères';
  } else if (motif.length > 500) {
    errors.motifModification = 'Le motif ne peut pas dépasser 500 caractères';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Valide si on peut soumettre le formulaire (toutes les étapes + motif)
 */
export function canSubmitForm(formData: ConventionFormData, motif: string): boolean {
  const allStepsValid: StepValidation = validateAllSteps(formData);
  const motifValid: StepValidation = validateMotif(motif);

  return allStepsValid.isValid && motifValid.isValid;
}

/**
 * Obtient tous les messages d'erreur sous forme de tableau
 */
export function getAllErrorMessages(errors: ValidationErrors): string[] {
  return Object.values(errors).filter((error: string | undefined): error is string => Boolean(error));
}
