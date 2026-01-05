# 🔍 Diagnostic du Problème 403 Forbidden

## 📊 Symptômes

1. ❌ **POST /api/conventions** retourne **403 Forbidden**
2. ❌ **GET /api/conventions** ne retourne **aucune donnée**
3. ⚠️ Le **frontend affiche "succès"** malgré le 403

---

## 🔎 Causes Probables

### 1. **CORS - Origine non autorisée** ⚠️ CRITIQUE

**Problème** : Le backend `SecurityConfig.kt` ligne 56-60 n'autorise QUE :
```kotlin
allowedOrigins = listOf(
    "http://localhost:5173",
    "http://localhost:3000",
    "https://naciro2010.github.io"
)
```

**Mais** : Si le frontend est hébergé ailleurs (ex: Railway, Vercel, etc.), les requêtes seront **bloquées par CORS**.

**Solution** : Ajouter l'origine du frontend de production.

---

### 2. **Authentification JWT** 🔒

**Problème possible** :
- Token JWT non envoyé
- Token expiré
- Token invalide
- refreshToken non fonctionnel

**Vérification** : Ouvrir DevTools → Network → Requête POST → Headers
- Vérifier si `Authorization: Bearer <token>` est présent
- Vérifier si le token n'est pas expiré (decode sur jwt.io)

---

### 3. **Pas d'annotations @PreAuthorize sur ConventionController** ⚠️

**Observation** : Les autres controllers (MarcheController, BudgetController, etc.) ont des annotations `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")` mais **PAS ConventionController**.

**Impact** : Avec `@EnableMethodSecurity`, si un controller n'a pas d'annotations explicites, Spring Security peut refuser l'accès par défaut.

**Solution** : Ajouter des annotations de sécurité.

---

### 4. **Frontend affiche "succès" malgré 403** 🐛

**Code problématique** : `ConventionWizardComplete.tsx:274-278`
```typescript
const response = await conventionsAPI.create(payload)
console.log('Convention créée:', response.data)

alert('Convention créée avec succès en BROUILLON !') // ❌ Exécuté même si 403
navigate('/conventions')
```

**Problème** : Aucune vérification du statut HTTP réel. L'intercepteur axios peut transformer le 403 mais ne rejette pas la promesse.

**Solution** : Vérifier `response.status === 201` avant d'afficher le succès.

---

### 5. **Base de données vide ?** 📂

**Vérification** :
- Exécuter manuellement : `SELECT COUNT(*) FROM conventions;`
- Vérifier les migrations Flyway
- Voir si les données de seed ont été insérées

---

## ✅ Actions Correctives Prioritaires

### 🔥 **Action 1 : Corriger CORS (URGENT)**

**Fichier** : `backend/src/main/kotlin/ma/investpro/config/SecurityConfig.kt`

**Ligne 56** : Remplacer par :
```kotlin
allowedOrigins = listOf(
    "http://localhost:5173",
    "http://localhost:3000",
    "https://naciro2010.github.io",
    "https://investpromaroc-production.up.railway.app" // Frontend production
)
```

**OU** (pour dev uniquement) :
```kotlin
allowedOriginPatterns = listOf("*") // ⚠️ Temporaire pour tester
```

---

### 🔥 **Action 2 : Ajouter @PreAuthorize sur ConventionController**

**Fichier** : `backend/src/main/kotlin/ma/investpro/controller/ConventionController.kt`

**Ajouter** :
```kotlin
import org.springframework.security.access.prepost.PreAuthorize

@RestController
@RequestMapping("/api/conventions")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000"])
class ConventionController(
    private val conventionService: ConventionService
) {

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')") // ✅ Ajouter
    fun getAll(): ResponseEntity<List<Convention>> {
        return ResponseEntity.ok(conventionService.findAll())
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')") // ✅ Ajouter
    fun create(@RequestBody convention: Convention): ResponseEntity<Convention> {
        return try {
            val created = conventionService.create(convention)
            ResponseEntity.status(HttpStatus.CREATED).body(created)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    // Ajouter pour TOUS les endpoints...
}
```

---

### 🔥 **Action 3 : Corriger le frontend pour gérer le 403**

**Fichier** : `frontend/src/pages/conventions/ConventionWizardComplete.tsx`

**Ligne 274** : Modifier :
```typescript
const handleSubmit = async () => {
  try {
    setLoading(true)
    setErrors([])

    const payload = { /* ... */ }

    const response = await conventionsAPI.create(payload)

    // ✅ Vérifier le statut HTTP
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Convention créée:', response.data)
      alert('Convention créée avec succès en BROUILLON !')
      navigate('/conventions')
    } else {
      throw new Error(`Status inattendu: ${response.status}`)
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la création:', error)

    // Afficher l'erreur de manière plus visible
    const errorMessage = error.response?.status === 403
      ? '🔒 Accès refusé. Vous n\'avez pas la permission de créer une convention.'
      : error.response?.data?.message || 'Erreur lors de la création'

    setErrors([errorMessage])
    alert(`❌ ${errorMessage}`) // Aussi en alert pour être sûr que l'utilisateur le voit
  } finally {
    setLoading(false)
  }
}
```

---

### 🔥 **Action 4 : Ajouter des logs de debugging dans JwtAuthenticationFilter**

**Fichier** : `backend/src/main/kotlin/ma/investpro/security/JwtAuthenticationFilter.kt`

**Ligne 27** : Ajouter des logs :
```kotlin
override fun doFilterInternal(...) {
    val authHeader = request.getHeader("Authorization")

    logger.info("🔍 Request: ${request.method} ${request.requestURI}")
    logger.info("🔍 Authorization header: ${authHeader?.take(50)}...")

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        logger.warn("⚠️ No valid Authorization header")
        filterChain.doFilter(request, response)
        return
    }

    try {
        val jwt = authHeader.substring(7)
        val username = jwtService.extractUsername(jwt)

        logger.info("🔍 JWT extracted for user: $username")

        if (SecurityContextHolder.getContext().authentication == null) {
            val userDetails = userDetailsService.loadUserByUsername(username)

            logger.info("🔍 User roles: ${userDetails.authorities}")

            if (jwtService.isTokenValid(jwt, userDetails)) {
                val authToken = UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.authorities
                ).apply {
                    details = WebAuthenticationDetailsSource().buildDetails(request)
                }

                SecurityContextHolder.getContext().authentication = authToken
                logger.info("✅ Authentication set for user: $username")
            } else {
                logger.warn("❌ Invalid JWT for user: $username")
            }
        }
    } catch (e: Exception) {
        logger.error("❌ Cannot set user authentication", e)
    }

    filterChain.doFilter(request, response)
}
```

---

## 🧪 Tests de Vérification

### Test 1 : Vérifier l'authentification
```bash
curl -X POST https://investpromaroc-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test 2 : Tester GET conventions avec le token
```bash
curl -X GET https://investpromaroc-production.up.railway.app/api/conventions \
  -H "Authorization: Bearer <TOKEN_FROM_STEP_1>"
```

### Test 3 : Vérifier les données en base
```sql
SELECT COUNT(*) as total, statut, COUNT(*)
FROM conventions
GROUP BY statut;
```

---

## 📋 Checklist de Résolution

- [ ] Ajouter l'origine du frontend à CORS
- [ ] Ajouter @PreAuthorize sur ConventionController
- [ ] Corriger la gestion d'erreur dans le frontend
- [ ] Ajouter des logs de debugging dans JwtAuthenticationFilter
- [ ] Vérifier que le token JWT est valide
- [ ] Vérifier qu'il y a des données dans la base
- [ ] Redémarrer le backend après modifications
- [ ] Tester la création de convention
- [ ] Vérifier que GET /conventions retourne des données
