package ma.investpro.dto

import java.math.BigDecimal

// Dimension Analytique DTOs
data class DimensionStatistiques(
    val totalDimensions: Int,
    val dimensionsActives: Int,
    val dimensionsObligatoires: Int,
    val totalValeurs: Int,
    val valeursActives: Int
)

data class ValidationImputationResult(
    val isValid: Boolean,
    val montantAttendu: BigDecimal,
    val totalImpute: BigDecimal,
    val difference: BigDecimal
)

data class ImputationAggregation(
    val dimension: String,
    val data: Map<String, BigDecimal>
)

data class ImputationAggregationByTwoDimensions(
    val dimension1: String,
    val dimension2: String,
    val data: List<AggregationRow>
)

data class AggregationRow(
    val dimension1Value: String,
    val dimension2Value: String,
    val montant: BigDecimal
)

data class ImputationStatistiques(
    val totalImputations: Long,
    val totalMontantImpute: BigDecimal,
    val nombreTypes: Int
)
