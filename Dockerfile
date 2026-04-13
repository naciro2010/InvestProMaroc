# Dockerfile pour Railway.app - Backend Kotlin + Ollama (AI intégré)
# Multi-stage build pour optimiser la taille

# Stage 1: Build Spring Boot JAR
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copier les fichiers Gradle wrapper et build
COPY backend/gradlew .
COPY backend/gradle ./gradle
COPY backend/build.gradle.kts backend/settings.gradle.kts ./

# Rendre le wrapper exécutable
RUN chmod +x gradlew

# Télécharger les dépendances (cache layer)
RUN ./gradlew dependencies --no-daemon || true

# Copier le code source
COPY backend/src ./src

# Build l'application
RUN ./gradlew clean bootJar -x test --no-daemon

# Stage 2: Production - Spring Boot + Ollama
# Utiliser Ubuntu au lieu d'Alpine car Ollama nécessite glibc
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Installer les outils nécessaires
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Installer Ollama (nécessite glibc - fonctionne sur Ubuntu/Debian)
RUN curl -fsSL https://ollama.com/install.sh | sh

# Créer un utilisateur non-root
RUN groupadd -r spring && useradd -r -g spring -d /home/spring -m spring

# Créer les répertoires Ollama avec permissions
RUN mkdir -p /home/spring/.ollama && chown -R spring:spring /home/spring/.ollama

# Copier le JAR depuis le stage de build
COPY --from=build /app/build/libs/*.jar app.jar
RUN chown spring:spring app.jar

# Copier le script de démarrage
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh && chown spring:spring /app/start.sh

# Exposer les ports (8080 = Spring Boot, 11434 = Ollama)
EXPOSE 8080 11434

# Variables d'environnement
ENV JAVA_OPTS="-Xmx512m -Xms256m" \
    SPRING_PROFILES_ACTIVE=prod \
    OLLAMA_HOST=0.0.0.0:11434 \
    OLLAMA_MODEL=mistral \
    OLLAMA_BASE_URL=http://localhost:11434 \
    OLLAMA_ENABLED=true

# Passer à l'utilisateur non-root
USER spring

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Lancer Ollama + Spring Boot via le script
ENTRYPOINT ["/app/start.sh"]
