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
    @Query(
        """
        SELECT a FROM AvenantConvention a
        WHERE a.convention.id = :conventionId
        AND a.statut = 'VALIDE'
        ORDER BY a.ordreApplication DESC, a.dateValidation DESC
        """
    )
    fun findLastValidatedAvenant(@Param("conventionId") conventionId: Long): AvenantConvention?

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
    @Query(
        """
        SELECT a FROM AvenantConvention a
        WHERE a.statut = 'SOUMIS'
        ORDER BY a.dateSoumission ASC
        """
    )
    fun findAllPendingValidation(): List<AvenantConvention>

    /**
     * Trouve les statistiques des avenants par convention
     */
    @Query(
        """
        SELECT
            a.convention.id as conventionId,
            COUNT(a) as totalAvenants,
            SUM(CASE WHEN a.statut = 'BROUILLON' THEN 1 ELSE 0 END) as brouillons,
            SUM(CASE WHEN a.statut = 'SOUMIS' THEN 1 ELSE 0 END) as soumis,
            SUM(CASE WHEN a.statut = 'VALIDE' THEN 1 ELSE 0 END) as valides,
            SUM(COALESCE(a.deltaBudget, 0)) as totalDeltaBudget
        FROM AvenantConvention a
        WHERE a.convention.id = :conventionId
        GROUP BY a.convention.id
        """
    )
    fun getStatistiquesByConvention(@Param("conventionId") conventionId: Long): Map<String, Any>?
}
