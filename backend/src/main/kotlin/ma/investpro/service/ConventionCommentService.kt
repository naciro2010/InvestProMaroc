package ma.investpro.service

import ma.investpro.dto.ConventionCommentDTO
import ma.investpro.dto.CreateConventionCommentRequest
import ma.investpro.dto.UpdateConventionCommentRequest
import ma.investpro.entity.CommentType
import ma.investpro.entity.ConventionComment
import ma.investpro.entity.User
import ma.investpro.events.ActivityNotificationEvent
import ma.investpro.repository.ConventionCommentRepository
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.UserRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class ConventionCommentService(
    private val commentRepository: ConventionCommentRepository,
    private val conventionRepository: ConventionRepository,
    private val userRepository: UserRepository,
    private val eventPublisher: ApplicationEventPublisher
) {

    @Transactional(readOnly = true)
    fun getComments(conventionId: Long): List<ConventionCommentDTO> {
        val comments = commentRepository
            .findByConventionIdAndParentCommentIsNullAndActifTrueOrderByCreatedAtDesc(conventionId)
        return comments.map { toDTO(it) }
    }

    @Transactional(readOnly = true)
    fun countComments(conventionId: Long): Long =
        commentRepository.countByConventionIdAndActifTrue(conventionId)

    fun addComment(conventionId: Long, request: CreateConventionCommentRequest): ConventionCommentDTO {
        val convention = conventionRepository.findByIdOrNull(conventionId)
            ?: throw IllegalArgumentException("Convention introuvable")
        val author = getCurrentUser()

        val parentComment = request.parentCommentId?.let {
            commentRepository.findByIdOrNull(it)
                ?: throw IllegalArgumentException("Commentaire parent introuvable")
        }

        val comment = ConventionComment(
            convention = convention,
            author = author,
            content = request.content,
            commentType = try { CommentType.valueOf(request.commentType) } catch (_: Exception) { CommentType.COMMENT },
            parentComment = parentComment,
            mentions = if (request.mentions.isNotEmpty()) request.mentions.joinToString(",") else null
        )
        val saved = commentRepository.save(comment)

        // Notification aux followers
        eventPublisher.publishEvent(
            ActivityNotificationEvent(
                actorUserId = author.id!!,
                title = "Nouveau commentaire",
                message = "${author.fullName} a commenté la convention ${convention.code}",
                type = "info",
                contextType = "convention",
                contextId = conventionId.toString()
            )
        )

        return toDTO(saved)
    }

    fun updateComment(commentId: Long, request: UpdateConventionCommentRequest): ConventionCommentDTO {
        val comment = commentRepository.findByIdOrNull(commentId)
            ?: throw IllegalArgumentException("Commentaire introuvable")
        val currentUser = getCurrentUser()
        require(comment.author.id == currentUser.id) { "Vous ne pouvez modifier que vos propres commentaires" }

        comment.content = request.content
        return toDTO(commentRepository.save(comment))
    }

    fun deleteComment(commentId: Long) {
        val comment = commentRepository.findByIdOrNull(commentId)
            ?: throw IllegalArgumentException("Commentaire introuvable")
        val currentUser = getCurrentUser()
        val isAdmin = currentUser.authorities.any { it.authority == "ROLE_ADMIN" }
        require(comment.author.id == currentUser.id || isAdmin) {
            "Vous ne pouvez supprimer que vos propres commentaires"
        }
        comment.actif = false
        commentRepository.save(comment)
    }

    /** Post un commentaire système (workflow) */
    fun addSystemComment(conventionId: Long, message: String) {
        val convention = conventionRepository.findByIdOrNull(conventionId) ?: return
        val systemUser = userRepository.findAll().firstOrNull() ?: return

        val comment = ConventionComment(
            convention = convention,
            author = systemUser,
            content = message,
            commentType = CommentType.SYSTEM
        )
        commentRepository.save(comment)
    }

    private fun getCurrentUser(): User {
        val username = SecurityContextHolder.getContext().authentication?.name
            ?: throw IllegalArgumentException("Non authentifié")
        return userRepository.findByUsername(username)
            .orElseThrow { IllegalArgumentException("Utilisateur introuvable") }
    }

    private fun toDTO(comment: ConventionComment): ConventionCommentDTO {
        val replies = comment.replies
            .filter { it.actif }
            .map { toDTO(it) }

        val mentionIds = comment.mentions?.split(",")
            ?.mapNotNull { it.trim().toLongOrNull() } ?: emptyList()

        return ConventionCommentDTO(
            id = comment.id!!,
            conventionId = comment.convention.id!!,
            authorId = comment.author.id!!,
            authorName = comment.author.fullName,
            authorInitials = comment.author.fullName
                .split(" ").take(2).joinToString("") { it.take(1).uppercase() },
            content = comment.content,
            commentType = comment.commentType.name,
            parentCommentId = comment.parentComment?.id,
            replies = replies,
            mentions = mentionIds,
            createdAt = comment.createdAt,
            updatedAt = comment.updatedAt
        )
    }
}
