# InvestPro Maroc - Backend

Backend API pour la gestion des dépenses d'investissement et calcul des commissions d'intervention.

## 🛠️ Stack Technique

- **Java 21**
- **Spring Boot 3.2.5**
- **PostgreSQL** (via Spring Data JPA)
- **Flyway** (migrations de base de données)
- **Spring Security** (JWT Authentication)
- **Swagger/OpenAPI** (documentation API)

## 🚀 Démarrage Rapide

### Prérequis

- Java 21
- Maven 3.9+
- PostgreSQL 14+

### Installation locale

1. **Cloner le repository**
```bash
git clone https://github.com/naciro2010/InvestProMaroc.git
cd InvestProMaroc/backend
```

2. **Configurer PostgreSQL**
```bash
# Créer la base de données
createdb investpro

# Ou via psql
psql -U postgres -c "CREATE DATABASE investpro;"
```

3. **Configurer les variables d'environnement**
```bash
# Copier l'exemple
cp .env.example .env

# Éditer avec vos valeurs
vim .env
```

4. **Lancer l'application**
```bash
mvn spring-boot:run
```

L'API sera disponible sur : http://localhost:8080

## 📚 Documentation API

Une fois l'application lancée, accédez à :

- **Swagger UI** : http://localhost:8080/swagger-ui.html
- **API Docs (JSON)** : http://localhost:8080/api-docs

## 🐳 Docker

### Build l'image

```bash
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

Étapes rapides :
1. Créer un compte sur https://railway.app
2. Connecter votre repository GitHub
3. Ajouter un plugin PostgreSQL
4. Configurer les variables d'environnement
5. Déployer automatiquement

## 🗄️ Base de données

### Migrations Flyway

Les migrations sont dans `src/main/resources/db/migration/`

- `V1__*` : Schéma initial
- `V2__*` : Ajouts/modifications ultérieures

### Exécuter les migrations manuellement

```bash
mvn flyway:migrate
```

## 🔐 Sécurité

### JWT Authentication

L'API utilise JWT pour l'authentification :

1. **Login** : `POST /api/auth/login`
2. Recevoir `accessToken` et `refreshToken`
3. Utiliser `accessToken` dans le header : `Authorization: Bearer <token>`

### Variables de sécurité

```properties
app.jwt.secret=<secret-key>
app.jwt.expiration-ms=86400000        # 24 heures
app.jwt.refresh-expiration-ms=604800000  # 7 jours
```

## 🧪 Tests

```bash
# Lancer les tests
mvn test

# Avec couverture
mvn test jacoco:report
```

## 📦 Build Production

```bash
# Build le JAR
mvn clean package

# Le JAR sera dans target/
java -jar target/investpro-backend-1.0.0.jar
```

## 🔧 Configuration

### Profils Spring

- **default** : Développement local
- **prod** : Production (Railway, etc.)

```bash
# Lancer avec le profil prod
java -jar app.jar --spring.profiles.active=prod
```

### Variables d'environnement importantes

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DATABASE_URL` | URL PostgreSQL | `jdbc:postgresql://localhost:5432/investpro` |
| `JWT_SECRET` | Secret pour JWT | *À configurer* |
| `CORS_ALLOWED_ORIGINS` | Origines CORS autorisées | `http://localhost:5173` |
| `PORT` | Port du serveur | `8080` |

## 📊 Endpoints principaux

### Authentication
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/refresh` - Rafraîchir le token

### Référentiels
- `GET/POST/PUT/DELETE /api/conventions` - Conventions
- `GET/POST/PUT/DELETE /api/projets` - Projets
- `GET/POST/PUT/DELETE /api/fournisseurs` - Fournisseurs
- `GET/POST/PUT/DELETE /api/axes-analytiques` - Axes analytiques
- `GET/POST/PUT/DELETE /api/comptes-bancaires` - Comptes bancaires

### Monitoring
- `GET /actuator/health` - Health check
- `GET /actuator/info` - Informations de l'application

## 🐛 Debugging

### Logs

Niveaux de logs configurables dans `application.properties` :

```properties
logging.level.ma.investpro=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
```

### Mode Debug

```bash
mvn spring-boot:run -Ddebug
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est propriétaire - InvestPro Maroc © 2024

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Swagger
- Vérifier les logs de l'application
