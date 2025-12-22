# Dockerfile pour Railway.app - Backend Kotlin avec Gradle
# Multi-stage build pour optimiser la taille

# Stage 1: Build
FROM gradle:8.7-jdk21-alpine AS build

WORKDIR /app

# Copier les fichiers Gradle
COPY backend/build.gradle.kts backend/settings.gradle.kts ./
COPY backend/gradle ./gradle

# Télécharger les dépendances (cache layer)
RUN gradle dependencies --no-daemon || true

# Copier le code source
COPY backend/src ./src

# Build l'application
RUN gradle clean bootJar --no-daemon

# Stage de production - image légère
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Installer curl pour les health checks
RUN apk add --no-cache curl

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copier le JAR depuis le stage de build
COPY --from=build /app/build/libs/*.jar app.jar

# Exposer le port
EXPOSE 8080

# Variables d'environnement par défaut
ENV JAVA_OPTS="-Xmx512m -Xms256m" \
    SPRING_PROFILES_ACTIVE=prod

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Lancer l'application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
