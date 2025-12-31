package ma.investpro.repository

import ma.investpro.entity.ModePaiement
import ma.investpro.entity.Paiement
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate

/**
 * Repository Paiement - Gestion des paiements réels
 */
@Repository
interface PaiementRepository : JpaRepository<Paiement, Long> {

    // Recherche par ordre de paiement
    fun findByOrdrePaiementId(ordrePaiementId: Long): List<Paiement>

    // Recherche par référence paiement
    fun findByReferencePaiement(referencePaiement: String): Paiement?

    // Recherche par mode de paiement
    fun findByModePaiement(modePaiement: ModePaiement): List<Paiement>

    // Recherche par date de valeur entre deux dates
    fun findByDateValeurBetween(dateDebut: LocalDate, dateFin: LocalDate): List<Paiement>

    // Recherche par compte bancaire
    fun findByCompteBancaireId(compteBancaireId: Long): List<Paiement>

    // Recherche des paiements partiels
    fun findByEstPaiementPartiel(estPartiel: Boolean): List<Paiement>

    // Vérifier si une référence de paiement existe
    fun existsByReferencePaiement(referencePaiement: String): Boolean
}
