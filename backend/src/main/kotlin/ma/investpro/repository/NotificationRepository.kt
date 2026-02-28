package ma.investpro.repository

import ma.investpro.entity.Notification
import org.springframework.data.jpa.repository.JpaRepository

interface NotificationRepository : JpaRepository<Notification, Long> {
    fun findByRecipientIdOrderByCreatedAtDesc(recipientId: Long): List<Notification>
    fun findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(recipientId: Long): List<Notification>
    fun countByRecipientIdAndIsReadFalse(recipientId: Long): Long
}
