-- Migration V20: Bank reconciliation
-- Match payments with bank statements

CREATE TABLE IF NOT EXISTS releves_bancaires (
    id BIGSERIAL PRIMARY KEY,
    compte_bancaire_id BIGINT NOT NULL,
    numero_releve VARCHAR(50) NOT NULL,
    date_releve DATE NOT NULL,
    date_debut_periode DATE NOT NULL,
    date_fin_periode DATE NOT NULL,
    solde_debut DECIMAL(15,2),
    solde_fin DECIMAL(15,2),
    statut VARCHAR(20) DEFAULT 'IMPORTE', -- IMPORTE, RAPPROCHE, VALIDE

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_releves_compte FOREIGN KEY (compte_bancaire_id) REFERENCES comptes_bancaires(id)
);

CREATE TABLE IF NOT EXISTS lignes_releve (
    id BIGSERIAL PRIMARY KEY,
    releve_id BIGINT NOT NULL,
    date_operation DATE NOT NULL,
    date_valeur DATE NOT NULL,
    libelle VARCHAR(500) NOT NULL,
    reference VARCHAR(100),
    montant DECIMAL(15,2) NOT NULL,
    sens VARCHAR(10) NOT NULL, -- DEBIT, CREDIT
    est_rapproche BOOLEAN DEFAULT FALSE,
    paiement_id BIGINT,
    date_rapprochement TIMESTAMP,

    CONSTRAINT fk_lignes_releve FOREIGN KEY (releve_id) REFERENCES releves_bancaires(id) ON DELETE CASCADE,
    CONSTRAINT fk_lignes_paiement FOREIGN KEY (paiement_id) REFERENCES paiements(id)
);

-- Indexes
CREATE INDEX idx_releves_compte ON releves_bancaires(compte_bancaire_id);
CREATE INDEX idx_releves_date ON releves_bancaires(date_releve);
CREATE INDEX idx_lignes_releve ON lignes_releve(releve_id);
CREATE INDEX idx_lignes_rapprochement ON lignes_releve(est_rapproche);

COMMENT ON TABLE releves_bancaires IS 'Relevés bancaires importés';
COMMENT ON TABLE lignes_releve IS 'Lignes de relevé bancaire pour rapprochement';
