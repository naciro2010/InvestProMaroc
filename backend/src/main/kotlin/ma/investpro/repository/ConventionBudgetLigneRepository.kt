package ma.investpro.repository

import ma.investpro.entity.ConventionBudgetLigne
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

/**
 * Repository pour l'entité ConventionBudgetLigne
 * Gestion des lignes de répartition budgétaire par catégorie de dépense
 */
@Repository
interface ConventionBudgetLigneRepository : JpaRepository<ConventionBudgetLigne, Long> {

    /**
     * Trouve toutes les lignes budget d'une convention (actives)
     */
    fun findByConventionIdAndActifTrue(conventionId: Long): List<ConventionBudgetLigne>

    /**
     * Trouve toutes les lignes budget d'une convention
     */
    fun findByConventionId(conventionId: Long): List<ConventionBudgetLigne>

    /**
     * Vérifie si une catégorie est déjà utilisée dans une convention
     */
    fun existsByConventionIdAndCategorieDepenseId(conventionId: Long, categorieDepenseId: Long): Boolean

    /**
     * Trouve une ligne par convention et catégorie
     */
    fun findByConventionIdAndCategorieDepenseId(conventionId: Long, categorieDepenseId: Long): ConventionBudgetLigne?

    /**
     * Supprime toutes les lignes budget d'une convention
     */
    fun deleteByConventionId(conventionId: Long)
}
