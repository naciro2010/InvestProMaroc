-- Migration V7: Add sous-conventions support with parent-child relationship
-- Adds self-referencing relationship and parameter inheritance

-- Add sous-convention columns
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS parent_convention_id BIGINT;
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS herite_parametres BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS surcharge_taux_commission DECIMAL(5,2);
ALTER TABLE conventions ADD COLUMN IF NOT EXISTS surcharge_base_calcul VARCHAR(50);

-- Add foreign key constraint for parent convention
ALTER TABLE conventions
ADD CONSTRAINT fk_conventions_parent
FOREIGN KEY (parent_convention_id)
REFERENCES conventions(id)
ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_conventions_parent ON conventions(parent_convention_id);
CREATE INDEX IF NOT EXISTS idx_conventions_herite ON conventions(herite_parametres);

-- Comment on new columns
COMMENT ON COLUMN conventions.parent_convention_id IS 'ID de la convention parente pour les sous-conventions';
COMMENT ON COLUMN conventions.herite_parametres IS 'Indique si la sous-convention hérite des paramètres de la convention parente';
COMMENT ON COLUMN conventions.surcharge_taux_commission IS 'Surcharge du taux de commission (si différent du parent)';
COMMENT ON COLUMN conventions.surcharge_base_calcul IS 'Surcharge de la base de calcul (si différent du parent)';
