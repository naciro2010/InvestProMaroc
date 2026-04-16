# /db-check - Verify Database Schema Consistency

Check that entity, migration, and DTO are all in sync.

## Steps

1. **Read V2__create_schema.sql** - List all tables and columns
2. **Read entities** in `backend/src/main/kotlin/ma/investpro/entity/`
3. **Compare:**
   - Every table in V2 has a corresponding Kotlin entity
   - Every entity field maps to a table column
   - Foreign keys match @ManyToOne/@OneToMany relationships
   - JSONB columns use @JdbcTypeCode(SqlTypes.JSON)
   - Enums use @Enumerated(EnumType.STRING)

4. **Check DTOs match entities:**
   - Response DTOs expose needed fields
   - Request DTOs have validation annotations
   - No `Any` types anywhere

5. **Check repositories:**
   - Custom queries match actual column names
   - Index-backed queries for performance

6. **Report:**
   - Mismatches found
   - Missing entities/tables
   - Suggested fixes
