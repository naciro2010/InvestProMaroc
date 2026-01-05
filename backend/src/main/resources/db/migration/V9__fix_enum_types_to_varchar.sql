-- ========================================================================================================
-- V9__fix_enum_types_to_varchar.sql
-- InvestPro Maroc - Convert PostgreSQL ENUM types to VARCHAR for JPA compatibility
-- ========================================================================================================
-- Description: JPA @Enumerated(EnumType.STRING) uses VARCHAR, not PostgreSQL custom ENUMs
-- This migration converts all ENUM columns to VARCHAR to fix INSERT errors
-- ========================================================================================================

-- Convert conventions.statut from statut_convention ENUM to VARCHAR
ALTER TABLE conventions
    ALTER COLUMN statut TYPE VARCHAR(20) USING statut::TEXT;

-- Convert conventions.type_convention from type_convention ENUM to VARCHAR
ALTER TABLE conventions
    ALTER COLUMN type_convention TYPE VARCHAR(20) USING type_convention::TEXT;

-- Convert marches.statut from statut_marche ENUM to VARCHAR
ALTER TABLE marches
    ALTER COLUMN statut TYPE VARCHAR(20) USING statut::TEXT;

-- Convert avenants.statut from statut_avenant ENUM to VARCHAR
ALTER TABLE avenants
    ALTER COLUMN statut TYPE VARCHAR(20) USING statut::TEXT;

-- Convert avenant_marches.statut from statut_avenant ENUM to VARCHAR
ALTER TABLE avenant_marches
    ALTER COLUMN statut TYPE VARCHAR(20) USING statut::TEXT;

-- Convert depenses_investissement.type_depense from type_depense ENUM to VARCHAR
ALTER TABLE depenses_investissement
    ALTER COLUMN type_depense TYPE VARCHAR(20) USING type_depense::TEXT;

-- Convert depenses_investissement.statut from statut_depense ENUM to VARCHAR
ALTER TABLE depenses_investissement
    ALTER COLUMN statut TYPE VARCHAR(20) USING statut::TEXT;

-- Convert depenses_investissement.base_calcul from base_calcul ENUM to VARCHAR
ALTER TABLE depenses_investissement
    ALTER COLUMN base_calcul TYPE VARCHAR(20) USING base_calcul::TEXT;

-- Convert bons_commande.statut from statut_bon_commande ENUM to VARCHAR
ALTER TABLE bons_commande
    ALTER COLUMN statut TYPE VARCHAR(30) USING statut::TEXT;

-- Convert decomptes.statut from statut_decompte ENUM to VARCHAR
ALTER TABLE decomptes
    ALTER COLUMN statut TYPE VARCHAR(20) USING statut::TEXT;

-- Convert decompte_retenues.type_retenue from type_retenue ENUM to VARCHAR
ALTER TABLE decompte_retenues
    ALTER COLUMN type_retenue TYPE VARCHAR(20) USING type_retenue::TEXT;

-- Convert budgets.statut from statut_budget ENUM to VARCHAR
ALTER TABLE budgets
    ALTER COLUMN statut TYPE VARCHAR(20) USING statut::TEXT;

-- Convert ordres_paiement.statut from statut_op ENUM to VARCHAR
ALTER TABLE ordres_paiement
    ALTER COLUMN statut TYPE VARCHAR(20) USING statut::TEXT;

-- Convert ordres_paiement.mode_paiement from mode_paiement ENUM to VARCHAR
ALTER TABLE ordres_paiement
    ALTER COLUMN mode_paiement TYPE VARCHAR(20) USING mode_paiement::TEXT;

-- Convert paiements.mode_paiement from mode_paiement ENUM to VARCHAR
ALTER TABLE paiements
    ALTER COLUMN mode_paiement TYPE VARCHAR(20) USING mode_paiement::TEXT;

-- Convert echeances_subvention.statut from statut_echeance ENUM to VARCHAR
ALTER TABLE echeances_subvention
    ALTER COLUMN statut TYPE VARCHAR(20) USING statut::TEXT;

-- Convert imputations_analytiques.type_imputation from type_imputation ENUM to VARCHAR
ALTER TABLE imputations_analytiques
    ALTER COLUMN type_imputation TYPE VARCHAR(20) USING type_imputation::TEXT;

-- ========================================================================================================
-- CLEANUP: Drop old ENUM types (no longer needed)
-- ========================================================================================================

-- Note: We keep the ENUM types for now in case they're needed for rollback
-- They can be dropped later once the migration is confirmed working in production

-- DROP TYPE IF EXISTS type_convention CASCADE;
-- DROP TYPE IF EXISTS statut_convention CASCADE;
-- DROP TYPE IF EXISTS statut_marche CASCADE;
-- DROP TYPE IF EXISTS statut_avenant CASCADE;
-- DROP TYPE IF EXISTS type_depense CASCADE;
-- DROP TYPE IF EXISTS statut_depense CASCADE;
-- DROP TYPE IF EXISTS base_calcul CASCADE;
-- DROP TYPE IF EXISTS statut_bon_commande CASCADE;
-- DROP TYPE IF EXISTS statut_decompte CASCADE;
-- DROP TYPE IF EXISTS type_retenue CASCADE;
-- DROP TYPE IF EXISTS statut_budget CASCADE;
-- DROP TYPE IF EXISTS mode_paiement CASCADE;
-- DROP TYPE IF EXISTS statut_op CASCADE;
-- DROP TYPE IF EXISTS statut_echeance CASCADE;
-- DROP TYPE IF EXISTS type_imputation CASCADE;

-- ========================================================================================================
-- END OF MIGRATION
-- ========================================================================================================
