package ma.investpro.repository

import ma.investpro.entity.Decompte
import ma.investpro.entity.StatutDecompte
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

/**
 * Repository Decompte - Approche DDD simplifiée
 */
@Repository
interface DecompteRepository : JpaRepository<Decompte, Long> {

    // Recherche par marché
    fun findByMarcheId(marcheId: Long): List<Decompte>

    // Recherche par statut
    fun findByStatut(statut: StatutDecompte): List<Decompte>

    // Recherche par marché et statut
    fun findByMarcheIdAndStatutIn(marcheId: Long, statuts: List<StatutDecompte>): List<Decompte>

    // Compter par statut
    fun countByStatut(statut: StatutDecompte): Long

    // Vérifier si un numéro de décompte existe
    fun existsByNumeroDecompte(numeroDecompte: String): Boolean
}
