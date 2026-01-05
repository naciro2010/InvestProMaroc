# Claude Code - InvestProMaroc - Guide de Référence

> 📋 Ce document capitalise toutes les connaissances du projet InvestProMaroc pour servir de référence et contexte lors des sessions Claude.

**Dernière mise à jour:** 2026-01-05

**Version:** 2.0 - Ajout modules Projets et Marchés

---

## 📁 Structure du Projet

```
InvestProMaroc/
├── backend/          # API Backend (Kotlin + Spring Boot)
│   ├── src/main/kotlin/ma/investpro/
│   │   ├── entity/           # Entités JPA
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── service/          # Logique métier
│   │   ├── controller/       # Controllers REST
│   │   ├── repository/       # Repositories JPA
│   │   └── mapper/           # Entity ↔ DTO mappers
│   └── src/main/resources/
│       └── db/migration/     # Flyway migrations
├── frontend/         # Frontend (React + TypeScript + Material-UI)
│   └── src/
│       ├── pages/            # Pages de l'application
│       ├── components/       # Composants réutilisables
│       └── lib/              # API client et utilities
└── legacy/           # Ancien système (Xcompta)
    └── Xcompta-main/         # Code HTML/JS legacy
```

---

## 🏗️ Architecture Technique

### Backend
- **Langage:** Kotlin
- **Framework:** Spring Boot 3.x
- **ORM:** JPA/Hibernate
- **Base de données:** PostgreSQL
- **Migration:** Flyway
- **Sécurité:** Spring Security avec JWT
- **API:** RESTful

### Frontend
- **Framework:** React 18+ avec TypeScript
- **UI Library:** Material-UI (MUI)
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Build:** Vite

---

## 📊 Modèle de Données - Module Conventions

### Entité Convention (Cœur du système)

**Fichier:** `backend/src/main/kotlin/ma/investpro/entity/Convention.kt`

#### Informations de Base
- `code` (String, unique): Code interne (ex: CONV001)
- `numero` (String, unique): Numéro officiel (ex: CONV-2024-001)
- `libelle` (String): Titre de la convention
- `objet` (Text): Description détaillée
- `dateConvention` (LocalDate): Date de signature
- `typeConvention` (Enum): CADRE, NON_CADRE, SPECIFIQUE, AVENANT

#### Champs Financiers
- `budget` (BigDecimal): Budget total en DH
- `tauxCommission` (BigDecimal): Taux de commission (0-100%)
- `baseCalcul` (String): DECAISSEMENTS_TTC ou DECAISSEMENTS_HT
- `tauxTva` (BigDecimal): Taux TVA (généralement 20%)

#### Dates de Validité
- `dateDebut` (LocalDate): Date de début d'exécution
- `dateFin` (LocalDate, nullable): Date de fin prévue

#### Workflow et Versioning
- `statut` (Enum): BROUILLON, SOUMIS, VALIDEE, EN_COURS, ACHEVE, EN_RETARD, ANNULE
- `dateSoumission` (LocalDate): Date de soumission pour validation
- `dateValidation` (LocalDate): Date de validation (création V0)
- `valideParId` (Long): ID de l'utilisateur qui a validé
- `version` (String): Version courante (V0, V1, V2...)
- `isLocked` (Boolean): Verrouillage après validation
- `motifVerrouillage` (Text): Raison du verrouillage

#### Hiérarchie (Sous-conventions)
- `parentConvention` (ManyToOne): Convention parente
- `sousConventions` (OneToMany): Sous-conventions filles
- `heriteParametres` (Boolean): Héritage des paramètres du parent
- `surchargeTauxCommission` (BigDecimal): Surcharge du taux
- `surchargeBaseCalcul` (String): Surcharge de la base de calcul

#### Relations
- `partenaires` (OneToMany → ConventionPartenaire)
- `imputationsPrevisionnelles` (OneToMany → ImputationPrevisionnelle)
- `versementsPrevisionnels` (OneToMany → VersementPrevisionnel)
- `subventions` (OneToMany → Subvention)

---

### Entité ConventionPartenaire (Association N-N)

**Fichier:** `backend/src/main/kotlin/ma/investpro/entity/ConventionPartenaire.kt`

- `convention` (ManyToOne): Convention associée
- `partenaire` (ManyToOne): Partenaire associé
- `budgetAlloue` (BigDecimal): Montant alloué au partenaire
- `pourcentage` (BigDecimal): Pourcentage du budget total
- `commissionIntervention` (BigDecimal): Commission calculée
- `estMaitreOeuvre` (Boolean): Indicateur MO
- `estMaitreOeuvreDelegue` (Boolean): Indicateur MOD
- `remarques` (Text)

**Contrainte:** UNIQUE(convention_id, partenaire_id)

---

### Entité Subvention

**Fichier:** `backend/src/main/kotlin/ma/investpro/entity/Subvention.kt`

- `convention` (ManyToOne): Convention financée
- `organismeBailleur` (String): Nom du bailleur/organisme
- `typeSubvention` (String): Don, Prêt, Garantie, etc.
- `montantTotal` (BigDecimal): Montant de la subvention
- `devise` (String): Devise (MAD par défaut)
- `tauxChange` (BigDecimal): Taux de change si devise étrangère
- `dateSignature` (LocalDate)
- `dateDebutValidite` (LocalDate)
- `dateFinValidite` (LocalDate)
- `conditions` (Text): Conditions de déblocage
- `observations` (Text)
- `echeancier` (OneToMany → EcheanceSubvention)

**Relation:** Une subvention peut avoir plusieurs échéances de versement

---

### Entité ImputationPrevisionnelle

**Fichier:** `backend/src/main/kotlin/ma/investpro/entity/ImputationPrevisionnelle.kt`

- `convention` (ManyToOne)
- `volet` (String): Composante/Segment du projet
- `dateDemarrage` (LocalDate)
- `delaiMois` (Int): Durée en mois
- `dateFinPrevue` (LocalDate): Calculée automatiquement
- `remarques` (Text)

**Usage:** Planification budgétaire et analytique des conventions

---

### Entité VersementPrevisionnel

**Fichier:** `backend/src/main/kotlin/ma/investpro/entity/VersementPrevisionnel.kt`

- `convention` (ManyToOne)
- `volet` (String)
- `dateVersement` (LocalDate)
- `montant` (BigDecimal)
- `partenaire` (ManyToOne): Bénéficiaire du versement
- `maitreOeuvreDelegue` (ManyToOne → Partenaire): MOD responsable
- `remarques` (Text)

**Usage:** Échéancier des paiements prévisionnels

---

## 🔄 Workflow des Conventions

### Machine à États (State Machine)

```
BROUILLON (Éditable, Supprimable)
    ↓ [soumettre()]
SOUMIS (Non éditable)
    ├→ [valider(userId)] → VALIDEE (Verrouillée, V0 créée) → [mettreEnCours()] → EN_COURS
    └→ [rejeter(motif)] → BROUILLON

EN_COURS (Verrouillée)
    ├→ [achever()] → ACHEVE (Terminal)
    └→ [annuler(motif)] → ANNULE (Terminal)

EN_RETARD (Status automatique basé sur les dates)
```

### Règles Métier

1. **BROUILLON:**
   - Éditable et supprimable
   - Aucun verrouillage
   - Validation requise avant soumission

2. **SOUMIS:**
   - Non éditable
   - En attente de validation par un ADMIN/MANAGER
   - Peut être rejetée (retour en BROUILLON)

3. **VALIDEE:**
   - Création automatique de la version V0
   - Verrouillage complet (isLocked = true)
   - Transition vers EN_COURS obligatoire

4. **EN_COURS:**
   - Convention en exécution
   - Peut être achevée ou annulée
   - Suivis des imputations/versements actifs

5. **ACHEVE / ANNULE:**
   - États terminaux
   - Archive historique

---

## 🎨 Frontend - Wizard de Création de Convention

**Fichier:** `frontend/src/pages/conventions/ConventionWizardComplete.tsx`

### Étapes du Wizard (6 étapes)

1. **Informations de Base**
   - Type, Numéro, Code, Libellé, Objet
   - Dates: Convention, Début, Fin

2. **Budget**
   - Budget global (MAD)
   - Détail par lignes (HT/TVA/TTC) - Optionnel

3. **Commission**
   - Base: HT ou TTC
   - Mode: Taux Fixe, Tranches, Mixte
   - Taux (%)
   - Plafond et minimum (optionnels)

4. **Partenaires**
   - Rôle: MOA, MOD, BAILLEUR
   - Budget alloué + Pourcentage (synchronisés)
   - Checkboxes: Maître d'Œuvre, Maître d'Œuvre Délégué

5. **Subventions** (Optionnel)
   - Organisme bailleur
   - Type (Don, Prêt...)
   - Montant
   - Date d'échéance
   - Conditions

6. **Récapitulatif**
   - Revue complète avant création
   - Création en statut BROUILLON

### Mapping Frontend → Backend

```typescript
// Frontend
{
  organisme: string,
  type: string,
  montant: number,
  dateEcheance: string,
  conditions: string
}

// Backend (après mapping)
{
  organismeBailleur: string,
  typeSubvention: string,
  montantTotal: BigDecimal,
  devise: "MAD",
  dateFinValidite: LocalDate,
  conditions: string
}
```

---

## 🔌 API REST - Endpoints Conventions

**Base URL:** `/api/conventions`

### CRUD
- `GET /api/conventions` → Liste toutes les conventions
- `GET /api/conventions/{id}` → Détail d'une convention
- `GET /api/conventions/code/{code}` → Recherche par code
- `GET /api/conventions/statut/{statut}` → Filtrage par statut
- `GET /api/conventions/actives` → Conventions actives uniquement
- `POST /api/conventions` → Créer convention (ADMIN/MANAGER)
- `PUT /api/conventions/{id}` → Modifier convention (ADMIN/MANAGER, BROUILLON seulement)
- `DELETE /api/conventions/{id}` → Supprimer convention (ADMIN only, BROUILLON seulement)

### Hiérarchie
- `GET /api/conventions/racine` → Conventions racines (sans parent)
- `GET /api/conventions/{id}/sous-conventions` → Sous-conventions d'une convention
- `POST /api/conventions/{parentId}/sous-conventions` → Créer sous-convention

### Workflow
- `POST /api/conventions/{id}/soumettre` → BROUILLON → SOUMIS
- `POST /api/conventions/{id}/valider` → SOUMIS → VALIDEE (avec userId)
- `POST /api/conventions/{id}/rejeter` → SOUMIS → BROUILLON (avec motif)
- `POST /api/conventions/{id}/mettre-en-cours` → VALIDEE → EN_COURS
- `POST /api/conventions/{id}/annuler` → Any → ANNULE (avec motif)
- `POST /api/conventions/{id}/achever` → EN_COURS → ACHEVE

---

## 🛡️ Sécurité et Permissions

### Rôles
- **ADMIN:** Accès complet (CRUD + workflow)
- **MANAGER:** Création, modification, workflow
- **USER:** Lecture seule

### Règles de Verrouillage
- Convention en BROUILLON → Éditable
- Convention SOUMISE ou + → Non éditable (sauf workflow)
- Convention avec isLocked=true → Aucune modification possible

---

## 📝 DTOs (Data Transfer Objects)

**Fichier:** `backend/src/main/kotlin/ma/investpro/dto/BusinessDTOs.kt`

### ConventionDTO (Complet)
Contient toutes les informations + relations:
- partenaires: List<ConventionPartenaireDTO>
- sousConventions: List<ConventionSimpleDTO>
- imputationsPrevisionnelles: List<ImputationPrevisionnelleDTO>
- versementsPrevisionnels: List<VersementPrevisionnelDTO>
- subventions: List<SubventionDTO>

### ConventionSimpleDTO (Liste)
Version allégée pour les listes et affichages simplifiés:
- id, code, numero, libelle, statut, budget, dates, actif

---

## 🗺️ Mappers

**Fichier:** `backend/src/main/kotlin/ma/investpro/mapper/ConventionMapper.kt`

### Méthodes Principales
- `toDTO(Convention)` → ConventionDTO complet avec relations
- `toSimpleDTO(Convention)` → ConventionSimpleDTO allégé
- `toDTOList(List<Convention>)` → List<ConventionDTO>
- `toSimpleDTOList(List<Convention>)` → List<ConventionSimpleDTO>

### Méthodes Privées de Mapping
- `toPartenaireDTO(ConventionPartenaire)` → ConventionPartenaireDTO
- `toImputationDTO(ImputationPrevisionnelle)` → ImputationPrevisionnelleDTO
- `toVersementDTO(VersementPrevisionnel)` → VersementPrevisionnelDTO
- `toSubventionDTO(Subvention)` → SubventionDTO

**Note:** Les mappers évitent les références circulaires en ne chargeant que les données nécessaires

---

## 🎯 Points Importants à Retenir

### 1. Cascade et Orphan Removal
Toutes les relations OneToMany dans Convention utilisent:
```kotlin
cascade = [CascadeType.ALL], orphanRemoval = true
```
→ Sauvegarde/suppression automatique des entités enfants

### 2. Gestion des Sous-Conventions
- Une convention peut avoir une `parentConvention`
- Si `heriteParametres = true`, les taux et bases sont hérités
- Possibilité de surcharger via `surchargeTauxCommission` et `surchargeBaseCalcul`

### 3. Versions et Verrouillage
- V0 est créée automatiquement lors de la validation
- Une fois verrouillée (isLocked=true), aucune modification n'est possible
- Les versions ultérieures (V1, V2...) gèrent les avenants

### 4. Imputations et Versements
- **Imputations:** Ajoutées APRÈS la création de la convention
- **Versements:** Ajoutés APRÈS la création de la convention
- **Subventions:** Ajoutées PENDANT la création de la convention (dans le wizard)

### 5. Frontend - Validation par Étape
Le wizard valide chaque étape avant de passer à la suivante:
- Étape 0: Tous les champs requis
- Étape 1: Budget > 0, total lignes = budget global
- Étape 2: Taux commission entre 0 et 100
- Étape 3: Au moins 1 partenaire, total pourcentages = 100%
- Étapes 4-5: Optionnelles

---

## 🗄️ Base de Données

### Tables Principales
- `conventions` (Table mère)
- `convention_partenaires` (Junction N-N)
- `subventions`
- `echeances_subvention`
- `imputations_previsionnelles`
- `versements_previsionnels`

### Indexes Créés
- `idx_conventions_code`
- `idx_conventions_numero`
- `idx_conventions_type`
- `idx_conventions_statut`
- `idx_conventions_dates`
- `idx_subventions_convention`
- `idx_imputations_convention`
- `idx_versements_convention`

---

## 🚀 Commandes Utiles

### Backend
```bash
# Lancer le backend
cd backend
./gradlew bootRun

# Lancer les tests
./gradlew test

# Build
./gradlew build
```

### Frontend
```bash
# Lancer le frontend
cd frontend
npm install
npm run dev

# Build production
npm run build
```

### Git
```bash
# Vérifier le statut
git status

# Créer une branche feature
git checkout -b claude/feature-name-XXXXX

# Commit et push
git add .
git commit -m "feat: Description du changement"
git push -u origin claude/feature-name-XXXXX
```

---

## 📚 Ressources Legacy

Le dossier `legacy/Xcompta-main/` contient l'ancien système avec:
- Wizards de création en HTML/jQuery
- Logique métier JavaScript
- Structure des formulaires et validations

**Utilité:** Référence pour comprendre les besoins métier originaux

---

## 🔮 Prochaines Étapes

### Implémenté
1. ✅ Intégration des subventions dans le wizard de création
2. ✅ Module Projets (complet avec workflow)
3. ✅ Module Marchés (complet avec détails)

### À Implémenter (Priorités)
1. ⏳ Interface d'ajout d'imputations prévisionnelles (après création convention)
2. ⏳ Interface d'ajout de versements prévisionnels (après création convention)
3. ⏳ Page de détail complète pour les projets
4. ⏳ Liaison projets ↔ marchés ↔ conventions

### Améliorations Futures
- Dashboard analytique
- Export PDF des conventions
- Notifications par email (soumission, validation)
- Historique des modifications (audit trail)
- Gestion des pièces jointes

---

## ❓ Questions Fréquentes

### Q: Pourquoi les imputations/versements ne sont pas dans le wizard ?
**R:** Par décision métier, ces éléments nécessitent une convention déjà créée et validée. Ils sont ajoutés ultérieurement via la page de détail.

### Q: Comment gérer les avenants ?
**R:** Les avenants utilisent `typeConvention = AVENANT` et référencent une convention parente via `parentConvention`.

### Q: Que se passe-t-il si je supprime une convention avec des sous-conventions ?
**R:** Grâce à `cascade = CascadeType.ALL`, toutes les sous-conventions et relations sont supprimées en cascade.

### Q: Comment fonctionne le calcul automatique de dateFinPrevue ?
**R:** `dateFinPrevue = dateDemarrage + delaiMois` (calculé automatiquement)

---

## 🤝 Contributeurs

- **Backend:** Kotlin + Spring Boot
- **Frontend:** React + TypeScript
- **Legacy Reference:** Xcompta (HTML/JS)

---

**Fin du README Claude - Version 1.0**

> 💡 Ce document est vivant et doit être mis à jour à chaque changement majeur de l'architecture ou de la logique métier.

---

## 📁 Module PROJETS

### Backend - Entité Projet

**Fichier:** `backend/src/main/kotlin/ma/investpro/entity/Projet.kt`

#### Champs Principaux
- `code` (String, unique): Code unique du projet (ex: PRJ-2024-001)
- `nom` (String): Nom/titre du projet
- `description` (Text): Description détaillée du projet
- `budgetTotal` (BigDecimal): Budget total alloué en DH
- `dateDebut` (LocalDate): Date de démarrage
- `dateFinPrevue` (LocalDate): Date de fin prévue (auto-calculée si dureeMois fournie)
- `dateFinReelle` (LocalDate): Date de fin réelle
- `dureeMois` (Int): Durée estimée en mois

#### Workflow et Suivi
- `statut` (Enum): EN_PREPARATION, EN_COURS, SUSPENDU, TERMINE, ANNULE
- `pourcentageAvancement` (BigDecimal): Avancement du projet (0-100%)
- `chefProjet` (ManyToOne → Partenaire): Responsable du projet
- `convention` (ManyToOne → Convention): Convention de rattachement (optionnel)

#### Informations Complémentaires
- `localisation` (String): Localisation géographique
- `objectifs` (Text): Objectifs du projet
- `remarques` (Text): Notes diverses

#### Méthodes Métier
- `calculerDateFinPrevue()`: Calcule dateFinPrevue = dateDebut + dureeMois
- `estEnRetard()`: Vérifie si aujourd'hui > dateFinPrevue ET statut actif
- `estActif()`: Vérifie si statut = EN_PREPARATION ou EN_COURS

---

### Service Projet

**Fichier:** `backend/src/main/kotlin/ma/investpro/service/ProjetService.kt`

#### CRUD Operations
- `findAll()`, `findById()`, `findByCode()`
- `findByStatut()`, `findByConventionId()`, `findByChefProjetId()`
- `findProjetsActifs()`, `findProjetsEnRetard()`
- `create()`, `update()`, `delete()`

#### Workflow Operations
- `demarrer(id)`: EN_PREPARATION → EN_COURS
- `suspendre(id, motif)`: EN_COURS → SUSPENDU
- `reprendre(id)`: SUSPENDU → EN_COURS
- `terminer(id)`: EN_COURS/SUSPENDU → TERMINE (auto 100%)
- `annuler(id, motif)`: Any (sauf TERMINE) → ANNULE
- `mettreAJourAvancement(id, %)`: Met à jour l'avancement (auto-termine si 100%)

#### Statistiques
- `getStatistiques()`: Retourne compteurs par statut + projets en retard

---

### API REST Projets

**Base URL:** `/api/projets`

#### Endpoints CRUD
- `GET /api/projets` → Liste tous les projets
- `GET /api/projets/{id}` → Détail d'un projet
- `GET /api/projets/code/{code}` → Recherche par code
- `GET /api/projets/statut/{statut}` → Filtrage par statut
- `GET /api/projets/actifs` → Projets actifs uniquement
- `GET /api/projets/en-retard` → Projets en retard
- `GET /api/projets/convention/{id}` → Projets d'une convention
- `GET /api/projets/chef-projet/{id}` → Projets d'un chef de projet
- `GET /api/projets/periode?debut=&fin=` → Projets par période
- `GET /api/projets/search?q=` → Recherche textuelle
- `POST /api/projets` → Créer un projet (ADMIN/MANAGER)
- `PUT /api/projets/{id}` → Modifier un projet (ADMIN/MANAGER)
- `DELETE /api/projets/{id}` → Supprimer un projet (ADMIN only)

#### Endpoints Workflow
- `POST /api/projets/{id}/demarrer` → Démarrer le projet
- `POST /api/projets/{id}/suspendre?motif=` → Suspendre avec motif
- `POST /api/projets/{id}/reprendre` → Reprendre un projet suspendu
- `POST /api/projets/{id}/terminer` → Clôturer le projet
- `POST /api/projets/{id}/annuler?motif=` → Annuler avec motif
- `PUT /api/projets/{id}/avancement?pourcentage=` → Mettre à jour l'avancement

#### Statistiques
- `GET /api/projets/statistiques` → Statistiques par statut

---

### Frontend Projets

**Fichiers:**
- Liste: `/home/user/InvestProMaroc/frontend/src/pages/projets/ProjetsPage.tsx`
- Formulaire: `/home/user/InvestProMaroc/frontend/src/pages/projets/ProjetFormPage.tsx`
- API Client: `/home/user/InvestProMaroc/frontend/src/lib/projetsAPI.ts`

#### Fonctionnalités de la Page Liste
- **Cartes de statistiques:** Total, En préparation, En cours, Suspendus, En retard
- **Affichage par cartes:** Code, nom, statut, avancement (%), budget
- **Menu contextuel par projet:**
  - Détails
  - Démarrer (si EN_PREPARATION)
  - Suspendre (si EN_COURS)
  - Reprendre (si SUSPENDU)
  - Terminer (si EN_COURS)
  - Annuler (si non TERMINE)
  - Modifier
  - Supprimer (ADMIN)

#### Formulaire de Création/Modification
Champs principaux:
- Code, Nom, Description
- Budget total, Durée (mois)
- Date de début
- Statut
- Localisation
- Objectifs
- Remarques

---

### Base de Données - Table Projets

**Fichier migration:** `V5__create_projets_table.sql`

**Table:** `projets`

```sql
CREATE TABLE projets (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    convention_id BIGINT,
    budget_total DECIMAL(15,2) DEFAULT 0,
    date_debut DATE,
    date_fin_prevue DATE,
    date_fin_reelle DATE,
    duree_mois INT,
    chef_projet_id BIGINT,
    statut statut_projet DEFAULT 'EN_PREPARATION',
    pourcentage_avancement DECIMAL(5,2) DEFAULT 0,
    localisation VARCHAR(200),
    objectifs TEXT,
    remarques TEXT,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (convention_id) REFERENCES conventions(id),
    FOREIGN KEY (chef_projet_id) REFERENCES partenaires(id)
);
```

**ENUM:** `statut_projet` → EN_PREPARATION, EN_COURS, SUSPENDU, TERMINE, ANNULE

**Index:**
- idx_projets_code (UNIQUE)
- idx_projets_convention
- idx_projets_statut
- idx_projets_dates
- idx_projets_avancement

---

## 🏗️ Module MARCHÉS (Existant)

### Backend - Entité Marché

**Fichier:** `backend/src/main/kotlin/ma/investpro/entity/Marche.kt`

Le module Marchés était déjà complet dans le système :
- Gestion des marchés publics / contrats de procurement
- Liaison avec Convention et Fournisseur
- Support des lignes de marché (MarcheLigne)
- Avenants (AvenantMarche)
- Bons de commande (BonCommande)
- Décomptes (Decompte)

**Statuts:** EN_COURS, VALIDE, TERMINE, SUSPENDU, ANNULE, EN_ATTENTE

---

## 🔗 Relations entre Modules

### Convention ↔ Projet
- Une convention peut avoir plusieurs projets (One-to-Many implicite via foreign key)
- Un projet peut être rattaché à une convention (Many-to-One optionnel)

### Convention ↔ Marché
- Une convention peut avoir plusieurs marchés (One-to-Many)
- Un marché doit être rattaché à une convention (Many-to-One)

### Projet ↔ Marché
- Pas de relation directe dans le modèle actuel
- Liaison possible via la convention commune

### Convention ↔ Partenaire
- Relation N-N via ConventionPartenaire
- Chaque partenaire a un rôle (MOA, MOD, BAILLEUR) et un budget alloué

### Projet ↔ Partenaire
- Un projet peut avoir un chef de projet (Many-to-One vers Partenaire)

---

## 📊 Workflow Comparatif

### Convention
```
BROUILLON → SOUMIS → VALIDEE (V0) → EN_COURS → ACHEVE/ANNULE
                ↓ rejeter
            BROUILLON
```

### Projet
```
EN_PREPARATION → EN_COURS → TERMINE/ANNULE
                     ↓ suspendre
                 SUSPENDU → EN_COURS (reprendre)
```

### Marché
```
EN_ATTENTE → VALIDE → EN_COURS → TERMINE/ANNULE
                          ↓
                      SUSPENDU
```

