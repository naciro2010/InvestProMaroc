-- Migration V23: Mise à jour Marchés et Imputations Analytiques
-- 1. Ajout convention_id aux marchés
-- 2. Création table marche_lignes avec imputation analytique
-- 3. Création table avenant_marches
-- 4. Mise à jour des imputations vers Plan Analytique Dynamique

-- =============================================================================
-- 1. UPDATE TABLE marches - Ajout relation Convention
-- =============================================================================

ALTER TABLE marches ADD COLUMN IF NOT EXISTS convention_id BIGINT;
ALTER TABLE marches ADD CONSTRAINT fk_marches_convention
    FOREIGN KEY (convention_id) REFERENCES conventions(id);

CREATE INDEX IF NOT EXISTS idx_marches_convention ON marches(convention_id);

-- Suppression de l'ancien index projet_id s'il existe
DROP INDEX IF EXISTS idx_marches_projet;


-- =============================================================================
-- 2. CREATE TABLE marche_lignes - Lignes de marché avec imputation analytique
-- =============================================================================

CREATE TABLE IF NOT EXISTS marche_lignes (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT NOT NULL,
    numero_ligne INTEGER NOT NULL,
    designation TEXT NOT NULL,
    unite VARCHAR(50),
    quantite NUMERIC(15, 3),
    prix_unitaire_ht NUMERIC(15, 2) NOT NULL DEFAULT 0,
    montant_ht NUMERIC(15, 2) NOT NULL DEFAULT 0,
    taux_tva NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
    montant_tva NUMERIC(15, 2) NOT NULL DEFAULT 0,
    montant_ttc NUMERIC(15, 2) NOT NULL DEFAULT 0,

    -- Imputation analytique flexible (JSONB)
    imputation_analytique JSONB,

    remarques TEXT,

    -- Métadonnées
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id BIGINT,
    updated_by_id BIGINT,

    CONSTRAINT fk_marche_lignes_marche FOREIGN KEY (marche_id) REFERENCES marches(id) ON DELETE CASCADE
);

CREATE INDEX idx_marche_lignes_marche ON marche_lignes(marche_id);
CREATE INDEX idx_marche_lignes_numero ON marche_lignes(numero_ligne);
CREATE INDEX idx_marche_lignes_imputation ON marche_lignes USING GIN (imputation_analytique);


-- =============================================================================
-- 3. CREATE TABLE avenant_marches - Avenants de marché
-- =============================================================================

CREATE TABLE IF NOT EXISTS avenant_marches (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT NOT NULL,
    numero_avenant VARCHAR(50) NOT NULL,
    date_avenant DATE NOT NULL,
    date_effet DATE,
    objet TEXT NOT NULL,
    motif TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',

    -- Impacts financiers
    montant_initial_ht NUMERIC(15, 2),
    montant_avenant_ht NUMERIC(15, 2),
    montant_apres_ht NUMERIC(15, 2),
    pourcentage_variation NUMERIC(5, 2),

    -- Impacts délais
    delai_initial_mois INTEGER,
    delai_supplementaire_mois INTEGER,
    delai_apres_mois INTEGER,
    date_fin_initiale DATE,
    date_fin_apres DATE,

    -- Détails
    details_avant TEXT,
    details_apres TEXT,
    details_modifications TEXT,

    -- Validation
    date_validation DATE,
    valide_par_id BIGINT,

    remarques TEXT,
    fichier_avenant VARCHAR(500),

    -- Métadonnées
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id BIGINT,
    updated_by_id BIGINT,

    CONSTRAINT fk_avenant_marches_marche FOREIGN KEY (marche_id) REFERENCES marches(id) ON DELETE CASCADE
);

CREATE INDEX idx_avenant_marches_marche ON avenant_marches(marche_id);
CREATE INDEX idx_avenant_marches_numero ON avenant_marches(numero_avenant);
CREATE INDEX idx_avenant_marches_statut ON avenant_marches(statut);


-- =============================================================================
-- 4. UPDATE TABLE decompte_retenues - Ajout champ actif
-- =============================================================================

ALTER TABLE decompte_retenues ADD COLUMN IF NOT EXISTS actif BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_decompte_ret_decompte ON decompte_retenues(decompte_id);
CREATE INDEX IF NOT EXISTS idx_decompte_ret_type ON decompte_retenues(type_retenue);


-- =============================================================================
-- 5. UPDATE TABLE decompte_imputations - Migration vers Plan Analytique Dynamique
-- =============================================================================

-- Sauvegarder les anciennes données si les colonnes existent
DO $$
BEGIN
    -- Ajouter la colonne dimensions_valeurs si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'decompte_imputations' AND column_name = 'dimensions_valeurs'
    ) THEN
        ALTER TABLE decompte_imputations ADD COLUMN dimensions_valeurs JSONB NOT NULL DEFAULT '{}'::jsonb;
    END IF;

    -- Ajouter remarques si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'decompte_imputations' AND column_name = 'remarques'
    ) THEN
        ALTER TABLE decompte_imputations ADD COLUMN remarques TEXT;
    END IF;

    -- Supprimer les anciennes colonnes si elles existent
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'decompte_imputations' AND column_name = 'projet_id') THEN
        ALTER TABLE decompte_imputations DROP COLUMN IF EXISTS projet_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'decompte_imputations' AND column_name = 'axe_id') THEN
        ALTER TABLE decompte_imputations DROP COLUMN IF EXISTS axe_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'decompte_imputations' AND column_name = 'budget_id') THEN
        ALTER TABLE decompte_imputations DROP COLUMN IF EXISTS budget_id;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_decompte_imp_decompte ON decompte_imputations(decompte_id);
CREATE INDEX IF NOT EXISTS idx_decompte_imp_dimensions ON decompte_imputations USING GIN (dimensions_valeurs);


-- =============================================================================
-- 6. UPDATE TABLE op_imputations - Migration vers Plan Analytique Dynamique
-- =============================================================================

DO $$
BEGIN
    -- Ajouter la colonne dimensions_valeurs si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'op_imputations' AND column_name = 'dimensions_valeurs'
    ) THEN
        ALTER TABLE op_imputations ADD COLUMN dimensions_valeurs JSONB NOT NULL DEFAULT '{}'::jsonb;
    END IF;

    -- Ajouter remarques si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'op_imputations' AND column_name = 'remarques'
    ) THEN
        ALTER TABLE op_imputations ADD COLUMN remarques TEXT;
    END IF;

    -- Supprimer les anciennes colonnes si elles existent
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'op_imputations' AND column_name = 'projet_id') THEN
        ALTER TABLE op_imputations DROP COLUMN IF EXISTS projet_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'op_imputations' AND column_name = 'axe_id') THEN
        ALTER TABLE op_imputations DROP COLUMN IF EXISTS axe_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'op_imputations' AND column_name = 'budget_id') THEN
        ALTER TABLE op_imputations DROP COLUMN IF EXISTS budget_id;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_op_imp_op ON op_imputations(ordre_paiement_id);
CREATE INDEX IF NOT EXISTS idx_op_imp_dimensions ON op_imputations USING GIN (dimensions_valeurs);


-- =============================================================================
-- 7. UPDATE TABLE paiement_imputations - Migration vers Plan Analytique Dynamique
-- =============================================================================

DO $$
BEGIN
    -- Ajouter la colonne dimensions_valeurs si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'paiement_imputations' AND column_name = 'dimensions_valeurs'
    ) THEN
        ALTER TABLE paiement_imputations ADD COLUMN dimensions_valeurs JSONB NOT NULL DEFAULT '{}'::jsonb;
    END IF;

    -- Ajouter remarques si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'paiement_imputations' AND column_name = 'remarques'
    ) THEN
        ALTER TABLE paiement_imputations ADD COLUMN remarques TEXT;
    END IF;

    -- Supprimer les anciennes colonnes si elles existent
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'paiement_imputations' AND column_name = 'projet_id') THEN
        ALTER TABLE paiement_imputations DROP COLUMN IF EXISTS projet_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'paiement_imputations' AND column_name = 'axe_id') THEN
        ALTER TABLE paiement_imputations DROP COLUMN IF EXISTS axe_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'paiement_imputations' AND column_name = 'budget_id') THEN
        ALTER TABLE paiement_imputations DROP COLUMN IF EXISTS budget_id;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_paiement_imp_paiement ON paiement_imputations(paiement_id);
CREATE INDEX IF NOT EXISTS idx_paiement_imp_dimensions ON paiement_imputations USING GIN (dimensions_valeurs);


-- =============================================================================
-- COMMENTAIRES SUR LES TABLES
-- =============================================================================

COMMENT ON TABLE marche_lignes IS 'Lignes de détail des marchés avec imputation analytique flexible via JSONB';
COMMENT ON COLUMN marche_lignes.imputation_analytique IS 'Stockage JSONB des dimensions analytiques (ex: {"REG":"CAS","MARCH":"TRAVAUX"})';

COMMENT ON TABLE avenant_marches IS 'Avenants et modifications contractuelles des marchés';

COMMENT ON COLUMN decompte_imputations.dimensions_valeurs IS 'Imputation analytique flexible (Plan Analytique Dynamique) - JSONB';
COMMENT ON COLUMN op_imputations.dimensions_valeurs IS 'Imputation analytique flexible (Plan Analytique Dynamique) - JSONB';
COMMENT ON COLUMN paiement_imputations.dimensions_valeurs IS 'Imputation analytique flexible (Plan Analytique Dynamique) - JSONB';
