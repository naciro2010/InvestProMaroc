package ma.investpro.service

import ma.investpro.dto.ImputationStatistiques
import ma.investpro.entity.ImputationAnalytique
import ma.investpro.entity.TypeImputation
import ma.investpro.repository.ImputationAnalytiqueRepository
import ma.investpro.repository.DimensionAnalytiqueRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

/**
 * Service ImputationAnalytique - Approche DDD simplifiée
 * Gère les imputations et les agrégations analytiques
 */
@Service
@Transactional
class ImputationAnalytiqueService(
    private val imputationRepository: ImputationAnalytiqueRepository,
    private val dimensionRepository: DimensionAnalytiqueRepository
) {

    // ========== CRUD Imputations ==========

    fun findAll(): List<ImputationAnalytique> = imputationRepository.findAll()

    fun findById(id: Long): ImputationAnalytique? = imputationRepository.findByIdOrNull(id)

    fun findByReference(
        typeImputation: TypeImputation,
        referenceId: Long
    ): List<ImputationAnalytique> =
        imputationRepository.findByTypeImputationAndReferenceId(typeImputation, referenceId)

    fun create(imputation: ImputationAnalytique): ImputationAnalytique {
        require(imputation.id == null) { "Cannot create imputation with existing ID" }
        require(imputation.montant > BigDecimal.ZERO) {
            "Le montant doit être supérieur à 0"
        }

        // Vérifier que les dimensions obligatoires sont renseignées
        val dimensionsObligatoires = dimensionRepository.findByObligatoireTrue()
        val codesObligatoires = dimensionsObligatoires.map { it.code }

        require(imputation.isComplete(codesObligatoires)) {
            "Les dimensions obligatoires doivent être renseignées: ${codesObligatoires.joinToString(", ")}"
        }

        // Vérifier que les codes de dimensions existent
        imputation.dimensionsValeurs.keys.forEach { codeDimension ->
            require(dimensionRepository.existsByCode(codeDimension)) {
                "Dimension avec code $codeDimension introuvable"
            }
        }

        return imputationRepository.save(imputation)
    }

    fun update(id: Long, imputation: ImputationAnalytique): ImputationAnalytique {
        val existing = findById(id)
            ?: throw IllegalArgumentException("Imputation $id introuvable")

        existing.apply {
            montant = imputation.montant
            dimensionsValeurs = imputation.dimensionsValeurs
        }

        return imputationRepository.save(existing)
    }

    fun delete(id: Long) {
        val imputation = findById(id)
            ?: throw IllegalArgumentException("Imputation $id introuvable")

        imputationRepository.delete(imputation)
    }

    fun deleteByReference(typeImputation: TypeImputation, referenceId: Long) {
        imputationRepository.deleteByTypeImputationAndReferenceId(typeImputation, referenceId)
    }

    // ========== Validation ==========

    /**
     * Vérifier que le total des imputations = montant de référence
     */
    fun validateTotal(
        typeImputation: TypeImputation,
        referenceId: Long,
        montantAttendu: BigDecimal
    ): Boolean {
        val totalImpute = imputationRepository.sumMontantByTypeAndReference(
            typeImputation,
            referenceId
        )
        return totalImpute.compareTo(montantAttendu) == 0
    }

    fun getTotalImpute(
        typeImputation: TypeImputation,
        referenceId: Long
    ): BigDecimal {
        return imputationRepository.sumMontantByTypeAndReference(typeImputation, referenceId)
    }

    // ========== Reporting et Agrégations ==========

    /**
     * Agrégation par une dimension
     * Retourne Map<valeur, montant>
     */
    fun aggregateByDimension(
        typeImputation: TypeImputation,
        codeDimension: String
    ): Map<String, BigDecimal> {
        val results = imputationRepository.aggregateByDimension(
            typeImputation.name,
            codeDimension
        )

        return results.associate { row ->
            val valeur = row[0]?.toString() ?: "Non défini"
            val total = (row[1] as? BigDecimal) ?: BigDecimal.ZERO
            valeur to total
        }
    }

    /**
     * Agrégation croisée par 2 dimensions
     * Retourne Map<Pair<dim1, dim2>, montant>
     */
    fun aggregateByTwoDimensions(
        typeImputation: TypeImputation,
        codeDimension1: String,
        codeDimension2: String
    ): Map<Pair<String, String>, BigDecimal> {
        val results = imputationRepository.aggregateByTwoDimensions(
            typeImputation.name,
            codeDimension1,
            codeDimension2
        )

        return results.associate { row ->
            val dim1 = row[0]?.toString() ?: "Non défini"
            val dim2 = row[1]?.toString() ?: "Non défini"
            val total = (row[2] as? BigDecimal) ?: BigDecimal.ZERO
            Pair(dim1, dim2) to total
        }
    }

    // ========== Statistiques ==========

    fun getStatistiques(): ImputationStatistiques {
        val allImputations = imputationRepository.findAll()
        val totalMontant = allImputations.fold(BigDecimal.ZERO) { acc, imputation ->
            acc + imputation.montant
        }

        return ImputationStatistiques(
            totalImputations = allImputations.size.toLong(),
            totalMontantImpute = totalMontant,
            nombreTypes = TypeImputation.entries.size
        )
    }
}
