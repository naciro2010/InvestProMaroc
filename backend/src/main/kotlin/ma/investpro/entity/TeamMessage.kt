package ma.investpro.entity

import jakarta.persistence.*

@Entity
@Table(name = "team_messages")
class TeamMessage(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    var sender: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    var recipient: User,

    @Column(nullable = false, length = 2000)
    var content: String,

    @Column(name = "is_read", nullable = false)
    var isRead: Boolean = false,
) : BaseEntity()
