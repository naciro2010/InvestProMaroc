package ma.investpro.dto

import jakarta.validation.constraints.NotNull
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

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
    val conventions: List<ConventionSimpleDTO> = emptyList(),
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

// Projet-Convention Association DTOs
data class ProjetConventionDTO(
    val id: Long?,
    val projetId: Long,
    val projetCode: String,
    val projetNom: String,
    val projetBudgetTotal: BigDecimal,
    val projetStatut: String,
    val conventionId: Long,
    val conventionCode: String,
    val conventionNumero: String,
    val conventionLibelle: String,
    val conventionStatut: String,
    val conventionBudget: BigDecimal,
    val ordre: Int,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class CreateProjetConventionRequest(
    @field:NotNull
    val projetId: Long,

    @field:NotNull
    val conventionId: Long,

    val ordre: Int = 0
)

data class UpdateProjetConventionRequest(
    val ordre: Int
)
