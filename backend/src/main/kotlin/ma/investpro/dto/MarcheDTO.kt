package ma.investpro.dto

import ma.investpro.entity.StatutMarche
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * DTO pour Marché - Sans références circulaires
 */
data class MarcheDTO(
    val id: Long?,

    // Identification
    val numeroMarche: String,
    val numAo: String?,
    val dateMarche: LocalDate,

    // Fournisseur : informations minimales
    val fournisseurId: Long,
    val fournisseurCode: String,
    val fournisseurNom: String,
    val fournisseurIce: String?,

    // Convention : ID seulement
    val conventionId: Long?,
    val conventionNumero: String?,

    // Informations du marché
    val objet: String,
    val montantHt: BigDecimal,
    val tauxTva: BigDecimal,
    val montantTva: BigDecimal,
    val montantTtc: BigDecimal,
    val statut: StatutMarche,

    // Dates et délais
    val dateDebut: LocalDate?,
    val dateFinPrevue: LocalDate?,
    val delaiExecutionMois: Int?,

    val retenueGarantie: BigDecimal,
    val remarques: String?,

    // Relations enfants : objets complets SANS référence back
    val lignes: List<MarcheLigneDTO> = emptyList(),
    val avenants: List<AvenantMarcheDTO> = emptyList(),
    val decomptes: List<DecompteSimpleDTO> = emptyList(),

    // Timestamps
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val createdBy: String?,
    val updatedBy: String?,
    val actif: Boolean
)

/**
 * DTO simplifié pour Marché
 */
data class MarcheSimpleDTO(
    val id: Long?,
    val numeroMarche: String,
    val dateMarche: LocalDate,
    val fournisseurNom: String,
    val montantTtc: BigDecimal,
    val statut: StatutMarche,
    val actif: Boolean
)

/**
 * DTO pour MarcheLigne - Sans référence back à Marché
 */
data class MarcheLigneDTO(
    val id: Long?,

    // Marché parent : ID seulement
    val marcheId: Long,

    // Informations de la ligne
    val numeroLigne: Int,
    val designation: String,
    val unite: String?,
    val quantite: BigDecimal?,
    val prixUnitaireHT: BigDecimal,
    val montantHT: BigDecimal,
    val tauxTVA: BigDecimal,
    val montantTVA: BigDecimal,
    val montantTTC: BigDecimal,

    // Imputation analytique
    val imputationAnalytique: Map<String, String>?,
    val remarques: String?,

    // Timestamps
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)

/**
 * DTO pour AvenantMarche - Sans référence back à Marché
 */
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
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)
