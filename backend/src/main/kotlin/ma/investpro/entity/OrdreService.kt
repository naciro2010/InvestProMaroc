package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.time.LocalDate

/**
 * Entite OrdreService - Gestion des ordres de service pour les marches
 *
 * Types d'ordres:
 * - COMMENCEMENT: Ordre de commencement des travaux
 * - ARRET: Ordre d'arret des travaux (intemperies, problemes, etc.)
 * - REPRISE: Ordre de reprise des travaux apres arret
 * - RECEPTION_PROVISOIRE: Reception provisoire
 * - RECEPTION_DEFINITIVE: Reception definitive
 */
@Entity
@Table(
    name = "ordres_service",
    indexes = [
        Index(name = "idx_ordres_service_marche", columnList = "marche_id"),
        Index(name = "idx_ordres_service_type", columnList = "type_ordre"),
        Index(name = "idx_ordres_service_date", columnList = "date_ordre")
    ]
)
class OrdreService(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marche_id", nullable = false)
    var marche: Marche? = null,

    @Column(name = "numero_ordre", nullable = false, length = 100)
    @field:NotBlank
    var numeroOrdre: String = "",

    @Column(name = "type_ordre", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    var typeOrdre: TypeOrdreService = TypeOrdreService.COMMENCEMENT,

    @Column(name = "date_ordre", nullable = false)
    @field:NotNull
    var dateOrdre: LocalDate = LocalDate.now(),

    @Column(name = "date_effet")
    var dateEffet: LocalDate? = null,

    @Column(name = "reference", length = 200)
    var reference: String? = null,

    @Column(name = "motif", columnDefinition = "TEXT")
    var motif: String? = null,

    @Column(name = "observations", columnDefinition = "TEXT")
    var observations: String? = null,

    @Column(name = "duree_arret_jours")
    var dureeArretJours: Int? = null,
) : BaseEntity()

enum class TypeOrdreService {
    COMMENCEMENT,
    ARRET,
    REPRISE,
    RECEPTION_PROVISOIRE,
    RECEPTION_DEFINITIVE
}
