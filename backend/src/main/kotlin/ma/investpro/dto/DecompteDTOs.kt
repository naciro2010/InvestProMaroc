package ma.investpro.dto

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

// Décompte DTOs
data class DecompteDTO(
    val id: Long?,
    val marcheId: Long,
    val marcheNumero: String?,
    val marcheFournisseur: String?,
    val numeroDecompte: String,
    val dateDecompte: LocalDate,
    val periodeDebut: LocalDate,
    val periodeFin: LocalDate,
    val statut: String,
    val montantBrutHT: BigDecimal,
    val montantTVA: BigDecimal,
    val montantTTC: BigDecimal,
    val totalRetenues: BigDecimal,
    val netAPayer: BigDecimal,
    val cumulPrecedent: BigDecimal?,
    val cumulActuel: BigDecimal?,
    val observations: String?,
    val dateValidation: LocalDate?,
    val valideParId: Long?,
    val montantPaye: BigDecimal,
    val estSolde: Boolean,
    val retenues: List<DecompteRetenueDTO>,
    val imputations: List<DecompteImputationDTO>,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class DecompteSimpleDTO(
    val id: Long?,
    val numeroDecompte: String,
    val dateDecompte: LocalDate,
    val statut: String,
    val netAPayer: BigDecimal,
    val montantPaye: BigDecimal,
    val estSolde: Boolean,
    val actif: Boolean
)

data class DecompteListDTO(
    val id: Long?,
    val marcheId: Long,
    val marcheNumero: String?,
    val marcheFournisseur: String?,
    val numeroDecompte: String,
    val dateDecompte: LocalDate,
    val periodeDebut: LocalDate,
    val periodeFin: LocalDate,
    val statut: String,
    val montantBrutHT: BigDecimal,
    val montantTVA: BigDecimal,
    val montantTTC: BigDecimal,
    val totalRetenues: BigDecimal,
    val netAPayer: BigDecimal,
    val cumulPrecedent: BigDecimal?,
    val cumulActuel: BigDecimal?,
    val montantPaye: BigDecimal,
    val estSolde: Boolean,
    val nbRetenues: Int = 0,
    val nbImputations: Int = 0,
    val actif: Boolean,
    val createdAt: LocalDateTime?
)

data class DecompteRetenueDTO(
    val id: Long?,
    val decompteId: Long,
    val typeRetenue: String,
    val montant: BigDecimal,
    val tauxPourcent: BigDecimal?,
    val libelle: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class DecompteImputationDTO(
    val id: Long?,
    val decompteId: Long,
    val montant: BigDecimal,
    val dimensionsValeurs: Map<String, String>,
    val remarques: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class DecompteStatistiques(
    val total: Int,
    val brouillon: Int,
    val soumis: Int,
    val valides: Int,
    val montantTotal: BigDecimal
)
