# /new-endpoint - Create New Backend API Endpoint

Add a new micro-endpoint following InvestPro patterns.

## Input

The user provides: HTTP method, path, purpose, and return type.

## Steps

1. **DTO** in `dto/` - Strongly typed response (NEVER use `Any`)
2. **Service method** in the appropriate service
3. **Controller method** with proper annotation:
   - `@ReadAccess` for GET (all authenticated users)
   - `@WriteAccess` for POST/PUT/DELETE (managers+)
   - `@AdminOnly` for admin operations
4. Return `ResponseEntity<ApiResponse<T>>`
5. Follow micro-endpoint pattern:
   - `/{id}/basic` for basic info
   - `/{id}/stats` for aggregated metrics
   - `/{id}/[sub-resource]` for related collections
   - `/{id}/[sub-resource]/count` for fast counts

## Rules
- Small focused payloads (5-20 KB per endpoint)
- No god objects - split large responses into micro-endpoints
- Always use ApiResponse<T> wrapper
- Strong typing - create specific DTOs
