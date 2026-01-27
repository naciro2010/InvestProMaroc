package ma.investpro.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

@Entity
@Table(
    name = "convention_type_configurations",
    uniqueConstraints = [UniqueConstraint(columnNames = ["configuration_id", "type_code"])]
)
class ConventionTypeConfiguration(
    @Column(name = "type_code", nullable = false)
    var typeCode: String,

    @Column(name = "libelle", nullable = false)
    var libelle: String,

    @Column(name = "enabled", nullable = false)
    var enabled: Boolean = true,

    @Column(name = "ordre_affichage", nullable = false)
    var ordreAffichage: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "configuration_id", nullable = false)
    var configuration: ConventionConfiguration? = null
) : BaseEntity()
