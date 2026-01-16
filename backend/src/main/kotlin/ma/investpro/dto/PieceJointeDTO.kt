package ma.investpro.dto

import ma.investpro.entity.PieceJointe
import java.time.LocalDateTime

data class PieceJointeDTO(
    val id: Long?,
    val nom: String,
    val nomOriginal: String,
    val typeMime: String,
    val taille: Long,
    val tailleFormatee: String,
    val extension: String,
    val description: String?,
    val typeEntite: PieceJointe.TypeEntite,
    val entiteId: Long,
    val dateUpload: LocalDateTime,
    val uploadedByName: String?,
    val downloadUrl: String
)

data class PieceJointeCreateRequest(
    val description: String?,
    val typeEntite: PieceJointe.TypeEntite,
    val entiteId: Long
)

data class PieceJointeUpdateRequest(
    val description: String?
)
