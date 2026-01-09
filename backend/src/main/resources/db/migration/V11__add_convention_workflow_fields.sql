-- V11__add_convention_workflow_fields.sql
-- Add workflow fields to conventions table: created_by_id and motif_rejet
-- Update enum StatutConvention: add REJETE, rename EN_COURS to EN_EXECUTION

-- Add created_by_id column to track who created the convention
ALTER TABLE conventions
ADD COLUMN IF NOT EXISTS created_by_id BIGINT;

-- Add motif_rejet column for rejection reason
ALTER TABLE conventions
ADD COLUMN IF NOT EXISTS motif_rejet TEXT;

-- Add comment to new columns
COMMENT ON COLUMN conventions.created_by_id IS 'ID of the user who created the convention';
COMMENT ON COLUMN conventions.motif_rejet IS 'Rejection reason if status is REJETE';

-- Update existing records: migrate EN_COURS to EN_EXECUTION
UPDATE conventions
SET statut = 'EN_EXECUTION'
WHERE statut = 'EN_COURS';

-- Update existing records: remove EN_RETARD (obsolete, replaced by calculated field)
UPDATE conventions
SET statut = 'EN_EXECUTION'
WHERE statut = 'EN_RETARD';

-- Note: The StatutConvention enum is updated in the entity code:
-- - REJETE: New status for rejected conventions (can return to BROUILLON)
-- - EN_EXECUTION: Renamed from EN_COURS for clarity
-- - Removed EN_RETARD: Will be calculated based on dates, not stored
