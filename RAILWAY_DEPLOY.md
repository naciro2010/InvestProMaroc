# Déploiement Railway - Procédure Simple

## ✅ Migrations Simplifiées

Le projet utilise maintenant **3 migrations seulement**:
- **V1**: DROP toutes les tables
- **V2**: CREATE schéma simple (pas de FK complexes)
- **V3**: INSERT données de test

## 🚀 Déploiement sur Railway

### Étape 1: Vider l'historique Flyway

**Via Railway Dashboard**:
1. Ouvrir https://railway.app
2. Sélectionner le projet → Service PostgreSQL
3. Onglet **Data** → **Query**
4. Exécuter:
   ```sql
   TRUNCATE TABLE flyway_schema_history;
   ```

**Ou via Railway CLI**:
```bash
railway login
railway link
railway run psql

-- Dans psql:
TRUNCATE TABLE flyway_schema_history;
\q
```

### Étape 2: Redéployer

Le code est déjà pushé. Railway redéploie automatiquement.

**Logs attendus**:
```
✅ Flyway: Applying V1 (drop all tables)
✅ Flyway: Applying V2 (create schema)
✅ Flyway: Applying V3 (seed data)
✅ Started InvestProBackendApplication in X seconds
```

## 📊 Données de Test Créées

### Users
- **admin** / admin123 (role: ADMIN)
- **manager** / manager123 (role: MANAGER)
- **user** / user123 (role: USER)

### Entités de Base
- 1 Convention
- 1 Projet
- 2 Fournisseurs
- 1 Marché + 1 ligne
- 1 Décompte
- 3 Dimensions analytiques

## ⚠️ Important

- Après TRUNCATE flyway_schema_history, **toutes les tables seront recréées**
- Les anciennes données sont **supprimées** (mais ce sont des données de test)
- Le schéma est **simple** - pas de contraintes FK/CHECK complexes
- Tout est géré **au niveau application** (Spring Boot)

## 🔧 Alternative: Recréer la Base

Si problème persiste:
1. Railway Dashboard → PostgreSQL → Settings → **Remove Service**
2. New → Database → Add PostgreSQL
3. Redéployer automatiquement

## ✅ Vérification

Après déploiement, tester:
```bash
curl https://votre-app.up.railway.app/actuator/health
# Devrait retourner: {"status":"UP"}

curl https://votre-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Devrait retourner un token JWT
```
