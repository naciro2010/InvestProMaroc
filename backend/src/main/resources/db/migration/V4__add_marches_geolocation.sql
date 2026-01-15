-- Add geolocation fields to marches table
ALTER TABLE marches
ADD COLUMN IF NOT EXISTS adresse TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS zone_geographique VARCHAR(100);

-- Index for zone searches
CREATE INDEX IF NOT EXISTS idx_marches_zone ON marches(zone_geographique);
