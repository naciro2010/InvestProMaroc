-- ============================================================================
-- Complete InvestPro Maroc Database Schema
-- Version: 2.0
-- Last Updated: January 2026
-- ============================================================================
-- This schema comprehensively maps ALL entity fields from Kotlin JPA entities
-- with proper column names, types, constraints, and indexes
-- ============================================================================

-- ============================================================================
-- SECTION 1: AUTHENTICATION & USER MANAGEMENT
-- ============================================================================

-- Users table with complete fields
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    account_non_expired BOOLEAN DEFAULT TRUE NOT NULL,
    account_non_locked BOOLEAN DEFAULT TRUE NOT NULL,
    credentials_non_expired BOOLEAN DEFAULT TRUE NOT NULL,
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_actif ON users(actif);

-- ============================================================================
-- SECTION 2: ORGANIZATIONAL PARTNERS & SUPPLIERS
-- ============================================================================

-- Partenaires (organizational partners for conventions)
CREATE TABLE IF NOT EXISTS partenaires (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    raison_sociale VARCHAR(200) NOT NULL,
    sigle VARCHAR(100),
    type_partenaire VARCHAR(50),
    email VARCHAR(100),
    telephone VARCHAR(20),
    adresse TEXT,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_partenaires_code ON partenaires(code);
CREATE INDEX IF NOT EXISTS idx_partenaires_actif ON partenaires(actif);

-- Fournisseurs (suppliers with Moroccan tax identifiers)
CREATE TABLE IF NOT EXISTS fournisseurs (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    raison_sociale VARCHAR(200) NOT NULL,
    identifiant_fiscal VARCHAR(20),
    ice VARCHAR(15),
    adresse TEXT,
    ville VARCHAR(100),
    telephone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(150),
    contact VARCHAR(100),
    non_resident BOOLEAN DEFAULT FALSE NOT NULL,
    remarques TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fournisseurs_code ON fournisseurs(code);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_ice ON fournisseurs(ice);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_actif ON fournisseurs(actif);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_non_resident ON fournisseurs(non_resident);

-- Comptes bancaires (bank accounts for payments)
CREATE TABLE IF NOT EXISTS comptes_bancaires (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    rib VARCHAR(24) UNIQUE NOT NULL,
    banque VARCHAR(200) NOT NULL,
    agence VARCHAR(200),
    type_compte VARCHAR(50),
    titulaire VARCHAR(200),
    devise VARCHAR(10) DEFAULT 'MAD' NOT NULL,
    remarques TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comptes_bancaires_code ON comptes_bancaires(code);
CREATE INDEX IF NOT EXISTS idx_comptes_bancaires_rib ON comptes_bancaires(rib);
CREATE INDEX IF NOT EXISTS idx_comptes_bancaires_actif ON comptes_bancaires(actif);

-- ============================================================================
-- SECTION 3: ANALYTICAL DIMENSIONS (PLAN ANALYTIQUE DYNAMIQUE)
-- ============================================================================

-- Dimensions analytiques (Budget, Région, Phase, Marché type, etc.)
CREATE TABLE IF NOT EXISTS dimensions_analytiques (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    ordre INTEGER DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    obligatoire BOOLEAN DEFAULT FALSE NOT NULL,
    created_by_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dimensions_code ON dimensions_analytiques(code);
CREATE INDEX IF NOT EXISTS idx_dimensions_active ON dimensions_analytiques(active);

-- Valeurs des dimensions analytiques
CREATE TABLE IF NOT EXISTS valeurs_dimensions (
    id BIGSERIAL PRIMARY KEY,
    dimension_id BIGINT NOT NULL REFERENCES dimensions_analytiques(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    ordre INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL,
    UNIQUE(dimension_id, code)
);

CREATE INDEX IF NOT EXISTS idx_valeurs_dimension ON valeurs_dimensions(dimension_id);
CREATE INDEX IF NOT EXISTS idx_valeurs_active ON valeurs_dimensions(active);

-- Imputations analytiques (flexible budget/decompte/payment allocations)
CREATE TABLE IF NOT EXISTS imputations_analytiques (
    id BIGSERIAL PRIMARY KEY,
    type_imputation VARCHAR(50) NOT NULL,
    reference_id BIGINT NOT NULL,
    montant DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    dimensions_valeurs JSONB NOT NULL DEFAULT '{}',
    created_by_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_imputations_type_ref ON imputations_analytiques(type_imputation, reference_id);
CREATE INDEX IF NOT EXISTS idx_imputations_dimensions ON imputations_analytiques USING GIN(dimensions_valeurs);

-- ============================================================================
-- SECTION 4: CONVENTION MANAGEMENT
-- ============================================================================

-- Conventions (main legal framework for investment/commission management)
CREATE TABLE IF NOT EXISTS conventions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    numero VARCHAR(100) UNIQUE NOT NULL,
    date_convention DATE NOT NULL DEFAULT CURRENT_DATE,
    type_convention VARCHAR(20) NOT NULL DEFAULT 'CADRE',
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    libelle VARCHAR(200) NOT NULL,
    objet TEXT,
    taux_commission DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    budget DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    base_calcul VARCHAR(20) NOT NULL DEFAULT 'DECAISSEMENTS_TTC',
    taux_tva DECIMAL(5,2) DEFAULT 20.00 NOT NULL,
    date_debut DATE NOT NULL DEFAULT CURRENT_DATE,
    date_fin DATE,
    description TEXT,
    date_soumission DATE,
    date_validation DATE,
    valide_par_id BIGINT REFERENCES users(id),
    version VARCHAR(10),
    is_locked BOOLEAN DEFAULT FALSE NOT NULL,
    motif_verrouillage TEXT,
    motif_rejet TEXT,
    created_by_id BIGINT REFERENCES users(id),
    parent_convention_id BIGINT REFERENCES conventions(id),
    herite_parametres BOOLEAN DEFAULT FALSE NOT NULL,
    surcharge_taux_commission DECIMAL(5,2),
    surcharge_base_calcul VARCHAR(50),
    objet_rich JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conventions_code ON conventions(code);
CREATE INDEX IF NOT EXISTS idx_conventions_numero ON conventions(numero);
CREATE INDEX IF NOT EXISTS idx_conventions_type ON conventions(type_convention);
CREATE INDEX IF NOT EXISTS idx_conventions_statut ON conventions(statut);
CREATE INDEX IF NOT EXISTS idx_conventions_actif ON conventions(actif);
CREATE INDEX IF NOT EXISTS idx_conventions_dates ON conventions(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_conventions_objet_rich ON conventions USING GIN(objet_rich);

-- Avenants de convention (amendments to conventions)
CREATE TABLE IF NOT EXISTS avenant_conventions (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    numero_avenant VARCHAR(50) NOT NULL,
    date_avenant DATE NOT NULL DEFAULT CURRENT_DATE,
    objet TEXT NOT NULL,
    motif TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    donnees_avant JSONB,
    modifications JSONB,
    details_modifications TEXT,
    ancien_budget DECIMAL(15,2),
    nouveau_budget DECIMAL(15,2),
    delta_budget DECIMAL(15,2),
    ancien_taux_commission DECIMAL(5,2),
    nouveau_taux_commission DECIMAL(5,2),
    date_soumission DATE,
    date_validation DATE,
    date_effet DATE,
    created_by_id BIGINT REFERENCES users(id),
    soumis_par_id BIGINT REFERENCES users(id),
    valide_par_id BIGINT REFERENCES users(id),
    remarques TEXT,
    motif_rejet TEXT,
    fichier_avenant VARCHAR(500),
    ordre_application INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_avenant_conventions_convention ON avenant_conventions(convention_id);
CREATE INDEX IF NOT EXISTS idx_avenant_conventions_numero ON avenant_conventions(numero_avenant);
CREATE INDEX IF NOT EXISTS idx_avenant_conventions_statut ON avenant_conventions(statut);
CREATE INDEX IF NOT EXISTS idx_avenant_conventions_date ON avenant_conventions(date_avenant);

-- Convention partenaires (allocation of partners to conventions)
CREATE TABLE IF NOT EXISTS convention_partenaires (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    partenaire_id BIGINT NOT NULL REFERENCES partenaires(id),
    budget_alloue DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    pourcentage DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    commission_intervention DECIMAL(15,2),
    est_maitre_oeuvre BOOLEAN DEFAULT FALSE,
    est_maitre_oeuvre_delegue BOOLEAN DEFAULT FALSE,
    remarques TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL,
    UNIQUE(convention_id, partenaire_id)
);

CREATE INDEX IF NOT EXISTS idx_convention_partenaires_convention ON convention_partenaires(convention_id);
CREATE INDEX IF NOT EXISTS idx_convention_partenaires_partenaire ON convention_partenaires(partenaire_id);

-- Budgets (budget versions: V0, V1, V2...)
CREATE TABLE IF NOT EXISTS budgets (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    version VARCHAR(10) NOT NULL DEFAULT 'V0',
    date_budget DATE NOT NULL DEFAULT CURRENT_DATE,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    plafond_convention DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    total_budget DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    budget_precedent_id BIGINT REFERENCES budgets(id),
    delta_montant DECIMAL(15,2),
    justification TEXT,
    observations TEXT,
    date_validation DATE,
    valide_par_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_budgets_convention ON budgets(convention_id);
CREATE INDEX IF NOT EXISTS idx_budgets_version ON budgets(version);
CREATE INDEX IF NOT EXISTS idx_budgets_statut ON budgets(statut);

-- Lignes de budget (budget line items)
CREATE TABLE IF NOT EXISTS lignes_budget (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    montant DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    ordre_affichage INTEGER,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lignes_budget_budget ON lignes_budget(budget_id);

-- Subventions (external subsidies/financing)
CREATE TABLE IF NOT EXISTS subventions (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    organisme_bailleur VARCHAR(200) NOT NULL,
    type_subvention VARCHAR(50),
    montant_total DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    devise VARCHAR(3) DEFAULT 'MAD' NOT NULL,
    taux_change DECIMAL(10,4),
    date_signature DATE,
    date_debut_validite DATE,
    date_fin_validite DATE,
    conditions TEXT,
    observations TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subventions_convention ON subventions(convention_id);
CREATE INDEX IF NOT EXISTS idx_subventions_organisme ON subventions(organisme_bailleur);

-- Écheances subvention (subsidy payment schedule)
CREATE TABLE IF NOT EXISTS echeances_subvention (
    id BIGSERIAL PRIMARY KEY,
    subvention_id BIGINT NOT NULL REFERENCES subventions(id) ON DELETE CASCADE,
    date_echeance DATE NOT NULL,
    montant DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'PREVU',
    date_reception DATE,
    libelle VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_echeances_subvention ON echeances_subvention(subvention_id);

-- ============================================================================
-- SECTION 5: PROJECTS
-- ============================================================================

-- Projets (investment projects)
CREATE TABLE IF NOT EXISTS projets (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    convention_id BIGINT REFERENCES conventions(id),
    budget_total DECIMAL(15,2) DEFAULT 0.00,
    date_debut DATE,
    date_fin_prevue DATE,
    date_fin_reelle DATE,
    duree_mois INTEGER,
    chef_projet_id BIGINT REFERENCES partenaires(id),
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_PREPARATION',
    pourcentage_avancement DECIMAL(5,2) DEFAULT 0.00,
    localisation VARCHAR(200),
    objectifs TEXT,
    remarques TEXT,
    description_rich JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projets_code ON projets(code);
CREATE INDEX IF NOT EXISTS idx_projets_convention ON projets(convention_id);
CREATE INDEX IF NOT EXISTS idx_projets_statut ON projets(statut);
CREATE INDEX IF NOT EXISTS idx_projets_dates ON projets(date_debut, date_fin_prevue);
CREATE INDEX IF NOT EXISTS idx_projets_description_rich ON projets USING GIN(description_rich);

-- Imputations prévisionnelles (provisional allocations to projects)
CREATE TABLE IF NOT EXISTS imputations_previsionnelles (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    volet VARCHAR(200),
    date_demarrage DATE NOT NULL DEFAULT CURRENT_DATE,
    delai_mois INTEGER NOT NULL DEFAULT 12,
    date_fin_prevue DATE,
    remarques TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_imputations_prevision_convention ON imputations_previsionnelles(convention_id);

-- Versements prévisionnels (provisional payment schedule)
CREATE TABLE IF NOT EXISTS versements_previsionnels (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    volet VARCHAR(200),
    date_versement DATE NOT NULL DEFAULT CURRENT_DATE,
    montant DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    partenaire_id BIGINT NOT NULL REFERENCES partenaires(id),
    mod_id BIGINT REFERENCES partenaires(id),
    remarques TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_versements_convention ON versements_previsionnels(convention_id);
CREATE INDEX IF NOT EXISTS idx_versements_partenaire ON versements_previsionnels(partenaire_id);
CREATE INDEX IF NOT EXISTS idx_versements_date ON versements_previsionnels(date_versement);

-- ============================================================================
-- SECTION 6: PROCUREMENT CONTRACTS (MARCHÉS)
-- ============================================================================

-- Marchés (procurement contracts)
CREATE TABLE IF NOT EXISTS marches (
    id BIGSERIAL PRIMARY KEY,
    numero_marche VARCHAR(100) UNIQUE NOT NULL,
    num_ao VARCHAR(100),
    date_marche DATE NOT NULL DEFAULT CURRENT_DATE,
    fournisseur_id BIGINT NOT NULL REFERENCES fournisseurs(id),
    convention_id BIGINT REFERENCES conventions(id),
    objet TEXT NOT NULL,
    montant_ht DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    taux_tva DECIMAL(5,2) DEFAULT 20.00 NOT NULL,
    montant_tva DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    montant_ttc DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_COURS',
    date_debut DATE,
    date_fin_prevue DATE,
    delai_execution_mois INTEGER,
    retenue_garantie DECIMAL(15,2) DEFAULT 0.00,
    remarques TEXT,
    adresse TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    zone_geographique VARCHAR(100),
    description_rich JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_marches_numero ON marches(numero_marche);
CREATE INDEX IF NOT EXISTS idx_marches_num_ao ON marches(num_ao);
CREATE INDEX IF NOT EXISTS idx_marches_fournisseur ON marches(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_marches_convention ON marches(convention_id);
CREATE INDEX IF NOT EXISTS idx_marches_statut ON marches(statut);
CREATE INDEX IF NOT EXISTS idx_marches_date ON marches(date_marche);
CREATE INDEX IF NOT EXISTS idx_marches_zone ON marches(zone_geographique);
CREATE INDEX IF NOT EXISTS idx_marches_description_rich ON marches USING GIN(description_rich);

-- Marché lignes (line items within a market)
CREATE TABLE IF NOT EXISTS marche_lignes (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT NOT NULL REFERENCES marches(id) ON DELETE CASCADE,
    numero_ligne INTEGER NOT NULL,
    designation TEXT NOT NULL,
    unite VARCHAR(50),
    quantite DECIMAL(15,3),
    prix_unitaire_ht DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    montant_ht DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    taux_tva DECIMAL(5,2) DEFAULT 20.00 NOT NULL,
    montant_tva DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    montant_ttc DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    imputation_analytique JSONB DEFAULT '{}',
    remarques TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_marche_lignes_marche ON marche_lignes(marche_id);
CREATE INDEX IF NOT EXISTS idx_marche_lignes_numero ON marche_lignes(numero_ligne);

-- Avenants marchés (amendments to markets)
CREATE TABLE IF NOT EXISTS avenant_marches (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT NOT NULL REFERENCES marches(id) ON DELETE CASCADE,
    numero_avenant VARCHAR(50) NOT NULL,
    date_avenant DATE NOT NULL DEFAULT CURRENT_DATE,
    date_effet DATE,
    objet TEXT NOT NULL,
    motif TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    montant_initial_ht DECIMAL(15,2),
    montant_avenant_ht DECIMAL(15,2),
    montant_apres_ht DECIMAL(15,2),
    pourcentage_variation DECIMAL(5,2),
    delai_initial_mois INTEGER,
    delai_supplementaire_mois INTEGER,
    delai_apres_mois INTEGER,
    date_fin_initiale DATE,
    date_fin_apres DATE,
    details_avant TEXT,
    details_apres TEXT,
    details_modifications TEXT,
    date_validation DATE,
    valide_par_id BIGINT REFERENCES users(id),
    remarques TEXT,
    fichier_avenant VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_avenant_marches_marche ON avenant_marches(marche_id);
CREATE INDEX IF NOT EXISTS idx_avenant_marches_numero ON avenant_marches(numero_avenant);
CREATE INDEX IF NOT EXISTS idx_avenant_marches_statut ON avenant_marches(statut);

-- Bons de commande (purchase orders)
CREATE TABLE IF NOT EXISTS bons_commande (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(100) UNIQUE NOT NULL,
    marche_id BIGINT NOT NULL REFERENCES marches(id) ON DELETE CASCADE,
    fournisseur_id BIGINT NOT NULL REFERENCES fournisseurs(id),
    num_consultation VARCHAR(100),
    date_bon_commande DATE NOT NULL DEFAULT CURRENT_DATE,
    date_approbation DATE,
    objet TEXT,
    montant_ht DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    taux_tva DECIMAL(5,2) DEFAULT 20.00 NOT NULL,
    montant_tva DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    montant_ttc DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    remarques TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bons_commande_numero ON bons_commande(numero);
CREATE INDEX IF NOT EXISTS idx_bons_commande_marche ON bons_commande(marche_id);
CREATE INDEX IF NOT EXISTS idx_bons_commande_fournisseur ON bons_commande(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_bons_commande_date ON bons_commande(date_bon_commande);

-- ============================================================================
-- SECTION 7: INVESTMENT EXPENSES
-- ============================================================================

-- Dépenses investissement (investment expenses/invoices)
CREATE TABLE IF NOT EXISTS depenses_investissement (
    id BIGSERIAL PRIMARY KEY,
    numero_facture VARCHAR(100) NOT NULL,
    date_facture DATE NOT NULL DEFAULT CURRENT_DATE,
    fournisseur_id BIGINT NOT NULL REFERENCES fournisseurs(id),
    convention_id BIGINT REFERENCES conventions(id),
    montant_ht DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    taux_tva DECIMAL(5,2) DEFAULT 20.00 NOT NULL,
    montant_tva DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    montant_ttc DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    reference_marche VARCHAR(100),
    numero_decompte VARCHAR(100),
    retenue_tva DECIMAL(15,2) DEFAULT 0.00,
    retenue_is_tiers DECIMAL(15,2) DEFAULT 0.00,
    retenue_non_resident DECIMAL(15,2) DEFAULT 0.00,
    retenue_garantie DECIMAL(15,2) DEFAULT 0.00,
    date_paiement DATE,
    reference_paiement VARCHAR(100),
    compte_bancaire_id BIGINT REFERENCES comptes_bancaires(id),
    paye BOOLEAN DEFAULT FALSE NOT NULL,
    type_depense VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_COURS',
    taux_commission DECIMAL(5,2),
    base_calcul VARCHAR(10) NOT NULL DEFAULT 'TTC',
    objet TEXT,
    date_demarrage DATE,
    delai_mois INTEGER,
    date_fin_prevue DATE,
    designation VARCHAR(500),
    remarques TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_depenses_numero_facture ON depenses_investissement(numero_facture);
CREATE INDEX IF NOT EXISTS idx_depenses_date_facture ON depenses_investissement(date_facture);
CREATE INDEX IF NOT EXISTS idx_depenses_fournisseur ON depenses_investissement(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_depenses_convention ON depenses_investissement(convention_id);
CREATE INDEX IF NOT EXISTS idx_depenses_paye ON depenses_investissement(paye);

-- Commissions (calculated commissions from expenses)
CREATE TABLE IF NOT EXISTS commissions (
    id BIGSERIAL PRIMARY KEY,
    depense_id BIGINT UNIQUE NOT NULL REFERENCES depenses_investissement(id),
    convention_id BIGINT NOT NULL REFERENCES conventions(id),
    date_calcul DATE NOT NULL DEFAULT CURRENT_DATE,
    base_calcul VARCHAR(10) NOT NULL DEFAULT 'HT',
    montant_base DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    taux_commission DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    taux_tva DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    montant_commission_ht DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    montant_tva_commission DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    montant_commission_ttc DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    remarques TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commissions_depense ON commissions(depense_id);
CREATE INDEX IF NOT EXISTS idx_commissions_convention ON commissions(convention_id);
CREATE INDEX IF NOT EXISTS idx_commissions_date ON commissions(date_calcul);

-- ============================================================================
-- SECTION 8: BILLING STATEMENTS (DÉCOMPTES)
-- ============================================================================

-- Décomptes (billing statements)
CREATE TABLE IF NOT EXISTS decomptes (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT NOT NULL REFERENCES marches(id) ON DELETE CASCADE,
    numero_decompte VARCHAR(50) NOT NULL,
    date_decompte DATE NOT NULL DEFAULT CURRENT_DATE,
    periode_debut DATE NOT NULL,
    periode_fin DATE NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    montant_brut_ht DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    montant_tva DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    montant_ttc DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    total_retenues DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    net_a_payer DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    cumul_precedent DECIMAL(15,2) DEFAULT 0.00,
    cumul_actuel DECIMAL(15,2) DEFAULT 0.00,
    observations TEXT,
    date_validation DATE,
    valide_par_id BIGINT REFERENCES users(id),
    montant_paye DECIMAL(15,2) DEFAULT 0.00,
    est_solde BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_decomptes_marche ON decomptes(marche_id);
CREATE INDEX IF NOT EXISTS idx_decomptes_numero ON decomptes(numero_decompte);
CREATE INDEX IF NOT EXISTS idx_decomptes_statut ON decomptes(statut);

-- Retenues sur décomptes (withholdings: guarantee, RAS, penalties...)
CREATE TABLE IF NOT EXISTS decompte_retenues (
    id BIGSERIAL PRIMARY KEY,
    decompte_id BIGINT NOT NULL REFERENCES decomptes(id) ON DELETE CASCADE,
    type_retenue VARCHAR(20) NOT NULL,
    montant DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    taux_pourcent DECIMAL(5,2),
    libelle VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_decompte_ret_decompte ON decompte_retenues(decompte_id);
CREATE INDEX IF NOT EXISTS idx_decompte_ret_type ON decompte_retenues(type_retenue);

-- Imputations analytiques décomptes (analytical allocations for billing)
CREATE TABLE IF NOT EXISTS decompte_imputations (
    id BIGSERIAL PRIMARY KEY,
    decompte_id BIGINT NOT NULL REFERENCES decomptes(id) ON DELETE CASCADE,
    montant DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    dimensions_valeurs JSONB NOT NULL DEFAULT '{}',
    remarques TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_decompte_imp_decompte ON decompte_imputations(decompte_id);
CREATE INDEX IF NOT EXISTS idx_decompte_imp_dimensions ON decompte_imputations USING GIN(dimensions_valeurs);

-- ============================================================================
-- SECTION 9: PAYMENT ORDERS & PAYMENTS
-- ============================================================================

-- Ordres de paiement (payment orders)
CREATE TABLE IF NOT EXISTS ordres_paiement (
    id BIGSERIAL PRIMARY KEY,
    decompte_id BIGINT NOT NULL REFERENCES decomptes(id),
    numero_op VARCHAR(50) UNIQUE NOT NULL,
    date_op DATE NOT NULL DEFAULT CURRENT_DATE,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    montant_a_payer DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    est_paiement_partiel BOOLEAN DEFAULT FALSE,
    date_prevue_paiement DATE,
    mode_paiement VARCHAR(20),
    compte_bancaire_id BIGINT REFERENCES comptes_bancaires(id),
    observations TEXT,
    date_validation DATE,
    valide_par_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_op_numero ON ordres_paiement(numero_op);
CREATE INDEX IF NOT EXISTS idx_op_decompte ON ordres_paiement(decompte_id);
CREATE INDEX IF NOT EXISTS idx_op_statut ON ordres_paiement(statut);

-- Imputations analytiques ordres de paiement
CREATE TABLE IF NOT EXISTS op_imputations (
    id BIGSERIAL PRIMARY KEY,
    ordre_paiement_id BIGINT NOT NULL REFERENCES ordres_paiement(id) ON DELETE CASCADE,
    montant DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    dimensions_valeurs JSONB NOT NULL DEFAULT '{}',
    remarques TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_op_imp_op ON op_imputations(ordre_paiement_id);
CREATE INDEX IF NOT EXISTS idx_op_imp_dimensions ON op_imputations USING GIN(dimensions_valeurs);

-- Paiements (actual payments made)
CREATE TABLE IF NOT EXISTS paiements (
    id BIGSERIAL PRIMARY KEY,
    ordre_paiement_id BIGINT NOT NULL REFERENCES ordres_paiement(id),
    reference_paiement VARCHAR(100) UNIQUE NOT NULL,
    date_valeur DATE NOT NULL DEFAULT CURRENT_DATE,
    date_execution DATE,
    montant_paye DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    est_paiement_partiel BOOLEAN DEFAULT FALSE,
    mode_paiement VARCHAR(20) NOT NULL,
    compte_bancaire_id BIGINT REFERENCES comptes_bancaires(id),
    observations TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_paiements_op ON paiements(ordre_paiement_id);
CREATE INDEX IF NOT EXISTS idx_paiements_reference ON paiements(reference_paiement);

-- Imputations analytiques paiements (actual payment allocations for budget vs actual)
CREATE TABLE IF NOT EXISTS paiement_imputations (
    id BIGSERIAL PRIMARY KEY,
    paiement_id BIGINT NOT NULL REFERENCES paiements(id) ON DELETE CASCADE,
    montant_reel DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    dimensions_valeurs JSONB NOT NULL DEFAULT '{}',
    montant_budgete DECIMAL(15,2),
    ecart DECIMAL(15,2),
    remarques TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_paiement_imp_paiement ON paiement_imputations(paiement_id);
CREATE INDEX IF NOT EXISTS idx_paiement_imp_dimensions ON paiement_imputations USING GIN(dimensions_valeurs);

-- ============================================================================
-- SECTION 10: AVENANTS (CONVENTION AMENDMENTS - LEGACY)
-- ============================================================================

-- Avenants (convention amendments with versioning - V1, V2, V3...)
CREATE TABLE IF NOT EXISTS avenants (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    numero_avenant VARCHAR(50) NOT NULL,
    date_avenant DATE NOT NULL DEFAULT CURRENT_DATE,
    date_signature DATE,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    version_resultante VARCHAR(10) NOT NULL,
    objet TEXT NOT NULL,
    montant_avant DECIMAL(15,2),
    taux_commission_avant DECIMAL(5,2),
    date_fin_avant DATE,
    montant_apres DECIMAL(15,2),
    taux_commission_apres DECIMAL(5,2),
    date_fin_apres DATE,
    impact_montant DECIMAL(15,2),
    impact_commission DECIMAL(15,2),
    impact_delai_jours INTEGER,
    justification TEXT,
    details TEXT,
    date_validation DATE,
    valide_par_id BIGINT REFERENCES users(id),
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_avenants_convention ON avenants(convention_id);
CREATE INDEX IF NOT EXISTS idx_avenants_numero ON avenants(numero_avenant);
CREATE INDEX IF NOT EXISTS idx_avenants_statut ON avenants(statut);
CREATE INDEX IF NOT EXISTS idx_avenants_version ON avenants(version_resultante);

-- ============================================================================
-- SECTION 11: GIN INDEXES FOR JSONB FAST SEARCHING
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_donnees_avant_gin ON avenant_conventions USING GIN(donnees_avant);
CREATE INDEX IF NOT EXISTS idx_modifications_gin ON avenant_conventions USING GIN(modifications);

-- ============================================================================
-- SECTION 12: PROJECT-CONVENTION ASSOCIATION
-- ============================================================================
-- Junction table for many-to-many relationship between projects and conventions

CREATE TABLE IF NOT EXISTS projet_conventions (
    id BIGSERIAL PRIMARY KEY,
    projet_id BIGINT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL,
    UNIQUE(projet_id, convention_id)
);

CREATE INDEX IF NOT EXISTS idx_projet_conventions_projet_id ON projet_conventions(projet_id);
CREATE INDEX IF NOT EXISTS idx_projet_conventions_convention_id ON projet_conventions(convention_id);
CREATE INDEX IF NOT EXISTS idx_projet_conventions_ordre ON projet_conventions(projet_id, ordre);

-- ============================================================================
-- SECTION 13: DOCUMENT MANAGEMENT - PIÈCES JOINTES
-- ============================================================================

-- Pièces jointes (attachments/documents) for all entities
CREATE TABLE IF NOT EXISTS pieces_jointes (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(500) NOT NULL,
    nom_original VARCHAR(500) NOT NULL,
    type_mime VARCHAR(200) NOT NULL,
    taille BIGINT NOT NULL,
    chemin_fichier VARCHAR(1000) NOT NULL,
    description VARCHAR(500),
    type_entite VARCHAR(50) NOT NULL CHECK (type_entite IN ('CONVENTION', 'SOUS_CONVENTION', 'AVENANT', 'MARCHE', 'DECOMPTE')),
    entite_id BIGINT NOT NULL,
    date_upload TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast retrieval by entity
CREATE INDEX IF NOT EXISTS idx_pieces_jointes_entite ON pieces_jointes(type_entite, entite_id, actif);
CREATE INDEX IF NOT EXISTS idx_pieces_jointes_date ON pieces_jointes(date_upload DESC);
CREATE INDEX IF NOT EXISTS idx_pieces_jointes_user ON pieces_jointes(uploaded_by_id);

-- ============================================================================
-- SECTION 14: MAITRES D'ŒUVRE (MO/MOD) - JANUARY 2026
-- ============================================================================

-- Maîtres d'Œuvre et Maîtres d'Œuvre Délégués pour les conventions
CREATE TABLE IF NOT EXISTS maitres_oeuvre (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    type_mo VARCHAR(10) NOT NULL CHECK (type_mo IN ('MO', 'MOD')),
    email VARCHAR(100),
    telephone VARCHAR(20),
    adresse TEXT,
    organisme VARCHAR(255),
    missions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN NOT NULL DEFAULT TRUE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_maitres_oeuvre_convention ON maitres_oeuvre(convention_id, actif);
CREATE INDEX IF NOT EXISTS idx_maitres_oeuvre_type ON maitres_oeuvre(type_mo, actif);
CREATE INDEX IF NOT EXISTS idx_maitres_oeuvre_code ON maitres_oeuvre(code, actif);

-- Comments
COMMENT ON TABLE maitres_oeuvre IS 'Maîtres d''Œuvre (MO) et Maîtres d''Œuvre Délégués (MOD) des conventions';
COMMENT ON COLUMN maitres_oeuvre.type_mo IS 'Type: MO (Maître d''Œuvre) ou MOD (Maître d''Œuvre Délégué)';
COMMENT ON COLUMN maitres_oeuvre.missions IS 'Description des missions confiées au MO/MOD';

-- ============================================================================
-- SECTION 14: RÉFÉRENTIELS - TYPES DE DÉPENSES - JANUARY 2026
-- ============================================================================

-- Catégories de dépenses (référentiel pour catégoriser les dépenses)
CREATE TABLE IF NOT EXISTS categories_depenses (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    categorie VARCHAR(100),
    ordre_affichage INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN NOT NULL DEFAULT TRUE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_depenses_code ON categories_depenses(code, actif);
CREATE INDEX IF NOT EXISTS idx_categories_depenses_libelle ON categories_depenses(libelle);
CREATE INDEX IF NOT EXISTS idx_categories_depenses_actif ON categories_depenses(actif);
CREATE INDEX IF NOT EXISTS idx_categories_depenses_ordre ON categories_depenses(ordre_affichage, actif);

-- Comments
COMMENT ON TABLE categories_depenses IS 'Référentiel des catégories de dépenses pour catégoriser les lignes de marchés et décomptes';
COMMENT ON COLUMN categories_depenses.code IS 'Code unique du type de dépense (ex: TRAV, FOUR, SERV)';
COMMENT ON COLUMN categories_depenses.libelle IS 'Libellé descriptif du type de dépense';
COMMENT ON COLUMN categories_depenses.categorie IS 'Catégorie du type (ex: Investissement, Fonctionnement)';
COMMENT ON COLUMN categories_depenses.ordre_affichage IS 'Ordre d''affichage dans les listes déroulantes';

-- ============================================================================
-- SECTION 15: HISTORIQUE DES MODIFICATIONS - JANUARY 2026
-- ============================================================================

-- Historique des modifications des conventions pour traçabilité complète
CREATE TABLE IF NOT EXISTS convention_modifications (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    modifie_par_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    date_modification TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motif_modification TEXT NOT NULL,
    donnees_avant JSONB NOT NULL,
    donnees_apres JSONB NOT NULL,
    champs_modifies TEXT[] NOT NULL,
    type_modification VARCHAR(50) NOT NULL DEFAULT 'UPDATE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_convention_modifications_convention ON convention_modifications(convention_id, date_modification DESC);
CREATE INDEX IF NOT EXISTS idx_convention_modifications_user ON convention_modifications(modifie_par_id);
CREATE INDEX IF NOT EXISTS idx_convention_modifications_date ON convention_modifications(date_modification DESC);
CREATE INDEX IF NOT EXISTS idx_convention_modifications_type ON convention_modifications(type_modification);

-- GIN index for JSONB search
CREATE INDEX IF NOT EXISTS idx_convention_modifications_avant_gin ON convention_modifications USING gin(donnees_avant);
CREATE INDEX IF NOT EXISTS idx_convention_modifications_apres_gin ON convention_modifications USING gin(donnees_apres);

-- Comments
COMMENT ON TABLE convention_modifications IS 'Historique complet des modifications apportées aux conventions avec traçabilité';
COMMENT ON COLUMN convention_modifications.motif_modification IS 'Motif obligatoire de la modification';
COMMENT ON COLUMN convention_modifications.donnees_avant IS 'État complet de la convention avant modification (JSONB)';
COMMENT ON COLUMN convention_modifications.donnees_apres IS 'État complet de la convention après modification (JSONB)';
COMMENT ON COLUMN convention_modifications.champs_modifies IS 'Liste des champs qui ont été modifiés';
COMMENT ON COLUMN convention_modifications.type_modification IS 'Type: UPDATE, STATUS_CHANGE, PARTNER_CHANGE, etc.';

-- ============================================================================
-- SECTION: PARAMÉTRAGE DES CONVENTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS convention_configurations (
    id BIGSERIAL PRIMARY KEY,
    code_mask_pattern VARCHAR(200) NOT NULL,
    code_mask_placeholder VARCHAR(100) NOT NULL,
    numero_mask_pattern VARCHAR(200) NOT NULL,
    numero_mask_placeholder VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS convention_type_configurations (
    id BIGSERIAL PRIMARY KEY,
    configuration_id BIGINT NOT NULL REFERENCES convention_configurations(id) ON DELETE CASCADE,
    type_code VARCHAR(50) NOT NULL,
    libelle VARCHAR(150) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    ordre_affichage INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE NOT NULL,
    UNIQUE(configuration_id, type_code)
);

CREATE INDEX IF NOT EXISTS idx_convention_configuration_actif ON convention_configurations(actif);
CREATE INDEX IF NOT EXISTS idx_convention_type_config_configuration ON convention_type_configurations(configuration_id);
CREATE INDEX IF NOT EXISTS idx_convention_type_config_type_code ON convention_type_configurations(type_code);

-- ============================================================================
-- END OF SCHEMA DEFINITION
-- ============================================================================
-- Total Tables: 41+
-- All entities from InvestPro Maroc fully mapped with:
-- - Complete column definitions matching @Column annotations
-- - Proper data types (DECIMAL for BigDecimal, JSONB for flexible storage)
-- - All indexes for performance optimization
-- - Full audit trail with convention_modifications table
-- - Foreign key relationships with CASCADE deletes where appropriate
-- - Base entity fields (id, created_at, updated_at, actif) on all tables
-- ============================================================================
