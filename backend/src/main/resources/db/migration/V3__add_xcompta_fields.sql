-- Migration V3: Add XCOMPTA-inspired fields to depenses_investissement
-- Date: 2025-12-27
-- Description: Add type_depense, statut, taux_commission, base_calcul, and other XCOMPTA fields

-- Add new columns to depenses_investissement table
ALTER TABLE depenses_investissement
    ADD COLUMN IF NOT EXISTS type_depense VARCHAR(20) DEFAULT 'STANDARD',
    ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'EN_COURS',
    ADD COLUMN IF NOT EXISTS taux_commission DECIMAL(5,2),
    ADD COLUMN IF NOT EXISTS base_calcul VARCHAR(10) DEFAULT 'TTC',
    ADD COLUMN IF NOT EXISTS objet TEXT,
    ADD COLUMN IF NOT EXISTS date_demarrage DATE,
    ADD COLUMN IF NOT EXISTS delai_mois INTEGER,
    ADD COLUMN IF NOT EXISTS date_fin_prevue DATE,
    ADD COLUMN IF NOT EXISTS designation VARCHAR(500);

-- Add check constraints for enums
ALTER TABLE depenses_investissement
    ADD CONSTRAINT chk_type_depense
        CHECK (type_depense IN ('STANDARD', 'CADRE', 'NON_CADRE', 'SPECIFIQUE', 'AVENANT'));

ALTER TABLE depenses_investissement
    ADD CONSTRAINT chk_statut_depense
        CHECK (statut IN ('VALIDEE', 'EN_COURS', 'ACHEVE', 'EN_RETARD', 'ANNULE'));

ALTER TABLE depenses_investissement
    ADD CONSTRAINT chk_base_calcul
        CHECK (base_calcul IN ('TTC', 'HT'));

-- Add check constraint for taux_commission (between 0 and 100)
ALTER TABLE depenses_investissement
    ADD CONSTRAINT chk_taux_commission
        CHECK (taux_commission IS NULL OR (taux_commission >= 0 AND taux_commission <= 100));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_depenses_type_depense ON depenses_investissement(type_depense);
CREATE INDEX IF NOT EXISTS idx_depenses_statut ON depenses_investissement(statut);
CREATE INDEX IF NOT EXISTS idx_depenses_date_demarrage ON depenses_investissement(date_demarrage);

-- Add comments for documentation
COMMENT ON COLUMN depenses_investissement.type_depense IS 'Type de dépense: STANDARD, CADRE, NON_CADRE, SPECIFIQUE, AVENANT';
COMMENT ON COLUMN depenses_investissement.statut IS 'Statut de la dépense: VALIDEE, EN_COURS, ACHEVE, EN_RETARD, ANNULE';
COMMENT ON COLUMN depenses_investissement.taux_commission IS 'Taux de commission en pourcentage (0-100)';
COMMENT ON COLUMN depenses_investissement.base_calcul IS 'Base de calcul de la commission: TTC ou HT';
COMMENT ON COLUMN depenses_investissement.objet IS 'Description détaillée de l''objet de la dépense';
COMMENT ON COLUMN depenses_investissement.date_demarrage IS 'Date de démarrage prévue du projet';
COMMENT ON COLUMN depenses_investissement.delai_mois IS 'Délai d''exécution en mois';
COMMENT ON COLUMN depenses_investissement.date_fin_prevue IS 'Date de fin prévue (calculée: date_demarrage + delai_mois)';
COMMENT ON COLUMN depenses_investissement.designation IS 'Libellé/désignation de la dépense';
