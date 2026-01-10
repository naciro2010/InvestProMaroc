# Development Skills and Best Practices

## 🚨 CRITICAL RULES - Type Safety

### ⚠️ NEVER Use `Any` or `any` Types

**This is a MANDATORY rule that must ALWAYS be followed.**

#### Backend (Kotlin)

❌ **FORBIDDEN:**
```kotlin
fun getData(): Map<String, Any>
fun process(data: List<Any>)
fun getResponse(): ResponseEntity<Map<String, Any>>
```

✅ **REQUIRED:**
```kotlin
data class DataResponse(val data: String, val count: Int)
data class ApiResponse<T>(val success: Boolean, val message: String, val data: T?)

fun getData(): DataResponse
fun process(data: List<MyData>)
fun getResponse(): ResponseEntity<ApiResponse<MyData>>
```

#### Frontend (TypeScript)

❌ **FORBIDDEN:**
```typescript
function getData(): any
const data: any = await api.get()
interface Response { data: any }
```

✅ **REQUIRED:**
```typescript
interface DataResponse { data: string; count: number }
interface ApiResponse<T> { success: boolean; message: string; data: T | null }

function getData(): DataResponse
const data: DataResponse = await api.get()
interface Response { data: DataResponse }
```

### Why Type Safety is Critical

1. **Compile-time error detection** - Catch bugs before runtime
2. **IDE support** - Better autocomplete, refactoring, and navigation
3. **Self-documenting code** - Types serve as documentation
4. **Refactoring confidence** - Change types without fear
5. **Production stability** - Prevent runtime type errors

### Type Safety Checklist

- [ ] No `Any` type in Kotlin code
- [ ] No `any` type in TypeScript code
- [ ] All API responses use `ApiResponse<T>` wrapper
- [ ] All data structures have explicit DTOs/interfaces
- [ ] No `Map<String, Any>` or `object` without types
- [ ] TypeScript strict mode enabled
- [ ] All nullable fields properly marked (`?` in Kotlin, `| null` in TS)

## Commit Guidelines

### Before Committing: Mandatory Checklist

1. **Testing**
   - Always run full test suite before committing
   - Ensure 100% test coverage for new code
   - No test skipping or commenting out tests

2. **Code Quality**
   - Run linters with zero warnings
   - No temporary or commented-out code
   - Follow existing project architecture patterns
   - Prefer simplicity over complexity

3. **Validation Steps
   ```bash
   # Backend (Kotlin)
   ./gradlew test              # Run all tests
   ./gradlew lint              # Static code analysis
   ./gradlew build -x test     # Compile check

   # Frontend (React/TypeScript)
   npm run lint                # ESLint validation
   npm run type-check         # TypeScript type checking
   npm run test               # Run unit and integration tests
   npm run build              # Compilation check
   ```

## Commit Message Standards

### Format
```
<type>: <short descriptive message>

[Optional detailed description]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `test`: Test-related changes
- `docs`: Documentation updates
- `style`: Code formatting
- `perf`: Performance improvements

### Examples
```
feat: Add user authentication flow for multi-factor login

- Implement JWT-based authentication
- Add TOTP support for additional security
- Update user model to support 2FA

refactor: Simplify API endpoint routing
```

## Project-Specific Architecture Patterns

### Backend (Kotlin/Spring Boot)

1. **API Response Pattern**
   ```kotlin
   // ALWAYS use ApiResponse<T> wrapper
   data class ApiResponse<T>(
       val success: Boolean,
       val message: String,
       val data: T?
   )

   // Example controller
   @GetMapping("/items")
   fun getItems(): ResponseEntity<ApiResponse<List<ItemDTO>>> {
       val items = service.getAll()
       return ResponseEntity.ok(
           ApiResponse(
               success = true,
               message = "Items retrieved successfully",
               data = items
           )
       )
   }
   ```

2. **DTO Pattern**
   - Create separate DTOs for Request and Response
   - Never expose JPA entities directly
   - Use mappers to convert between entities and DTOs

   ```kotlin
   // Request DTO
   data class CreateItemRequest(
       val name: String,
       val price: BigDecimal
   )

   // Response DTO
   data class ItemResponse(
       val id: Long,
       val name: String,
       val price: BigDecimal,
       val createdAt: LocalDateTime
   )
   ```

3. **Service Pattern**
   - Extend `GenericCrudService<Entity, Long>` for standard CRUD
   - Keep business logic in service layer
   - Use `@Transactional` for database operations

### Frontend (React/TypeScript)

1. **Type Definitions**
   ```typescript
   // Always define interfaces for data
   interface Item {
       id: number
       name: string
       price: number
       createdAt: string
   }

   // API response wrapper
   interface ApiResponse<T> {
       success: boolean
       message: string
       data: T | null
   }
   ```

2. **API Client Pattern**
   - Use axios with interceptors
   - Define API functions with explicit return types
   - Handle errors consistently

   ```typescript
   export const itemsAPI = {
       getAll: (): Promise<AxiosResponse<ApiResponse<Item[]>>> =>
           api.get('/items'),

       getById: (id: number): Promise<AxiosResponse<ApiResponse<Item>>> =>
           api.get(`/items/${id}`)
   }
   ```

## Solution Design Principles

1. **Type Safety First**
   - Always define explicit types
   - Use generics when appropriate
   - Enable strict TypeScript mode
   - No `Any` or `any` types ever

2. **Simplicity is Key**
   - Avoid over-engineering
   - Choose the most straightforward solution
   - Minimize dependencies and complexity

3. **Maintainability**
   - Write self-documenting code
   - Add comments only when logic is non-trivial
   - Follow existing project patterns
   - Use established `ApiResponse<T>` and DTO patterns

4. **Performance**
   - Profile before optimizing
   - Use built-in language/framework features
   - Avoid premature optimization

5. **Scalability**
   - Design for future extension
   - Use interfaces and abstractions
   - Keep components loosely coupled

## Continuous Improvement

### Code Review Checklist

#### Type Safety (CRITICAL)
- [ ] **No `Any` or `any` types used**
- [ ] **All API responses use `ApiResponse<T>` wrapper**
- [ ] **All data structures have explicit types/DTOs**
- [ ] No `Map<String, Any>` or untyped objects
- [ ] TypeScript strict mode enabled (frontend)
- [ ] All nullable fields properly marked

#### Code Quality
- [ ] Follows existing architectural patterns
- [ ] All tests pass
- [ ] No hardcoded values
- [ ] Proper error handling
- [ ] Performance considerations
- [ ] Security implications reviewed
- [ ] No workarounds or hacks
- [ ] Uses validated, production-ready technologies

### Skills Update Process
- Review and update this file after each significant project milestone
- Add lessons learned from code reviews
- Remove outdated practices
- Incorporate team's collective wisdom

## Red Flags (Avoid These)

### 🚨 Critical Red Flags (Never Do)
- **Using `Any` or `any` types** - Always create proper types
- **Using `Map<String, Any>` or untyped objects** - Create specific DTOs
- Quick fixes without tests
- Copy-paste code
- Ignoring compiler/linter warnings

### Major Red Flags (Avoid)
- Introducing unnecessary complexity
- Bypassing established patterns
- Adding dependencies without thorough evaluation
- Workarounds or hacks instead of proper solutions
- Experimental or unstable packages
- Not following `ApiResponse<T>` pattern for API responses

## Learning Resources

- Project Architecture Documentation
- Design Patterns Reference
- Performance Profiling Techniques
- Security Best Practices

## Versioning This File

- Major version: Significant architectural changes
- Minor version: New best practices or guidelines
- Patch version: Clarifications or minor improvements