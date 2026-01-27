package ma.investpro.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.OneToMany
import jakarta.persistence.Table

@Entity
@Table(name = "convention_configurations")
class ConventionConfiguration(
    @Column(name = "code_mask_pattern", nullable = false)
    var codeMaskPattern: String = "^[A-Za-z0-9-]+$",

    @Column(name = "code_mask_placeholder", nullable = false)
    var codeMaskPlaceholder: String = "CON-09-01",

    @Column(name = "numero_mask_pattern", nullable = false)
    var numeroMaskPattern: String = "^[A-Za-z0-9/-]+$",

    @Column(name = "numero_mask_placeholder", nullable = false)
    var numeroMaskPlaceholder: String = "N°2026/001",

    @OneToMany(
        mappedBy = "configuration",
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
        fetch = FetchType.EAGER
    )
    var typeConfigurations: MutableList<ConventionTypeConfiguration> = mutableListOf()
) : BaseEntity()
