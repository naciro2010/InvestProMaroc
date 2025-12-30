-- =====================================================
-- SCRIPT DE RESET COMPLET FLYWAY + DATABASE
-- =====================================================
-- À exécuter MANUELLEMENT sur votre base de données
-- Ceci va supprimer l'historique Flyway et toutes les tables
-- =====================================================

-- 1. Supprimer l'historique Flyway pour permettre un fresh start
DROP TABLE IF EXISTS flyway_schema_history CASCADE;

-- 2. Désactiver les contraintes temporairement
SET session_replication_role = 'replica';

-- 3. Supprimer toutes les tables existantes
DROP TABLE IF EXISTS paiement_imputations CASCADE;
DROP TABLE IF EXISTS paiements CASCADE;
DROP TABLE IF EXISTS op_imputations CASCADE;
DROP TABLE IF EXISTS ordres_paiement CASCADE;
DROP TABLE IF EXISTS decompte_imputations CASCADE;
DROP TABLE IF EXISTS decompte_retenues CASCADE;
DROP TABLE IF EXISTS decomptes CASCADE;
DROP TABLE IF EXISTS marche_lignes CASCADE;
DROP TABLE IF EXISTS avenant_marches CASCADE;
DROP TABLE IF EXISTS bons_commande CASCADE;
DROP TABLE IF EXISTS marches CASCADE;
DROP TABLE IF EXISTS plan_analytique_valeurs CASCADE;
DROP TABLE IF EXISTS plan_analytique_dimensions CASCADE;
DROP TABLE IF EXISTS depenses_investissement CASCADE;
DROP TABLE IF EXISTS projet_axes CASCADE;
DROP TABLE IF EXISTS axes_analytiques CASCADE;
DROP TABLE IF EXISTS convention_projets CASCADE;
DROP TABLE IF EXISTS projets CASCADE;
DROP TABLE IF EXISTS conventions CASCADE;
DROP TABLE IF EXISTS comptes_bancaires CASCADE;
DROP TABLE IF EXISTS fournisseurs CASCADE;
DROP TABLE IF EXISTS commissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 4. Réactiver les contraintes
SET session_replication_role = 'origin';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- Après l'exécution de ce script:
-- 1. Redémarrez votre application backend
-- 2. Flyway va détecter qu'il n'y a pas d'historique
-- 3. Il va exécuter V1__init_clean_schema.sql (création tables)
-- 4. Puis V2__seed_demo_data.sql (users + data de démo)
-- 5. Tout sera propre sans erreur!
-- =====================================================
