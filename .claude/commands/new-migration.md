# /new-migration - Add Database Table/Column

Add new tables or columns to the existing migration files.

## CRITICAL RULES

- NEVER create V4, V5, V6+ migration files
- ONLY modify V2__create_schema.sql and V3__seed_data.sql
- Always 3 files only: V1 (drop), V2 (create), V3 (seed)

## Steps

1. Read `backend/src/main/resources/db/migration/V2__create_schema.sql`
2. Add the new table in the appropriate section:
   - Use `CREATE TABLE IF NOT EXISTS`
   - Add foreign keys with `ON DELETE SET NULL` or `ON DELETE CASCADE`
   - Add CHECK constraints for validation
   - Add indexes on FKs and frequently queried columns
   - Include audit columns: `created_at`, `updated_at`, `actif`
   - Use `COMMENT ON TABLE/COLUMN` (separate statements, NOT inline)

3. Add seed data to `V3__seed_data.sql`

4. Verify with `cd backend && ./gradlew flywayInfo`

## Template
```sql
-- Section N: [Entity Name]
CREATE TABLE IF NOT EXISTS [table_name] (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    designation VARCHAR(255) NOT NULL,
    montant DECIMAL(15,2) DEFAULT 0 CHECK (montant >= 0),
    status VARCHAR(30) DEFAULT 'BROUILLON',
    [foreign_key]_id BIGINT REFERENCES [parent_table](id) ON DELETE SET NULL,
    actif BOOLEAN DEFAULT true,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_[table]_[fk] ON [table_name]([foreign_key]_id);

COMMENT ON TABLE [table_name] IS '[Description]';
```
