package ma.investpro.entity

import jakarta.persistence.*

/**
 * Abonnés/Followers d'une convention (style Odoo followers).
 * Les followers reçoivent des notifications sur les changements de la convention.
 */
@Entity
@Table(
    name = "convention_followers",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uk_conv_follower",
            columnNames = ["convention_id", "user_id"]
        )
    ],
    indexes = [
        Index(name = "idx_conv_followers_convention", columnList = "convention_id"),
        Index(name = "idx_conv_followers_user", columnList = "user_id")
    ]
)
class ConventionFollower(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    var convention: Convention,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var user: User,

    /** Type d'abonnement: ALL, WORKFLOW_ONLY, COMMENTS_ONLY */
    @Column(name = "subscription_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var subscriptionType: SubscriptionType = SubscriptionType.ALL
) : BaseEntity()

enum class SubscriptionType {
    ALL,            // Toutes les notifications
    WORKFLOW_ONLY,  // Seulement les changements de statut
    COMMENTS_ONLY   // Seulement les nouveaux commentaires
}
