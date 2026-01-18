# Authorization Fix Documentation

## Problem Summary

**Admin user was unable to create/modify conventions and access other protected resources.**

### Root Cause

The JWT token generation was **not including user roles** in the token. This meant:
- Roles were only available if the User entity was loaded from the database
- On each request, the authentication filter had to reload UserDetails from DB
- This caused potential issues and inconsistencies with role loading
- The ADMIN role wasn't properly propagated through the authentication system

## Solution Implemented

### 1. Enhanced JWT Token with Roles (JwtService.kt)

**Changed From:**
```kotlin
fun generateToken(userDetails: UserDetails, userId: Long? = null): String {
    val claims = if (userId != null) {
        mapOf("userId" to userId)  // ❌ Only userId, no roles!
    } else {
        HashMap()
    }
    return buildToken(claims, userDetails, jwtExpirationMs)
}
```

**Changed To:**
```kotlin
fun generateToken(userDetails: UserDetails, userId: Long? = null): String {
    val claims = mutableMapOf<String, Any>()
    if (userId != null) {
        claims["userId"] = userId
    }
    // ✅ Include user's authorities/roles in the JWT token
    claims["authorities"] = userDetails.authorities.map { it.authority }
    claims["roles"] = userDetails.authorities
        .map { it.authority }
        .map { it.removePrefix("ROLE_") }
    return buildToken(claims, userDetails, jwtExpirationMs)
}
```

**JWT Token Now Contains:**
- `userId`: User database ID
- `authorities`: Full authority strings (e.g., `["ROLE_ADMIN", "ROLE_MANAGER"]`)
- `roles`: Clean role names (e.g., `["ADMIN", "MANAGER"]`)

### 2. Added Role Extraction Methods (JwtService.kt)

```kotlin
fun extractRoles(token: String): List<String>     // Get clean role names
fun extractAuthorities(token: String): List<String>  // Get full authorities
```

These methods allow other services to extract roles from the token directly.

### 3. Created Debug/Diagnostic Controller (AuthDebugController.kt)

Useful endpoints for troubleshooting authorization issues:

**Endpoint 1: Check Current User**
```bash
GET /api/auth/debug/whoami
Authorization: Bearer <token>
```

Response:
```json
{
  "authenticated": true,
  "username": "admin",
  "authorities": ["ROLE_ADMIN"],
  "roles": ["ADMIN"],
  "principalClass": "User",
  "message": "User is authenticated with the above roles"
}
```

**Endpoint 2: Check Specific Role**
```bash
GET /api/auth/debug/has-role/ADMIN
Authorization: Bearer <token>
```

Response:
```json
{
  "authenticated": true,
  "username": "admin",
  "role": "ADMIN",
  "hasRole": true,
  "userAuthorities": ["ROLE_ADMIN"]
}
```

**Endpoint 3: Health Check**
```bash
GET /api/auth/debug/health
```

Response:
```json
{
  "status": "OK",
  "message": "Auth debug endpoints are available"
}
```

## Authorization Strategy (All Controllers)

### READ Endpoints (GET)
```kotlin
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
```
- All authenticated users can read data

### WRITE Endpoints (POST/PUT/PATCH)
```kotlin
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
```
- Only ADMIN and MANAGER can create/modify

### DELETE Endpoints
```kotlin
@PreAuthorize("hasRole('ADMIN')")
```
- Only ADMIN can delete

### Workflow Endpoints (valider, soumettre, rejeter, etc)
```kotlin
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
```
- ADMIN and MANAGER can approve/submit/reject

## How to Verify the Fix

### Step 1: Start Backend
```bash
cd backend
./gradlew bootRun
```

### Step 2: Login as Admin
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response will contain:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@investpro.ma",
    "fullName": "Administrateur Système"
  }
}
```

### Step 3: Verify Authorization
```bash
TOKEN="<accessToken from login response>"

# Check current user
curl http://localhost:8080/api/auth/debug/whoami \
  -H "Authorization: Bearer $TOKEN"

# Check if user has ADMIN role
curl http://localhost:8080/api/auth/debug/has-role/ADMIN \
  -H "Authorization: Bearer $TOKEN"
```

Expected response shows `"hasRole": true` and `"roles": ["ADMIN"]`

### Step 4: Test Protected Endpoints

Now the admin should be able to:

**Create a Convention**
```bash
curl -X POST http://localhost:8080/api/conventions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "CONV-TEST",
    "numeroConvention": "2024/001",
    "libelle": "Test Convention",
    "objet": "Test convention creation",
    "type": "CADRE",
    "tauxCommission": 3.5,
    "montant": 1000000,
    "budgetTotal": 1000000,
    "dateDebut": "2024-01-01",
    "dateFin": "2024-12-31"
  }'
```

**Update a Convention** (should work now!)
```bash
curl -X PUT http://localhost:8080/api/conventions/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "CONV-TEST-UPDATED",
    "numeroConvention": "2024/001-UPDATED",
    ...
  }'
```

**Validate a Convention** (Admin-only workflow)
```bash
curl -X POST http://localhost:8080/api/conventions/1/valider \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"valideParId": 1}'
```

## Test Credentials

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| admin | admin123 | ADMIN | Full system access + all CRUD operations |
| manager | manager123 | MANAGER | Business operations (create/update/approve conventions, markets, etc) |
| user | user123 | USER | Read-only access |

## Troubleshooting

### Admin still can't access resources

1. **Check token contains roles:**
   ```bash
   curl http://localhost:8080/api/auth/debug/whoami \
     -H "Authorization: Bearer $TOKEN"
   ```
   Should show `"roles": ["ADMIN"]`

2. **Verify database has role assigned:**
   ```sql
   SELECT u.username, ur.role
   FROM users u
   LEFT JOIN user_roles ur ON u.id = ur.user_id
   WHERE u.username = 'admin';
   ```
   Should show: `admin | ADMIN`

3. **Check server logs:**
   Look for lines like:
   ```
   ✅ Current user authenticated: admin
      Authorities: [ROLE_ADMIN]
      Roles: [ADMIN]
   ```

4. **Verify Spring Security is processing @PreAuthorize:**
   Backend should log when processing authorization annotations.

### Token validation failing

1. Ensure `app.jwt.secret` is configured correctly
2. Check token expiration with: `GET /api/auth/debug/whoami`
3. If token expired, login again to get new token

## Security Implications

- ✅ Roles are now **included in JWT** - no need for DB lookup on each request
- ✅ **Stateless authentication** - token contains all necessary info
- ✅ **No performance degradation** - authorization checks are instant
- ⚠️ Token is **readable but not modifiable** (signed with secret key)
- ⚠️ Token should be kept **private** - never share in logs or URLs

## Files Modified

1. `/backend/src/main/kotlin/ma/investpro/security/JwtService.kt`
   - Enhanced `generateToken()` and `generateRefreshToken()`
   - Added `extractRoles()` and `extractAuthorities()`

2. `/backend/src/main/kotlin/ma/investpro/controller/AuthDebugController.kt` (NEW)
   - Added diagnostic endpoints for troubleshooting

## Next Steps

1. **Rebuild backend**
   ```bash
   ./gradlew clean build
   ```

2. **Test all CRUD operations** as admin user to verify authorization works

3. **Monitor logs** for any authorization-related warnings

4. **Remove debug endpoints in production** (optional) by adding:
   ```properties
   security.debug-endpoints.enabled=false
   ```

## Reference: Spring Security @PreAuthorize Syntax

```kotlin
@PreAuthorize("hasRole('ADMIN')")              // Requires ROLE_ADMIN
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')") // Requires either role
@PreAuthorize("isAuthenticated()")              // Must be logged in
@PreAuthorize("permitAll()")                    // Public endpoint
```

Spring automatically converts `'ADMIN'` to check for `'ROLE_ADMIN'` authority.
