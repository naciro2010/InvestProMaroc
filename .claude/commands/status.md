# /status - Project Status Overview

Quick health check of the entire InvestPro project.

## Steps

1. **Git status** - Branch, uncommitted changes, ahead/behind
2. **Frontend health:**
   - `cd frontend && npm run lint 2>&1 | tail -5` - Lint status
   - `cd frontend && npm run build 2>&1 | tail -5` - Build status
   - Count files > 300 lines (violations)
3. **Backend health:**
   - `cd backend && ./gradlew build -x test 2>&1 | tail -5` - Build status
4. **Schema check:**
   - Count tables in V2__create_schema.sql
   - Count entities in entity/
   - Verify only 3 migration files exist
5. **Code metrics:**
   - Total TypeScript files
   - Total Kotlin files
   - Largest files (potential split candidates)

## Output Format
```
=== InvestPro Status ===
Git: branch [name], [n] uncommitted changes
Frontend: [OK/FAIL] lint, [OK/FAIL] build, [n] oversized files
Backend: [OK/FAIL] build
Schema: [n] tables, [n] entities, [OK/FAIL] 3 migrations only
Files: [n] TS, [n] KT, largest: [file] ([n] lines)
```
