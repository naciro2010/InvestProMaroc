-- ==========================================
-- Migration V22: Nettoyage Ancien Système Analytique
-- ==========================================
-- Supprime les tables de l'ancien système rigide (Projet, Axe)
-- Remplacées par le système flexible Plan Analytique Dynamique (V21)

-- Supprimer les index sur les tables à dropper
DROP INDEX IF EXISTS idx_projets_code;
DROP INDEX IF EXISTS idx_projets_actif;
DROP INDEX IF EXISTS idx_axes_code;
DROP INDEX IF EXISTS idx_axes_actif;

-- Supprimer les contraintes de clés étrangères si elles existent
-- (ajuster selon les vraies relations dans votre schéma)
ALTER TABLE IF EXISTS decompte_imputations DROP CONSTRAINT IF EXISTS fk_decompte_imputation_projet;
ALTER TABLE IF EXISTS decompte_imputations DROP CONSTRAINT IF EXISTS fk_decompte_imputation_axe;

-- Supprimer les tables de l'ancien système
DROP TABLE IF EXISTS projets CASCADE;
DROP TABLE IF EXISTS axes_analytiques CASCADE;

-- Message de confirmation
COMMENT ON SCHEMA public IS 'Ancien système analytique supprimé - Migration vers Plan Analytique Dynamique terminée';
