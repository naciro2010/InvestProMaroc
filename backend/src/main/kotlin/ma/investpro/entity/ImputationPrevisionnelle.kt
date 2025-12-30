package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.time.LocalDate

/**
 * Entité ImputationPrevisionnelle - Répartition budgétaire prévisionnelle
 * Lie une convention à des axes analytiques/projets avec planification temporelle
 */
@Entity
@Table(
    name = "imputations_previsionnelles",
    indexes = [
        Index(name = "idx_imputations_convention", columnList = "convention_id"),
        Index(name = "idx_imputations_axe", columnList = "axe_analytique_id"),
        Index(name = "idx_imputations_projet", columnList = "projet_id")
    ]
)
class ImputationPrevisionnelle(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    @field:NotNull
    var convention: Convention? = null,

    @Column(length = 200)
    var volet: String? = null, // Segment/Composante du projet

    @Column(name = "date_demarrage", nullable = false)
    @field:NotNull
    var dateDemarrage: LocalDate = LocalDate.now(),

    @Column(name = "delai_mois", nullable = false)
    @field:Positive
    var delaiMois: Int = 12, // Durée en mois

    @Column(name = "date_fin_prevue")
    var dateFinPrevue: LocalDate? = null, // Calculé automatiquement: dateDemarrage + delaiMois

    @Column(columnDefinition = "TEXT")
    var remarques: String? = null

) : BaseEntity()
