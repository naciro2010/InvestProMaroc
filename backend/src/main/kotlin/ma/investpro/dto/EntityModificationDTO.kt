package ma.investpro.dto

import java.time.LocalDateTime

data class EntityModificationDTO(
    val id: Long,
    val entityType: String,
    val entityId: Long,
    val modifieParId: Long,
    val modifieParNom: String,
    val dateModification: LocalDateTime,
    val typeModification: String,
    val description: String,
    val donneesAvant: Map<String, String>?,
    val donneesApres: Map<String, String>?,
    val champsModifies: List<String>,
    val createdAt: LocalDateTime
)
