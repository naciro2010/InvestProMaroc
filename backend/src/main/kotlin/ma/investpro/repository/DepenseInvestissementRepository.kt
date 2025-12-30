package ma.investpro.repository

import ma.investpro.entity.DepenseInvestissement
import ma.investpro.entity.StatutDepense
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface DepenseInvestissementRepository : JpaRepository<DepenseInvestissement, Long> {

    /**
     * Recherche par numéro de facture
     */
    fun findByNumeroFacture(numeroFacture: String): DepenseInvestissement?

    /**
     * Recherche par fournisseur
     */
    fun findByFournisseurId(fournisseurId: Long): List<DepenseInvestissement>

    /**
     * Recherche par convention
     */
    fun findByConventionId(conventionId: Long): List<DepenseInvestissement>

    /**
     * Recherche par statut
     */
    fun findByStatut(statut: StatutDepense): List<DepenseInvestissement>

    /**
     * Recherche les dépenses payées
     */
    fun findByPayeTrue(): List<DepenseInvestissement>

    /**
     * Recherche les dépenses non payées
     */
    fun findByPayeFalse(): List<DepenseInvestissement>

    /**
     * Recherche par plage de dates
     */
    @Query("SELECT d FROM DepenseInvestissement d WHERE d.dateFacture BETWEEN :dateDebut AND :dateFin ORDER BY d.dateFacture DESC")
    fun findByDateFactureBetween(
        @Param("dateDebut") dateDebut: LocalDate,
        @Param("dateFin") dateFin: LocalDate
    ): List<DepenseInvestissement>

    /**
     * Recherche multi-critères
     */
    @Query("""
        SELECT d FROM DepenseInvestissement d
        WHERE (:fournisseurId IS NULL OR d.fournisseur.id = :fournisseurId)
        AND (:conventionId IS NULL OR d.convention.id = :conventionId)
        AND (:statut IS NULL OR d.statut = :statut)
        AND (:dateDebut IS NULL OR d.dateFacture >= :dateDebut)
        AND (:dateFin IS NULL OR d.dateFacture <= :dateFin)
        ORDER BY d.dateFacture DESC
    """)
    fun search(
        @Param("fournisseurId") fournisseurId: Long?,
        @Param("conventionId") conventionId: Long?,
        @Param("statut") statut: StatutDepense?,
        @Param("dateDebut") dateDebut: LocalDate?,
        @Param("dateFin") dateFin: LocalDate?
    ): List<DepenseInvestissement>

    /**
     * Total des dépenses par convention
     */
    @Query("""
        SELECT COALESCE(SUM(d.montantTtc), 0)
        FROM DepenseInvestissement d
        WHERE d.convention.id = :conventionId
    """)
    fun getTotalByConvention(@Param("conventionId") conventionId: Long): java.math.BigDecimal
}
