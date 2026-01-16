package ma.investpro.entity

import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * Entité MaitreOeuvre (MO/MOD)
 * Représente les Maîtres d'Œuvre et Maîtres d'Œuvre Délégués associés aux conventions
 */
@Entity
@Table(name = "maitres_oeuvre")
data class MaitreOeuvre(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    var convention: Convention,

    @Column(nullable = false, length = 50)
    var code: String,

    @Column(nullable = false, length = 255)
    var designation: String,

    @Column(name = "type_mo", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    var typeMo: TypeMaitreOeuvre,

    @Column(length = 100)
    var email: String? = null,

    @Column(length = 20)
    var telephone: String? = null,

    @Column(columnDefinition = "TEXT")
    var adresse: String? = null,

    @Column(length = 255)
    var organisme: String? = null,

    @Column(columnDefinition = "TEXT")
    var missions: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var actif: Boolean = true
)

/**
 * Type de Maître d'Œuvre
 */
enum class TypeMaitreOeuvre {
    MO,   // Maître d'Œuvre
    MOD   // Maître d'Œuvre Délégué
}
