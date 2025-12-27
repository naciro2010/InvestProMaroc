-- Migration V15: Advanced commission calculation
-- Complex commission rules with tranches, exclusions, triggers

CREATE TABLE IF NOT EXISTS regles_commission (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL,
    nom_regle VARCHAR(100) NOT NULL,
    base_calcul VARCHAR(20) NOT NULL, -- HT, TTC, AUTRE
    mode_calcul VARCHAR(20) NOT NULL, -- TAUX_FIXE, TRANCHES, MIXTE
    taux_defaut DECIMAL(5,2),
    plafond DECIMAL(15,2),
    montant_minimum DECIMAL(15,2),
    declencheur VARCHAR(50), -- PAIEMENT, VALIDATION, AUTRE
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_regles_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tranches_commission (
    id BIGSERIAL PRIMARY KEY,
    regle_id BIGINT NOT NULL,
    seuil_min DECIMAL(15,2) NOT NULL,
    seuil_max DECIMAL(15,2),
    taux DECIMAL(5,2) NOT NULL,
    montant_forfaitaire DECIMAL(15,2),
    ordre_tranche INTEGER DEFAULT 0,

    CONSTRAINT fk_tranches_regle FOREIGN KEY (regle_id) REFERENCES regles_commission(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exclusions_commission (
    id BIGSERIAL PRIMARY KEY,
    regle_id BIGINT NOT NULL,
    type_exclusion VARCHAR(50) NOT NULL, -- POSTE_BUDGETAIRE, FOURNISSEUR, TYPE_DEPENSE
    valeur_exclue VARCHAR(200) NOT NULL,
    motif TEXT,

    CONSTRAINT fk_exclusions_regle FOREIGN KEY (regle_id) REFERENCES regles_commission(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_regles_commission ON regles_commission(convention_id);
CREATE INDEX idx_tranches_commission ON tranches_commission(regle_id);
CREATE INDEX idx_exclusions_commission ON exclusions_commission(regle_id);

COMMENT ON TABLE regles_commission IS 'Règles avancées de calcul de commission';
COMMENT ON TABLE tranches_commission IS 'Tranches progressives pour calcul par paliers';
COMMENT ON TABLE exclusions_commission IS 'Exclusions dans le calcul de la commission';
