-- Script pour nettoyer l'historique Flyway sur Railway
-- À exécuter via Railway CLI ou PostgreSQL client

-- Option 1: Supprimer uniquement V12 (permet à V13 de s'exécuter)
DELETE FROM flyway_schema_history WHERE version = '12';

-- Option 2: Vider tout l'historique (toutes les migrations se réappliqueront)
-- ATTENTION: Utiliser seulement si Option 1 ne fonctionne pas
-- TRUNCATE TABLE flyway_schema_history;

-- Après avoir exécuté l'une de ces commandes:
-- 1. Redéployer l'application sur Railway
-- 2. Flyway exécutera V13 (Option 1) ou V1-V13 (Option 2)
-- 3. Le backend démarrera normalement
