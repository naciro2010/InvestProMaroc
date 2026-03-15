package ma.investpro.dto

import java.time.LocalDateTime

data class ConventionCommentDTO(
    val id: Long,
    val conventionId: Long,
    val authorId: Long,
    val authorName: String,
    val authorInitials: String,
    val content: String,
    val commentType: String,
    val parentCommentId: Long?,
    val replies: List<ConventionCommentDTO>,
    val mentions: List<Long>,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class CreateConventionCommentRequest(
    val content: String,
    val commentType: String = "COMMENT",
    val parentCommentId: Long? = null,
    val mentions: List<Long> = emptyList()
)

data class UpdateConventionCommentRequest(
    val content: String
)
