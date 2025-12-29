package ma.investpro.repository

import ma.investpro.entity.ImputationAnalytique
import ma.investpro.entity.TypeImputation
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.math.BigDecimal

/**
 * Repository ImputationAnalytique - Approche DDD simplifiée
 * Avec requêtes JSONB PostgreSQL
 */
@Repository
interface ImputationAnalytiqueRepository : JpaRepository<ImputationAnalytique, Long> {

    // Recherche par type et référence
    fun findByTypeImputationAndReferenceId(
        typeImputation: TypeImputation,
        referenceId: Long
    ): List<ImputationAnalytique>

    // Recherche par type
    fun findByTypeImputation(typeImputation: TypeImputation): List<ImputationAnalytique>

    // Somme des montants par type et référence
    @Query("SELECT COALESCE(SUM(i.montant), 0) FROM ImputationAnalytique i WHERE i.typeImputation = :type AND i.referenceId = :refId")
    fun sumMontantByTypeAndReference(
        @Param("type") typeImputation: TypeImputation,
        @Param("refId") referenceId: Long
    ): BigDecimal

    // Agrégation par dimension (utilise JSONB)
    @Query(
        value = """
        SELECT
            dimensions_valeurs->>:dimension as valeur,
            SUM(montant) as total
        FROM imputations_analytiques
        WHERE type_imputation = :type
        GROUP BY dimensions_valeurs->>:dimension
        """,
        nativeQuery = true
    )
    fun aggregateByDimension(
        @Param("type") typeImputation: String,
        @Param("dimension") dimension: String
    ): List<Array<Any>>

    // Agrégation croisée (2 dimensions)
    @Query(
        value = """
        SELECT
            dimensions_valeurs->>:dim1 as dimension1,
            dimensions_valeurs->>:dim2 as dimension2,
            SUM(montant) as total
        FROM imputations_analytiques
        WHERE type_imputation = :type
        GROUP BY dimensions_valeurs->>:dim1, dimensions_valeurs->>:dim2
        """,
        nativeQuery = true
    )
    fun aggregateByTwoDimensions(
        @Param("type") typeImputation: String,
        @Param("dim1") dimension1: String,
        @Param("dim2") dimension2: String
    ): List<Array<Any>>

    // Supprimer par type et référence
    fun deleteByTypeImputationAndReferenceId(
        typeImputation: TypeImputation,
        referenceId: Long
    )
}
