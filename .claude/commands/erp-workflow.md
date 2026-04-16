# /erp-workflow - Add ERP Workflow State Machine

Add a status workflow to an entity (BROUILLON -> SOUMIS -> VALIDEE -> EN_EXECUTION -> ACHEVE).

## Input

The user provides: entity name and desired workflow states.

## Steps

### Backend

1. **Enum** - Create status enum in entity file
   ```kotlin
   enum class Statut[Entity] {
       BROUILLON, SOUMIS, VALIDEE, REJETEE, EN_EXECUTION, ACHEVE
   }
   ```

2. **Entity** - Add status field with `@Enumerated(EnumType.STRING)`

3. **Service methods** - State transition methods:
   - `soumettre(id)` - BROUILLON -> SOUMIS
   - `valider(id)` - SOUMIS -> VALIDEE
   - `rejeter(id, motif)` - SOUMIS -> REJETEE -> BROUILLON
   - `demarrer(id)` - VALIDEE -> EN_EXECUTION
   - `achever(id)` - EN_EXECUTION -> ACHEVE
   - Validate state transitions (throw exception on invalid)

4. **Controller endpoints**:
   - `PUT /{id}/soumettre` @WriteAccess
   - `PUT /{id}/valider` @WriteAccess
   - `PUT /{id}/rejeter` @WriteAccess
   - `PUT /{id}/demarrer` @WriteAccess
   - `PUT /{id}/achever` @WriteAccess

### Frontend

5. **StatusBadge** - Register colors in `getStatusConfig()` in designSystem.ts:
   - BROUILLON -> gray
   - SOUMIS -> warning (yellow)
   - VALIDEE -> success (green)
   - REJETEE -> danger (red)
   - EN_EXECUTION -> info (teal)
   - ACHEVE -> success dark

6. **Workflow buttons** - Contextual action buttons based on current status

7. **Status filter pills** in list page toolbar
