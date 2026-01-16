package ma.investpro.entity

import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * Entité pour gérer les pièces jointes (documents) liées aux conventions, sous-conventions et avenants.
 * Supporte le stockage de fichiers avec métadonnées.
 */
@Entity
@Table(name = "pieces_jointes")
data class PieceJointe(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, length = 500)
    var nom: String = "",

    @Column(name = "nom_original", nullable = false, length = 500)
    var nomOriginal: String = "",

    @Column(name = "type_mime", nullable = false, length = 200)
    var typeMime: String = "",

    @Column(nullable = false)
    var taille: Long = 0, // Taille en bytes

    @Column(name = "chemin_fichier", nullable = false, length = 1000)
    var cheminFichier: String = "",

    @Column(length = 500)
    var description: String? = null,

    /**
     * Type d'entité parent: CONVENTION, SOUS_CONVENTION, AVENANT
     */
    @Column(name = "type_entite", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    var typeEntite: TypeEntite = TypeEntite.CONVENTION,

    /**
     * ID de l'entité parente (convention_id, avenant_id, etc.)
     */
    @Column(name = "entite_id", nullable = false)
    var entiteId: Long = 0,

    @Column(name = "date_upload", nullable = false)
    var dateUpload: LocalDateTime = LocalDateTime.now(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id")
    var uploadedBy: User? = null,

    @Column(nullable = false)
    var actif: Boolean = true
) {
    enum class TypeEntite {
        CONVENTION,
        SOUS_CONVENTION,
        AVENANT,
        MARCHE,
        DECOMPTE
    }

    /**
     * Retourne la taille formatée en KB, MB, etc.
     */
    fun getTailleFormatee(): String {
        return when {
            taille < 1024 -> "$taille B"
            taille < 1024 * 1024 -> "${taille / 1024} KB"
            taille < 1024 * 1024 * 1024 -> "${taille / (1024 * 1024)} MB"
            else -> "${taille / (1024 * 1024 * 1024)} GB"
        }
    }

    /**
     * Retourne l'extension du fichier
     */
    fun getExtension(): String {
        return nomOriginal.substringAfterLast(".", "")
    }
}
