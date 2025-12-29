package ma.investpro.repository

import ma.investpro.entity.Convention
import ma.investpro.entity.StatutConvention
import ma.investpro.entity.TypeConvention
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface ConventionRepository : JpaRepository<Convention, Long> {

    // Recherche par code unique
    fun findByCode(code: String): Convention?

    // Recherche par numéro unique
    fun findByNumero(numero: String): Convention?

    // Recherche par type
    fun findByTypeConvention(type: TypeConvention): List<Convention>

    // Recherche par statut
    fun findByStatut(statut: StatutConvention): List<Convention>

    // Recherche par statut multiple
    fun findByStatutIn(statuts: List<StatutConvention>): List<Convention>

    // Recherche des conventions actives (pas annulées)
    fun findByActifTrue(): List<Convention>

    // Recherche des sous-conventions d'une convention parente
    fun findByParentConventionId(parentId: Long): List<Convention>

    // Recherche des conventions racine (sans parent)
    fun findByParentConventionIsNull(): List<Convention>

    // Recherche par période
    @Query("SELECT c FROM Convention c WHERE c.dateDebut <= :dateFin AND (c.dateFin IS NULL OR c.dateFin >= :dateDebut)")
    fun findByPeriode(dateDebut: LocalDate, dateFin: LocalDate): List<Convention>

    // Recherche des conventions en cours
    @Query("SELECT c FROM Convention c WHERE c.statut = 'EN_COURS' AND c.dateDebut <= CURRENT_DATE AND (c.dateFin IS NULL OR c.dateFin >= CURRENT_DATE)")
    fun findConventionsEnCours(): List<Convention>

    // Recherche des conventions expirées ou en retard
    @Query("SELECT c FROM Convention c WHERE c.statut IN ('EN_COURS', 'VALIDEE') AND c.dateFin < CURRENT_DATE")
    fun findConventionsExpirees(): List<Convention>

    // Recherche des conventions verrouillées
    fun findByIsLockedTrue(): List<Convention>

    // Recherche par libellé (like)
    fun findByLibelleContainingIgnoreCase(libelle: String): List<Convention>

    // Vérifier si un code existe déjà
    fun existsByCode(code: String): Boolean

    // Vérifier si un numéro existe déjà
    fun existsByNumero(numero: String): Boolean

    // Compter par statut
    fun countByStatut(statut: StatutConvention): Long

    // Compter par type
    fun countByTypeConvention(type: TypeConvention): Long
}
