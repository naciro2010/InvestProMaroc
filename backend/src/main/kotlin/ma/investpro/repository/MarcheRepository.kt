package ma.investpro.repository

import ma.investpro.entity.Marche
import ma.investpro.entity.StatutMarche
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface MarcheRepository : JpaRepository<Marche, Long> {

    /**
     * Recherche par numéro de marché
     */
    fun findByNumeroMarche(numeroMarche: String): Marche?

    /**
     * Recherche par numéro d'appel d'offres
     */
    fun findByNumAo(numAo: String): List<Marche>

    /**
     * Recherche par convention
     */
    fun findByConventionId(conventionId: Long): List<Marche>

    /**
     * Recherche par fournisseur
     */
    fun findByFournisseurId(fournisseurId: Long): List<Marche>

    /**
     * Recherche par statut
     */
    fun findByStatut(statut: StatutMarche): List<Marche>

    /**
     * Recherche par plage de dates
     */
    @Query("SELECT m FROM Marche m WHERE m.dateMarche BETWEEN :dateDebut AND :dateFin ORDER BY m.dateMarche DESC")
    fun findByDateMarcheBetween(
        @Param("dateDebut") dateDebut: LocalDate,
        @Param("dateFin") dateFin: LocalDate
    ): List<Marche>

    /**
     * Recherche marchés d'une convention avec montant total
     */
    @Query("""
        SELECT m FROM Marche m
        WHERE m.convention.id = :conventionId
        ORDER BY m.dateMarche DESC
    """)
    fun findMarchesByConvention(@Param("conventionId") conventionId: Long): List<Marche>

    /**
     * Statistiques - Total engagé par convention
     */
    @Query("""
        SELECT COALESCE(SUM(m.montantTtc), 0)
        FROM Marche m
        WHERE m.convention.id = :conventionId
        AND m.statut IN ('EN_COURS', 'VALIDE', 'TERMINE')
    """)
    fun getTotalEngageByConvention(@Param("conventionId") conventionId: Long): java.math.BigDecimal

    /**
     * Recherche multi-critères
     */
    @Query("""
        SELECT m FROM Marche m
        WHERE (:conventionId IS NULL OR m.convention.id = :conventionId)
        AND (:fournisseurId IS NULL OR m.fournisseur.id = :fournisseurId)
        AND (:statut IS NULL OR m.statut = :statut)
        AND (:dateDebut IS NULL OR m.dateMarche >= :dateDebut)
        AND (:dateFin IS NULL OR m.dateMarche <= :dateFin)
        ORDER BY m.dateMarche DESC
    """)
    fun search(
        @Param("conventionId") conventionId: Long?,
        @Param("fournisseurId") fournisseurId: Long?,
        @Param("statut") statut: StatutMarche?,
        @Param("dateDebut") dateDebut: LocalDate?,
        @Param("dateFin") dateFin: LocalDate?
    ): List<Marche>
}
