-- Simple schema without complex constraints

-- Users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL
);

-- Partenaires et Fournisseurs
CREATE TABLE partenaires (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    type_partenaire VARCHAR(50),
    ice VARCHAR(15),
    if_code VARCHAR(20),
    rib VARCHAR(24),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE fournisseurs (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    ice VARCHAR(15),
    if_code VARCHAR(20),
    rib VARCHAR(24),
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE comptes_bancaires (
    id BIGSERIAL PRIMARY KEY,
    fournisseur_id BIGINT,
    rib VARCHAR(24) NOT NULL,
    banque VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Dimensions analytiques
CREATE TABLE dimensions_analytiques (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    ordre INTEGER,
    obligatoire BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE valeurs_dimensions (
    id BIGSERIAL PRIMARY KEY,
    dimension_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Projets
CREATE TABLE projets (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(200) NOT NULL,
    budget_total DECIMAL(15,2),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Conventions
CREATE TABLE conventions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    numero VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    objet TEXT,
    type_convention VARCHAR(50),
    date_convention DATE,
    date_debut DATE,
    date_fin DATE,
    budget DECIMAL(15,2),
    taux_commission DECIMAL(5,2),
    base_calcul VARCHAR(100),
    taux_tva DECIMAL(5,2),
    statut VARCHAR(20),
    description TEXT,
    version INTEGER DEFAULT 1,
    created_by_id BIGINT,
    motif_rejet TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE convention_partenaires (
    convention_id BIGINT NOT NULL,
    partenaire_id BIGINT NOT NULL
);

CREATE TABLE avenants (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT,
    code VARCHAR(50) UNIQUE NOT NULL,
    motif TEXT,
    date_avenant DATE,
    montant_avenant DECIMAL(15,2),
    nouveau_montant_marche DECIMAL(15,2),
    nouveau_delai_execution INTEGER,
    impact_montant DECIMAL(15,2),
    impact_delai INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE avenant_conventions (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL,
    numero_avenant VARCHAR(50) UNIQUE NOT NULL,
    date_avenant DATE NOT NULL,
    objet TEXT NOT NULL,
    motif TEXT,
    statut VARCHAR(20) DEFAULT 'BROUILLON',
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
    created_by_id BIGINT,
    soumis_par_id BIGINT,
    valide_par_id BIGINT,
    remarques TEXT,
    motif_rejet TEXT,
    fichier_avenant VARCHAR(500),
    ordre_application INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Budgets
CREATE TABLE budgets (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    annee INTEGER NOT NULL,
    montant_total DECIMAL(15,2),
    statut VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE lignes_budget (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT NOT NULL,
    code_ligne VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    montant DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Imputations prévisionnelles
CREATE TABLE imputations_previsionnelles (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT,
    ligne_budget_id BIGINT,
    montant DECIMAL(15,2),
    annee INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE versements_previsionnels (
    id BIGSERIAL PRIMARY KEY,
    imputation_id BIGINT,
    montant DECIMAL(15,2),
    date_prevue DATE,
    statut VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Subventions
CREATE TABLE subventions (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT,
    montant_total DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE echeances_subvention (
    id BIGSERIAL PRIMARY KEY,
    subvention_id BIGINT,
    montant DECIMAL(15,2),
    date_echeance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Marchés
CREATE TABLE marches (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT,
    projet_id BIGINT,
    fournisseur_id BIGINT,
    code VARCHAR(50) UNIQUE NOT NULL,
    objet TEXT,
    type_marche VARCHAR(50),
    montant_ht DECIMAL(15,2),
    montant_tva DECIMAL(15,2),
    montant_ttc DECIMAL(15,2),
    date_marche DATE,
    date_debut DATE,
    date_fin_prevue DATE,
    delai_execution INTEGER,
    statut VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE marche_lignes (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT NOT NULL,
    designation VARCHAR(500) NOT NULL,
    quantite DECIMAL(15,3),
    unite VARCHAR(50),
    prix_unitaire DECIMAL(15,2),
    montant_ligne DECIMAL(15,2),
    dimensions_valeurs JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE avenant_marches (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT NOT NULL,
    numero_avenant VARCHAR(50) NOT NULL,
    motif TEXT,
    date_avenant DATE,
    impact_montant DECIMAL(15,2),
    impact_delai INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE bons_commande (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT,
    numero VARCHAR(50) UNIQUE NOT NULL,
    date_bc DATE,
    montant DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Dépenses
CREATE TABLE depenses_investissement (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT,
    montant DECIMAL(15,2),
    date_depense DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE commissions (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT,
    montant_base DECIMAL(15,2),
    taux_commission DECIMAL(5,2),
    montant_commission DECIMAL(15,2),
    date_calcul DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Décomptes
CREATE TABLE decomptes (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT NOT NULL,
    numero VARCHAR(50) NOT NULL,
    type_decompte VARCHAR(50),
    date_decompte DATE,
    montant_travaux DECIMAL(15,2),
    montant_precedent DECIMAL(15,2),
    montant_cumule DECIMAL(15,2),
    taux_avancement DECIMAL(5,2),
    net_a_payer DECIMAL(15,2),
    statut VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE decompte_retenues (
    id BIGSERIAL PRIMARY KEY,
    decompte_id BIGINT NOT NULL,
    type_retenue VARCHAR(50),
    taux DECIMAL(5,2),
    montant DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE decompte_imputations (
    id BIGSERIAL PRIMARY KEY,
    decompte_id BIGINT NOT NULL,
    ligne_budget_id BIGINT,
    montant DECIMAL(15,2),
    dimensions_valeurs JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Ordres de paiement
CREATE TABLE ordres_paiement (
    id BIGSERIAL PRIMARY KEY,
    decompte_id BIGINT,
    numero VARCHAR(50) UNIQUE NOT NULL,
    date_emission DATE,
    date_execution DATE,
    montant DECIMAL(15,2),
    statut VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE op_imputations (
    id BIGSERIAL PRIMARY KEY,
    ordre_paiement_id BIGINT NOT NULL,
    ligne_budget_id BIGINT,
    montant DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Paiements
CREATE TABLE paiements (
    id BIGSERIAL PRIMARY KEY,
    ordre_paiement_id BIGINT,
    montant DECIMAL(15,2),
    date_paiement DATE,
    mode_reglement VARCHAR(50),
    reference_paiement VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

CREATE TABLE paiement_imputations (
    id BIGSERIAL PRIMARY KEY,
    paiement_id BIGINT NOT NULL,
    ligne_budget_id BIGINT,
    montant DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Imputations analytiques
CREATE TABLE imputations_analytiques (
    id BIGSERIAL PRIMARY KEY,
    entite_type VARCHAR(50),
    entite_id BIGINT,
    dimension_id BIGINT,
    valeur_id BIGINT,
    montant DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Indexes pour performance
CREATE INDEX idx_conventions_code ON conventions(code);
CREATE INDEX idx_marches_code ON marches(code);
CREATE INDEX idx_decomptes_marche ON decomptes(marche_id);
CREATE INDEX idx_avenant_conventions_convention ON avenant_conventions(convention_id);
CREATE INDEX idx_marche_lignes_marche ON marche_lignes(marche_id);
