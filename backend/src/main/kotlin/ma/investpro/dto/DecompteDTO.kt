package ma.investpro.dto

import ma.investpro.entity.StatutDecompte
import ma.investpro.entity.TypeRetenue
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * DTO pour Décompte - Sans références circulaires
 */
data class DecompteDTO(
    val id: Long?,

    // Marché parent : ID seulement
    val marcheId: Long,
    val marcheNumero: String?,
    val marcheFournisseur: String?,

    // Identification
    val numeroDecompte: String,
    val dateDecompte: LocalDate,
    val periodeDebut: LocalDate,
    val periodeFin: LocalDate,
    val statut: StatutDecompte,

    // Montants
    val montantBrutHT: BigDecimal,
    val montantTVA: BigDecimal,
    val montantTTC: BigDecimal,
    val totalRetenues: BigDecimal,
    val netAPayer: BigDecimal,

    // Cumuls
    val cumulPrecedent: BigDecimal?,
    val cumulActuel: BigDecimal?,
    val observations: String?,

    // Validation
    val dateValidation: LocalDate?,
    val valideParId: Long?,

    // Paiement
    val montantPaye: BigDecimal,
    val estSolde: Boolean,

    // Relations enfants : objets complets SANS référence back
    val retenues: List<DecompteRetenueDTO> = emptyList(),
    val imputations: List<DecompteImputationDTO> = emptyList(),

    // Timestamps
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val createdBy: String?,
    val updatedBy: String?,
    val actif: Boolean
)

/**
 * DTO simplifié pour Décompte
 */
data class DecompteSimpleDTO(
    val id: Long?,
    val numeroDecompte: String,
    val dateDecompte: LocalDate,
    val statut: StatutDecompte,
    val netAPayer: BigDecimal,
    val montantPaye: BigDecimal,
    val estSolde: Boolean,
    val actif: Boolean
)

/**
 * DTO pour DecompteRetenue - Sans référence back à Décompte
 */
data class DecompteRetenueDTO(
    val id: Long?,
    val decompteId: Long,
    val typeRetenue: TypeRetenue,
    val montant: BigDecimal,
    val tauxPourcent: BigDecimal?,
    val libelle: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)

/**
 * DTO pour DecompteImputation - Sans référence back à Décompte
 */
data class DecompteImputationDTO(
    val id: Long?,
    val decompteId: Long,
    val montant: BigDecimal,
    val dimensionsValeurs: Map<String, String>,
    val remarques: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)
