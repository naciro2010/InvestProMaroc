-- V3__cleanup_projets.sql
-- Cleanup existing projets table that may be blocking V1

DROP TABLE IF EXISTS projets CASCADE;
