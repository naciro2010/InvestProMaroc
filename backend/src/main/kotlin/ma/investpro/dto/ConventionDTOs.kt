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
    val tauxTvaLignes: BigDecimal,
    val dateDebut: LocalDate,
    val dateFin: LocalDate?,
    val description: String?,
    val dateSoumission: LocalDate?,
    val dateValidation: LocalDate?,
    val valideParId: Long?,
    val valideParNom: String?,
    val version: String?,
    val isLocked: Boolean,
    val motifVerrouillage: String?,
    val motifRejet: String?,
    val createdById: Long?,
    val createdByNom: String?,
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
    val createdByNom: String?,
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
    val montantPrevu: BigDecimal?,
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
    val montantPrevu: BigDecimal?,
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

data class SubventionRequest(
    val conventionId: Long,
    @field:NotBlank(message = "L'organisme bailleur est obligatoire")
    val organismeBailleur: String,
    val typeSubvention: String?,
    @field:DecimalMin(value = "0", message = "Le montant doit être positif")
    val montantTotal: BigDecimal,
    val devise: String = "MAD",
    val tauxChange: BigDecimal?,
    val dateSignature: LocalDate?,
    val dateDebutValidite: LocalDate?,
    val dateFinValidite: LocalDate?,
    val conditions: String?,
    val observations: String?
)

// Convention Budget Ligne DTOs

data class ConventionBudgetLigneDTO(
    val id: Long?,
    val conventionId: Long,
    val categorieDepenseId: Long,
    val categorieDepenseCode: String,
    val categorieDepenseLibelle: String,
    val designation: String?,
    val montant: BigDecimal,
    val pourcentage: BigDecimal,
    val remarques: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class CreateConventionBudgetLigneRequest(
    @field:NotNull(message = "La catégorie de dépense est obligatoire")
    val categorieDepenseId: Long,

    val designation: String? = null,

    @field:NotNull(message = "Le montant est obligatoire")
    @field:DecimalMin(value = "0.00", message = "Le montant doit être positif")
    val montant: BigDecimal,

    val remarques: String? = null
)

data class UpdateConventionBudgetLigneRequest(
    val categorieDepenseId: Long? = null,

    val designation: String? = null,

    @field:NotNull(message = "Le montant est obligatoire")
    @field:DecimalMin(value = "0.00", message = "Le montant doit être positif")
    val montant: BigDecimal,

    val remarques: String? = null
)

// Convention Modification DTOs

data class ConventionModificationDTO(
    val id: Long?,
    val conventionId: Long,
    val modifieParId: Long,
    val modifieParNom: String,
    val dateModification: LocalDateTime,
    val motifModification: String,
    val donneesAvant: Map<String, Any>,
    val donneesApres: Map<String, Any>,
    val champsModifies: List<String>,
    val typeModification: String,
    val createdAt: LocalDateTime
)

data class UpdateConventionWithHistoryRequest(
    @field:NotBlank(message = "Le motif de modification est obligatoire")
    val motifModification: String,

    @field:NotNull
    val modifieParId: Long,

    @field:NotBlank(message = "Le libellé est obligatoire")
    val libelle: String,

    @field:NotBlank(message = "Le numéro est obligatoire")
    val numero: String,

    @field:NotBlank(message = "L'objet est obligatoire")
    val objet: String,

    @field:NotNull
    val typeConvention: String,

    @field:NotNull
    @field:DecimalMin(value = "0.00", message = "Le taux de commission doit être positif")
    @field:DecimalMax(value = "100.00", message = "Le taux de commission ne peut dépasser 100%")
    val tauxCommission: BigDecimal,

    @field:NotNull
    @field:DecimalMin(value = "0.00", message = "Le budget doit être positif")
    val budget: BigDecimal,

    val baseCalcul: String?,

    @field:NotNull
    @field:DecimalMin(value = "0.00", message = "Le taux TVA doit être positif")
    @field:DecimalMax(value = "20.00", message = "Le taux TVA ne peut dépasser 20%")
    val tauxTva: BigDecimal,

    @field:DecimalMin(value = "0.00", message = "Le taux TVA lignes doit être positif")
    @field:DecimalMax(value = "100.00", message = "Le taux TVA lignes ne peut dépasser 100%")
    val tauxTvaLignes: BigDecimal? = null,

    @field:NotNull
    val dateDebut: LocalDate,

    val dateFin: LocalDate?,

    val description: String?
)
