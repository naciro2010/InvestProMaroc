-- Migration V8: Create avenants table for convention amendments
-- Tracks AVANT/APRÈS values and version history (V1, V2, V3...)

CREATE TABLE IF NOT EXISTS avenants (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL,
    numero_avenant VARCHAR(50) NOT NULL,
    date_avenant DATE NOT NULL,
    date_signature DATE,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
    version_resultante VARCHAR(10) NOT NULL,
    objet TEXT NOT NULL,

    -- Valeurs AVANT
    montant_avant DECIMAL(15,2),
    taux_commission_avant DECIMAL(5,2),
    date_fin_avant DATE,

    -- Valeurs APRÈS
    montant_apres DECIMAL(15,2),
    taux_commission_apres DECIMAL(5,2),
    date_fin_apres DATE,

    -- Impact / Delta
    impact_montant DECIMAL(15,2),
    impact_commission DECIMAL(15,2),
    impact_delai_jours INTEGER,

    justification TEXT,
    details TEXT,

    -- Workflow
    date_validation DATE,
    valide_par_id BIGINT,
    is_locked BOOLEAN DEFAULT FALSE NOT NULL,

    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_avenants_convention
        FOREIGN KEY (convention_id)
        REFERENCES conventions(id)
        ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_avenants_convention ON avenants(convention_id);
CREATE INDEX idx_avenants_numero ON avenants(numero_avenant);
CREATE INDEX idx_avenants_statut ON avenants(statut);
CREATE INDEX idx_avenants_version ON avenants(version_resultante);
CREATE INDEX idx_avenants_dates ON avenants(date_avenant, date_signature);

-- Unique constraint on numero_avenant within a convention
CREATE UNIQUE INDEX idx_avenants_unique_numero
ON avenants(convention_id, numero_avenant) WHERE actif = TRUE;

-- Comments
COMMENT ON TABLE avenants IS 'Avenants (modifications) de conventions avec tracking AVANT/APRÈS';
COMMENT ON COLUMN avenants.numero_avenant IS 'Numéro unique de l''avenant (ex: AV-001)';
COMMENT ON COLUMN avenants.version_resultante IS 'Version résultante de l''avenant (V1, V2, V3...)';
COMMENT ON COLUMN avenants.montant_avant IS 'Montant de la convention avant l''avenant';
COMMENT ON COLUMN avenants.montant_apres IS 'Montant de la convention après l''avenant';
COMMENT ON COLUMN avenants.impact_montant IS 'Différence entre montant après et montant avant';
COMMENT ON COLUMN avenants.impact_delai_jours IS 'Impact sur le délai en jours (positif = prolongation)';
