-- Drop all tables (clean slate)
-- Order matters: drop dependent tables first (child tables before parent tables)

-- Payment cycle
DROP TABLE IF EXISTS paiement_imputations CASCADE;
DROP TABLE IF EXISTS paiements CASCADE;
DROP TABLE IF EXISTS op_imputations CASCADE;
DROP TABLE IF EXISTS ordres_paiement CASCADE;
DROP TABLE IF EXISTS decompte_imputations CASCADE;
DROP TABLE IF EXISTS decompte_retenues CASCADE;
DROP TABLE IF EXISTS decomptes CASCADE;

-- Commissions and investments
DROP TABLE IF EXISTS commissions CASCADE;
DROP TABLE IF EXISTS depenses_investissement CASCADE;
DROP TABLE IF EXISTS bons_commande CASCADE;

-- Marchés and amendments
DROP TABLE IF EXISTS avenant_marches CASCADE;
DROP TABLE IF EXISTS marche_lignes CASCADE;
DROP TABLE IF EXISTS marches CASCADE;

-- Subventions
DROP TABLE IF EXISTS echeances_subvention CASCADE;
DROP TABLE IF EXISTS subventions CASCADE;

-- Budget
DROP TABLE IF EXISTS budget_ligne_imputations CASCADE;
DROP TABLE IF EXISTS convention_budget_lignes CASCADE;
DROP TABLE IF EXISTS versements_previsionnels CASCADE;
DROP TABLE IF EXISTS imputations_previsionnelles CASCADE;
DROP TABLE IF EXISTS lignes_budget CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;

-- Conventions and amendments
DROP TABLE IF EXISTS convention_modifications CASCADE;
DROP TABLE IF EXISTS avenant_conventions CASCADE;
DROP TABLE IF EXISTS avenants CASCADE;
DROP TABLE IF EXISTS convention_type_configurations CASCADE;
DROP TABLE IF EXISTS convention_configurations CASCADE;
DROP TABLE IF EXISTS convention_partenaires CASCADE;
DROP TABLE IF EXISTS projet_conventions CASCADE;
DROP TABLE IF EXISTS conventions CASCADE;

-- Analytics
DROP TABLE IF EXISTS imputations_analytiques CASCADE;
DROP TABLE IF EXISTS valeurs_dimensions CASCADE;
DROP TABLE IF EXISTS dimensions_analytiques CASCADE;

-- Reference data
DROP TABLE IF EXISTS categories_depenses CASCADE;
DROP TABLE IF EXISTS maitres_oeuvre CASCADE;
DROP TABLE IF EXISTS pieces_jointes CASCADE;

-- Organizations
DROP TABLE IF EXISTS comptes_bancaires CASCADE;
DROP TABLE IF EXISTS fournisseurs CASCADE;
DROP TABLE IF EXISTS partenaires CASCADE;

-- Projects
DROP TABLE IF EXISTS projets CASCADE;

-- Users
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Convention management extensions
DROP TABLE IF EXISTS convention_tag_assignments CASCADE;
DROP TABLE IF EXISTS convention_tags CASCADE;
DROP TABLE IF EXISTS convention_followers CASCADE;
DROP TABLE IF EXISTS convention_comments CASCADE;

-- Activity and audit tracking
DROP TABLE IF EXISTS activites_planifiees CASCADE;
DROP TABLE IF EXISTS entity_modifications CASCADE;

-- Notifications & Messaging
DROP TABLE IF EXISTS team_messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Legacy/stale tables from previous migrations
DROP TABLE IF EXISTS ordres_service CASCADE;
