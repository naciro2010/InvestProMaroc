# InvestPro Maroc - Gestion des Dépenses d'Investissement

## 📋 Description

Application web de gestion des dépenses d'investissement et de calcul des commissions d'intervention.

### Fonctionnalités principales

- ✅ **Gestion des référentiels** : Conventions, Projets, Fournisseurs, Axes analytiques, Comptes bancaires
- ✅ **Saisie et suivi des dépenses** : Factures, paiements, retenues
- ✅ **Calcul automatique des commissions** : Selon conventions paramétrées
- ✅ **Reporting avancé** : États détaillés, export Excel

### Spécificités Maroc

- TVA 20% (taux standard)
- IF et ICE pour fournisseurs
- Retenue garantie 10%
- IS tiers 10% pour non-résidents
- RIB 24 caractères format marocain

## 🏗️ Architecture

### Backend
- **Framework** : Spring Boot 3.2+
- **Database** : PostgreSQL 15+
- **Migrations** : Flyway
- **Sécurité** : JWT
- **API** : REST

### Frontend
- **Framework** : React 18 + Vite
- **UI** : TailwindCSS + Shadcn/ui
- **State** : React Query
- **Forms** : React Hook Form + Zod
- **Export** : ExcelJS

## 🚀 Démarrage rapide

### Prérequis

- Java 21+
- Node.js 20+
- PostgreSQL 15+
- Maven 3.9+

### Installation

#### Backend
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Configuration

Créer `backend/src/main/resources/application-local.properties` :
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/investpro
spring.datasource.username=postgres
spring.datasource.password=your_password
```

## 📚 Documentation

- [Guide Utilisateur](docs/USER_GUIDE.md)
- [API Documentation](http://localhost:8080/swagger-ui.html)
- [Architecture](docs/ARCHITECTURE.md)

## 📄 Licence

Propriétaire - Tous droits réservés
