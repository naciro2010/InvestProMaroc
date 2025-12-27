-- Migration V13: Create subventions tables
-- External financing (grants, loans) from donors/lenders

CREATE TABLE IF NOT EXISTS subventions (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL,
    organisme_bailleur VARCHAR(200) NOT NULL,
    type_subvention VARCHAR(50),
    montant_total DECIMAL(15,2) NOT NULL,
    devise VARCHAR(3) DEFAULT 'MAD',
    taux_change DECIMAL(10,4),
    date_signature DATE,
    date_debut_validite DATE,
    date_fin_validite DATE,
    conditions TEXT,
    observations TEXT,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_subventions_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS echeances_subvention (
    id BIGSERIAL PRIMARY KEY,
    subvention_id BIGINT NOT NULL,
    date_echeance DATE NOT NULL,
    montant DECIMAL(15,2) NOT NULL,
    statut VARCHAR(20) DEFAULT 'PREVU' NOT NULL,
    date_reception DATE,
    libelle VARCHAR(200),

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_echeances_subvention FOREIGN KEY (subvention_id) REFERENCES subventions(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_subventions_convention ON subventions(convention_id);
CREATE INDEX idx_subventions_organisme ON subventions(organisme_bailleur);
CREATE INDEX idx_echeances_subvention ON echeances_subvention(subvention_id);
CREATE INDEX idx_echeances_date ON echeances_subvention(date_echeance);

COMMENT ON TABLE subventions IS 'Subventions et financements externes (bailleurs)';
COMMENT ON TABLE echeances_subvention IS 'Échéancier de versement des subventions';
