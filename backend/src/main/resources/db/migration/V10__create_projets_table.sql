-- V10__create_projets_table.sql
-- Create projets table for the Projet entity

CREATE TABLE IF NOT EXISTS projets (
    id                       BIGSERIAL PRIMARY KEY,
    code                     VARCHAR(50) NOT NULL UNIQUE,
    nom                      VARCHAR(200) NOT NULL,
    description              TEXT,
    convention_id            BIGINT,
    budget_total             DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    date_debut               DATE,
    date_fin_prevue          DATE,
    date_fin_reelle          DATE,
    duree_mois               INT,
    chef_projet_id           BIGINT,
    statut                   VARCHAR(20) NOT NULL DEFAULT 'EN_PREPARATION',
    pourcentage_avancement   DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    localisation             VARCHAR(200),
    objectifs                TEXT,
    remarques                TEXT,
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_projets_code_not_empty CHECK (LENGTH(TRIM(code)) > 0),
    CONSTRAINT chk_projets_nom_not_empty CHECK (LENGTH(TRIM(nom)) > 0),
    CONSTRAINT chk_projets_budget_positive CHECK (budget_total >= 0),
    CONSTRAINT chk_projets_duree_positive CHECK (duree_mois IS NULL OR duree_mois > 0),
    CONSTRAINT chk_projets_pourcentage CHECK (pourcentage_avancement >= 0 AND pourcentage_avancement <= 100),
    CONSTRAINT chk_projets_dates CHECK (date_fin_prevue IS NULL OR date_debut IS NULL OR date_fin_prevue >= date_debut),
    CONSTRAINT chk_projets_date_fin_reelle CHECK (date_fin_reelle IS NULL OR date_debut IS NULL OR date_fin_reelle >= date_debut),
    CONSTRAINT fk_projets_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE SET NULL,
    CONSTRAINT fk_projets_chef_projet FOREIGN KEY (chef_projet_id) REFERENCES partenaires(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_projets_code ON projets(code);
CREATE INDEX IF NOT EXISTS idx_projets_convention ON projets(convention_id);
CREATE INDEX IF NOT EXISTS idx_projets_chef_projet ON projets(chef_projet_id);
CREATE INDEX IF NOT EXISTS idx_projets_statut ON projets(statut);
CREATE INDEX IF NOT EXISTS idx_projets_actif ON projets(actif);

COMMENT ON TABLE projets IS 'Investment projects linked to conventions';
COMMENT ON COLUMN projets.convention_id IS 'Reference to parent convention';
COMMENT ON COLUMN projets.budget_total IS 'Total allocated budget in MAD';
COMMENT ON COLUMN projets.pourcentage_avancement IS 'Project progress percentage (0-100)';
