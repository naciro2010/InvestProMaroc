# 🚀 Guide Rapide - Chargement des Données de Test

## Option 1: Via psql (Recommandé - Plus rapide)

```bash
# 1. Se connecter à PostgreSQL
psql -U postgres -d investpro

# 2. Charger les données
\i backend/src/main/resources/db/test-data.sql

# 3. Vérifier le chargement
SELECT
    (SELECT COUNT(*) FROM conventions) as conventions,
    (SELECT COUNT(*) FROM marches) as marches,
    (SELECT COUNT(*) FROM marche_lignes) as lignes,
    (SELECT SUM(montant_initial_ttc) FROM marches) as total_ttc;

# Résultat attendu:
# conventions | marches | lignes | total_ttc
# -----------+---------+--------+----------------
#           5 |       6 |     18 | 9750000000.00
```

---

## Option 2: Via Docker (Si vous utilisez Docker Compose)

```bash
# Charger les données dans le conteneur
docker exec -i investpro-postgres psql -U postgres -d investpro < backend/src/main/resources/db/test-data.sql
```

---

## Option 3: Via DBeaver / pgAdmin

1. Ouvrir DBeaver ou pgAdmin
2. Se connecter à la base `investpro`
3. Ouvrir le fichier `backend/src/main/resources/db/test-data.sql`
4. Exécuter le script (F5 ou bouton Execute)

---

## Option 4: Via Spring Boot (Automatique au démarrage)

### Méthode A: Ajouter au application.properties

```properties
# backend/src/main/resources/application.properties
spring.jpa.defer-datasource-initialization=true
spring.sql.init.mode=always
spring.sql.init.data-locations=classpath:db/test-data.sql
```

**Attention**: Cela rechargera les données à chaque démarrage. À utiliser uniquement en développement.

### Méthode B: Créer un script de migration Flyway

Si vous utilisez Flyway, renommez le fichier:

```bash
cp backend/src/main/resources/db/test-data.sql \
   backend/src/main/resources/db/migration/V3__test_data.sql
```

Flyway l'exécutera automatiquement au prochain démarrage.

---

## ✅ Vérification après chargement

### Via SQL
```sql
-- Compter les entités créées
SELECT 'Dimensions' as type, COUNT(*) as count FROM dimensions
UNION ALL
SELECT 'Valeurs Dimensions', COUNT(*) FROM dimension_valeurs
UNION ALL
SELECT 'Projets', COUNT(*) FROM projets
UNION ALL
SELECT 'Fournisseurs', COUNT(*) FROM fournisseurs
UNION ALL
SELECT 'Conventions', COUNT(*) FROM conventions
UNION ALL
SELECT 'Marchés', COUNT(*) FROM marches
UNION ALL
SELECT 'Lignes Marché', COUNT(*) FROM marche_lignes
UNION ALL
SELECT 'Avenants', COUNT(*) FROM marche_avenants;

-- Résultat attendu:
-- type                | count
-- -------------------+-------
-- Dimensions         |     5
-- Valeurs Dimensions |    24
-- Projets            |     5
-- Fournisseurs       |     7
-- Conventions        |     5
-- Marchés            |     6
-- Lignes Marché      |    18
-- Avenants           |     2
```

### Via l'interface Web

1. **Connexion**
   - Utilisateur: `admin`
   - Mot de passe: `admin123`

2. **Vérifier les Conventions** (`/conventions`)
   - Vous devriez voir 5 conventions
   - 4 avec statut VALIDEE (V0)
   - 1 avec statut BROUILLON

3. **Vérifier les Marchés** (`/marches`)
   - Vous devriez voir 6 marchés
   - Total engagé: 9,75 Milliards MAD

4. **Vérifier le Plan Analytique** (`/parametrage/plan-analytique`)
   - 5 dimensions configurées
   - 24 valeurs au total

5. **Tester le Reporting** (`/reporting/analytique`)
   - Filtrer par BUDGET: BG-2024-01
   - Filtrer par PROJET: PRJ-ROUTE-2024
   - Voir les graphiques

---

## 🎯 Données Clés à Connaître

### Conventions Validées (pour tests)
| Numéro | Code | Type | Budget | Commission |
|--------|------|------|--------|------------|
| CONV-2024-001 | CONV-INFRA-2024 | CADRE | 8,5 Mds | 2.50% |
| CONV-2024-002 | CONV-ENERGIE-2024 | CADRE | 3,5 Mds | 2.75% |
| CONV-2024-003 | CONV-EAU-2024 | SPECIFIQUE | 2,1 Mds | 3.00% |
| CONV-2024-004 | CONV-DIGIT-2024 | NON_CADRE | 1,2 Mds | 3.50% |

### Convention Brouillon (pour tester workflow)
| Numéro | Code | Type | Statut |
|--------|------|------|--------|
| CONV-2025-001 | CONV-SOCIAL-2025 | CADRE | BROUILLON |

**Test du workflow:**
1. Aller sur `/conventions`
2. Cliquer sur CONV-2025-001
3. Cliquer "Soumettre" → Statut devient SOUMIS
4. Cliquer "Valider" → Statut devient VALIDEE, Version V0 créée

### Marchés avec Avenants
- **M-2024-001**: Autoroute Lot 1 → Avenant +150M MAD
- **M-2024-004**: Centrale Solaire → Avenant +250M MAD

---

## 🔄 Réinitialiser les Données

Si vous voulez repartir de zéro:

```sql
-- Supprimer toutes les données de test
TRUNCATE TABLE marche_avenants CASCADE;
TRUNCATE TABLE marche_lignes CASCADE;
TRUNCATE TABLE marches CASCADE;
TRUNCATE TABLE conventions CASCADE;
TRUNCATE TABLE projets CASCADE;
TRUNCATE TABLE fournisseurs CASCADE;
TRUNCATE TABLE dimension_valeurs CASCADE;
TRUNCATE TABLE dimensions CASCADE;

-- Puis recharger
\i backend/src/main/resources/db/test-data.sql
```

---

## 📊 Cas d'Usage Démonstrés

### 1. Création et Workflow Convention
✅ Créer convention en BROUILLON
✅ Soumettre pour validation
✅ Valider (création V0)
✅ Verrouillage automatique

### 2. Gestion Marchés
✅ Marchés de différents types
✅ Lignes avec quantités/prix
✅ Calculs HT/TVA/TTC automatiques
✅ Avenants (montants, délais)

### 3. Plan Analytique
✅ Dimensions configurables
✅ Valeurs par dimension
✅ Imputation JSONB sur lignes marché
✅ Reporting multidimensionnel

### 4. Calcul Commissions
✅ Taux variables (2.5% - 3.5%)
✅ Base calcul TTC ou HT
✅ Calcul sur marchés engagés

---

## 💡 Tips

- **Performance**: L'import prend ~5 secondes
- **Connexion**: Utilisez `admin / admin123`
- **Documentation**: Voir `backend/src/main/resources/db/README-TEST-DATA.md`
- **Support**: Toutes les données sont cohérentes et réalistes

---

## ⚠️ Important

- Ces données sont **uniquement pour développement/démo**
- **Ne jamais utiliser en production**
- Les ICE, RIB, références sont fictifs
- Les montants sont réalistes pour le contexte marocain

---

**Bon test! 🇲🇦**
