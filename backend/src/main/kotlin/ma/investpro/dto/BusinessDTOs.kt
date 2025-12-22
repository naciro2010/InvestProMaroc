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

// Projet DTOs
data class ProjetDTO(
    val id: Long?,
    @field:NotBlank val code: String,
    @field:NotBlank val nom: String,
    val description: String?,
    val responsable: String?,
    val statut: String?,
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

// AxeAnalytique DTOs
data class AxeAnalytiqueDTO(
    val id: Long?,
    @field:NotBlank val code: String,
    @field:NotBlank val libelle: String,
    val type: String?,
    val description: String?,
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
    val projetId: Long,
    val projet: ProjetDTO?,
    val axeAnalytiqueId: Long?,
    val axeAnalytique: AxeAnalytiqueDTO?,
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

// Response wrapper
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null
)
