package ma.investpro.repository

import ma.investpro.entity.OrdrePaiement
import ma.investpro.entity.StatutOP
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate

/**
 * Repository Ordre de Paiement
 */
@Repository
interface OrdrePaiementRepository : JpaRepository<OrdrePaiement, Long> {

    // Recherche par décompte
    fun findByDecompteId(decompteId: Long): List<OrdrePaiement>

    // Recherche par numéro OP
    fun findByNumeroOP(numeroOP: String): OrdrePaiement?

    // Recherche par statut
    fun findByStatut(statut: StatutOP): List<OrdrePaiement>

    // Recherche par date OP entre deux dates
    fun findByDateOPBetween(dateDebut: LocalDate, dateFin: LocalDate): List<OrdrePaiement>

    // Recherche par date prévue de paiement
    fun findByDatePrevuePaiement(date: LocalDate): List<OrdrePaiement>

    // Recherche par compte bancaire
    fun findByCompteBancaireId(compteBancaireId: Long): List<OrdrePaiement>

    // Recherche par décompte et statut
    fun findByDecompteIdAndStatut(decompteId: Long, statut: StatutOP): List<OrdrePaiement>

    // Compter par statut
    fun countByStatut(statut: StatutOP): Long

    // Vérifier si un numéro OP existe
    fun existsByNumeroOP(numeroOP: String): Boolean
}
