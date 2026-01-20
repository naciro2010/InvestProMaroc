package ma.investpro.repository

import ma.investpro.entity.ConventionModification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

/**
 * Repository pour l'historique des modifications des conventions
 */
@Repository
interface ConventionModificationRepository : JpaRepository<ConventionModification, Long> {

    /**
     * Récupérer toutes les modifications d'une convention, triées par date décroissante
     */
    fun findByConventionIdOrderByDateModificationDesc(conventionId: Long): List<ConventionModification>

    /**
     * Récupérer les dernières N modifications d'une convention
     */
    fun findTopNByConventionIdOrderByDateModificationDesc(
        conventionId: Long,
        limit: Int
    ): List<ConventionModification>

    /**
     * Récupérer les modifications effectuées par un utilisateur
     */
    fun findByModifieParIdOrderByDateModificationDesc(userId: Long): List<ConventionModification>

    /**
     * Récupérer les modifications par type
     */
    fun findByTypeModificationOrderByDateModificationDesc(type: String): List<ConventionModification>

    /**
     * Récupérer les modifications dans une plage de dates
     */
    fun findByDateModificationBetweenOrderByDateModificationDesc(
        debut: LocalDateTime,
        fin: LocalDateTime
    ): List<ConventionModification>

    /**
     * Compter le nombre de modifications d'une convention
     */
    fun countByConventionId(conventionId: Long): Long

    /**
     * Récupérer la dernière modification d'une convention
     */
    @Query("SELECT cm FROM ConventionModification cm WHERE cm.convention.id = :conventionId ORDER BY cm.dateModification DESC LIMIT 1")
    fun findLastModificationByConventionId(@Param("conventionId") conventionId: Long): ConventionModification?

    /**
     * Vérifier si une convention a été modifiée
     */
    fun existsByConventionId(conventionId: Long): Boolean
}
