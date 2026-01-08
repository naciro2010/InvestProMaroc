-- ========================================================================================================
-- V10__fix_projets_table_structure.sql
-- InvestPro Maroc - Correction de la structure de la table projets
-- PostgreSQL 16
-- ========================================================================================================
-- Problème: V5 n'a pas exécuté correctement, la table projets manque des colonnes
-- Solution: Ajouter les colonnes manquantes à la table existante
-- ========================================================================================================

-- Vérifier et ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE IF EXISTS projets
ADD COLUMN IF NOT EXISTS convention_id BIGINT,
ADD COLUMN IF NOT EXISTS chef_projet_id BIGINT,
ADD COLUMN IF NOT EXISTS statut VARCHAR(20) NOT NULL DEFAULT 'EN_PREPARATION',
ADD COLUMN IF NOT EXISTS pourcentage_avancement DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS localisation VARCHAR(200),
ADD COLUMN IF NOT EXISTS objectifs TEXT,
ADD COLUMN IF NOT EXISTS remarques TEXT,
ADD COLUMN IF NOT EXISTS actif BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Ajouter les contraintes de clés étrangères si elles n'existent pas
DO $$
BEGIN
  -- Ajouter FK vers conventions si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projets' AND constraint_name = 'fk_projets_convention'
  ) THEN
    ALTER TABLE projets
    ADD CONSTRAINT fk_projets_convention
    FOREIGN KEY (convention_id) REFERENCES conventions(id) ON DELETE SET NULL;
  END IF;

  -- Ajouter FK vers partenaires si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projets' AND constraint_name = 'fk_projets_chef_projet'
  ) THEN
    ALTER TABLE projets
    ADD CONSTRAINT fk_projets_chef_projet
    FOREIGN KEY (chef_projet_id) REFERENCES partenaires(id) ON DELETE SET NULL;
  END IF;

  -- Ajouter contrainte CHECK pour code non-vide
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projets' AND constraint_name = 'chk_projets_code_not_empty'
  ) THEN
    ALTER TABLE projets
    ADD CONSTRAINT chk_projets_code_not_empty CHECK (LENGTH(TRIM(code)) > 0);
  END IF;

  -- Ajouter contrainte CHECK pour nom non-vide
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projets' AND constraint_name = 'chk_projets_nom_not_empty'
  ) THEN
    ALTER TABLE projets
    ADD CONSTRAINT chk_projets_nom_not_empty CHECK (LENGTH(TRIM(nom)) > 0);
  END IF;

  -- Ajouter contrainte CHECK pour budget positif
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projets' AND constraint_name = 'chk_projets_budget_positive'
  ) THEN
    ALTER TABLE projets
    ADD CONSTRAINT chk_projets_budget_positive CHECK (budget_total >= 0);
  END IF;

  -- Ajouter contrainte CHECK pour durée positive
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projets' AND constraint_name = 'chk_projets_duree_positive'
  ) THEN
    ALTER TABLE projets
    ADD CONSTRAINT chk_projets_duree_positive CHECK (duree_mois IS NULL OR duree_mois > 0);
  END IF;

  -- Ajouter contrainte CHECK pour pourcentage d'avancement
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projets' AND constraint_name = 'chk_projets_pourcentage'
  ) THEN
    ALTER TABLE projets
    ADD CONSTRAINT chk_projets_pourcentage
    CHECK (pourcentage_avancement >= 0 AND pourcentage_avancement <= 100);
  END IF;

  -- Ajouter contrainte CHECK pour dates (fin prévue >= début)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projets' AND constraint_name = 'chk_projets_dates'
  ) THEN
    ALTER TABLE projets
    ADD CONSTRAINT chk_projets_dates
    CHECK (date_fin_prevue IS NULL OR date_debut IS NULL OR date_fin_prevue >= date_debut);
  END IF;

  -- Ajouter contrainte CHECK pour date fin réelle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'projets' AND constraint_name = 'chk_projets_date_fin_reelle'
  ) THEN
    ALTER TABLE projets
    ADD CONSTRAINT chk_projets_date_fin_reelle
    CHECK (date_fin_reelle IS NULL OR date_debut IS NULL OR date_fin_reelle >= date_debut);
  END IF;
END $$;

-- Créer les indices s'ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_projets_code ON projets(code);
CREATE INDEX IF NOT EXISTS idx_projets_convention ON projets(convention_id);
CREATE INDEX IF NOT EXISTS idx_projets_chef_projet ON projets(chef_projet_id);
CREATE INDEX IF NOT EXISTS idx_projets_statut ON projets(statut);
CREATE INDEX IF NOT EXISTS idx_projets_dates ON projets(date_debut, date_fin_prevue);
CREATE INDEX IF NOT EXISTS idx_projets_actif ON projets(actif);
CREATE INDEX IF NOT EXISTS idx_projets_avancement ON projets(pourcentage_avancement);

-- Ajouter les commentaires
COMMENT ON TABLE projets IS 'Gestion des projets d''investissement liés aux conventions';
COMMENT ON COLUMN projets.code IS 'Code unique du projet (ex: PRJ-2024-001)';
COMMENT ON COLUMN projets.nom IS 'Nom/titre du projet';
COMMENT ON COLUMN projets.budget_total IS 'Budget total alloué au projet en DH';
COMMENT ON COLUMN projets.duree_mois IS 'Durée estimée du projet en mois';
COMMENT ON COLUMN projets.pourcentage_avancement IS 'Pourcentage d''avancement du projet (0-100)';
COMMENT ON COLUMN projets.chef_projet_id IS 'Partenaire responsable du projet';
COMMENT ON COLUMN projets.statut IS 'Statut du projet: EN_PREPARATION, EN_COURS, SUSPENDU, TERMINE, ANNULE';

-- Insérer les données de test si la table est vide
INSERT INTO projets (code, nom, description, budget_total, statut, date_debut, date_fin_prevue, duree_mois, pourcentage_avancement)
SELECT 'PRJ-2024-001', 'Projet pilote infrastructure', 'Modernisation des infrastructures de base', 5000000.00, 'EN_COURS', '2024-01-15', '2025-01-15', 12, 45.00
WHERE NOT EXISTS (SELECT 1 FROM projets WHERE code = 'PRJ-2024-001')
UNION ALL
SELECT 'PRJ-2024-002', 'Formation professionnelle', 'Programme de formation et renforcement des capacités', 2000000.00, 'EN_PREPARATION', '2024-06-01', '2025-06-01', 12, 0.00
WHERE NOT EXISTS (SELECT 1 FROM projets WHERE code = 'PRJ-2024-002')
UNION ALL
SELECT 'PRJ-2024-003', 'Développement rural', 'Amélioration des conditions de vie en zones rurales', 8000000.00, 'EN_COURS', '2024-03-01', '2026-03-01', 24, 60.00
WHERE NOT EXISTS (SELECT 1 FROM projets WHERE code = 'PRJ-2024-003');
