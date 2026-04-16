# /new-entity - Create New ERP Entity (Full Stack CRUD)

Scaffold a complete CRUD entity following InvestPro patterns.

## Input

The user provides: entity name (French), fields, and relationships.

## Steps

### Backend (Kotlin/Spring Boot)

1. **Entity** in `backend/src/main/kotlin/ma/investpro/entity/` extending `BaseEntity`
   - Use proper JPA annotations, non-null Kotlin types
   - Add `actif` field for soft delete
   - NEVER use `Any` type

2. **DTOs** in `backend/src/main/kotlin/ma/investpro/dto/`
   - CreateRequest DTO
   - UpdateRequest DTO
   - Response DTO
   - Use `ApiResponse<T>` wrapper

3. **Repository** in `backend/src/main/kotlin/ma/investpro/repository/`
   - Extend JpaRepository<Entity, Long>
   - Add custom query methods as needed

4. **Service** in `backend/src/main/kotlin/ma/investpro/service/`
   - Extend GenericCrudService<Entity, Long>
   - Override only when custom logic needed
   - Use `@Transactional`

5. **Controller** in `backend/src/main/kotlin/ma/investpro/controller/`
   - REST endpoints with @ReadAccess, @WriteAccess, @AdminOnly
   - Return ApiResponse<T>
   - Micro-endpoints pattern (basic, stats, sub-resources)

6. **Migration** - Add to `V2__create_schema.sql` (NEVER create V4+)
   - Add seed data to `V3__seed_data.sql`

### Frontend (React/TypeScript)

7. **Types** in `frontend/src/types/` - TypeScript interfaces (NEVER use `any`)

8. **API client** in `frontend/src/lib/api.ts` - Add API functions with explicit return types

9. **List Page** in `frontend/src/pages/[entity]/`
   - Use `componentStyles.listPage` pattern
   - StatusBadge, SortableTable with drag & drop
   - Search, filters, pagination

10. **Detail Page** - Micro-components with independent data loading

11. **Form Page** - Using core components (StickyActionBar, FormLayout, FormPageSection)

12. **Route** in `App.tsx`

## Rules
- Follow ALL patterns from CLAUDE.md
- Max 300 lines per component
- No hardcoded colors - use designSystem.ts
- Strong typing everywhere
