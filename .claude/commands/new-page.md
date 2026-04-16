# /new-page - Create New Frontend Page

Scaffold a new page following InvestPro List Page Pattern.

## Input

The user provides: page name, entity, columns, and filters.

## Steps

1. **Page component** in `frontend/src/pages/[feature]/`
   - Import `componentStyles.listPage` from designSystem
   - PageHeader with breadcrumbs
   - Toolbar with search + filter pills
   - SortableTable with drag & drop (`useSortableTable`)
   - StatusBadge for status columns
   - Pagination
   - Max 300 lines - extract sub-components if needed

2. **Sub-components** in `frontend/src/components/[feature]/`
   - List components (Table, Filters, Kanban if needed)
   - Detail components (InfoCard, StatsCard, tabs)
   - Barrel exports via `index.ts`

3. **API integration** in `frontend/src/lib/api.ts`
   - Micro-endpoints (getAll, getById, getBasic, getStats)
   - Typed return values

4. **Route** in `App.tsx` with PrivateRoute wrapper

5. **Sidebar entry** in `frontend/src/components/layout/Sidebar.tsx`

## Rules
- Use designSystem.ts tokens only (no hardcoded colors)
- componentStyles.listPage for uniform list pages
- StatusBadge for all statuses
- SortableTable for drag & drop
- Max 300 lines per file
