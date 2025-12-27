-- Migration V6: Add workflow fields to conventions table
-- Adds support for BROUILLON -> SOUMIS -> VALIDEE workflow

-- Add new workflow columns
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS date_soumission DATE;
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS date_validation DATE;
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS valide_par_id BIGINT;
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS version VARCHAR(10);
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS motif_verrouillage TEXT;

-- Add index for workflow queries
CREATE INDEX IF NOT EXISTS idx_conventions_workflow ON conventions(statut, is_locked);
CREATE INDEX IF NOT EXISTS idx_conventions_version ON conventions(version);

-- Update existing conventions to set default workflow values
-- Existing conventions with VALIDEE status get V0 version and are locked
UPDATE conventions
SET
    version = 'V0',
    is_locked = TRUE,
    motif_verrouillage = 'Convention existante validée automatiquement lors de la migration'
WHERE statut = 'VALIDEE' AND version IS NULL;

-- Existing conventions with other statuses remain unlocked and get BROUILLON status if not already set
UPDATE conventions
SET
    statut = CASE
        WHEN statut IN ('EN_COURS', 'ACHEVE', 'EN_RETARD') THEN statut
        ELSE 'BROUILLON'
    END,
    is_locked = FALSE
WHERE statut NOT IN ('VALIDEE', 'ANNULE') AND is_locked IS NULL;

-- Comment on new columns
COMMENT ON COLUMN conventions.date_soumission IS 'Date de soumission de la convention pour validation';
COMMENT ON COLUMN conventions.date_validation IS 'Date de validation de la convention (création version V0)';
COMMENT ON COLUMN conventions.valide_par_id IS 'ID de l''utilisateur qui a validé la convention';
COMMENT ON COLUMN conventions.version IS 'Version courante de la convention (V0, V1, V2...)';
COMMENT ON COLUMN conventions.is_locked IS 'Indique si la convention est verrouillée (non modifiable)';
COMMENT ON COLUMN conventions.motif_verrouillage IS 'Raison du verrouillage de la convention';
