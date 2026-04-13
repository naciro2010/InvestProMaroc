#!/bin/bash
# start.sh - Démarre Ollama en arrière-plan, télécharge le modèle, puis lance Spring Boot
#
# Conçu pour Railway : Ollama et Spring Boot tournent dans le même conteneur.
# Le modèle est téléchargé au premier démarrage puis persisté via le volume Railway.
# Si Ollama échoue, Spring Boot démarre quand même en mode règles (sans IA).

MODEL="${OLLAMA_MODEL:-mistral}"
OLLAMA_ENABLED="${OLLAMA_ENABLED:-true}"

echo "================================================"
echo " InvestPro Maroc - Démarrage"
echo " Modèle IA : $MODEL"
echo " Ollama activé : $OLLAMA_ENABLED"
echo "================================================"

OLLAMA_AVAILABLE=false

if [ "$OLLAMA_ENABLED" = "true" ]; then
    # 1. Démarrer Ollama en arrière-plan
    echo "[1/3] Démarrage d'Ollama..."
    if command -v ollama &> /dev/null; then
        ollama serve &
        OLLAMA_PID=$!

        # Attendre qu'Ollama soit prêt (max 30s)
        echo "[1/3] Attente d'Ollama..."
        for i in $(seq 1 30); do
            if curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
                echo "[1/3] Ollama prêt !"
                OLLAMA_AVAILABLE=true
                break
            fi
            if [ "$i" -eq 30 ]; then
                echo "[1/3] ATTENTION: Ollama n'a pas démarré après 30s. Mode règles activé."
            fi
            sleep 1
        done

        # 2. Télécharger le modèle si Ollama est disponible
        if [ "$OLLAMA_AVAILABLE" = "true" ]; then
            echo "[2/3] Vérification du modèle $MODEL..."
            if curl -sf http://localhost:11434/api/tags 2>/dev/null | grep -q "\"$MODEL\""; then
                echo "[2/3] Modèle $MODEL déjà installé."
            else
                echo "[2/3] Téléchargement de $MODEL (peut prendre quelques minutes au premier déploiement)..."
                if ollama pull "$MODEL"; then
                    echo "[2/3] Modèle $MODEL téléchargé avec succès."
                else
                    echo "[2/3] ATTENTION: Impossible de télécharger $MODEL. Mode règles actif."
                    OLLAMA_AVAILABLE=false
                fi
            fi
        else
            echo "[2/3] Ollama indisponible, téléchargement du modèle ignoré."
        fi
    else
        echo "[1/3] ATTENTION: Ollama non installé. Mode règles activé."
        echo "[2/3] Téléchargement du modèle ignoré."
    fi
else
    echo "[1/3] Ollama désactivé via OLLAMA_ENABLED=false. Mode règles activé."
    echo "[2/3] Téléchargement du modèle ignoré."
fi

# 3. Démarrer Spring Boot
echo "[3/3] Démarrage de Spring Boot..."

if [ "$OLLAMA_AVAILABLE" = "true" ]; then
    echo "[3/3] Mode IA activé (Ollama + $MODEL)"
    exec java $JAVA_OPTS \
        -Djava.security.egd=file:/dev/./urandom \
        -Dspring.ai.ollama.base-url=http://localhost:11434 \
        -Dspring.ai.ollama.chat.options.model="$MODEL" \
        -jar app.jar
else
    echo "[3/3] Mode règles (sans IA) - Ollama désactivé"
    exec java $JAVA_OPTS \
        -Djava.security.egd=file:/dev/./urandom \
        -Dspring.ai.ollama.chat.enabled=false \
        -jar app.jar
fi
