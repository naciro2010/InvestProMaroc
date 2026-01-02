package ma.investpro.dto

import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

// Convention DTOs
data class ConventionDTO(
    val id: Long?,
    @field:NotBlank val code: String,
    @field:NotBlank val libelle: String,
    @field:DecimalMin("0.00") @field:DecimalMax("100.00") val tauxCommission: BigDecimal,
    @field:NotBlank val baseCalcul: String,
    @field:DecimalMin("0.00") val tauxTva: BigDecimal,
    @field:NotNull val dateDebut: LocalDate,
    val dateFin: LocalDate?,
    val description: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

// Fournisseur DTOs
data class FournisseurDTO(
    val id: Long?,
    @field:NotBlank val code: String,
    @field:NotBlank val raisonSociale: String,
    val identifiantFiscal: String?,
    val ice: String?,
    val adresse: String?,
    val ville: String?,
    val telephone: String?,
    val fax: String?,
    @field:Email val email: String?,
    val contact: String?,
    val nonResident: Boolean,
    val remarques: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
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
    val convention: Any,
    val versionActuelle: String,
    val avenants: List<Any>,
    val nombreAvenants: Int,
    val montantActuel: BigDecimal,
    val tauxCommissionActuel: BigDecimal,
    val dateFinActuelle: LocalDate?
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
