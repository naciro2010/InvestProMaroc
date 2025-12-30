-- =====================================================
-- Migration V4: Ajout de date_validation manquante
-- =====================================================
-- Colonne oubliée dans V3 pour avenant_marches

ALTER TABLE avenant_marches
    ADD COLUMN IF NOT EXISTS date_validation DATE;

-- Index pour performance sur les recherches par date de validation
CREATE INDEX IF NOT EXISTS idx_avenant_marches_date_validation
    ON avenant_marches(date_validation);
