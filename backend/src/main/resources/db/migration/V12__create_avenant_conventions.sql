-- V12__create_avenant_conventions.sql
-- Create avenant_conventions table for convention amendments with full workflow and audit trail
-- Stores snapshot of data before changes and proposed modifications in JSONB format

CREATE TABLE IF NOT EXISTS avenant_conventions (
    id BIGSERIAL PRIMARY KEY,

    -- Relation
    convention_id BIGINT NOT NULL,

    -- Identification
    numero_avenant VARCHAR(50) NOT NULL UNIQUE,
    date_avenant DATE NOT NULL,
    objet TEXT NOT NULL,
    motif TEXT,

    -- Workflow
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',

    -- Snapshot et modifications (JSONB pour flexibilité)
    donnees_avant JSONB,
    modifications JSONB,
    details_modifications TEXT,

    -- Impacts financiers (pour reporting rapide)
    ancien_budget DECIMAL(15, 2),
    nouveau_budget DECIMAL(15, 2),
    delta_budget DECIMAL(15, 2),
    ancien_taux_commission DECIMAL(5, 2),
    nouveau_taux_commission DECIMAL(5, 2),

    -- Dates workflow
    date_soumission DATE,
    date_validation DATE,
    date_effet DATE,

    -- Utilisateurs workflow
    created_by_id BIGINT,
    soumis_par_id BIGINT,
    valide_par_id BIGINT,

    -- Notes
    remarques TEXT,
    motif_rejet TEXT,

    -- Pièce jointe
    fichier_avenant VARCHAR(500),

    -- Ordre chronologique
    ordre_application INTEGER,

    -- Audit fields (from BaseEntity)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_avenant_conventions_convention
        FOREIGN KEY (convention_id)
        REFERENCES conventions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_avenant_conventions_created_by
        FOREIGN KEY (created_by_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_avenant_conventions_soumis_par
        FOREIGN KEY (soumis_par_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_avenant_conventions_valide_par
        FOREIGN KEY (valide_par_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    -- Check constraints
    CONSTRAINT chk_avenant_statut
        CHECK (statut IN ('BROUILLON', 'SOUMIS', 'VALIDE')),

    CONSTRAINT chk_avenant_budgets
        CHECK (
            (ancien_budget IS NULL AND nouveau_budget IS NULL) OR
            (ancien_budget IS NOT NULL AND nouveau_budget IS NOT NULL)
        )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_avenant_conventions_convention ON avenant_conventions(convention_id);
CREATE INDEX IF NOT EXISTS idx_avenant_conventions_numero ON avenant_conventions(numero_avenant);
CREATE INDEX IF NOT EXISTS idx_avenant_conventions_statut ON avenant_conventions(statut);
CREATE INDEX IF NOT EXISTS idx_avenant_conventions_date ON avenant_conventions(date_avenant);
CREATE INDEX IF NOT EXISTS idx_avenant_conventions_ordre ON avenant_conventions(convention_id, ordre_application);

-- JSONB indexes for querying modifications
CREATE INDEX IF NOT EXISTS idx_avenant_conventions_donnees_avant ON avenant_conventions USING GIN (donnees_avant);
CREATE INDEX IF NOT EXISTS idx_avenant_conventions_modifications ON avenant_conventions USING GIN (modifications);

-- Comments
COMMENT ON TABLE avenant_conventions IS 'Avenants de conventions avec workflow complet (BROUILLON → SOUMIS → VALIDE)';
COMMENT ON COLUMN avenant_conventions.convention_id IS 'Convention parente';
COMMENT ON COLUMN avenant_conventions.numero_avenant IS 'Numéro unique de l''avenant (ex: AVE-CONV-001)';
COMMENT ON COLUMN avenant_conventions.objet IS 'Objectif de l''avenant';
COMMENT ON COLUMN avenant_conventions.motif IS 'Justification détaillée';
COMMENT ON COLUMN avenant_conventions.statut IS 'Workflow: BROUILLON (éditable), SOUMIS (en attente), VALIDE (appliqué)';
COMMENT ON COLUMN avenant_conventions.donnees_avant IS 'Snapshot JSONB des données de la convention avant modification';
COMMENT ON COLUMN avenant_conventions.modifications IS 'JSONB des modifications proposées (champs modifiés)';
COMMENT ON COLUMN avenant_conventions.details_modifications IS 'Description textuelle des modifications pour affichage';
COMMENT ON COLUMN avenant_conventions.delta_budget IS 'Variation du budget (positif = augmentation, négatif = réduction)';
COMMENT ON COLUMN avenant_conventions.date_effet IS 'Date d''entrée en vigueur de l''avenant validé';
COMMENT ON COLUMN avenant_conventions.ordre_application IS 'Ordre chronologique d''application des avenants (1, 2, 3...)';
COMMENT ON COLUMN avenant_conventions.motif_rejet IS 'Motif de rejet (retour à BROUILLON)';

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_avenant_conventions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_avenant_conventions_updated_at
    BEFORE UPDATE ON avenant_conventions
    FOR EACH ROW
    EXECUTE FUNCTION update_avenant_conventions_updated_at();
