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

    /**
     * Recherche étendue avec relations pré-chargées (évite N+1)
     */
    @Query("""
        SELECT d FROM DepenseInvestissement d
        LEFT JOIN FETCH d.fournisseur
        LEFT JOIN FETCH d.convention
        LEFT JOIN FETCH d.compteBancaire
        WHERE (:fournisseurId IS NULL OR d.fournisseur.id = :fournisseurId)
        AND (:conventionId IS NULL OR d.convention.id = :conventionId)
        AND (:statut IS NULL OR d.statut = :statut)
        AND (:paye IS NULL OR d.paye = :paye)
        AND (:dateDebut IS NULL OR d.dateFacture >= :dateDebut)
        AND (:dateFin IS NULL OR d.dateFacture <= :dateFin)
        ORDER BY d.dateFacture DESC
    """)
    fun searchFull(
        @Param("fournisseurId") fournisseurId: Long?,
        @Param("conventionId") conventionId: Long?,
        @Param("statut") statut: StatutDepense?,
        @Param("paye") paye: Boolean?,
        @Param("dateDebut") dateDebut: LocalDate?,
        @Param("dateFin") dateFin: LocalDate?
    ): List<DepenseInvestissement>

    /**
     * Toutes les dépenses avec relations pré-chargées (évite N+1)
     */
    @Query("""
        SELECT d FROM DepenseInvestissement d
        LEFT JOIN FETCH d.fournisseur
        LEFT JOIN FETCH d.convention
        LEFT JOIN FETCH d.compteBancaire
        ORDER BY d.dateFacture DESC
    """)
    fun findAllWithRelations(): List<DepenseInvestissement>

    /**
     * Comptage par statut payé
     */
    fun countByPaye(paye: Boolean): Long

    /**
     * Somme montant TTC par statut payé
     */
    @Query("SELECT COALESCE(SUM(d.montantTtc), 0) FROM DepenseInvestissement d WHERE d.paye = :paye")
    fun sumMontantTtcByPaye(@Param("paye") paye: Boolean): java.math.BigDecimal
}
