-- V13: Ajout de la géolocalisation aux marchés
-- Date: 2026-01-15
-- Description: Ajoute les champs de géolocalisation (adresse, latitude, longitude, zone) aux marchés

-- Ajout des colonnes de géolocalisation à la table marches
ALTER TABLE marches
ADD COLUMN IF NOT EXISTS adresse TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS zone_geographique VARCHAR(100);

-- Création d'un index sur la zone géographique pour les recherches
CREATE INDEX IF NOT EXISTS idx_marches_zone ON marches(zone_geographique);

-- Commentaires pour documentation
COMMENT ON COLUMN marches.adresse IS 'Adresse complète du marché (site de travaux, livraison, etc.)';
COMMENT ON COLUMN marches.latitude IS 'Latitude GPS (coordonnée géographique)';
COMMENT ON COLUMN marches.longitude IS 'Longitude GPS (coordonnée géographique)';
COMMENT ON COLUMN marches.zone_geographique IS 'Zone ou région du marché (ex: Casablanca, Rabat-Salé-Kénitra)';
