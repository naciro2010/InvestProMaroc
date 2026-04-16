# /build-all - Build Full Stack

Build both frontend and backend to verify everything compiles.

## Steps

1. **Backend:** `cd backend && ./gradlew clean build -x test`
2. **Frontend:** `cd frontend && npm run lint && npm run build`
3. Report all errors found with file paths and line numbers
4. If errors exist, fix them automatically and re-run
5. Final summary: both builds green or list remaining issues
