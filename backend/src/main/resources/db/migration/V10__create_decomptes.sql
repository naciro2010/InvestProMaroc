-- Migration V10: Create decomptes tables
-- Work progress statements with retentions and imputations

CREATE TABLE IF NOT EXISTS decomptes (
    id BIGSERIAL PRIMARY KEY,
    marche_id BIGINT NOT NULL,
    numero_decompte VARCHAR(50) NOT NULL,
    date_decompte DATE NOT NULL,
    periode_debut DATE NOT NULL,
    periode_fin DATE NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',

    -- Montants
    montant_brut_ht DECIMAL(15,2) NOT NULL,
    montant_tva DECIMAL(15,2) NOT NULL,
    montant_ttc DECIMAL(15,2) NOT NULL,
    total_retenues DECIMAL(15,2) NOT NULL DEFAULT 0,
    net_a_payer DECIMAL(15,2) NOT NULL,

    -- Cumul
    cumul_precedent DECIMAL(15,2) DEFAULT 0,
    cumul_actuel DECIMAL(15,2) DEFAULT 0,

    observations TEXT,

    -- Validation
    date_validation DATE,
    valide_par_id BIGINT,

    -- Paiement
    montant_paye DECIMAL(15,2) DEFAULT 0,
    est_solde BOOLEAN DEFAULT FALSE NOT NULL,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_decomptes_marche FOREIGN KEY (marche_id) REFERENCES marches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS decompte_retenues (
    id BIGSERIAL PRIMARY KEY,
    decompte_id BIGINT NOT NULL,
    type_retenue VARCHAR(20) NOT NULL,
    montant DECIMAL(15,2) NOT NULL,
    taux_pourcent DECIMAL(5,2),
    libelle VARCHAR(200),

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_retenues_decompte FOREIGN KEY (decompte_id) REFERENCES decomptes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS decompte_imputations (
    id BIGSERIAL PRIMARY KEY,
    decompte_id BIGINT NOT NULL,
    projet_id BIGINT,
    axe_id BIGINT,
    budget_id BIGINT,
    montant DECIMAL(15,2) NOT NULL,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_imputations_decompte FOREIGN KEY (decompte_id) REFERENCES decomptes(id) ON DELETE CASCADE,
    CONSTRAINT fk_imputations_projet FOREIGN KEY (projet_id) REFERENCES projets(id),
    CONSTRAINT fk_imputations_axe FOREIGN KEY (axe_id) REFERENCES axes_analytiques(id),
    CONSTRAINT fk_imputations_budget FOREIGN KEY (budget_id) REFERENCES budgets(id)
);

-- Indexes
CREATE INDEX idx_decomptes_marche ON decomptes(marche_id);
CREATE INDEX idx_decomptes_numero ON decomptes(numero_decompte);
CREATE INDEX idx_decomptes_statut ON decomptes(statut);
CREATE INDEX idx_retenues_decompte ON decompte_retenues(decompte_id);
CREATE INDEX idx_imputations_decompte ON decompte_imputations(decompte_id);

-- Unique constraint
CREATE UNIQUE INDEX idx_decomptes_unique_numero ON decomptes(marche_id, numero_decompte) WHERE actif = TRUE;

COMMENT ON TABLE decomptes IS 'Décomptes (situations de travaux/prestations)';
COMMENT ON TABLE decompte_retenues IS 'Retenues sur décomptes (garantie, RAS, pénalités, avances)';
COMMENT ON TABLE decompte_imputations IS 'Imputations analytiques des décomptes';
