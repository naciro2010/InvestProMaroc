# /fix-lint - Fix All Lint Errors

Auto-fix all ESLint and TypeScript errors in the frontend.

## Steps

1. `cd frontend && npm run lint` - Identify all errors
2. Parse each error: file path, line number, rule violated
3. Fix each error automatically:
   - Unused imports -> remove them
   - Missing types -> add proper TypeScript types (NEVER `any`)
   - Unused variables -> remove or prefix with `_`
   - Missing dependencies in useEffect -> add them or suppress with comment
   - Formatting issues -> fix formatting
4. Re-run `npm run lint` to verify all errors are fixed
5. Re-run `npm run build` to verify TypeScript compiles
6. Report summary of fixes applied
