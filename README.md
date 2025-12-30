# 🏦 InvestPro Maroc - Gestion Intelligente des Dépenses d'Investissement

> **Plateforme complète de gestion des dépenses d'investissement et calcul automatique des commissions d'intervention**

[![Kotlin](https://img.shields.io/badge/Kotlin-2.0.21-purple?logo=kotlin)](https://kotlinlang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-green?logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue?logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

---

## 📋 Table des Matières

1. [Architecture Métier](#-architecture-métier)
2. [Workflow Conventions](#-workflow-conventions)
3. [Modèle de Données](#-modèle-de-données)
4. [Fonctionnalités Implémentées](#-fonctionnalités-implémentées)
5. [Fonctionnalités Manquantes](#-fonctionnalités-manquantes)
6. [Stack Technique](#️-stack-technique)
7. [Déploiement](#-déploiement)

---

## 📐 Architecture Métier

### Vue d'ensemble

InvestPro Maroc est un système de gestion budgétaire et financière pour les projets d'investissement au Maroc. Il gère le cycle de vie complet des conventions, marchés, engagements et paiements.

### Concepts Clés

#### 1. **Convention** (Cadre juridique)
Convention d'intervention définissant les modalités de calcul et paiement des commissions.

**Types de conventions:**
- **Convention Cadre** - Convention générique réutilisable
- **Convention Spécifique** - Convention pour un projet spécifique
- **Convention Non-Cadre** - Convention hors cadre standard
- **Sous-Convention** - Hérite d'une convention parente
- **Avenant** - Modification d'une convention existante

#### 2. **Projet** (Opération/Programme)
Programme d'investissement avec budget et axes analytiques.

#### 3. **Marché** (Engagement contractuel)
Contrat avec un fournisseur pour travaux/fournitures/services.

**Hiérarchie:**
```
CONVENTION
  └─ MARCHE (1..n)
       ├─ MARCHE_LIGNE (1..n)
       ├─ AVENANT_MARCHE (0..n)
       └─ DECOMPTE (0..n)
            ├─ DECOMPTE_RETENUE (0..n)
            └─ DECOMPTE_IMPUTATION (1..n)
                 └─ PAIEMENT (1..n)
                      └─ PAIEMENT_IMPUTATION (option)
```

#### 4. **Budget** (Enveloppe financière)
- **Plafond Convention** - Budget global alloué
- **Budget Initial (V0)** - Baseline de référence
- **Révisions Budgétaires (V1, V2...)** - Ajustements et contrôle
- **Budget Validé** - Dernière version consolidée

#### 5. **Engagement** (Marché ou BC)
Engagement ferme de dépense (marché public ou bon de commande).

#### 6. **Décompte** (Situation de travaux)
État d'avancement des travaux avec retenues et garanties.

**Types de décomptes:**
- **Décompte Retenue** - Garantie, RAS, pénalités, avances
- **Décompte Imputation** - Ventilation par projet/axe/budget

#### 7. **Paiement** (Ordre de paiement)
Instruction de paiement effectif au fournisseur.

---

## 🔄 Workflow Conventions

### Schéma 1: Cycle de Vie Convention

```
┌──────────────────────────────────────────────────────────────────┐
│  0) DÉMARRER                                                     │
│  Choisir:                                                        │
│    - Convention cadre                                            │
│    - Convention spécifique                                       │
│    - Convention non cadre                                        │
│    (+ option: sous-convention)                                   │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  1) CRÉER EN BROUILLON                                           │
│  Statut: BROUILLON                                               │
│  Saisie:                                                         │
│    - Identité (objet, dates, ref)                               │
│    - Montants + détail                                           │
│    - Commission (base, taux, etc)                                │
│    - Subventions (échéancier)                                    │
│    - Partenaires                                                 │
│  Contrôles: champs obligatoires                                  │
└──────────────────────────────────────────────────────────────────┘
                            ↓
            ┌───────────────┴────────────────┐
            │                                │
┌───────────▼──────────┐       ┌─────────────▼────────────────────┐
│  2A) SAUVEGARDER     │       │  2B) SOUMETTRE À VALIDATION      │
│  rester BROUILLON    │       │  Passage: BROUILLON → SOUMIS     │
└──────────────────────┘       │  Contrôles:                      │
                               │    - Cohérence montants          │
                               │    - Commission paramétrée       │
                               │    - Pièces jointes (PDF) ?      │
                               └──────────────────────────────────┘
                                              ↓
                               ┌──────────────────────────────────┐
                               │  3) VALIDATION                   │
                               │  Passage: SOUMIS → VALIDÉE       │
                               │  Effets:                         │
                               │    - Version créée: V0           │
                               │    - Verrouillage des champs     │
                               │      "sensibles" (montants/CI)   │
                               │    - Génération fiche synthèse   │
                               └──────────────────────────────────┘
                                              ↓
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
┌───────────────────▼────────────┐              ┌────────────────────────▼─────────┐
│  4) GÉRER LES SOUS-CONVENTIONS │              │  5) GÉRER LES AVENANTS          │
│  (enfants)                     │              │  (modifs/compléments)           │
│  Action: "Créer sous-conv."    │              │  Action: "Créer avenant"        │
│  Statut: BROUILLON             │              │  Statut: BROUILLON              │
│  Hérite du parent:             │              │  Saisie:                        │
│    - partenaires               │              │    - N° avenant / dates         │
│    - paramètres par défaut     │              │    - objet / motif              │
│  Peut surcharger:              │              │    - impacts: montants/CI/délais│
│    - montants                  │              │    - détails: AVANT / APRÈS     │
│    - commission                │              │    - pièce jointe avenant       │
│    - subventions               │              └─────────────────────────────────┘
└────────────────────────────────┘                              ↓
                    ↓                              ┌────────────────────────────────┐
┌───────────────────────────────┐                 │  6) VALIDER L'AVENANT          │
│  4B) VALIDER SOUS-CONVENTION  │                 │  Passage: BROUILLON → SOUMIS   │
│  Passage: BROUILLON→SOUMIS    │                 │  puis SOUMIS → VALIDE          │
│  Effets: Version V0 enfant    │                 │  Effets:                       │
└───────────────────────────────┘                 │    - création version V1, V2...│
                    ↓                              │    - FACULTATIF "version consolidée"│
┌───────────────────────────────┐                 │    - traçabilité complète      │
│  7) VERSION CONSOLIDÉE        │                 └────────────────────────────────┘
│  (Convention + avenants validés)│                              ↓
│  Règle:                       │                 ┌────────────────────────────────┐
│  Vn = V0 + avenants validés   │                 │  8) SORTIES / ÉTATS            │
│  Ordre: date_effet puis numéro│                 │    - Fiche convention (Vn)     │
└───────────────────────────────┘                 │    - Fiche commission (Vn)     │
                    ↓                              │    - Historique versions       │
┌───────────────────────────────┐                 │    - Liste sous-conventions    │
│  9) CLÔTURE (option)          │                 └────────────────────────────────┘
│  Statut: CLOTUREE             │
│  Effets: lecture seule        │
│  (plus d'avenants possibles)  │
└───────────────────────────────┘
```

### Statuts Convention
- **BROUILLON** - En cours de saisie
- **SOUMIS** - Soumis pour validation
- **VALIDEE** - Convention active
- **CLOTUREE** - Convention terminée (lecture seule)

---

## 📊 Modèle de Données

### Schéma 2: Référentiel Conventions

```
                      ┌────────────────────────┐
                      │ RÉFÉRENTIEL CONVENTIONS│
                      └──────────┬─────────────┘
                                 ↓
                      ┌─────────────────────────┐
                      │  CONVENTION (RACINE)    │
                      │  Type:                  │
                      │    - Convention cadre   │
                      │    - Convention spécifique│
                      │    - Convention non cadre│
                      └──────────┬──────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼─────────┐   ┌─────────▼────────┐    ┌─────────▼──────────┐
│  FICHE ID       │   │ MONTANTS PRÉVUS  │    │ COMMISSION (CI)    │
│  - Objet        │   │  - Global        │    │  - Base (calcul)   │
│  - Dates        │   │  - Détail lignes │    │  - Mode (taux/     │
│  - Références   │   │    (travaux, etc)│    │    tranches/mix)   │
│  - Statut       │   │  - HT/TTC/TVA    │    │  - Exclusions      │
│  - PDF signé    │   └──────────────────┘    │  - Plafond/min     │
└─────────────────┘                           │  - Déclencheur     │
                                               └────────────────────┘
                                 │
                                 ↓
                      ┌──────────────────────┐
                      │ SUBVENTIONS PRÉVUES  │
                      │  - Organisme/bailleur│
                      │  - Type              │
                      │  - Échéancier        │
                      │    (date/montant)    │
                      │  - Conditions        │
                      └──────────────────────┘
                                 │
                                 ↓
                      ┌──────────────────────┐
                      │ PARTENAIRES / RÔLES  │
                      │  - MOA / MOD / Bailleur│
                      │  - Identifiants      │
                      │    (ICE/RC/IF)       │
                      │  - Représentant      │
                      │    signataire        │
                      └──────────────────────┘
                                 │
                                 ↓
                      ┌──────────────────────┐
                      │ VALIDATION & VERSIONING│
                      │  - Version V0        │
                      │  - Verrouillage si   │
                      │    validée           │
                      └──────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼─────────────┐  ┌──────▼──────┐   ┌───────────▼──────────┐
│ SOUS-CONVENTIONS    │  │  AVENANTS   │   │ SORTIES / ÉTATS      │
│ (enfants)           │  │ (modifications)│ │  - Fiche convention  │
│  - Héritent parent  │  │  - N° / dates │   │  - Fiche commission  │
│  - peuvent surcharger│ │  - impact     │   │  - Historique avenants│
│  - montants/CI/etc  │  │   (montant,   │   │  - Version consolidée│
└─────────────────────┘  │   CI, délais..)│  └──────────────────────┘
                         └───────────────┘
                                 │
                      ┌──────────┴──────────┐
                      │                     │
             ┌────────▼─────────┐    ┌─────▼────────┐
             │   N..N           │    │   N..N       │
             │  CONVENTION      │    │   PROJET     │
             │  (cadre/         │    │  (opération/ │
             │   spécifique/...)│    │   programme) │
             └──────────────────┘    └──────────────┘
                                           │
                                           │ N..N
                                           ↓
                                    ┌──────────────┐
                                    │     AXE      │
                                    │ (financeur/  │
                                    │  phase/...)  │
                                    └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Workflow Simpllifié:                                           │
│  1) CRÉER / VALIDER PROJETS                                     │
│  2) CRÉER / VALIDER AXES                                        │
│  3) RATTACHER AXES AUX PROJETS (Projet ↔ Axe)                  │
│  4) CRÉER / ÉDITER CONVENTION (palier 1)                        │
│  5) RATTACHER PROJETS À CONV. (Convention ↔ Projet)            │
│     Règle: ≥ 1 projet obligatoire                              │
│  6) (OPTION) SÉLECTION AXES par Convention & Projet             │
│     si besoin de filtrer                                        │
│  7) VALIDATION CONVENTION                                       │
│     Contrôle: au moins 1 projet (+ axes hérités via projets)   │
└─────────────────────────────────────────────────────────────────┘
```

### Relations Clés
- **Convention N..N Projet** - Une convention peut couvrir plusieurs projets
- **Projet N..N Axe** - Un projet peut avoir plusieurs axes analytiques
- **Convention → Sous-Conventions (1..N)** - Hiérarchie parent-enfant
- **Convention → Avenants (0..N)** - Modifications successives

---

## 💰 Schéma 3: Gestion Budgétaire

```
CONVENTION
  └─ Plafond (global + détail éventuel)
       │
       ├─ BUDGET INITIAL (baseline V0)
       │    ├─ Détaillé par postes (chapitres / lignes)
       │    └─ Validation (verrouillage)
       │
       ├─ RÉVISIONS BUDGÉTAIRES (V1, V2, ...)
       │    ├─ Ajustements (delta)
       │    ├─ Contrôle plafond convention
       │    └─ Historique & justification
       │
       ├─ VENTILATION ANALYTIQUE
       │    ├─ Convention → Projets
       │    ├─ Projets → Axes
       │    └─ Modifications contrôlées
       │
       └─ BUDGET VALIDÉ
            └─ Dernière version active

┌─────────────────────────────────────────────────────────────────┐
│  Workflow Budget:                                               │
│  1) DÉFINIR PLAFOND CONVENTION (existant au palier 1)          │
│  2) CRÉER BUDGET INITIAL (V0)                                   │
│     - détaillé (postes + lignes)                                │
│     - périodes (option)                                         │
│     - pièces justificatives (opt.)                              │
│  3) CONTRÔLES AVANT VALIDATION                                  │
│     - Total budget ≤ plafond conv.                              │
│     - Totaux par poste cohérents                                │
│  4) VALIDER BUDGET INITIAL - Baseline figée (V0)                │
│  5) CRÉER RÉVISION (V1, V2...)                                  │
│     - motif + date                                              │
│     - ajustements (delta)                                       │
│  6) CONTRÔLE PLAFOND                                            │
│     - Total révisé ≤ plafond conv.                              │
│     - Validation automatique → nouvelle variante                │
│  7) VALIDER RÉVISION - nouvelle version active                  │
│  8) VENTILER (par analytique)                                   │
│     - Convention → Projets                                      │
│     - Projets → Axes                                            │
│     - Contrôles de totaux                                       │
└─────────────────────────────────────────────────────────────────┘
```

### États Budget
- **V0** - Budget initial de référence (baseline)
- **V1, V2, V3...** - Révisions budgétaires successives
- **Budget Validé** - Dernière version consolidée

---

## 🔨 Schéma 4: Marchés, Décomptes & Paiements

```
BUDGET VALIDÉ
    ↓
ENGAGEMENT (marché / BC)
    ↓
SITUATIONS / DÉCOMPTES
    ↓
PAIEMENTS
    ↓
SUIVI RÉEL vs BUDGET

┌─────────────────────────────────────────────────────────────────┐
│  1) PARAMÉTRAGE CONVENTION (palier 1)                           │
│  2) DONNÉES DISPONIBLES (marchés / décomptes / paiements)       │
│  3) LANCER CALCUL CI                                            │
│     ↓                                                            │
│  4) DÉTAIL DU CALCUL                                            │
│     - base                                                       │
│     - taux                                                       │
│     - exclusions                                                 │
│  5) VALIDATION CI                                               │
│  6) GÉNÉRATION ÉTAT / FACTURE                                   │
└─────────────────────────────────────────────────────────────────┘

CONVENTION
  └─── MARCHE (1..n)
         ├─── MARCHE_LIGNE (1..n)
         ├─── AVENANT_MARCHE (0..n)
         └─── DECOMPTE (0..n)
                ├─── DECOMPTE_RETENUE (0..n)
                │      └─── (garantie, RAS, pénalités, avances...)
                └─── DECOMPTE_IMPUTATION (1..n)
                       └─── (projet/axe/budget)

DÉCOMPTE VALIDÉ
  (montants + retenues + net à payer calculé)
    ↓
CRÉER ORDRE DE PAIEMENT (OP) [brouillon]
    ├─ renseigner date prévue, mode, banque, référence interne
    ├─ proposer montant à payer (par défaut = reste à payer)
    └─ répartir l'imputation analytique (héritée du décompte)
    ↓
VALIDER OP
    ↓
ENREGISTRER PAIEMENT EFFECTIF
    ├─ date valeur / date exécution
    ├─ référence virement / chèque
    └─ montant payé (peut être partiel)
    ↓
RAPPROCHEMENT BANCAIRE (optionnel palier suivant)
    ↓
DÉCOMPTE SOLDÉ (quand cumul payé = net à payer)

┌─────────────────────────────────────────────────────────────────┐
│  DÉCOMPTE                                                       │
│    ├─ DECOMPTE_RETENUE (garantie, RAS, pénalités, avances...) │
│    └─ DECOMPTE_IMPUTATION (projet/axe/budget)                  │
│         └─ ORDRE_PAIEMENT (brouillon)                          │
│              └─ PAIEMENT (1..n)                                │
│                   └─ PAIEMENT_IMPUTATION (option)              │
└─────────────────────────────────────────────────────────────────┘
```

### Types de Retenues
- **Garantie** - Retenue de garantie
- **RAS** - Retenue à la source (impôts)
- **Pénalités** - Pénalités de retard
- **Avances** - Remboursement d'avances

---

## ✅ Fonctionnalités Implémentées

### 🎯 Plan Analytique Dynamique (Nouvelle Architecture)

✅ **Système de Dimensions Flexibles (JSONB)**
- Architecture basée sur PostgreSQL JSONB pour imputation multidimensionnelle
- Dimensions configurables : Budget, Projet, Secteur, Département, Phase, etc.
- Valeurs par dimension avec code/libellé
- Imputation analytique au niveau ligne de marché
- Requêtes natives optimisées pour filtrage JSONB
- Migration complète de l'ancien système vers JSONB

✅ **Reporting Analytique Avancé**
- Filtres dynamiques par dimension et période
- Graphiques interactifs (Recharts) : évolution temporelle, répartition budgétaire
- Export Excel avec données filtrées
- Vues favorites sauvegardables
- Statistiques temps réel
- Interface intuitive avec sélection multiple de dimensions

### Backend (API REST)

✅ **Authentification & Sécurité**
- JWT Authentication avec refresh tokens
- Rôles: ADMIN, MANAGER, USER
- Spring Security 6.x
- Protection CSRF et CORS configurables

✅ **Conventions**
- CRUD complet avec validation
- Types: CADRE, NON_CADRE, SPECIFIQUE, AVENANT
- Statuts: BROUILLON, EN_COURS, VALIDEE, ACHEVE, EN_RETARD, ANNULE
- Relations N-N avec projets
- Formulaire création/édition complet

✅ **Marchés (Système Complet)**
- CRUD complet avec validation métier
- Relations : Marché ↔ Convention, Marché ↔ Fournisseur
- **Lignes de marché** avec imputation analytique JSONB
- **Avenants** : suivi modifications avec impact financier et délais
- Calcul automatique montants (HT, TVA, TTC)
- Statuts : EN_COURS, VALIDE, TERMINE, ANNULE
- Retenue de garantie paramétrable
- Suivi délais et alertes retards
- Statistiques avancées : total engagé par convention, marchés en retard
- Recherche et filtres multicritères

✅ **Décomptes, Ordres de Paiement & Paiements**
- Entités complètes avec relations
- Imputation analytique JSONB (dimensions_valeurs)
- Workflow : Décompte → OP → Paiement
- Calculs automatiques avec retenues

✅ **Projets**
- CRUD complet
- Association multi-projets avec conventions
- Gestion budgets et axes analytiques

✅ **Fournisseurs**
- CRUD complet
- Validation ICE (15 chiffres)
- Validation IF
- Suivi marchés par fournisseur

✅ **Plan Analytique**
- Dimensions configurables (code, libellé, ordre, actif)
- Valeurs par dimension
- API pour récupération dynamique

✅ **Comptes Bancaires**
- CRUD complet
- Validation RIB (24 chiffres)

✅ **Utilisateurs & Permissions**
- Gestion complète utilisateurs
- Rôles et permissions granulaires
- Profils personnalisables

### Frontend (React + TypeScript)

✅ **Plan Analytique Dynamique**
- Page de configuration des dimensions et valeurs
- Interface de reporting avec filtres dynamiques
- Graphiques interactifs : évolution temporelle, répartition budgétaire, top valeurs
- Export Excel configurable
- Vues favorites sauvegardables avec partage
- Filtres par période (date début/fin)

✅ **Marchés (Interface Complète)**
- Liste avec statistiques temps réel (total engagé, nombre par statut)
- Formulaire création/édition complet avec :
  - Informations générales (numéro, dates, convention, fournisseur)
  - **Gestion lignes** : ajout/suppression/édition lignes avec imputation analytique
  - Calcul automatique montants (quantité × prix unitaire, TVA, TTC)
  - Validation métier
- Badges visuels : nombre de lignes, avenants, décomptes
- Recherche et filtres multicritères (statut, convention, fournisseur)
- Vue détaillée avec historique

✅ **Décomptes**
- Page liste (structure prête pour développement complet)
- Filtres et recherche

✅ **Dashboard Moderne**
- 2 styles : Massari (classique) et Modern (épuré)
- KPI cards : Dépenses, Commissions, Projets, Fournisseurs
- Graphiques Recharts : Area, Bar, Pie, Line
- Données temps réel de l'API
- 100% responsive

✅ **Conventions**
- Liste avec filtres et stats par type
- Formulaire création/édition complet
- Gestion statuts et workflow
- Associations projets

✅ **Profil Utilisateur**
- Affichage données utilisateur (AuthContext)
- Édition informations personnelles
- Changement mot de passe sécurisé

✅ **Design System**
- Composants UI réutilisables : Card, Button, Badge, StatusBadge
- Layout responsive avec sidebar (mobile, tablet, desktop)
- Menu hamburger mobile
- Couleurs et styles cohérents
- Tailwind CSS

---

## ❌ Fonctionnalités Manquantes / En Développement

### 🔴 Priorité HAUTE

#### 1. **Workflow Conventions Avancé**
```
MANQUE:
❌ Gestion complète statuts (BROUILLON → SOUMIS → VALIDEE)
❌ Validation automatique avec création version V0
❌ Verrouillage champs sensibles après validation
❌ Génération fiche synthèse PDF
❌ Notifications transitions d'état

IMPACT: Workflow métier partiellement implémenté
```

#### 2. **Sous-Conventions**
```
MANQUE:
❌ Entity SousConvention (hérite de Convention)
❌ Relation parent-enfant
❌ Héritage paramètres (partenaires, commission)
❌ Surcharge possible (montants, taux)
❌ UI création sous-convention

IMPACT: Impossibilité de créer des conventions dérivées
```

#### 3. **Budget Initial & Révisions**
```
MANQUE:
❌ Entity Budget (V0, V1, V2...)
❌ Plafond convention avec contrôle
❌ Détail par postes (chapitres/lignes)
❌ Contrôles: total ≤ plafond
❌ Révisions budgétaires avec delta
❌ Historique & justifications
❌ UI budget avec versions

IMPACT: Pas de gestion budgétaire structurée
```

#### 4. **Décomptes (Interface Complète)**
```
EN DÉVELOPPEMENT:
⏳ Entity Decompte existe mais UI incomplète
⏳ DECOMPTE_RETENUE (garantie, RAS, pénalités, avances)
⏳ Formulaire création/édition
⏳ Workflow validation
⏳ Calcul net à payer avec retenues
⏳ Import lignes depuis marché
⏳ Historique et traçabilité

IMPACT: Backend prêt, frontend à compléter
```

#### 5. **Ordres de Paiement (Interface Complète)**
```
EN DÉVELOPPEMENT:
⏳ Entity OrdrePaiement existe mais UI incomplète
⏳ Workflow statuts (PREPARE → TRANSMIS → VALIDE → EXECUTE)
⏳ Création depuis décompte validé
⏳ Calcul retenue de garantie
⏳ Export format comptable
⏳ Vérification disponibilité budgétaire

IMPACT: Backend prêt, frontend à compléter
```

#### 6. **Paiements (Interface Complète)**
```
EN DÉVELOPPEMENT:
⏳ Entity Paiement existe mais UI incomplète
⏳ Enregistrement paiement effectué
⏳ Rapprochement bancaire
⏳ Suivi RÉEL vs BUDGET
⏳ Décompte soldé (cumul payé = net à payer)
⏳ Journal des paiements
⏳ Prévisions trésorerie

IMPACT: Backend prêt, frontend à compléter
```

### 🟡 Priorité MOYENNE

#### 9. **Subventions**
```
MANQUE:
❌ Entity Subvention
❌ Organisme/bailleur
❌ Échéancier (date/montant)
❌ Conditions
❌ UI subventions

IMPACT: Pas de suivi financements externes
```

#### 10. **Partenaires/Rôles**
```
MANQUE:
❌ Entity Partenaire
❌ Rôles: MOA, MOD, Bailleur
❌ Identifiants (ICE, RC, IF)
❌ Représentant signataire
❌ UI partenaires

IMPACT: Pas de suivi acteurs convention
```

#### 11. **Commission d'Intervention Avancée**
```
MANQUE:
❌ Base calcul (HT/TTC/Autre)
❌ Mode calcul (taux/tranches/mix)
❌ Exclusions
❌ Plafond/minimum
❌ Déclencheur
❌ Génération état/facture CI

IMPACT: Calcul CI basique seulement
```

#### 12. **Ventilation Analytique**
```
MANQUE:
❌ Rattachement Convention ↔ Projet (N..N)
❌ Rattachement Projet ↔ Axe (N..N)
❌ Sélection axes par Convention & Projet
❌ Contrôles totaux
❌ UI ventilation

IMPACT: Pas d'analyse multidimensionnelle
```

### 🟢 Priorité BASSE

#### 13. **Rapprochement Bancaire**
```
MANQUE:
❌ Entity RapprochementBancaire
❌ Import relevés bancaires
❌ Matching automatique
❌ UI rapprochement

IMPACT: Rapprochement manuel externe
```

#### 14. **Documents/Pièces Jointes**
```
MANQUE:
❌ Upload PDF signé convention
❌ Pièces justificatives budget
❌ Documents décomptes
❌ Stockage fichiers (S3/local)
❌ UI gestion documents

IMPACT: Pas de GED intégrée
```

#### 15. **Exports Avancés**
```
MANQUE:
❌ Export Excel décomptes
❌ Export Excel paiements
❌ Export PDF fiche convention
❌ Export PDF fiche commission
❌ Historique versions (PDF)

IMPACT: Exports basiques seulement
```

#### 16. **Notifications**
```
MANQUE:
❌ Alertes expiration convention
❌ Notifications validation en attente
❌ Rappels paiements
❌ Emails automatiques

IMPACT: Pas de système d'alertes
```

---

## 🛠️ Stack Technique

### Backend
- **Kotlin 2.0.21** + **Spring Boot 3.3.5**
- **Java 21** JVM
- **Gradle 8.x** (Kotlin DSL)
- **PostgreSQL 14+** avec support JSONB
- **Spring Data JPA + Hibernate** (DDL auto-update)
- **Spring Security 6.x + JWT** (access + refresh tokens)
- **OpenAPI 3.0 / Swagger UI** documentation
- **KotlinLogging** structured logging
- **Jackson Kotlin Module** JSON serialization

### Frontend
- **React 18** + **TypeScript 5.x**
- **Vite 5.x** bundler ultra-rapide
- **TailwindCSS** utility-first styling
- **Framer Motion** animations fluides
- **Recharts** graphiques interactifs (Area, Bar, Pie, Line)
- **React Router v6** navigation SPA
- **Axios** HTTP client avec intercepteurs
- **XLSX** export Excel

### DevOps & Architecture
- **Docker** containerization (prêt)
- **PostgreSQL JSONB** stockage flexible
- **Hibernate Schema Auto-Update** (pas de migrations manuelles)
- **CORS configuré** pour développement local
- **JWT stateless authentication**
- **RESTful API** design

---

## 🚀 Déploiement

### Développement Local

**Backend:**
```bash
cd backend
./gradlew bootRun

# API disponible sur http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev

# Application disponible sur http://localhost:5173
```

**Base de Données:**
```bash
# PostgreSQL 14+ requis
createdb investpro

# Configuration dans application.properties:
spring.datasource.url=jdbc:postgresql://localhost:5432/investpro
spring.datasource.username=postgres
spring.datasource.password=postgres

# Le schéma se génère automatiquement via Hibernate DDL
spring.jpa.hibernate.ddl-auto=update
```

### Production

**Backend (Railway/Heroku/Docker)**

**Variables d'environnement:**
```bash
DATABASE_URL=postgresql://user:password@host:5432/investpro
JWT_SECRET=your-very-secure-secret-key-256-bits-minimum
JWT_EXPIRATION=86400000
PORT=8080
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

**Build:**
```bash
cd backend
./gradlew clean build -x test
# JAR généré : build/libs/investpro-backend-1.0.0.jar
```

**Docker (optionnel):**
```dockerfile
FROM openjdk:21-jdk-slim
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**Frontend (Vercel/Netlify)**

**Variables d'environnement:**
```bash
VITE_API_URL=https://your-backend-url.com
```

**Build:**
```bash
cd frontend
npm run build
# Build disponible dans : dist/
```

### Base de Données

**Gestion du Schéma:**
```
⚙️  Hibernate DDL Auto-Update (100% Spring)
- Le schéma se génère automatiquement depuis les entités JPA
- Pas besoin de migrations manuelles
- Configuration : spring.jpa.hibernate.ddl-auto=update
- Création/modification automatique des tables au démarrage

⚠️  Production : Utiliser "validate" au lieu de "update"
spring.jpa.hibernate.ddl-auto=validate
```

**Backup:**
```bash
# Backup complet
pg_dump -U postgres investpro > backup.sql

# Restore
psql -U postgres investpro < backup.sql
```

---

## 🎯 État Actuel du Projet

### ✅ Dernières Mises à Jour (Décembre 2024)

**Architecture Plan Analytique Dynamique**
- Migration complète vers JSONB pour imputation multidimensionnelle
- Remplacement du système rigide Projet+Axe par dimensions configurables
- Support dimensions illimitées (Budget, Projet, Secteur, Département, Phase, etc.)
- Reporting avec filtres dynamiques et graphiques interactifs

**Système Marchés Complet**
- Gestion lignes de marché avec imputation analytique par ligne
- Système d'avenants avec suivi impact financier/délais
- Interface frontend complète (création, édition, lignes dynamiques)
- Calculs automatiques HT/TVA/TTC
- Relations : Marché ↔ Convention, Marché ↔ Fournisseur

**Infrastructure Backend**
- Mise à jour Spring Boot 3.3.5 + Kotlin 2.0.21
- Migration Flyway → Hibernate DDL auto-update (100% Spring)
- Correction erreurs de build frontend TypeScript
- Entités complètes : Decompte, OrdrePaiement, Paiement avec JSONB

**Documentation**
- README.md mis à jour avec état actuel
- BACKLOG.md créé avec spécifications complètes
- Roadmap et métriques de succès

### 🚀 Prochaines Étapes Prioritaires

**T1 2025 - Décomptes MVP**
- Interface frontend complète (formulaire, validation, workflow)
- Import lignes depuis marché
- Calcul automatique retenues (garantie, RAS, pénalités)
- Workflow validation multi-niveaux

**T2 2025 - Ordres de Paiement**
- Interface frontend complète
- Création OP depuis décompte validé
- Calcul retenue de garantie
- Export format comptable
- Vérification disponibilité budgétaire

**T3 2025 - Paiements & Rapprochement**
- Enregistrement paiements effectifs
- Rapprochement bancaire (semi-)automatique
- Journal paiements et prévisions trésorerie
- Dashboard suivi RÉEL vs BUDGET

**T4 2025 - Optimisations & Avancé**
- Gestion documentaire (upload PDF, versioning)
- Notifications et alertes
- Permissions avancées par module
- Tests E2E et couverture > 80%
- Performance optimisation

---

## 📝 Licence

© 2024 InvestPro Maroc - Tous droits réservés

---

## 👥 Contact

- **Email:** support@investpro.ma
- **GitHub:** [naciro2010/InvestProMaroc](https://github.com/naciro2010/InvestProMaroc)

---

**Made with ❤️ in Morocco 🇲🇦**
