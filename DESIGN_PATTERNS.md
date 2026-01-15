# Design Patterns & Best Practices - InvestPro Maroc

Ce document définit les patterns à utiliser et à éviter dans le projet InvestPro Maroc.

## Principe Directeur: KISS (Keep It Simple, Stupid)

❌ **ÉVITER** l'over-engineering et les "usines à gaz"
✅ **PRÉFÉRER** les solutions simples et directes

---

## Frontend Patterns

### ✅ Patterns à UTILISER

#### 1. Formulaires Simples avec HTML5

```typescript
// ✅ BON - Simple et natif
<TextField
  label="Budget"
  type="number"
  value={formData.budget}
  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
  inputProps={{ step: '0.01', min: '0' }}
/>

// ❌ MAUVAIS - Complexe avec formatage manuel
const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}
const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/\s/g, '').replace(/,/g, '.')
  return parseFloat(cleaned) || 0
}
const handleNumberChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  if (/^[\d\s,.]*$/.test(value) || value === '') {
    setFormData({ ...formData, [field]: value })
  }
}
// ... beaucoup trop de code pour un simple champ numérique
```

**Pourquoi ?**
- HTML5 gère déjà la validation et le formatage
- Moins de code = moins de bugs
- Meilleure accessibilité

#### 2. State Management Simple

```typescript
// ✅ BON - useState pour les composants locaux
const [formData, setFormData] = useState({
  code: '',
  libelle: '',
  budget: ''
})

// ✅ BON - Context pour l'état global simple
const AuthContext = createContext<AuthContextType>(...)

// ❌ MAUVAIS - Redux/MobX pour des besoins simples
// Ajouter une bibliothèque entière pour gérer un simple formulaire
```

#### 3. Animations Légères

```typescript
// ✅ BON - framer-motion pour des animations simples
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>

// ❌ MAUVAIS - Animations CSS complexes ou bibliothèques lourdes
// gsap, anime.js pour des animations basiques
```

#### 4. API Calls Directs

```typescript
// ✅ BON - Axios direct avec intercepteurs
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ❌ MAUVAIS - Abstraction excessive
class ApiService {
  constructor(private http: HttpClient) {}

  async get<T>(url: string): Promise<ApiResponse<T>> {
    // ... couche d'abstraction inutile
  }
}
```

### ❌ Anti-Patterns à ÉVITER

1. **Abstraction excessive** - Ne créez pas de wrappers inutiles
2. **Code mort** - Supprimez le code inutilisé
3. **Duplications** - DRY, mais sans abstractions prématurées
4. **Magic numbers** - Utilisez des constantes nommées
5. **God components** - Un composant ne doit pas dépasser 300 lignes

---

## Backend Patterns

### ✅ Patterns à UTILISER

#### 1. Service Générique

```kotlin
// ✅ BON - Héritage du service générique
class ConventionService(
    repository: ConventionRepository
) : GenericCrudService<Convention, Long>(repository) {

    // Ajouter seulement la logique spécifique
    fun creerSousConvention(parentId: Long, dto: ConventionRequest): Convention {
        // Logique métier ici
    }
}

// ❌ MAUVAIS - Réécrire getAll(), getById(), etc. dans chaque service
```

#### 2. DTOs pour toutes les API

```kotlin
// ✅ BON - DTO typé
data class ConventionResponse(
    val id: Long,
    val code: String,
    val montant: BigDecimal
)

fun getConvention(id: Long): ApiResponse<ConventionResponse> {
    // ...
}

// ❌ MAUVAIS - Map<String, Any>
fun getConvention(id: Long): Map<String, Any> {
    return mapOf("id" to 1, "code" to "CONV-001")
}
```

#### 3. Validation Déclarative

```kotlin
// ✅ BON - Annotations de validation
data class ConventionRequest(
    @field:NotBlank(message = "Le code est obligatoire")
    @field:Size(max = 50)
    val code: String,

    @field:Positive(message = "Le montant doit être positif")
    val montant: BigDecimal
)

// ❌ MAUVAIS - Validation manuelle
fun createConvention(request: ConventionRequest) {
    if (request.code.isBlank()) {
        throw IllegalArgumentException("Code obligatoire")
    }
    if (request.montant <= BigDecimal.ZERO) {
        throw IllegalArgumentException("Montant positif")
    }
    // ...
}
```

#### 4. Transactions Simples

```kotlin
// ✅ BON - @Transactional sur la méthode service
@Transactional
fun creerConvention(request: ConventionRequest): Convention {
    val convention = conventionRepository.save(...)
    historiqueRepository.save(...)
    return convention
}

// ❌ MAUVAIS - Gestion manuelle des transactions
fun creerConvention(request: ConventionRequest): Convention {
    val transaction = entityManager.transaction
    try {
        transaction.begin()
        // ...
        transaction.commit()
    } catch (e: Exception) {
        transaction.rollback()
        throw e
    }
}
```

### ❌ Anti-Patterns à ÉVITER

1. **N+1 queries** - Utilisez `@EntityGraph` ou JOIN FETCH
2. **Logique métier dans les controllers** - Toujours dans les services
3. **Types Any/Object** - TOUJOURS typer fortement
4. **Catch génériques** - Catch des exceptions spécifiques
5. **God services** - Un service ne doit pas dépasser 500 lignes

---

## Database Patterns

### ✅ Patterns à UTILISER

#### 1. Migrations Flyway Simples

```sql
-- ✅ BON - Migration incrémentale claire
-- V4__add_geolocation_to_marches.sql
ALTER TABLE marches ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE marches ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE marches ADD COLUMN zone_geographique VARCHAR(100);

CREATE INDEX idx_marches_geolocation ON marches(latitude, longitude);

-- ❌ MAUVAIS - Tout dans une seule migration gigantesque
-- Ou pire: modifier des migrations existantes
```

#### 2. Indexes sur Foreign Keys

```sql
-- ✅ BON - Index sur toutes les FK
CREATE INDEX idx_marches_convention_id ON marches(convention_id);
CREATE INDEX idx_marches_fournisseur_id ON marches(fournisseur_id);

-- ❌ MAUVAIS - Oublier les indexes
```

#### 3. JSONB pour Flexibilité

```sql
-- ✅ BON - JSONB pour données structurées variables
CREATE TABLE marche_lignes (
    id BIGSERIAL PRIMARY KEY,
    dimensions_valeurs JSONB,  -- Flexible!
    ...
);

CREATE INDEX idx_marche_lignes_dimensions ON marche_lignes USING GIN(dimensions_valeurs);

-- ❌ MAUVAIS - Table de jointure rigide pour chaque dimension
CREATE TABLE marche_ligne_dimension_budget (...)
CREATE TABLE marche_ligne_dimension_projet (...)
CREATE TABLE marche_ligne_dimension_secteur (...)
-- ... 10 autres tables
```

---

## Performance Patterns

### ✅ Optimisations à UTILISER

#### 1. Code Splitting (Vite)

```typescript
// vite.config.ts
manualChunks(id) {
  if (id.includes('@mui')) return 'mui'
  if (id.includes('recharts')) return 'charts'
  if (id.includes('react')) return 'react-vendor'
  return 'vendor'
}
```

#### 2. Lazy Loading

```typescript
// ✅ BON - Routes lazy loaded
const ConventionsPage = lazy(() => import('./pages/ConventionsPage'))
```

#### 3. PWA Caching

```typescript
// ✅ BON - Cache intelligent
runtimeCaching: [
  {
    urlPattern: /api/,
    handler: 'NetworkFirst',  // Toujours frais quand en ligne
    options: {
      cacheName: 'api-cache',
      expiration: { maxAgeSeconds: 300 } // 5 min max
    }
  }
]
```

---

## Security Patterns

### ✅ Sécurité à UTILISER

1. **TOUJOURS valider côté backend** même si validé côté frontend
2. **JAMAIS de secrets en dur** dans le code
3. **TOUJOURS hasher les mots de passe** (BCrypt, Argon2)
4. **TOUJOURS utiliser HTTPS** en production
5. **TOUJOURS sanitiser les inputs** utilisateur
6. **JAMAIS logger de données sensibles** (passwords, tokens)

```kotlin
// ✅ BON
logger.info("User ${user.id} logged in")

// ❌ MAUVAIS
logger.info("User ${user.username} logged in with password ${user.password}")
```

---

## Testing Patterns

### ✅ Tests à UTILISER

```kotlin
// ✅ BON - Tests d'intégration avec Testcontainers
@SpringBootTest
@Testcontainers
class ConventionServiceTest : BaseIntegrationTest() {

    @Test
    fun `should create convention`() {
        val request = ConventionRequest(...)
        val result = conventionService.create(request)

        assertThat(result.code).isEqualTo("CONV-001")
    }
}
```

---

## Résumé

### Philosophie Générale

1. **Simple > Complexe** - Privilégiez la simplicité
2. **Standard > Custom** - Utilisez les solutions standard
3. **Testé > Non testé** - Tout code doit être testable
4. **Documenté > Non documenté** - Code auto-documenté + CLAUDE.md
5. **Sécurisé > Rapide** - Sécurité avant optimisation prématurée

### Checklist Avant Commit

- [ ] Le code est-il le plus simple possible ?
- [ ] Y a-t-il du code mort à supprimer ?
- [ ] Les types sont-ils tous explicites (pas de `any`/`Any`) ?
- [ ] Les dépendances sont-elles à jour ?
- [ ] Les tests passent-ils tous ?
- [ ] Le code est-il sécurisé ?
- [ ] La documentation est-elle à jour ?

---

**Dernière mise à jour:** Janvier 2026
