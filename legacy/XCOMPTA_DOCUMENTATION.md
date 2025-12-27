# XCOMPTA - Documentation Technique Complète

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture de l'Application](#architecture-de-lapplication)
3. [Module Conventions - Analyse Détaillée](#module-conventions---analyse-détaillée)
4. [Relations Inter-Modules](#relations-inter-modules)
5. [Spécifications Design](#spécifications-design)
6. [Guide d'Implémentation pour InvestPro Maroc](#guide-dimplémentation-pour-investpro-maroc)

---

## 🎯 Vue d'ensemble

**XCOMPTA** est une application de gestion comptable et financière développée avec:
- **Framework**: Monster Admin Bootstrap 4 Dashboard Template
- **Technologies**: HTML5, Bootstrap 4, CSS3, jQuery
- **Architecture**: Client-side rendering avec système d'inclusion HTML (W3.JS)
- **Modules**: Conventions, Budget, Achats (Marchés, Bons de commande, Contrats, Factures)

### Modules Principaux

```
XCOMPTA
├── Conventions (Module Central)
│   ├── Dashboard
│   ├── Mini Dashboard
│   ├── Gestion des Conventions
│   ├── Versements Réels
│   └── Partenaires
├── Budget (Module vide)
└── Achats
    ├── Marchés
    ├── Bons de Commande
    ├── Contrats
    └── Décomptes (Factures)
```

---

## 🏗️ Architecture de l'Application

### Structure des Fichiers

```
Xcompta-main/
├── monster/
│   ├── src/
│   │   └── main/
│   │       ├── index.html (Page de login)
│   │       ├── dashbord.html (Tableau de bord)
│   │       ├── conventions.html (Liste des conventions)
│   │       ├── conventionCadre.html (Convention Cadre)
│   │       ├── conventionNonCadre.html (Convention Non-Cadre)
│   │       ├── conventionSpec.html (Convention Spécifique)
│   │       ├── conventionCadreAvenant.html (Avenant)
│   │       ├── partenaire.html (Gestion Partenaires)
│   │       ├── projet.html (Gestion Projets)
│   │       ├── marche.html (Gestion Marchés)
│   │       ├── bonscommande.html (Bons de commande)
│   │       ├── decomptes.html (Factures/Décomptes)
│   │       ├── versementReel.html (Paiements réels)
│   │       └── common/
│   │           ├── topbar.html (Barre de navigation supérieure)
│   │           ├── leftSideBarInside.html (Menu latéral)
│   │           └── includeHtml.js (Système d'inclusion)
│   └── dist/
│       ├── css/
│       │   └── style.min.css (Styles compilés)
│       └── js/
│           └── (Bibliothèques jQuery, DataTables, etc.)
├── landingpage/ (Page d'accueil publique)
└── Documentation/
```

### Navigation

**Topbar** (`topbar.html`):
- Profil utilisateur: Mohamed Samir (Mohamed.S@REASM.MA)
- Notifications (alertes conventions)
- Messages
- Sélecteur de langue (EN, FR, ES, DE)
- Déconnexion

**Sidebar** (`leftSideBarInside.html`):
- **Conventions**: Dashboard, Mini Dashboard, Conventions, Versements réels, Partenaires
- **Budget**: (vide)
- **Achat**: Marché, Bon de commande, Contrat, Facture

---

## 📊 Module Conventions - Analyse Détaillée

### 1. Types de Conventions (4 types)

#### A. Convention Cadre (Framework Convention)
**Fichiers**: `conventionCadre.html`, `conventionCadre1.html`, `conventionCadre2.html`, `conventionCadre3.html`

**Caractéristiques**:
- Convention mère qui sert de cadre pour d'autres conventions
- Définit les termes et conditions générales
- Contient les taux de commission globaux

**Champs du Formulaire**:

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| **Numéro** | Text | Numéro unique de la convention | ✅ |
| **Date** | Date | Date de signature | ✅ |
| **Type** | Select (fixe) | "Cadre" | ✅ |
| **Statut** | Select | Validée, En cours, Achevé, En retard, Annulé | ✅ |
| **Taux** | Number (%) | Taux de commission en pourcentage | ✅ |
| **Budget** | Number (M DH) | Budget total alloué | ✅ |
| **Base de calcul** | Select | Décaissements TTC / Décaissements HT | ✅ |
| **Libellé** | Text | Titre de la convention | ✅ |
| **Objet** | Textarea | Description détaillée de l'objet | ✅ |

#### B. Convention Non-Cadre (Non-Framework Convention)
**Fichier**: `conventionNonCadre.html`

**Caractéristiques**:
- Convention indépendante ne dépendant pas d'une convention cadre
- Inclut des partenaires multiples avec allocation budgétaire
- Permet la désignation de Maîtres d'œuvre

**Champs du Formulaire**:
- Tous les champs de la Convention Cadre +

**Section Partenaires** (Table dynamique):

| Champ | Type | Description |
|-------|------|-------------|
| **Partenaire** | Select | Nom du partenaire (liste déroulante) |
| **Budget** | Number (M DH) | Budget alloué au partenaire |
| **Pourcentage** | Number (%) | Pourcentage du budget total |
| **CI (Commission d'Intervention)** | Number (M DH) | Montant de la commission |

**Actions**:
- Bouton `+` (Ajouter un partenaire) → Fonction `partenaire_fields()`
- Bouton `-` (Supprimer un partenaire)

**Section Maître d'Œuvre**:

| Champ | Type | Description |
|-------|------|-------------|
| **Maître d'œuvre** | Select | Partenaire désigné comme MO |
| **Maître d'œuvre Délégué** | Select | Partenaire désigné comme MOD |

**Actions**:
- Fonction `mo_fields()` pour ajouter des MO
- Fonction `mod_fields()` pour ajouter des MOD

**Section Axes/Projets/Segments**:

| Champ | Type | Description |
|-------|------|-------------|
| **Axe** | Select | Axe analytique/Programme |
| **Projet** | Select | Code projet |
| **Volet** | Select | Segment/Composante du projet |

#### C. Convention Spécifique (Specific Convention)
**Fichier**: `conventionSpec.html`

**Caractéristiques**:
- Convention la plus complète avec wizard multi-étapes
- Gestion détaillée des imputations budgétaires
- Planification des versements prévisionnels

**Formulaire en 5 Étapes** (Wizard):

##### **Étape 1: Informations Convention**
- Tous les champs de base (Numéro, Date, Type, Statut, Taux, Budget, Base de calcul, Libellé, Objet)

##### **Étape 2: Partenaires**
Table dynamique avec:

| Champ | Type | Description | Validation |
|-------|------|-------------|------------|
| **Partenaire** | Select | Liste des partenaires | Requis |
| **Budget (M)** | Number | Budget en millions de DH | Requis, > 0 |
| **Pourcentage (%)** | Number | % du budget total | Requis, 0-100 |
| **Commission d'Intervention** | Number | CI en M DH | Calculé automatiquement |

**Calcul automatique**: CI = Budget × Taux de commission

**Actions**:
- `partenaire_fields()` → Ajoute une ligne partenaire
- Total des pourcentages doit = 100%

##### **Étape 3: MO/MOD (Maîtres d'Œuvre)**
Deux tables dynamiques:

**Table Maître d'œuvre**:
- Liste des partenaires désignés comme MO
- Bouton `+` pour ajouter (`mo_fields()`)

**Table Maître d'œuvre Délégué**:
- Liste des partenaires désignés comme MOD
- Bouton `+` pour ajouter (`mod_fields()`)

##### **Étape 4: Imputations Prévisionnelles**
Table de répartition budgétaire:

| Champ | Type | Description | Validation |
|-------|------|-------------|------------|
| **Axe** | Select | Axe analytique | Requis |
| **Projet** | Select | Code projet | Requis |
| **Volet** | Select | Segment/Composante | Requis |
| **Date Démarrage** | Date | Date de début | Requis |
| **Délai** | Number | Durée en mois | Requis, > 0 |
| **Date fin prévue** | Date | Date de fin calculée | Auto-calculé |

**Calcul automatique**: Date fin = Date démarrage + Délai (mois)

**Actions**:
- `imputationprevisionnelle_fields()` → Ajoute une imputation

##### **Étape 5: Versements Prévisionnels**
Table de planification des paiements:

| Champ | Type | Description | Validation |
|-------|------|-------------|------------|
| **Axe** | Select | Axe du versement | Requis |
| **Projet** | Select | Projet concerné | Requis |
| **Volet** | Select | Segment concerné | Requis |
| **Date** | Date | Date du versement | Requis |
| **Montant** | Number (M DH) | Montant à verser | Requis, > 0 |
| **Partenaire** | Select | Partenaire bénéficiaire | Requis |
| **MOD** | Select | MOD responsable | Optionnel |

**Actions**:
- `versementperv_fields()` → Ajoute un versement prévisionnel
- Validation: Total versements ≤ Budget total convention

#### D. Convention Cadre Avenant (Amendment)
**Fichier**: `conventionCadreAvenant.html`

**Caractéristiques**:
- Modification d'une convention cadre existante
- Type fixé à "Avenant"
- Même structure que Convention Spécifique

**Champs**:
- Identiques à Convention Spécifique
- Type = "Avenant" (non modifiable)
- Référence à la convention cadre modifiée

---

### 2. Affichage et Gestion des Conventions

#### Liste des Conventions (`conventions.html`)

**Table principale** avec DataTables:

| Colonne | Description | Actions |
|---------|-------------|---------|
| **Numéro** | Numéro de convention | Cliquable → Détail |
| **Libellé** | Titre de la convention | |
| **Date** | Date de signature | Format: DD/MM/YYYY |
| **Type** | Cadre/Non-Cadre/Spécifique/Avenant | Badge coloré |
| **Statut** | Validée/En cours/Achevé/En retard/Annulé | Badge coloré |
| **Actions** | Modifier/Supprimer | Icônes |

**Fonctionnalités DataTables**:
- ✅ Recherche globale
- ✅ Tri par colonne
- ✅ Pagination (10/25/50/100 entrées)
- ✅ Export (Copier, CSV, Excel, PDF, Imprimer)
- ✅ Filtres personnalisés

#### Détail Convention

**Sections affichées**:

1. **Informations Générales**
   - Numérations: NUM1, NUM2, NUM3, NUM4
   - Dates clés
   - Budget et commission
   - Statut avec badge coloré

2. **Table Partenaires**
   - Liste des partenaires avec budgets et %
   - Commission d'intervention par partenaire
   - Total des allocations

3. **Listes MO/MOD**
   - Maîtres d'œuvre désignés
   - Maîtres d'œuvre délégués

4. **Table Imputations**
   - Axes, projets, segments
   - Dates de démarrage et fin
   - Délais planifiés

5. **Table Versements**
   - Dates et montants des versements
   - Partenaires bénéficiaires
   - MOD assignés

6. **Pièces Jointes**
   - Icône trombone (paperclip) indiquant les documents attachés

---

### 3. JavaScript - Fonctions Clés

#### Gestion Dynamique des Formulaires

```javascript
// Fonction: partenaire_fields()
// Description: Ajoute/supprime dynamiquement des lignes partenaires
// Déclencheur: Click sur bouton "+" dans section Partenaires
// Comportement:
//   - Clone la dernière ligne du tableau
//   - Incrémente les IDs/names des champs
//   - Réinitialise les valeurs
//   - Ajoute la nouvelle ligne au tableau
```

```javascript
// Fonction: mo_fields()
// Description: Ajoute/supprime des Maîtres d'Œuvre
// Déclencheur: Click sur bouton "+" dans section MO
```

```javascript
// Fonction: mod_fields()
// Description: Ajoute/supprime des Maîtres d'Œuvre Délégués
// Déclencheur: Click sur bouton "+" dans section MOD
```

```javascript
// Fonction: imputationprevisionnelle_fields()
// Description: Ajoute des lignes d'imputation budgétaire
// Déclencheur: Click sur bouton "+" dans section Imputations
// Logique:
//   - Calcul automatique de la date fin = date début + délai
//   - Validation des champs Axe/Projet/Volet
```

```javascript
// Fonction: versementperv_fields()
// Description: Ajoute des versements prévisionnels
// Déclencheur: Click sur bouton "+" dans section Versements
// Validation:
//   - Montant > 0
//   - Total versements ≤ Budget total
```

#### Système d'Inclusion HTML

```javascript
// Fichier: includeHtml.js
// Fonction: includeHTML()
// Description: Charge dynamiquement les fragments HTML
// Utilisation:
//   <div w3-include-html="common/topbar.html"></div>
//   <div w3-include-html="common/leftSideBarInside.html"></div>
//
// Fonctionnement:
//   1. Recherche tous les éléments avec attribut w3-include-html
//   2. Fait une requête XMLHttpRequest pour charger le fichier
//   3. Insère le contenu dans l'élément
//   4. Supprime l'attribut w3-include-html
//   5. Appel récursif pour charger les includes imbriqués
```

#### Bibliothèques JavaScript Utilisées

| Bibliothèque | Usage | Fichiers Affectés |
|--------------|-------|-------------------|
| **jQuery** | Manipulation DOM, AJAX | Toutes les pages |
| **jQuery Validation** | Validation de formulaires | Formulaires conventions |
| **DataTables** | Tables avec tri/recherche/pagination | conventions.html, marche.html, etc. |
| **jQuery Steps** | Wizards multi-étapes | conventionSpec.html |
| **Bootstrap JS** | Modals, dropdowns, tabs, collapse | Toutes les pages |
| **Dropzone** | Upload de fichiers | Pièces jointes |

---

## 🔗 Relations Inter-Modules

### Diagramme des Relations

```
┌─────────────────────────────────────────────────────────────┐
│                      CONVENTIONS                             │
│  (Module Central - Convention Cadre/Non-Cadre/Spécifique)  │
└───────┬─────────────┬──────────────┬────────────┬───────────┘
        │             │              │            │
        ↓             ↓              ↓            ↓
   ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
   │PARTENAIRES│  │ PROJETS │  │ MARCHÉS  │  │VERSEMENTS    │
   │         │  │         │  │          │  │RÉELS         │
   └─────────┘  └──────────┘  └──────────┘  └──────────────┘
        │             │              │            │
        │             │              ↓            │
        │             │         ┌─────────┐       │
        │             │         │  BONS   │       │
        │             │         │COMMANDE │       │
        │             │         └─────────┘       │
        │             │              │            │
        │             │              ↓            │
        │             │         ┌─────────┐       │
        │             └────────→│DÉCOMPTES│←──────┘
        │                       │(Factures)│
        └──────────────────────→└─────────┘
```

### Détail des Relations

#### 1. CONVENTIONS ↔ PARTENAIRES (Many-to-Many)

**Lien**:
- Une convention peut avoir plusieurs partenaires
- Un partenaire peut participer à plusieurs conventions

**Champs de liaison**:
```
Convention_Partenaire {
  convention_id: FK → Conventions.id
  partenaire_id: FK → Partenaires.id
  budget_alloue: DECIMAL(12,2)  // Budget en M DH
  pourcentage: DECIMAL(5,2)      // % du budget total
  commission_intervention: DECIMAL(12,2)  // CI en M DH
  role: ENUM('MO', 'MOD', 'Beneficiaire')  // Rôle du partenaire
}
```

**Cas d'usage**:
- Allocation budgétaire par partenaire
- Désignation des Maîtres d'Œuvre (MO/MOD)
- Calcul des commissions d'intervention

#### 2. CONVENTIONS ↔ PROJETS (Many-to-Many via Imputations)

**Lien**:
- Une convention finance plusieurs projets
- Un projet peut être financé par plusieurs conventions

**Table de jonction**: `Imputations`

```
Imputations {
  id: PK
  convention_id: FK → Conventions.id
  axe_id: FK → Axes.id
  projet_id: FK → Projets.id
  volet_id: FK → Volets.id
  date_demarrage: DATE
  delai_mois: INT
  date_fin_prevue: DATE  // Calculé: date_demarrage + delai_mois
}
```

**Hiérarchie**:
```
Axe (Programme)
  └── Projet
        └── Volet (Segment/Composante)
```

**Exemple**:
```
Axe: "Infrastructure Routière"
  Projet: "PR-2024-001 - Route Nationale N1"
    Volet: "Segment 1 - Tronçon Nord"
    Volet: "Segment 2 - Tronçon Sud"
```

#### 3. CONVENTIONS → VERSEMENTS RÉELS (One-to-Many)

**Lien**:
- Une convention a plusieurs versements réels
- Un versement appartient à une seule convention

**Champs**:
```
Versements_Reels {
  id: PK
  convention_id: FK → Conventions.id
  numero_convention: VARCHAR
  libelle: VARCHAR
  type: ENUM('Cadre', 'Non-Cadre', 'Spécifique', 'Avenant')
  montant_prevu: DECIMAL(12,2)
  montant_verse: DECIMAL(12,2)
  reste_a_verser: DECIMAL(12,2)  // Calculé: montant_prevu - montant_verse
  date_versement: DATE
  partenaire_id: FK → Partenaires.id
  mod_id: FK → Partenaires.id (role=MOD)
}
```

**Affichage** (`versementReel.html`):
- Tableau avec N° Convention, Libellé, Type, Montant prévu, Montant versé, Reste
- Lien vers `versementReelDetail.html` pour détails

#### 4. CONVENTIONS ↔ MARCHÉS (Indirect via Projets)

**Lien indirect**:
- Les conventions financent des projets
- Les projets génèrent des marchés publics
- Les marchés sont attribués à des fournisseurs (partenaires)

**Table Marchés**:
```
Marches {
  id: PK
  num_marche: VARCHAR UNIQUE
  num_ao: VARCHAR  // Numéro Appel d'Offres
  fournisseur_id: FK → Partenaires.id
  objet: TEXT
  montant_ttc: DECIMAL(12,2)
  projet_id: FK → Projets.id  // Lien indirect vers Convention
  statut: ENUM('En cours', 'Validé', 'Terminé', 'Annulé')
}
```

#### 5. MARCHÉS → BONS DE COMMANDE (One-to-Many)

**Lien**:
- Un marché génère plusieurs bons de commande
- Un bon de commande appartient à un seul marché

**Table Bons de Commande**:
```
Bons_Commande {
  id: PK
  numero: VARCHAR UNIQUE
  marche_id: FK → Marches.id
  num_consultation: VARCHAR
  date_approbation: DATE
  montant_ttc: DECIMAL(12,2)
  fournisseur_id: FK → Partenaires.id
}
```

#### 6. MARCHÉS → DÉCOMPTES (One-to-Many)

**Lien**:
- Un marché a plusieurs décomptes (factures progressives)
- Un décompte appartient à un seul marché

**Table Décomptes**:
```
Decomptes {
  id: PK
  marche_id: FK → Marches.id
  num_ao: VARCHAR
  montant: DECIMAL(12,2)
  montant_rg: DECIMAL(12,2)  // Retenue de Garantie
  fournisseur_id: FK → Partenaires.id
  date_decompte: DATE
  cumul: DECIMAL(12,2)  // Cumul des décomptes
}
```

**Page `cumulFactures.html`**:
- Affiche le cumul des décomptes par marché

### Flux de Données Complet

```
1. CRÉATION CONVENTION
   ↓
2. AJOUT PARTENAIRES + ALLOCATION BUDGETS
   ↓
3. DÉSIGNATION MO/MOD
   ↓
4. IMPUTATIONS BUDGÉTAIRES (Axe → Projet → Volet)
   ↓
5. VERSEMENTS PRÉVISIONNELS
   ↓
6. MARCHÉS PUBLICS (liés aux Projets)
   ↓
7. BONS DE COMMANDE
   ↓
8. DÉCOMPTES (Factures)
   ↓
9. VERSEMENTS RÉELS
   ↓
10. SUIVI BUDGÉTAIRE (Dashboard)
```

---

## 🎨 Spécifications Design

### 1. Palette de Couleurs

#### Couleurs Primaires

| Couleur | Hex Code | Usage | Exemple |
|---------|----------|-------|---------|
| **Primary Blue** | `#3cb0e5` | Actions principales, liens, boutons info | Bouton "Ajouter", liens cliquables |
| **Success Green** | `#80c342` | Actions positives, statut "Validée" | Badge "Validée", bouton "Enregistrer" |
| **Danger Red** | `#ff3b3b` | Erreurs, statut "En retard", suppression | Badge "En retard", bouton "Supprimer" |
| **Warning Orange** | `#f7931a` | Avertissements, statut "En cours" | Badge "En cours", alertes |
| **Info Cyan** | `#3cc8c8` | Informations complémentaires | En-têtes de section, tooltips |

#### Couleurs Secondaires

| Couleur | Hex Code | Usage |
|---------|----------|-------|
| **Dark Text** | `#202121` | Texte principal |
| **Dark Alt** | `#19191a` | Titres, headers |
| **Light Gray** | `#eeeeee` | Arrière-plans, bordures |
| **White** | `#ffffff` | Cartes, modales, arrière-plans |
| **Muted** | `rgba(0,0,0,0.54)` | Texte secondaire, labels |

#### Couleurs de Statut

| Statut | Couleur | Classe CSS | Badge |
|--------|---------|------------|-------|
| **Validée** | Vert `#80c342` | `.badge-success` | 🟢 Validée |
| **En cours** | Orange `#f7931a` | `.badge-orange` | 🟠 En cours |
| **Achevé** | Vert foncé | `.badge-success` | ✅ Achevé |
| **En retard** | Rouge `#ff3b3b` | `.badge-danger` | 🔴 En retard |
| **Annulé** | Gris | `.badge-secondary` | ⚫ Annulé |

#### Couleurs d'Arrière-plan de Cartes

```css
.bg-light-info { background-color: rgba(60, 200, 200, 0.1); }
.bg-light-success { background-color: rgba(128, 195, 66, 0.1); }
.bg-light-danger { background-color: rgba(255, 59, 59, 0.1); }
.bg-light-megna { background-color: rgba(1, 88, 139, 0.1); }
.bg-dark-success { background-color: #00c292; }
.bg-info { background-color: #3cc8c8; }
.bg-success { background-color: #80c342; }
```

### 2. Typographie

#### Polices

```css
/* Police principale */
font-family: 'Rubik', sans-serif;

/* Poids disponibles */
font-weight: 300;  /* Light */
font-weight: 400;  /* Regular */
font-weight: 500;  /* Medium */
font-weight: 700;  /* Bold */
font-weight: 900;  /* Black */
```

#### Classes de Texte

| Classe | Taille | Usage |
|--------|--------|-------|
| `.display-6` | ~36px | Titres principaux |
| `.display-7` | ~28px | Sous-titres |
| `h1` - `h6` | 32px - 14px | Hiérarchie de titres |
| `.font-12` | 12px | Labels de formulaires |
| `body` | 14px | Texte standard |

#### Styles de Texte

```css
.text-white { color: #fff; }
.text-dark { color: #202121; }
.text-muted { color: rgba(0,0,0,0.54); }
.text-info { color: #3cc8c8; }
.text-success { color: #80c342; }
.text-danger { color: #ff3b3b; }
.text-wrap { white-space: normal; }
.no-wrap { white-space: nowrap; }
```

### 3. Système de Grille Bootstrap 4

#### Conteneurs

```html
<!-- Conteneur pleine largeur -->
<div class="container-fluid">
  <!-- Rangée avec 12 colonnes -->
  <div class="row">
    <!-- Colonne responsive -->
    <div class="col-md-6 col-lg-4 col-xl-3">
      ...
    </div>
  </div>
</div>
```

#### Breakpoints

| Breakpoint | Taille | Classe |
|------------|--------|--------|
| **XS** | <576px | `.col-*` |
| **SM** | ≥576px | `.col-sm-*` |
| **MD** | ≥768px | `.col-md-*` |
| **LG** | ≥992px | `.col-lg-*` |
| **XL** | ≥1200px | `.col-xl-*` |

### 4. Composants UI

#### Cartes (Cards)

```html
<div class="card">
  <div class="card-header bg-info">
    <h4 class="text-white">Titre de la carte</h4>
  </div>
  <div class="card-body">
    <!-- Contenu -->
  </div>
</div>
```

**Variantes de headers**:
- `.bg-light-info` - Header cyan clair
- `.bg-light-success` - Header vert clair
- `.bg-light-danger` - Header rouge clair
- `.bg-info` - Header cyan foncé
- `.bg-success` - Header vert foncé

#### Boutons

```html
<!-- Bouton primaire vert -->
<button class="btn btn-success">Enregistrer</button>

<!-- Bouton outline -->
<button class="btn btn-outline-success">Ajouter</button>

<!-- Bouton avec icône -->
<button class="btn btn-success btn-rounded">
  <i class="fa fa-plus"></i> Nouveau
</button>

<!-- Bouton pleine largeur -->
<button class="btn btn-success btn-block">Soumettre</button>
```

**Classes de boutons**:
| Classe | Couleur | Usage |
|--------|---------|-------|
| `.btn-success` | Vert | Actions principales |
| `.btn-info` | Cyan | Actions informatives |
| `.btn-danger` | Rouge | Suppressions, annulations |
| `.btn-secondary` | Gris | Actions secondaires |
| `.btn-outline-*` | Bordure colorée | Actions alternatives |

#### Badges

```html
<span class="badge badge-success">Validée</span>
<span class="badge badge-orange">En cours</span>
<span class="badge badge-danger">En retard</span>
<span class="badge badge-pill badge-info">23</span>
```

#### Tables

```html
<div class="table-responsive">
  <table class="table table-striped table-bordered table-hover">
    <thead>
      <tr>
        <th>Colonne 1</th>
        <th>Colonne 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Donnée 1</td>
        <td>Donnée 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Options de tables**:
- `.table-striped` - Lignes alternées
- `.table-bordered` - Bordures
- `.table-hover` - Effet hover
- `.table-responsive` - Scroll horizontal mobile
- `.no-wrap` - Empêcher retour à la ligne

#### Formulaires

```html
<div class="form-group">
  <label class="col-form-label font-12">Libellé</label>
  <input type="text" class="form-control" placeholder="Entrez...">
</div>

<div class="form-group">
  <label class="col-form-label font-12">Statut</label>
  <select class="form-control">
    <option>Validée</option>
    <option>En cours</option>
  </select>
</div>

<div class="form-group">
  <label class="col-form-label font-12">Description</label>
  <textarea class="form-control" rows="4"></textarea>
</div>
```

#### Modales

```html
<div class="modal fade" id="myModal" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-full-width" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Titre</h4>
        <button type="button" class="close" data-dismiss="modal">
          <span>&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <!-- Contenu -->
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-dismiss="modal">
          Fermer
        </button>
        <button class="btn btn-success">Enregistrer</button>
      </div>
    </div>
  </div>
</div>
```

**Tailles de modales**:
- `.modal-sm` - Petite
- `.modal-lg` - Grande
- `.modal-full-width` - Pleine largeur

#### Onglets (Tabs)

```html
<ul class="nav nav-tabs nav-justified" role="tablist">
  <li class="nav-item">
    <a class="nav-link active" data-toggle="tab" href="#tab1">
      Onglet 1
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link" data-toggle="tab" href="#tab2">
      Onglet 2
    </a>
  </li>
</ul>

<div class="tab-content">
  <div class="tab-pane active" id="tab1">
    Contenu onglet 1
  </div>
  <div class="tab-pane" id="tab2">
    Contenu onglet 2
  </div>
</div>
```

#### Wizards (Multi-étapes)

```html
<form id="example-form" class="wizard-content">
  <h3>Étape 1</h3>
  <section>
    <!-- Contenu étape 1 -->
  </section>

  <h3>Étape 2</h3>
  <section>
    <!-- Contenu étape 2 -->
  </section>

  <h3>Étape 3</h3>
  <section>
    <!-- Contenu étape 3 -->
  </section>
</form>

<script>
$("#example-form").steps({
  headerTag: "h3",
  bodyTag: "section",
  transitionEffect: "slideLeft",
  autoFocus: true
});
</script>
```

### 5. Espacements (Margins & Padding)

#### Classes Bootstrap 4

```css
/* Marges */
.m-0 { margin: 0; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-3 { margin: 1rem; }
.m-4 { margin: 1.5rem; }
.m-5 { margin: 3rem; }

/* Marges spécifiques */
.mt-* { margin-top: *; }
.mb-* { margin-bottom: *; }
.ml-* { margin-left: *; }
.mr-* { margin-right: *; }
.mx-* { margin-left + margin-right: *; }
.my-* { margin-top + margin-bottom: *; }

/* Padding */
.p-0 { padding: 0; }
.p-3 { padding: 1rem; }
.p-4 { padding: 1.5rem; }

/* Classes custom */
.m-t-30 { margin-top: 30px; }
.m-b-0 { margin-bottom: 0; }
```

### 6. Icônes Font Awesome

```html
<!-- Icônes courantes -->
<i class="fa fa-plus"></i>           <!-- Ajouter -->
<i class="fa fa-edit"></i>           <!-- Modifier -->
<i class="fa fa-trash"></i>          <!-- Supprimer -->
<i class="fa fa-eye"></i>            <!-- Voir -->
<i class="fa fa-download"></i>       <!-- Télécharger -->
<i class="fa fa-upload"></i>         <!-- Uploader -->
<i class="fa fa-paperclip"></i>      <!-- Pièce jointe -->
<i class="fa fa-check"></i>          <!-- Valider -->
<i class="fa fa-times"></i>          <!-- Fermer/Annuler -->
<i class="fa fa-search"></i>         <!-- Rechercher -->
```

### 7. Layout Global

#### Structure de Page Complète

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>XCOMPTA - Conventions</title>
  <link href="../dist/css/style.min.css" rel="stylesheet">
</head>
<body class="fix-header fix-sidebar card-no-border">
  <!-- Preloader -->
  <div class="preloader">
    <svg class="circular">...</svg>
  </div>

  <!-- Main wrapper -->
  <div id="main-wrapper">

    <!-- Topbar -->
    <div w3-include-html="common/topbar.html"></div>

    <!-- Left Sidebar -->
    <div w3-include-html="common/leftSideBarInside.html"></div>

    <!-- Page wrapper -->
    <div class="page-wrapper">

      <!-- Container fluid -->
      <div class="container-fluid">

        <!-- Breadcrumb -->
        <div class="row page-titles">
          <div class="col-md-5 align-self-center">
            <h3 class="text-primary">Conventions</h3>
          </div>
          <div class="col-md-7 align-self-center">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a href="dashbord.html">Accueil</a>
              </li>
              <li class="breadcrumb-item active">Conventions</li>
            </ol>
          </div>
        </div>

        <!-- Contenu principal -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <!-- Votre contenu ici -->
              </div>
            </div>
          </div>
        </div>

      </div>
      <!-- End Container fluid -->

    </div>
    <!-- End Page wrapper -->

  </div>
  <!-- End Main wrapper -->

  <script src="../dist/js/jquery.min.js"></script>
  <script src="../dist/js/bootstrap.min.js"></script>
  <script src="common/includeHtml.js"></script>
  <script>includeHTML();</script>
</body>
</html>
```

---

## 🚀 Guide d'Implémentation pour InvestPro Maroc

### Objectifs

Adapter le design et les fonctionnalités de XCOMPTA dans InvestPro Maroc en utilisant:
- **Backend**: Kotlin + Spring Boot (déjà en place)
- **Frontend**: React + TypeScript + Tailwind CSS (déjà en place)

### 1. Mapping des Entités

#### Convention → DepenseInvestissement

Le concept de "Convention" dans XCOMPTA correspond aux **Dépenses d'Investissement** dans InvestPro Maroc.

**Champs à ajouter/mapper**:

| XCOMPTA Convention | InvestPro DepenseInvestissement | Action |
|-------------------|----------------------------------|--------|
| Numéro | numeroFacture | ✅ Existe |
| Date | dateFacture | ✅ Existe |
| Type (Cadre/Non-Cadre/Spécifique/Avenant) | **NOUVEAU** typeDepense | ➕ À ajouter |
| Statut | **NOUVEAU** statut | ➕ À ajouter |
| Taux | **NOUVEAU** tauxCommission | ➕ À ajouter |
| Budget | montantHT | ✅ Existe |
| Base de calcul | **NOUVEAU** baseCalcul | ➕ À ajouter |
| Libellé | designation | ✅ Existe |
| Objet | **NOUVEAU** objet (TEXT) | ➕ À ajouter |

#### Partenaire → Fournisseur

**Déjà mappé**: Les partenaires XCOMPTA = Fournisseurs InvestPro

**Champs à vérifier**:
- Nom/Raison sociale ✅
- ICE ✅
- Adresse ✅
- Contact ✅

#### Projet → Projet

**Déjà mappé**: Structure similaire

**Hiérarchie à implémenter**:
```
AxeAnalytique (Programme)
  └── Projet
        └── **NOUVEAU** Volet/Segment
```

**Action**: Créer entité `Segment` ou `Volet`:
```kotlin
@Entity
@Table(name = "segments")
data class Segment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val code: String,
    val libelle: String,

    @ManyToOne
    @JoinColumn(name = "projet_id")
    val projet: Projet
)
```

### 2. Modifications Backend (Kotlin)

#### A. Ajouter Champs à `DepenseInvestissement`

```kotlin
// backend/src/main/kotlin/ma/investpro/entity/DepenseInvestissement.kt

@Entity
@Table(name = "depenses_investissement")
data class DepenseInvestissement(
    // ... champs existants ...

    // NOUVEAUX CHAMPS inspirés de XCOMPTA
    @Column(name = "type_depense")
    @Enumerated(EnumType.STRING)
    val typeDepense: TypeDepense = TypeDepense.STANDARD,

    @Column(name = "statut")
    @Enumerated(EnumType.STRING)
    val statut: StatutDepense = StatutDepense.EN_COURS,

    @Column(name = "taux_commission")
    val tauxCommission: BigDecimal? = null,

    @Column(name = "base_calcul")
    @Enumerated(EnumType.STRING)
    val baseCalcul: BaseCalcul = BaseCalcul.TTC,

    @Column(name = "objet", columnDefinition = "TEXT")
    val objet: String? = null,

    @Column(name = "date_demarrage")
    val dateDemarrage: LocalDate? = null,

    @Column(name = "delai_mois")
    val delaiMois: Int? = null,

    @Column(name = "date_fin_prevue")
    val dateFinPrevue: LocalDate? = null
)

enum class TypeDepense {
    STANDARD,
    CADRE,
    NON_CADRE,
    SPECIFIQUE,
    AVENANT
}

enum class StatutDepense {
    VALIDEE,
    EN_COURS,
    ACHEVE,
    EN_RETARD,
    ANNULE
}

enum class BaseCalcul {
    TTC,
    HT
}
```

#### B. Créer Entité `MaitreOeuvre`

```kotlin
// backend/src/main/kotlin/ma/investpro/entity/MaitreOeuvre.kt

@Entity
@Table(name = "maitres_oeuvre")
data class MaitreOeuvre(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne
    @JoinColumn(name = "depense_id")
    val depense: DepenseInvestissement,

    @ManyToOne
    @JoinColumn(name = "fournisseur_id")
    val fournisseur: Fournisseur,

    @Column(name = "type_mo")
    @Enumerated(EnumType.STRING)
    val typeMo: TypeMaitreOeuvre = TypeMaitreOeuvre.MO
)

enum class TypeMaitreOeuvre {
    MO,      // Maître d'Œuvre
    MOD      // Maître d'Œuvre Délégué
}
```

#### C. Créer Entité `Imputation`

```kotlin
// backend/src/main/kotlin/ma/investpro/entity/Imputation.kt

@Entity
@Table(name = "imputations")
data class Imputation(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne
    @JoinColumn(name = "depense_id")
    val depense: DepenseInvestissement,

    @ManyToOne
    @JoinColumn(name = "axe_analytique_id")
    val axeAnalytique: AxeAnalytique,

    @ManyToOne
    @JoinColumn(name = "projet_id")
    val projet: Projet,

    @ManyToOne
    @JoinColumn(name = "segment_id")
    val segment: Segment? = null,

    @Column(name = "date_demarrage")
    val dateDemarrage: LocalDate,

    @Column(name = "delai_mois")
    val delaiMois: Int,

    @Column(name = "date_fin_prevue")
    val dateFinPrevue: LocalDate  // Calculé: dateDemarrage + delaiMois
)
```

#### D. Créer Migration Flyway

```sql
-- backend/src/main/resources/db/migration/V7__add_xcompta_features.sql

-- Ajouter colonnes à depenses_investissement
ALTER TABLE depenses_investissement
ADD COLUMN type_depense VARCHAR(20) DEFAULT 'STANDARD',
ADD COLUMN statut VARCHAR(20) DEFAULT 'EN_COURS',
ADD COLUMN taux_commission DECIMAL(5,2),
ADD COLUMN base_calcul VARCHAR(10) DEFAULT 'TTC',
ADD COLUMN objet TEXT,
ADD COLUMN date_demarrage DATE,
ADD COLUMN delai_mois INT,
ADD COLUMN date_fin_prevue DATE;

-- Créer table segments
CREATE TABLE segments (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    projet_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE
);

-- Créer table maitres_oeuvre
CREATE TABLE maitres_oeuvre (
    id BIGSERIAL PRIMARY KEY,
    depense_id BIGINT NOT NULL,
    fournisseur_id BIGINT NOT NULL,
    type_mo VARCHAR(10) NOT NULL DEFAULT 'MO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (depense_id) REFERENCES depenses_investissement(id) ON DELETE CASCADE,
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE CASCADE
);

-- Créer table imputations
CREATE TABLE imputations (
    id BIGSERIAL PRIMARY KEY,
    depense_id BIGINT NOT NULL,
    axe_analytique_id BIGINT NOT NULL,
    projet_id BIGINT NOT NULL,
    segment_id BIGINT,
    date_demarrage DATE NOT NULL,
    delai_mois INT NOT NULL,
    date_fin_prevue DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (depense_id) REFERENCES depenses_investissement(id) ON DELETE CASCADE,
    FOREIGN KEY (axe_analytique_id) REFERENCES axes_analytiques(id) ON DELETE CASCADE,
    FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
    FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL
);

-- Créer indexes
CREATE INDEX idx_segments_projet ON segments(projet_id);
CREATE INDEX idx_maitres_oeuvre_depense ON maitres_oeuvre(depense_id);
CREATE INDEX idx_imputations_depense ON imputations(depense_id);
```

### 3. Modifications Frontend (React + Tailwind)

#### A. Adapter la Palette de Couleurs

Créer fichier de configuration Tailwind avec les couleurs XCOMPTA:

```javascript
// frontend/tailwind.config.js

module.exports = {
  theme: {
    extend: {
      colors: {
        // Couleurs XCOMPTA
        'xcompta-blue': '#3cb0e5',
        'xcompta-green': '#80c342',
        'xcompta-red': '#ff3b3b',
        'xcompta-orange': '#f7931a',
        'xcompta-cyan': '#3cc8c8',

        // Alias pour usage facile
        'primary': '#3cb0e5',
        'success': '#80c342',
        'danger': '#ff3b3b',
        'warning': '#f7931a',
        'info': '#3cc8c8',
      },
      fontFamily: {
        'rubik': ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

**Ajouter Google Font Rubik**:

```html
<!-- frontend/index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700;900&display=swap" rel="stylesheet">
```

#### B. Créer Composants Réutilisables Style XCOMPTA

##### Badge de Statut

```typescript
// frontend/src/components/ui/StatusBadge.tsx

interface StatusBadgeProps {
  status: 'VALIDEE' | 'EN_COURS' | 'ACHEVE' | 'EN_RETARD' | 'ANNULE'
}

const statusConfig = {
  VALIDEE: {
    label: 'Validée',
    className: 'bg-success text-white',
    icon: '🟢'
  },
  EN_COURS: {
    label: 'En cours',
    className: 'bg-warning text-white',
    icon: '🟠'
  },
  ACHEVE: {
    label: 'Achevé',
    className: 'bg-success text-white',
    icon: '✅'
  },
  EN_RETARD: {
    label: 'En retard',
    className: 'bg-danger text-white',
    icon: '🔴'
  },
  ANNULE: {
    label: 'Annulé',
    className: 'bg-gray-500 text-white',
    icon: '⚫'
  }
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  )
}
```

##### Card avec Header Coloré

```typescript
// frontend/src/components/ui/XcomptaCard.tsx

interface XcomptaCardProps {
  title: string
  headerColor?: 'info' | 'success' | 'danger' | 'primary'
  children: React.ReactNode
}

const headerColors = {
  info: 'bg-info text-white',
  success: 'bg-success text-white',
  danger: 'bg-danger text-white',
  primary: 'bg-primary text-white'
}

export const XcomptaCard = ({ title, headerColor = 'info', children }: XcomptaCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`px-6 py-4 ${headerColors[headerColor]}`}>
        <h4 className="text-lg font-medium">{title}</h4>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
```

##### Boutons Style XCOMPTA

```typescript
// frontend/src/components/ui/XcomptaButton.tsx

interface XcomptaButtonProps {
  variant?: 'success' | 'danger' | 'info' | 'secondary' | 'outline-success'
  children: React.ReactNode
  onClick?: () => void
  icon?: React.ReactNode
  fullWidth?: boolean
}

const variants = {
  'success': 'bg-success hover:bg-green-600 text-white',
  'danger': 'bg-danger hover:bg-red-600 text-white',
  'info': 'bg-info hover:bg-cyan-600 text-white',
  'secondary': 'bg-gray-500 hover:bg-gray-600 text-white',
  'outline-success': 'border-2 border-success text-success hover:bg-success hover:text-white'
}

export const XcomptaButton = ({
  variant = 'success',
  children,
  onClick,
  icon,
  fullWidth = false
}: XcomptaButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-md font-medium transition-colors
        inline-flex items-center justify-center gap-2
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}
```

#### C. Formulaire Multi-Étapes (Wizard)

Installer library pour wizards:

```bash
npm install react-step-wizard
```

```typescript
// frontend/src/components/depenses/DepenseWizard.tsx

import StepWizard from 'react-step-wizard'

export const DepenseWizard = () => {
  return (
    <StepWizard>
      {/* Étape 1: Informations générales */}
      <Step1InfosGenerales />

      {/* Étape 2: Partenaires */}
      <Step2Partenaires />

      {/* Étape 3: Maîtres d'œuvre */}
      <Step3MaitresOeuvre />

      {/* Étape 4: Imputations */}
      <Step4Imputations />

      {/* Étape 5: Versements */}
      <Step5Versements />
    </StepWizard>
  )
}

// Exemple Étape 1
const Step1InfosGenerales = ({ nextStep }: any) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Informations Générales
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-600">Numéro</label>
          <input type="text" className="form-input w-full" />
        </div>

        <div>
          <label className="text-xs text-gray-600">Date</label>
          <input type="date" className="form-input w-full" />
        </div>

        <div>
          <label className="text-xs text-gray-600">Type</label>
          <select className="form-select w-full">
            <option>Standard</option>
            <option>Cadre</option>
            <option>Non-Cadre</option>
            <option>Spécifique</option>
            <option>Avenant</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Statut</label>
          <select className="form-select w-full">
            <option>En cours</option>
            <option>Validée</option>
            <option>Achevé</option>
            <option>En retard</option>
            <option>Annulé</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Taux Commission (%)</label>
          <input type="number" step="0.01" className="form-input w-full" />
        </div>

        <div>
          <label className="text-xs text-gray-600">Budget (M DH)</label>
          <input type="number" step="0.01" className="form-input w-full" />
        </div>

        <div>
          <label className="text-xs text-gray-600">Base de Calcul</label>
          <select className="form-select w-full">
            <option>Décaissements TTC</option>
            <option>Décaissements HT</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="text-xs text-gray-600">Libellé</label>
          <input type="text" className="form-input w-full" />
        </div>

        <div className="col-span-2">
          <label className="text-xs text-gray-600">Objet</label>
          <textarea rows={4} className="form-textarea w-full" />
        </div>
      </div>

      <div className="flex justify-end">
        <XcomptaButton onClick={nextStep}>
          Suivant →
        </XcomptaButton>
      </div>
    </div>
  )
}
```

#### D. Table avec Actions Dynamiques (Partenaires)

```typescript
// frontend/src/components/depenses/PartenairesTable.tsx

import { useState } from 'react'
import { FaPlus, FaMinus } from 'react-icons/fa'

interface Partenaire {
  id: string
  fournisseurId: number
  budget: number
  pourcentage: number
  commissionIntervention: number
}

export const PartenairesTable = () => {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([
    { id: '1', fournisseurId: 0, budget: 0, pourcentage: 0, commissionIntervention: 0 }
  ])

  const addPartenaire = () => {
    const newPartenaire: Partenaire = {
      id: Date.now().toString(),
      fournisseurId: 0,
      budget: 0,
      pourcentage: 0,
      commissionIntervention: 0
    }
    setPartenaires([...partenaires, newPartenaire])
  }

  const removePartenaire = (id: string) => {
    setPartenaires(partenaires.filter(p => p.id !== id))
  }

  const updatePartenaire = (id: string, field: keyof Partenaire, value: any) => {
    setPartenaires(partenaires.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">Partenaires</h4>
        <XcomptaButton
          variant="outline-success"
          onClick={addPartenaire}
          icon={<FaPlus />}
        >
          Ajouter Partenaire
        </XcomptaButton>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-info text-white">
            <tr>
              <th className="px-4 py-2 text-left">Partenaire</th>
              <th className="px-4 py-2 text-left">Budget (M DH)</th>
              <th className="px-4 py-2 text-left">Pourcentage (%)</th>
              <th className="px-4 py-2 text-left">CI (M DH)</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partenaires.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  <select
                    className="form-select w-full"
                    value={p.fournisseurId}
                    onChange={(e) => updatePartenaire(p.id, 'fournisseurId', Number(e.target.value))}
                  >
                    <option value={0}>Sélectionner...</option>
                    {/* Map fournisseurs here */}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    step="0.01"
                    className="form-input w-full"
                    value={p.budget}
                    onChange={(e) => updatePartenaire(p.id, 'budget', Number(e.target.value))}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    step="0.01"
                    className="form-input w-full"
                    value={p.pourcentage}
                    onChange={(e) => updatePartenaire(p.id, 'pourcentage', Number(e.target.value))}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    step="0.01"
                    className="form-input w-full"
                    value={p.commissionIntervention}
                    onChange={(e) => updatePartenaire(p.id, 'commissionIntervention', Number(e.target.value))}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => removePartenaire(p.id)}
                    className="text-danger hover:text-red-700"
                    disabled={partenaires.length === 1}
                  >
                    <FaMinus />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Validation: Total pourcentages */}
      <div className="mt-2 text-sm">
        <span className="font-semibold">Total pourcentages: </span>
        <span className={
          partenaires.reduce((sum, p) => sum + p.pourcentage, 0) === 100
            ? 'text-success'
            : 'text-danger'
        }>
          {partenaires.reduce((sum, p) => sum + p.pourcentage, 0).toFixed(2)}%
        </span>
      </div>
    </div>
  )
}
```

### 4. Checklist d'Implémentation

#### Backend ✅

- [ ] Ajouter champs à `DepenseInvestissement` (typeDepense, statut, tauxCommission, etc.)
- [ ] Créer entité `Segment` avec relation vers `Projet`
- [ ] Créer entité `MaitreOeuvre` avec relations vers `DepenseInvestissement` et `Fournisseur`
- [ ] Créer entité `Imputation` avec relations vers `DepenseInvestissement`, `AxeAnalytique`, `Projet`, `Segment`
- [ ] Créer migration Flyway V7
- [ ] Mettre à jour DTOs (`DepenseInvestissementDTO`, etc.)
- [ ] Mettre à jour services (`DepenseInvestissementService`)
- [ ] Mettre à jour controllers avec nouveaux endpoints
- [ ] Ajouter validation (@Valid, @NotNull, etc.)
- [ ] Tester avec Postman/Swagger

#### Frontend ✅

- [ ] Configurer Tailwind avec couleurs XCOMPTA
- [ ] Ajouter Google Font Rubik
- [ ] Créer composant `StatusBadge`
- [ ] Créer composant `XcomptaCard`
- [ ] Créer composant `XcomptaButton`
- [ ] Créer composant `DepenseWizard` (multi-étapes)
- [ ] Créer composant `PartenairesTable` (dynamique)
- [ ] Créer composant `MaitresOeuvreTable`
- [ ] Créer composant `ImputationsTable`
- [ ] Créer composant `VersementsTable`
- [ ] Mettre à jour page liste dépenses avec nouveaux filtres (Type, Statut)
- [ ] Mettre à jour page détail dépense avec nouvelles sections
- [ ] Intégrer avec API backend
- [ ] Tester responsive design

#### Design ✅

- [ ] Remplacer couleurs primaires par palette XCOMPTA
- [ ] Appliquer police Rubik
- [ ] Ajouter badges de statut colorés
- [ ] Utiliser cards avec headers colorés
- [ ] Adapter boutons au style XCOMPTA
- [ ] Assurer cohérence des espacements
- [ ] Tester sur mobile/tablette

---

## 📚 Résumé des Champs Complets

### Convention (Tous Types Confondus)

**Champs de Base** (9 champs):
1. Numéro
2. Date
3. Type (Cadre/Non-Cadre/Spécifique/Avenant)
4. Statut (Validée/En cours/Achevé/En retard/Annulé)
5. Taux (%)
6. Budget (M DH)
7. Base de calcul (TTC/HT)
8. Libellé
9. Objet

**Partenaires** (4 champs par partenaire):
1. Partenaire (Select)
2. Budget (M DH)
3. Pourcentage (%)
4. Commission d'Intervention (M DH)

**Maîtres d'Œuvre** (2 types):
1. Maître d'œuvre (MO)
2. Maître d'œuvre Délégué (MOD)

**Imputations** (6 champs par imputation):
1. Axe
2. Projet
3. Volet
4. Date Démarrage
5. Délai (mois)
6. Date fin prévue

**Versements** (6 champs par versement):
1. Axe
2. Projet
3. Volet
4. Date
5. Montant (M DH)
6. Partenaire
7. MOD

**Total**: 32 champs uniques + tables dynamiques (partenaires, MO/MOD, imputations, versements)

---

## 🎯 Points Clés pour InvestPro Maroc

### Différences Conceptuelles

| XCOMPTA | InvestPro Maroc |
|---------|-----------------|
| Convention | Dépense d'Investissement |
| Partenaire | Fournisseur |
| Commission d'Intervention | Commission calculée |
| Maître d'Œuvre | **Nouveau concept** à implémenter |
| Imputation budgétaire | Lien Axe-Projet (**étendre avec Segment**) |
| Versement prévisionnel | **Nouveau concept** à implémenter |
| Décompte | Facture (similaire) |

### Fonctionnalités Manquantes à Implémenter

1. **Wizards Multi-Étapes**: Formulaires complexes en plusieurs étapes
2. **Tables Dynamiques**: Ajout/suppression de lignes (partenaires, MO/MOD, imputations)
3. **Calculs Automatiques**:
   - Commission = Budget × Taux
   - Date fin = Date début + Délai
   - Total pourcentages = 100%
4. **Badges de Statut Colorés**: Visualisation rapide des états
5. **Hiérarchie Axe → Projet → Segment**: Structure à 3 niveaux
6. **Gestion des Maîtres d'Œuvre**: Désignation MO/MOD par projet
7. **Suivi des Versements**: Planification vs Réalisé

### Design à Adopter

✅ **Couleurs**: Palette XCOMPTA (bleu, vert, orange, rouge, cyan)
✅ **Police**: Rubik (Google Font)
✅ **Cards**: Headers colorés avec badges
✅ **Boutons**: Style arrondi avec icônes
✅ **Tables**: Bordures, striped, hover effects
✅ **Modales**: Pleine largeur pour formulaires complexes
✅ **Wizards**: Indicateurs d'étapes avec cercles numérotés

---

## 📖 Conclusion

Cette documentation couvre exhaustivement:

- ✅ **Structure complète** de l'application XCOMPTA
- ✅ **Tous les champs** des conventions (32 champs uniques documentés)
- ✅ **Relations entre modules** (conventions, partenaires, projets, marchés, versements)
- ✅ **JavaScript functions** (partenaire_fields, mo_fields, mod_fields, etc.)
- ✅ **Design complet** (couleurs, typographie, composants UI)
- ✅ **Guide d'implémentation** pour InvestPro Maroc (backend + frontend)

**Prochaines étapes recommandées**:

1. Commencer par les migrations backend (Flyway V7)
2. Implémenter les nouvelles entités (Segment, MaitreOeuvre, Imputation)
3. Adapter le frontend avec la palette de couleurs XCOMPTA
4. Créer les composants réutilisables (StatusBadge, XcomptaCard, etc.)
5. Implémenter le wizard multi-étapes pour les dépenses complexes
6. Tester l'intégration complète

---

**Auteur**: Documentation générée par analyse approfondie du code legacy XCOMPTA
**Date**: 2025-12-27
**Version**: 1.0
