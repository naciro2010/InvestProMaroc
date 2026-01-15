-- =============================================================================
-- V5: Create Project-Convention Association Table
-- =============================================================================
-- Junction table to link projects to one or multiple conventions
-- Enables many-to-many relationship between projets and conventions
-- Date: January 2026

-- Create junction table for project-convention associations
CREATE TABLE IF NOT EXISTS projet_conventions (
    id BIGSERIAL PRIMARY KEY,
    projet_id BIGINT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    convention_id BIGINT NOT NULL REFERENCES conventions(id) ON DELETE CASCADE,
    ordre INTEGER DEFAULT 0 COMMENT 'Sequence order for multiple conventions',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(projet_id, convention_id)
) COMMENT 'Many-to-many association between projects and conventions';

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_projet_conventions_projet_id
ON projet_conventions(projet_id);

CREATE INDEX IF NOT EXISTS idx_projet_conventions_convention_id
ON projet_conventions(convention_id);

CREATE INDEX IF NOT EXISTS idx_projet_conventions_ordre
ON projet_conventions(projet_id, ordre);

-- Add comment explaining the relationship
COMMENT ON TABLE projet_conventions IS
'Junction table linking projects (projets) to conventions.
A project can be associated with multiple conventions.
The ordre field controls the display sequence.';

COMMENT ON COLUMN projet_conventions.projet_id IS
'Foreign key to projets table';

COMMENT ON COLUMN projet_conventions.convention_id IS
'Foreign key to conventions table';

COMMENT ON COLUMN projet_conventions.ordre IS
'Display order when multiple conventions are associated with same project';
