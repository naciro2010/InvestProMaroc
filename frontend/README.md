# InvestPro Maroc - Frontend

Interface utilisateur moderne pour la gestion des dépenses d'investissement au Maroc.

## 🚀 Technologies

- **React 18** avec TypeScript
- **Vite** pour le bundling ultra-rapide
- **TailwindCSS** pour le styling
- **Framer Motion** pour les animations
- **React Router** pour la navigation
- **React Query** pour la gestion des données
- **Axios** pour les requêtes API

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

## 🏃 Démarrage

```bash
# Mode développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

L'application sera disponible sur [http://localhost:5173](http://localhost:5173)

## 📁 Structure

```
src/
├── components/       # Composants réutilisables
├── contexts/         # React Contexts (Auth, etc.)
├── lib/              # Utilitaires et configuration API
├── pages/            # Pages de l'application
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── Dashboard.tsx
├── App.tsx           # Router principal
├── main.tsx          # Point d'entrée
└── index.css         # Styles globaux
```

## 🎨 Fonctionnalités

### Landing Page
- Design moderne et responsive
- Animations fluides avec Framer Motion
- Présentation des fonctionnalités
- CTA clairs et engageants

### Authentification
- Login avec username/password
- Register avec validation
- JWT tokens (access + refresh)
- Protected routes
- Auto-refresh des tokens

### Dashboard
- Vue d'ensemble des statistiques
- Graphiques interactifs
- Actions rapides
- Responsive design

## 🔐 Authentification

L'authentification utilise JWT avec access token et refresh token :

```typescript
// Login
const { login } = useAuth()
await login('username', 'password')

// Register
const { register } = useAuth()
await register({ username, email, password, fullName })

// Logout
const { logout } = useAuth()
logout()

// Vérifier si authentifié
const { isAuthenticated, user } = useAuth()
```

## 🎨 Thème et Design

### Couleurs
- **Primary** : Bleu (InvestPro brand)
- **Accent** : Violet (highlights)
- **Success** : Vert
- **Error** : Rouge

### Composants
Tous les composants suivent le même pattern de design :
- Rounded corners (xl, 2xl)
- Shadows (lg, xl, 2xl)
- Transitions fluides
- Hover states

## 🌐 API Client

Le client API est configuré avec Axios et interceptors :

```typescript
import { api, authAPI, conventionsAPI } from '@/lib/api'

// Auth
await authAPI.login(username, password)
await authAPI.register(data)

// Conventions
const conventions = await conventionsAPI.getAll()
```

## 🔧 Configuration

Variables d'environnement (`.env`) :

```env
VITE_API_URL=http://localhost:8080/api
```

## 📱 Responsive Design

L'application est entièrement responsive :
- Mobile first approach
- Breakpoints Tailwind (sm, md, lg, xl)
- Navigation adaptive
- Grilles responsives

## 🚀 Déploiement

```bash
# Build
npm run build

# Le dossier dist/ contient les fichiers statiques prêts pour le déploiement
```

## 📄 Licence

Propriétaire - Tous droits réservés
