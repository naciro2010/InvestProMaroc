-- ========================================================================================================
-- V5__create_projets_table.sql
-- InvestPro Maroc - Ajout du module Projets
-- PostgreSQL 16
-- ========================================================================================================
-- Description: Création de la table projets pour gérer les projets d'investissement
-- Created: 2026-01-05
-- ========================================================================================================

-- Création de l'ENUM pour le statut des projets
CREATE TYPE statut_projet AS ENUM (
    'EN_PREPARATION',
    'EN_COURS',
    'SUSPENDU',
    'TERMINE',
    'ANNULE'
);

-- --------------------------------------------------------------------------------------------------------
-- TABLE: projets - Gestion des projets d'investissement
-- --------------------------------------------------------------------------------------------------------
CREATE TABLE projets (
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
    statut                   statut_projet NOT NULL DEFAULT 'EN_PREPARATION',
    pourcentage_avancement   DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    localisation             VARCHAR(200),
    objectifs                TEXT,
    remarques                TEXT,
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Contraintes
    CONSTRAINT chk_projets_code_not_empty CHECK (LENGTH(TRIM(code)) > 0),
    CONSTRAINT chk_projets_nom_not_empty CHECK (LENGTH(TRIM(nom)) > 0),
    CONSTRAINT chk_projets_budget_positive CHECK (budget_total >= 0),
    CONSTRAINT chk_projets_duree_positive CHECK (duree_mois IS NULL OR duree_mois > 0),
    CONSTRAINT chk_projets_pourcentage CHECK (pourcentage_avancement >= 0 AND pourcentage_avancement <= 100),
    CONSTRAINT chk_projets_dates CHECK (date_fin_prevue IS NULL OR date_debut IS NULL OR date_fin_prevue >= date_debut),
    CONSTRAINT chk_projets_date_fin_reelle CHECK (date_fin_reelle IS NULL OR date_debut IS NULL OR date_fin_reelle >= date_debut),

    -- Clés étrangères
    CONSTRAINT fk_projets_convention FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE SET NULL,
    CONSTRAINT fk_projets_chef_projet FOREIGN KEY (chef_projet_id) REFERENCES partenaires(id) ON DELETE SET NULL
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_projets_code ON projets(code);
CREATE INDEX idx_projets_convention ON projets(convention_id);
CREATE INDEX idx_projets_chef_projet ON projets(chef_projet_id);
CREATE INDEX idx_projets_statut ON projets(statut);
CREATE INDEX idx_projets_dates ON projets(date_debut, date_fin_prevue);
CREATE INDEX idx_projets_actif ON projets(actif);
CREATE INDEX idx_projets_avancement ON projets(pourcentage_avancement);

-- Commentaires
COMMENT ON TABLE projets IS 'Gestion des projets d''investissement liés aux conventions';
COMMENT ON COLUMN projets.code IS 'Code unique du projet (ex: PRJ-2024-001)';
COMMENT ON COLUMN projets.nom IS 'Nom/titre du projet';
COMMENT ON COLUMN projets.budget_total IS 'Budget total alloué au projet en DH';
COMMENT ON COLUMN projets.duree_mois IS 'Durée estimée du projet en mois';
COMMENT ON COLUMN projets.pourcentage_avancement IS 'Pourcentage d''avancement du projet (0-100)';
COMMENT ON COLUMN projets.chef_projet_id IS 'Partenaire responsable du projet';
COMMENT ON COLUMN projets.statut IS 'Statut du projet: EN_PREPARATION, EN_COURS, SUSPENDU, TERMINE, ANNULE';

-- Données de test (optionnel)
INSERT INTO projets (code, nom, description, budget_total, statut, date_debut, date_fin_prevue, duree_mois, pourcentage_avancement)
VALUES
    ('PRJ-2024-001', 'Projet pilote infrastructure', 'Modernisation des infrastructures de base', 5000000.00, 'EN_COURS', '2024-01-15', '2025-01-15', 12, 45.00),
    ('PRJ-2024-002', 'Formation professionnelle', 'Programme de formation et renforcement des capacités', 2000000.00, 'EN_PREPARATION', '2024-06-01', '2025-06-01', 12, 0.00),
    ('PRJ-2024-003', 'Développement rural', 'Amélioration des conditions de vie en zones rurales', 8000000.00, 'EN_COURS', '2024-03-01', '2026-03-01', 24, 60.00);
