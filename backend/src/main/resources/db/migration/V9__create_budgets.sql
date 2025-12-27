-- Migration V9: Create budgets tables
-- Budget management with versions (V0, V1, V2...)

CREATE TABLE IF NOT EXISTS budgets (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL,
    version VARCHAR(10) NOT NULL,
    date_budget DATE NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',

    -- Montants
    plafond_convention DECIMAL(15,2) NOT NULL,
    total_budget DECIMAL(15,2) NOT NULL,

    -- Révision
    budget_precedent_id BIGINT,
    delta_montant DECIMAL(15,2),
    justification TEXT,
    observations TEXT,

    -- Validation
    date_validation DATE,
    valide_par_id BIGINT,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_budgets_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE CASCADE,
    CONSTRAINT fk_budgets_precedent FOREIGN KEY (budget_precedent_id) REFERENCES budgets(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lignes_budget (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    montant DECIMAL(15,2) NOT NULL,
    ordre_affichage INTEGER DEFAULT 0,
    description TEXT,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_lignes_budget FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_budgets_convention ON budgets(convention_id);
CREATE INDEX idx_budgets_version ON budgets(version);
CREATE INDEX idx_budgets_statut ON budgets(statut);
CREATE INDEX idx_lignes_budget ON lignes_budget(budget_id);

-- Unique constraint
CREATE UNIQUE INDEX idx_budgets_unique_version ON budgets(convention_id, version) WHERE actif = TRUE;

-- Comments
COMMENT ON TABLE budgets IS 'Budgets avec gestion de versions (V0, V1, V2...)';
COMMENT ON TABLE lignes_budget IS 'Lignes de budget (chapitres/postes budgétaires)';
