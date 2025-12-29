-- ==========================================
-- Migration V21: Système Plan Analytique Dynamique
-- ==========================================
-- Remplace les dimensions fixes (Projet, Axe) par un système flexible
-- Permet de créer des dimensions personnalisées (Région, Marché, Phase, etc.)

-- Table: Dimensions Analytiques (Configuration)
CREATE TABLE dimensions_analytiques (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    ordre INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    obligatoire BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by_id BIGINT REFERENCES users(id),

    -- Audit BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    date_creation TIMESTAMP NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMP,
    cree_par_id BIGINT REFERENCES users(id),
    modifie_par_id BIGINT REFERENCES users(id)
);

COMMENT ON TABLE dimensions_analytiques IS 'Configuration des dimensions analytiques personnalisées';
COMMENT ON COLUMN dimensions_analytiques.code IS 'Code court de la dimension (ex: REG, MARCH, PHASE)';
COMMENT ON COLUMN dimensions_analytiques.nom IS 'Nom de la dimension (ex: Région, Type Marché)';
COMMENT ON COLUMN dimensions_analytiques.obligatoire IS 'Dimension obligatoire pour imputation';

-- Table: Valeurs des Dimensions
CREATE TABLE valeurs_dimensions (
    id BIGSERIAL PRIMARY KEY,
    dimension_id BIGINT NOT NULL REFERENCES dimensions_analytiques(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT true,
    ordre INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Audit BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    date_creation TIMESTAMP NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMP,
    cree_par_id BIGINT REFERENCES users(id),
    modifie_par_id BIGINT REFERENCES users(id),

    CONSTRAINT uk_valeur_code UNIQUE (dimension_id, code)
);

COMMENT ON TABLE valeurs_dimensions IS 'Valeurs possibles pour chaque dimension';
COMMENT ON COLUMN valeurs_dimensions.code IS 'Code de la valeur (ex: CAS, RAB, MAR)';
COMMENT ON COLUMN valeurs_dimensions.libelle IS 'Libellé de la valeur (ex: Casablanca, Rabat)';

-- Table: Imputations Analytiques (Stockage JSONB)
CREATE TABLE imputations_analytiques (
    id BIGSERIAL PRIMARY KEY,
    type_imputation VARCHAR(50) NOT NULL,
    reference_id BIGINT NOT NULL,
    montant DECIMAL(15,2) NOT NULL,
    dimensions_valeurs JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by_id BIGINT REFERENCES users(id),

    -- Audit BaseEntity
    actif BOOLEAN NOT NULL DEFAULT true,
    date_creation TIMESTAMP NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMP,
    cree_par_id BIGINT REFERENCES users(id),
    modifie_par_id BIGINT REFERENCES users(id)
);

COMMENT ON TABLE imputations_analytiques IS 'Ventilation analytique flexible avec JSONB';
COMMENT ON COLUMN imputations_analytiques.type_imputation IS 'BUDGET, DECOMPTE, ORDRE_PAIEMENT, PAIEMENT';
COMMENT ON COLUMN imputations_analytiques.reference_id IS 'ID de la référence (budget_id, decompte_id, etc.)';
COMMENT ON COLUMN imputations_analytiques.dimensions_valeurs IS 'Map JSON des valeurs {REG: CAS, MARCH: TRAVAUX}';

-- Index pour performance
CREATE INDEX idx_dimensions_code ON dimensions_analytiques(code);
CREATE INDEX idx_dimensions_active ON dimensions_analytiques(active);
CREATE INDEX idx_valeurs_dimension ON valeurs_dimensions(dimension_id);
CREATE INDEX idx_valeurs_active ON valeurs_dimensions(active);
CREATE INDEX idx_imputations_type_ref ON imputations_analytiques(type_imputation, reference_id);
CREATE INDEX idx_imputations_dimensions ON imputations_analytiques USING GIN(dimensions_valeurs);

-- ==========================================
-- Données de démonstration
-- ==========================================

-- Dimension 1: Région
INSERT INTO dimensions_analytiques (code, nom, description, ordre, obligatoire) VALUES
    ('REG', 'Région', 'Région géographique du projet', 1, true);

-- Valeurs Région
INSERT INTO valeurs_dimensions (dimension_id, code, libelle, ordre) VALUES
    (1, 'CAS', 'Casablanca', 1),
    (1, 'RAB', 'Rabat', 2),
    (1, 'MAR', 'Marrakech', 3),
    (1, 'FES', 'Fès', 4),
    (1, 'TAN', 'Tanger', 5),
    (1, 'AGA', 'Agadir', 6);

-- Dimension 2: Type Marché
INSERT INTO dimensions_analytiques (code, nom, description, ordre, obligatoire) VALUES
    ('MARCH', 'Type Marché', 'Catégorie du marché public', 2, false);

-- Valeurs Type Marché
INSERT INTO valeurs_dimensions (dimension_id, code, libelle, ordre) VALUES
    (2, 'TRAV', 'Travaux', 1),
    (2, 'FOUR', 'Fournitures', 2),
    (2, 'SERV', 'Services', 3),
    (2, 'ETUD', 'Études', 4);

-- Dimension 3: Phase Projet
INSERT INTO dimensions_analytiques (code, nom, description, ordre, obligatoire) VALUES
    ('PHASE', 'Phase Projet', 'Phase d''avancement du projet', 3, false);

-- Valeurs Phase Projet
INSERT INTO valeurs_dimensions (dimension_id, code, libelle, ordre) VALUES
    (3, 'ETU', 'Étude', 1),
    (3, 'REAL', 'Réalisation', 2),
    (3, 'CLO', 'Clôture', 3);

-- Dimension 4: Secteur d'Activité
INSERT INTO dimensions_analytiques (code, nom, description, ordre, obligatoire) VALUES
    ('SECT', 'Secteur', 'Secteur d''activité concerné', 4, false);

-- Valeurs Secteur
INSERT INTO valeurs_dimensions (dimension_id, code, libelle, ordre) VALUES
    (4, 'INF', 'Infrastructure', 1),
    (4, 'EDU', 'Éducation', 2),
    (4, 'SAN', 'Santé', 3),
    (4, 'ENV', 'Environnement', 4),
    (4, 'NUM', 'Numérique', 5);
