# Dockerfile pour Railway.app - Build depuis la racine du projet
# Ce fichier permet à Railway de builder le backend depuis la racine

# Multi-stage build pour optimiser la taille de l'image
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copier les fichiers de configuration Maven depuis le dossier backend
COPY backend/pom.xml .

# Télécharger les dépendances (mise en cache si pom.xml n'a pas changé)
RUN mvn dependency:go-offline -B

# Copier le code source du backend
COPY backend/src ./src

# Build l'application
RUN mvn clean package -DskipTests -B

# Stage de production - image légère
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Installer curl pour les health checks
RUN apk add --no-cache curl

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copier le JAR depuis le stage de build
COPY --from=build /app/target/*.jar app.jar

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
