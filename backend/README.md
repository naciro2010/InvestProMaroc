# InvestPro Maroc - Backend (Kotlin + Spring Boot + Gradle)

Backend API moderne pour la gestion des dépenses d'investissement et calcul des commissions d'intervention.

## 🛠️ Stack Technique

- **Kotlin 1.9.23** - Langage moderne et concis
- **Spring Boot 3.2.5** - Framework application
- **Java 21** - Runtime JVM
- **Gradle 8.7** - Build tool avec Kotlin DSL
- **PostgreSQL** - Base de données
- **Flyway** - Migrations de base de données
- **Spring Security + JWT** - Authentification
- **Testcontainers** - Tests d'intégration
- **Swagger/OpenAPI** - Documentation API

## 🚀 Démarrage Rapide

### Prérequis

- Java 21+
- Docker (pour PostgreSQL et tests)
- Gradle 8.7+ (ou utilisez le wrapper inclus)

### Installation locale

1. **Cloner le repository**
```bash
git clone https://github.com/naciro2010/InvestProMaroc.git
cd InvestProMaroc/backend
```

2. **Configurer PostgreSQL**
```bash
# Via Docker (recommandé)
docker run --name investpro-postgres \
  -e POSTGRES_DB=investpro \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16-alpine
```

3. **Lancer l'application**
```bash
# Avec Gradle wrapper
./gradlew bootRun

# Ou avec Gradle installé
gradle bootRun
```

L'API sera disponible sur : http://localhost:8080

## 📚 Documentation API

Une fois l'application lancée :

- **Swagger UI** : http://localhost:8080/swagger-ui.html
- **API Docs (JSON)** : http://localhost:8080/api-docs

## 🧪 Tests

### Lancer tous les tests

```bash
./gradlew test
```

### Tests d'intégration avec Testcontainers

Les tests utilisent automatiquement des containers PostgreSQL :

```bash
./gradlew test --tests "ma.investpro.integration.*"
```

### Rapport de couverture

```bash
./gradlew test jacocoTestReport
# Rapport dans: build/reports/jacoco/test/html/index.html
```

## 🐳 Docker

### Build l'image

```bash
# Depuis la racine du projet
docker build -t investpro-backend .
```

### Lancer avec Docker Compose

```bash
# Depuis la racine du projet
docker-compose up -d
```

## ☁️ Déploiement

### Railway.app (Recommandé)

Consultez le guide complet : [RAILWAY_DEPLOYMENT.md](../RAILWAY_DEPLOYMENT.md)

**Important** : Le backend utilise maintenant **Gradle** au lieu de Maven. Railway détectera automatiquement le `build.gradle.kts`.

## 🗄️ Base de données

### Migrations Flyway

Les migrations sont dans `src/main/resources/db/migration/`

```bash
# Appliquer les migrations
./gradlew flywayMigrate

# Nettoyer la base de données
./gradlew flywayClean
```

## 🔐 Sécurité & JWT

### Configuration JWT

Variables d'environnement requises :

```properties
APP_JWT_SECRET=<votre-secret-base64>
APP_JWT_EXPIRATION_MS=86400000        # 24 heures
APP_JWT_REFRESH_EXPIRATION_MS=604800000  # 7 jours
```

### Générer un secret JWT

```bash
# Option 1: OpenSSL
openssl rand -base64 64

# Option 2: Kotlin
kotlin -e "println(java.util.Base64.getEncoder().encodeToString(java.security.SecureRandom().generateSeed(64)))"
```

## 📦 Build Production

```bash
# Build le JAR
./gradlew clean bootJar

# Le JAR sera dans build/libs/
java -jar build/libs/investpro-backend-1.0.0.jar
```

## 🔧 Configuration

### Profils Spring

- **default** : Développement local
- **prod** : Production (Railway, etc.)
- **test** : Tests (avec Testcontainers)

```bash
# Lancer avec profil spécifique
./gradlew bootRun --args='--spring.profiles.active=prod'
```

### Variables d'environnement importantes

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DATABASE_URL` | URL PostgreSQL | `jdbc:postgresql://localhost:5432/investpro` |
| `JWT_SECRET` | Secret JWT (Base64) | *À configurer* |
| `CORS_ALLOWED_ORIGINS` | Origines CORS | `http://localhost:5173` |
| `PORT` | Port serveur | `8080` |

## 📊 Endpoints principaux

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Monitoring
- `GET /actuator/health` - Health check
- `GET /actuator/info` - Informations

## 🎯 Avantages de Kotlin

### Code plus concis
```kotlin
// Kotlin - Data class
data class User(val id: Long, val username: String, val email: String)

// vs Java - nécessite getters, setters, equals, hashCode, toString
```

### Null Safety
```kotlin
val user: User? = findUser()  // Nullable explicite
user?.email                     // Safe call
user!!.email                    // Non-null assertion
```

### Extensions Functions
```kotlin
fun User.toDTO() = UserDTO(id, username, email)
```

### Coroutines (async/await intégré)
```kotlin
suspend fun fetchData() = coroutineScope {
    val result = async { repository.findAll() }
    result.await()
}
```

## 🐛 Debugging

### Logs

Configuration dans `application.properties` :

```properties
logging.level.ma.investpro=DEBUG
logging.level.org.springframework.web=DEBUG
```

### Mode Debug IntelliJ IDEA

1. Ouvrir le projet dans IntelliJ
2. Run → Debug 'InvestProApplication'
3. Placer des breakpoints

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Migration Java → Kotlin

Ce backend a été migré de Java + Maven vers Kotlin + Gradle pour :

✅ **Code plus concis** (-40% de lignes)
✅ **Null safety** (moins de NullPointerException)
✅ **Data classes** (moins de boilerplate)
✅ **Coroutines** (async simplifié)
✅ **Extension functions** (code plus expressif)
✅ **Testcontainers** (tests d'intégration robustes)

## 📧 Support

Pour toute question :
- Ouvrir une issue sur GitHub
- Documentation Swagger
- Logs de l'application

## 📜 License

Propriétaire - InvestPro Maroc © 2024
