# 🧪 Guide de Test Rapide - Wizard Convention

## 🚀 Démarrage Rapide

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```

➡️ Ouvrir http://localhost:5173

### 2. Backend
```bash
cd backend
./gradlew bootRun
```

➡️ API disponible sur http://localhost:8080

---

## ✅ Tests à Effectuer

### TEST 1: Navigation Wizard
- [ ] Accéder à `/conventions/nouvelle`
- [ ] Naviguer les 8 étapes avec les boutons "Suivant/Retour"
- [ ] Vérifier que la barre de progression (Stepper) fonctionne
- [ ] Vérifier que le bouton "Suivant" est bloqué si validation échoue

### TEST 2: Étape 1 - Informations
- [ ] Sélectionner Type: CADRE
- [ ] Remplir Numéro: `CONV-2026-001`
- [ ] Remplir Code: `C2026001`
- [ ] Remplir Libellé et Objet
- [ ] Vérifier validation des champs requis

### TEST 3: Étape 2 - Budget
- [ ] Entrer Budget Global: `10000000` (10M MAD)
- [ ] Ajouter une ligne budget
- [ ] Entrer Montant HT: `5000000`
- [ ] Entrer TVA: `20`
- [ ] **Vérifier calcul auto TTC**: Doit afficher `6000000`
- [ ] Vérifier que le total des lignes s'affiche

### TEST 4: Étape 3 - Commission
- [ ] Sélectionner Base: TTC
- [ ] Sélectionner Mode: TAUX_FIXE
- [ ] Entrer Taux: `2.5`
- [ ] **Vérifier aperçu calcul**: Doit afficher `250,000 MAD` (2.5% de 10M)

### TEST 5: Étape 4 - Partenaires ⭐
- [ ] Ajouter partenaire MOA
- [ ] Entrer Nom: `Ministère XYZ`
- [ ] **Entrer Budget Alloué**: `5000000`
- [ ] **Vérifier calcul auto pourcentage**: Doit afficher `50%`
- [ ] Ajouter partenaire MOD
- [ ] **Entrer Pourcentage**: `50`
- [ ] **Vérifier calcul auto budget**: Doit afficher `5000000 MAD`
- [ ] Cocher "Est Maître d'Œuvre Délégué"
- [ ] **Vérifier total**: Doit être `100%` et `10M MAD`

### TEST 6: Étape 5 - Subventions
- [ ] Ajouter une subvention
- [ ] Remplir Organisme, Type, Montant
- [ ] Sélectionner Date échéance
- [ ] Supprimer et ré-ajouter (test CRUD)

### TEST 7: Étape 6 - Imputations ⭐ (DYNAMIQUE)
- [ ] **Vérifier que les dimensions se chargent depuis l'API**
- [ ] Si aucune dimension: Message "Aucune dimension active"
- [ ] Si dimensions existent: Dropdown pour chaque dimension
- [ ] Sélectionner valeurs pour chaque dimension
- [ ] Entrer Date démarrage: `2026-01-01`
- [ ] Entrer Délai: `12` mois
- [ ] **Vérifier calcul auto Date Fin**: Doit afficher `2027-01-01`
- [ ] Ajouter 2ème imputation, tester suppression

### TEST 8: Étape 7 - Versements ⭐ (DYNAMIQUE)
- [ ] Ajouter versement
- [ ] Entrer Date: `2026-03-01`
- [ ] Entrer Montant: `2000000`
- [ ] Sélectionner Partenaire bénéficiaire (liste step 4)
- [ ] **Vérifier MOD Responsable**: Liste filtrée (seulement MOD)
- [ ] Sélectionner dimensions analytiques
- [ ] Ajouter 2ème versement
- [ ] **Vérifier Total prévisionnel**: Somme des montants

### TEST 9: Étape 8 - Récapitulatif
- [ ] Vérifier affichage Informations de base
- [ ] Vérifier Budget global
- [ ] Vérifier Partenaires (chips colorés)
- [ ] Vérifier Imputations (si présentes)
- [ ] Vérifier Versements (si présents)
- [ ] Cliquer "Créer en Brouillon"
- [ ] **Vérifier API call POST /conventions**
- [ ] Vérifier redirection vers /conventions

### TEST 10: Dashboard
- [ ] Accéder à `/` ou `/dashboard`
- [ ] Vérifier KPIs (Conventions, Budgets, Décomptes, Paiements)
- [ ] Vérifier Taux d'exécution budgétaire
- [ ] Vérifier Activité récente
- [ ] Cliquer "Nouvelle Convention" → Doit rediriger vers wizard
- [ ] Cliquer "Voir Conventions" → Doit rediriger vers liste

---

## 🔧 Tests Backend API

### 1. Vérifier Migrations Flyway
```bash
# Se connecter à PostgreSQL
psql -U postgres -d investpro

# Vérifier migrations
SELECT version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC;

# Doit afficher:
# | 4 | seed test conventions fixed      | true | ...
# | 3 | seed test conventions            | true | ...
# | 2 | update user passwords            | true | ...
# | 1 | clean schema                     | true | ...
```

### 2. Tester API Dimensions
```bash
# Dimensions actives
curl http://localhost:8080/api/dimensions/actives | jq

# Valeurs d'une dimension (remplacer {id})
curl http://localhost:8080/api/dimensions/1/valeurs/actives | jq
```

**Résultat attendu**:
```json
[
  {
    "id": 1,
    "code": "AXE",
    "nom": "Axe Analytique",
    "obligatoire": true,
    "active": true,
    "valeurs": [...]
  }
]
```

### 3. Tester Création Convention
```bash
curl -X POST http://localhost:8080/api/conventions \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "CONV-TEST-001",
    "code": "CTEST001",
    "libelle": "Test Convention",
    "typeConvention": "CADRE",
    "statut": "BROUILLON",
    "budget": 10000000,
    "tauxCommission": 2.5,
    "dateDebut": "2026-01-01",
    "dateFin": "2027-12-31"
  }' | jq
```

---

## 🐛 Tests d'Erreur

### 1. Validation Frontend
- [ ] Laisser champ requis vide → Message erreur
- [ ] Entrer budget négatif → Validation échoue
- [ ] Total partenaires != 100% → Erreur Step 4
- [ ] Total lignes != budget global → Erreur Step 2

### 2. Dimensions Manquantes
- [ ] Si backend ne retourne pas de dimensions
- [ ] Vérifier message: "Aucune dimension analytique active"
- [ ] Wizard doit rester fonctionnel (dimensions optionnelles)

### 3. API Errors
- [ ] Couper backend → Vérifier message erreur
- [ ] Créer convention avec code existant → 409 Conflict
- [ ] Vérifier affichage des erreurs backend dans UI

---

## 📊 Tests de Performance

### Frontend
```bash
npm run build

# Vérifier taille bundle
ls -lh dist/assets/*.js

# Doit être < 500 KB (gzip: 450 KB)
```

### Backend
```bash
# Tester temps de réponse API
time curl http://localhost:8080/api/dimensions/actives

# Doit être < 200ms
```

---

## ✅ Checklist Finale

### Frontend
- [ ] Build sans erreur TypeScript
- [ ] Build sans warning Vite important
- [ ] Toutes étapes wizard fonctionnelles
- [ ] Calculs automatiques corrects
- [ ] Dimensions dynamiques chargées
- [ ] Dashboard accessible
- [ ] Navigation fluide
- [ ] UI responsive (mobile + desktop)

### Backend
- [ ] Toutes migrations Flyway OK
- [ ] API dimensions retourne data
- [ ] POST /conventions crée en BROUILLON
- [ ] Foreign keys respectées
- [ ] Pas de data orphelines

### Général
- [ ] Aucune erreur console
- [ ] Aucune erreur réseau
- [ ] Thème bleu appliqué partout
- [ ] Textes en français corrects

---

## 🎯 Scénario de Test Complet

**Temps estimé**: 15-20 minutes

1. ✅ Démarrer backend + frontend
2. ✅ Créer convention complète (8 étapes)
3. ✅ Vérifier DB: `SELECT * FROM conventions WHERE code = 'CTEST001'`
4. ✅ Vérifier partenaires créés
5. ✅ Vérifier dashboard affiche nouvelle convention
6. ✅ Créer 2ème convention avec dimensions
7. ✅ Vérifier calculs automatiques
8. ✅ Tester suppression d'éléments
9. ✅ Tester validation erreurs
10. ✅ Vérifier responsive mobile

---

## 🚨 Problèmes Connus

### Si dimensions ne chargent pas:
```bash
# Vérifier que l'API retourne bien les données
curl http://localhost:8080/api/dimensions/actives

# Vérifier console browser pour erreurs CORS
# Vérifier Network tab dans DevTools
```

### Si build frontend échoue:
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Si migrations Flyway échouent:
```sql
-- Réparer V3 si nécessaire
DELETE FROM flyway_schema_history WHERE version = '3' AND success = false;

-- Relancer application
./gradlew bootRun
```

---

**✨ Bon test! Tout devrait fonctionner parfaitement.**
