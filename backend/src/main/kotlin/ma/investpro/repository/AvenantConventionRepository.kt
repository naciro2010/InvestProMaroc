package ma.investpro.repository

import ma.investpro.entity.AvenantConvention
import ma.investpro.entity.StatutAvenantConvention
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

/**
 * Repository pour les avenants de conventions
 */
@Repository
interface AvenantConventionRepository : JpaRepository<AvenantConvention, Long> {

    /**
     * Trouve tous les avenants d'une convention
     */
    fun findByConventionIdOrderByOrdreApplicationAsc(conventionId: Long): List<AvenantConvention>

    /**
     * Trouve tous les avenants d'une convention triés par date
     */
    fun findByConventionIdOrderByDateAvenantDesc(conventionId: Long): List<AvenantConvention>

    /**
     * Trouve les avenants par statut
     */
    fun findByStatut(statut: StatutAvenantConvention): List<AvenantConvention>

    /**
     * Trouve les avenants d'une convention avec un statut donné
     */
    fun findByConventionIdAndStatut(conventionId: Long, statut: StatutAvenantConvention): List<AvenantConvention>

    /**
     * Compte le nombre d'avenants d'une convention
     */
    fun countByConventionId(conventionId: Long): Long

    /**
     * Compte le nombre d'avenants validés d'une convention
     */
    fun countByConventionIdAndStatut(conventionId: Long, statut: StatutAvenantConvention): Long

    /**
     * Trouve le dernier avenant validé d'une convention
     */
    fun findFirstByConventionIdAndStatutOrderByOrdreApplicationDescDateValidationDesc(
        conventionId: Long,
        statut: StatutAvenantConvention = StatutAvenantConvention.VALIDE
    ): AvenantConvention?

    /**
     * Trouve le prochain ordre d'application pour une convention
     */
    @Query(
        """
        SELECT COALESCE(MAX(a.ordreApplication), 0) + 1
        FROM AvenantConvention a
        WHERE a.convention.id = :conventionId
        """
    )
    fun findNextOrdreApplication(@Param("conventionId") conventionId: Long): Int

    /**
     * Vérifie si un numéro d'avenant existe déjà
     */
    fun existsByNumeroAvenant(numeroAvenant: String): Boolean

    /**
     * Trouve un avenant par son numéro
     */
    fun findByNumeroAvenant(numeroAvenant: String): AvenantConvention?

    /**
     * Trouve les avenants créés par un utilisateur
     */
    fun findByCreatedByIdOrderByCreatedAtDesc(createdById: Long): List<AvenantConvention>

    /**
     * Trouve tous les avenants en attente de validation
     */
    fun findByStatutOrderByDateSoumissionAsc(statut: StatutAvenantConvention = StatutAvenantConvention.SOUMIS): List<AvenantConvention>

    /**
     * Somme des deltas budget pour une convention (seulement avenants validés)
     */
    @Query(
        """
        SELECT SUM(COALESCE(a.deltaBudget, 0))
        FROM AvenantConvention a
        WHERE a.convention.id = :conventionId
        AND a.statut = ma.investpro.entity.StatutAvenantConvention.VALIDE
        """
    )
    fun sumDeltaBudgetByConvention(@Param("conventionId") conventionId: Long): java.math.BigDecimal?

    /**
     * Somme des deltas budget pour tous les avenants (inclus brouillons et soumis)
     */
    @Query(
        """
        SELECT SUM(COALESCE(a.deltaBudget, 0))
        FROM AvenantConvention a
        WHERE a.convention.id = :conventionId
        """
    )
    fun sumDeltaBudgetAllByConvention(@Param("conventionId") conventionId: Long): java.math.BigDecimal?
}
