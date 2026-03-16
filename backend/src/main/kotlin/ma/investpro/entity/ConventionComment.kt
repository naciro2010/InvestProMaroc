package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank

/**
 * Commentaires/Chatter sur une convention (style Odoo/Jira)
 * Permet aux utilisateurs de discuter et laisser des notes sur une convention.
 */
@Entity
@Table(
    name = "convention_comments",
    indexes = [
        Index(name = "idx_conv_comments_convention", columnList = "convention_id"),
        Index(name = "idx_conv_comments_author", columnList = "author_id"),
        Index(name = "idx_conv_comments_parent", columnList = "parent_comment_id"),
        Index(name = "idx_conv_comments_created", columnList = "created_at")
    ]
)
class ConventionComment(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    var convention: Convention,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    var author: User,

    @Column(nullable = false, columnDefinition = "TEXT")
    @field:NotBlank
    var content: String = "",

    /** Commentaire parent pour les réponses en fil (threading) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    var parentComment: ConventionComment? = null,

    /** Réponses à ce commentaire */
    @OneToMany(mappedBy = "parentComment", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    var replies: MutableList<ConventionComment> = mutableListOf(),

    /** Type de commentaire: COMMENT, NOTE_INTERNE, SYSTEM */
    @Column(name = "comment_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    var commentType: CommentType = CommentType.COMMENT,

    /** Mentions d'utilisateurs (stockées en JSON: [userId1, userId2]) */
    @Column(name = "mentions", columnDefinition = "TEXT")
    var mentions: String? = null
) : BaseEntity()

enum class CommentType {
    COMMENT,        // Commentaire public
    NOTE_INTERNE,   // Note interne (visible uniquement par l'auteur et les admins)
    SYSTEM          // Message système (workflow, notifications automatiques)
}
