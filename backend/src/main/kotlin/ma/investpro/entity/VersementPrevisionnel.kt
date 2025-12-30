package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité VersementPrevisionnel - Planification des paiements prévisionnels
 * Définit les versements planifiés pour une convention
 */
@Entity
@Table(
    name = "versements_previsionnels",
    indexes = [
        Index(name = "idx_versements_convention", columnList = "convention_id"),
        Index(name = "idx_versements_axe", columnList = "axe_analytique_id"),
        Index(name = "idx_versements_projet", columnList = "projet_id"),
        Index(name = "idx_versements_partenaire", columnList = "partenaire_id"),
        Index(name = "idx_versements_date", columnList = "date_versement")
    ]
)
class VersementPrevisionnel(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    @field:NotNull
    var convention: Convention? = null,

    @Column(length = 200)
    var volet: String? = null, // Segment/Composante

    @Column(name = "date_versement", nullable = false)
    @field:NotNull
    var dateVersement: LocalDate = LocalDate.now(),

    @Column(nullable = false, precision = 15, scale = 2)
    @field:Positive
    var montant: BigDecimal = BigDecimal.ZERO, // En DH

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partenaire_id", nullable = false)
    @field:NotNull
    var partenaire: Partenaire? = null, // Bénéficiaire

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mod_id")
    var maitreOeuvreDelegue: Partenaire? = null, // MOD responsable (optionnel)

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity()
