-- Migration V11: Create ordres_paiement tables
-- Payment orders with analytical imputations

CREATE TABLE IF NOT EXISTS ordres_paiement (
    id BIGSERIAL PRIMARY KEY,
    decompte_id BIGINT NOT NULL,
    numero_op VARCHAR(50) NOT NULL UNIQUE,
    date_op DATE NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',

    -- Montant
    montant_a_payer DECIMAL(15,2) NOT NULL,
    est_paiement_partiel BOOLEAN DEFAULT FALSE NOT NULL,

    -- Dates
    date_prevue_paiement DATE,

    -- Mode et banque
    mode_paiement VARCHAR(20),
    compte_bancaire_id BIGINT,

    observations TEXT,

    -- Validation
    date_validation DATE,
    valide_par_id BIGINT,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_op_decompte FOREIGN KEY (decompte_id) REFERENCES decomptes(id) ON DELETE CASCADE,
    CONSTRAINT fk_op_compte FOREIGN KEY (compte_bancaire_id) REFERENCES comptes_bancaires(id)
);

CREATE TABLE IF NOT EXISTS op_imputations (
    id BIGSERIAL PRIMARY KEY,
    ordre_paiement_id BIGINT NOT NULL,
    projet_id BIGINT,
    axe_id BIGINT,
    budget_id BIGINT,
    montant DECIMAL(15,2) NOT NULL,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_op_imp_op FOREIGN KEY (ordre_paiement_id) REFERENCES ordres_paiement(id) ON DELETE CASCADE,
    CONSTRAINT fk_op_imp_projet FOREIGN KEY (projet_id) REFERENCES projets(id),
    CONSTRAINT fk_op_imp_axe FOREIGN KEY (axe_id) REFERENCES axes_analytiques(id),
    CONSTRAINT fk_op_imp_budget FOREIGN KEY (budget_id) REFERENCES budgets(id)
);

-- Indexes
CREATE INDEX idx_op_numero ON ordres_paiement(numero_op);
CREATE INDEX idx_op_decompte ON ordres_paiement(decompte_id);
CREATE INDEX idx_op_statut ON ordres_paiement(statut);
CREATE INDEX idx_op_imp ON op_imputations(ordre_paiement_id);

COMMENT ON TABLE ordres_paiement IS 'Ordres de paiement';
COMMENT ON TABLE op_imputations IS 'Imputations analytiques des ordres de paiement';
