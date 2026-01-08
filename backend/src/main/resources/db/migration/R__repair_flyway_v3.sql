-- ========================================================================================================
-- R__repair_flyway_v3.sql
-- Repeatable migration to repair failed V3 migration
-- ========================================================================================================

-- Delete failed V3 migration from flyway_schema_history if it exists
DELETE FROM flyway_schema_history WHERE version = '3' AND success = false;
