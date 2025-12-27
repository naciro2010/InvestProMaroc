-- Migration V17: Document management system (GED)
-- File storage for conventions, budgets, décomptes

CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    type_document VARCHAR(50) NOT NULL, -- CONVENTION, BUDGET, DECOMPTE, FACTURE, AUTRE
    type_entite VARCHAR(50) NOT NULL, -- CONVENTION, MARCHE, DECOMPTE, PAIEMENT
    entite_id BIGINT NOT NULL,
    nom_fichier VARCHAR(255) NOT NULL,
    nom_original VARCHAR(255) NOT NULL,
    chemin_stockage TEXT NOT NULL,
    taille_octets BIGINT,
    mime_type VARCHAR(100),
    extension VARCHAR(10),
    description TEXT,
    date_upload TIMESTAMP DEFAULT NOW(),
    uploaded_by_id BIGINT,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL
);

-- Indexes
CREATE INDEX idx_documents_type ON documents(type_document);
CREATE INDEX idx_documents_entite ON documents(type_entite, entite_id);
CREATE INDEX idx_documents_date ON documents(date_upload);

COMMENT ON TABLE documents IS 'Gestion électronique de documents (GED)';
