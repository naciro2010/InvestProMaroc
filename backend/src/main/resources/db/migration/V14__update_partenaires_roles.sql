-- Migration V14: Enhance partenaires with roles
-- Add roles: MOA, MOD, Bailleur, Représentant signataire

ALTER TABLE partenaires ADD COLUMN IF NOT EXISTS role_type VARCHAR(20);
ALTER TABLE partenaires ADD COLUMN IF NOT EXISTS ice VARCHAR(15);
ALTER TABLE partenaires ADD COLUMN IF NOT EXISTS rc VARCHAR(20);
ALTER TABLE partenaires ADD COLUMN IF NOT EXISTS if_numero VARCHAR(20);
ALTER TABLE partenaires ADD COLUMN IF NOT EXISTS representant_nom VARCHAR(200);
ALTER TABLE partenaires ADD COLUMN IF NOT EXISTS representant_fonction VARCHAR(100);
ALTER TABLE partenaires ADD COLUMN IF NOT EXISTS representant_email VARCHAR(100);
ALTER TABLE partenaires ADD COLUMN IF NOT EXISTS representant_telephone VARCHAR(20);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partenaires_role ON partenaires(role_type);
CREATE INDEX IF NOT EXISTS idx_partenaires_ice ON partenaires(ice);

COMMENT ON COLUMN partenaires.role_type IS 'Type de rôle: MOA, MOD, BAILLEUR, AUTRE';
COMMENT ON COLUMN partenaires.representant_nom IS 'Nom du représentant signataire';
