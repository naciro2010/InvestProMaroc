package ma.investpro.repository

import ma.investpro.entity.Budget
import ma.investpro.entity.StatutBudget
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

/**
 * Repository Budget - Gestion des budgets avec versions
 */
@Repository
interface BudgetRepository : JpaRepository<Budget, Long> {

    // Recherche par convention
    fun findByConventionId(conventionId: Long): List<Budget>

    // Recherche par statut
    fun findByStatut(statut: StatutBudget): List<Budget>

    // Recherche par convention et statut
    fun findByConventionIdAndStatut(conventionId: Long, statut: StatutBudget): List<Budget>

    // Recherche par version
    fun findByVersion(version: String): List<Budget>

    // Recherche par convention et version
    fun findByConventionIdAndVersion(conventionId: Long, version: String): Budget?

    // Compter par statut
    fun countByStatut(statut: StatutBudget): Long

    // Vérifier si une version existe pour une convention
    fun existsByConventionIdAndVersion(conventionId: Long, version: String): Boolean
}
