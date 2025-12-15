# Déploiement de la Démo sur GitHub Pages

Ce document explique comment déployer la version démo statique du frontend InvestPro Maroc sur GitHub Pages.

## 🚀 Configuration GitHub Pages

### 1. Activer GitHub Pages

1. Allez dans les paramètres du repository GitHub : `Settings` > `Pages`
2. Dans la section **Source**, sélectionnez :
   - Source: `GitHub Actions`
3. Sauvegardez les modifications

### 2. Déploiement automatique

Le workflow GitHub Actions est configuré pour se déclencher automatiquement :
- À chaque push sur la branche `claude/deploy-static-demo-page-TgOpe`
- Manuellement via l'onglet "Actions" dans GitHub

### 3. Accéder à la démo

Une fois le déploiement terminé, la démo sera accessible à :

**URL de la démo :** `https://naciro2010.github.io/InvestProMaroc/`

## 📋 Vérification du déploiement

1. Allez dans l'onglet **Actions** de votre repository GitHub
2. Vérifiez que le workflow "Deploy Demo to GitHub Pages" s'exécute avec succès
3. Une fois terminé (icône verte ✓), la démo est en ligne

## 🔧 Configuration technique

### Fichiers configurés pour GitHub Pages

1. **`.github/workflows/deploy-demo.yml`** : Workflow GitHub Actions
2. **`frontend/vite.config.ts`** : Configuration du base path `/InvestProMaroc/`
3. **`frontend/public/404.html`** : Gestion du routing SPA
4. **`frontend/index.html`** : Script de redirection pour le routing client-side

### Caractéristiques de la démo

- ✅ Build optimisé pour la production
- ✅ Routing client-side fonctionnel (React Router)
- ✅ Déploiement automatique sur chaque push
- ✅ Certificat SSL automatique (HTTPS)
- ✅ CDN global de GitHub

## 🎯 Partager la démo avec votre client

Envoyez simplement l'URL à votre client :

```
https://naciro2010.github.io/InvestProMaroc/
```

### Comptes de démonstration

Pour permettre à votre client de tester l'application, vous pouvez créer des comptes de démonstration ou utiliser le mode démo intégré.

**Note importante :** Cette version statique ne contient pas de backend. Pour une démo complète avec backend, vous devrez déployer le backend sur un service comme Heroku, Railway, ou Render.

## 🔄 Mettre à jour la démo

Pour mettre à jour la démo, il suffit de :

1. Faire vos modifications dans le code frontend
2. Commit et push sur la branche `claude/deploy-static-demo-page-TgOpe`
3. Le déploiement se fera automatiquement

```bash
git add .
git commit -m "Update demo"
git push -u origin claude/deploy-static-demo-page-TgOpe
```

## ⚠️ Limitations de la version statique

Cette version démo est statique et présente quelques limitations :

- ❌ Pas de connexion backend réelle (API calls ne fonctionneront pas)
- ❌ Pas de persistance des données
- ✅ Interface utilisateur complète et fonctionnelle
- ✅ Navigation entre les pages
- ✅ Animations et interactions UI

## 💡 Prochaines étapes

Pour une démo complète avec backend :

1. Déployer le backend sur un service cloud (Heroku, Railway, Render)
2. Configurer les variables d'environnement dans GitHub Actions
3. Pointer le frontend vers l'URL du backend déployé

## 🆘 Dépannage

### Le site ne se charge pas

- Vérifiez que GitHub Pages est activé dans les paramètres
- Vérifiez que le workflow s'est exécuté avec succès dans l'onglet Actions
- Attendez quelques minutes après le premier déploiement

### Le routing ne fonctionne pas

- Vérifiez que le fichier `404.html` est présent dans le dossier `frontend/public/`
- Vérifiez que le script de redirection est présent dans `index.html`

### Les assets ne se chargent pas

- Vérifiez que le `base` path est configuré à `/InvestProMaroc/` dans `vite.config.ts`
