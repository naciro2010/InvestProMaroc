# 🔄 Guide de Migration - Nettoyage Complet de la Base de Données

## ⚠️ ATTENTION
**Ce guide décrit comment supprimer TOUTES les tables et recommencer from scratch.**
**Toutes les données seront perdues! Faites un backup si nécessaire.**

---

## 📋 Résumé des Changements

### ✅ Nettoyage Effectué
1. ✅ Suppression de toutes les références "XCOMPTA" du code
2. ✅ Backend: Commentaires nettoyés (Convention.kt, DepenseInvestissement.kt)
3. ✅ Frontend: Titre et classes CSS normalisées (Tailwind standard)
4. ✅ Script SQL de nettoyage créé: `backend/src/main/resources/clean_database.sql`
5. ✅ Configuration Flyway désactivée dans `application.properties`
6. ✅ Hibernate DDL auto-update activé (100% Spring)

### 🎯 Résultat
- Architecture 100% DDD (Domain-Driven Design)
- Plus de migrations Flyway (source d'erreurs)
- Schéma géré automatiquement par Hibernate
- Code propre sans références legacy

---

## 🚀 Procédure de Migration (Étape par Étape)

### Étape 1: Backup de la Base de Données (Recommandé)

```bash
# Si vous avez des données importantes à sauvegarder
pg_dump -U postgres -d investpro > backup_investpro_$(date +%Y%m%d_%H%M%S).sql
```

### Étape 2: Nettoyer la Base de Données

**Option A: Via psql (Recommandé)**
```bash
# Connexion à PostgreSQL
psql -U postgres -d investpro

# Exécuter le script de nettoyage
\i /chemin/vers/InvestProMaroc/backend/src/main/resources/clean_database.sql

# Vérifier que toutes les tables sont supprimées
\dt

# Vous devriez voir: "Did not find any relations."
# Quitter
\q
```

**Option B: Via pgAdmin**
1. Ouvrir pgAdmin
2. Connectez-vous à votre serveur PostgreSQL
3. Naviguez vers Databases → investpro → Schemas → public → Tables
4. Sélectionnez toutes les tables → Clic droit → Delete/Drop → CASCADE

**Option C: Recréer la base complète (Plus radical)**
```bash
# Supprimer et recréer la base de données
dropdb -U postgres investpro
createdb -U postgres investpro
```

### Étape 3: Vérifier application.properties

**Fichier:** `backend/src/main/resources/application.properties`

Assurez-vous d'avoir ces paramètres:

```properties
# JPA - DOIT être "update" pour recréer le schéma
spring.jpa.hibernate.ddl-auto=update

# Flyway - DOIT être désactivé
spring.flyway.enabled=false
```

⚠️ **IMPORTANT:** Si votre environnement de production a un fichier `application-prod.properties` différent, vérifiez qu'il a aussi ces paramètres!

### Étape 4: Rebuild du Backend (Optionnel mais Recommandé)

```bash
cd backend
./gradlew clean build -x test
```

### Étape 5: Redémarrer le Backend

```bash
cd backend
./gradlew bootRun
```

**Que va-t-il se passer?**
1. ✅ Hibernate va détecter qu'il n'y a pas de tables
2. ✅ Il va automatiquement créer TOUTES les tables depuis les entités JPA
3. ✅ Le schéma sera 100% cohérent avec le code Kotlin
4. ✅ Plus d'erreurs Flyway!

### Étape 6: Vérifier la Création des Tables

**Via les logs du backend:**
```
Hibernate: create table conventions (...)
Hibernate: create table marches (...)
Hibernate: create table marche_lignes (...)
...
```

**Via psql:**
```bash
psql -U postgres -d investpro -c "\dt"
```

Vous devriez voir toutes les tables créées:
- conventions
- marches
- marche_lignes
- avenant_marches
- decomptes
- decompte_imputations
- ordres_paiement
- op_imputations
- paiements
- paiement_imputations
- plan_analytique_dimensions
- plan_analytique_valeurs
- fournisseurs
- projets
- users
- etc.

### Étape 7: Tester l'Application

1. ✅ Backend accessible sur http://localhost:8080
2. ✅ Swagger UI: http://localhost:8080/swagger-ui.html
3. ✅ Testez la création d'un utilisateur, d'une convention, etc.
4. ✅ Frontend: http://localhost:5173 (après `npm run dev`)

---

## 🐛 Dépannage

### Problème: Flyway essaie toujours de s'exécuter

**Cause:** Votre application n'a pas récupéré la nouvelle configuration

**Solution:**
```bash
# 1. Vérifier que vous avez bien pull les derniers changements
git pull origin claude/deploy-static-demo-page-TgOpe

# 2. Vérifier application.properties
cat backend/src/main/resources/application.properties | grep flyway
# Devrait afficher: spring.flyway.enabled=false

# 3. Clean rebuild
cd backend
./gradlew clean
./gradlew build -x test

# 4. Redémarrer
./gradlew bootRun
```

### Problème: Erreur "table already exists"

**Cause:** Certaines tables n'ont pas été supprimées

**Solution:**
```bash
# Forcer la suppression de toutes les tables
psql -U postgres -d investpro

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

\q
```

### Problème: Erreur de connexion PostgreSQL

**Cause:** Base de données non accessible

**Solution:**
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql
# ou
brew services list | grep postgresql

# Tester la connexion
psql -U postgres -d investpro -c "SELECT version();"
```

---

## 📊 Différences Avant/Après

### ❌ Avant (Avec Flyway)
```
application.properties:
  spring.jpa.hibernate.ddl-auto=validate
  spring.flyway.enabled=true

Problèmes:
  - Erreurs migrations V5, V23, etc.
  - Conflits Flyway vs Hibernate
  - Schéma incohérent
  - Duplicate key errors
```

### ✅ Après (Sans Flyway)
```
application.properties:
  spring.jpa.hibernate.ddl-auto=update
  spring.flyway.enabled=false

Avantages:
  - Schéma 100% géré par Hibernate
  - Cohérence garantie code ↔ DB
  - Pas de migrations manuelles
  - Simple et fiable
```

---

## 🎯 Résultat Final

Après cette migration, vous aurez:

✅ **Base de données propre**
- Toutes les tables créées par Hibernate
- Schéma 100% cohérent avec les entités JPA
- Pas de tables legacy ou orphelines

✅ **Code propre**
- Plus de références "XCOMPTA"
- Architecture DDD pure
- Tailwind CSS standard

✅ **Configuration simple**
- Flyway désactivé
- Hibernate DDL auto-update
- 100% Spring Data JPA

✅ **Fiabilité**
- Plus d'erreurs Flyway
- Migrations automatiques
- Maintenance simplifiée

---

## 📝 Notes Importantes

### Pour le Développement
```properties
spring.jpa.hibernate.ddl-auto=update
```
- Crée les tables manquantes
- Modifie les colonnes si besoin
- **Ne supprime jamais de données**

### Pour la Production (Futur)
```properties
spring.jpa.hibernate.ddl-auto=validate
```
- Vérifie que le schéma correspond aux entités
- **Ne modifie RIEN**
- Erreur si incohérence (sécurité)

---

## 🔗 Ressources

- **Script de nettoyage:** `backend/src/main/resources/clean_database.sql`
- **Configuration:** `backend/src/main/resources/application.properties`
- **Documentation:** `README.md` et `BACKLOG.md`
- **Commit:** ebd09124 (refactor: Remove all XCOMPTA references)

---

## ✅ Checklist de Migration

- [ ] Backup de la base de données (si nécessaire)
- [ ] Exécution du script clean_database.sql
- [ ] Vérification de application.properties (flyway.enabled=false)
- [ ] Vérification de application.properties (ddl-auto=update)
- [ ] Pull des derniers changements (git pull)
- [ ] Clean rebuild du backend (./gradlew clean build)
- [ ] Redémarrage du backend (./gradlew bootRun)
- [ ] Vérification des logs (tables créées par Hibernate)
- [ ] Test connexion Swagger UI
- [ ] Test création entités (User, Convention, etc.)
- [ ] Test frontend
- [ ] Migration réussie! 🎉

---

**Créé le:** 2024-12-30
**Version:** 1.0.0
**Auteur:** Claude Agent SDK

**Made with ❤️ for InvestPro Maroc 🇲🇦**
