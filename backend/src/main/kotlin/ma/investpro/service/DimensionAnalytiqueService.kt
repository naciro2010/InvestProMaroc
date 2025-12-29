package ma.investpro.service

import ma.investpro.entity.DimensionAnalytique
import ma.investpro.entity.ValeurDimension
import ma.investpro.repository.DimensionAnalytiqueRepository
import ma.investpro.repository.ValeurDimensionRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Service DimensionAnalytique - Approche DDD simplifiée
 */
@Service
@Transactional
class DimensionAnalytiqueService(
    private val dimensionRepository: DimensionAnalytiqueRepository,
    private val valeurRepository: ValeurDimensionRepository
) {

    // ========== CRUD Dimensions ==========

    fun findAll(): List<DimensionAnalytique> = dimensionRepository.findAll()

    fun findById(id: Long): DimensionAnalytique? = dimensionRepository.findByIdOrNull(id)

    fun findByCode(code: String): DimensionAnalytique? = dimensionRepository.findByCode(code)

    fun findActive(): List<DimensionAnalytique> =
        dimensionRepository.findByActiveTrueOrderByOrdreAsc()

    fun findObligatoires(): List<DimensionAnalytique> =
        dimensionRepository.findByObligatoireTrue()

    fun create(dimension: DimensionAnalytique): DimensionAnalytique {
        require(dimension.id == null) { "Cannot create dimension with existing ID" }
        require(!dimensionRepository.existsByCode(dimension.code)) {
            "Dimension avec code ${dimension.code} existe déjà"
        }
        require(dimension.nom.isNotBlank()) { "Le nom est obligatoire" }
        require(dimension.code.isNotBlank()) { "Le code est obligatoire" }

        return dimensionRepository.save(dimension)
    }

    fun update(id: Long, dimension: DimensionAnalytique): DimensionAnalytique {
        val existing = findById(id)
            ?: throw IllegalArgumentException("Dimension $id introuvable")

        existing.apply {
            nom = dimension.nom
            description = dimension.description
            ordre = dimension.ordre
            active = dimension.active
            obligatoire = dimension.obligatoire
        }

        return dimensionRepository.save(existing)
    }

    fun delete(id: Long) {
        val dimension = findById(id)
            ?: throw IllegalArgumentException("Dimension $id introuvable")

        // Vérifier qu'il n'y a pas d'imputations utilisant cette dimension
        // (à implémenter si nécessaire)

        dimensionRepository.delete(dimension)
    }

    fun toggleActive(id: Long): DimensionAnalytique {
        val dimension = findById(id)
            ?: throw IllegalArgumentException("Dimension $id introuvable")

        dimension.active = !dimension.active
        return dimensionRepository.save(dimension)
    }

    // ========== CRUD Valeurs ==========

    fun findValeursByDimension(dimensionId: Long): List<ValeurDimension> =
        valeurRepository.findByDimensionIdOrderByOrdreAsc(dimensionId)

    fun findValeursActivesByDimension(dimensionId: Long): List<ValeurDimension> =
        valeurRepository.findByDimensionIdAndActiveTrueOrderByOrdreAsc(dimensionId)

    fun createValeur(dimensionId: Long, valeur: ValeurDimension): ValeurDimension {
        val dimension = findById(dimensionId)
            ?: throw IllegalArgumentException("Dimension $dimensionId introuvable")

        require(!valeurRepository.existsByDimensionIdAndCode(dimensionId, valeur.code)) {
            "Valeur avec code ${valeur.code} existe déjà dans cette dimension"
        }
        require(valeur.libelle.isNotBlank()) { "Le libellé est obligatoire" }
        require(valeur.code.isNotBlank()) { "Le code est obligatoire" }

        valeur.dimension = dimension
        return valeurRepository.save(valeur)
    }

    fun updateValeur(id: Long, valeur: ValeurDimension): ValeurDimension {
        val existing = valeurRepository.findByIdOrNull(id)
            ?: throw IllegalArgumentException("Valeur $id introuvable")

        existing.apply {
            libelle = valeur.libelle
            description = valeur.description
            ordre = valeur.ordre
            active = valeur.active
        }

        return valeurRepository.save(existing)
    }

    fun deleteValeur(id: Long) {
        val valeur = valeurRepository.findByIdOrNull(id)
            ?: throw IllegalArgumentException("Valeur $id introuvable")

        valeurRepository.delete(valeur)
    }

    fun toggleValeurActive(id: Long): ValeurDimension {
        val valeur = valeurRepository.findByIdOrNull(id)
            ?: throw IllegalArgumentException("Valeur $id introuvable")

        valeur.active = !valeur.active
        return valeurRepository.save(valeur)
    }

    // ========== Statistiques ==========

    fun getStatistiques(): Map<String, Any> {
        return mapOf(
            "totalDimensions" to dimensionRepository.count(),
            "dimensionsActives" to dimensionRepository.countByActiveTrue(),
            "totalValeurs" to valeurRepository.count()
        )
    }
}
