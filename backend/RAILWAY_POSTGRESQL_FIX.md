# Fix Railway PostgreSQL Version Mismatch

## Problème

Railway a provisionné PostgreSQL **17.7** par défaut, mais notre application utilise:
- PostgreSQL **16** en développement (docker-compose)
- PostgreSQL **16** en CI/CD (GitHub Actions)
- Flyway **9.22.3** (inclus dans Spring Boot 3.3.5) qui supporte jusqu'à PostgreSQL **16**

Erreur résultante:
```
Flyway upgrade recommended: PostgreSQL 17.7 is newer than this version of Flyway
Error creating bean with name 'jpaSharedEM_entityManagerFactory'
```

## ✅ Solution Propre: Downgrade PostgreSQL sur Railway

### Option 1: Via Railway Dashboard (Recommandé)

1. **Supprimer le service PostgreSQL actuel**:
   - Aller dans Railway Dashboard → Votre projet
   - Cliquer sur le service PostgreSQL
   - Settings → Danger Zone → Remove Service
   - ⚠️ **ATTENTION**: Cela supprimera les données. Exporter d'abord si nécessaire.

2. **Créer un nouveau service PostgreSQL 16**:
   - Cliquer sur "New" → "Database" → "Add PostgreSQL"
   - Railway devrait maintenant proposer PostgreSQL 16 ou 15
   - Si seul 17 est disponible, passer à l'Option 2

3. **Reconnecter le backend**:
   - Railway génère automatiquement les variables d'environnement
   - Le backend les utilisera via `application-prod.properties`

### Option 2: Utiliser Docker Template avec PostgreSQL 16

Si Railway ne permet pas de choisir la version PostgreSQL:

1. **Créer un service PostgreSQL custom**:
   - New → Empty Service
   - Settings → Source → Add Docker Image
   - Image: `postgres:16-alpine`
   - Environment Variables:
     ```
     POSTGRES_DB=investpro
     POSTGRES_USER=postgres
     POSTGRES_PASSWORD=[générer mot de passe sécurisé]
     ```

2. **Configurer les variables pour le backend**:
   ```
   PGHOST=postgres.railway.internal
   PGPORT=5432
   PGDATABASE=investpro
   PGUSER=postgres
   PGPASSWORD=[même mot de passe]
   ```

### Option 3: Upgrade Spring Boot + Flyway (Alternative)

Si impossible de downgrade PostgreSQL:

```kotlin
// backend/build.gradle.kts
plugins {
    id("org.springframework.boot") version "3.4.1" // Au lieu de 3.3.5
    // ...
}
```

⚠️ **ATTENTION**:
- Spring Boot 3.4.x inclut Flyway 10.x qui supporte PostgreSQL 17
- Mais nécessite de tester toute l'application
- Risque de breaking changes

## 🔍 Vérification

Après avoir appliqué la solution, vérifier:

1. **Version PostgreSQL**:
   ```bash
   # Via Railway CLI
   railway run psql -c "SELECT version();"
   ```

2. **Logs de démarrage**:
   ```
   ✅ Successfully applied N Flyway migrations
   ✅ Started InvestProBackendApplication
   ```

3. **Health check**:
   ```bash
   curl https://your-app.up.railway.app/actuator/health
   # Devrait retourner: {"status":"UP"}
   ```

## 📚 Références

- [Railway PostgreSQL Documentation](https://docs.railway.app/databases/postgresql)
- [Flyway PostgreSQL Support](https://documentation.red-gate.com/fd/postgresql-184127604.html)
- [Spring Boot 3.3.5 Dependencies](https://docs.spring.io/spring-boot/docs/3.3.5/reference/html/dependency-versions.html)

## 💡 Bonnes Pratiques

Pour éviter ce genre de problème:

1. **Version lock**: Spécifier explicitement la version PostgreSQL dans tous les environnements
2. **Consistency**: Même version en dev, test, staging, production
3. **Documentation**: Documenter les versions dans `docker-compose.yml` et README
