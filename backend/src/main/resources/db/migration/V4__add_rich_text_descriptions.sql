-- =============================================================================
-- V4: Add Rich Text Description Fields (HTML/JSONB)
-- =============================================================================
-- Migration to support rich text descriptions with formatting (bold, italic, colors, etc.)
-- Uses JSONB to store Quill Delta format or HTML
-- Date: January 2026

-- Add rich text description column to conventions table
ALTER TABLE conventions
ADD COLUMN IF NOT EXISTS objet_rich JSONB COMMENT 'Rich text description with formatting (Quill Delta format)';

-- Create index for JSONB queries on conventions
CREATE INDEX IF NOT EXISTS idx_conventions_objet_rich
ON conventions USING GIN (objet_rich);

-- Add rich text description column to projets table
ALTER TABLE projets
ADD COLUMN IF NOT EXISTS description_rich JSONB COMMENT 'Rich text project description with formatting';

-- Create index for JSONB queries on projets
CREATE INDEX IF NOT EXISTS idx_projets_description_rich
ON projets USING GIN (description_rich);

-- Add rich text description column to marches table
ALTER TABLE marches
ADD COLUMN IF NOT EXISTS description_rich JSONB COMMENT 'Rich text market description with formatting';

-- Create index for JSONB queries on marches
CREATE INDEX IF NOT EXISTS idx_marches_description_rich
ON marches USING GIN (description_rich);

-- Migrate existing plain text to JSONB format
-- For conventions: convert objet (plain text) to objet_rich (Quill Delta format)
UPDATE conventions
SET objet_rich = jsonb_build_object(
  'ops',
  CASE
    WHEN objet IS NOT NULL AND objet != '' THEN
      jsonb_build_array(
        jsonb_build_object('insert', objet)
      )
    ELSE
      jsonb_build_array()
  END
)
WHERE objet_rich IS NULL;

-- For projets: convert description (plain text) to description_rich (Quill Delta format)
UPDATE projets
SET description_rich = jsonb_build_object(
  'ops',
  CASE
    WHEN description IS NOT NULL AND description != '' THEN
      jsonb_build_array(
        jsonb_build_object('insert', description)
      )
    ELSE
      jsonb_build_array()
  END
)
WHERE description_rich IS NULL;

-- For marches: convert description (plain text) to description_rich (Quill Delta format)
UPDATE marches
SET description_rich = jsonb_build_object(
  'ops',
  CASE
    WHEN description IS NOT NULL AND description != '' THEN
      jsonb_build_array(
        jsonb_build_object('insert', description)
      )
    ELSE
      jsonb_build_array()
  END
)
WHERE description_rich IS NULL;

-- Backfill empty JSONB with default empty Quill Delta format
UPDATE conventions
SET objet_rich = jsonb_build_object('ops', jsonb_build_array())
WHERE objet_rich IS NULL;

UPDATE projets
SET description_rich = jsonb_build_object('ops', jsonb_build_array())
WHERE description_rich IS NULL;

UPDATE marches
SET description_rich = jsonb_build_object('ops', jsonb_build_array())
WHERE description_rich IS NULL;

-- Note: Plain text fields (objet, description) can be kept for backwards compatibility
-- The rich text fields (objet_rich, description_rich) will be used by new frontend
-- Existing API responses can include both fields for seamless migration
