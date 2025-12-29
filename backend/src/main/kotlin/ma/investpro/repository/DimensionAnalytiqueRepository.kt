package ma.investpro.repository

import ma.investpro.entity.DimensionAnalytique
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

/**
 * Repository DimensionAnalytique - Approche DDD simplifiée
 */
@Repository
interface DimensionAnalytiqueRepository : JpaRepository<DimensionAnalytique, Long> {

    // Recherche par code
    fun findByCode(code: String): DimensionAnalytique?

    // Recherche par statut actif
    fun findByActiveTrue(): List<DimensionAnalytique>

    // Recherche par statut actif, ordonnées
    fun findByActiveTrueOrderByOrdreAsc(): List<DimensionAnalytique>

    // Recherche dimensions obligatoires
    fun findByObligatoireTrue(): List<DimensionAnalytique>

    // Vérifier si code existe
    fun existsByCode(code: String): Boolean

    // Compter dimensions actives
    fun countByActiveTrue(): Long
}
