package ma.investpro.repository

import ma.investpro.entity.Budget
import ma.investpro.entity.StatutBudget
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

/**
 * Repository Budget - Gestion des budgets avec versions
 */
@Repository
interface BudgetRepository : JpaRepository<Budget, Long> {

    /**
     * Fetch all budgets with convention eagerly loaded to avoid N+1 and lazy init issues.
     * Used by listing endpoints where convention info is displayed.
     */
    @EntityGraph(attributePaths = ["convention"])
    @Query("SELECT b FROM Budget b")
    fun findAllWithConvention(): List<Budget>

    /**
     * Fetch a single budget with convention eagerly loaded.
     * Used by detail endpoint where convention info is displayed.
     */
    @EntityGraph(attributePaths = ["convention"])
    @Query("SELECT b FROM Budget b WHERE b.id = :id")
    fun findByIdWithConvention(id: Long): Budget?

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
