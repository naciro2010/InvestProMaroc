# /build-back - Build Backend

Run the Kotlin/Spring Boot backend build pipeline.

## Steps

1. `cd backend && ./gradlew clean build -x test` - Compile without tests
2. Report any compilation errors with file paths
3. If errors are found, fix them and re-build
4. Confirm success with JAR output path
