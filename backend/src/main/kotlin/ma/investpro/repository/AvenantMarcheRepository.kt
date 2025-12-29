package ma.investpro.repository

import ma.investpro.entity.AvenantMarche
import ma.investpro.entity.StatutAvenant
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface AvenantMarcheRepository : JpaRepository<AvenantMarche, Long> {

    /**
     * Recherche tous les avenants d'un marché
     */
    fun findByMarcheIdOrderByDateAvenantAsc(marcheId: Long): List<AvenantMarche>

    /**
     * Recherche par numéro d'avenant
     */
    fun findByNumeroAvenant(numeroAvenant: String): AvenantMarche?

    /**
     * Recherche par statut
     */
    fun findByMarcheIdAndStatut(marcheId: Long, statut: StatutAvenant): List<AvenantMarche>

    /**
     * Compte le nombre d'avenants d'un marché
     */
    fun countByMarcheId(marcheId: Long): Long

    /**
     * Compte le nombre d'avenants validés
     */
    fun countByMarcheIdAndStatut(marcheId: Long, statut: StatutAvenant): Long

    /**
     * Calcule le montant total des avenants validés
     */
    @Query("""
        SELECT COALESCE(SUM(a.montantAvenantHT), 0)
        FROM AvenantMarche a
        WHERE a.marche.id = :marcheId
        AND a.statut = 'VALIDE'
    """)
    fun getTotalAvenantsValides(@Param("marcheId") marcheId: Long): java.math.BigDecimal

    /**
     * Calcule le délai total ajouté par les avenants validés
     */
    @Query("""
        SELECT COALESCE(SUM(a.delaiSupplementaireMois), 0)
        FROM AvenantMarche a
        WHERE a.marche.id = :marcheId
        AND a.statut = 'VALIDE'
        AND a.delaiSupplementaireMois IS NOT NULL
    """)
    fun getTotalDelaiSupplementaire(@Param("marcheId") marcheId: Long): Int

    /**
     * Recherche les avenants en attente de validation
     */
    @Query("""
        SELECT a FROM AvenantMarche a
        WHERE a.statut IN ('BROUILLON', 'SOUMIS')
        ORDER BY a.dateAvenant DESC
    """)
    fun findAvenantsEnAttente(): List<AvenantMarche>

    /**
     * Recherche par plage de dates
     */
    fun findByDateAvenantBetweenOrderByDateAvenantDesc(dateDebut: LocalDate, dateFin: LocalDate): List<AvenantMarche>
}
