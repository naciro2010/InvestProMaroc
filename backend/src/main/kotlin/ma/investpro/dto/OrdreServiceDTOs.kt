package ma.investpro.dto

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * DTO de representation d'un ordre de service
 */
data class OrdreServiceDTO(
    val id: Long?,
    val marcheId: Long,
    val numeroOrdre: String,
    val typeOrdre: String,
    val dateOrdre: LocalDate,
    val dateEffet: LocalDate?,
    val reference: String?,
    val motif: String?,
    val observations: String?,
    val dureeArretJours: Int?,
    val actif: Boolean,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

/**
 * DTO pour la creation/modification d'un ordre de service
 */
data class CreateOrdreServiceRequest(
    val marcheId: Long,
    val numeroOrdre: String,
    val typeOrdre: String,
    val dateOrdre: LocalDate,
    val dateEffet: LocalDate?,
    val reference: String?,
    val motif: String?,
    val observations: String?,
    val dureeArretJours: Int?
)

/**
 * DTO pour le calcul complet des durees et penalites d'un marche
 *
 * Contient:
 * - Delai contractuel (mois et jours)
 * - Dates cles (debut, fin contractuelle)
 * - Jours calendaires ecoules, travailles, d'arret
 * - Depassement et indicateur de retard
 * - Calcul des penalites (taux, montant, plafond)
 * - Liste des ordres de service associes
 */
data class MarcheDureeCalculDTO(
    val marcheId: Long,
    val delaiContractuelMois: Int?,
    val delaiContractuelJours: Int,
    val dateDebutTravaux: LocalDate?,
    val dateFinContractuelle: LocalDate?,
    val joursCalendaireEcoules: Int,
    val joursTravailles: Int,
    val joursArret: Int,
    val joursDepassement: Int,
    val estEnRetard: Boolean,
    val tauxPenaliteJour: BigDecimal,
    val montantMarcheHT: BigDecimal,
    val montantPenalites: BigDecimal,
    val plafondPenalites: BigDecimal,
    val penalitesPlafonnees: BigDecimal,
    val ordresService: List<OrdreServiceDTO>
)
