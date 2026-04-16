# /erp-avenant - Add Amendment (Avenant) System

Add a JSONB-based amendment tracking system to an entity.

## Input

The user provides: entity name and fields that can be amended.

## Steps

### Backend

1. **Entity** `Avenant[Entity]` with JSONB fields:
   ```kotlin
   @JdbcTypeCode(SqlTypes.JSON)
   @Column(columnDefinition = "jsonb")
   var donneesAvant: String?  // Snapshot before amendment

   @JdbcTypeCode(SqlTypes.JSON)
   @Column(columnDefinition = "jsonb")
   var modifications: String?  // Changes applied
   ```

2. **Enum** `StatutAvenant`: BROUILLON, SOUMIS, VALIDE

3. **Service** with state machine:
   - `create()` - Snapshot current state into `donneesAvant`
   - `soumettre()` - BROUILLON -> SOUMIS
   - `valider()` - SOUMIS -> VALIDE (applies changes to parent)
   - `rejeter()` - SOUMIS -> BROUILLON

4. **Controller** with workflow endpoints

5. **Migration** - Add table to V2 with GIN indexes on JSONB columns

### Frontend

6. **Avenants Tab** in parent entity detail page
7. **Avenant Form** - Shows current values, allows modifications
8. **History View** - Timeline of all amendments with before/after diff
9. **Workflow Buttons** - Submit, validate, reject based on status

## Reference
See `AvenantConvention` implementation as template.
