# 📝 Template pour Créer les Pages CRUD Restantes

Ce document explique comment créer les pages CRUD manquantes en utilisant `ProjetsCRUD.tsx` comme modèle.

## 🎯 Pages à Créer

1. ✅ **ProjetsCRUD.tsx** - Déjà créé (modèle de référence)
2. ⏳ **ConventionsCRUD.tsx** - À créer
3. ⏳ **FournisseursCRUD.tsx** - À créer
4. ⏳ **AxesAnalytiquesCRUD.tsx** - À créer
5. ⏳ **ComptesBancairesCRUD.tsx** - À créer

## 📋 Structure Type d'une Page CRUD

```typescript
// 1. Imports
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { [entityAPI] } from '@/lib/api' // ← Changer selon l'entité

// 2. Interface TypeScript
interface [Entity] {
  id: number
  // ... champs spécifiques
  actif: boolean
}

// 3. Component
const [Entity]CRUD = () => {
  // State management
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing[Entity], setEditing[Entity]] = useState<[Entity] | null>(null)
  const [formData, setFormData] = useState({ /* initial values */ })
  const [error, setError] = useState('')

  // Queries & Mutations
  const { data, isLoading } = useQuery({
    queryKey: ['[entities]'],
    queryFn: async () => {
      const response = await [entityAPI].getAll()
      return response.data.data
    },
  })

  // CRUD operations...

  // Render
  return (
    <AppLayout>
      {/* Header + Search + Table + Modal */}
    </AppLayout>
  )
}

export default [Entity]CRUD
```

## 🔧 Guide de Création Rapide

### 1. ConventionsCRUD.tsx

**Champs du formulaire** :
```typescript
interface Convention {
  id: number
  code: string
  libelle: string
  tauxCommission: number
  baseCalcul: string // HT, TTC, AUTRE
  tauxTva: number
  dateDebut: string
  dateFin?: string
  description?: string
  actif: boolean
}

const formData = {
  code: '',
  libelle: '',
  tauxCommission: 0,
  baseCalcul: 'HT',
  tauxTva: 20.00,
  dateDebut: '',
  dateFin: '',
  description: '',
}
```

**Colonnes de table** :
- Code
- Libellé
- Taux (%)
- Base Calcul
- TVA (%)
- Date Début
- Actions

### 2. FournisseursCRUD.tsx

**Champs du formulaire** :
```typescript
interface Fournisseur {
  id: number
  code: string
  raisonSociale: string
  identifiantFiscal?: string
  ice?: string
  adresse?: string
  ville?: string
  telephone?: string
  email?: string
  contact?: string
  nonResident: boolean
  actif: boolean
}

const formData = {
  code: '',
  raisonSociale: '',
  identifiantFiscal: '',
  ice: '',
  adresse: '',
  ville: '',
  telephone: '',
  email: '',
  contact: '',
  nonResident: false,
}
```

**Colonnes de table** :
- Code
- Raison Sociale
- ICE
- Ville
- Téléphone
- Non-Résident (badge)
- Actions

### 3. AxesAnalytiquesCRUD.tsx

**Champs du formulaire** :
```typescript
interface AxeAnalytique {
  id: number
  code: string
  libelle: string
  type?: string
  description?: string
  actif: boolean
}

const formData = {
  code: '',
  libelle: '',
  type: '',
  description: '',
}
```

**Colonnes de table** :
- Code
- Libellé
- Type
- Actions

### 4. ComptesBancairesCRUD.tsx

**Champs du formulaire** :
```typescript
interface CompteBancaire {
  id: number
  code: string
  rib: string // 24 caractères
  banque: string
  agence?: string
  typeCompte?: string
  titulaire?: string
  devise: string
  actif: boolean
}

const formData = {
  code: '',
  rib: '',
  banque: '',
  agence: '',
  typeCompte: 'GENERAL',
  titulaire: '',
  devise: 'MAD',
}
```

**Colonnes de table** :
- Code
- RIB
- Banque
- Agence
- Type
- Actions

## 🎨 Éléments Réutilisables

### Badges de Statut
```typescript
// Badge Actif/Inactif
<span className={`px-2 py-1 text-xs font-medium rounded-full ${
  item.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
}`}>
  {item.actif ? 'Actif' : 'Inactif'}
</span>

// Badge Non-Résident
<span className={`px-2 py-1 text-xs font-medium rounded-full ${
  item.nonResident ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
}`}>
  {item.nonResident ? 'Non-Résident' : 'Résident'}
</span>
```

### Validation RIB (24 chiffres)
```typescript
<input
  type="text"
  maxLength={24}
  pattern="[0-9]{24}"
  value={formData.rib}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, '') // Seulement des chiffres
    setFormData({ ...formData, rib: value })
  }}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
  placeholder="000000000000000000000000"
/>
```

### Validation ICE (15 chiffres)
```typescript
<input
  type="text"
  maxLength={15}
  pattern="[0-9]{15}"
  value={formData.ice}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, '')
    setFormData({ ...formData, ice: value })
  }}
  placeholder="000000000000000"
/>
```

### Format Date
```typescript
<input
  type="date"
  value={formData.dateDebut}
  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
/>
```

### Select avec options
```typescript
<select
  value={formData.baseCalcul}
  onChange={(e) => setFormData({ ...formData, baseCalcul: e.target.value })}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>
  <option value="HT">Hors Taxes (HT)</option>
  <option value="TTC">Toutes Taxes Comprises (TTC)</option>
  <option value="AUTRE">Autre</option>
</select>
```

### Checkbox
```typescript
<div className="flex items-center">
  <input
    type="checkbox"
    checked={formData.nonResident}
    onChange={(e) => setFormData({ ...formData, nonResident: e.target.checked })}
    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
  />
  <label className="ml-2 block text-sm text-gray-700">
    Fournisseur non-résident (IS tiers 10%)
  </label>
</div>
```

## 🚀 Commandes pour Créer une Page

```bash
# 1. Copier le template
cp frontend/src/pages/ProjetsCRUD.tsx frontend/src/pages/ConventionsCRUD.tsx

# 2. Rechercher/Remplacer dans le fichier
# Projet → Convention
# projet → convention
# projets → conventions
# projetsAPI → conventionsAPI

# 3. Adapter les champs du formulaire et les colonnes

# 4. Tester !
```

## 📝 Checklist par Page

- [ ] Créer le fichier `[Entity]CRUD.tsx`
- [ ] Définir l'interface TypeScript
- [ ] Configurer formData initial
- [ ] Définir les colonnes de la table
- [ ] Adapter les champs du formulaire
- [ ] Tester la création
- [ ] Tester la modification
- [ ] Tester la suppression
- [ ] Tester la recherche
- [ ] Ajouter la route dans `App.tsx`

## 🎯 Points Importants

1. **Toujours valider les données côté client**
2. **Utiliser les patterns de champs appropriés** (RIB, ICE, email, etc.)
3. **Gérer les erreurs de l'API**
4. **Afficher des messages de confirmation**
5. **Invalider le cache React Query après mutations**

## 💡 Astuce

Pour gagner du temps, vous pouvez créer toutes les pages en une seule fois avec un script :

```bash
#!/bin/bash
entities=("Conventions" "Fournisseurs" "AxesAnalytiques" "ComptesBancaires")

for entity in "${entities[@]}"; do
  cp frontend/src/pages/ProjetsCRUD.tsx "frontend/src/pages/${entity}CRUD.tsx"
  # Puis adapter manuellement chaque fichier
done
```

---

**Note** : Le fichier `ProjetsCRUD.tsx` sert de **modèle de référence complet**. Tous les autres CRUD suivent exactement la même structure !
