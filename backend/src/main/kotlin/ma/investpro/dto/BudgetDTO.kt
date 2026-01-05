package ma.investpro.dto

import ma.investpro.entity.StatutBudget
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * DTO pour Budget - Sans référence circulaire à Convention
 */
data class BudgetDTO(
    val id: Long?,

    // Convention parent : ID seulement
    val conventionId: Long,
    val conventionNumero: String?,
    val conventionLibelle: String?,

    // Informations de base
    val version: String,
    val dateBudget: LocalDate,
    val statut: StatutBudget,

    // Montants
    val plafondConvention: BigDecimal,
    val totalBudget: BigDecimal,

    // Révision (si version > V0)
    val budgetPrecedentId: Long?,
    val deltaMontant: BigDecimal?,
    val justification: String?,
    val observations: String?,

    // Validation
    val dateValidation: LocalDate?,
    val valideParId: Long?,

    // Lignes : objets complets SANS référence back à Budget
    val lignes: List<LigneBudgetDTO> = emptyList(),

    // Timestamps
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val createdBy: String?,
    val updatedBy: String?,
    val actif: Boolean
)

/**
 * DTO simplifié pour Budget - Utilisé dans les listes
 */
data class BudgetSimpleDTO(
    val id: Long?,
    val version: String,
    val dateBudget: LocalDate,
    val statut: StatutBudget,
    val totalBudget: BigDecimal,
    val actif: Boolean
)

/**
 * DTO pour LigneBudget - Sans référence back à Budget
 */
data class LigneBudgetDTO(
    val id: Long?,

    // Budget parent : ID seulement
    val budgetId: Long,

    // Informations de la ligne
    val code: String,
    val libelle: String,
    val montant: BigDecimal,
    val ordreAffichage: Int,
    val description: String?,

    // Timestamps
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)
