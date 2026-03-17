package ma.investpro.entity

import jakarta.persistence.*

@Entity
@Table(name = "activites_planifiees")
class ActivitePlanifiee(

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    var convention: Convention,

    @Column(name = "type_activite", nullable = false, length = 20)
    var typeActivite: String,

    @Column(nullable = false, length = 200)
    var titre: String,

    @Column(name = "date_prevue", nullable = false)
    var datePrevue: java.time.LocalDate,

    @Column(length = 500)
    var note: String? = null,

    @Column(nullable = false)
    var fait: Boolean = false,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    var createdBy: User? = null,

) : BaseEntity()
