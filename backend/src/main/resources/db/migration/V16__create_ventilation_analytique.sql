-- Migration V16: Advanced analytical breakdown
-- N..N relationships for multi-dimensional analysis

CREATE TABLE IF NOT EXISTS convention_projets (
    id BIGSERIAL PRIMARY KEY,
    convention_id BIGINT NOT NULL,
    projet_id BIGINT NOT NULL,
    pourcentage_repartition DECIMAL(5,2),
    montant_affecte DECIMAL(15,2),

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_conv_proj_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE CASCADE,
    CONSTRAINT fk_conv_proj_projet FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
    UNIQUE(convention_id, projet_id)
);

CREATE TABLE IF NOT EXISTS projet_axes (
    id BIGSERIAL PRIMARY KEY,
    projet_id BIGINT NOT NULL,
    axe_id BIGINT NOT NULL,
    pourcentage_repartition DECIMAL(5,2),
    montant_affecte DECIMAL(15,2),

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    actif BOOLEAN DEFAULT TRUE NOT NULL,

    CONSTRAINT fk_proj_axes_projet FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
    CONSTRAINT fk_proj_axes_axe FOREIGN KEY (axe_id) REFERENCES axes_analytiques(id) ON DELETE CASCADE,
    UNIQUE(projet_id, axe_id)
);

-- Indexes
CREATE INDEX idx_conv_projets_convention ON convention_projets(convention_id);
CREATE INDEX idx_conv_projets_projet ON convention_projets(projet_id);
CREATE INDEX idx_proj_axes_projet ON projet_axes(projet_id);
CREATE INDEX idx_proj_axes_axe ON projet_axes(axe_id);

COMMENT ON TABLE convention_projets IS 'Rattachement N..N Convention ↔ Projet pour ventilation';
COMMENT ON TABLE projet_axes IS 'Rattachement N..N Projet ↔ Axe Analytique pour ventilation multidimensionnelle';
