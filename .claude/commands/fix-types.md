# /fix-types - Fix TypeScript Type Errors

Fix all TypeScript compilation errors in the frontend.

## Steps

1. `cd frontend && npx tsc --noEmit` - Get all type errors
2. For each error:
   - Missing type -> create proper interface (NEVER use `any`)
   - Wrong type -> fix to correct type
   - Missing property -> add to interface or fix usage
   - Null/undefined -> add proper null checks
3. Re-run `npx tsc --noEmit` to verify
4. Run `npm run build` for final verification
5. Report summary of fixes
