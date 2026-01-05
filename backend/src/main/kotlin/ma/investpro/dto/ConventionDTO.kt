package ma.investpro.dto

import ma.investpro.entity.StatutConvention
import ma.investpro.entity.TypeConvention
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * DTO pour Convention - Version complète avec toutes les relations
 * Élimine les références circulaires en incluant uniquement les IDs pour les parents
 * et les objets complets (sans référence back) pour les enfants
 */
data class ConventionDTO(
    // Identification
    val id: Long?,
    val code: String,
    val numero: String,

    // Informations de base
    val dateConvention: LocalDate,
    val typeConvention: TypeConvention,
    val statut: StatutConvention,
    val libelle: String,
    val objet: String?,

    // Champs financiers
    val tauxCommission: BigDecimal,
    val budget: BigDecimal,
    val baseCalcul: String,
    val tauxTva: BigDecimal,

    // Dates
    val dateDebut: LocalDate,
    val dateFin: LocalDate?,
    val description: String?,

    // Workflow
    val dateSoumission: LocalDate?,
    val dateValidation: LocalDate?,
    val valideParId: Long?,
    val version: String?,
    val isLocked: Boolean,
    val motifVerrouillage: String?,

    // Sous-convention fields
    val parentConventionId: Long?, // ID seulement, pas l'objet complet
    val parentConventionNumero: String?, // Info supplémentaire pour affichage
    val heriteParametres: Boolean,
    val surchargeTauxCommission: BigDecimal?,
    val surchargeBaseCalcul: String?,

    // Relations enfants - Objets complets SANS référence back au parent
    val partenaires: List<ConventionPartenaireDTO> = emptyList(),
    val sousConventions: List<ConventionSimpleDTO> = emptyList(),
    val imputationsPrevisionnelles: List<ImputationPrevisionnelleDTO> = emptyList(),
    val versementsPrevisionnels: List<VersementPrevisionnelDTO> = emptyList(),

    // Timestamps (from BaseEntity)
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val createdBy: String?,
    val updatedBy: String?,
    val actif: Boolean
)

/**
 * DTO simplifié pour Convention - Utilisé dans les listes et comme enfant de relations
 * Évite la surcharge de données et les références circulaires
 */
data class ConventionSimpleDTO(
    val id: Long?,
    val code: String,
    val numero: String,
    val libelle: String,
    val statut: StatutConvention,
    val budget: BigDecimal,
    val dateDebut: LocalDate,
    val dateFin: LocalDate?,
    val actif: Boolean
)

/**
 * DTO pour ConventionPartenaire - Sans référence back à Convention
 */
data class ConventionPartenaireDTO(
    val id: Long?,

    // Convention parent : ID seulement (pas d'objet complet pour éviter cycle)
    val conventionId: Long,

    // Partenaire : Informations minimales nécessaires
    val partenaireId: Long,
    val partenaireCode: String,
    val partenaireNom: String,
    val partenaireSigle: String?,

    // Données métier
    val budgetAlloue: BigDecimal,
    val pourcentage: BigDecimal,
    val commissionIntervention: BigDecimal?,
    val estMaitreOeuvre: Boolean,
    val estMaitreOeuvreDelegue: Boolean,
    val remarques: String?,

    // Timestamps
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)

/**
 * DTO pour ImputationPrevisionnelle - Sans référence back à Convention
 */
data class ImputationPrevisionnelleDTO(
    val id: Long?,
    val conventionId: Long,
    val volet: String?,
    val dateDemarrage: LocalDate,
    val delaiMois: Int,
    val dateFinPrevue: LocalDate?,
    val remarques: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)

/**
 * DTO pour VersementPrevisionnel - Sans référence back à Convention
 */
data class VersementPrevisionnelDTO(
    val id: Long?,
    val conventionId: Long,
    val volet: String?,
    val dateVersement: LocalDate,
    val montant: BigDecimal,
    val partenaireId: Long,
    val partenaireNom: String?,
    val maitreOeuvreDelegueId: Long?,
    val maitreOeuvreDelegueNom: String?,
    val remarques: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val actif: Boolean
)

/**
 * DTO consolidé pour réponse de version consolidée d'une convention
 */
data class ConsolidatedVersionResponse(
    val convention: ConventionDTO,
    val avenants: List<AvenantDTO>,
    val versionActuelle: String,
    val nombreAvenants: Int,
    val historique: List<VersionHistoryEntry>
)

/**
 * Entrée d'historique de version
 */
data class VersionHistoryEntry(
    val version: String,
    val date: LocalDate,
    val type: String, // "V0" | "AVENANT"
    val description: String
)
