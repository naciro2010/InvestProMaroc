package ma.investpro.dto

import ma.investpro.entity.ModePaiement
import ma.investpro.entity.StatutOP
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * DTO pour OrdrePaiement - Sans références circulaires
 */
data class OrdrePaiementDTO(
    val id: Long?,

    // Décompte parent : ID seulement
    val decompteId: Long,
    val decompteNumero: String?,

    // Identification
    val numeroOP: String,
    val dateOP: LocalDate,
    val statut: StatutOP,

    // Montant
    val montantAPayer: BigDecimal,
    val estPaiementPartiel: Boolean,

    // Dates
    val datePrevuePaiement: LocalDate?,

    // Mode et banque
    val modePaiement: ModePaiement?,
    val compteBancaireId: Long?,
    val compteBancaireLibelle: String?,

    val observations: String?,

    // Validation
    val dateValidation: LocalDate?,
    val valideParId: Long?,

    // Relations enfants
    val imputations: List<OPImputationDTO> = emptyList(),

    // Timestamps
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val createdBy: String?,
    val updatedBy: String?,
    val actif: Boolean
)

/**
 * DTO pour OPImputation - Sans référence back à OrdrePaiement
 */
data class OPImputationDTO(
    val id: Long?,
    val ordrePaiementId: Long,
    val montant: BigDecimal,
    val dimensionsValeurs: Map<String, String>,
    val remarques: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)

/**
 * DTO pour Paiement - Sans références circulaires
 */
data class PaiementDTO(
    val id: Long?,

    // OrdrePaiement parent : ID seulement
    val ordrePaiementId: Long,
    val ordrePaiementNumero: String?,

    // Identification
    val referencePaiement: String,
    val dateValeur: LocalDate,
    val dateExecution: LocalDate?,

    // Montant
    val montantPaye: BigDecimal,
    val estPaiementPartiel: Boolean,

    // Mode
    val modePaiement: ModePaiement,
    val compteBancaireId: Long?,
    val compteBancaireLibelle: String?,

    val observations: String?,

    // Relations enfants
    val imputations: List<PaiementImputationDTO> = emptyList(),

    // Timestamps
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val createdBy: String?,
    val updatedBy: String?,
    val actif: Boolean
)

/**
 * DTO pour PaiementImputation - Sans référence back à Paiement
 */
data class PaiementImputationDTO(
    val id: Long?,
    val paiementId: Long,
    val montantReel: BigDecimal,
    val dimensionsValeurs: Map<String, String>,
    val montantBudgete: BigDecimal?,
    val ecart: BigDecimal?,
    val remarques: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)
