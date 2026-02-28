package ma.investpro.service

import ma.investpro.dto.ConversationItemDTO
import ma.investpro.dto.CreateMessageRequest
import ma.investpro.dto.TeamMessageDTO
import ma.investpro.entity.TeamMessage
import ma.investpro.events.DirectMessageNotificationEvent
import ma.investpro.repository.TeamMessageRepository
import ma.investpro.repository.UserRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class TeamMessageService(
    private val teamMessageRepository: TeamMessageRepository,
    private val userRepository: UserRepository,
    private val eventPublisher: ApplicationEventPublisher
) {

    @Transactional
    fun sendMessage(request: CreateMessageRequest): TeamMessageDTO {
        val sender = currentUser()
        val recipient = userRepository.findById(request.recipientId)
            .orElseThrow { IllegalArgumentException("Destinataire introuvable") }

        val message = teamMessageRepository.save(
            TeamMessage(
                sender = sender,
                recipient = recipient,
                content = request.content.trim()
            )
        )

        eventPublisher.publishEvent(
            DirectMessageNotificationEvent(
                recipientId = recipient.id ?: return message.toDto(),
                senderName = sender.fullName,
                preview = request.content.take(140)
            )
        )

        return message.toDto()
    }

    @Transactional(readOnly = true)
    fun getConversation(withUserId: Long): List<TeamMessageDTO> {
        val me = currentUser()
        val myId = me.id ?: throw IllegalArgumentException("Utilisateur invalide")
        val messages = teamMessageRepository
            .findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByCreatedAtDesc(
                myId,
                withUserId,
                withUserId,
                myId
            )
        return messages.reversed().map { it.toDto() }
    }

    @Transactional
    fun markAsRead(messageId: Long) {
        val me = currentUser()
        val myId = me.id ?: throw IllegalArgumentException("Utilisateur invalide")
        val message = teamMessageRepository.findById(messageId)
            .orElseThrow { IllegalArgumentException("Message introuvable") }

        if (message.recipient.id != myId) {
            throw IllegalArgumentException("Vous ne pouvez pas modifier ce message")
        }
        message.isRead = true
        teamMessageRepository.save(message)
    }

    @Transactional(readOnly = true)
    fun getConversations(): List<ConversationItemDTO> {
        val me = currentUser()
        val myId = me.id ?: throw IllegalArgumentException("Utilisateur invalide")

        val all = teamMessageRepository.findAllForUser(myId)

        val grouped = all.groupBy { msg ->
            if (msg.sender.id == myId) msg.recipient else msg.sender
        }

        return grouped.map { (otherUser, messages) ->
            val last = messages.maxByOrNull { it.createdAt ?: java.time.LocalDateTime.MIN }
            val unread = teamMessageRepository.countBySenderIdAndRecipientIdAndIsReadFalse(
                otherUser.id ?: 0,
                myId
            )

            ConversationItemDTO(
                userId = otherUser.id ?: 0,
                userName = otherUser.fullName,
                lastMessage = last?.content ?: "",
                lastMessageAt = last?.createdAt,
                unreadCount = unread
            )
        }.sortedByDescending { it.lastMessageAt }
    }

    private fun currentUser() = userRepository.findByUsername(
        SecurityContextHolder.getContext().authentication?.name
            ?: throw IllegalArgumentException("Utilisateur non authentifié")
    ).orElseThrow { IllegalArgumentException("Utilisateur introuvable") }

    private fun TeamMessage.toDto() = TeamMessageDTO(
        id = id ?: 0,
        senderId = sender.id ?: 0,
        senderName = sender.fullName,
        recipientId = recipient.id ?: 0,
        recipientName = recipient.fullName,
        content = content,
        read = isRead,
        createdAt = createdAt
    )
}
