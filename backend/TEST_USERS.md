il # Test Users - InvestPro Maroc Backend

## 📋 Utilisateurs de Test Créés par la Migration

La migration `V1__clean_schema.sql` crée automatiquement **6 utilisateurs de test** avec différents rôles et permissions.

---

## 🔐 Identifiants de Connexion

### 1️⃣ ADMIN USER
**Rôle:** ADMIN (Accès complet au système)

| Champ | Valeur |
|-------|--------|
| **Username** | `admin` |
| **Email** | `admin@investpro.ma` |
| **Password** | `admin123` |
| **Nom Complet** | Administrateur Système |
| **Rôles** | ADMIN |
| **Permissions** | Accès complet, gestion des users, configurations système |

---

### 2️⃣ MANAGER USER
**Rôle:** MANAGER (Gestion des conventions et marchés)

| Champ | Valeur |
|-------|--------|
| **Username** | `manager` |
| **Email** | `manager@investpro.ma` |
| **Password** | `manager123` |
| **Nom Complet** | Manager des Conventions |
| **Rôles** | MANAGER |
| **Permissions** | Créer/modifier conventions, marchés, décomptes |

---

### 3️⃣ STANDARD USER
**Rôle:** USER (Lecture des rapports et exports)

| Champ | Valeur |
|-------|--------|
| **Username** | `user` |
| **Email** | `user@investpro.ma` |
| **Password** | `user123` |
| **Nom Complet** | Utilisateur Standard |
| **Rôles** | USER |
| **Permissions** | Lecture rapports, exports Excel, visualisations |

---

### 4️⃣ ANALYST USER
**Rôle:** MANAGER (Analyses financières)

| Champ | Valeur |
|-------|--------|
| **Username** | `analyst` |
| **Email** | `analyst@investpro.ma` |
| **Password** | `analyst123` |
| **Nom Complet** | Analyste Financier |
| **Rôles** | MANAGER |
| **Permissions** | Analyse des données, reportings, KPIs |

---

### 5️⃣ CONTROLLER USER
**Rôle:** MANAGER (Contrôle et approbations)

| Champ | Valeur |
|-------|--------|
| **Username** | `controller` |
| **Email** | `controller@investpro.ma` |
| **Password** | `controller123` |
| **Nom Complet** | Contrôleur Financier |
| **Rôles** | MANAGER |
| **Permissions** | Vérification, approbation, validation des opérations |

---

### 6️⃣ SUPERVISOR USER
**Rôle:** USER (Supervision régionale)

| Champ | Valeur |
|-------|--------|
| **Username** | `supervisor` |
| **Email** | `supervisor@investpro.ma` |
| **Password** | `supervisor123` |
| **Nom Complet** | Superviseur Régional |
| **Rôles** | USER |
| **Permissions** | Visualisation données régionales, rapports |

---

## 🔐 Rôles et Permissions

### ADMIN
- ✅ Accès complet à tous les endpoints
- ✅ Gestion des utilisateurs et rôles
- ✅ Configuration du système
- ✅ Suppression et opérations sensibles

### MANAGER
- ✅ Créer et modifier conventions
- ✅ Gérer marchés et avenants
- ✅ Créer décomptes et ordres de paiement
- ✅ Approuver les opérations
- ❌ Pas d'accès aux configuration système
- ❌ Pas de gestion d'utilisateurs

### USER
- ✅ Lire les rapports et statistiques
- ✅ Exporter en Excel
- ✅ Visualiser les données
- ❌ Pas de création/modification
- ❌ Pas d'approbations
- ❌ Pas d'accès aux opérations sensibles

---

## 🧪 Test de Connexion

### Via cURL
```bash
# Connexion avec ADMIN
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Réponse attendue (avec JWT token):
# {
#   "success": true,
#   "message": "Connexion réussie",
#   "data": {
#     "token": "eyJhbGc...",
#     "refreshToken": "eyJhbGc...",
#     "user": {
#       "id": 1,
#       "username": "admin",
#       "email": "admin@investpro.ma",
#       "fullName": "Administrateur Système",
#       "roles": ["ADMIN"]
#     }
#   }
# }
```

### Via Postman
1. **POST** `http://localhost:8080/api/auth/login`
2. **Body** (JSON):
```json
{
  "username": "admin",
  "password": "admin123"
}
```
3. Récupérer le `token` de la réponse
4. Ajouter header à les requêtes suivantes:
   - `Authorization: Bearer <token>`

### Via Frontend (Vue/React)
```javascript
// Login
const response = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const data = await response.json();
const token = data.data.token;

// Store token
localStorage.setItem('access_token', token);

// Use in API calls
const apiResponse = await fetch('http://localhost:8080/api/v1/conventions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🔄 Endpoints de Test

### Vérifier un Utilisateur
```bash
# Récupérer tous les utilisateurs (ADMIN seulement)
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/users

# Vérifier les rôles actuels
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/users/me
```

### Tester les Permissions MANAGER
```bash
# MANAGER peut créer une convention
curl -X POST http://localhost:8080/api/v1/conventions \
  -H "Authorization: Bearer <manager_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CONV-2025-001",
    "numero": "CONV-2025-001",
    "libelle": "Convention Test",
    ...
  }'
```

### Tester les Permissions USER
```bash
# USER peut lire les rapports
curl -H "Authorization: Bearer <user_token>" \
  http://localhost:8080/api/v1/reporting/conventions

# USER NE PEUT PAS créer (403 Forbidden)
curl -X POST http://localhost:8080/api/v1/conventions \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{...}'  # → 403 Forbidden
```

---

## ⚠️ Important pour Production

🔴 **AVANT PRODUCTION:**

1. **Supprime ces utilisateurs de test:**
```sql
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE username IN ('admin', 'manager', 'user', 'analyst', 'controller', 'supervisor'));
DELETE FROM users WHERE username IN ('admin', 'manager', 'user', 'analyst', 'controller', 'supervisor');
```

2. **Crée les vrais utilisateurs** via l'interface d'administration

3. **Change les mots de passe** immédiatement

4. **Enable l'authentification 2FA** si possible

5. **Audit les logs** régulièrement

---

## 🔑 Comment Changer un Mot de Passe

```sql
-- Générer un nouveau hash BCrypt (exemple avec password: "NewPassword123")
-- Via bcrypt tool en ligne: https://bcrypt-generator.com/
-- Exemple: NewPassword123 → $2a$10$abcdef...

UPDATE users
SET password = '$2a$10$<bcrypt_hash_here>'
WHERE username = 'admin';
```

**Ou via l'API (si endpoint disponible):**
```bash
curl -X PUT http://localhost:8080/api/v1/users/me/password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "admin123",
    "newPassword": "MyNewSecurePassword!"
  }'
```

---

## 📊 Vérification de la Base de Données

```bash
# Vérifier les utilisateurs créés
psql -U postgres -d investpro
SELECT id, username, email, full_name FROM users;

# Vérifier les rôles assignés
SELECT u.username, ur.role FROM users u
JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.username;

# Vérifier qu'un utilisateur est actif
SELECT * FROM users WHERE username = 'admin';
```

---

## 🎯 Résumé des Comptes de Test

| Username | Rôle | Accès | Password |
|----------|------|-------|----------|
| `admin` | ADMIN | Complet | `admin123` |
| `manager` | MANAGER | Conventions, Marchés | `manager123` |
| `analyst` | MANAGER | Rapports, Analytics | `analyst123` |
| `controller` | MANAGER | Vérification, Approbations | `controller123` |
| `user` | USER | Lecture, Exports | `user123` |
| `supervisor` | USER | Visualisation régionale | `supervisor123` |

---

**Créé:** 2025-12-31
**Version:** 1.0
**Dernière mise à jour:** Migration V1__clean_schema.sql
