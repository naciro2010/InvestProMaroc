package ma.investpro.dto

import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

// Convention DTOs
data class ConventionDTO(
    val id: Long?,
    val code: String,
    val numero: String,
    val dateConvention: LocalDate,
    val typeConvention: String,
    val statut: String,
    val libelle: String,
    val objet: String?,
    val tauxCommission: BigDecimal,
    val budget: BigDecimal,
    val baseCalcul: String,
    val tauxTva: BigDecimal,
    val dateDebut: LocalDate,
    val dateFin: LocalDate?,
    val description: String?,
    val dateSoumission: LocalDate?,
    val dateValidation: LocalDate?,
    val valideParId: Long?,
    val valideParNom: String?, // Nom du validateur
    val version: String?,
    val isLocked: Boolean,
    val motifVerrouillage: String?,
    val motifRejet: String?, // Raison du rejet si statut = REJETE
    val createdById: Long?, // ID de l'utilisateur créateur
    val createdByNom: String?, // Nom de l'utilisateur créateur
    val parentConventionId: Long?,
    val parentConventionNumero: String?,
    val heriteParametres: Boolean,
    val surchargeTauxCommission: BigDecimal?,
    val surchargeBaseCalcul: String?,
    val partenaires: List<ConventionPartenaireDTO>,
    val sousConventions: List<ConventionSimpleDTO>,
    val imputationsPrevisionnelles: List<ImputationPrevisionnelleDTO>,
    val versementsPrevisionnels: List<VersementPrevisionnelDTO>,
    val subventions: List<SubventionDTO>,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class ConventionSimpleDTO(
    val id: Long?,
    val code: String,
    val numero: String,
    val libelle: String,
    val statut: String,
    val budget: BigDecimal,
    val dateDebut: LocalDate,
    val dateFin: LocalDate?,
    val createdByNom: String?, // Nom de l'utilisateur créateur
    val createdAt: LocalDateTime?,
    val actif: Boolean
)

data class ConventionPartenaireDTO(
    val id: Long?,
    val conventionId: Long,
    val partenaireId: Long,
    val partenaireCode: String,
    val partenaireNom: String,
    val partenaireSigle: String?,
    val budgetAlloue: BigDecimal,
    val pourcentage: BigDecimal,
    val commissionIntervention: BigDecimal?,
    val estMaitreOeuvre: Boolean,
    val estMaitreOeuvreDelegue: Boolean,
    val remarques: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class ImputationPrevisionnelleDTO(
    val id: Long?,
    val conventionId: Long,
    val volet: String?,
    val dateDemarrage: LocalDate,
    val delaiMois: Int,
    val dateFinPrevue: LocalDate?,
    val remarques: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class VersementPrevisionnelDTO(
    val id: Long?,
    val conventionId: Long,
    val volet: String?,
    val dateVersement: LocalDate,
    val montant: BigDecimal,
    val partenaireId: Long,
    val partenaireNom: String?,
    val maitreOeuvreDelegueId: Long?,
    val maitreOeuvreDelegueNom: String?,
    val remarques: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class SubventionDTO(
    val id: Long?,
    val conventionId: Long,
    val organismeBailleur: String,
    val typeSubvention: String?,
    val montantTotal: BigDecimal,
    val devise: String,
    val tauxChange: BigDecimal?,
    val dateSignature: LocalDate?,
    val dateDebutValidite: LocalDate?,
    val dateFinValidite: LocalDate?,
    val conditions: String?,
    val observations: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

// Fournisseur DTOs
data class FournisseurDTO(
    val id: Long?,
    val code: String,
    val raisonSociale: String,
    val identifiantFiscal: String?,
    val ice: String?,
    val adresse: String?,
    val ville: String?,
    val telephone: String?,
    val fax: String?,
    val email: String?,
    val contact: String?,
    val nonResident: Boolean,
    val remarques: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class FournisseurSimpleDTO(
    val id: Long?,
    val code: String,
    val raisonSociale: String,
    val ice: String?,
    val actif: Boolean
)

// Partenaire DTOs
data class PartenaireDTO(
    val id: Long?,
    val code: String,
    val raisonSociale: String,
    val sigle: String?,
    val typePartenaire: String?,
    val email: String?,
    val telephone: String?,
    val adresse: String?,
    val description: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class PartenaireSimpleDTO(
    val id: Long?,
    val code: String,
    val raisonSociale: String,
    val sigle: String?,
    val actif: Boolean
)

// CompteBancaire DTOs
data class CompteBancaireDTO(
    val id: Long?,
    @field:NotBlank val code: String,
    @field:NotBlank @field:Pattern(regexp = "^[0-9]{24}$") val rib: String,
    @field:NotBlank val banque: String,
    val agence: String?,
    val typeCompte: String?,
    val titulaire: String?,
    val devise: String,
    val remarques: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

// DepenseInvestissement DTOs
data class DepenseInvestissementDTO(
    val id: Long?,
    @field:NotBlank val numeroFacture: String,
    @field:NotNull val dateFacture: LocalDate,
    val fournisseurId: Long,
    val fournisseur: FournisseurDTO?,
    val conventionId: Long?,
    val convention: ConventionDTO?,
    @field:DecimalMin("0.00") val montantHt: BigDecimal,
    @field:DecimalMin("0.00") val tauxTva: BigDecimal,
    @field:DecimalMin("0.00") val montantTva: BigDecimal,
    @field:DecimalMin("0.00") val montantTtc: BigDecimal,
    val referenceMarche: String?,
    val numeroDecompte: String?,
    @field:DecimalMin("0.00") val retenueTva: BigDecimal,
    @field:DecimalMin("0.00") val retenueIsTiers: BigDecimal,
    @field:DecimalMin("0.00") val retenueNonResident: BigDecimal,
    @field:DecimalMin("0.00") val retenueGarantie: BigDecimal,
    val datePaiement: LocalDate?,
    val referencePaiement: String?,
    val compteBancaireId: Long?,
    val compteBancaire: CompteBancaireDTO?,
    val paye: Boolean,
    val remarques: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

// Commission DTOs
data class CommissionDTO(
    val id: Long?,
    val depenseId: Long,
    val conventionId: Long,
    val convention: ConventionDTO?,
    @field:NotNull val dateCalcul: LocalDate,
    @field:NotBlank val baseCalcul: String,
    @field:DecimalMin("0.00") val montantBase: BigDecimal,
    @field:DecimalMin("0.00") val tauxCommission: BigDecimal,
    @field:DecimalMin("0.00") val tauxTva: BigDecimal,
    @field:DecimalMin("0.00") val montantCommissionHt: BigDecimal,
    @field:DecimalMin("0.00") val montantTvaCommission: BigDecimal,
    @field:DecimalMin("0.00") val montantCommissionTtc: BigDecimal,
    val remarques: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

// Dimension Analytique DTOs
data class DimensionStatistiques(
    val totalDimensions: Int,
    val dimensionsActives: Int,
    val dimensionsObligatoires: Int,
    val totalValeurs: Int,
    val valeursActives: Int
)

data class ValidationImputationResult(
    val isValid: Boolean,
    val montantAttendu: BigDecimal,
    val totalImpute: BigDecimal,
    val difference: BigDecimal
)

data class ImputationAggregation(
    val dimension: String,
    val data: Map<String, BigDecimal>
)

data class ImputationAggregationByTwoDimensions(
    val dimension1: String,
    val dimension2: String,
    val data: List<AggregationRow>
)

data class AggregationRow(
    val dimension1Value: String,
    val dimension2Value: String,
    val montant: BigDecimal
)

data class ImputationStatistiques(
    val totalImputations: Long,
    val totalMontantImpute: BigDecimal,
    val nombreTypes: Int
)

// Avenant DTOs
data class ConsolidatedVersionResponse(
    val convention: ConventionDTO,
    val versionActuelle: String,
    val avenants: List<AvenantDTO>,
    val nombreAvenants: Int,
    val montantActuel: BigDecimal,
    val tauxCommissionActuel: BigDecimal,
    val dateFinActuelle: LocalDate?
)

data class AvenantDTO(
    val id: Long?,
    val conventionId: Long,
    val conventionNumero: String?,
    val conventionLibelle: String?,
    val numeroAvenant: String,
    val dateAvenant: LocalDate,
    val dateSignature: LocalDate?,
    val statut: String,
    val versionResultante: String,
    val objet: String,
    val montantAvant: BigDecimal?,
    val tauxCommissionAvant: BigDecimal?,
    val dateFinAvant: LocalDate?,
    val montantApres: BigDecimal?,
    val tauxCommissionApres: BigDecimal?,
    val dateFinApres: LocalDate?,
    val impactMontant: BigDecimal?,
    val impactCommission: BigDecimal?,
    val impactDelaiJours: Int?,
    val justification: String?,
    val details: String?,
    val dateValidation: LocalDate?,
    val valideParId: Long?,
    val isLocked: Boolean,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class VersionHistoryEntry(
    val version: String,
    val date: LocalDate?,
    val type: String,
    val objet: String? = null,
    val montant: BigDecimal? = null,
    val tauxCommission: BigDecimal? = null,
    val dateFin: LocalDate? = null,
    val impactMontant: BigDecimal? = null,
    val impactDelai: Int? = null
)

// Decompte DTOs
data class DecompteStatistiques(
    val total: Int,
    val brouillon: Int,
    val soumis: Int,
    val valides: Int,
    val montantTotal: BigDecimal
)

// Response wrapper
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null
)

// Budget Statistics DTO
data class BudgetStatistiques(
    val total: Int,
    val brouillon: Int,
    val soumis: Int,
    val valides: Int,
    val rejetes: Int,
    val archives: Int,
    val montantTotal: BigDecimal
)

// Ordre Paiement Statistics DTO
data class OrdrePaiementStatistiques(
    val total: Int,
    val brouillon: Int,
    val valides: Int,
    val executes: Int,
    val rejetes: Int,
    val annules: Int,
    val montantTotal: BigDecimal
)

// Paiement Statistics DTO
data class PaiementStatistiques(
    val total: Int,
    val montantTotal: BigDecimal,
    val paiementsPartiels: Int,
    val parMode: Map<String, BigDecimal>
)

// Budget DTOs
data class BudgetDTO(
    val id: Long?,
    val conventionId: Long,
    val conventionNumero: String?,
    val conventionLibelle: String?,
    val version: String,
    val dateBudget: LocalDate,
    val statut: String,
    val plafondConvention: BigDecimal,
    val totalBudget: BigDecimal,
    val budgetPrecedentId: Long?,
    val deltaMontant: BigDecimal?,
    val justification: String?,
    val observations: String?,
    val dateValidation: LocalDate?,
    val valideParId: Long?,
    val lignes: List<LigneBudgetDTO>,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class BudgetSimpleDTO(
    val id: Long?,
    val version: String,
    val dateBudget: LocalDate,
    val statut: String,
    val totalBudget: BigDecimal,
    val actif: Boolean
)

data class LigneBudgetDTO(
    val id: Long?,
    val budgetId: Long,
    val code: String,
    val libelle: String,
    val montant: BigDecimal,
    val ordreAffichage: Int,
    val description: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

// Marché DTOs
data class MarcheDTO(
    val id: Long?,
    val numeroMarche: String,
    val numAo: String?,
    val dateMarche: LocalDate,
    val fournisseurId: Long,
    val fournisseurCode: String,
    val fournisseurNom: String,
    val fournisseurIce: String?,
    val conventionId: Long?,
    val conventionNumero: String?,
    val objet: String,
    val montantHt: BigDecimal,
    val tauxTva: BigDecimal,
    val montantTva: BigDecimal,
    val montantTtc: BigDecimal,
    val statut: String,
    val dateDebut: LocalDate?,
    val dateFinPrevue: LocalDate?,
    val delaiExecutionMois: Int?,
    val retenueGarantie: BigDecimal,
    val remarques: String?,
    val lignes: List<MarcheLigneDTO>,
    val avenants: List<AvenantMarcheDTO>,
    val decomptes: List<DecompteSimpleDTO>,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class MarcheSimpleDTO(
    val id: Long?,
    val numeroMarche: String,
    val dateMarche: LocalDate,
    val fournisseurNom: String,
    val montantTtc: BigDecimal,
    val statut: String,
    val actif: Boolean
)

data class MarcheLigneDTO(
    val id: Long?,
    val marcheId: Long,
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
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class AvenantMarcheDTO(
    val id: Long?,
    val marcheId: Long,
    val numeroAvenant: String,
    val dateAvenant: LocalDate,
    val objet: String,
    val montantAvant: BigDecimal?,
    val montantApres: BigDecimal?,
    val impact: BigDecimal?,
    val statut: String,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

// Décompte DTOs
data class DecompteDTO(
    val id: Long?,
    val marcheId: Long,
    val marcheNumero: String?,
    val marcheFournisseur: String?,
    val numeroDecompte: String,
    val dateDecompte: LocalDate,
    val periodeDebut: LocalDate,
    val periodeFin: LocalDate,
    val statut: String,
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
    val retenues: List<DecompteRetenueDTO>,
    val imputations: List<DecompteImputationDTO>,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class DecompteSimpleDTO(
    val id: Long?,
    val numeroDecompte: String,
    val dateDecompte: LocalDate,
    val statut: String,
    val netAPayer: BigDecimal,
    val montantPaye: BigDecimal,
    val estSolde: Boolean,
    val actif: Boolean
)

data class DecompteRetenueDTO(
    val id: Long?,
    val decompteId: Long,
    val typeRetenue: String,
    val montant: BigDecimal,
    val tauxPourcent: BigDecimal?,
    val libelle: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class DecompteImputationDTO(
    val id: Long?,
    val decompteId: Long,
    val montant: BigDecimal,
    val dimensionsValeurs: Map<String, String>,
    val remarques: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

// Projet DTOs
data class ProjetDTO(
    val id: Long?,
    val code: String,
    val nom: String,
    val description: String?,
    val conventionId: Long?,
    val conventionNumero: String?,
    val conventionLibelle: String?,
    val budgetTotal: BigDecimal,
    val dateDebut: LocalDate?,
    val dateFinPrevue: LocalDate?,
    val dateFinReelle: LocalDate?,
    val dureeMois: Int?,
    val chefProjetId: Long?,
    val chefProjetNom: String?,
    val statut: String,
    val pourcentageAvancement: BigDecimal,
    val localisation: String?,
    val objectifs: String?,
    val remarques: String?,
    val estEnRetard: Boolean,
    val estActif: Boolean,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class ProjetSimpleDTO(
    val id: Long?,
    val code: String,
    val nom: String,
    val statut: String,
    val budgetTotal: BigDecimal,
    val dateDebut: LocalDate?,
    val dateFinPrevue: LocalDate?,
    val pourcentageAvancement: BigDecimal,
    val actif: Boolean
)
