package ma.investpro.service

import ma.investpro.dto.NotificationDTO
import ma.investpro.entity.Notification
import ma.investpro.events.ActivityNotificationEvent
import ma.investpro.events.DirectMessageNotificationEvent
import ma.investpro.repository.NotificationRepository
import ma.investpro.repository.UserRepository
import mu.KotlinLogging
import org.springframework.context.event.EventListener
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

private val logger = KotlinLogging.logger {}

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository,
    private val userRepository: UserRepository
) {

    @Transactional(readOnly = true)
    fun getMyNotifications(unreadOnly: Boolean): List<NotificationDTO> {
        val currentUserId = getCurrentUserId()
        val notifications = if (unreadOnly) {
            notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(currentUserId)
        } else {
            notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUserId)
        }
        return notifications.map { it.toDto() }
    }

    @Transactional
    fun markAsRead(notificationId: Long) {
        val currentUserId = getCurrentUserId()
        val notification = notificationRepository.findById(notificationId)
            .orElseThrow { IllegalArgumentException("Notification introuvable") }

        if (notification.recipient.id != currentUserId) {
            throw IllegalArgumentException("Vous ne pouvez pas modifier cette notification")
        }

        notification.isRead = true
        notificationRepository.save(notification)
    }

    @Transactional
    fun markAllAsRead() {
        val currentUserId = getCurrentUserId()
        val unread = notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(currentUserId)
        unread.forEach { it.isRead = true }
        notificationRepository.saveAll(unread)
    }

    @EventListener
    @Transactional
    fun onActivity(event: ActivityNotificationEvent) {
        val recipients = userRepository.findAll().filter { it.id != event.actorUserId }
        if (recipients.isEmpty()) return

        val notifications = recipients.map { recipient ->
            Notification(
                recipient = recipient,
                title = event.title,
                message = event.message,
                type = event.type,
                contextType = event.contextType,
                contextId = event.contextId
            )
        }
        notificationRepository.saveAll(notifications)
    }

    @EventListener
    @Transactional
    fun onDirectMessage(event: DirectMessageNotificationEvent) {
        val recipient = userRepository.findById(event.recipientId).orElse(null) ?: return
        notificationRepository.save(
            Notification(
                recipient = recipient,
                title = "Nouveau message de ${event.senderName}",
                message = event.preview,
                type = "info",
                contextType = "message",
                contextId = recipient.id.toString()
            )
        )
    }

    private fun Notification.toDto() = NotificationDTO(
        id = id ?: 0,
        title = title,
        message = message,
        type = type,
        contextType = contextType,
        contextId = contextId,
        read = isRead,
        createdAt = createdAt
    )

    @Transactional(readOnly = true)
    fun getUnreadCount(): Long = notificationRepository.countByRecipientIdAndIsReadFalse(getCurrentUserId())

    private fun getCurrentUserId(): Long {
        val username = SecurityContextHolder.getContext().authentication?.name
            ?: throw IllegalArgumentException("Utilisateur non authentifié")

        return userRepository.findByUsername(username)
            .orElseThrow { IllegalArgumentException("Utilisateur introuvable") }
            .id ?: run {
            logger.error { "Utilisateur sans ID pour username=$username" }
            throw IllegalArgumentException("Utilisateur invalide")
        }
    }
}
