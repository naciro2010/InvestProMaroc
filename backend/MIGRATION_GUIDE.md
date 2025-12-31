# Migration Guide - InvestPro Maroc Backend

## Situation Actuelle

✅ **Nouvelle Migration Créée:** `V1__clean_schema.sql` (53 KB)
- Schéma complet et cohérent avec TOUTES les 30 entities
- Tous les champs correctement mappés depuis les classes Kotlin
- Enums PostgreSQL pour les types
- JSONB pour les imputations analytiques flexibles
- Triggers automatiques pour `updated_at`
- Données initiales (admin user + dimensions analytiques)

❌ **Anciennes Migrations Supprimées:** V2-V23 supprimées
- La base de données actuelle contient des enregistrements à partir des anciennes migrations
- Flyway history contient des traces de ces migrations

---

## Étapes pour Migrer Vers le Nouveau Schéma

### Option A: Reset Complet (Recommandé pour Développement)

Si tu veux démarrer de zéro avec le nouveau schéma CLEAN:

```bash
# 1. Arrête l'application
# (Ctrl+C si elle est en cours d'exécution)

# 2. Connect to PostgreSQL
psql -U postgres -d investpro

# 3. Drop et recréer la base de données
DROP DATABASE investpro;
CREATE DATABASE investpro;
\q

# 4. Rebuild et relance
cd /Users/mohamedennaciri/repository/gitlab.io/InvestProMaroc/backend

# Clean build (efface build/ et relance migrations)
./gradlew clean build -x test

# Ou juste run avec bootRun (migrations s'exécutent automatiquement)
./gradlew bootRun

# 5. Vérifie la migration
psql -U postgres -d investpro
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
\d (list tables)
\q
```

**Résultat:** Une base de données CLEAN avec toutes les tables créées à partir de V1__clean_schema.sql

---

### Option B: Nettoyer Flyway History (Si BD Existe)

Si tu veux vider la table `flyway_schema_history` sans supprimer la base:

```bash
# 1. Connect to PostgreSQL
psql -U postgres -d investpro

# 2. Delete Flyway history
DELETE FROM flyway_schema_history;

# 3. Delete all tables and schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# 4. Exit psql
\q

# 5. Rebuild
cd /Users/mohamedennaciri/repository/gitlab.io/InvestProMaroc/backend
./gradlew clean build -x test

# 6. Verify
psql -U postgres -d investpro
SELECT * FROM flyway_schema_history;
\d
\q
```

---

### Option C: Vider Flyway et Appliquer Migration Manuellement

```bash
# 1. Clean flyway history
psql -U postgres -d investpro
DELETE FROM flyway_schema_history;
\q

# 2. Drop all tables
psql -U postgres -d investpro < <(echo "DROP SCHEMA public CASCADE; CREATE SCHEMA public;")

# 3. Run Flyway migration
./gradlew flywayMigrate

# 4. Verify
psql -U postgres -d investpro
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
\q
```

---

## Post-Migration Checklist

Après avoir exécuté la migration, vérifie que tout est correct:

```bash
# 1. Vérifie les tables créées
psql -U postgres -d investpro
\d

# 2. Vérifie les enumerations
SELECT * FROM pg_type WHERE typtype = 'e';

# 3. Compte les tables
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
# Attendu: 30 tables + system tables

# 4. Vérifie les contraintes
\d conventions
\d marches
\d users

# 5. Vérifie l'admin user créé
SELECT * FROM users WHERE username = 'admin';

# 6. Vérifie les dimensions analytiques créées
SELECT * FROM dimensions_analytiques;

# 7. Test la connexion à la base via Spring Boot
\q
./gradlew bootRun
# Vérifie que l'app démarre sans erreurs Flyway
```

---

## Tables Créées (30+)

### Authentification et Utilisateurs
- `users` - Utilisateurs du système
- `user_roles` - Rôles utilisateurs

### Fondamentaux
- `partenaires` - Organismes partenaires
- `fournisseurs` - Fournisseurs
- `comptes_bancaires` - Comptes bancaires

### Conventions (XCOMPTA)
- `conventions` - Conventions mères et sous-conventions
- `convention_partenaires` - Liaisons conventions-partenaires
- `avenants` - Avenants de convention

### Marchés et Achats
- `marches` - Marchés publics/contrats
- `marche_lignes` - Lignes de marché
- `avenant_marches` - Avenants de marché
- `bons_commande` - Bons de commande

### Dépenses et Factures
- `depenses_investissement` - Dépenses/factures
- `commissions` - Commissions calculées

### Décomptes et Paiements
- `decomptes` - Situations de travaux
- `decompte_retenues` - Retenues sur décomptes
- `decompte_imputations` - Imputations analytiques de décomptes
- `ordres_paiement` - Ordres de paiement
- `op_imputations` - Imputations analytiques d'OP
- `paiements` - Paiements réels
- `paiement_imputations` - Imputations analytiques de paiements

### Budgets
- `budgets` - Budgets versionnés (V0, V1, V2...)
- `lignes_budget` - Lignes de budget

### Planning et Versements
- `imputations_previsionnelles` - Imputations prévisionnelles
- `versements_previsionnels` - Versements prévisionnels

### Subventions et Financements
- `subventions` - Subventions/Financements
- `echeances_subvention` - Échéancier

### Dimensions et Imputations Analytiques
- `dimensions_analytiques` - Dimensions d'analyse (Région, Type Marché, Phase, Source...)
- `valeurs_dimensions` - Valeurs des dimensions
- `imputations_analytiques` - Imputations analytiques génériques

---

## Données Initiales Créées

### Admin User
- **Username:** `admin`
- **Email:** `admin@investpro.ma`
- **Password:** `admin123` (BCrypt hash)
- **Role:** `ADMIN`
- ⚠️ **IMPORTANT:** Change ce mot de passe avant la production!

### Dimensions Analytiques Créées
1. **REG (Région)** - Région géographique (Obligatoire)
   - CAS: Casablanca-Settat
   - RAB: Rabat-Salé-Kénitra
   - MAR: Marrakech-Safi

2. **MARCH (Type Marché)** - Type de marché (Obligatoire)
   - TRAV: Travaux
   - SERV: Services
   - FOUR: Fournitures

3. **PHASE (Phase Projet)** - Phase du projet
   - Études, Réalisation, Exploitation

4. **SOURCE (Source Financement)** - Source de financement
   - AFD, BAD, Trésor, etc.

---

## Champs Base Entity (Tous les Tables)

Toutes les tables héritent de ces champs BaseEntity:

```sql
- id BIGSERIAL PRIMARY KEY
- created_at TIMESTAMP NOT NULL DEFAULT NOW()
- updated_at TIMESTAMP NOT NULL DEFAULT NOW() (automatiquement mis à jour)
- actif BOOLEAN NOT NULL DEFAULT TRUE
```

---

## Enumerations PostgreSQL

```
- type_convention: CADRE, NON_CADRE, SPECIFIQUE, AVENANT
- statut_convention: BROUILLON, SOUMIS, VALIDEE, EN_COURS, ACHEVE, EN_RETARD, ANNULE
- statut_marche: EN_COURS, VALIDE, TERMINE, SUSPENDU, ANNULE, EN_ATTENTE
- statut_avenant: BROUILLON, SOUMIS, VALIDE, REJETE, ANNULE
- type_depense: STANDARD, CADRE, NON_CADRE, SPECIFIQUE, AVENANT
- statut_depense: VALIDEE, EN_COURS, ACHEVE, EN_RETARD, ANNULE
- base_calcul: TTC, HT
- statut_bon_commande: EN_ATTENTE, APPROUVE, EN_COURS, LIVRE, ANNULE
- statut_decompte: BROUILLON, SOUMIS, VALIDE, REJETE, PAYE_PARTIEL, PAYE_TOTAL
- type_retenue: GARANTIE, RAS, PENALITES, AVANCES
- statut_budget: BROUILLON, SOUMIS, VALIDE, REJETE, ARCHIVE
- mode_paiement: VIREMENT, CHEQUE, ESPECES, AUTRE
- statut_op: BROUILLON, VALIDE, EXECUTE, REJETE, ANNULE
- statut_echeance: PREVU, RECU, RETARD, ANNULE
- type_imputation: BUDGET, DECOMPTE, ORDRE_PAIEMENT, PAIEMENT
```

---

## Problèmes Courants et Solutions

### ❌ Erreur: "Flyway migration already applied"

**Cause:** La migration V1 a déjà été appliquée à partir de l'ancien V1__init_schema.sql

**Solution:**
```bash
# 1. Delete old migration history
psql -U postgres -d investpro
DELETE FROM flyway_schema_history WHERE version = 1;
\q

# 2. Drop all tables
psql -U postgres -d investpro < <(echo "DROP SCHEMA public CASCADE; CREATE SCHEMA public;")

# 3. Run new migration
./gradlew flywayMigrate
```

---

### ❌ Erreur: "type_convention already exists"

**Cause:** Tu essaies de créer le schéma sur une base qui le contient déjà

**Solution:** Voir Option A ou B ci-dessus

---

### ❌ Erreur: "column does not exist"

**Cause:** Le schéma n'a pas été appliqué correctement

**Vérification:**
```bash
psql -U postgres -d investpro
\d conventions  # Vérifier les colonnes
SELECT COUNT(*) FROM conventions;  # Vérifier si table existe
```

---

## Rollback (Si Nécessaire)

Si tu dois revenir en arrière:

```bash
# 1. Flyway n'a pas de rollback automatique, donc:
psql -U postgres -d investpro

# 2. Drop all
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# 3. Exit et rebuild
\q
./gradlew clean build -x test
```

---

## Notes Importantes

⚠️ **Database Dump Avant Changements:**
```bash
# Sauvegarde la base actuelle avant tout changement
pg_dump -U postgres investpro > /tmp/investpro_backup_$(date +%Y%m%d_%H%M%S).sql
```

⚠️ **Production:**
- Ne fais PAS de DROP DATABASE en production!
- Utilise un outil de migration/backup professionnel
- Test d'abord sur une copie du schéma

⚠️ **Change l'admin password avant production:**
```sql
UPDATE users SET password = '$2a$10$<new_bcrypt_hash>' WHERE username = 'admin';
```

---

## Support et Debugging

```bash
# Vérifie les logs de Flyway
grep -i "flyway" ~/.gradle/daemon/*/logs.txt

# Ou via Spring Boot logs
./gradlew bootRun 2>&1 | grep -i "flyway\|migration"

# Vérifie l'état de la base
psql -U postgres -d investpro -c "SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 10;"
```

---

**Créé:** 2025-12-31
**Version:** 1.0.0
**Dernière mise à jour:** Migration complète et cleanup
