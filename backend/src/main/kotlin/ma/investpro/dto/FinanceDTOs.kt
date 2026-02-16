package ma.investpro.dto

import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

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

data class CreateFournisseurDTO(
    @field:NotBlank(message = "Le code est requis")
    @field:Size(max = 50, message = "Le code ne peut pas dépasser 50 caractères")
    val code: String,

    @field:NotBlank(message = "La raison sociale est requise")
    @field:Size(max = 200, message = "La raison sociale ne peut pas dépasser 200 caractères")
    val raisonSociale: String,

    @field:Size(max = 20, message = "L'identifiant fiscal ne peut pas dépasser 20 caractères")
    @field:Pattern(regexp = "^[0-9]*$", message = "L'identifiant fiscal doit contenir uniquement des chiffres")
    val identifiantFiscal: String? = null,

    @field:Pattern(regexp = "^[0-9]{15}$", message = "L'ICE doit contenir exactement 15 chiffres")
    val ice: String? = null,

    val adresse: String? = null,

    @field:Size(max = 100, message = "La ville ne peut pas dépasser 100 caractères")
    val ville: String? = null,

    @field:Size(max = 20, message = "Le téléphone ne peut pas dépasser 20 caractères")
    val telephone: String? = null,

    @field:Size(max = 20, message = "Le fax ne peut pas dépasser 20 caractères")
    val fax: String? = null,

    @field:Email(message = "Email invalide")
    @field:Size(max = 150, message = "L'email ne peut pas dépasser 150 caractères")
    val email: String? = null,

    @field:Size(max = 100, message = "Le contact ne peut pas dépasser 100 caractères")
    val contact: String? = null,

    val nonResident: Boolean = false,
    val remarques: String? = null
)

data class UpdateFournisseurDTO(
    @field:Size(max = 200, message = "La raison sociale ne peut pas dépasser 200 caractères")
    val raisonSociale: String? = null,

    @field:Size(max = 20, message = "L'identifiant fiscal ne peut pas dépasser 20 caractères")
    @field:Pattern(regexp = "^[0-9]*$", message = "L'identifiant fiscal doit contenir uniquement des chiffres")
    val identifiantFiscal: String? = null,

    @field:Pattern(regexp = "^[0-9]{15}$", message = "L'ICE doit contenir exactement 15 chiffres")
    val ice: String? = null,

    val adresse: String? = null,

    @field:Size(max = 100, message = "La ville ne peut pas dépasser 100 caractères")
    val ville: String? = null,

    @field:Size(max = 20, message = "Le téléphone ne peut pas dépasser 20 caractères")
    val telephone: String? = null,

    @field:Size(max = 20, message = "Le fax ne peut pas dépasser 20 caractères")
    val fax: String? = null,

    @field:Email(message = "Email invalide")
    @field:Size(max = 150, message = "L'email ne peut pas dépasser 150 caractères")
    val email: String? = null,

    @field:Size(max = 100, message = "Le contact ne peut pas dépasser 100 caractères")
    val contact: String? = null,

    val nonResident: Boolean? = null,
    val remarques: String? = null
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
