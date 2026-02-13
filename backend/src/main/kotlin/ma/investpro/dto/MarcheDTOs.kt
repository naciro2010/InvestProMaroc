package ma.investpro.dto

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

// Marché DTOs
data class MarcheDTO(
    val id: Long?,
    val numeroMarche: String,
    val numAo: String?,
    val dateMarche: LocalDate,
    val fournisseurId: Long,
    val fournisseurCode: String,
    val fournisseurNom: String,
    val fournisseurIce: String?,
    val conventionId: Long?,
    val conventionNumero: String?,
    val objet: String,
    val montantHt: BigDecimal,
    val tauxTva: BigDecimal,
    val montantTva: BigDecimal,
    val montantTtc: BigDecimal,
    val statut: String,
    val dateDebut: LocalDate?,
    val dateFinPrevue: LocalDate?,
    val delaiExecutionMois: Int?,
    val retenueGarantie: BigDecimal,
    val remarques: String?,
    val lignes: List<MarcheLigneDTO>,
    val avenants: List<AvenantMarcheDTO>,
    val decomptes: List<DecompteSimpleDTO>,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class MarcheSimpleDTO(
    val id: Long?,
    val numeroMarche: String,
    val dateMarche: LocalDate,
    val fournisseurNom: String,
    val montantTtc: BigDecimal,
    val statut: String,
    val actif: Boolean
)

data class MarcheListDTO(
    val id: Long?,
    val numeroMarche: String,
    val numAo: String?,
    val dateMarche: LocalDate,
    val fournisseurId: Long,
    val fournisseurCode: String,
    val fournisseurNom: String,
    val fournisseurIce: String?,
    val conventionId: Long?,
    val conventionNumero: String?,
    val conventionLibelle: String?,
    val objet: String,
    val montantHt: BigDecimal,
    val tauxTva: BigDecimal,
    val montantTva: BigDecimal,
    val montantTtc: BigDecimal,
    val statut: String,
    val dateDebut: LocalDate?,
    val dateFinPrevue: LocalDate?,
    val delaiExecutionMois: Int?,
    val adresse: String?,
    val latitude: Double?,
    val longitude: Double?,
    val zoneGeographique: String?,
    val nbLignes: Int = 0,
    val nbAvenants: Int = 0,
    val nbDecomptes: Int = 0,
    val actif: Boolean,
    val createdAt: LocalDateTime?
)

data class MarcheLigneDTO(
    val id: Long?,
    val marcheId: Long,
    val numeroLigne: Int,
    val designation: String,
    val unite: String?,
    val quantite: BigDecimal?,
    val prixUnitaireHT: BigDecimal,
    val montantHT: BigDecimal,
    val tauxTVA: BigDecimal,
    val montantTVA: BigDecimal,
    val montantTTC: BigDecimal,
    val imputationAnalytique: Map<String, String>?,
    val remarques: String?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class AvenantMarcheDTO(
    val id: Long?,
    val marcheId: Long,
    val numeroAvenant: String,
    val dateAvenant: LocalDate,
    val objet: String,
    val montantAvant: BigDecimal?,
    val montantApres: BigDecimal?,
    val impact: BigDecimal?,
    val statut: String,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

// Marché Paiement Micro-Endpoint DTOs

data class MarchePaiementDTO(
    val id: Long?,
    val referencePaiement: String,
    val dateValeur: LocalDate,
    val dateExecution: LocalDate?,
    val montantPaye: BigDecimal,
    val modePaiement: String,
    val estPaiementPartiel: Boolean,
    val decompteId: Long,
    val numeroDecompte: String,
    val ordrePaiementId: Long,
    val numeroOP: String,
    val observations: String?
)

data class MarcheSituationPaiementDTO(
    val totalDecomptes: Int,
    val totalNetAPayer: BigDecimal,
    val totalMontantPaye: BigDecimal,
    val resteAPayer: BigDecimal,
    val tauxPaiement: BigDecimal,
    val decomptesNonPayes: Int,
    val decomptesPayesPartiellement: Int,
    val decomptesPayesTotalement: Int,
    val nombrePaiements: Int
)
