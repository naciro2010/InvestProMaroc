package ma.investpro.repository

import ma.investpro.entity.Commission
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface CommissionRepository : JpaRepository<Commission, Long> {

    /**
     * Recherche par dépense
     */
    fun findByDepenseId(depenseId: Long): Commission?

    /**
     * Recherche par convention
     */
    fun findByConventionId(conventionId: Long): List<Commission>

    /**
     * Recherche par plage de dates
     */
    @Query("SELECT c FROM Commission c WHERE c.dateCalcul BETWEEN :dateDebut AND :dateFin ORDER BY c.dateCalcul DESC")
    fun findByDateCalculBetween(
        @Param("dateDebut") dateDebut: LocalDate,
        @Param("dateFin") dateFin: LocalDate
    ): List<Commission>

    /**
     * Recherche multi-critères
     */
    @Query("""
        SELECT c FROM Commission c
        WHERE (:conventionId IS NULL OR c.convention.id = :conventionId)
        AND (:dateDebut IS NULL OR c.dateCalcul >= :dateDebut)
        AND (:dateFin IS NULL OR c.dateCalcul <= :dateFin)
        ORDER BY c.dateCalcul DESC
    """)
    fun search(
        @Param("conventionId") conventionId: Long?,
        @Param("dateDebut") dateDebut: LocalDate?,
        @Param("dateFin") dateFin: LocalDate?
    ): List<Commission>

    /**
     * Total des commissions par convention
     */
    @Query("""
        SELECT COALESCE(SUM(c.montantCommissionTtc), 0)
        FROM Commission c
        WHERE c.convention.id = :conventionId
    """)
    fun getTotalByConvention(@Param("conventionId") conventionId: Long): java.math.BigDecimal
}
