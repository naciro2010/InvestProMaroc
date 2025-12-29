package ma.investpro.repository

import ma.investpro.entity.ValeurDimension
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

/**
 * Repository ValeurDimension - Approche DDD simplifiée
 */
@Repository
interface ValeurDimensionRepository : JpaRepository<ValeurDimension, Long> {

    // Recherche par dimension
    fun findByDimensionId(dimensionId: Long): List<ValeurDimension>

    // Recherche par dimension, ordonnées
    fun findByDimensionIdOrderByOrdreAsc(dimensionId: Long): List<ValeurDimension>

    // Recherche valeurs actives d'une dimension
    fun findByDimensionIdAndActiveTrueOrderByOrdreAsc(dimensionId: Long): List<ValeurDimension>

    // Recherche par code dans une dimension
    fun findByDimensionIdAndCode(dimensionId: Long, code: String): ValeurDimension?

    // Vérifier si code existe dans une dimension
    fun existsByDimensionIdAndCode(dimensionId: Long, code: String): Boolean

    // Compter valeurs par dimension
    fun countByDimensionId(dimensionId: Long): Long
}
