package ma.investpro.entity

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Entité Subvention - Financement externe (bailleur)
 */
@Entity
@Table(
    name = "subventions",
    indexes = [
        Index(name = "idx_subventions_convention", columnList = "convention_id"),
        Index(name = "idx_subventions_organisme", columnList = "organisme_bailleur")
    ]
)
class Subvention(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "convention_id", nullable = false)
    var convention: Convention,

    @Column(name = "organisme_bailleur", nullable = false, length = 200)
    @field:NotBlank
    var organismeBailleur: String = "", // Nom du bailleur/organisme

    @Column(name = "type_subvention", length = 50)
    var typeSubvention: String? = null, // Don, Prêt, Garantie, etc.

    @Column(name = "montant_total", nullable = false, precision = 15, scale = 2)
    var montantTotal: BigDecimal = BigDecimal.ZERO,

    @Column(name = "devise", length = 3)
    var devise: String = "MAD",

    @Column(name = "taux_change", precision = 10, scale = 4)
    var tauxChange: BigDecimal? = null,

    @Column(name = "date_signature")
    var dateSignature: LocalDate? = null,

    @Column(name = "date_debut_validite")
    var dateDebutValidite: LocalDate? = null,

    @Column(name = "date_fin_validite")
    var dateFinValidite: LocalDate? = null,

    @Column(columnDefinition = "TEXT")
    var conditions: String? = null, // Conditions de déblocage

    @Column(columnDefinition = "TEXT")
    var observations: String? = null,

    // Relations
    @OneToMany(mappedBy = "subvention", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var echeancier: MutableList<EcheanceSubvention> = mutableListOf()

) : BaseEntity()

/**
 * Échéancier de subvention
 */
@Entity
@Table(name = "echeances_subvention")
class EcheanceSubvention(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subvention_id", nullable = false)
    var subvention: Subvention,

    @Column(name = "date_echeance", nullable = false)
    var dateEcheance: LocalDate,

    @Column(nullable = false, precision = 15, scale = 2)
    var montant: BigDecimal = BigDecimal.ZERO,

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    var statut: StatutEcheance = StatutEcheance.PREVU,

    @Column(name = "date_reception")
    var dateReception: LocalDate? = null,

    @Column(length = 200)
    var libelle: String? = null

) : BaseEntity()

enum class StatutEcheance {
    PREVU,      // Prévu
    RECU,       // Reçu
    RETARD,     // En retard
    ANNULE      // Annulé
}
