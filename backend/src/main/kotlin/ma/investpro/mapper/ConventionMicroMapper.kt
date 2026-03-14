package ma.investpro.mapper

import ma.investpro.dto.convention.*
import ma.investpro.entity.Convention
import ma.investpro.repository.ProjetRepository
import ma.investpro.repository.MarcheRepository
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.AvenantConventionRepository
import ma.investpro.repository.UserRepository
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
    private val conventionRepository: ConventionRepository,
    private val avenantConventionRepository: AvenantConventionRepository,
    private val userRepository: UserRepository
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
        // Use effective rate (handles sous-convention inheritance)
        val tauxEffectif = convention.getTauxCommissionEffectif()

        // Calculate estimated commission HT on budget
        val montantCommissionEstime = convention.budget
            .multiply(tauxEffectif)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        // Calculate commission TVA and TTC
        val montantTvaCommission = montantCommissionEstime
            .multiply(convention.tauxTva)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        val montantCommissionTtc = montantCommissionEstime.add(montantTvaCommission)

        return ConventionFinancesDTO(
            id = convention.id ?: 0,
            tauxCommission = convention.tauxCommission,
            tauxCommissionEffectif = tauxEffectif,
            budget = convention.budget,
            baseCalcul = convention.baseCalcul,
            baseCalculEffective = convention.getBaseCalculEffective(),
            tauxTva = convention.tauxTva,
            tauxTvaLignes = convention.tauxTvaLignes,
            montantCommissionEstime = montantCommissionEstime,
            montantTvaCommission = montantTvaCommission,
            montantCommissionTtc = montantCommissionTtc
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

        // Calculate totals
        val projets = projetRepository.findByConventionId(conventionId)
        val montantTotalProjets = projets.fold(BigDecimal.ZERO) { acc, projet ->
            acc.add(projet.budgetTotal)
        }

        val marches = marcheRepository.findByConventionId(conventionId)

        // Use correct base (HT or TTC) based on convention's baseCalcul setting
        val baseCalculEffective = convention.getBaseCalculEffective()
        val montantTotalMarchesHt = marches.fold(BigDecimal.ZERO) { acc, marche ->
            acc.add(marche.montantHt)
        }
        val montantTotalMarchesTtc = marches.fold(BigDecimal.ZERO) { acc, marche ->
            acc.add(marche.montantTtc)
        }

        // Select the correct base for commission calculation
        val montantBaseCommission = if (baseCalculEffective == "DECAISSEMENTS_HT") {
            montantTotalMarchesHt
        } else {
            montantTotalMarchesTtc
        }

        // Calculate realization rate (always based on TTC for budget comparison)
        val tauxRealisation = if (convention.budget > BigDecimal.ZERO) {
            montantTotalMarchesTtc
                .multiply(BigDecimal(100))
                .divide(convention.budget, 2, RoundingMode.HALF_UP)
        } else BigDecimal.ZERO

        // Use effective rate (handles sous-convention inheritance)
        val tauxCommissionEffectif = convention.getTauxCommissionEffectif()

        // Calculate commission breakdown
        val commissionHT = montantBaseCommission
            .multiply(tauxCommissionEffectif)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        val commissionTVA = commissionHT
            .multiply(convention.tauxTva)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        val commissionTTC = commissionHT.add(commissionTVA)

        // Estimated commission on budget (pre-execution reference)
        val commissionEstimeeBudget = convention.budget
            .multiply(tauxCommissionEffectif)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        // Remaining budget to engage
        val resteAEngager = convention.budget.subtract(montantTotalMarchesTtc)

        return ConventionStatsDTO(
            id = conventionId,
            nombreProjets = nombreProjets,
            nombreMarches = nombreMarches,
            nombreSousConventions = nombreSousConventions,
            montantTotalProjets = montantTotalProjets,
            montantTotalMarches = montantTotalMarchesTtc,
            montantTotalMarchesHt = montantTotalMarchesHt,
            tauxRealisation = tauxRealisation,
            commissionTotale = commissionTTC,
            commissionHT = commissionHT,
            commissionTVA = commissionTVA,
            commissionTTC = commissionTTC,
            commissionEstimeeBudget = commissionEstimeeBudget,
            resteAEngager = resteAEngager,
            tauxCommissionEffectif = tauxCommissionEffectif,
            baseCalculEffective = baseCalculEffective
        )
    }

    /**
     * Convert to Detail Enriched DTO (aggregated data for Odoo-style detail page)
     * Payload: ~10-15 KB
     *
     * Combines audit info, entity counts, financial summaries,
     * effective rates, duration, and workflow info in a single response.
     */
    fun toDetailEnrichedDTO(convention: Convention): ConventionDetailEnrichedDTO {
        val conventionId = convention.id ?: 0L

        // --- Audit info: resolve user names ---
        val createdByNom: String? = convention.createdById?.let { userId ->
            userRepository.findById(userId).orElse(null)?.fullName
        }
        val valideParNom: String? = convention.valideParId?.let { userId ->
            userRepository.findById(userId).orElse(null)?.fullName
        }

        // --- Counts of related entities ---
        val nombreMarches: Long = if (conventionId > 0) marcheRepository.countByConventionId(conventionId) else 0
        val nombreProjets: Long = if (conventionId > 0) projetRepository.countByConventionId(conventionId) else 0
        val nombreSousConventions: Long = if (conventionId > 0) conventionRepository.countByParentConventionId(conventionId) else 0
        val nombreAvenants: Long = if (conventionId > 0) avenantConventionRepository.countByConventionId(conventionId) else 0
        val nombrePartenaires: Long = convention.partenaires.size.toLong()

        // --- Financial summaries ---
        val marches = if (conventionId > 0) marcheRepository.findByConventionId(conventionId) else emptyList()
        val montantTotalMarchesHt: BigDecimal = marches.fold(BigDecimal.ZERO) { acc, marche ->
            acc.add(marche.montantHt)
        }
        val montantTotalMarches: BigDecimal = marches.fold(BigDecimal.ZERO) { acc, marche ->
            acc.add(marche.montantTtc)
        }

        val projets = if (conventionId > 0) projetRepository.findByConventionId(conventionId) else emptyList()
        val montantTotalProjets: BigDecimal = projets.fold(BigDecimal.ZERO) { acc, projet ->
            acc.add(projet.budgetTotal)
        }

        val tauxRealisation: BigDecimal = if (convention.budget > BigDecimal.ZERO) {
            montantTotalMarches
                .multiply(BigDecimal(100))
                .divide(convention.budget, 2, RoundingMode.HALF_UP)
        } else BigDecimal.ZERO

        val tauxCommissionEffectif: BigDecimal = convention.getTauxCommissionEffectif()
        val baseCalculEffective: String = convention.getBaseCalculEffective()

        // Select the correct base for commission calculation (HT or TTC)
        val montantBaseCommission: BigDecimal = if (baseCalculEffective == "DECAISSEMENTS_HT") {
            montantTotalMarchesHt
        } else {
            montantTotalMarches
        }

        // Commission HT = base × taux effectif / 100
        val commissionEstimee: BigDecimal = montantBaseCommission
            .multiply(tauxCommissionEffectif)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        // Commission TVA = commission HT × taux TVA / 100
        val commissionTVA: BigDecimal = commissionEstimee
            .multiply(convention.tauxTva)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        // Commission TTC = commission HT + TVA
        val commissionTTC: BigDecimal = commissionEstimee.add(commissionTVA)

        // Estimated commission on full budget (for reference)
        val commissionEstimeeBudget: BigDecimal = convention.budget
            .multiply(tauxCommissionEffectif)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        // Remaining budget to engage
        val resteAEngager: BigDecimal = convention.budget.subtract(montantTotalMarches)

        // --- Duration info ---
        val dateFin = convention.dateFin
        val dureeJours: Long? = if (dateFin != null) {
            ChronoUnit.DAYS.between(convention.dateDebut, dateFin)
        } else null

        val now = LocalDate.now()
        val estActive: Boolean = now.isAfter(convention.dateDebut.minusDays(1)) &&
                (dateFin == null || now.isBefore(dateFin.plusDays(1)))

        return ConventionDetailEnrichedDTO(
            id = conventionId,

            // Audit
            createdByNom = createdByNom,
            createdAt = convention.createdAt,
            updatedAt = convention.updatedAt,
            valideParNom = valideParNom,
            dateValidation = convention.dateValidation,
            dateSoumission = convention.dateSoumission,

            // Counts
            nombreMarches = nombreMarches,
            nombreProjets = nombreProjets,
            nombreSousConventions = nombreSousConventions,
            nombreAvenants = nombreAvenants,
            nombrePartenaires = nombrePartenaires,

            // Financial summaries
            montantTotalMarches = montantTotalMarches,
            montantTotalMarchesHt = montantTotalMarchesHt,
            montantTotalProjets = montantTotalProjets,
            tauxRealisation = tauxRealisation,
            commissionEstimee = commissionEstimee,
            commissionTVA = commissionTVA,
            commissionTTC = commissionTTC,
            commissionEstimeeBudget = commissionEstimeeBudget,
            resteAEngager = resteAEngager,

            // Effective rates
            tauxCommissionEffectif = tauxCommissionEffectif,
            baseCalculEffective = baseCalculEffective,

            // Duration
            dureeJours = dureeJours,
            estActive = estActive,

            // Workflow
            motifRejet = convention.motifRejet,
            isLocked = convention.isLocked,
            version = convention.version
        )
    }
}
