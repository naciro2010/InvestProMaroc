# /erp-reporting - Add Analytical Reporting

Add JSONB-based analytical reporting with dynamic filters.

## Input

The user provides: entity, dimensions to filter by, and metrics to display.

## Steps

### Backend

1. **DTO** - Create report request/response DTOs
2. **Repository** - JSONB queries with dynamic filters:
   ```kotlin
   @Query("SELECT ... FROM ... WHERE dimensions_valeurs->>'dimension' = :value")
   ```
3. **Service** - Aggregation logic with `GROUP BY`
4. **Controller** - `POST /api/reporting/[entity]` with filter parameters

### Frontend

5. **Filter Panel** - Dynamic filters based on DimensionAnalytique:
   - Autocomplete dropdowns for each dimension
   - Date range picker
   - Status filter
   - "Appliquer" button

6. **Results Display:**
   - Summary KPIs at top
   - Data table with sortable columns
   - Charts (Recharts) for visualization
   - Export button (Excel)

7. Follow `ReportingAnalytiquePage.tsx` as reference pattern

## Pattern
```tsx
// Dynamic JSONB filter
const filters = {
  dimensions: { Budget: 'B001', Secteur: 'S002' },
  dateRange: { from: '2026-01-01', to: '2026-12-31' },
  status: ['VALIDEE', 'EN_EXECUTION']
}
const results = await reportingAPI.query(filters)
```
