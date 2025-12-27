-- Migration V18: Advanced export system
-- Track export history and templates

CREATE TABLE IF NOT EXISTS export_templates (
    id BIGSERIAL PRIMARY KEY,
    nom_template VARCHAR(100) NOT NULL,
    type_export VARCHAR(50) NOT NULL, -- EXCEL, PDF, CSV
    type_entite VARCHAR(50) NOT NULL, -- DECOMPTE, PAIEMENT, COMMISSION
    configuration JSONB, -- Template configuration
    created_by_id BIGINT,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS export_historique (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT,
    type_export VARCHAR(50) NOT NULL,
    nom_fichier VARCHAR(255) NOT NULL,
    parametres JSONB,
    statut VARCHAR(20) DEFAULT 'EN_COURS',
    date_generation TIMESTAMP DEFAULT NOW(),
    generated_by_id BIGINT,
    taille_octets BIGINT,
    chemin_fichier TEXT,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_export_templates_type ON export_templates(type_export, type_entite);
CREATE INDEX idx_export_historique_date ON export_historique(date_generation);
CREATE INDEX idx_export_historique_user ON export_historique(generated_by_id);

COMMENT ON TABLE export_templates IS 'Templates d''exports personnalisables';
COMMENT ON TABLE export_historique IS 'Historique des exports générés';
