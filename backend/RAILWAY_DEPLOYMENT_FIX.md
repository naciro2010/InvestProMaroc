# Fix Railway Deployment - Procédure Complète

## Problème
La colonne `actif` manque dans la table `avenant_conventions` sur Railway, causant une erreur au démarrage.

## Solution Simple - V13 Migration

Une nouvelle migration **V13** a été créée pour ajouter la colonne manquante.

## Procédure sur Railway

### Option 1: Via Railway CLI (Recommandé)

```bash
# 1. Se connecter à Railway
railway login

# 2. Sélectionner le projet
railway link

# 3. Se connecter à PostgreSQL
railway run psql

# 4. Supprimer l'historique V12
DELETE FROM flyway_schema_history WHERE version = '12';

# 5. Quitter psql
\q

# 6. Redéployer
git push origin claude/add-amendment-system-kaSMK
```

### Option 2: Via Railway Dashboard

1. **Ouvrir la Console PostgreSQL**:
   - Railway Dashboard → PostgreSQL service
   - Onglet **Data** → **Query**

2. **Exécuter la commande SQL**:
   ```sql
   DELETE FROM flyway_schema_history WHERE version = '12';
   ```

3. **Redéployer l'application**:
   - Backend service → **Deployments** → **Redeploy**
   - Ou simplement push le code (déjà fait)

### Option 3: Vider tout l'historique (Si problème persiste)

Si l'Option 1 ou 2 ne fonctionne pas:

```sql
TRUNCATE TABLE flyway_schema_history;
```

⚠️ **Attention**: Toutes les migrations V1-V13 se réappliqueront (safe car `IF NOT EXISTS`).

## Vérification

Après redéploiement, vérifier les logs Railway:

```
✅ Flyway: Migration V13 applied successfully
✅ Hibernate: Schema validation passed
✅ Server started on port 8080
```

## Résumé des Changements

- ✅ **V13 Migration**: Ajoute `actif BOOLEAN NOT NULL DEFAULT TRUE`
- ✅ **Test**: FlywayMigrationIntegrationTest mis à jour (12 migrations)
- ✅ **Backend**: Aucune régression - tout géré au niveau app
- ✅ **Pas de contraintes SQL complexes** - simplicité maximale

## Rollback (si nécessaire)

Si problème avec V13:
```sql
ALTER TABLE avenant_conventions DROP COLUMN IF EXISTS actif;
DELETE FROM flyway_schema_history WHERE version = '13';
```

Puis revenir au commit précédent:
```bash
git revert HEAD
git push
```
