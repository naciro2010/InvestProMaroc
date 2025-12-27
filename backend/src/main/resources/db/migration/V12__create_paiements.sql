-- Migration V12: Create paiements tables
-- Actual payments with RÉEL vs BUDGET tracking

CREATE TABLE IF NOT EXISTS paiements (
    id BIGSERIAL PRIMARY KEY,
    ordre_paiement_id BIGINT NOT NULL,
    reference_paiement VARCHAR(100) NOT NULL UNIQUE,
    date_valeur DATE NOT NULL,
    date_execution DATE,

    -- Montant
    montant_paye DECIMAL(15,2) NOT NULL,
    est_paiement_partiel BOOLEAN DEFAULT FALSE NOT NULL,

    -- Mode
    mode_paiement VARCHAR(20) NOT NULL,
    compte_bancaire_id BIGINT,

    observations TEXT,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_paiements_op FOREIGN KEY (ordre_paiement_id) REFERENCES ordres_paiement(id) ON DELETE CASCADE,
    CONSTRAINT fk_paiements_compte FOREIGN KEY (compte_bancaire_id) REFERENCES comptes_bancaires(id)
);

CREATE TABLE IF NOT EXISTS paiement_imputations (
    id BIGSERIAL PRIMARY KEY,
    paiement_id BIGINT NOT NULL,
    projet_id BIGINT,
    axe_id BIGINT,
    budget_id BIGINT,
    montant_reel DECIMAL(15,2) NOT NULL,
    montant_budgete DECIMAL(15,2),
    ecart DECIMAL(15,2),

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_paiement_imp_paiement FOREIGN KEY (paiement_id) REFERENCES paiements(id) ON DELETE CASCADE,
    CONSTRAINT fk_paiement_imp_projet FOREIGN KEY (projet_id) REFERENCES projets(id),
    CONSTRAINT fk_paiement_imp_axe FOREIGN KEY (axe_id) REFERENCES axes_analytiques(id),
    CONSTRAINT fk_paiement_imp_budget FOREIGN KEY (budget_id) REFERENCES budgets(id)
);

-- Indexes
CREATE INDEX idx_paiements_op ON paiements(ordre_paiement_id);
CREATE INDEX idx_paiements_reference ON paiements(reference_paiement);
CREATE INDEX idx_paiement_imp ON paiement_imputations(paiement_id);

COMMENT ON TABLE paiements IS 'Paiements réels effectués';
COMMENT ON TABLE paiement_imputations IS 'Imputations analytiques avec suivi RÉEL vs BUDGET';
