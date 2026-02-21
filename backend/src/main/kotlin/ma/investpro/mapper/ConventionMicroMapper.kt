package ma.investpro.mapper

import ma.investpro.dto.convention.*
import ma.investpro.entity.Convention
import ma.investpro.repository.ProjetRepository
import ma.investpro.repository.MarcheRepository
import ma.investpro.repository.ConventionRepository
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.temporal.ChronoUnit

/**
 * Mapper for Convention Micro-DTOs
 *
 * Converts Convention entities to specialized micro-DTOs for granular API endpoints.
 * Follows micro-services architecture from CLAUDE.md:
 * - Each DTO focuses on one aspect (basic, finances, dates, stats)
 * - Lazy loading friendly
 * - Optimized for minimal payload size
 */
@Component
class ConventionMicroMapper(
    private val projetRepository: ProjetRepository,
    private val marcheRepository: MarcheRepository,
    private val conventionRepository: ConventionRepository
) {

    /**
     * Convert to Basic DTO (identification only)
     * Payload: ~5-10 KB
     */
    fun toBasicDTO(convention: Convention): ConventionBasicDTO {
        return ConventionBasicDTO(
            id = convention.id ?: 0,
            code = convention.code,
            numero = convention.numero,
            libelle = convention.libelle,
            objet = convention.objet,
            typeConvention = convention.typeConvention,
            statut = convention.statut,
            createdBy = null, // Convention entity does not have createdBy field
            parentConventionId = convention.parentConvention?.id,
            parentConventionNumero = convention.parentConvention?.numero,
            heriteParametres = convention.heriteParametres
        )
    }

    /**
     * Convert to Finances DTO (financial data only)
     * Payload: ~3-5 KB
     */
    fun toFinancesDTO(convention: Convention): ConventionFinancesDTO {
        // Calculate estimated commission
        val montantCommissionEstime = convention.budget
            .multiply(convention.tauxCommission)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        return ConventionFinancesDTO(
            id = convention.id ?: 0,
            tauxCommission = convention.tauxCommission,
            budget = convention.budget,
            baseCalcul = convention.baseCalcul,
            tauxTva = convention.tauxTva,
            tauxTvaLignes = convention.tauxTvaLignes,
            montantCommissionEstime = montantCommissionEstime
        )
    }

    /**
     * Convert to Dates DTO (dates only)
     * Payload: ~2-3 KB
     */
    fun toDatesDTO(convention: Convention): ConventionDatesDTO {
        // Calculate duration in days (use local variable to avoid smart cast issues)
        val dateFin = convention.dateFin
        val dureeJours = if (dateFin != null) {
            ChronoUnit.DAYS.between(convention.dateDebut, dateFin)
        } else null

        // Check if convention is currently active
        val now = LocalDate.now()
        val estActive = now.isAfter(convention.dateDebut.minusDays(1)) &&
                (dateFin == null || now.isBefore(dateFin.plusDays(1)))

        return ConventionDatesDTO(
            id = convention.id ?: 0,
            dateConvention = convention.dateConvention,
            dateDebut = convention.dateDebut,
            dateFin = convention.dateFin,
            dateSoumission = convention.dateSoumission,
            dateValidation = convention.dateValidation,
            dureeJours = dureeJours,
            estActive = estActive
        )
    }

    /**
     * Convert to Stats DTO (aggregated statistics)
     * Payload: ~5 KB
     * Note: This involves queries to related tables - cache this!
     */
    fun toStatsDTO(convention: Convention): ConventionStatsDTO {
        val conventionId = convention.id ?: return ConventionStatsDTO(id = 0)

        // Count related entities
        val nombreProjets = projetRepository.countByConventionId(conventionId)
        val nombreMarches = marcheRepository.countByConventionId(conventionId)
        val nombreSousConventions = conventionRepository.countByParentConventionId(conventionId)

        // Calculate totals (simple sums for now - can be optimized with JPQL queries)
        val projets = projetRepository.findByConventionId(conventionId)
        val montantTotalProjets = projets.fold(BigDecimal.ZERO) { acc, projet ->
            acc.add(projet.budgetTotal)
        }

        val marches = marcheRepository.findByConventionId(conventionId)
        val montantTotalMarches = marches.fold(BigDecimal.ZERO) { acc, marche ->
            acc.add(marche.montantTtc)
        }

        // Calculate realization rate
        val tauxRealisation = if (convention.budget > BigDecimal.ZERO) {
            montantTotalMarches
                .multiply(BigDecimal(100))
                .divide(convention.budget, 2, RoundingMode.HALF_UP)
        } else BigDecimal.ZERO

        // Calculate total commission (simplified - based on budget consumption)
        val commissionTotale = montantTotalMarches
            .multiply(convention.tauxCommission)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        return ConventionStatsDTO(
            id = conventionId,
            nombreProjets = nombreProjets,
            nombreMarches = nombreMarches,
            nombreSousConventions = nombreSousConventions,
            montantTotalProjets = montantTotalProjets,
            montantTotalMarches = montantTotalMarches,
            tauxRealisation = tauxRealisation,
            commissionTotale = commissionTotale
        )
    }
}
