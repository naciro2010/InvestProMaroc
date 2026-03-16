package ma.investpro.entity

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDateTime

/**
 * Entite generique pour l'historique des modifications de toutes les entites.
 * Utilisee pour afficher un chatter Odoo-style en bas de chaque page detail.
 */
@Entity
@Table(
    name = "entity_modifications",
    indexes = [
        Index(name = "idx_entity_modifications_entity", columnList = "entity_type,entity_id,date_modification"),
        Index(name = "idx_entity_modifications_user", columnList = "modifie_par_id"),
        Index(name = "idx_entity_modifications_date", columnList = "date_modification"),
        Index(name = "idx_entity_modifications_type", columnList = "entity_type,type_modification")
    ]
)
class EntityModification(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "entity_type", nullable = false, length = 50)
    val entityType: String,

    @Column(name = "entity_id", nullable = false)
    val entityId: Long,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modifie_par_id", nullable = false)
    val modifiePar: User,

    @Column(name = "date_modification", nullable = false)
    val dateModification: LocalDateTime = LocalDateTime.now(),

    @Column(name = "type_modification", nullable = false, length = 50)
    val typeModification: String = "UPDATE",

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    val description: String,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "donnees_avant", columnDefinition = "jsonb")
    val donneesAvant: Map<String, String>? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "donnees_apres", columnDefinition = "jsonb")
    val donneesApres: Map<String, String>? = null,

    @Column(name = "champs_modifies", nullable = false, columnDefinition = "text[]")
    val champsModifies: List<String> = emptyList(),

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

object EntityType {
    const val MARCHE = "MARCHE"
    const val PROJET = "PROJET"
    const val DECOMPTE = "DECOMPTE"
    const val BUDGET = "BUDGET"
    const val AVENANT_CONVENTION = "AVENANT_CONVENTION"
    const val FOURNISSEUR = "FOURNISSEUR"
    const val ORDRE_PAIEMENT = "ORDRE_PAIEMENT"
    const val PAIEMENT = "PAIEMENT"
}

object TypeModification {
    const val CREATION = "CREATION"
    const val UPDATE = "UPDATE"
    const val STATUS_CHANGE = "STATUS_CHANGE"
    const val WORKFLOW = "WORKFLOW"
    const val DELETE = "DELETE"
}
