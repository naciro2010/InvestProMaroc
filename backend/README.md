# InvestPro Maroc Backend

Modern Spring Boot 3.3.5 REST API backend for investment expense and commission management.

**Tech Stack:** Kotlin 2.0.21 | Spring Boot 3.3.5 | PostgreSQL 16 | Java 21

---

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Docker & Docker Compose (for PostgreSQL)
- Gradle 8.7+

### Local Development

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Build the project
./gradlew clean build -x test

# 3. Run the application
./gradlew bootRun

# API available at: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

---

## 📦 Build Commands

### Development Build
```bash
# Compile and build JAR (skip tests)
./gradlew clean bootJar -x test

# With tests (requires Docker)
./gradlew clean build

# Fast rebuild
./gradlew bootJar
```

### Production Build
```bash
# Create optimized JAR for production
./gradlew clean bootJar --build-cache

# Output: build/libs/investpro-backend-1.0.0.jar
```

### Running the JAR
```bash
# Development
java -jar build/libs/investpro-backend-1.0.0.jar

# Production (with PostgreSQL)
java -jar build/libs/investpro-backend-1.0.0.jar \
  --spring.profiles.active=prod \
  --spring.datasource.url=jdbc:postgresql://host:5432/investpro \
  --spring.datasource.username=postgres \
  --spring.datasource.password=your_password
```

---

## 🐳 Docker Deployment

### Build and Run with Docker
```bash
# Build Docker image
docker build -t investpro-backend:1.0.0 .

# Run container
docker run -d \
  --name investpro \
  -p 8080:8080 \
  -e DATABASE_URL=postgresql://postgres:password@db:5432/investpro \
  -e JWT_SECRET=your_secret_key \
  investpro-backend:1.0.0

# View logs
docker logs -f investpro
```

### Docker Compose
```bash
# Start all services (backend + PostgreSQL)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
```

---

## 🧪 Testing

### Integration Tests
```bash
# Tests are disabled by default (require Testcontainers)
# To run with Docker:
./gradlew test

# Skip tests entirely
./gradlew build -x test
```

### Run Specific Tests
```bash
./gradlew test --tests "ma.investpro.integration.*"
./gradlew test --tests "AuthIntegrationTest"
```

---

## 📝 Database Migrations

Flyway migrations run automatically on startup.

Migration files location: `src/main/resources/db/migration/`

Current migrations:
- V1-V23: Complete schema and seed data

---

## 🔧 Environment Variables

### Development (application.properties)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/investpro
spring.datasource.username=postgres
spring.datasource.password=postgres
app.jwt.secret=dev_secret_key_change_in_production
```

### Production (application-prod.properties)
```properties
spring.profiles.active=prod
DATABASE_URL=postgresql://host:5432/investpro
JWT_SECRET=base64_encoded_secret
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=https://yourdomain.com
PORT=8080
```

---

## 📊 API Documentation

### Swagger UI
```
http://localhost:8080/swagger-ui.html
```

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

### API Base Path
```
/api/v1/*
```

---

## 🏗️ Architecture

### Layered Architecture
```
Controllers (REST endpoints)
    ↓
Services (Business logic)
    ↓
Repositories (Data access)
    ↓
JPA Entities
    ↓
PostgreSQL Database
```

### Key Entities
- **Convention** - Commission calculation rules
- **Marche** - Procurement contracts
- **Fournisseur** - Suppliers
- **DepenseInvestissement** - Investment expenses
- **Commission** - Calculated commissions
- **User** - Authentication & authorization

---

## 🔐 Security

- JWT token-based authentication
- Role-based access control (ADMIN, MANAGER, USER)
- BCrypt password hashing
- CORS configuration per environment
- Stateless sessions

### Public Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /swagger-ui.html`
- `GET /api-docs`

### Protected Endpoints
All business endpoints require valid JWT token in `Authorization` header:
```bash
Authorization: Bearer <your_jwt_token>
```

---

## 📈 Performance

### Gradle Build Optimization
- Build cache enabled
- Parallel task execution
- Incremental Kotlin compilation
- Minimal dependencies

### Database Optimization
- Connection pooling (HikariCP)
- Indexed queries on key fields
- Prepared statements
- Transaction management

---

## 🛠️ Development

### Add New Entity
1. Create entity in `entity/`
2. Create repository in `repository/`
3. Create DTO in `dto/`
4. Create service in `service/`
5. Create controller in `controller/`
6. Add database migration

### Code Style
- Kotlin best practices
- No `Any` types - use specific DTOs
- Type-safe responses
- Proper error handling

---

## 📋 Checklist for Deployment

- [ ] Set `JWT_SECRET` to strong random value
- [ ] Configure `DATABASE_URL` for PostgreSQL
- [ ] Set `CORS_ALLOWED_ORIGINS` to production domain
- [ ] Enable HTTPS
- [ ] Configure logging level (WARN for production)
- [ ] Test with real database
- [ ] Monitor application logs
- [ ] Set up automated backups for PostgreSQL

---

## 🐛 Troubleshooting

### Build Fails with "Kapt doesn't support language version 2.0+"
**Solution:** This is a known warning with Kotlin 2.0 - it's safe to ignore. Code still compiles correctly.

### Tests Fail with ClassNotFoundException
**Solution:** Tests require Docker for Testcontainers. Use:
```bash
./gradlew build -x test
```

### Connection to PostgreSQL Refused
**Solution:** Ensure PostgreSQL is running:
```bash
docker-compose up -d postgres
```

### Flyway Migration Fails
**Solution:** Check migration file syntax in `src/main/resources/db/migration/`

---

## 📚 Resources

- [Spring Boot 3 Documentation](https://spring.io/projects/spring-boot)
- [Kotlin Language](https://kotlinlang.org/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io)
- [Swagger/OpenAPI](https://swagger.io/)

---

## 📝 License

Proprietary - InvestPro Maroc

---

## 👥 Team

InvestPro Maroc Development Team

**Last Updated:** December 30, 2025
