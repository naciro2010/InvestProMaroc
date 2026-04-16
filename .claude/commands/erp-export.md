# /erp-export - Add Excel/PDF Export to a Page

Add export functionality to an existing list or detail page.

## Input

The user provides: entity/page name and export format (Excel, PDF, or both).

## Steps

### Excel Export

1. **Backend** - Add/use `ExcelExportService`:
   - Create export endpoint: `GET /api/[entity]/export/excel`
   - Use Apache POI or existing ExcelExportService
   - Return `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

2. **Frontend** - Add export button:
   - Use `exportUtils.ts` utilities
   - ExcelJS for client-side generation (already installed)
   - Add "Exporter" button in PageHeader actions
   - Download with French column headers

### PDF Export

3. **Frontend** - Use browser print or jsPDF:
   - Print-friendly CSS for the page
   - Or generate PDF client-side

### Common

4. **French formatting:**
   - Numbers: `1 000 000,00`
   - Dates: `dd/MM/yyyy`
   - Currency: `MAD`
   - Status labels from `getStatusConfig()`
