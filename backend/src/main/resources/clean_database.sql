-- =====================================================
-- SCRIPT DE NETTOYAGE COMPLET DE LA BASE DE DONNÉES
-- =====================================================
-- Ce script supprime TOUTES les tables existantes
-- pour permettre à Hibernate de recréer le schéma from scratch
--
-- ATTENTION: Ceci supprime TOUTES les données!
-- Utilisez UNIQUEMENT en développement ou après backup!
-- =====================================================

-- Désactiver les contraintes de clé étrangère temporairement
SET session_replication_role = 'replica';

-- Supprimer toutes les tables dans l'ordre inverse des dépendances
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

-- Supprimer la table Flyway si elle existe
DROP TABLE IF EXISTS flyway_schema_history CASCADE;

-- Réactiver les contraintes de clé étrangère
SET session_replication_role = 'origin';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- Après l'exécution de ce script:
-- 1. Assurez-vous que spring.flyway.enabled=false dans application.properties
-- 2. Assurez-vous que spring.jpa.hibernate.ddl-auto=update dans application.properties
-- 3. Redémarrez l'application Spring Boot
-- 4. Hibernate va automatiquement recréer toutes les tables
-- =====================================================
