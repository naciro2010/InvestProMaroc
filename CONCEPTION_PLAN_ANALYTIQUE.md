# 🎯 Conception Système Plan Analytique Dynamique

## 📌 Objectif

Remplacer les dimensions analytiques **figées** (Projet, Axe) par un système **100% flexible** permettant aux utilisateurs de créer leurs propres dimensions d'analyse.

---

## 🔄 Comparaison AVANT / APRÈS

### ❌ AVANT (Système Rigide)

```
Convention
  ├─ Projets (FIXE - pas de choix)
  └─ Axes Analytiques (FIXE - pas de choix)
```

**Problèmes :**
- Dimensions imposées (Projet, Axe)
- Impossible d'analyser par Région, Marché, Phase, etc.
- Structure non adaptable aux besoins métier

### ✅ APRÈS (Système Flexible)

```
Convention
  └─ Plan Analytique
       ├─ Dimension 1: "Région" → [Casablanca, Rabat, Marrakech]
       ├─ Dimension 2: "Type Marché" → [Travaux, Fournitures, Services]
       ├─ Dimension 3: "Phase" → [Étude, Réalisation, Clôture]
       └─ ... (créé par l'utilisateur)
```

**Avantages :**
- ✅ Dimensions créées par l'utilisateur
- ✅ Analyse multi-dimensionnelle (région + marché + phase...)
- ✅ Agrégation automatique des montants
- ✅ Flexibilité totale

---

## 🏗️ Architecture Backend (Kotlin + JPA)

### Entités Principales

#### 1. **DimensionAnalytique** (Configuration)

```kotlin
@Entity
@Table(name = "dimensions_analytiques")
class DimensionAnalytique(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    // Nom de la dimension (ex: "Région", "Marché", "Phase")
    @Column(nullable = false, length = 100)
    var nom: String,

    // Code court (ex: "REG", "MARCH", "PHASE")
    @Column(nullable = false, unique = true, length = 20)
    var code: String,

    // Description
    @Column(length = 500)
    var description: String? = null,

    // Ordre d'affichage
    @Column(nullable = false)
    var ordre: Int = 0,

    // Active ou non
    @Column(nullable = false)
    var active: Boolean = true,

    // Obligatoire pour imputation ?
    @Column(nullable = false)
    var obligatoire: Boolean = false,

    // Valeurs possibles
    @OneToMany(mappedBy = "dimension", cascade = [CascadeType.ALL], orphanRemoval = true)
    var valeurs: MutableList<ValeurDimension> = mutableListOf(),

    // Audit
    @CreatedDate
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    var createdBy: User? = null
)
```

**Exemple de données :**
| ID | Code | Nom | Obligatoire | Ordre |
|----|------|-----|-------------|-------|
| 1  | REG  | Région | true | 1 |
| 2  | MARCH | Type Marché | false | 2 |
| 3  | PHASE | Phase Projet | false | 3 |

---

#### 2. **ValeurDimension** (Valeurs possibles)

```kotlin
@Entity
@Table(name = "valeurs_dimensions")
class ValeurDimension(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    // Dimension parente
    @ManyToOne
    @JoinColumn(name = "dimension_id", nullable = false)
    var dimension: DimensionAnalytique,

    // Code de la valeur (ex: "CAS", "RAB", "MAR")
    @Column(nullable = false, length = 50)
    var code: String,

    // Libellé (ex: "Casablanca", "Rabat", "Marrakech")
    @Column(nullable = false, length = 200)
    var libelle: String,

    // Description
    @Column(length = 500)
    var description: String? = null,

    // Active ou non
    @Column(nullable = false)
    var active: Boolean = true,

    // Ordre d'affichage
    @Column(nullable = false)
    var ordre: Int = 0,

    // Audit
    @CreatedDate
    var createdAt: LocalDateTime = LocalDateTime.now()
)
```

**Exemple de données (Dimension "Région") :**
| ID | Dimension | Code | Libellé | Active |
|----|-----------|------|---------|--------|
| 1  | Région    | CAS  | Casablanca | true |
| 2  | Région    | RAB  | Rabat | true |
| 3  | Région    | MAR  | Marrakech | true |

---

#### 3. **ImputationAnalytique** (Ventilation Budget/Décompte)

```kotlin
@Entity
@Table(name = "imputations_analytiques")
class ImputationAnalytique(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    // Type d'imputation (BUDGET, DECOMPTE, PAIEMENT)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    var typeImputation: TypeImputation,

    // Référence (ID du Budget, Décompte, ou Paiement)
    @Column(nullable = false)
    var referenceId: Long,

    // Montant imputé
    @Column(nullable = false, precision = 15, scale = 2)
    var montant: BigDecimal,

    // Valeurs des dimensions (stockage JSON)
    @Type(type = "json")
    @Column(columnDefinition = "jsonb", nullable = false)
    var dimensionsValeurs: Map<String, String>,

    // Exemple: {"REG": "CAS", "MARCH": "TRAVAUX", "PHASE": "REAL"}

    // Audit
    @CreatedDate
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    var createdBy: User? = null
)

enum class TypeImputation {
    BUDGET,
    DECOMPTE,
    ORDRE_PAIEMENT,
    PAIEMENT
}
```

**Exemple de données :**
| ID | Type | Référence | Montant | Dimensions |
|----|------|-----------|---------|------------|
| 1  | BUDGET | 123 | 1 000 000 | {"REG":"CAS", "MARCH":"TRAVAUX"} |
| 2  | DECOMPTE | 456 | 500 000 | {"REG":"CAS", "MARCH":"TRAVAUX", "PHASE":"REAL"} |

---

### Modification des Entités Existantes

#### Budget.kt (Simplifié)

```kotlin
@Entity
@Table(name = "budgets")
class Budget(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne
    @JoinColumn(name = "convention_id", nullable = false)
    var convention: Convention,

    var version: String = "V0", // V0, V1, V2...

    @Column(nullable = false, precision = 15, scale = 2)
    var montantTotal: BigDecimal,

    @Enumerated(EnumType.STRING)
    var statut: StatutBudget = StatutBudget.BROUILLON,

    // PLUS DE RELATION vers Projet ou Axe !
    // L'analytique est géré via ImputationAnalytique

    @OneToMany(mappedBy = "budget")
    var lignes: MutableList<LigneBudget> = mutableListOf()
)
```

#### Décompte.kt (Simplifié)

```kotlin
@Entity
@Table(name = "decomptes")
class Decompte(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne
    @JoinColumn(name = "marche_id", nullable = false)
    var marche: Marche,

    @Column(nullable = false, precision = 15, scale = 2)
    var montantTTC: BigDecimal,

    @Column(nullable = false, precision = 15, scale = 2)
    var netAPayer: BigDecimal,

    // PLUS DE RELATION vers Projet ou Axe !
    // L'analytique est géré via ImputationAnalytique
)
```

---

## 🎨 Interface Utilisateur (React)

### Page 1 : Configuration des Dimensions

**Route :** `/parametrage/plan-analytique`

**Fonctionnalités :**
1. Créer une nouvelle dimension (ex: "Région")
2. Définir si obligatoire ou non
3. Définir l'ordre d'affichage
4. Ajouter des valeurs (ex: Casablanca, Rabat, Marrakech)
5. Activer/Désactiver dimensions

**Wireframe :**
```
┌────────────────────────────────────────────────┐
│  📊 Configuration Plan Analytique              │
├────────────────────────────────────────────────┤
│                                                │
│  [+ Créer Dimension]                           │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Dimension: Région (REG)          [Éditer]│ │
│  │ Obligatoire: ✓   Ordre: 1                │ │
│  │                                           │ │
│  │ Valeurs:                                  │ │
│  │   • Casablanca (CAS)                      │ │
│  │   • Rabat (RAB)                           │ │
│  │   • Marrakech (MAR)                       │ │
│  │   [+ Ajouter valeur]                      │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Dimension: Type Marché (MARCH)   [Éditer]│ │
│  │ Obligatoire: ✗   Ordre: 2                │ │
│  │                                           │ │
│  │ Valeurs:                                  │ │
│  │   • Travaux                               │ │
│  │   • Fournitures                           │ │
│  │   • Services                              │ │
│  │   [+ Ajouter valeur]                      │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

---

### Page 2 : Imputation Budget (Exemple)

**Route :** `/budgets/{id}/imputation`

**Fonctionnalités :**
1. Ventiler le budget par dimensions
2. Sélection dynamique des dimensions actives
3. Contrôle du total (doit = montant budget)

**Wireframe :**
```
┌────────────────────────────────────────────────┐
│  💰 Imputation Budget V0 - Convention ABC      │
│  Montant Total: 5 000 000 MAD                  │
├────────────────────────────────────────────────┤
│                                                │
│  [+ Ajouter Ligne d'Imputation]                │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Ligne 1                         [Suppr.] │ │
│  │                                           │ │
│  │ Montant: 2 000 000 MAD                    │ │
│  │                                           │ │
│  │ Dimensions:                               │ │
│  │   Région:       [Casablanca ▼]            │ │
│  │   Type Marché:  [Travaux ▼]               │ │
│  │   Phase:        [Réalisation ▼]           │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Ligne 2                         [Suppr.] │ │
│  │                                           │ │
│  │ Montant: 3 000 000 MAD                    │ │
│  │                                           │ │
│  │ Dimensions:                               │ │
│  │   Région:       [Rabat ▼]                 │ │
│  │   Type Marché:  [Services ▼]              │ │
│  │   Phase:        [Étude ▼]                 │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ─────────────────────────────────────────────│
│  Total Imputé:  5 000 000 MAD ✓               │
│                                                │
│  [Annuler]  [Enregistrer]                     │
└────────────────────────────────────────────────┘
```

---

### Page 3 : Reporting Analytique

**Route :** `/reporting/analytique`

**Fonctionnalités :**
1. Sélectionner dimensions pour analyse
2. Agrégation automatique des montants
3. Graphiques dynamiques (par région, par marché, etc.)

**Wireframe :**
```
┌────────────────────────────────────────────────┐
│  📊 Reporting Analytique                       │
├────────────────────────────────────────────────┤
│                                                │
│  Analyser par: [Région ▼]  [Appliquer]        │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │          Répartition par Région           │ │
│  │                                           │ │
│  │  Casablanca    █████████████  3 500 000  │ │
│  │  Rabat         ██████         1 500 000  │ │
│  │  Marrakech     ███            500 000    │ │
│  │                                           │ │
│  │  Total:                       5 500 000  │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Croiser avec: [Type Marché ▼]  [Appliquer]   │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │   Casablanca │ Rabat │ Marrakech │ Total │ │
│  │──────────────┼───────┼───────────┼───────│ │
│  │ Travaux      │ 2M    │ 1M        │ 3M    │ │
│  │ Services     │ 1M    │ 500K      │ 1.5M  │ │
│  │ Fournitures  │ 500K  │ 0         │ 500K  │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

---

## 🔧 API REST (Endpoints)

### Dimensions

```
GET    /api/dimensions                    # Lister toutes les dimensions
POST   /api/dimensions                    # Créer une dimension
PUT    /api/dimensions/{id}               # Modifier une dimension
DELETE /api/dimensions/{id}               # Supprimer une dimension
GET    /api/dimensions/{id}/valeurs       # Valeurs d'une dimension
POST   /api/dimensions/{id}/valeurs       # Ajouter une valeur
```

### Imputations

```
GET    /api/imputations?type=BUDGET&referenceId=123   # Imputations d'un budget
POST   /api/imputations                                # Créer imputation
PUT    /api/imputations/{id}                           # Modifier imputation
DELETE /api/imputations/{id}                           # Supprimer imputation
```

### Reporting

```
GET    /api/reporting/analytique?dimensions=REG,MARCH&groupBy=REG
# Agrégation par dimension(s)
```

---

## 📊 Requêtes SQL (Exemples)

### Agrégation par Région

```sql
SELECT
    dimensions_valeurs->>'REG' as region,
    SUM(montant) as total
FROM imputations_analytiques
WHERE type_imputation = 'BUDGET'
GROUP BY dimensions_valeurs->>'REG';
```

**Résultat :**
| region | total |
|--------|-------|
| CAS    | 3 500 000 |
| RAB    | 1 500 000 |
| MAR    | 500 000 |

### Croisement Région × Type Marché

```sql
SELECT
    dimensions_valeurs->>'REG' as region,
    dimensions_valeurs->>'MARCH' as type_marche,
    SUM(montant) as total
FROM imputations_analytiques
WHERE type_imputation = 'BUDGET'
GROUP BY
    dimensions_valeurs->>'REG',
    dimensions_valeurs->>'MARCH';
```

**Résultat :**
| region | type_marche | total |
|--------|-------------|-------|
| CAS    | TRAVAUX     | 2 000 000 |
| CAS    | SERVICES    | 1 000 000 |
| RAB    | TRAVAUX     | 1 000 000 |
| RAB    | SERVICES    | 500 000 |

---

## ✅ Avantages du Système

### 1. **Flexibilité Totale**
- Les utilisateurs créent leurs dimensions
- Pas de structure imposée
- Adaptable à tout contexte métier

### 2. **Analyse Multi-dimensionnelle**
- Croisement illimité de dimensions
- Agrégation automatique
- Reporting puissant

### 3. **Évolutivité**
- Ajouter/supprimer dimensions sans migration DB
- Les données restent cohérentes
- Historique préservé

### 4. **Performance**
- Index sur colonnes JSONB (PostgreSQL)
- Requêtes optimisées avec GIN index
- Pas de jointures complexes

---

## 🚀 Migrations Flyway

### V21__create_plan_analytique.sql

```sql
-- Table dimensions analytiques
CREATE TABLE dimensions_analytiques (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    ordre INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    obligatoire BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by_id BIGINT REFERENCES users(id)
);

-- Table valeurs dimensions
CREATE TABLE valeurs_dimensions (
    id BIGSERIAL PRIMARY KEY,
    dimension_id BIGINT NOT NULL REFERENCES dimensions_analytiques(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT true,
    ordre INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(dimension_id, code)
);

-- Table imputations analytiques
CREATE TABLE imputations_analytiques (
    id BIGSERIAL PRIMARY KEY,
    type_imputation VARCHAR(50) NOT NULL,
    reference_id BIGINT NOT NULL,
    montant DECIMAL(15,2) NOT NULL,
    dimensions_valeurs JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by_id BIGINT REFERENCES users(id)
);

-- Index pour performance
CREATE INDEX idx_imputations_type_ref ON imputations_analytiques(type_imputation, reference_id);
CREATE INDEX idx_imputations_dimensions ON imputations_analytiques USING GIN(dimensions_valeurs);

-- Données de démonstration
INSERT INTO dimensions_analytiques (code, nom, ordre, obligatoire) VALUES
    ('REG', 'Région', 1, true),
    ('MARCH', 'Type Marché', 2, false),
    ('PHASE', 'Phase Projet', 3, false);

INSERT INTO valeurs_dimensions (dimension_id, code, libelle, ordre) VALUES
    (1, 'CAS', 'Casablanca', 1),
    (1, 'RAB', 'Rabat', 2),
    (1, 'MAR', 'Marrakech', 3),
    (2, 'TRAV', 'Travaux', 1),
    (2, 'FOUR', 'Fournitures', 2),
    (2, 'SERV', 'Services', 3),
    (3, 'ETU', 'Étude', 1),
    (3, 'REAL', 'Réalisation', 2),
    (3, 'CLO', 'Clôture', 3);
```

---

## 📝 Conclusion

Ce système de **Plan Analytique Dynamique** offre :

✅ **Liberté totale** aux utilisateurs
✅ **Analyse multi-dimensionnelle** puissante
✅ **Évolutivité** sans limite
✅ **Performance** avec PostgreSQL JSONB
✅ **Simplicité** d'utilisation

**Prêt à implémenter !** 🚀
