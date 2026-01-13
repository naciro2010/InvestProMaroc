-- V13: Add missing actif column to avenant_conventions
-- Simple fix: adds the actif column that was in V12 but missing in production database

ALTER TABLE avenant_conventions
ADD COLUMN IF NOT EXISTS actif BOOLEAN NOT NULL DEFAULT TRUE;
