# /test-back - Run Backend Tests

Run the full Kotlin/Spring Boot test suite.

## Steps

1. `cd backend && ./gradlew test`
2. Parse test output for failures
3. If tests fail, show the failing test name, expected vs actual, and stack trace
4. Suggest fixes for failing tests
5. Report total: passed / failed / skipped
