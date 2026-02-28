package ma.investpro.entity

import jakarta.persistence.*

@Entity
@Table(name = "notifications")
class Notification(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    var recipient: User,

    @Column(nullable = false, length = 180)
    var title: String,

    @Column(nullable = false, length = 1500)
    var message: String,

    @Column(nullable = false, length = 30)
    var type: String = "info",

    @Column(name = "context_type", length = 80)
    var contextType: String? = null,

    @Column(name = "context_id", length = 120)
    var contextId: String? = null,

    @Column(name = "is_read", nullable = false)
    var isRead: Boolean = false,
) : BaseEntity()
