package ma.investpro.dto

data class ConventionTagDTO(
    val id: Long,
    val name: String,
    val color: String,
    val description: String?,
    val conventionCount: Int
)

data class CreateConventionTagRequest(
    val name: String,
    val color: String = "#6e5dc6",
    val description: String? = null
)

data class UpdateConventionTagRequest(
    val name: String? = null,
    val color: String? = null,
    val description: String? = null
)
