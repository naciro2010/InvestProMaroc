# 🚀 Prochaines Étapes

## Ce qui a été fait ✅

### Backend Spring Boot
1. ✅ **Structure Maven** complète avec toutes les dépendances
2. ✅ **8 Entités JPA** avec validations et relations :
   - BaseEntity (classe de base)
   - Convention (commissions d'intervention)
   - Projet
   - Fournisseur (avec IF, ICE, non-résident)
   - AxeAnalytique
   - CompteBancaire (RIB 24 chiffres)
   - DepenseInvestissement (avec calculs auto)
   - Commission (avec méthode calculer())
   - User (avec UserDetails pour Spring Security)

3. ✅ **Migrations Flyway** :
   - V1__init_schema.sql - Schéma complet avec contraintes et index
   - V2__seed_data.sql - Données de démonstration

4. ✅ **8 Repositories JPA** avec requêtes personnalisées
5. ✅ **7 DTOs** avec validations Jakarta
6. ✅ **Configuration** :
   - SecurityConfig (CORS + configuration permissive)
   - OpenApiConfig (Swagger)
   - GlobalExceptionHandler
   - application.properties

7. ✅ **1 Service complet** : ConventionService
8. ✅ **1 Controller complet** : ConventionController
9. ✅ **Docker Compose** pour PostgreSQL + PgAdmin

---

## Ce qu'il reste à faire 🚧

### Phase 1 : Compléter le Backend (2-3h)

#### Services à créer (pattern simple, copier ConventionService)
```bash
# Créer ces services en copiant le pattern de ConventionService :
backend/src/main/java/ma/investpro/service/
├── ProjetService.java
├── FournisseurService.java
├── AxeAnalytiqueService.java
├── CompteBancaireService.java
├── DepenseInvestissementService.java  # ⚠️ Plus complexe
├── CommissionService.java              # ⚠️ Logique de calcul
└── DashboardService.java               # ⚠️ Statistiques
```

#### Controllers à créer (pattern simple, copier ConventionController)
```bash
backend/src/main/java/ma/investpro/controller/
├── ProjetController.java
├── FournisseurController.java
├── AxeAnalytiqueController.java
├── CompteBancaireController.java
├── DepenseInvestissementController.java
├── CommissionController.java
└── DashboardController.java
```

#### Services spéciaux

**1. DepenseInvestissementService** - Logique métier importante :
```java
@Transactional
public DepenseInvestissementDTO create(DepenseInvestissementDTO dto) {
    // 1. Valider données
    // 2. Récupérer fournisseur, projet, etc.
    // 3. Créer dépense (calculs auto dans @PrePersist)
    // 4. Si convention, créer commission automatiquement
    // 5. Retourner DTO
}

@Transactional
public DepenseInvestissementDTO markAsPaid(Long id, PaiementDTO paiement) {
    // Marquer comme payé avec date, référence, compte
}
```

**2. CommissionService** :
```java
public CommissionDTO calculateAndSave(Long depenseId, Long conventionId) {
    // Utiliser Commission.calculer() statique
    // Sauvegarder
}

public List<CommissionDTO> getByFilters(CommissionFilterDTO filters) {
    // Filtres : période, projet, fournisseur, convention
}
```

**3. DashboardService** :
```java
public DashboardStatsDTO getStats() {
    return DashboardStatsDTO.builder()
        .totalDepensesTtc(depenseRepository.sumMontantTtc())
        .totalCommissionsTtc(commissionRepository.sumMontantCommissionTtc())
        .depensesPaye(depenseRepository.sumMontantTtcPaye())
        .depensesNonPaye(depenseRepository.sumMontantTtcNonPaye())
        .nombreDepenses(depenseRepository.count())
        .nombreCommissions(commissionRepository.count())
        .build();
}

public List<ChartDataDTO> getDepensesByProjet() {
    // Regrouper dépenses par projet
}
```

**4. ReportingService** (Export Excel) :
```java
public ByteArrayInputStream exportCommissionsExcel(CommissionFilterDTO filters) {
    // Apache POI pour générer Excel
    // Mise en forme (titres, couleurs, bordures)
    // Totaux en bas
}
```

### Phase 2 : Frontend React (4-5h)

#### 1. Setup Vite + React
```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
```

#### 2. Dépendances
```bash
npm install react-router-dom @tanstack/react-query axios
npm install -D tailwindcss postcss autoprefixer
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install react-hook-form zod @hookform/resolvers
npm install recharts date-fns
npm install lucide-react
```

#### 3. Structure
```
frontend/src/
├── api/              # Clients API Axios
├── components/       # Composants réutilisables
│   ├── ui/          # Shadcn components
│   ├── layout/      # Header, Sidebar, Footer
│   └── forms/       # Formulaires spécifiques
├── pages/           # Pages principales
│   ├── Dashboard.tsx
│   ├── Conventions.tsx
│   ├── Projets.tsx
│   ├── Fournisseurs.tsx
│   ├── AxesAnalytiques.tsx
│   ├── ComptesBancaires.tsx
│   ├── Depenses.tsx
│   └── Commissions.tsx
├── hooks/           # Custom hooks
├── types/           # Types TypeScript
├── utils/           # Utilitaires
└── App.tsx
```

#### 4. Pages à créer
- [ ] Dashboard avec statistiques (4 cards + 2 graphiques)
- [ ] CRUD Conventions (table + formulaire modal)
- [ ] CRUD Projets
- [ ] CRUD Fournisseurs
- [ ] CRUD Axes Analytiques
- [ ] CRUD Comptes Bancaires
- [ ] Gestion Dépenses (avec sélection convention, calcul auto commission)
- [ ] Visualisation Commissions (table + filtres + export Excel)

### Phase 3 : Features Avancées (2-3h)

- [ ] Authentification JWT complète
- [ ] Middleware de protection des routes
- [ ] Gestion des rôles (ADMIN, USER)
- [ ] Filtres avancés sur toutes les listes
- [ ] Pagination backend + frontend
- [ ] Exports Excel avec Apache POI
- [ ] Graphiques avec Recharts
- [ ] Notifications toast
- [ ] Loading states
- [ ] Error handling

### Phase 4 : Tests et Déploiement (2h)

- [ ] Tests unitaires backend (JUnit)
- [ ] Tests integration (Testcontainers)
- [ ] Tests E2E frontend (Cypress/Playwright)
- [ ] GitHub Actions CI/CD
- [ ] Dockerfile backend
- [ ] Dockerfile frontend
- [ ] Docker Compose production
- [ ] Documentation API complète

---

## 🎯 Ordre Recommandé

### Aujourd'hui (4-5h)
1. ✅ Créer tous les services backend (copier le pattern)
2. ✅ Créer tous les controllers (copier le pattern)
3. ✅ Tester avec Swagger UI
4. ✅ Commit + Push

### Demain (4-5h)
1. ✅ Setup frontend React + Vite + TailwindCSS
2. ✅ Créer Layout + Navigation
3. ✅ Créer page Dashboard
4. ✅ Créer page Conventions (CRUD complet)
5. ✅ Commit + Push

### Après-demain (4-5h)
1. ✅ Créer 4 autres pages CRUD (Projets, Fournisseurs, etc.)
2. ✅ Créer page Dépenses
3. ✅ Implémenter calcul auto commissions
4. ✅ Commit + Push

### Jour 4 (2-3h)
1. ✅ Page Commissions avec filtres
2. ✅ Export Excel
3. ✅ Authentication JWT
4. ✅ Deploy

---

## 📝 Commandes Utiles

### Tester le backend
```bash
# Démarrer PostgreSQL
docker-compose up -d postgres

# Démarrer Spring Boot
cd backend
./mvnw spring-boot:run

# Ouvrir Swagger
open http://localhost:8080/swagger-ui.html
```

### Créer un service rapidement
```bash
# Copier le template
cp backend/src/main/java/ma/investpro/service/ConventionService.java \
   backend/src/main/java/ma/investpro/service/ProjetService.java

# Remplacer Convention par Projet
# Remplacer convention par projet
```

### Créer un controller rapidement
```bash
# Copier le template
cp backend/src/main/java/ma/investpro/controller/ConventionController.java \
   backend/src/main/java/ma/investpro/controller/ProjetController.java

# Remplacer Convention par Projet
# Remplacer convention par projet
```

---

## ⚠️ Points d'Attention

### Backend
1. **DepenseInvestissementService** : La création d'une dépense avec convention doit automatiquement créer la commission
2. **Calculs automatiques** : TVA, retenues sont calculés dans @PrePersist/@PreUpdate
3. **Validation métier** : Vérifier que fournisseur non-résident → IS tiers 10% auto
4. **Retenue garantie** : Auto 10% sur montant HT

### Frontend
1. **Formulaire Dépense** : Quand on sélectionne convention → afficher preview commission calculée
2. **Validation** : Utiliser Zod pour validation côté client
3. **UX** : Loading states, error handling, success notifications
4. **Responsive** : Mobile-friendly avec TailwindCSS

---

## 🎉 Résultat Final

Une application web complète pour la gestion des dépenses d'investissement au Maroc avec :
- ✅ Backend API REST sécurisé
- ✅ Base de données PostgreSQL
- ✅ Frontend React moderne
- ✅ Calcul automatique des commissions
- ✅ Export Excel
- ✅ Dashboard statistiques
- ✅ Conforme aux spécificités marocaines (TVA 20%, IF, ICE, retenues, etc.)
