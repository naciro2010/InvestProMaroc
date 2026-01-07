# 📊 Analyse Cahier des Charges vs Existant
## InvestProMaroc - Logiciel de Gestion MOD

Date: 2026-01-06

---

## 🎯 Résumé Exécutif

| Module | Backend | Frontend | Complétude | Priorité Développement |
|--------|---------|----------|------------|----------------------|
| **Conventions** | ✅ 90% | ✅ 85% | 🟢 Excellent | Amélioration mineure |
| **Référentiel Analytique** | ✅ 80% | ⚠️ 50% | 🟡 Bon | Interface axes à créer |
| **Budget** | ✅ 95% | ✅ 80% | 🟢 Excellent | Validation règles métier |
| **Marchés** | ✅ 95% | ✅ 85% | 🟢 Excellent | Enrichissement |
| **Décomptes** | ✅ 95% | ⚠️ 60% | 🟡 Bon | Interface retenues/RAS |
| **Paiements** | ✅ 90% | ✅ 75% | 🟢 Bon | Finalisation ordres |
| **Retenues & Garanties** | ✅ 85% | ⚠️ 40% | 🟡 Moyen | Interface gestion RG |
| **RAS (Reversements)** | ✅ 70% | ❌ 10% | 🔴 Faible | **PRIORITÉ HAUTE** |
| **Commission** | ✅ 75% | ⚠️ 30% | 🟡 Moyen | **PRIORITÉ HAUTE** |

---

## 📋 Analyse Détaillée par Module

### 1️⃣ MODULE CONVENTIONS

#### ✅ CE QUI EXISTE

**Backend (Convention.kt) :**
```kotlin
- Types: Cadre/Spécifique/Non-cadre ✅
- Numéro, dates, statuts (workflow complet) ✅
- Montants (global, détails) ✅
- Subventions (relation One-to-Many) ✅
- Partenaires (ConventionPartenaire) ✅
- Sous-conventions (hiérarchie parent/enfant) ✅
- Paramétrage commission (taux, base calcul) ✅
- Imputations prévisionnelles ✅
- Versements prévisionnels ✅
- Workflow: BROUILLON → SOUMIS → VALIDEE → EN_COURS → ACHEVE ✅
```

**Frontend :**
```
- ConventionsPageMUI (liste) ✅
- ConventionWizardComplete (création/édition) ✅
- ConventionDetailPage (détail avec tabs) ✅
- Gestion subventions ✅
- Gestion imputations/versements (avec suppression) ✅
```

#### ⚠️ CE QUI MANQUE

**Backend :**
- [ ] **Avenants Convention** : Entité Avenant existe mais non liée à Convention (urgent)
- [ ] Historique "avant/après" pour avenants
- [ ] Validation automatique : dépassement plafond
- [ ] Gestion pièces jointes (métadonnées)

**Frontend :**
- [ ] **Page gestion des avenants** (création, historique, impact)
- [ ] Upload/visualisation pièces jointes
- [ ] Alertes dépassement budget vs plafond convention
- [ ] Consolidation "version applicable" (Vn)

---

### 2️⃣ MODULE RÉFÉRENTIEL ANALYTIQUE (Projets + Axes)

#### ✅ CE QUI EXISTE

**Backend :**
```kotlin
- Projet.kt : code, nom, statut, workflow, budget, dates ✅
- DimensionAnalytique.kt : structure axes (type, code, hiérarchie) ✅
- ValeurDimension.kt : valeurs des axes ✅
- Relation Projet ↔ Convention (Many-to-Many via conventionId) ⚠️ (à vérifier)
```

**Frontend :**
```
- ProjetsPage (liste avec cards) ✅
- ProjetFormPage (création/édition) ✅
- ProjetDetailPage (détail complet avec tabs, graphique) ✅
```

#### ⚠️ CE QUI MANQUE

**Backend :**
- [ ] **Relation explicite Projet ↔ Axes** : table de liaison projet_axes (critique)
- [ ] Validation : Convention doit avoir ≥ 1 projet
- [ ] Filtrage axes par convention/projet

**Frontend :**
- [ ] **Page gestion des Axes** : CRUD pour DimensionAnalytique et ValeurDimension (urgent)
- [ ] Interface "Conventions → Projets → Axes hérités"
- [ ] Affectation axes aux projets
- [ ] Liste "Projets d'une convention" et "Conventions d'un projet"

**RECOMMANDATION :**
Créer une interface complète de gestion des axes analytiques avec arborescence visuelle.

---

### 3️⃣ MODULE BUDGET

#### ✅ CE QUI EXISTE

**Backend (Budget.kt) :**
```kotlin
- Budget initial (V0) ✅
- Révisions budgétaires (V1..Vn) ✅
- Montants, dates, statuts ✅
- Validation baseline ✅
```

**Frontend (BudgetsPage) :**
```
- Liste des budgets ✅
- Création/édition ✅
```

#### ⚠️ CE QUI MANQUE

**Backend :**
- [ ] **Lignes budgétaires détaillées** (postes/sous-postes/lignes)
- [ ] **Ventilation analytique** par projet/axe
- [ ] Contrôle : Total ≤ plafond conventionnel
- [ ] Validation équilibrage : somme ventilée = total budget

**Frontend :**
- [ ] Interface saisie budget détaillé (arborescence postes)
- [ ] Écran ventilation analytique (drag & drop ou formulaire)
- [ ] État "comparatif V0 vs Vn"
- [ ] État "budget ventilé par projet/axe"
- [ ] Alertes dépassement

**PRIORITÉ :** MOYENNE (fondation existe, besoin enrichissement)

---

### 4️⃣ MODULE MARCHÉS

#### ✅ CE QUI EXISTE

**Backend (Marche.kt, MarcheLigne.kt, AvenantMarche.kt) :**
```kotlin
- Fiche marché complète ✅
  • Numéro, date, objet, montants HT/TVA/TTC ✅
  • Fournisseur, convention ✅
  • Dates, délais, retenue garantie ✅
  • Statut workflow ✅
- Lignes marché (MarcheLigne) ✅
  • Désignation, quantité, PU, montants ✅
  • Imputation analytique (dimensions JSONB) ✅
- Avenants marché (AvenantMarche) ✅
  • Delta montant/durée ✅
  • Montant révisé calculé ✅
```

**Frontend (MarchesPage, MarcheDetailPage) :**
```
- Liste marchés ✅
- Détail marché ✅
```

#### ⚠️ CE QUI MANQUE

**Cahier des charges vs existant :**
- [ ] **Type de prestation** (liste paramétrable: travaux/études/AMO/fourniture...)
- [ ] **Mode de passation** (AO/consultation/gré à gré/avenant)
- [ ] **Notion de LOT** (Lot 1 Gros œuvre, Lot 2 Électricité)
- [ ] **Pièces jointes** (marché signé, OS, CCAP/CPS, PV)
- [ ] **Co-traitants / sous-traitants** (relation Many-to-Many)
- [ ] Identifiants fournisseur détaillés (ICE/IF/RC)

**Frontend :**
- [ ] Interface saisie lignes marché avec ventilation analytique
- [ ] Gestion des avenants (création, historique)
- [ ] Affichage montant révisé
- [ ] Upload pièces jointes
- [ ] Alertes : cumul décomptes ≤ montant marché

**PRIORITÉ :** MOYENNE (base solide, enrichissement fonctionnel)

---

### 5️⃣ MODULE DÉCOMPTES

#### ✅ CE QUI EXISTE

**Backend (Decompte.kt, DecompteRetenue.kt, DecompteImputation.kt) :**
```kotlin
- Fiche décompte complète ✅
  • Numéro, dates, période ✅
  • Montants: brutHT, TVA, TTC, netAPayer ✅
  • Cumuls: précédent, actuel ✅
  • Statut: BROUILLON/SOUMIS/VALIDE/PAYE ✅
- DecompteRetenue (GARANTIE, RAS, PENALITES, AVANCES) ✅
- DecompteImputation (analytique JSONB) ✅
- Calculs automatiques: totalRetenues, netAPayer ✅
- Vérification solde ✅
```

**Frontend (DecomptesPage) :**
```
- Liste décomptes ✅
```

#### ⚠️ CE QUI MANQUE

**Cahier des charges vs existant :**
- [ ] **Type décompte** : situation provisoire/définitif/avance/acompte/régularisation
- [ ] **Multi-taux TVA** (7/10/14/20)
- [ ] **Pénalités de retard** (montant, motif)
- [ ] **Révisions de prix** (indexation, montant +/-)
- [ ] **Avances** (forfaitaire/approvisionnement + remboursement)
- [ ] **RAS détaillées** (TVA, IS tiers, non-résident) avec table multi-lignes

**Frontend :**
- [ ] **Interface création/édition décompte** (PRIORITÉ HAUTE)
- [ ] Saisie retenues (multi-lignes avec types)
- [ ] Saisie RAS fiscales (table dédiée)
- [ ] Affichage net à payer calculé automatiquement
- [ ] Interface imputation analytique (héritage marché + surcharge)
- [ ] Validation : somme imputations = base HT
- [ ] Alertes : décompte ≤ montant marché révisé

**PRIORITÉ :** **HAUTE** (backend existe, frontend manque)

---

### 6️⃣ MODULE PAIEMENTS

#### ✅ CE QUI EXISTE

**Backend (OrdrePaiement.kt, Paiement.kt) :**
```kotlin
- Ordre de Paiement (OP) ✅
  • Numéro, date, montant, mode ✅
  • Statut: brouillon/soumis/validé/annulé ✅
- Paiement effectif ✅
  • Date, référence, montant payé ✅
  • Paiements partiels ✅
```

**Frontend (PaiementsPage) :**
```
- Liste paiements ✅
```

#### ⚠️ CE QUI MANQUE

**Frontend :**
- [ ] **Interface création OP** depuis décompte
- [ ] Gestion mode paiement (virement/chèque)
- [ ] Compte bancaire payeur (paramétrage)
- [ ] Enregistrement paiement effectif (date, référence, justificatif)
- [ ] États :
  - [ ] Décomptes à payer
  - [ ] Journal des paiements
  - [ ] Reste à payer
- [ ] Contrôle : cumul paiements ≤ net à payer
- [ ] Décompte soldé automatiquement

**PRIORITÉ :** MOYENNE-HAUTE

---

### 7️⃣ MODULE RETENUES & GARANTIES

#### ✅ CE QUI EXISTE

**Backend (DecompteRetenue avec TypeRetenue.GARANTIE) :**
```kotlin
- Constitution RG sur décompte ✅
- Montant, taux ✅
```

#### ⚠️ CE QUI MANQUE

**Backend :**
- [ ] **Entité CautionBancaire** (référence, banque, montant, échéance, statut, pièce jointe)
- [ ] **Libération RG** (entité dédiée: totale/partielle, justificatif, génère OP)
- [ ] Règle : si caution active → RG = 0
- [ ] Contrôle : montant libéré ≤ RG non libérée
- [ ] État RG : constituée / libérée / restant

**Frontend :**
- [ ] **Interface gestion cautions** (CRUD, upload pièces)
- [ ] **Interface libération RG** (formulaire + génération OP)
- [ ] État synthétique par marché/fournisseur :
  - [ ] RG constituée
  - [ ] RG libérée
  - [ ] RG restant
- [ ] Alertes : caution expirée, RG à libérer

**PRIORITÉ :** **HAUTE** (fonctionnalité métier critique)

---

### 8️⃣ MODULE REVERSEMENTS RAS

#### ✅ CE QUI EXISTE

**Backend (DecompteRetenue avec TypeRetenue.RAS) :**
```kotlin
- Constitution RAS sur décompte ✅
- Montant, taux ✅
```

#### ⚠️ CE QUI MANQUE

**Backend :**
- [ ] **Entité ReversementRAS** (date, période fiscale, référence paiement, quittance)
- [ ] Relation Many-to-Many : ReversementRAS ↔ DecompteRetenue
- [ ] État RAS : constituée / reversée / à reverser
- [ ] Contrôle : montant reversé ≤ RAS constituée
- [ ] Alertes retard de reversement (paramétrage délais)
- [ ] **Types RAS détaillés** : RAS_TVA, RAS_IS_TIERS, RAS_NON_RESIDENT

**Frontend :**
- [ ] **Interface reversement RAS** (PRIORITÉ HAUTE)
- [ ] Sélection multi-décomptes pour reversement groupé
- [ ] Saisie : date, période fiscale, référence, quittance
- [ ] États :
  - [ ] RAS à reverser (par type, par période)
  - [ ] RAS reversée (journal)
  - [ ] Alertes retard
- [ ] Upload quittances de reversement

**PRIORITÉ :** **TRÈS HAUTE** (obligation fiscale)

---

### 9️⃣ MODULE COMMISSION D'INTERVENTION

#### ✅ CE QUI EXISTE

**Backend (Commission.kt) :**
```kotlin
- Commission liée à Convention + DepenseInvestissement ✅
- Base de calcul (HT/TTC) ✅
- Taux commission, taux TVA ✅
- Montants: HT, TVA, TTC ✅
- Date calcul ✅
```

#### ⚠️ CE QUI MANQUE

**Cahier des charges vs existant :**

**Backend :**
- [ ] **Paramètres conventionnels détaillés** :
  - [ ] Base : marché / décompte / paiement (actuellement non paramétré)
  - [ ] Exclusions (liste items à exclure)
  - [ ] Seuils, plafond, minimum
  - [ ] Mode : taux unique / tranches / fixe+variable
- [ ] **Calcul périodique** (mensuel / par jalon / cumul)
- [ ] **Constitution base éligible** (filtrage + exclusions)
- [ ] **Traçabilité ligne par ligne** :
  - [ ] Entité LigneCommission (source: id marché/décompte/paiement, montant base, taux, commission)
- [ ] **Facturation commission** :
  - [ ] Entité FactureCommission (date, HT, TVA, TTC, statut)
  - [ ] Déduction dans "déjà facturé"
- [ ] **Commission théorique cumulée / déjà facturée / à facturer**
- [ ] Contrôle unicité : pas de double prise en compte

**Frontend :**
- [ ] **Interface calcul commission** (PRIORITÉ HAUTE) :
  - [ ] Sélection période
  - [ ] Affichage base éligible (avec filtres)
  - [ ] Commission théorique, facturée, à facturer
  - [ ] Détail ligne par ligne (exportable Excel/PDF)
- [ ] **Interface facturation commission** :
  - [ ] Enregistrement factures
  - [ ] Suivi facturé vs théorique
- [ ] **États justificatifs** (audit, bailleurs)

**PRIORITÉ :** **TRÈS HAUTE** (cœur métier MOD)

---

## 🚨 PRIORITÉS DE DÉVELOPPEMENT

### 🔴 PRIORITÉ 1 - CRITIQUE (2-3 semaines)

1. **Module Décomptes - Interface Frontend**
   - Page création/édition décompte
   - Saisie retenues (GARANTIE, RAS, PÉNALITÉS, AVANCES)
   - Saisie RAS fiscales multi-lignes
   - Imputation analytique (héritage + surcharge)
   - Calcul automatique net à payer

2. **Module Commission - Calcul & Facturation**
   - Interface calcul commission (sélection période, base éligible)
   - Traçabilité ligne par ligne (backend + frontend)
   - Interface facturation commission
   - États justificatifs

3. **Module RAS - Reversements**
   - Entité ReversementRAS (backend)
   - Interface reversement RAS (frontend)
   - États RAS à reverser / reversée
   - Alertes retard

### 🟡 PRIORITÉ 2 - IMPORTANTE (3-4 semaines)

4. **Module Retenues & Garanties**
   - Entité CautionBancaire + Libération RG
   - Interface gestion cautions
   - Interface libération RG
   - États synthétiques

5. **Module Référentiel Analytique - Axes**
   - Interface CRUD axes (DimensionAnalytique, ValeurDimension)
   - Affectation axes aux projets
   - Écrans "Conventions → Projets → Axes"

6. **Module Paiements - Finalisation**
   - Interface création OP depuis décompte
   - Enregistrement paiement effectif
   - États : décomptes à payer, journal, reste à payer

### 🟢 PRIORITÉ 3 - AMÉLIORATION (4-6 semaines)

7. **Module Conventions - Avenants**
   - Liaison Avenant ↔ Convention
   - Interface gestion avenants (création, historique, impact)
   - Consolidation version applicable

8. **Module Budget - Ventilation Analytique**
   - Lignes budgétaires détaillées (postes/sous-postes)
   - Ventilation analytique par projet/axe
   - Contrôles dépassement plafond

9. **Module Marchés - Enrichissement**
   - Type prestation, mode passation, lots
   - Pièces jointes, co-traitants
   - Interface lignes marché + ventilation analytique

---

## 📊 STATISTIQUES GLOBALES

```
Total Modules Cahier des Charges : 9
Modules Backend > 80% : 7/9 (78%)
Modules Frontend > 80% : 4/9 (44%)

Lignes de code estimées à développer :
- Backend : ~3 000 lignes (entités, services, contrôleurs)
- Frontend : ~8 000 lignes (pages, composants, états)

Temps estimé développement complet :
- Sprint 1 (Priorité 1) : 2-3 semaines
- Sprint 2 (Priorité 2) : 3-4 semaines
- Sprint 3 (Priorité 3) : 4-6 semaines
TOTAL : 9-13 semaines (2-3 mois)
```

---

## 🎯 RECOMMANDATIONS STRATÉGIQUES

### 1. **Architecture & Qualité**
- ✅ **Force** : Architecture backend très solide avec entités bien modélisées
- ⚠️ **Faiblesse** : Frontend incomplet par rapport au backend
- 📌 **Action** : Prioriser les interfaces frontend pour exploiter le backend existant

### 2. **Approche de Développement**
1. **Phase 1** : Finir les interfaces frontend des modules existants (Décomptes, Paiements, Commissions)
2. **Phase 2** : Compléter les modules métier critiques (RAS, Retenues & Garanties)
3. **Phase 3** : Enrichissement fonctionnel (Avenants, Budget ventilé, Marchés)

### 3. **Points d'Attention**
- **Commission d'intervention** : cœur métier MOD, doit être robuste et auditable
- **RAS** : obligation fiscale, risque juridique si non-conformité
- **Retenues & Garanties** : flux financier critique, besoin traçabilité totale
- **Imputation analytique** : fondation du reporting, doit être flexible et fiable

### 4. **Tests & Validation**
- Prévoir tests unitaires sur calculs (commission, net à payer, cumuls)
- Tests d'intégration sur workflows (convention → marché → décompte → paiement)
- Validation métier avec utilisateurs réels avant mise en production

---

## 📝 CONCLUSION

**Le système InvestProMaroc dispose d'une excellente base backend** avec des entités riches et bien structurées. **Le principal effort de développement se situe au niveau du frontend** pour créer les interfaces utilisateur manquantes et exploiter pleinement les capacités backend existantes.

**Les modules Décomptes, Commission et RAS sont les plus critiques** car ils impactent directement les obligations contractuelles, fiscales et financières. Leur développement doit être priorisé.

**Estimation réaliste :** Avec une équipe dédiée, le système peut être finalisé et opérationnel en **2-3 mois**, en suivant l'approche par sprints proposée.

---

**Date de mise à jour :** 2026-01-06
**Auteur :** Claude (Assistant IA)
**Version :** 1.0
