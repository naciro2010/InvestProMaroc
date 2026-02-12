package ma.investpro.dto

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

// Budget DTOs
data class BudgetDTO(
    val id: Long?,
    val conventionId: Long,
    val conventionCode: String?,
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

data class BudgetStatistiques(
    val total: Int,
    val brouillon: Int,
    val soumis: Int,
    val valides: Int,
    val rejetes: Int,
    val archives: Int,
    val montantTotal: BigDecimal
)
