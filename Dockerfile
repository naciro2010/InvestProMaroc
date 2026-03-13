# Dockerfile pour Railway.app - Backend Kotlin + Ollama (AI intégré)
# Multi-stage build pour optimiser la taille

# Stage 1: Build Spring Boot JAR
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

# Stage 2: Production - Spring Boot + Ollama
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Installer les outils nécessaires
RUN apk add --no-cache curl bash zstd

# Installer Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Créer un utilisateur non-root
RUN addgroup -S spring && adduser -S spring -G spring

# Créer les répertoires Ollama avec permissions
RUN mkdir -p /home/spring/.ollama && chown -R spring:spring /home/spring/.ollama

# Copier le JAR depuis le stage de build
COPY --from=build /app/build/libs/*.jar app.jar

# Copier le script de démarrage
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Exposer les ports (8080 = Spring Boot, 11434 = Ollama)
EXPOSE 8080 11434

# Variables d'environnement
ENV JAVA_OPTS="-Xmx512m -Xms256m" \
    SPRING_PROFILES_ACTIVE=prod \
    OLLAMA_HOST=0.0.0.0:11434 \
    OLLAMA_MODEL=mistral \
    OLLAMA_BASE_URL=http://localhost:11434

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Lancer Ollama + Spring Boot via le script
ENTRYPOINT ["/app/start.sh"]
