package ma.investpro.repository

import ma.investpro.entity.TeamMessage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface TeamMessageRepository : JpaRepository<TeamMessage, Long> {
    fun findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByCreatedAtDesc(
        senderId: Long,
        recipientId: Long,
        senderIdInverse: Long,
        recipientIdInverse: Long
    ): List<TeamMessage>

    @Query(
        """
        SELECT tm FROM TeamMessage tm
        WHERE tm.sender.id = :userId OR tm.recipient.id = :userId
        ORDER BY tm.createdAt DESC
        """
    )
    fun findAllForUser(@Param("userId") userId: Long): List<TeamMessage>

    fun countBySenderIdAndRecipientIdAndIsReadFalse(senderId: Long, recipientId: Long): Long
}
