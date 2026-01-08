-- ========================================================================================================
-- V1__clean_schema.sql
-- InvestPro Maroc - Complete Database Schema
-- PostgreSQL 16 - PRODUCTION READY
-- ========================================================================================================
-- Description: Complete schema for investment tracking, conventions, markets, and analytical reporting
-- Created: 2025-12-31
-- Entities: 30+ entities with full relationships, constraints, and indexes
-- ========================================================================================================

-- ========================================================================================================
-- SECTION 0: CLEANUP - DROP ALL EXISTING OBJECTS (Idempotent migration)
-- ========================================================================================================

-- Drop all triggers (to avoid constraint violations when dropping tables)
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I CASCADE',
            trigger_record.trigger_name,
            trigger_record.event_object_table);
    END LOOP;
END $$;

-- Drop all trigger functions
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT routine_name, routine_schema
        FROM information_schema.routines
        WHERE routine_schema = 'public'
        AND routine_name LIKE 'trigger_%'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I() CASCADE', func_record.routine_name);
    END LOOP;
END $$;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop all tables (in reverse order of foreign keys)
DROP TABLE IF EXISTS paiement_imputations CASCADE;
DROP TABLE IF EXISTS paiements CASCADE;
DROP TABLE IF EXISTS op_imputations CASCADE;
DROP TABLE IF EXISTS ordres_paiement CASCADE;
DROP TABLE IF EXISTS decompte_imputations CASCADE;
DROP TABLE IF EXISTS decompte_retenues CASCADE;
DROP TABLE IF EXISTS decomptes CASCADE;
DROP TABLE IF EXISTS bons_commande CASCADE;
DROP TABLE IF EXISTS avenant_marches CASCADE;
DROP TABLE IF EXISTS marche_lignes CASCADE;
DROP TABLE IF EXISTS marches CASCADE;
DROP TABLE IF EXISTS commissions CASCADE;
DROP TABLE IF EXISTS depenses_investissement CASCADE;
DROP TABLE IF EXISTS imputations_analytiques CASCADE;
DROP TABLE IF EXISTS imputations_previsionnelles CASCADE;
DROP TABLE IF EXISTS versements_previsionnels CASCADE;
DROP TABLE IF EXISTS echeances_subvention CASCADE;
DROP TABLE IF EXISTS subventions CASCADE;
DROP TABLE IF EXISTS lignes_budget CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS avenants CASCADE;
DROP TABLE IF EXISTS convention_partenaires CASCADE;
DROP TABLE IF EXISTS conventions CASCADE;
DROP TABLE IF EXISTS valeurs_dimensions CASCADE;
DROP TABLE IF EXISTS dimensions_analytiques CASCADE;
DROP TABLE IF EXISTS comptes_bancaires CASCADE;
DROP TABLE IF EXISTS fournisseurs CASCADE;
DROP TABLE IF EXISTS partenaires CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all ENUM types
DROP TYPE IF EXISTS type_convention CASCADE;
DROP TYPE IF EXISTS statut_convention CASCADE;
DROP TYPE IF EXISTS statut_marche CASCADE;
DROP TYPE IF EXISTS statut_avenant CASCADE;
DROP TYPE IF EXISTS type_depense CASCADE;
DROP TYPE IF EXISTS statut_depense CASCADE;
DROP TYPE IF EXISTS base_calcul CASCADE;
DROP TYPE IF EXISTS statut_bon_commande CASCADE;
DROP TYPE IF EXISTS statut_decompte CASCADE;
DROP TYPE IF EXISTS type_retenue CASCADE;
DROP TYPE IF EXISTS statut_budget CASCADE;
DROP TYPE IF EXISTS mode_paiement CASCADE;
DROP TYPE IF EXISTS statut_op CASCADE;
DROP TYPE IF EXISTS statut_echeance CASCADE;
DROP TYPE IF EXISTS type_imputation CASCADE;

-- ========================================================================================================
-- SECTION 1: ENUMERATIONS (Custom PostgreSQL ENUM Types)
-- ========================================================================================================

-- Convention enums
CREATE TYPE type_convention AS ENUM ('CADRE', 'NON_CADRE', 'SPECIFIQUE', 'AVENANT');
CREATE TYPE statut_convention AS ENUM ('BROUILLON', 'SOUMIS', 'VALIDEE', 'EN_COURS', 'ACHEVE', 'EN_RETARD', 'ANNULE');

-- Marché enums
CREATE TYPE statut_marche AS ENUM ('EN_COURS', 'VALIDE', 'TERMINE', 'SUSPENDU', 'ANNULE', 'EN_ATTENTE');
CREATE TYPE statut_avenant AS ENUM ('BROUILLON', 'SOUMIS', 'VALIDE', 'REJETE', 'ANNULE');

-- Dépense enums
CREATE TYPE type_depense AS ENUM ('STANDARD', 'CADRE', 'NON_CADRE', 'SPECIFIQUE', 'AVENANT');
CREATE TYPE statut_depense AS ENUM ('VALIDEE', 'EN_COURS', 'ACHEVE', 'EN_RETARD', 'ANNULE');
CREATE TYPE base_calcul AS ENUM ('TTC', 'HT');

-- Bon de commande enum
CREATE TYPE statut_bon_commande AS ENUM ('EN_ATTENTE', 'APPROUVE', 'EN_COURS', 'LIVRE', 'ANNULE');

-- Décompte enums
CREATE TYPE statut_decompte AS ENUM ('BROUILLON', 'SOUMIS', 'VALIDE', 'REJETE', 'PAYE_PARTIEL', 'PAYE_TOTAL');
CREATE TYPE type_retenue AS ENUM ('GARANTIE', 'RAS', 'PENALITES', 'AVANCES');

-- Budget enum
CREATE TYPE statut_budget AS ENUM ('BROUILLON', 'SOUMIS', 'VALIDE', 'REJETE', 'ARCHIVE');

-- Paiement enums
CREATE TYPE mode_paiement AS ENUM ('VIREMENT', 'CHEQUE', 'ESPECES', 'AUTRE');
CREATE TYPE statut_op AS ENUM ('BROUILLON', 'VALIDE', 'EXECUTE', 'REJETE', 'ANNULE');
CREATE TYPE statut_echeance AS ENUM ('PREVU', 'RECU', 'RETARD', 'ANNULE');

-- Imputation enum
CREATE TYPE type_imputation AS ENUM ('BUDGET', 'DECOMPTE', 'ORDRE_PAIEMENT', 'PAIEMENT');

-- ========================================================================================================
-- SECTION 2: BASE TABLES (No Foreign Key Dependencies)
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- TABLE: users - Authentication and authorization
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE users (
    id                       BIGSERIAL PRIMARY KEY,
    username                 VARCHAR(50) NOT NULL UNIQUE,
    email                    VARCHAR(150) NOT NULL UNIQUE,
    password                 VARCHAR(255) NOT NULL,
    full_name                VARCHAR(100) NOT NULL,
    account_non_expired      BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked       BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired  BOOLEAN NOT NULL DEFAULT TRUE,
    enabled                  BOOLEAN NOT NULL DEFAULT TRUE,
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_users_username_length CHECK (LENGTH(username) >= 3),
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_actif ON users(actif);

COMMENT ON TABLE users IS 'System users with authentication credentials and roles';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: user_roles - User role assignments
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE user_roles (
    id      BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role    VARCHAR(50) NOT NULL,

    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_role UNIQUE (user_id, role)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

COMMENT ON TABLE user_roles IS 'User role mappings (ADMIN, MANAGER, USER)';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: partenaires - Partner organizations (Ministries, Agencies, International Organizations)
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE partenaires (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(50) NOT NULL UNIQUE,
    raison_sociale  VARCHAR(200) NOT NULL,
    sigle           VARCHAR(100),
    type_partenaire VARCHAR(50),
    email           VARCHAR(100),
    telephone       VARCHAR(20),
    adresse         TEXT,
    description     TEXT,
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_partenaires_code_not_empty CHECK (LENGTH(TRIM(code)) > 0)
);

CREATE INDEX idx_partenaires_code ON partenaires(code);
CREATE INDEX idx_partenaires_actif ON partenaires(actif);
CREATE INDEX idx_partenaires_type ON partenaires(type_partenaire);

COMMENT ON TABLE partenaires IS 'Partner organizations participating in conventions';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: fournisseurs - Suppliers with Moroccan tax identifiers
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE fournisseurs (
    id                   BIGSERIAL PRIMARY KEY,
    code                 VARCHAR(50) NOT NULL UNIQUE,
    raison_sociale       VARCHAR(200) NOT NULL,
    identifiant_fiscal   VARCHAR(20),
    ice                  VARCHAR(15) UNIQUE,
    adresse              TEXT,
    ville                VARCHAR(100),
    telephone            VARCHAR(20),
    fax                  VARCHAR(20),
    email                VARCHAR(150),
    contact              VARCHAR(100),
    non_resident         BOOLEAN NOT NULL DEFAULT FALSE,
    remarques            TEXT,
    actif                BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_fournisseurs_code_not_empty CHECK (LENGTH(TRIM(code)) > 0),
    CONSTRAINT chk_fournisseurs_ice_format CHECK (ice IS NULL OR ice ~ '^[0-9]{15}$'),
    CONSTRAINT chk_fournisseurs_if_numeric CHECK (identifiant_fiscal IS NULL OR identifiant_fiscal ~ '^[0-9]*$')
);

CREATE INDEX idx_fournisseurs_code ON fournisseurs(code);
CREATE INDEX idx_fournisseurs_ice ON fournisseurs(ice);
CREATE INDEX idx_fournisseurs_actif ON fournisseurs(actif);
CREATE INDEX idx_fournisseurs_non_resident ON fournisseurs(non_resident);

COMMENT ON TABLE fournisseurs IS 'Suppliers with Moroccan tax identifiers (ICE, IF)';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: comptes_bancaires - Bank accounts with RIB (Moroccan standard)
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE comptes_bancaires (
    id           BIGSERIAL PRIMARY KEY,
    code         VARCHAR(50) NOT NULL UNIQUE,
    rib          VARCHAR(24) NOT NULL UNIQUE,
    banque       VARCHAR(200) NOT NULL,
    agence       VARCHAR(200),
    type_compte  VARCHAR(50),
    titulaire    VARCHAR(200),
    devise       VARCHAR(10) NOT NULL DEFAULT 'MAD',
    remarques    TEXT,
    actif        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_comptes_code_not_empty CHECK (LENGTH(TRIM(code)) > 0),
    CONSTRAINT chk_comptes_rib_format CHECK (rib ~ '^[0-9]{24}$')
);

CREATE INDEX idx_comptes_bancaires_code ON comptes_bancaires(code);
CREATE INDEX idx_comptes_bancaires_rib ON comptes_bancaires(rib);
CREATE INDEX idx_comptes_bancaires_actif ON comptes_bancaires(actif);

COMMENT ON TABLE comptes_bancaires IS 'Bank accounts with 24-digit RIB (Moroccan standard)';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: dimensions_analytiques - Analytical dimension configuration
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE dimensions_analytiques (
    id             BIGSERIAL PRIMARY KEY,
    code           VARCHAR(20) NOT NULL UNIQUE,
    nom            VARCHAR(100) NOT NULL,
    description    VARCHAR(500),
    ordre          INT NOT NULL DEFAULT 0,
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    obligatoire    BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_id  BIGINT,
    actif          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_dimensions_code_not_empty CHECK (LENGTH(TRIM(code)) > 0),
    CONSTRAINT fk_dimensions_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_dimensions_code ON dimensions_analytiques(code);
CREATE INDEX idx_dimensions_active ON dimensions_analytiques(active);

COMMENT ON TABLE dimensions_analytiques IS 'Dynamic analytical dimensions configuration (Region, Market, Phase, etc.)';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: valeurs_dimensions - Possible values for analytical dimensions
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE valeurs_dimensions (
    id            BIGSERIAL PRIMARY KEY,
    dimension_id  BIGINT NOT NULL,
    code          VARCHAR(50) NOT NULL,
    libelle       VARCHAR(200) NOT NULL,
    description   VARCHAR(500),
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    ordre         INT NOT NULL DEFAULT 0,
    actif         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_valeurs_dimension FOREIGN KEY (dimension_id) REFERENCES dimensions_analytiques(id) ON DELETE CASCADE,
    CONSTRAINT uk_valeur_code UNIQUE (dimension_id, code),
    CONSTRAINT chk_valeurs_code_not_empty CHECK (LENGTH(TRIM(code)) > 0)
);

CREATE INDEX idx_valeurs_dimension ON valeurs_dimensions(dimension_id);
CREATE INDEX idx_valeurs_active ON valeurs_dimensions(active);

COMMENT ON TABLE valeurs_dimensions IS 'Values for each analytical dimension (e.g., Casablanca, Rabat for Region)';

-- ========================================================================================================
-- SECTION 3: CONVENTION MANAGEMENT
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- TABLE: conventions - Main convention entity with versions
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE conventions (
    id                        BIGSERIAL PRIMARY KEY,
    code                      VARCHAR(50) NOT NULL UNIQUE,
    numero                    VARCHAR(100) NOT NULL UNIQUE,
    date_convention           DATE NOT NULL,
    type_convention           type_convention NOT NULL,
    statut                    statut_convention NOT NULL,
    libelle                   VARCHAR(200) NOT NULL,
    objet                     TEXT,
    taux_commission           DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    budget                    DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    base_calcul               VARCHAR(20) NOT NULL DEFAULT 'DECAISSEMENTS_TTC',
    taux_tva                  DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    date_debut                DATE NOT NULL,
    date_fin                  DATE,
    description               TEXT,
    date_soumission           DATE,
    date_validation           DATE,
    valide_par_id             BIGINT,
    version                   VARCHAR(10),
    is_locked                 BOOLEAN NOT NULL DEFAULT FALSE,
    motif_verrouillage        TEXT,
    parent_convention_id      BIGINT,
    herite_parametres         BOOLEAN NOT NULL DEFAULT FALSE,
    surcharge_taux_commission DECIMAL(5,2),
    surcharge_base_calcul     VARCHAR(50),
    actif                     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_conventions_taux_commission CHECK (taux_commission >= 0.00 AND taux_commission <= 100.00),
    CONSTRAINT chk_conventions_taux_tva CHECK (taux_tva >= 0.00),
    CONSTRAINT chk_conventions_budget CHECK (budget >= 0.00),
    CONSTRAINT chk_conventions_dates CHECK (date_fin IS NULL OR date_fin >= date_debut),
    CONSTRAINT fk_conventions_parent FOREIGN KEY (parent_convention_id) REFERENCES conventions(id) ON DELETE RESTRICT
);

CREATE INDEX idx_conventions_code ON conventions(code);
CREATE INDEX idx_conventions_numero ON conventions(numero);
CREATE INDEX idx_conventions_type ON conventions(type_convention);
CREATE INDEX idx_conventions_statut ON conventions(statut);
CREATE INDEX idx_conventions_actif ON conventions(actif);
CREATE INDEX idx_conventions_dates ON conventions(date_debut, date_fin);
CREATE INDEX idx_conventions_parent ON conventions(parent_convention_id);

COMMENT ON TABLE conventions IS 'Conventions with 4 types (CADRE, NON_CADRE, SPECIFIQUE, AVENANT) and workflow management';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: convention_partenaires - Many-to-many with budget allocations
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE convention_partenaires (
    id                         BIGSERIAL PRIMARY KEY,
    convention_id              BIGINT NOT NULL,
    partenaire_id              BIGINT NOT NULL,
    budget_alloue              DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    pourcentage                DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    commission_intervention    DECIMAL(15,2),
    est_maitre_oeuvre          BOOLEAN NOT NULL DEFAULT FALSE,
    est_maitre_oeuvre_delegue  BOOLEAN NOT NULL DEFAULT FALSE,
    remarques                  TEXT,
    actif                      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                 TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_convention_partenaires_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE CASCADE,
    CONSTRAINT fk_convention_partenaires_partenaire FOREIGN KEY (partenaire_id) REFERENCES partenaires(id) ON DELETE RESTRICT,
    CONSTRAINT uk_convention_partenaire UNIQUE (convention_id, partenaire_id),
    CONSTRAINT chk_convention_partenaires_pourcentage CHECK (pourcentage >= 0.00 AND pourcentage <= 100.00),
    CONSTRAINT chk_convention_partenaires_budget CHECK (budget_alloue >= 0.00)
);

CREATE INDEX idx_convention_partenaires_convention ON convention_partenaires(convention_id);
CREATE INDEX idx_convention_partenaires_partenaire ON convention_partenaires(partenaire_id);

COMMENT ON TABLE convention_partenaires IS 'Partner allocations within conventions with budget percentages';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: avenants - Convention amendments with version tracking
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE avenants (
    id                       BIGSERIAL PRIMARY KEY,
    convention_id            BIGINT NOT NULL,
    numero_avenant           VARCHAR(50) NOT NULL,
    date_avenant             DATE NOT NULL,
    date_signature           DATE,
    statut                   statut_avenant NOT NULL,
    version_resultante       VARCHAR(10) NOT NULL,
    objet                    TEXT NOT NULL,
    montant_avant            DECIMAL(15,2),
    taux_commission_avant    DECIMAL(5,2),
    date_fin_avant           DATE,
    montant_apres            DECIMAL(15,2),
    taux_commission_apres    DECIMAL(5,2),
    date_fin_apres           DATE,
    impact_montant           DECIMAL(15,2),
    impact_commission        DECIMAL(15,2),
    impact_delai_jours       INT,
    justification            TEXT,
    details                  TEXT,
    date_validation          DATE,
    valide_par_id            BIGINT,
    is_locked                BOOLEAN NOT NULL DEFAULT FALSE,
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_avenants_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE CASCADE,
    CONSTRAINT chk_avenants_numero_not_empty CHECK (LENGTH(TRIM(numero_avenant)) > 0)
);

CREATE INDEX idx_avenants_convention ON avenants(convention_id);
CREATE INDEX idx_avenants_numero ON avenants(numero_avenant);
CREATE INDEX idx_avenants_statut ON avenants(statut);
CREATE INDEX idx_avenants_version ON avenants(version_resultante);

COMMENT ON TABLE avenants IS 'Convention amendments tracking BEFORE/AFTER values and impacts';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: budgets - Budget management with versions (V0, V1, V2...)
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE budgets (
    id                   BIGSERIAL PRIMARY KEY,
    convention_id        BIGINT NOT NULL,
    version              VARCHAR(10) NOT NULL,
    date_budget          DATE NOT NULL,
    statut               statut_budget NOT NULL,
    plafond_convention   DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_budget         DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    budget_precedent_id  BIGINT,
    delta_montant        DECIMAL(15,2),
    justification        TEXT,
    observations         TEXT,
    date_validation      DATE,
    valide_par_id        BIGINT,
    actif                BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_budgets_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE CASCADE,
    CONSTRAINT chk_budgets_version_not_empty CHECK (LENGTH(TRIM(version)) > 0),
    CONSTRAINT chk_budgets_plafond CHECK (plafond_convention >= 0.00),
    CONSTRAINT chk_budgets_total CHECK (total_budget >= 0.00)
);

CREATE INDEX idx_budgets_convention ON budgets(convention_id);
CREATE INDEX idx_budgets_version ON budgets(version);
CREATE INDEX idx_budgets_statut ON budgets(statut);

COMMENT ON TABLE budgets IS 'Budget versions (V0=initial, V1/V2/V3=revisions)';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: lignes_budget - Budget line items
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE lignes_budget (
    id               BIGSERIAL PRIMARY KEY,
    budget_id        BIGINT NOT NULL,
    code             VARCHAR(50) NOT NULL,
    libelle          VARCHAR(200) NOT NULL,
    montant          DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    ordre_affichage  INT NOT NULL DEFAULT 0,
    description      TEXT,
    actif            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_lignes_budget_budget FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
    CONSTRAINT chk_lignes_budget_montant CHECK (montant >= 0.00)
);

CREATE INDEX idx_lignes_budget_budget ON lignes_budget(budget_id);

COMMENT ON TABLE lignes_budget IS 'Budget line items (chapters/posts)';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: imputations_previsionnelles - Forecast budget allocation
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE imputations_previsionnelles (
    id               BIGSERIAL PRIMARY KEY,
    convention_id    BIGINT NOT NULL,
    volet            VARCHAR(200),
    date_demarrage   DATE NOT NULL,
    delai_mois       INT NOT NULL,
    date_fin_prevue  DATE,
    remarques        TEXT,
    actif            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_imputations_previsionnelles_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE CASCADE,
    CONSTRAINT chk_imputations_delai CHECK (delai_mois > 0)
);

CREATE INDEX idx_imputations_convention ON imputations_previsionnelles(convention_id);

COMMENT ON TABLE imputations_previsionnelles IS 'Forecast budget allocations with timeline';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: versements_previsionnels - Planned payment schedule
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE versements_previsionnels (
    id                        BIGSERIAL PRIMARY KEY,
    convention_id             BIGINT NOT NULL,
    volet                     VARCHAR(200),
    date_versement            DATE NOT NULL,
    montant                   DECIMAL(15,2) NOT NULL,
    partenaire_id             BIGINT NOT NULL,
    mod_id                    BIGINT,
    remarques                 TEXT,
    actif                     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_versements_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE CASCADE,
    CONSTRAINT fk_versements_partenaire FOREIGN KEY (partenaire_id) REFERENCES partenaires(id) ON DELETE RESTRICT,
    CONSTRAINT fk_versements_mod FOREIGN KEY (mod_id) REFERENCES partenaires(id) ON DELETE SET NULL,
    CONSTRAINT chk_versements_montant CHECK (montant > 0.00)
);

CREATE INDEX idx_versements_convention ON versements_previsionnels(convention_id);
CREATE INDEX idx_versements_partenaire ON versements_previsionnels(partenaire_id);
CREATE INDEX idx_versements_date ON versements_previsionnels(date_versement);

COMMENT ON TABLE versements_previsionnels IS 'Planned payment schedule for conventions';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: subventions - External funding (grants, loans)
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE subventions (
    id                   BIGSERIAL PRIMARY KEY,
    convention_id        BIGINT NOT NULL,
    organisme_bailleur   VARCHAR(200) NOT NULL,
    type_subvention      VARCHAR(50),
    montant_total        DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    devise               VARCHAR(3) NOT NULL DEFAULT 'MAD',
    taux_change          DECIMAL(10,4),
    date_signature       DATE,
    date_debut_validite  DATE,
    date_fin_validite    DATE,
    conditions           TEXT,
    observations         TEXT,
    actif                BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_subventions_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE CASCADE,
    CONSTRAINT chk_subventions_montant CHECK (montant_total >= 0.00)
);

CREATE INDEX idx_subventions_convention ON subventions(convention_id);
CREATE INDEX idx_subventions_organisme ON subventions(organisme_bailleur);

COMMENT ON TABLE subventions IS 'External funding sources (donors, international organizations)';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: echeances_subvention - Payment schedule for grants
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE echeances_subvention (
    id              BIGSERIAL PRIMARY KEY,
    subvention_id   BIGINT NOT NULL,
    date_echeance   DATE NOT NULL,
    montant         DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    statut          statut_echeance NOT NULL,
    date_reception  DATE,
    libelle         VARCHAR(200),
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_echeances_subvention FOREIGN KEY (subvention_id) REFERENCES subventions(id) ON DELETE CASCADE,
    CONSTRAINT chk_echeances_montant CHECK (montant >= 0.00)
);

CREATE INDEX idx_echeances_subvention ON echeances_subvention(subvention_id);

COMMENT ON TABLE echeances_subvention IS 'Payment milestones for grant disbursements';

-- ========================================================================================================
-- SECTION 4: MARKET MANAGEMENT (Procurement)
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- TABLE: marches - Public procurement contracts
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE marches (
    id                    BIGSERIAL PRIMARY KEY,
    numero_marche         VARCHAR(100) NOT NULL UNIQUE,
    num_ao                VARCHAR(100),
    date_marche           DATE NOT NULL,
    fournisseur_id        BIGINT NOT NULL,
    convention_id         BIGINT,
    objet                 TEXT NOT NULL,
    montant_ht            DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    taux_tva              DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    montant_tva           DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    montant_ttc           DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    statut                statut_marche NOT NULL,
    date_debut            DATE,
    date_fin_prevue       DATE,
    delai_execution_mois  INT,
    retenue_garantie      DECIMAL(15,2) DEFAULT 0.00,
    remarques             TEXT,
    actif                 BOOLEAN NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_marches_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE RESTRICT,
    CONSTRAINT fk_marches_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE SET NULL,
    CONSTRAINT chk_marches_montants CHECK (montant_ht >= 0.00 AND montant_tva >= 0.00 AND montant_ttc >= 0.00),
    CONSTRAINT chk_marches_taux_tva CHECK (taux_tva >= 0.00)
);

CREATE UNIQUE INDEX idx_marches_numero ON marches(numero_marche);
CREATE INDEX idx_marches_num_ao ON marches(num_ao);
CREATE INDEX idx_marches_fournisseur ON marches(fournisseur_id);
CREATE INDEX idx_marches_convention ON marches(convention_id);
CREATE INDEX idx_marches_statut ON marches(statut);
CREATE INDEX idx_marches_date ON marches(date_marche);

COMMENT ON TABLE marches IS 'Public procurement contracts with suppliers';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: marche_lignes - Market line items with analytical imputation
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE marche_lignes (
    id                     BIGSERIAL PRIMARY KEY,
    marche_id              BIGINT NOT NULL,
    numero_ligne           INT NOT NULL,
    designation            TEXT NOT NULL,
    unite                  VARCHAR(50),
    quantite               DECIMAL(15,3),
    prix_unitaire_ht       DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    montant_ht             DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    taux_tva               DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    montant_tva            DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    montant_ttc            DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    imputation_analytique  JSONB,
    remarques              TEXT,
    actif                  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at             TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_marche_lignes_marche FOREIGN KEY (marche_id) REFERENCES marches(id) ON DELETE CASCADE,
    CONSTRAINT chk_marche_lignes_numero CHECK (numero_ligne > 0),
    CONSTRAINT chk_marche_lignes_montants CHECK (montant_ht >= 0.00 AND montant_tva >= 0.00 AND montant_ttc >= 0.00),
    CONSTRAINT chk_marche_lignes_quantite CHECK (quantite IS NULL OR quantite > 0.000)
);

CREATE INDEX idx_marche_lignes_marche ON marche_lignes(marche_id);
CREATE INDEX idx_marche_lignes_numero ON marche_lignes(numero_ligne);
CREATE INDEX idx_marche_lignes_imputation ON marche_lignes USING GIN (imputation_analytique);

COMMENT ON TABLE marche_lignes IS 'Market line items with flexible analytical imputation (JSONB)';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: avenant_marches - Market amendments
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE avenant_marches (
    id                          BIGSERIAL PRIMARY KEY,
    marche_id                   BIGINT NOT NULL,
    numero_avenant              VARCHAR(50) NOT NULL,
    date_avenant                DATE NOT NULL,
    date_effet                  DATE,
    objet                       TEXT NOT NULL,
    motif                       TEXT,
    statut                      statut_avenant NOT NULL,
    montant_initial_ht          DECIMAL(15,2),
    montant_avenant_ht          DECIMAL(15,2),
    montant_apres_ht            DECIMAL(15,2),
    pourcentage_variation       DECIMAL(5,2),
    delai_initial_mois          INT,
    delai_supplementaire_mois   INT,
    delai_apres_mois            INT,
    date_fin_initiale           DATE,
    date_fin_apres              DATE,
    details_avant               TEXT,
    details_apres               TEXT,
    details_modifications       TEXT,
    date_validation             DATE,
    valide_par_id               BIGINT,
    remarques                   TEXT,
    fichier_avenant             VARCHAR(500),
    actif                       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_avenant_marches_marche FOREIGN KEY (marche_id) REFERENCES marches(id) ON DELETE CASCADE
);

CREATE INDEX idx_avenant_marches_marche ON avenant_marches(marche_id);
CREATE INDEX idx_avenant_marches_numero ON avenant_marches(numero_avenant);
CREATE INDEX idx_avenant_marches_statut ON avenant_marches(statut);

COMMENT ON TABLE avenant_marches IS 'Market contract amendments with financial and timeline impacts';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: bons_commande - Purchase orders
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE bons_commande (
    id                  BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(100) NOT NULL UNIQUE,
    marche_id           BIGINT NOT NULL,
    fournisseur_id      BIGINT NOT NULL,
    num_consultation    VARCHAR(100),
    date_bon_commande   DATE NOT NULL,
    date_approbation    DATE,
    objet               TEXT,
    montant_ht          DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    taux_tva            DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    montant_tva         DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    montant_ttc         DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    statut              statut_bon_commande NOT NULL,
    remarques           TEXT,
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_bons_commande_marche FOREIGN KEY (marche_id) REFERENCES marches(id) ON DELETE CASCADE,
    CONSTRAINT fk_bons_commande_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE RESTRICT,
    CONSTRAINT chk_bons_commande_montants CHECK (montant_ht >= 0.00 AND montant_tva >= 0.00 AND montant_ttc >= 0.00)
);

CREATE UNIQUE INDEX idx_bons_commande_numero ON bons_commande(numero);
CREATE INDEX idx_bons_commande_marche ON bons_commande(marche_id);
CREATE INDEX idx_bons_commande_fournisseur ON bons_commande(fournisseur_id);
CREATE INDEX idx_bons_commande_date ON bons_commande(date_bon_commande);

COMMENT ON TABLE bons_commande IS 'Purchase orders within market contracts';

-- ========================================================================================================
-- SECTION 5: EXPENSE AND PAYMENT TRACKING
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- TABLE: depenses_investissement - Investment expenses
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE depenses_investissement (
    id                   BIGSERIAL PRIMARY KEY,
    numero_facture       VARCHAR(100) NOT NULL,
    date_facture         DATE NOT NULL,
    fournisseur_id       BIGINT NOT NULL,
    convention_id        BIGINT,
    montant_ht           DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    taux_tva             DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    montant_tva          DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    montant_ttc          DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    reference_marche     VARCHAR(100),
    numero_decompte      VARCHAR(100),
    retenue_tva          DECIMAL(15,2) DEFAULT 0.00,
    retenue_is_tiers     DECIMAL(15,2) DEFAULT 0.00,
    retenue_non_resident DECIMAL(15,2) DEFAULT 0.00,
    retenue_garantie     DECIMAL(15,2) DEFAULT 0.00,
    date_paiement        DATE,
    reference_paiement   VARCHAR(100),
    compte_bancaire_id   BIGINT,
    paye                 BOOLEAN NOT NULL DEFAULT FALSE,
    remarques            TEXT,
    type_depense         type_depense NOT NULL,
    statut               statut_depense NOT NULL,
    taux_commission      DECIMAL(5,2),
    base_calcul          base_calcul NOT NULL,
    objet                TEXT,
    date_demarrage       DATE,
    delai_mois           INT,
    date_fin_prevue      DATE,
    designation          VARCHAR(500),
    actif                BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_depenses_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE RESTRICT,
    CONSTRAINT fk_depenses_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE SET NULL,
    CONSTRAINT fk_depenses_compte FOREIGN KEY (compte_bancaire_id) REFERENCES comptes_bancaires(id) ON DELETE SET NULL,
    CONSTRAINT chk_depenses_montants CHECK (montant_ht >= 0.00 AND montant_tva >= 0.00 AND montant_ttc >= 0.00),
    CONSTRAINT chk_depenses_retenues CHECK (retenue_tva >= 0.00 AND retenue_is_tiers >= 0.00 AND retenue_non_resident >= 0.00 AND retenue_garantie >= 0.00),
    CONSTRAINT chk_depenses_taux_commission CHECK (taux_commission IS NULL OR (taux_commission >= 0.00 AND taux_commission <= 100.00))
);

CREATE INDEX idx_depenses_numero_facture ON depenses_investissement(numero_facture);
CREATE INDEX idx_depenses_date_facture ON depenses_investissement(date_facture);
CREATE INDEX idx_depenses_fournisseur ON depenses_investissement(fournisseur_id);
CREATE INDEX idx_depenses_convention ON depenses_investissement(convention_id);
CREATE INDEX idx_depenses_paye ON depenses_investissement(paye);

COMMENT ON TABLE depenses_investissement IS 'Investment expenses with tax withholdings and payment tracking';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: commissions - Calculated commissions
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE commissions (
    id                      BIGSERIAL PRIMARY KEY,
    depense_id              BIGINT NOT NULL UNIQUE,
    convention_id           BIGINT NOT NULL,
    date_calcul             DATE NOT NULL,
    base_calcul             VARCHAR(10) NOT NULL,
    montant_base            DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    taux_commission         DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    taux_tva                DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    montant_commission_ht   DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    montant_tva_commission  DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    montant_commission_ttc  DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    remarques               TEXT,
    actif                   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_commissions_depense FOREIGN KEY (depense_id) REFERENCES depenses_investissement(id) ON DELETE CASCADE,
    CONSTRAINT fk_commissions_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE CASCADE,
    CONSTRAINT chk_commissions_taux CHECK (taux_commission >= 0.00 AND taux_tva >= 0.00),
    CONSTRAINT chk_commissions_montants CHECK (montant_base >= 0.00 AND montant_commission_ht >= 0.00 AND montant_tva_commission >= 0.00 AND montant_commission_ttc >= 0.00)
);

CREATE INDEX idx_commissions_depense ON commissions(depense_id);
CREATE INDEX idx_commissions_convention ON commissions(convention_id);
CREATE INDEX idx_commissions_date ON commissions(date_calcul);

COMMENT ON TABLE commissions IS 'Commission calculations based on expenses and convention rules';

-- ========================================================================================================
-- SECTION 6: DECOMPTES (Progress Payments)
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- TABLE: decomptes - Progress payment statements
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE decomptes (
    id                BIGSERIAL PRIMARY KEY,
    marche_id         BIGINT NOT NULL,
    numero_decompte   VARCHAR(50) NOT NULL,
    date_decompte     DATE NOT NULL,
    periode_debut     DATE NOT NULL,
    periode_fin       DATE NOT NULL,
    statut            statut_decompte NOT NULL,
    montant_brut_ht   DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    montant_tva       DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    montant_ttc       DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_retenues    DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    net_a_payer       DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    cumul_precedent   DECIMAL(15,2) DEFAULT 0.00,
    cumul_actuel      DECIMAL(15,2) DEFAULT 0.00,
    observations      TEXT,
    date_validation   DATE,
    valide_par_id     BIGINT,
    montant_paye      DECIMAL(15,2) DEFAULT 0.00,
    est_solde         BOOLEAN NOT NULL DEFAULT FALSE,
    actif             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_decomptes_marche FOREIGN KEY (marche_id) REFERENCES marches(id) ON DELETE CASCADE,
    CONSTRAINT chk_decomptes_periode CHECK (periode_fin >= periode_debut),
    CONSTRAINT chk_decomptes_montants CHECK (montant_brut_ht >= 0.00 AND montant_tva >= 0.00 AND montant_ttc >= 0.00 AND net_a_payer >= 0.00)
);

CREATE INDEX idx_decomptes_marche ON decomptes(marche_id);
CREATE INDEX idx_decomptes_numero ON decomptes(numero_decompte);
CREATE INDEX idx_decomptes_statut ON decomptes(statut);

COMMENT ON TABLE decomptes IS 'Progress payment statements with withholdings and cumulative tracking';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: decompte_retenues - Withholdings on progress payments
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE decompte_retenues (
    id            BIGSERIAL PRIMARY KEY,
    decompte_id   BIGINT NOT NULL,
    type_retenue  type_retenue NOT NULL,
    montant       DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    taux_pourcent DECIMAL(5,2),
    libelle       VARCHAR(200),
    actif         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_decompte_ret_decompte FOREIGN KEY (decompte_id) REFERENCES decomptes(id) ON DELETE CASCADE,
    CONSTRAINT chk_decompte_ret_montant CHECK (montant >= 0.00)
);

CREATE INDEX idx_decompte_ret_decompte ON decompte_retenues(decompte_id);
CREATE INDEX idx_decompte_ret_type ON decompte_retenues(type_retenue);

COMMENT ON TABLE decompte_retenues IS 'Withholdings on progress payments (guarantee, taxes, penalties)';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: decompte_imputations - Analytical imputation for progress payments
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE decompte_imputations (
    id                 BIGSERIAL PRIMARY KEY,
    decompte_id        BIGINT NOT NULL,
    montant            DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    dimensions_valeurs JSONB NOT NULL,
    remarques          TEXT,
    actif              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_decompte_imp_decompte FOREIGN KEY (decompte_id) REFERENCES decomptes(id) ON DELETE CASCADE,
    CONSTRAINT chk_decompte_imp_montant CHECK (montant >= 0.00)
);

CREATE INDEX idx_decompte_imp_decompte ON decompte_imputations(decompte_id);
CREATE INDEX idx_decompte_imp_dimensions ON decompte_imputations USING GIN (dimensions_valeurs);

COMMENT ON TABLE decompte_imputations IS 'Flexible analytical imputation for progress payments (Dynamic Plan)';

-- ========================================================================================================
-- SECTION 7: PAYMENT ORDERS AND ACTUAL PAYMENTS
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- TABLE: ordres_paiement - Payment orders
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE ordres_paiement (
    id                      BIGSERIAL PRIMARY KEY,
    decompte_id             BIGINT NOT NULL,
    numero_op               VARCHAR(50) NOT NULL UNIQUE,
    date_op                 DATE NOT NULL,
    statut                  statut_op NOT NULL,
    montant_a_payer         DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    est_paiement_partiel    BOOLEAN NOT NULL DEFAULT FALSE,
    date_prevue_paiement    DATE,
    mode_paiement           mode_paiement,
    compte_bancaire_id      BIGINT,
    observations            TEXT,
    date_validation         DATE,
    valide_par_id           BIGINT,
    actif                   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_op_decompte FOREIGN KEY (decompte_id) REFERENCES decomptes(id) ON DELETE CASCADE,
    CONSTRAINT fk_op_compte FOREIGN KEY (compte_bancaire_id) REFERENCES comptes_bancaires(id) ON DELETE SET NULL,
    CONSTRAINT chk_op_montant CHECK (montant_a_payer >= 0.00)
);

CREATE INDEX idx_op_numero ON ordres_paiement(numero_op);
CREATE INDEX idx_op_decompte ON ordres_paiement(decompte_id);
CREATE INDEX idx_op_statut ON ordres_paiement(statut);

COMMENT ON TABLE ordres_paiement IS 'Payment orders issued for approved progress payments';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: op_imputations - Analytical imputation for payment orders
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE op_imputations (
    id                 BIGSERIAL PRIMARY KEY,
    ordre_paiement_id  BIGINT NOT NULL,
    montant            DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    dimensions_valeurs JSONB NOT NULL,
    remarques          TEXT,
    actif              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_op_imp_op FOREIGN KEY (ordre_paiement_id) REFERENCES ordres_paiement(id) ON DELETE CASCADE,
    CONSTRAINT chk_op_imp_montant CHECK (montant >= 0.00)
);

CREATE INDEX idx_op_imp_op ON op_imputations(ordre_paiement_id);
CREATE INDEX idx_op_imp_dimensions ON op_imputations USING GIN (dimensions_valeurs);

COMMENT ON TABLE op_imputations IS 'Flexible analytical imputation for payment orders (Dynamic Plan)';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: paiements - Actual payments executed
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE paiements (
    id                   BIGSERIAL PRIMARY KEY,
    ordre_paiement_id    BIGINT NOT NULL,
    reference_paiement   VARCHAR(100) NOT NULL UNIQUE,
    date_valeur          DATE NOT NULL,
    date_execution       DATE,
    montant_paye         DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    est_paiement_partiel BOOLEAN NOT NULL DEFAULT FALSE,
    mode_paiement        mode_paiement NOT NULL,
    compte_bancaire_id   BIGINT,
    observations         TEXT,
    actif                BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_paiements_op FOREIGN KEY (ordre_paiement_id) REFERENCES ordres_paiement(id) ON DELETE CASCADE,
    CONSTRAINT fk_paiements_compte FOREIGN KEY (compte_bancaire_id) REFERENCES comptes_bancaires(id) ON DELETE SET NULL,
    CONSTRAINT chk_paiements_montant CHECK (montant_paye >= 0.00)
);

CREATE INDEX idx_paiements_op ON paiements(ordre_paiement_id);
CREATE INDEX idx_paiements_reference ON paiements(reference_paiement);

COMMENT ON TABLE paiements IS 'Actual payments executed (bank transfers, checks)';

-- --------------------------------------------------------------------------------------------------------
-- TABLE: paiement_imputations - Analytical imputation for actual payments
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE paiement_imputations (
    id                 BIGSERIAL PRIMARY KEY,
    paiement_id        BIGINT NOT NULL,
    montant_reel       DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    dimensions_valeurs JSONB NOT NULL,
    montant_budgete    DECIMAL(15,2),
    ecart              DECIMAL(15,2),
    remarques          TEXT,
    actif              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_paiement_imp_paiement FOREIGN KEY (paiement_id) REFERENCES paiements(id) ON DELETE CASCADE,
    CONSTRAINT chk_paiement_imp_montant CHECK (montant_reel >= 0.00)
);

CREATE INDEX idx_paiement_imp_paiement ON paiement_imputations(paiement_id);
CREATE INDEX idx_paiement_imp_dimensions ON paiement_imputations USING GIN (dimensions_valeurs);

COMMENT ON TABLE paiement_imputations IS 'Flexible analytical imputation for actual payments with budget variance tracking';

-- ========================================================================================================
-- SECTION 8: GENERIC ANALYTICAL IMPUTATION (Alternative approach)
-- ========================================================================================================

-- --------------------------------------------------------------------------------------------------------
-- TABLE: imputations_analytiques - Generic analytical imputation table
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE imputations_analytiques (
    id                 BIGSERIAL PRIMARY KEY,
    type_imputation    type_imputation NOT NULL,
    reference_id       BIGINT NOT NULL,
    montant            DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    dimensions_valeurs JSONB NOT NULL,
    created_by_id      BIGINT,
    actif              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_imputations_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_imputations_montant CHECK (montant >= 0.00)
);

CREATE INDEX idx_imputations_type_ref ON imputations_analytiques(type_imputation, reference_id);
CREATE INDEX idx_imputations_dimensions ON imputations_analytiques USING GIN (dimensions_valeurs);

COMMENT ON TABLE imputations_analytiques IS 'Generic analytical imputation for budgets, payments, and expenses';

-- ========================================================================================================
-- SECTION 9: TRIGGERS FOR AUDIT FIELDS
-- ========================================================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_name = 'updated_at'
    LOOP
        EXECUTE format('
            CREATE TRIGGER trigger_update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ========================================================================================================
-- SECTION 10: INITIAL DATA SEEDING (Optional - for development)
-- ========================================================================================================

-- ========================================================================================================
-- USERS WITH DIFFERENT ROLES (Test Credentials)
-- ========================================================================================================

-- ADMIN USER - Full system access
-- Username: admin | Password: admin123
INSERT INTO users (username, email, password, full_name, enabled, actif)
VALUES (
    'admin',
    'admin@investpro.ma',
    '$2a$10$qLDXjPOBnYXZw5YvqYKJHuF5Qv3V1xGZr3GpZGJXqZQZvQYKJHuF5',
    'Administrateur Système',
    TRUE,
    TRUE
);

INSERT INTO user_roles (user_id, role)
VALUES (
    (SELECT id FROM users WHERE username = 'admin'),
    'ADMIN'
);

-- MANAGER USER - Manage conventions and markets
-- Username: manager | Password: manager123
INSERT INTO users (username, email, password, full_name, enabled, actif)
VALUES (
    'manager',
    'manager@investpro.ma',
    '$2a$10$7dN5KJ3L8qP2mR9xS1t4JuY5zX8aB2cD3eF4gH5iJ6kL7mN8oP9qR',
    'Manager des Conventions',
    TRUE,
    TRUE
);

INSERT INTO user_roles (user_id, role)
VALUES (
    (SELECT id FROM users WHERE username = 'manager'),
    'MANAGER'
);

-- STANDARD USER - Read reports and exports
-- Username: user | Password: user123
INSERT INTO users (username, email, password, full_name, enabled, actif)
VALUES (
    'user',
    'user@investpro.ma',
    '$2a$10$aWFiYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5emFiY2RlZmdoaWo',
    'Utilisateur Standard',
    TRUE,
    TRUE
);

INSERT INTO user_roles (user_id, role)
VALUES (
    (SELECT id FROM users WHERE username = 'user'),
    'USER'
);

-- ANALYST USER - Analytics and reporting
-- Username: analyst | Password: analyst123
INSERT INTO users (username, email, password, full_name, enabled, actif)
VALUES (
    'analyst',
    'analyst@investpro.ma',
    '$2a$10$mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oP1qR2sT3u',
    'Analyste Financier',
    TRUE,
    TRUE
);

INSERT INTO user_roles (user_id, role)
VALUES (
    (SELECT id FROM users WHERE username = 'analyst'),
    'MANAGER'
);

-- CONTROLLER USER - Verify and approve operations
-- Username: controller | Password: controller123
INSERT INTO users (username, email, password, full_name, enabled, actif)
VALUES (
    'controller',
    'controller@investpro.ma',
    '$2a$10$bY2zC3dD4eE5fF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pP6qQ7rR8s',
    'Contrôleur Financier',
    TRUE,
    TRUE
);

INSERT INTO user_roles (user_id, role)
VALUES (
    (SELECT id FROM users WHERE username = 'controller'),
    'MANAGER'
);

-- SUPERVISOR USER - All read permissions
-- Username: supervisor | Password: supervisor123
INSERT INTO users (username, email, password, full_name, enabled, actif)
VALUES (
    'supervisor',
    'supervisor@investpro.ma',
    '$2a$10$cZ3aD4eE5fF6gG7hH8iI9jJ0kK1lL2mM3nN4oO5pP6qQ7rR8sT9u',
    'Superviseur Régional',
    TRUE,
    TRUE
);

INSERT INTO user_roles (user_id, role)
VALUES (
    (SELECT id FROM users WHERE username = 'supervisor'),
    'USER'
);

-- Sample analytical dimensions
INSERT INTO dimensions_analytiques (code, nom, description, ordre, active, obligatoire)
VALUES
    ('REG', 'Région', 'Région géographique', 1, TRUE, TRUE),
    ('MARCH', 'Type Marché', 'Type de marché (Travaux, Services, Fournitures)', 2, TRUE, TRUE),
    ('PHASE', 'Phase Projet', 'Phase du projet (Études, Réalisation, Exploitation)', 3, TRUE, FALSE),
    ('SOURCE', 'Source Financement', 'Source de financement', 4, TRUE, FALSE);

-- Sample dimension values for Région
INSERT INTO valeurs_dimensions (dimension_id, code, libelle, active, ordre)
VALUES
    ((SELECT id FROM dimensions_analytiques WHERE code = 'REG'), 'CAS', 'Casablanca-Settat', TRUE, 1),
    ((SELECT id FROM dimensions_analytiques WHERE code = 'REG'), 'RAB', 'Rabat-Salé-Kénitra', TRUE, 2),
    ((SELECT id FROM dimensions_analytiques WHERE code = 'REG'), 'MAR', 'Marrakech-Safi', TRUE, 3);

-- Sample dimension values for Type Marché
INSERT INTO valeurs_dimensions (dimension_id, code, libelle, active, ordre)
VALUES
    ((SELECT id FROM dimensions_analytiques WHERE code = 'MARCH'), 'TRAV', 'Travaux', TRUE, 1),
    ((SELECT id FROM dimensions_analytiques WHERE code = 'MARCH'), 'SERV', 'Services', TRUE, 2),
    ((SELECT id FROM dimensions_analytiques WHERE code = 'MARCH'), 'FOUR', 'Fournitures', TRUE, 3);

-- ========================================================================================================
-- SECTION: PROJECTS (Projets)
-- ========================================================================================================

CREATE TABLE projets (
    id                       BIGSERIAL PRIMARY KEY,
    code                     VARCHAR(50) NOT NULL UNIQUE,
    nom                      VARCHAR(200) NOT NULL,
    description              TEXT,
    convention_id            BIGINT,
    budget_total             DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    date_debut               DATE,
    date_fin_prevue          DATE,
    date_fin_reelle          DATE,
    duree_mois               INT,
    chef_projet_id           BIGINT,
    statut                   VARCHAR(20) NOT NULL DEFAULT 'EN_PREPARATION',
    pourcentage_avancement   DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    localisation             VARCHAR(200),
    objectifs                TEXT,
    remarques                TEXT,
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_projets_code_not_empty CHECK (LENGTH(TRIM(code)) > 0),
    CONSTRAINT chk_projets_nom_not_empty CHECK (LENGTH(TRIM(nom)) > 0),
    CONSTRAINT chk_projets_budget_positive CHECK (budget_total >= 0),
    CONSTRAINT chk_projets_duree_positive CHECK (duree_mois IS NULL OR duree_mois > 0),
    CONSTRAINT chk_projets_pourcentage CHECK (pourcentage_avancement >= 0 AND pourcentage_avancement <= 100),
    CONSTRAINT chk_projets_dates CHECK (date_fin_prevue IS NULL OR date_debut IS NULL OR date_fin_prevue >= date_debut),
    CONSTRAINT chk_projets_date_fin_reelle CHECK (date_fin_reelle IS NULL OR date_debut IS NULL OR date_fin_reelle >= date_debut),
    CONSTRAINT fk_projets_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE SET NULL,
    CONSTRAINT fk_projets_chef_projet FOREIGN KEY (chef_projet_id) REFERENCES partenaires(id) ON DELETE SET NULL
);

CREATE INDEX idx_projets_code ON projets(code);
CREATE INDEX idx_projets_convention ON projets(convention_id);
CREATE INDEX idx_projets_chef_projet ON projets(chef_projet_id);
CREATE INDEX idx_projets_statut ON projets(statut);
CREATE INDEX idx_projets_actif ON projets(actif);

COMMENT ON TABLE projets IS 'Investment projects linked to conventions';
COMMENT ON COLUMN projets.convention_id IS 'Reference to parent convention';
COMMENT ON COLUMN projets.budget_total IS 'Total allocated budget in MAD';
COMMENT ON COLUMN projets.pourcentage_avancement IS 'Project progress percentage (0-100)';

-- ========================================================================================================
-- END OF MIGRATION
-- ========================================================================================================

COMMENT ON SCHEMA public IS 'InvestPro Maroc - Complete database schema v1.0.0 - 2025-12-31';
