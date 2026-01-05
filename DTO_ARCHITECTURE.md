# 🏗️ Architecture DTO - Élimination des Références Circulaires

## 📋 Problème Identifié

**Erreur actuelle :** `Document nesting depth (1001) exceeds the maximum allowed (1000)`

**Cause racine :** Les entités JPA ont des relations bidirectionnelles qui créent des cycles infinis lors de la sérialisation JSON par Jackson.

### Références Circulaires Identifiées

```
Convention
  ├─► @OneToMany partenaires → ConventionPartenaire
  │     └─► @ManyToOne convention → Convention ❌ CIRCULAR
  ├─► @OneToMany sousConventions → Convention (self-referencing) ❌ CIRCULAR
  ├─► @ManyToOne parentConvention → Convention (self-referencing) ❌ CIRCULAR
  └─► @OneToMany imputationsPrevisionnelles → ImputationPrevisionnelle
        └─► @ManyToOne convention → Convention ❌ CIRCULAR

Budget
  └─► @OneToMany lignes → LigneBudget
        └─► @ManyToOne budget → Budget ❌ CIRCULAR

Marche
  ├─► @OneToMany lignes → MarcheLigne
  │     └─► @ManyToOne marche → Marche ❌ CIRCULAR
  ├─► @OneToMany decomptes → Decompte
  │     └─► @ManyToOne marche → Marche ❌ CIRCULAR
  └─► @OneToMany avenants → AvenantMarche
        └─► @ManyToOne marche → Marche ❌ CIRCULAR

Decompte
  ├─► @OneToMany retenues → DecompteRetenue
  │     └─► @ManyToOne decompte → Decompte ❌ CIRCULAR
  └─► @OneToMany imputations → DecompteImputation
        └─► @ManyToOne decompte → Decompte ❌ CIRCULAR

OrdrePaiement
  └─► @OneToMany imputations → OPImputation
        └─► @ManyToOne ordrePaiement → OrdrePaiement ❌ CIRCULAR

Paiement
  └─► @OneToMany imputations → PaiementImputation
        └─► @ManyToOne paiement → Paiement ❌ CIRCULAR
```

---

## ✅ Solution Architecturale : Pattern DTO (Data Transfer Object)

### Principes de Conception

1. **Séparation des Responsabilités**
   - **Entités JPA** : Gestion de la persistance et relations bidirectionnelles
   - **DTOs** : Transfert de données via API, structure plate sans cycles

2. **Règles de Mapping**
   - **Relations Many-to-One (parent)** : Inclure uniquement l'ID + nom (données minimales)
   - **Relations One-to-Many (enfants)** : Inclure les objets complets SANS référence back au parent
   - **Self-referencing** : Inclure uniquement l'ID du parent, pas l'objet complet

3. **Nomenclature**
   - DTOs : `EntityNameDTO.kt` (ex: `ConventionDTO.kt`)
   - Mappers : `EntityNameMapper.kt` (ex: `ConventionMapper.kt`)
   - Localisation : `backend/src/main/kotlin/ma/investpro/dto/`

---

## 📐 Structure des DTOs

### Convention DTO

```kotlin
data class ConventionDTO(
    // Champs de base
    val id: Long?,
    val code: String,
    val numero: String,
    val dateConvention: LocalDate,
    val typeConvention: TypeConvention,
    val statut: StatutConvention,
    val libelle: String,
    val objet: String?,

    // Financiers
    val tauxCommission: BigDecimal,
    val budget: BigDecimal,
    val baseCalcul: String,
    val tauxTva: BigDecimal,

    // Dates
    val dateDebut: LocalDate,
    val dateFin: LocalDate?,
    val description: String?,

    // Workflow
    val dateSoumission: LocalDate?,
    val dateValidation: LocalDate?,
    val valideParId: Long?,
    val version: String?,
    val isLocked: Boolean,
    val motifVerrouillage: String?,

    // Relations - IDs seulement pour parent
    val parentConventionId: Long?,
    val parentConventionNumero: String?, // Info supplémentaire pour affichage

    // Relations - Objets complets pour enfants (SANS référence back)
    val partenaires: List<ConventionPartenaireDTO> = emptyList(),
    val sousConventions: List<ConventionSimpleDTO> = emptyList(), // Version simplifiée
    val imputationsPrevisionnelles: List<ImputationPrevisionnelleDTO> = emptyList(),
    val versementsPrevisionnels: List<VersementPrevisionnelDTO> = emptyList(),

    // Timestamps
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val createdBy: String?,
    val updatedBy: String?,
    val actif: Boolean
)

// Version simplifiée pour listes et sous-conventions
data class ConventionSimpleDTO(
    val id: Long?,
    val code: String,
    val numero: String,
    val libelle: String,
    val statut: StatutConvention,
    val budget: BigDecimal,
    val dateDebut: LocalDate,
    val dateFin: LocalDate?
)
```

### ConventionPartenaire DTO

```kotlin
data class ConventionPartenaireDTO(
    val id: Long?,
    // Convention parent : ID seulement (pas d'objet complet)
    val conventionId: Long,

    // Partenaire : Informations minimales
    val partenaireId: Long,
    val partenaireCode: String,
    val partenaireNom: String,

    // Données métier
    val budgetAlloue: BigDecimal,
    val pourcentage: BigDecimal,
    val commissionIntervention: BigDecimal?,
    val estMaitreOeuvre: Boolean,
    val estMaitreOeuvreDelegue: Boolean,
    val remarques: String?,

    // Timestamps
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)
```

### Budget DTO

```kotlin
data class BudgetDTO(
    val id: Long?,
    // Convention : ID seulement
    val conventionId: Long,
    val conventionNumero: String?,

    val version: String,
    val dateBudget: LocalDate,
    val statut: StatutBudget,
    val plafondConvention: BigDecimal,
    val totalBudget: BigDecimal,

    // Révision
    val budgetPrecedentId: Long?,
    val deltaMontant: BigDecimal?,
    val justification: String?,
    val observations: String?,

    // Validation
    val dateValidation: LocalDate?,
    val valideParId: Long?,

    // Lignes : objets complets SANS référence back
    val lignes: List<LigneBudgetDTO> = emptyList(),

    // Timestamps
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)

data class LigneBudgetDTO(
    val id: Long?,
    // Budget parent : ID seulement
    val budgetId: Long,

    val code: String,
    val libelle: String,
    val montant: BigDecimal,
    val ordreAffichage: Int,
    val description: String?,

    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)
```

### Marche DTO

```kotlin
data class MarcheDTO(
    val id: Long?,
    val numeroMarche: String,
    val numAo: String?,
    val dateMarche: LocalDate,

    // Fournisseur : informations minimales
    val fournisseurId: Long,
    val fournisseurCode: String,
    val fournisseurNom: String,

    // Convention : ID seulement
    val conventionId: Long?,
    val conventionNumero: String?,

    val objet: String,
    val montantHt: BigDecimal,
    val tauxTva: BigDecimal,
    val montantTva: BigDecimal,
    val montantTtc: BigDecimal,
    val statut: StatutMarche,

    val dateDebut: LocalDate?,
    val dateFinPrevue: LocalDate?,
    val delaiExecutionMois: Int?,
    val retenueGarantie: BigDecimal,
    val remarques: String?,

    // Relations enfants : objets complets SANS référence back
    val lignes: List<MarcheLigneDTO> = emptyList(),
    val avenants: List<AvenantMarcheDTO> = emptyList(),
    val decomptes: List<DecompteSimpleDTO> = emptyList(), // Version simplifiée

    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)

data class MarcheLigneDTO(
    val id: Long?,
    val marcheId: Long, // ID seulement

    val numeroLigne: Int,
    val designation: String,
    val unite: String?,
    val quantite: BigDecimal?,
    val prixUnitaireHT: BigDecimal,
    val montantHT: BigDecimal,
    val tauxTVA: BigDecimal,
    val montantTVA: BigDecimal,
    val montantTTC: BigDecimal,

    val imputationAnalytique: Map<String, String>?,
    val remarques: String?,

    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)
```

### Decompte DTO

```kotlin
data class DecompteDTO(
    val id: Long?,
    // Marche : ID seulement
    val marcheId: Long,
    val marcheNumero: String?,

    val numeroDecompte: String,
    val dateDecompte: LocalDate,
    val periodeDebut: LocalDate,
    val periodeFin: LocalDate,
    val statut: StatutDecompte,

    val montantBrutHT: BigDecimal,
    val montantTVA: BigDecimal,
    val montantTTC: BigDecimal,
    val totalRetenues: BigDecimal,
    val netAPayer: BigDecimal,

    val cumulPrecedent: BigDecimal?,
    val cumulActuel: BigDecimal?,
    val observations: String?,

    val dateValidation: LocalDate?,
    val valideParId: Long?,
    val montantPaye: BigDecimal,
    val estSolde: Boolean,

    // Relations enfants : objets complets SANS référence back
    val retenues: List<DecompteRetenueDTO> = emptyList(),
    val imputations: List<DecompteImputationDTO> = emptyList(),

    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)

data class DecompteSimpleDTO(
    val id: Long?,
    val numeroDecompte: String,
    val dateDecompte: LocalDate,
    val statut: StatutDecompte,
    val netAPayer: BigDecimal,
    val montantPaye: BigDecimal,
    val estSolde: Boolean
)

data class DecompteRetenueDTO(
    val id: Long?,
    val decompteId: Long, // ID seulement
    val typeRetenue: TypeRetenue,
    val montant: BigDecimal,
    val tauxPourcent: BigDecimal?,
    val libelle: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)

data class DecompteImputationDTO(
    val id: Long?,
    val decompteId: Long, // ID seulement
    val montant: BigDecimal,
    val dimensionsValeurs: Map<String, String>,
    val remarques: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)
```

---

## 🔄 Mappers

### Convention Mapper

```kotlin
@Component
class ConventionMapper {

    fun toDTO(entity: Convention): ConventionDTO {
        return ConventionDTO(
            id = entity.id,
            code = entity.code,
            numero = entity.numero,
            // ... tous les champs basiques

            // Relations parent : ID seulement
            parentConventionId = entity.parentConvention?.id,
            parentConventionNumero = entity.parentConvention?.numero,

            // Relations enfants : mapper sans référence back
            partenaires = entity.partenaires.map { toPartenaireDTO(it) },
            sousConventions = entity.sousConventions.map { toSimpleDTO(it) },
            imputationsPrevisionnelles = entity.imputationsPrevisionnelles.map { toImputationDTO(it) },

            // Timestamps
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
            actif = entity.actif
        )
    }

    fun toSimpleDTO(entity: Convention): ConventionSimpleDTO {
        return ConventionSimpleDTO(
            id = entity.id,
            code = entity.code,
            numero = entity.numero,
            libelle = entity.libelle,
            statut = entity.statut,
            budget = entity.budget,
            dateDebut = entity.dateDebut,
            dateFin = entity.dateFin
        )
    }

    private fun toPartenaireDTO(entity: ConventionPartenaire): ConventionPartenaireDTO {
        return ConventionPartenaireDTO(
            id = entity.id,
            conventionId = entity.convention?.id ?: 0,
            partenaireId = entity.partenaire?.id ?: 0,
            partenaireCode = entity.partenaire?.code ?: "",
            partenaireNom = entity.partenaire?.raisonSociale ?: "",
            budgetAlloue = entity.budgetAlloue,
            pourcentage = entity.pourcentage,
            // ... autres champs
            actif = entity.actif
        )
    }
}
```

---

## 📊 Flux de Données

```
┌─────────────┐         ┌──────────────┐         ┌────────────┐
│  Frontend   │────────►│  Controller  │────────►│  Service   │
│   (React)   │         │ (retourne DTO)│        │  (Entity)  │
└─────────────┘         └──────────────┘         └────────────┘
       ▲                       │                        │
       │                       │                        ▼
       │                  ┌─────────┐            ┌────────────┐
       └──────────────────│ Mapper  │◄───────────│ Repository │
          JSON            │ Ent→DTO │            │    (JPA)   │
                          └─────────┘            └────────────┘
```

1. **Controller** reçoit requête
2. **Service** récupère l'entité via Repository (avec relations LAZY)
3. **Mapper** convertit Entity → DTO (charge seulement les données nécessaires)
4. **Controller** retourne le DTO en JSON
5. **Jackson** sérialise le DTO SANS problème de cycle

---

## 🎯 Avantages de cette Solution

### ✅ Respect des Normes de Modélisation BD
- Entités JPA gardent leurs relations bidirectionnelles (intégrité référentielle)
- Aucune modification du schéma de base de données
- Relations One-to-Many/Many-to-One conservées pour les contraintes FK

### ✅ Performance
- Contrôle fin du chargement des données (évite N+1 queries)
- Possibilité d'optimiser avec `@EntityGraph` pour certains cas
- DTOs légers contenant uniquement les données nécessaires

### ✅ Maintenabilité
- Séparation claire : persistance (Entity) vs API (DTO)
- Facilite les évolutions de l'API sans impacter le modèle BDD
- Tests unitaires simplifiés

### ✅ Sécurité
- Contrôle des données exposées via API
- Évite l'exposition accidentelle de données sensibles
- Validation au niveau DTO indépendante de la persistance

---

## 📝 Plan d'Implémentation

### Phase 1 : DTOs Critiques
- [x] Convention + ConventionPartenaire
- [x] Budget + LigneBudget
- [x] Marche + MarcheLigne
- [x] Decompte + Retenues + Imputations

### Phase 2 : Mappers
- [ ] ConventionMapper
- [ ] BudgetMapper
- [ ] MarcheMapper
- [ ] DecompteMapper

### Phase 3 : Services & Controllers
- [ ] Adapter ConventionService pour retourner DTOs
- [ ] Adapter ConventionController
- [ ] Adapter BudgetController
- [ ] Adapter MarcheController
- [ ] Adapter DecompteController

### Phase 4 : Tests
- [ ] Tester GET /api/conventions (doit retourner liste sans erreur)
- [ ] Tester GET /api/conventions/{id} (avec partenaires, sous-conventions)
- [ ] Vérifier que le frontend reçoit les données correctement
- [ ] Tests unitaires des mappers

---

## 🔧 Exemple d'Utilisation

### Avant (❌ Erreur 1001)

```kotlin
// Controller
@GetMapping
fun getAll(): ResponseEntity<List<Convention>> {
    return ResponseEntity.ok(conventionService.findAll())
    // ❌ Jackson essaie de sérialiser les relations bidirectionnelles → BOOM
}
```

### Après (✅ Solution)

```kotlin
// Controller
@GetMapping
fun getAll(): ResponseEntity<List<ConventionDTO>> {
    val conventions = conventionService.findAll()
    val dtos = conventions.map { conventionMapper.toDTO(it) }
    return ResponseEntity.ok(dtos)
    // ✅ DTOs plats, pas de cycles, sérialisation OK
}
```

---

## 📚 Références

- [Spring Data JPA Best Practices](https://vladmihalcea.com/the-best-way-to-map-a-onetomany-association-with-jpa-and-hibernate/)
- [DTO Pattern](https://martinfowler.com/eaaCatalog/dataTransferObject.html)
- [Jackson Circular Reference Solutions](https://www.baeldung.com/jackson-bidirectional-relationships-and-infinite-recursion)
