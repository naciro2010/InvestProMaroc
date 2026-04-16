# /refactor-split - Split Oversized Files

Find and split files exceeding 300 lines into micro-components.

## Steps

1. **Scan** for oversized files:
   - `frontend/src/pages/**/*.tsx` > 300 lines -> split required
   - `frontend/src/components/**/*.tsx` > 300 lines -> split required
   - `backend/src/main/kotlin/**/*.kt` > 300 lines -> review needed

2. **For each oversized frontend file:**
   - Identify logical sections (cards, tabs, modals, tables)
   - Extract each section into its own component in `components/[feature]/`
   - Create barrel export `index.ts`
   - Replace inline sections with component imports
   - Ensure each extracted component < 300 lines
   - Verify independent data loading pattern

3. **For each oversized backend file:**
   - Split large controllers into sub-resource controllers
   - Split large services into focused services
   - Extract complex queries into repository methods

4. **Verify:**
   - `npm run build` passes
   - `./gradlew build -x test` passes
   - No functionality broken

## Target
- Files > 500 lines: MUST split immediately
- Files 300-500 lines: SHOULD split
- Files < 300 lines: OK
