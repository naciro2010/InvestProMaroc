-- =====================================================
-- Migration V6: Création de toutes les tables manquantes
-- =====================================================
-- Crée 12 tables manquantes basées sur les entités Kotlin
-- Tables: bons_commande, partenaires, convention_partenaires, budgets,
--         lignes_budget, subventions, echeances_subvention, decompte_retenues,
--         imputations_previsionnelles, versements_previsionnels,
--         imputations_analytiques, user_roles

-- =====================================================
-- 1. PARTENAIRES - Organismes participant aux conventions
-- =====================================================

CREATE TABLE IF NOT EXISTS partenaires (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    raison_sociale VARCHAR(200) NOT NULL,
    sigle VARCHAR(100),
    type_partenaire VARCHAR(50),
    email VARCHAR(100),
    telephone VARCHAR(20),
    adresse TEXT,
    description TEXT,

    -- Colonnes BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_partenaires_code ON partenaires(code);
CREATE INDEX IF NOT EXISTS idx_partenaires_actif ON partenaires(actif);

-- =====================================================
-- 2. CONVENTION_PARTENAIRES - Liaison Convention-Partenaire
-- =====================================================

CREATE TABLE IF NOT EXISTS convention_partenaires (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    partenaire_id BIGINT NOT NULL REFERENCES partenaires(id) ON DELETE CASCADE,
    budget_alloue DECIMAL(15,2) NOT NULL DEFAULT 0,
    pourcentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    commission_intervention DECIMAL(15,2),
    est_maitre_oeuvre BOOLEAN DEFAULT false,
    est_maitre_oeuvre_delegue BOOLEAN DEFAULT false,
    remarques TEXT,

    -- Colonnes BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Contrainte unique
    CONSTRAINT uk_convention_partenaire UNIQUE (convention_id, partenaire_id)
);

CREATE INDEX IF NOT EXISTS idx_convention_partenaires_convention ON convention_partenaires(convention_id);
CREATE INDEX IF NOT EXISTS idx_convention_partenaires_partenaire ON convention_partenaires(partenaire_id);

-- =====================================================
-- 3. BONS_COMMANDE - Commandes d'achat liées aux marchés
-- =====================================================

CREATE TABLE IF NOT EXISTS bons_commande (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(100) NOT NULL UNIQUE,
    marche_id BIGINT NOT NULL REFERENCES marches(id) ON DELETE CASCADE,
    fournisseur_id BIGINT NOT NULL REFERENCES fournisseurs(id) ON DELETE CASCADE,
    num_consultation VARCHAR(100),
    date_bon_commande DATE NOT NULL,
    date_approbation DATE,
    objet TEXT,
    montant_ht DECIMAL(15,2) NOT NULL DEFAULT 0,
    taux_tva DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    montant_tva DECIMAL(15,2) NOT NULL DEFAULT 0,
    montant_ttc DECIMAL(15,2) NOT NULL DEFAULT 0,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    remarques TEXT,

    -- Colonnes BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bons_commande_numero ON bons_commande(numero);
CREATE INDEX IF NOT EXISTS idx_bons_commande_marche ON bons_commande(marche_id);
CREATE INDEX IF NOT EXISTS idx_bons_commande_fournisseur ON bons_commande(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_bons_commande_date ON bons_commande(date_bon_commande);

-- =====================================================
-- 4. BUDGETS - Gestion des budgets avec versions (V0, V1, V2...)
-- =====================================================

CREATE TABLE IF NOT EXISTS budgets (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    version VARCHAR(10) NOT NULL DEFAULT 'V0',
    date_budget DATE NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    plafond_convention DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
    budget_precedent_id BIGINT,
    delta_montant DECIMAL(15,2),
    justification TEXT,
    observations TEXT,
    date_validation DATE,
    valide_par_id BIGINT,

    -- Colonnes BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_budgets_convention ON budgets(convention_id);
CREATE INDEX IF NOT EXISTS idx_budgets_version ON budgets(version);
CREATE INDEX IF NOT EXISTS idx_budgets_statut ON budgets(statut);

-- =====================================================
-- 5. LIGNES_BUDGET - Lignes de détail des budgets
-- =====================================================

CREATE TABLE IF NOT EXISTS lignes_budget (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    montant DECIMAL(15,2) NOT NULL DEFAULT 0,
    ordre_affichage INTEGER DEFAULT 0,
    description TEXT,

    -- Colonnes BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lignes_budget_budget ON lignes_budget(budget_id);

-- =====================================================
-- 6. SUBVENTIONS - Financement externe (bailleurs)
-- =====================================================

CREATE TABLE IF NOT EXISTS subventions (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    organisme_bailleur VARCHAR(200) NOT NULL,
    type_subvention VARCHAR(50),
    montant_total DECIMAL(15,2) NOT NULL DEFAULT 0,
    devise VARCHAR(3) DEFAULT 'MAD',
    taux_change DECIMAL(10,4),
    date_signature DATE,
    date_debut_validite DATE,
    date_fin_validite DATE,
    conditions TEXT,
    observations TEXT,

    -- Colonnes BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subventions_convention ON subventions(convention_id);
CREATE INDEX IF NOT EXISTS idx_subventions_organisme ON subventions(organisme_bailleur);

-- =====================================================
-- 7. ECHEANCES_SUBVENTION - Échéancier de subventions
-- =====================================================

CREATE TABLE IF NOT EXISTS echeances_subvention (
    id BIGSERIAL PRIMARY KEY,
    subvention_id BIGINT NOT NULL REFERENCES subventions(id) ON DELETE CASCADE,
    date_echeance DATE NOT NULL,
    montant DECIMAL(15,2) NOT NULL DEFAULT 0,
    statut VARCHAR(20) NOT NULL DEFAULT 'PREVU',
    date_reception DATE,
    libelle VARCHAR(200),

    -- Colonnes BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_echeances_subvention ON echeances_subvention(subvention_id);
CREATE INDEX IF NOT EXISTS idx_echeances_date ON echeances_subvention(date_echeance);

-- =====================================================
-- 8. DECOMPTE_RETENUES - Retenues sur décomptes
-- =====================================================

CREATE TABLE IF NOT EXISTS decompte_retenues (
    id BIGSERIAL PRIMARY KEY,
    decompte_id BIGINT NOT NULL REFERENCES decomptes(id) ON DELETE CASCADE,
    type_retenue VARCHAR(20) NOT NULL,
    montant DECIMAL(15,2) NOT NULL DEFAULT 0,
    taux_pourcent DECIMAL(5,2),
    libelle VARCHAR(200),

    -- Colonnes BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decompte_ret_decompte ON decompte_retenues(decompte_id);
CREATE INDEX IF NOT EXISTS idx_decompte_ret_type ON decompte_retenues(type_retenue);

-- =====================================================
-- 9. IMPUTATIONS_PREVISIONNELLES - Répartition budgétaire prévisionnelle
-- =====================================================

CREATE TABLE IF NOT EXISTS imputations_previsionnelles (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    volet VARCHAR(200),
    date_demarrage DATE NOT NULL,
    delai_mois INTEGER NOT NULL DEFAULT 12,
    date_fin_prevue DATE,
    remarques TEXT,

    -- Colonnes BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_imputations_convention ON imputations_previsionnelles(convention_id);

-- =====================================================
-- 10. VERSEMENTS_PREVISIONNELS - Planification des paiements
-- =====================================================

CREATE TABLE IF NOT EXISTS versements_previsionnels (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    volet VARCHAR(200),
    date_versement DATE NOT NULL,
    montant DECIMAL(15,2) NOT NULL DEFAULT 0,
    partenaire_id BIGINT NOT NULL REFERENCES partenaires(id) ON DELETE CASCADE,
    mod_id BIGINT REFERENCES partenaires(id),
    remarques TEXT,

    -- Colonnes BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_versements_convention ON versements_previsionnels(convention_id);
CREATE INDEX IF NOT EXISTS idx_versements_partenaire ON versements_previsionnels(partenaire_id);
CREATE INDEX IF NOT EXISTS idx_versements_date ON versements_previsionnels(date_versement);

-- =====================================================
-- 11. IMPUTATIONS_ANALYTIQUES - Ventilation par dimensions (JSONB)
-- =====================================================

CREATE TABLE IF NOT EXISTS imputations_analytiques (
    id BIGSERIAL PRIMARY KEY,
    type_imputation VARCHAR(50) NOT NULL,
    reference_id BIGINT NOT NULL,
    montant DECIMAL(15,2) NOT NULL DEFAULT 0,
    dimensions_valeurs JSONB NOT NULL,
    created_by_id BIGINT REFERENCES users(id),

    -- Colonnes BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_imputations_type_ref ON imputations_analytiques(type_imputation, reference_id);
CREATE INDEX IF NOT EXISTS idx_imputations_dimensions ON imputations_analytiques USING GIN(dimensions_valeurs);

-- =====================================================
-- 12. USER_ROLES - Rôles des utilisateurs (@ElementCollection)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

-- =====================================================
-- FIN DE LA MIGRATION V6
-- =====================================================
