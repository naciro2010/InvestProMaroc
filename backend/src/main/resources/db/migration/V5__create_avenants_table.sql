-- =====================================================
-- Migration V5: Création table avenants (Avenants de Convention)
-- =====================================================
-- Table pour gérer les avenants/modifications de conventions
-- Permet de tracker les versions et impacts (AVANT/APRÈS)

CREATE TABLE avenants (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
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

    -- Impacts calculés
    impact_montant DECIMAL(15,2),
    impact_commission DECIMAL(15,2),
    impact_delai_jours INTEGER,

    -- Détails
    justification TEXT,
    details TEXT,

    -- Workflow
    date_validation DATE,
    valide_par_id BIGINT,
    is_locked BOOLEAN NOT NULL DEFAULT false,

    -- Audit (BaseEntity)
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(convention_id, numero_avenant)
);

-- Indexes pour performance
CREATE INDEX idx_avenants_convention ON avenants(convention_id);
CREATE INDEX idx_avenants_numero ON avenants(numero_avenant);
CREATE INDEX idx_avenants_statut ON avenants(statut);
CREATE INDEX idx_avenants_version ON avenants(version_resultante);
CREATE INDEX idx_avenants_date_validation ON avenants(date_validation);

-- =====================================================
-- FIN DE LA MIGRATION V5
-- =====================================================
