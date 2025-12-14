# Guide de Développement InvestPro Maroc

## 📋 État d'Avancement

### ✅ Complété

#### Backend
- [x] Structure Maven Spring Boot
- [x] Configuration application.properties
- [x] Entités JPA (Convention, Projet, Fournisseur, AxeAnalytique, CompteBancaire, DepenseInvestissement, Commission, User)
- [x] Migrations Flyway (schéma + données de test)
- [x] Repositories JPA pour toutes les entités
- [x] DTOs pour toutes les entités
- [x] Configuration sécurité (temporaire - permissive)
- [x] Configuration OpenAPI/Swagger
- [x] Exception handling global
- [x] Service Convention (complet)
- [x] Controller Convention (complet)

### 🚧 À Compléter

#### Backend - Services à créer
Copier/coller le pattern du `ConventionService` pour créer :

- [ ] ProjetService
- [ ] FournisseurService
- [ ] AxeAnalytiqueService
- [ ] CompteBancaireService
- [ ] DepenseInvestissementService (plus complexe - voir notes ci-dessous)
- [ ] CommissionService (calcul automatique)
- [ ] DashboardService (statistiques)
- [ ] ReportingService (exports Excel)

#### Backend - Controllers à créer
Copier/coller le pattern du `ConventionController` pour créer :

- [ ] ProjetController
- [ ] FournisseurController
- [ ] AxeAnalytiqueController
- [ ] CompteBancaireController
- [ ] DepenseInvestissementController
- [ ] CommissionController
- [ ] DashboardController
- [ ] ReportingController

#### Backend - Services Spéciaux

**DepenseInvestissementService** - Logique métier :
```java
@Transactional
public DepenseInvestissementDTO create(DepenseInvestissementDTO dto) {
    // 1. Créer la dépense
    // 2. Calculer automatiquement la TVA, retenues
    // 3. Si convention définie, calculer commission automatiquement
    // 4. Sauvegarder
}
```

**CommissionService** - Logique de calcul :
```java
public CommissionDTO calculateCommission(Long depenseId, Long conventionId) {
    // Utiliser Commission.calculer() de l'entité
    // Sauvegarder la commission
    // Retourner DTO
}
```

**ReportingService** - Exports Excel :
```java
public ByteArrayInputStream exportCommissionsExcel(filters) {
    // Utiliser Apache POI
    // Générer Excel avec :
    // - Entêtes personnalisés
    // - Données filtrées
    // - Totaux
    // - Mise en forme (couleurs, bordures)
}
```

#### Frontend - Structure React
- [ ] Configuration Vite + TailwindCSS
- [ ] Configuration React Router
- [ ] Configuration React Query
- [ ] Configuration Axios
- [ ] Composants UI (Shadcn/ui)
- [ ] Layout principal (Header, Sidebar, Footer)
- [ ] Page Login
- [ ] Page Dashboard
- [ ] Pages CRUD Référentiels (5 pages)
- [ ] Page Dépenses d'Investissement
- [ ] Page Commissions
- [ ] Page Reporting

## 🚀 Démarrage Rapide

### 1. Base de données
```bash
# Démarrer PostgreSQL avec Docker
docker-compose up -d postgres

# Vérifier que PostgreSQL est démarré
docker-compose ps

# Accéder à PgAdmin (optionnel)
# http://localhost:5050
# Email: admin@investpro.ma
# Password: admin
```

### 2. Backend
```bash
cd backend

# Premier lancement (avec migrations Flyway)
./mvnw clean install
./mvnw spring-boot:run

# L'application démarre sur http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### 3. Frontend (quand créé)
```bash
cd frontend
npm install
npm run dev

# L'application démarre sur http://localhost:5173
```

## 📚 API Endpoints

### Conventions
- `GET /api/conventions` - Liste toutes les conventions
- `GET /api/conventions/active` - Conventions actives
- `GET /api/conventions/{id}` - Convention par ID
- `POST /api/conventions` - Créer convention
- `PUT /api/conventions/{id}` - Modifier convention
- `DELETE /api/conventions/{id}` - Désactiver convention

### Données de Test
Les données de test sont automatiquement insérées par Flyway :
- Utilisateurs : `admin` / `admin123` et `user` / `admin123`
- 3 conventions
- 4 projets
- 4 fournisseurs
- 6 axes analytiques
- 3 comptes bancaires
- 4 dépenses d'investissement
- 3 commissions calculées

## 🔧 Template de Code

### Service Template
Copier `ConventionService.java` et remplacer :
- `Convention` → `VotreEntité`
- `ConventionDTO` → `VotreEntitéDTO`
- `conventionRepository` → `votreEntitéRepository`
- Adapter les méthodes spécifiques

### Controller Template
Copier `ConventionController.java` et remplacer :
- `Convention` → `VotreEntité`
- `ConventionDTO` → `VotreEntitéDTO`
- `conventionService` → `votreEntitéService`
- Adapter les endpoints spécifiques

## 📝 Conventions de Code

### Nommage
- Entités : PascalCase (ex: `DepenseInvestissement`)
- DTOs : PascalCase + DTO (ex: `DepenseInvestissementDTO`)
- Services : PascalCase + Service (ex: `DepenseInvestissementService`)
- Controllers : PascalCase + Controller (ex: `DepenseInvestissementController`)
- Repositories : PascalCase + Repository (ex: `DepenseInvestissementRepository`)

### Packages
```
ma.investpro/
├── config/          # Configuration (Security, OpenAPI, etc.)
├── controller/      # REST Controllers
├── dto/             # Data Transfer Objects
├── entity/          # Entités JPA
├── exception/       # Exceptions personnalisées
├── repository/      # Repositories JPA
├── service/         # Services métier
└── util/            # Classes utilitaires
```

## 🐛 Dépannage

### Problème : Flyway ne démarre pas
```bash
# Supprimer la base et recréer
docker-compose down -v
docker-compose up -d postgres
./mvnw spring-boot:run
```

### Problème : Port 8080 déjà utilisé
```bash
# Changer le port dans application.properties
server.port=8081
```

### Problème : Connexion PostgreSQL refusée
```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps

# Vérifier les logs
docker-compose logs postgres
```

## 📞 Support

Pour toute question ou problème, créer une issue sur GitHub.
