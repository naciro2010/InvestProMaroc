# Configuration de Déploiement Multiple (Railway + GitHub Pages)

## Problème Résolu

Lors de la migration vers Railway, la configuration `base: '/'` dans `vite.config.ts` a cassé le déploiement GitHub Pages qui nécessite `base: '/InvestProMaroc/'`.

## Solution Implémentée

La configuration Vite a été rendue dynamique pour supporter les deux plateformes automatiquement via une variable d'environnement.

### Configuration Vite (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  // Dynamic base path:
  // - GitHub Pages: /InvestProMaroc/
  // - Railway/Local: /
  base: process.env.VITE_BASE_PATH || '/',
  // ...
})
```

### Variables d'Environnement

| Variable | Valeur GitHub Pages | Valeur Railway | Valeur Local |
|----------|---------------------|----------------|--------------|
| `VITE_BASE_PATH` | `/InvestProMaroc/` | `/` (ou vide) | `/` (ou vide) |
| `VITE_API_URL` | Production backend | Production backend | `http://localhost:8080/api` |

## Déploiements Actifs

### 1. GitHub Pages (Demo)
- **URL**: https://naciro2010.github.io/InvestProMaroc/
- **Workflow**: `.github/workflows/deploy-demo.yml`
- **Déclencheur**: Push sur `main` ou dispatch manuel
- **Configuration**: `VITE_BASE_PATH=/InvestProMaroc/` (défini dans le workflow)

### 2. Railway (Production)
- **URL**: https://[votre-app].up.railway.app
- **Configuration**: `railway.json`
- **Déclencheur**: Push sur `main` (auto-deploy)
- **Configuration**: `VITE_BASE_PATH` non défini (utilise `/` par défaut)

### 3. Développement Local
- **URL**: http://localhost:5173
- **Commande**: `npm run dev`
- **Configuration**: `VITE_BASE_PATH` non défini (utilise `/` par défaut)

## Comment Ça Marche

### GitHub Pages Deployment

Le workflow GitHub Actions définit `VITE_BASE_PATH=/InvestProMaroc/` lors du build :

```yaml
- name: Build
  working-directory: ./frontend
  run: npm run build
  env:
    VITE_BASE_PATH: /InvestProMaroc/
    VITE_API_URL: https://investpromaroc-production.up.railway.app/api
```

### Railway Deployment

Railway ne définit pas `VITE_BASE_PATH`, donc la valeur par défaut `/` est utilisée :

```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

### Développement Local

En local, `VITE_BASE_PATH` n'est pas défini (ou défini à `/`), donc l'application fonctionne à la racine.

## Tests

### Tester GitHub Pages en Local

```bash
cd frontend

# Build avec le base path GitHub Pages
VITE_BASE_PATH=/InvestProMaroc/ npm run build

# Tester avec serve
npx serve -s dist -l 3000

# Accéder à http://localhost:3000/InvestProMaroc/
```

### Tester Railway en Local

```bash
cd frontend

# Build avec le base path Railway (ou sans)
npm run build

# Tester avec serve
npm start  # ou: serve -s dist -l 3000

# Accéder à http://localhost:3000/
```

## Résolution de Problèmes

### GitHub Pages affiche une page blanche

1. Vérifier que le workflow définit `VITE_BASE_PATH=/InvestProMaroc/`
2. Vérifier que GitHub Pages est activé dans les paramètres du repo
3. Vérifier l'URL : doit être `https://username.github.io/InvestProMaroc/` (avec le slash final)

### Railway affiche une 404 lors du refresh

1. Vérifier que `serve -s` est utilisé dans le `package.json` : `"start": "serve -s dist -l 3000"`
2. Vérifier que `railway.json` utilise `npm start` comme `startCommand`
3. La flag `-s` active le mode SPA (Single Page Application) qui redirige toutes les routes vers `index.html`

### Les assets ne chargent pas

1. Vérifier le `base` dans `vite.config.ts`
2. Vérifier les logs de la console navigateur pour les erreurs de chargement
3. Vérifier que les chemins dans le HTML buildé utilisent le bon préfixe :
   - GitHub Pages : `/InvestProMaroc/assets/...`
   - Railway : `/assets/...`

## Avantages de Cette Solution

✅ **Un seul code source** pour les deux déploiements
✅ **Configuration automatique** via variables d'environnement
✅ **Pas de branches séparées** à maintenir
✅ **Facile à tester** localement
✅ **Déploiement GitHub Pages restauré** sans casser Railway

## Alternatives Considérées

### ❌ Solution 1 : Deux configurations séparées
- Nécessite deux fichiers de config Vite
- Risque de désynchronisation
- Complexité inutile

### ❌ Solution 2 : Désactiver GitHub Pages
- Perte de l'environnement de demo
- Moins de visibilité pour le projet

### ✅ Solution 3 : Variable d'environnement dynamique (CHOISIE)
- Simple et élégante
- Facile à maintenir
- Supporte n'importe quelle plateforme

## Références

- [Vite Base Path](https://vitejs.dev/config/shared-options.html#base)
- [GitHub Pages Deployment](https://docs.github.com/en/pages)
- [Railway Deployment](https://docs.railway.app/)
- [Serve CLI Options](https://github.com/vercel/serve)
