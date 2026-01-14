-- Fix avenant_marches table schema to match AvenantMarche entity
-- Add missing columns that are defined in the entity

-- Check if columns exist, if not add them
ALTER TABLE avenant_marches
ADD COLUMN IF NOT EXISTS date_effet DATE,
ADD COLUMN IF NOT EXISTS objet TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS statut VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
ADD COLUMN IF NOT EXISTS montant_initial_ht DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS montant_avenant_ht DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS montant_apres_ht DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS pourcentage_variation DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS delai_initial_mois INTEGER,
ADD COLUMN IF NOT EXISTS delai_supplementaire_mois INTEGER,
ADD COLUMN IF NOT EXISTS delai_apres_mois INTEGER,
ADD COLUMN IF NOT EXISTS date_fin_initiale DATE,
ADD COLUMN IF NOT EXISTS date_fin_apres DATE,
ADD COLUMN IF NOT EXISTS details_avant TEXT,
ADD COLUMN IF NOT EXISTS details_apres TEXT,
ADD COLUMN IF NOT EXISTS details_modifications TEXT,
ADD COLUMN IF NOT EXISTS date_validation DATE,
ADD COLUMN IF NOT EXISTS valide_par_id BIGINT,
ADD COLUMN IF NOT EXISTS remarques TEXT,
ADD COLUMN IF NOT EXISTS fichier_avenant VARCHAR(500);

-- Add constraints if needed
ALTER TABLE avenant_marches
ADD CONSTRAINT IF NOT EXISTS fk_avenant_marches_user FOREIGN KEY (valide_par_id) REFERENCES users(id);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_avenant_marches_marche ON avenant_marches(marche_id);
CREATE INDEX IF NOT EXISTS idx_avenant_marches_numero ON avenant_marches(numero_avenant);
CREATE INDEX IF NOT EXISTS idx_avenant_marches_statut ON avenant_marches(statut);

COMMIT;
