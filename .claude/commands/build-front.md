# /build-front - Build & Lint Frontend

Run the full frontend build pipeline: lint + TypeScript check + Vite production build.

## Steps

1. `cd frontend && npm run lint` - Check ESLint errors
2. `cd frontend && npm run build` - TypeScript compile + Vite build
3. Report any errors found with file paths and line numbers
4. If errors are found, fix them automatically and re-run the build
5. Confirm success with bundle size summary
