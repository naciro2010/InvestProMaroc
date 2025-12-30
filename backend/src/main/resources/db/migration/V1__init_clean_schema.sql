-- =====================================================
-- Migration V24: Clean Schema avec toutes les tables
-- =====================================================
-- Cette migration crée un schéma propre from scratch
-- Supprime les anciennes tables et recrée tout

-- Désactiver les contraintes temporairement
SET session_replication_role = 'replica';

-- =====================================================
-- 1. NETTOYAGE - Drop toutes les tables existantes
-- =====================================================
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

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- =====================================================
-- 2. TABLES DE BASE - Users & Auth
-- =====================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- 3. RÉFÉRENTIEL - Fournisseurs
-- =====================================================

CREATE TABLE fournisseurs (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    raison_sociale VARCHAR(200) NOT NULL,
    ice VARCHAR(15),
    identifiant_fiscal VARCHAR(50),
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(100),
    contact_nom VARCHAR(100),
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fournisseurs_code ON fournisseurs(code);
CREATE INDEX idx_fournisseurs_ice ON fournisseurs(ice);

-- =====================================================
-- 4. RÉFÉRENTIEL - Comptes Bancaires
-- =====================================================

CREATE TABLE comptes_bancaires (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    banque VARCHAR(100),
    rib VARCHAR(24),
    iban VARCHAR(34),
    swift VARCHAR(11),
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comptes_code ON comptes_bancaires(code);

-- =====================================================
-- 5. PLAN ANALYTIQUE DYNAMIQUE
-- =====================================================

CREATE TABLE plan_analytique_dimensions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    ordre INTEGER DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plan_analytique_valeurs (
    id BIGSERIAL PRIMARY KEY,
    dimension_id BIGINT NOT NULL REFERENCES plan_analytique_dimensions(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    ordre INTEGER DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dimension_id, code)
);

CREATE INDEX idx_plan_valeurs_dimension ON plan_analytique_valeurs(dimension_id);
CREATE INDEX idx_plan_valeurs_code ON plan_analytique_valeurs(code);

-- =====================================================
-- 6. PROJETS
-- =====================================================

CREATE TABLE projets (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    budget_total DECIMAL(15,2),
    date_debut DATE,
    date_fin_prevue DATE,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projets_code ON projets(code);

-- =====================================================
-- 7. CONVENTIONS
-- =====================================================

CREATE TABLE conventions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    numero VARCHAR(100) UNIQUE,
    libelle VARCHAR(200) NOT NULL,
    type_convention VARCHAR(20) NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    date_convention DATE,
    date_debut DATE,
    date_fin_prevue DATE,
    montant_global_ht DECIMAL(15,2),
    montant_global_ttc DECIMAL(15,2),
    taux_tva DECIMAL(5,2) DEFAULT 20.00,
    objet TEXT,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conventions_code ON conventions(code);
CREATE INDEX idx_conventions_numero ON conventions(numero);
CREATE INDEX idx_conventions_type ON conventions(type_convention);
CREATE INDEX idx_conventions_statut ON conventions(statut);

-- Relation N-N Conventions <-> Projets
CREATE TABLE convention_projets (
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    projet_id BIGINT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    PRIMARY KEY (convention_id, projet_id)
);

-- =====================================================
-- 8. MARCHÉS
-- =====================================================

CREATE TABLE marches (
    id BIGSERIAL PRIMARY KEY,
    numero_marche VARCHAR(100) UNIQUE NOT NULL,
    convention_id BIGINT REFERENCES conventions(id) ON DELETE SET NULL,
    fournisseur_id BIGINT REFERENCES fournisseurs(id) ON DELETE SET NULL,
    objet TEXT,
    num_ao VARCHAR(100),
    date_marche DATE,
    date_debut DATE,
    date_fin_prevue DATE,
    delai_execution_mois INTEGER,
    montant_ht DECIMAL(15,2) DEFAULT 0,
    taux_tva DECIMAL(5,2) DEFAULT 20.00,
    montant_tva DECIMAL(15,2) DEFAULT 0,
    montant_ttc DECIMAL(15,2) DEFAULT 0,
    retenue_garantie DECIMAL(5,2),
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_COURS',
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marches_numero ON marches(numero_marche);
CREATE INDEX idx_marches_convention ON marches(convention_id);
CREATE INDEX idx_marches_fournisseur ON marches(fournisseur_id);
CREATE INDEX idx_marches_statut ON marches(statut);

-- =====================================================
-- 9. LIGNES DE MARCHÉ (avec imputation analytique JSONB)
-- =====================================================

CREATE TABLE marche_lignes (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT NOT NULL REFERENCES marches(id) ON DELETE CASCADE,
    numero_ligne INTEGER NOT NULL,
    designation VARCHAR(500) NOT NULL,
    unite VARCHAR(50),
    quantite DECIMAL(15,3),
    prix_unitaire_ht DECIMAL(15,2) NOT NULL,
    montant_ht DECIMAL(15,2) NOT NULL,
    taux_tva DECIMAL(5,2) DEFAULT 20.00,
    montant_tva DECIMAL(15,2) DEFAULT 0,
    montant_ttc DECIMAL(15,2) DEFAULT 0,
    imputation_analytique JSONB,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(marche_id, numero_ligne)
);

CREATE INDEX idx_marche_lignes_marche ON marche_lignes(marche_id);
CREATE INDEX idx_marche_lignes_imputation ON marche_lignes USING GIN(imputation_analytique);

-- =====================================================
-- 10. AVENANTS DE MARCHÉ
-- =====================================================

CREATE TABLE avenant_marches (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT NOT NULL REFERENCES marches(id) ON DELETE CASCADE,
    numero_avenant VARCHAR(50) NOT NULL,
    date_avenant DATE NOT NULL,
    objet TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    montant_initial_ht DECIMAL(15,2),
    montant_avenant_ht DECIMAL(15,2),
    montant_apres_ht DECIMAL(15,2),
    pourcentage_variation DECIMAL(5,2),
    delai_initial_mois INTEGER,
    delai_supplementaire_mois INTEGER,
    delai_apres_mois INTEGER,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(marche_id, numero_avenant)
);

CREATE INDEX idx_avenant_marches_marche ON avenant_marches(marche_id);

-- =====================================================
-- 11. DÉCOMPTES
-- =====================================================

CREATE TABLE decomptes (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT NOT NULL REFERENCES marches(id) ON DELETE CASCADE,
    numero_decompte VARCHAR(100) NOT NULL,
    date_decompte DATE NOT NULL,
    type_decompte VARCHAR(20),
    periode VARCHAR(100),
    montant_ht DECIMAL(15,2) DEFAULT 0,
    taux_tva DECIMAL(5,2) DEFAULT 20.00,
    montant_tva DECIMAL(15,2) DEFAULT 0,
    montant_ttc DECIMAL(15,2) DEFAULT 0,
    montant_retenue_garantie DECIMAL(15,2) DEFAULT 0,
    montant_autres_retenues DECIMAL(15,2) DEFAULT 0,
    montant_net DECIMAL(15,2) DEFAULT 0,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    date_validation DATE,
    valide_par VARCHAR(100),
    observations TEXT,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(marche_id, numero_decompte)
);

CREATE INDEX idx_decomptes_marche ON decomptes(marche_id);
CREATE INDEX idx_decomptes_statut ON decomptes(statut);

-- Imputations analytiques des décomptes (JSONB)
CREATE TABLE decompte_imputations (
    id BIGSERIAL PRIMARY KEY,
    decompte_id BIGINT NOT NULL REFERENCES decomptes(id) ON DELETE CASCADE,
    montant DECIMAL(15,2) NOT NULL,
    dimensions_valeurs JSONB NOT NULL,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_decompte_imputations_decompte ON decompte_imputations(decompte_id);
CREATE INDEX idx_decompte_imputations_dimensions ON decompte_imputations USING GIN(dimensions_valeurs);

-- =====================================================
-- 12. ORDRES DE PAIEMENT
-- =====================================================

CREATE TABLE ordres_paiement (
    id BIGSERIAL PRIMARY KEY,
    decompte_id BIGINT NOT NULL REFERENCES decomptes(id) ON DELETE CASCADE,
    numero_op VARCHAR(100) UNIQUE NOT NULL,
    date_emission DATE NOT NULL,
    montant_brut DECIMAL(15,2) NOT NULL,
    retenue_garantie DECIMAL(15,2) DEFAULT 0,
    autres_retenues DECIMAL(15,2) DEFAULT 0,
    montant_net DECIMAL(15,2) NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'PREPARE',
    date_visa DATE,
    date_ordonnancement DATE,
    observations TEXT,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_op_decompte ON ordres_paiement(decompte_id);
CREATE INDEX idx_op_statut ON ordres_paiement(statut);

-- Imputations analytiques des OP (JSONB)
CREATE TABLE op_imputations (
    id BIGSERIAL PRIMARY KEY,
    ordre_paiement_id BIGINT NOT NULL REFERENCES ordres_paiement(id) ON DELETE CASCADE,
    montant DECIMAL(15,2) NOT NULL,
    dimensions_valeurs JSONB NOT NULL,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_op_imputations_op ON op_imputations(ordre_paiement_id);
CREATE INDEX idx_op_imputations_dimensions ON op_imputations USING GIN(dimensions_valeurs);

-- =====================================================
-- 13. PAIEMENTS
-- =====================================================

CREATE TABLE paiements (
    id BIGSERIAL PRIMARY KEY,
    ordre_paiement_id BIGINT NOT NULL REFERENCES ordres_paiement(id) ON DELETE CASCADE,
    numero_paiement VARCHAR(100) UNIQUE NOT NULL,
    date_paiement DATE NOT NULL,
    montant_paye DECIMAL(15,2) NOT NULL,
    mode_paiement VARCHAR(20),
    reference_bancaire VARCHAR(100),
    observations TEXT,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_paiements_op ON paiements(ordre_paiement_id);

-- Imputations analytiques des paiements (JSONB)
CREATE TABLE paiement_imputations (
    id BIGSERIAL PRIMARY KEY,
    paiement_id BIGINT NOT NULL REFERENCES paiements(id) ON DELETE CASCADE,
    montant DECIMAL(15,2) NOT NULL,
    dimensions_valeurs JSONB NOT NULL,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_paiement_imputations_paiement ON paiement_imputations(paiement_id);
CREATE INDEX idx_paiement_imputations_dimensions ON paiement_imputations USING GIN(dimensions_valeurs);

-- =====================================================
-- 14. COMMISSIONS (calcul simplifié)
-- =====================================================

CREATE TABLE commissions (
    id BIGSERIAL PRIMARY KEY,
    reference VARCHAR(100) UNIQUE NOT NULL,
    periode VARCHAR(50),
    base_calcul DECIMAL(15,2) NOT NULL,
    taux_commission DECIMAL(5,2) NOT NULL,
    montant_commission DECIMAL(15,2) NOT NULL,
    statut VARCHAR(20) DEFAULT 'CALCULEE',
    date_calcul DATE DEFAULT CURRENT_DATE,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commissions_periode ON commissions(periode);
CREATE INDEX idx_commissions_statut ON commissions(statut);

-- =====================================================
-- 15. DÉPENSES INVESTISSEMENT (Legacy - peut être supprimé)
-- =====================================================

CREATE TABLE depenses_investissement (
    id BIGSERIAL PRIMARY KEY,
    reference VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    montant_ht DECIMAL(15,2) NOT NULL,
    taux_tva DECIMAL(5,2) DEFAULT 20.00,
    montant_tva DECIMAL(15,2),
    montant_ttc DECIMAL(15,2),
    date_depense DATE,
    fournisseur_id BIGINT REFERENCES fournisseurs(id),
    statut VARCHAR(20) DEFAULT 'EN_COURS',
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_depenses_reference ON depenses_investissement(reference);
CREATE INDEX idx_depenses_fournisseur ON depenses_investissement(fournisseur_id);

-- =====================================================
-- FIN DE LA MIGRATION V24
-- =====================================================
