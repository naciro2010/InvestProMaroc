# /deploy - Prepare for Deployment

Run the full deployment checklist before pushing to production.

## Steps

### 1. Code Quality
- `cd frontend && npm run lint` - Zero errors
- `cd frontend && npm run build` - TypeScript + Vite build
- `cd backend && ./gradlew clean build -x test` - Kotlin compilation

### 2. Security Check
- No `.env` files in git: `git ls-files | grep -i env`
- No hardcoded secrets: search for API keys, passwords
- No `console.log` in production code (Vite strips them)
- `cd frontend && npm audit --audit-level=high`

### 3. Database
- V2__create_schema.sql is complete (all tables)
- V3__seed_data.sql has test data
- No V4+ migration files exist

### 4. Git
- All changes committed
- Branch is up to date with main
- No merge conflicts

### 5. Build Artifacts
- `cd frontend && npm run build` produces `dist/`
- `cd backend && ./gradlew bootJar` produces JAR

### 6. Report
- Summary of what's ready
- Any blockers or warnings
- Recommended next steps
