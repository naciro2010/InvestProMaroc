#!/bin/bash
# start.sh - Démarre Ollama en arrière-plan, télécharge le modèle, puis lance Spring Boot
#
# Conçu pour Railway : Ollama et Spring Boot tournent dans le même conteneur.
# Le modèle est téléchargé au premier démarrage puis persisté via le volume Railway.

set -e

MODEL="${OLLAMA_MODEL:-mistral}"

echo "================================================"
echo " InvestPro Maroc - Démarrage"
echo " Modèle IA : $MODEL"
echo "================================================"

# 1. Démarrer Ollama en arrière-plan
echo "[1/3] Démarrage d'Ollama..."
ollama serve &
OLLAMA_PID=$!

# Attendre qu'Ollama soit prêt (max 30s)
echo "[1/3] Attente d'Ollama..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "[1/3] Ollama prêt !"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "[1/3] ATTENTION: Ollama n'a pas démarré. L'app fonctionnera en mode règles."
  fi
  sleep 1
done

# 2. Télécharger le modèle si pas déjà présent
echo "[2/3] Vérification du modèle $MODEL..."
if curl -sf http://localhost:11434/api/tags 2>/dev/null | grep -q "\"$MODEL\""; then
  echo "[2/3] Modèle $MODEL déjà installé."
else
  echo "[2/3] Téléchargement de $MODEL (cela peut prendre quelques minutes au premier déploiement)..."
  ollama pull "$MODEL" || echo "[2/3] ATTENTION: Impossible de télécharger $MODEL. Mode règles actif."
fi

# 3. Démarrer Spring Boot
echo "[3/3] Démarrage de Spring Boot..."
exec java $JAVA_OPTS \
  -Djava.security.egd=file:/dev/./urandom \
  -Dspring.ai.ollama.base-url=http://localhost:11434 \
  -Dspring.ai.ollama.chat.options.model="$MODEL" \
  -jar app.jar
