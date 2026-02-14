package ma.investpro.service

import ma.investpro.dto.MarcheDureeCalculDTO
import ma.investpro.dto.OrdreServiceDTO
import ma.investpro.entity.OrdreService
import ma.investpro.entity.TypeOrdreService
import ma.investpro.repository.MarcheRepository
import ma.investpro.repository.OrdreServiceRepository
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.temporal.ChronoUnit

private val logger = KotlinLogging.logger {}

@Service
@Transactional
class OrdreServiceService(
    private val ordreServiceRepository: OrdreServiceRepository,
    private val marcheRepository: MarcheRepository
) {

    fun findByMarcheId(marcheId: Long): List<OrdreService> {
        logger.debug { "Fetching ordres de service for marche ID: $marcheId" }
        return ordreServiceRepository.findAllByMarcheOrdered(marcheId)
    }

    fun findById(id: Long): OrdreService {
        return ordreServiceRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Ordre de service avec ID $id non trouve") }
    }

    fun create(marcheId: Long, ordreService: OrdreService): OrdreService {
        logger.info { "Creating ordre de service for marche $marcheId: ${ordreService.typeOrdre}" }

        val marche = marcheRepository.findById(marcheId)
            .orElseThrow { IllegalArgumentException("Marche avec ID $marcheId non trouve") }

        ordreService.marche = marche

        // Set dateEffet to dateOrdre if not provided
        if (ordreService.dateEffet == null) {
            ordreService.dateEffet = ordreService.dateOrdre
        }

        return ordreServiceRepository.save(ordreService).also {
            logger.info { "Ordre de service created - ID: ${it.id}, type: ${it.typeOrdre}" }
        }
    }

    fun update(id: Long, ordreService: OrdreService): OrdreService {
        logger.info { "Updating ordre de service ID: $id" }

        val existing = ordreServiceRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Ordre de service avec ID $id non trouve") }

        existing.apply {
            numeroOrdre = ordreService.numeroOrdre
            typeOrdre = ordreService.typeOrdre
            dateOrdre = ordreService.dateOrdre
            dateEffet = ordreService.dateEffet ?: ordreService.dateOrdre
            reference = ordreService.reference
            motif = ordreService.motif
            observations = ordreService.observations
            dureeArretJours = ordreService.dureeArretJours
        }

        return ordreServiceRepository.save(existing)
    }

    fun delete(id: Long) {
        logger.info { "Deleting ordre de service ID: $id" }
        val os = ordreServiceRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Ordre de service avec ID $id non trouve") }
        ordreServiceRepository.delete(os)
    }

    /**
     * Calcul complet des durees et penalites pour un marche.
     *
     * Logique:
     * 1. Trouver la date de debut (COMMENCEMENT order dateEffet, or marche.dateDebut)
     * 2. Calculer les jours d'arret (periodes entre ARRET et REPRISE)
     * 3. Jours travailles = jours calendaires ecoules - jours d'arret
     * 4. Depassement = max(0, jours travailles - delai contractuel en jours)
     * 5. Penalites = depassement_jours * taux_penalite * montant_HT
     * 6. Plafonner a 10% du montant HT
     */
    fun calculerDureeEtPenalites(marcheId: Long): MarcheDureeCalculDTO {
        logger.info { "Calculating duration and penalties for marche $marcheId" }

        val marche = marcheRepository.findById(marcheId)
            .orElseThrow { IllegalArgumentException("Marche avec ID $marcheId non trouve") }

        val ordres = ordreServiceRepository.findAllByMarcheOrdered(marcheId)
        val ordresDTO = ordres.map { toDTO(it) }

        // 1. Find start date
        val commencementOrdre = ordres.find { it.typeOrdre == TypeOrdreService.COMMENCEMENT }
        val dateDebutTravaux = commencementOrdre?.dateEffet
            ?: commencementOrdre?.dateOrdre
            ?: marche.dateDebut

        // 2. Contractual duration
        val delaiContractuelMois = marche.delaiExecutionMois
        val delaiContractuelJours = if (delaiContractuelMois != null) {
            delaiContractuelMois * 30 // Convention: 1 mois = 30 jours
        } else {
            0
        }

        // 3. Calculate date fin contractuelle
        val dateFinContractuelle = if (dateDebutTravaux != null && delaiContractuelJours > 0) {
            dateDebutTravaux.plusDays(delaiContractuelJours.toLong())
        } else {
            marche.dateFinPrevue
        }

        // 4. Calendar days elapsed
        val today = LocalDate.now()
        val joursCalendaireEcoules = if (dateDebutTravaux != null) {
            ChronoUnit.DAYS.between(dateDebutTravaux, today).toInt().coerceAtLeast(0)
        } else {
            0
        }

        // 5. Calculate stop days
        val joursArret = calculerJoursArret(ordres, today)

        // 6. Working days = calendar days - stop days
        val joursTravailles = (joursCalendaireEcoules - joursArret).coerceAtLeast(0)

        // 7. Delay days
        val joursDepassement = (joursTravailles - delaiContractuelJours).coerceAtLeast(0)
        val estEnRetard = joursDepassement > 0

        // 8. Penalty calculation
        // Default: 1/2000 per day (Moroccan public procurement standard)
        val tauxPenaliteJour = marche.tauxPenalite
        val montantMarcheHT = marche.montantHt

        val montantPenalites = if (estEnRetard) {
            BigDecimal(joursDepassement)
                .multiply(tauxPenaliteJour)
                .multiply(montantMarcheHT)
                .setScale(2, RoundingMode.HALF_UP)
        } else {
            BigDecimal.ZERO
        }

        // 9. Cap at 10% of HT amount
        val plafondPenalites = montantMarcheHT
            .multiply(BigDecimal("0.10"))
            .setScale(2, RoundingMode.HALF_UP)

        val penalitesPlafonnees = montantPenalites.min(plafondPenalites)

        logger.info {
            "Marche $marcheId: $joursTravailles days worked, $joursArret days stopped, " +
                "$joursDepassement days overdue, penalties=$penalitesPlafonnees"
        }

        return MarcheDureeCalculDTO(
            marcheId = marcheId,
            delaiContractuelMois = delaiContractuelMois,
            delaiContractuelJours = delaiContractuelJours,
            dateDebutTravaux = dateDebutTravaux,
            dateFinContractuelle = dateFinContractuelle,
            joursCalendaireEcoules = joursCalendaireEcoules,
            joursTravailles = joursTravailles,
            joursArret = joursArret,
            joursDepassement = joursDepassement,
            estEnRetard = estEnRetard,
            tauxPenaliteJour = tauxPenaliteJour,
            montantMarcheHT = montantMarcheHT,
            montantPenalites = montantPenalites,
            plafondPenalites = plafondPenalites,
            penalitesPlafonnees = penalitesPlafonnees,
            ordresService = ordresDTO
        )
    }

    /**
     * Calculate total stop days from ARRET/REPRISE order pairs.
     * Iterates through orders chronologically:
     * - On ARRET: record stop start date
     * - On REPRISE: calculate days between stop start and reprise, add to total
     * - If currently stopped (no matching REPRISE): count up to today
     */
    private fun calculerJoursArret(ordres: List<OrdreService>, referenceDate: LocalDate): Int {
        var totalJoursArret = 0
        var dateArretEnCours: LocalDate? = null

        for (ordre in ordres) {
            val dateEffective = ordre.dateEffet ?: ordre.dateOrdre

            when (ordre.typeOrdre) {
                TypeOrdreService.ARRET -> {
                    if (dateArretEnCours == null) {
                        dateArretEnCours = dateEffective
                    }
                }
                TypeOrdreService.REPRISE -> {
                    if (dateArretEnCours != null) {
                        totalJoursArret += ChronoUnit.DAYS.between(dateArretEnCours, dateEffective)
                            .toInt().coerceAtLeast(0)
                        dateArretEnCours = null
                    }
                }
                else -> { /* COMMENCEMENT, RECEPTION_* don't affect stop calculation */ }
            }
        }

        // If currently stopped (open ARRET without REPRISE), count up to reference date
        if (dateArretEnCours != null) {
            totalJoursArret += ChronoUnit.DAYS.between(dateArretEnCours, referenceDate)
                .toInt().coerceAtLeast(0)
        }

        return totalJoursArret
    }

    fun toDTO(entity: OrdreService): OrdreServiceDTO {
        return OrdreServiceDTO(
            id = entity.id,
            marcheId = entity.marche?.id ?: 0,
            numeroOrdre = entity.numeroOrdre,
            typeOrdre = entity.typeOrdre.name,
            dateOrdre = entity.dateOrdre,
            dateEffet = entity.dateEffet,
            reference = entity.reference,
            motif = entity.motif,
            observations = entity.observations,
            dureeArretJours = entity.dureeArretJours,
            actif = entity.actif,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }

    fun toDTOList(entities: List<OrdreService>): List<OrdreServiceDTO> {
        return entities.map { toDTO(it) }
    }
}
