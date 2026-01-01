# 📊 Données de Test InvestPro Maroc

## Vue d'ensemble

Ce fichier `test-data.sql` contient des données fictives cohérentes et réalistes pour démontrer toutes les fonctionnalités du système InvestPro Maroc.

---

## 📋 Contenu des données

### 1. **Plan Analytique** (5 dimensions, 24 valeurs)

#### Dimensions configurées:
| Code | Libellé | Description | Obligatoire |
|------|---------|-------------|-------------|
| `BUDGET` | Enveloppe Budgétaire | Source de financement | ✅ Oui |
| `PROJET` | Projet | Code projet d'investissement | ✅ Oui |
| `SECTEUR` | Secteur | Secteur d'activité | ❌ Non |
| `REGION` | Région | Région administrative | ❌ Non |
| `PHASE` | Phase | Phase du projet | ❌ Non |

#### Exemples de valeurs:
- **BUDGET**: BG-2024-01, BG-2024-02, BG-2024-03, BG-2025-01
- **PROJET**: PRJ-ROUTE-2024, PRJ-PORT-2024, PRJ-ENERGIE-2024, PRJ-EAU-2024, PRJ-DIGIT-2024
- **SECTEUR**: SEC-INFRA, SEC-ENERGIE, SEC-EAU, SEC-DIGIT, SEC-SOCIAL
- **REGION**: REG-CASA, REG-RABAT, REG-TANGER, REG-MARRAK, REG-SOUS
- **PHASE**: PH-ETUDE, PH-TRAVAUX, PH-EQUIP, PH-EXPLOIT

---

### 2. **Projets d'Investissement** (5 projets)

| Code | Nom | Budget | Dates | Statut |
|------|-----|--------|-------|--------|
| `PRJ-ROUTE-2024` | Autoroute Casa-Marrakech | 4,5 Mds MAD | 2024-2026 | EN_COURS |
| `PRJ-PORT-2024` | Port Tanger Med 3 | 3,2 Mds MAD | 2024-2027 | EN_COURS |
| `PRJ-ENERGIE-2024` | Centrale Solaire Ouarzazate | 2,8 Mds MAD | 2024-2026 | EN_COURS |
| `PRJ-EAU-2024` | Station Dessalement Agadir | 1,85 Mds MAD | 2024-2026 | EN_COURS |
| `PRJ-DIGIT-2024` | Digitalisation Services Publics | 950 M MAD | 2024-2025 | EN_COURS |

**Total Budget Projets: 13,3 Milliards MAD**

---

### 3. **Fournisseurs** (7 entreprises)

| ICE | Nom | Type | Ville |
|-----|-----|------|-------|
| 002123456789012 | Groupe BTP CASA | Entreprise BTP | Casablanca |
| 002234567890123 | SOTRAVO Maroc | Entreprise Travaux | Casablanca |
| 002345678901234 | DELTA Engineering | Bureau d'Études | Rabat |
| 002456789012345 | Tech Solutions Maroc | Fournisseur IT | Casablanca |
| 002567890123456 | HYDRO Maroc | Entreprise Eau | Agadir |
| 002678901234567 | Énergie Solaire Maroc | Entreprise Énergie | Ouarzazate |
| 002789012345678 | Consulting & Audit Pro | Bureau d'Études | Rabat |

---

### 4. **Conventions** (5 conventions)

#### 4.1 Convention CADRE Infrastructure
- **Code**: CONV-INFRA-2024
- **Numéro**: CONV-2024-001
- **Budget**: 8,5 Milliards MAD
- **Taux commission**: 2,50%
- **Période**: 2024-2026
- **Statut**: ✅ VALIDEE (Version V0)
- **Objet**: Infrastructure routière et portuaire

#### 4.2 Convention CADRE Énergie
- **Code**: CONV-ENERGIE-2024
- **Numéro**: CONV-2024-002
- **Budget**: 3,5 Milliards MAD
- **Taux commission**: 2,75%
- **Période**: 2024-2027
- **Statut**: ✅ VALIDEE (Version V0)
- **Objet**: Énergie renouvelable

#### 4.3 Convention SPECIFIQUE Eau
- **Code**: CONV-EAU-2024
- **Numéro**: CONV-2024-003
- **Budget**: 2,1 Milliards MAD
- **Taux commission**: 3,00%
- **Période**: 2024-2026
- **Statut**: ✅ VALIDEE (Version V0)
- **Objet**: Dessalement et assainissement

#### 4.4 Convention NON-CADRE Digitalisation
- **Code**: CONV-DIGIT-2024
- **Numéro**: CONV-2024-004
- **Budget**: 1,2 Milliards MAD
- **Taux commission**: 3,50%
- **Période**: 2024-2025
- **Statut**: ✅ VALIDEE (Version V0)
- **Objet**: Transformation digitale

#### 4.5 Convention BROUILLON (pour tests workflow)
- **Code**: CONV-SOCIAL-2025
- **Numéro**: CONV-2025-001
- **Budget**: 2,5 Milliards MAD
- **Taux commission**: 2,50%
- **Période**: 2025-2027
- **Statut**: 📝 BROUILLON
- **Objet**: Projets sociaux et santé

**Total Budget Conventions: 17,8 Milliards MAD**

---

### 5. **Marchés Publics** (6 marchés, 18 lignes)

#### Marché 1: M-2024-001
- **Objet**: Autoroute Casa-Marrakech Lot 1 (Km 0-115)
- **Type**: TRAVAUX
- **Fournisseur**: Groupe BTP CASA
- **Montant HT**: 1,875 Mds MAD
- **Montant TTC**: 2,250 Mds MAD
- **Convention**: CONV-INFRA-2024
- **Lignes**: 3 lignes (Terrassement, Revêtement, Signalisation)

#### Marché 2: M-2024-002
- **Objet**: Autoroute Casa-Marrakech Lot 2 (Km 115-230)
- **Type**: TRAVAUX
- **Fournisseur**: SOTRAVO Maroc
- **Montant HT**: 1,875 Mds MAD
- **Montant TTC**: 2,250 Mds MAD
- **Convention**: CONV-INFRA-2024
- **Lignes**: 3 lignes (Terrassement, Revêtement, Ouvrages d'art)

#### Marché 3: M-2024-003
- **Objet**: Études techniques Port Tanger Med 3
- **Type**: ETUDES
- **Fournisseur**: DELTA Engineering
- **Montant HT**: 125 M MAD
- **Montant TTC**: 150 M MAD
- **Convention**: CONV-INFRA-2024
- **Lignes**: 3 lignes (Géotechnique, Ingénierie, Environnement)

#### Marché 4: M-2024-004
- **Objet**: Centrale Solaire 500 MW - Panneaux et équipements
- **Type**: FOURNITURE_POSE
- **Fournisseur**: Énergie Solaire Maroc
- **Montant HT**: 2,083 Mds MAD
- **Montant TTC**: 2,500 Mds MAD
- **Convention**: CONV-ENERGIE-2024
- **Lignes**: 3 lignes (Panneaux, Onduleurs, Structures)
- **Avenant**: +50 MW (250 M MAD)

#### Marché 5: M-2024-005
- **Objet**: Station Dessalement Agadir 275,000 m³/jour
- **Type**: TRAVAUX
- **Fournisseur**: HYDRO Maroc
- **Montant HT**: 1,458 Mds MAD
- **Montant TTC**: 1,750 Mds MAD
- **Convention**: CONV-EAU-2024
- **Lignes**: 3 lignes (Génie civil, Osmose inverse, Pompes)

#### Marché 6: M-2024-006
- **Objet**: Plateforme Digitale Services Publics Phase 2
- **Type**: SERVICES
- **Fournisseur**: Tech Solutions Maroc
- **Montant HT**: 708 M MAD
- **Montant TTC**: 850 M MAD
- **Convention**: CONV-DIGIT-2024
- **Lignes**: 3 lignes (Dev web/mobile, Cloud, Migration)

**Total Marchés HT: 8,124 Milliards MAD**
**Total Marchés TTC: 9,750 Milliards MAD**

---

### 6. **Avenants** (2 avenants)

| Marché | Numéro | Objet | Montant | Délai |
|--------|--------|-------|---------|-------|
| M-2024-001 | AV-M-2024-001-01 | 2 échangeurs supplémentaires | +150 M MAD | +60 jours |
| M-2024-004 | AV-M-2024-004-01 | Augmentation 500→550 MW | +250 M MAD | +45 jours |

---

## 🔧 Installation des données

### Option 1: Depuis l'application (recommandé)

Les données peuvent être chargées via le script SQL dans l'application en tant qu'admin.

### Option 2: Via psql (ligne de commande)

```bash
# Se connecter à la base de données
psql -U postgres -d investpro

# Exécuter le script
\i /path/to/backend/src/main/resources/db/test-data.sql
```

### Option 3: Via Docker (si vous utilisez Docker)

```bash
docker exec -i investpro-db psql -U postgres -d investpro < backend/src/main/resources/db/test-data.sql
```

---

## 📊 Structure des imputations analytiques

Toutes les lignes de marché incluent une imputation analytique complète au format JSONB:

```json
{
  "BUDGET": "BG-2024-01",
  "PROJET": "PRJ-ROUTE-2024",
  "SECTEUR": "SEC-INFRA",
  "REGION": "REG-CASA",
  "PHASE": "PH-TRAVAUX"
}
```

Cela permet:
- ✅ Reporting multidimensionnel
- ✅ Agrégation par budget, projet, secteur, région, phase
- ✅ Analyse croisée des dépenses
- ✅ Tableaux de bord dynamiques

---

## 📈 Cas d'usage démontrés

### 1. **Workflow Conventions**
- Convention BROUILLON → SOUMIS → VALIDEE (CONV-SOCIAL-2025)
- Conventions validées avec version V0 (4 conventions)

### 2. **Gestion Marchés**
- Marchés de différents types (TRAVAUX, ETUDES, FOURNITURE_POSE, SERVICES)
- Lignes de marché avec quantités et prix unitaires
- Calculs automatiques HT/TVA/TTC

### 3. **Avenants de marchés**
- Augmentation de montant
- Extension de délai
- Modifications techniques

### 4. **Plan Analytique Dynamique**
- Imputation multidimensionnelle
- Reporting par budget, projet, secteur, région, phase
- Agrégation flexible

### 5. **Calcul de commissions**
- Différents taux selon type de convention (2.50% à 3.50%)
- Base de calcul TTC ou HT
- Commission sur 9,75 Mds MAD TTC

---

## 💰 Résumé Financier

| Indicateur | Montant |
|------------|---------|
| **Budget total Conventions** | 17,8 Milliards MAD |
| **Budget total Projets** | 13,3 Milliards MAD |
| **Marchés engagés HT** | 8,124 Milliards MAD |
| **Marchés engagés TTC** | 9,750 Milliards MAD |
| **Avenants** | +400 Millions MAD |
| **Commission estimée (2.5-3.5%)** | ~240-340 Millions MAD |

---

## ✅ Vérifications après import

Exécutez ces requêtes pour vérifier l'import:

```sql
-- Compter les entités
SELECT
    (SELECT COUNT(*) FROM dimensions) as dimensions,
    (SELECT COUNT(*) FROM dimension_valeurs) as valeurs_dimensions,
    (SELECT COUNT(*) FROM projets) as projets,
    (SELECT COUNT(*) FROM fournisseurs) as fournisseurs,
    (SELECT COUNT(*) FROM conventions) as conventions,
    (SELECT COUNT(*) FROM marches) as marches,
    (SELECT COUNT(*) FROM marche_lignes) as lignes_marche,
    (SELECT COUNT(*) FROM marche_avenants) as avenants;

-- Vérifier les montants
SELECT
    SUM(budget) as budget_conventions,
    (SELECT SUM(montant_initial_ttc) FROM marches) as total_marches_ttc
FROM conventions;

-- Vérifier les imputations analytiques
SELECT
    ml.dimensions_valeurs->>'BUDGET' as budget,
    ml.dimensions_valeurs->>'PROJET' as projet,
    COUNT(*) as nb_lignes,
    SUM(ml.montant_ttc) as montant_total
FROM marche_lignes ml
GROUP BY ml.dimensions_valeurs->>'BUDGET', ml.dimensions_valeurs->>'PROJET'
ORDER BY montant_total DESC;
```

---

## 🎯 Tests recommandés

### 1. Interface Conventions
- [ ] Voir la liste des 5 conventions
- [ ] Filtrer par statut (VALIDEE, BROUILLON)
- [ ] Tester workflow sur CONV-SOCIAL-2025: BROUILLON → SOUMIS → VALIDER

### 2. Interface Marchés
- [ ] Voir les 6 marchés avec leurs montants
- [ ] Consulter les détails d'un marché avec ses lignes
- [ ] Vérifier les avenants sur M-2024-001 et M-2024-004
- [ ] Créer un nouveau marché

### 3. Plan Analytique
- [ ] Voir les 5 dimensions avec leurs valeurs
- [ ] Créer une nouvelle dimension
- [ ] Ajouter des valeurs à une dimension existante

### 4. Reporting Analytique
- [ ] Filtrer par dimension BUDGET
- [ ] Filtrer par dimension PROJET
- [ ] Créer un rapport croisé BUDGET × SECTEUR
- [ ] Exporter en Excel

### 5. Calcul Commission
- [ ] Calculer commission pour CONV-INFRA-2024 (2.5% sur 4,5 Mds)
- [ ] Calculer commission pour CONV-DIGIT-2024 (3.5% base HT)

---

## 🔄 Réinitialisation

Pour supprimer toutes les données de test et repartir de zéro:

```sql
-- ATTENTION: Cette commande supprime TOUTES les données de test!
TRUNCATE TABLE marche_avenants CASCADE;
TRUNCATE TABLE marche_lignes CASCADE;
TRUNCATE TABLE marches CASCADE;
TRUNCATE TABLE conventions CASCADE;
TRUNCATE TABLE projets CASCADE;
TRUNCATE TABLE fournisseurs CASCADE;
TRUNCATE TABLE dimension_valeurs CASCADE;
TRUNCATE TABLE dimensions CASCADE;

-- Réinitialiser les séquences
ALTER SEQUENCE dimensions_id_seq RESTART WITH 1;
ALTER SEQUENCE dimension_valeurs_id_seq RESTART WITH 1;
ALTER SEQUENCE projets_id_seq RESTART WITH 1;
ALTER SEQUENCE fournisseurs_id_seq RESTART WITH 1;
ALTER SEQUENCE conventions_id_seq RESTART WITH 1;
ALTER SEQUENCE marches_id_seq RESTART WITH 1;
ALTER SEQUENCE marche_lignes_id_seq RESTART WITH 1;
ALTER SEQUENCE marche_avenants_id_seq RESTART WITH 1;
```

---

## 📝 Notes

- Toutes les données sont fictives et à but de démonstration uniquement
- Les montants sont réalistes pour des projets d'infrastructure au Maroc
- Les ICE, RIB et références sont générés de manière cohérente
- Les dates sont dans le contexte 2024-2027
- Les commissions respectent les taux pratiqués (2.5% - 3.5%)

---

**Créé pour InvestPro Maroc 🇲🇦**
*Système de Gestion Intelligente des Dépenses d'Investissement*
