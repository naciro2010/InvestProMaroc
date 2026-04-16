# /erp-sous-entity - Add Parent-Child Hierarchy

Add sous-entities (sub-items) with parameter inheritance.

## Input

The user provides: parent entity, child entity name, inherited fields.

## Steps

### Backend

1. **Self-referencing entity** (same table) or **new child entity**:
   ```kotlin
   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "parent_id")
   var parent: ParentEntity? = null

   var heriteParametres: Boolean = false
   ```

2. **Effective value methods** (inheritance with override):
   ```kotlin
   fun getEffectiveTaux(): BigDecimal {
       return if (heriteParametres && parent != null) {
           surchargeValue ?: parent!!.getEffectiveTaux()
       } else {
           localValue
       }
   }
   ```

3. **Controller sub-resource endpoints:**
   - `GET /parent/{id}/sous-[entities]`
   - `POST /parent/{id}/sous-[entities]`

### Frontend

4. **Tab in parent detail page** - List of child entities
5. **Modal form** for creating child (shows parent info)
6. **Inheritance toggle** - Switch to inherit/override parameters
7. **Navigation** - Click child to view its detail page

## Reference
See Sous-Conventions implementation (Convention parent-child).
