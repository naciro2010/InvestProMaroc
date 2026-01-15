# Schema Synchronization - Entity ↔ Database

## Problem: Schema Validation Errors

When running integration tests with Testcontainers, Hibernate validates that the database schema matches the JPA entity definitions.

**Error Example:**
```
Schema-validation: missing column [date_effet] in table [avenant_marches]
```

**Root Cause:**
- JPA entity `AvenantMarche` defines 18 columns
- Flyway migration V2 only created 11 columns
- Hibernate validation (in test mode) caught the mismatch

## Solution: Flyway Migration V4

Created `V4__fix_avenant_marches_schema.sql` to add all missing columns:

### Added Columns:
- `date_effet` - Effective date of amendment
- `objet` - Amendment subject (required, TEXT)
- `statut` - Status code (BROUILLON, SOUMIS, VALIDE)
- `montant_initial_ht`, `montant_avenant_ht`, `montant_apres_ht` - Financial impact tracking
- `pourcentage_variation` - Percentage change
- `delai_initial_mois`, `delai_supplementaire_mois`, `delai_apres_mois` - Deadline tracking
- `date_fin_initiale`, `date_fin_apres` - End dates
- `details_avant`, `details_apres`, `details_modifications` - Documentation
- `date_validation`, `valide_par_id` - Approval tracking
- `remarques` - Remarks
- `fichier_avenant` - Amendment document reference

## How to Prevent This in the Future

### 1. **Golden Rule: Entity is Source of Truth**
```
JPA Entity Definition → Update Flyway Migrations
```

Never create a Flyway migration that doesn't support all entity properties.

### 2. **Review Checklist Before Committing**
When adding a new entity or field:

```kotlin
@Entity
class MyEntity(
    @Column(name = "my_field")  // ← Will be in database
    var myField: String
)
```

✅ Create or update Flyway migration first  
✅ Run tests with Testcontainers  
✅ Verify `./gradlew test` passes (schema validation succeeds)  
✅ Only then commit entity changes  

### 3. **Command to Check Schema Validation**
```bash
# This will validate schema against database
./gradlew test

# If you see "Schema-validation: missing column..." errors:
# 1. Find the entity file
# 2. Check what columns are defined
# 3. Create a new Flyway migration to add them
```

### 4. **Flyway Migration Template for Schema Changes**
```sql
-- Template: V{N}__fix_table_schema.sql
-- Fix schema mismatch between entity and database

ALTER TABLE my_table
ADD COLUMN IF NOT EXISTS new_column TEXT NOT NULL DEFAULT '';

-- Add constraints if needed
ALTER TABLE my_table
ADD CONSTRAINT IF NOT EXISTS fk_reference FOREIGN KEY (user_id) REFERENCES users(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_my_table_new_column ON my_table(new_column);

COMMIT;
```

## Migration History

| Version | Description |
|---------|-------------|
| V1 | Drop all existing tables |
| V2 | Create comprehensive schema (initial) |
| V3 | Seed test data |
| **V4** | **Fix avenant_marches schema - Add 18 missing columns** |

## Testing the Fix

```bash
# Start Docker
docker ps

# Run tests - should now pass schema validation
cd backend
./gradlew test

# Expected output: Tests run with real PostgreSQL via Testcontainers
```

## Key Takeaway

**Schema validation errors mean:**
- Your entity has properties not in the database
- Create a Flyway migration to add the missing columns
- Always keep entity definitions and migrations in sync

**Prevention:**
1. Entity definition is source of truth
2. Write Flyway migration first, entity second
3. Run tests frequently to catch mismatches early
4. Use `IF NOT EXISTS` in migrations for safety (idempotent)

## Related Files

- **Entity:** `src/main/kotlin/ma/investpro/entity/AvenantMarche.kt`
- **Migration:** `src/main/resources/db/migration/V4__fix_avenant_marches_schema.sql`
- **Test Config:** `src/test/kotlin/ma/investpro/integration/PostgresIntegrationTest.kt`
