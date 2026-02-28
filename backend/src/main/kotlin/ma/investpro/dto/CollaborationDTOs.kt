package ma.investpro.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class NotificationDTO(
    val id: Long,
    val title: String,
    val message: String,
    val type: String,
    val contextType: String?,
    val contextId: String?,
    val read: Boolean,
    val createdAt: LocalDateTime?
)

data class CreateMessageRequest(
    val recipientId: Long,
    @field:NotBlank(message = "Le contenu du message est requis")
    @field:Size(max = 2000, message = "Le message ne peut pas dépasser 2000 caractères")
    val content: String
)

data class TeamMessageDTO(
    val id: Long,
    val senderId: Long,
    val senderName: String,
    val recipientId: Long,
    val recipientName: String,
    val content: String,
    val read: Boolean,
    val createdAt: LocalDateTime?
)

data class ConversationItemDTO(
    val userId: Long,
    val userName: String,
    val lastMessage: String,
    val lastMessageAt: LocalDateTime?,
    val unreadCount: Long
)
