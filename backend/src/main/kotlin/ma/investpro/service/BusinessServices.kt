package ma.investpro.service

import ma.investpro.entity.*
import ma.investpro.repository.*
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

private val logger = KotlinLogging.logger {}

@Service
@Transactional
class ConventionService(
    private val conventionRepository: ConventionRepository
) : GenericCrudService<Convention, Long>(conventionRepository) {

    fun findByCode(code: String): Convention? = conventionRepository.findByCode(code).orElse(null)

    fun findAllActive(): List<Convention> = conventionRepository.findByActifTrue()

    fun findActiveConventions(): List<Convention> = conventionRepository.findActiveConventions()

    override fun create(entity: Convention): Convention {
        require(!conventionRepository.existsByCode(entity.code)) {
            "Une convention avec le code '${entity.code}' existe déjà"
        }
        logger.info { "Création de la convention: ${entity.code}" }
        return super.create(entity)
    }
}

@Service
@Transactional
class ProjetService(
    private val projetRepository: ProjetRepository
) : GenericCrudService<Projet, Long>(projetRepository) {

    fun findByCode(code: String): Projet? = projetRepository.findByCode(code).orElse(null)

    fun findAllActive(): List<Projet> = projetRepository.findByActifTrue()

    fun findByStatut(statut: String): List<Projet> = projetRepository.findByStatut(statut)

    override fun create(entity: Projet): Projet {
        require(!projetRepository.existsByCode(entity.code)) {
            "Un projet avec le code '${entity.code}' existe déjà"
        }
        logger.info { "Création du projet: ${entity.code}" }
        return super.create(entity)
    }
}

@Service
@Transactional
class FournisseurService(
    private val fournisseurRepository: FournisseurRepository
) : GenericCrudService<Fournisseur, Long>(fournisseurRepository) {

    fun findByCode(code: String): Fournisseur? = fournisseurRepository.findByCode(code).orElse(null)

    fun findAllActive(): List<Fournisseur> = fournisseurRepository.findByActifTrue()

    fun findNonResidents(): List<Fournisseur> = fournisseurRepository.findByNonResidentTrue()

    override fun create(entity: Fournisseur): Fournisseur {
        require(!fournisseurRepository.existsByCode(entity.code)) {
            "Un fournisseur avec le code '${entity.code}' existe déjà"
        }
        entity.ice?.let { ice ->
            require(!fournisseurRepository.existsByIce(ice)) {
                "Un fournisseur avec l'ICE '$ice' existe déjà"
            }
        }
        logger.info { "Création du fournisseur: ${entity.code}" }
        return super.create(entity)
    }
}

@Service
@Transactional
class AxeAnalytiqueService(
    private val axeAnalytiqueRepository: AxeAnalytiqueRepository
) : GenericCrudService<AxeAnalytique, Long>(axeAnalytiqueRepository) {

    fun findByCode(code: String): AxeAnalytique? = axeAnalytiqueRepository.findByCode(code).orElse(null)

    fun findAllActive(): List<AxeAnalytique> = axeAnalytiqueRepository.findByActifTrue()

    fun findByType(type: String): List<AxeAnalytique> = axeAnalytiqueRepository.findByType(type)

    override fun create(entity: AxeAnalytique): AxeAnalytique {
        require(!axeAnalytiqueRepository.existsByCode(entity.code)) {
            "Un axe analytique avec le code '${entity.code}' existe déjà"
        }
        logger.info { "Création de l'axe analytique: ${entity.code}" }
        return super.create(entity)
    }
}

@Service
@Transactional
class CompteBancaireService(
    private val compteBancaireRepository: CompteBancaireRepository
) : GenericCrudService<CompteBancaire, Long>(compteBancaireRepository) {

    fun findByCode(code: String): CompteBancaire? = compteBancaireRepository.findByCode(code).orElse(null)

    fun findByRib(rib: String): CompteBancaire? = compteBancaireRepository.findByRib(rib).orElse(null)

    fun findAllActive(): List<CompteBancaire> = compteBancaireRepository.findByActifTrue()

    override fun create(entity: CompteBancaire): CompteBancaire {
        require(!compteBancaireRepository.existsByCode(entity.code)) {
            "Un compte bancaire avec le code '${entity.code}' existe déjà"
        }
        require(!compteBancaireRepository.existsByRib(entity.rib)) {
            "Un compte bancaire avec le RIB '${entity.rib}' existe déjà"
        }
        logger.info { "Création du compte bancaire: ${entity.code}" }
        return super.create(entity)
    }
}

@Service
@Transactional
class DepenseInvestissementService(
    private val depenseRepository: DepenseInvestissementRepository,
    private val commissionService: CommissionService
) : GenericCrudService<DepenseInvestissement, Long>(depenseRepository) {

    fun findByNumeroFacture(numeroFacture: String): DepenseInvestissement? =
        depenseRepository.findByNumeroFacture(numeroFacture).orElse(null)

    fun findByFournisseur(fournisseurId: Long): List<DepenseInvestissement> =
        depenseRepository.findByFournisseurId(fournisseurId)

    fun findByProjet(projetId: Long): List<DepenseInvestissement> =
        depenseRepository.findByProjetId(projetId)

    fun findPaid(): List<DepenseInvestissement> = depenseRepository.findByPayeTrue()

    fun findUnpaid(): List<DepenseInvestissement> = depenseRepository.findByPayeFalse()

    fun findByYear(year: Int): List<DepenseInvestissement> = depenseRepository.findByYear(year)

    override fun create(entity: DepenseInvestissement): DepenseInvestissement {
        logger.info { "Création de la dépense: ${entity.numeroFacture}" }
        val saved = super.create(entity)

        // Calculer automatiquement la commission si une convention est associée
        if (entity.convention != null) {
            try {
                commissionService.calculateAndSave(saved)
                logger.info { "Commission calculée pour la dépense ${saved.id}" }
            } catch (e: Exception) {
                logger.error(e) { "Erreur lors du calcul de la commission: ${e.message}" }
            }
        }

        return saved
    }
}

@Service
@Transactional
class CommissionService(
    private val commissionRepository: CommissionRepository
) : GenericCrudService<Commission, Long>(commissionRepository) {

    fun findByDepense(depenseId: Long): Commission? =
        commissionRepository.findByDepenseId(depenseId).orElse(null)

    fun findByConvention(conventionId: Long): List<Commission> =
        commissionRepository.findByConventionId(conventionId)

    fun findByYear(year: Int): List<Commission> = commissionRepository.findByYear(year)

    fun calculateAndSave(depense: DepenseInvestissement): Commission {
        val convention = depense.convention
            ?: throw IllegalArgumentException("La dépense n'a pas de convention associée")

        // Déterminer la base de calcul
        val montantBase = when (convention.baseCalcul) {
            "HT" -> depense.montantHt
            "TTC" -> depense.montantTtc
            else -> depense.montantHt
        }

        // Calculer la commission HT
        val commissionHt = montantBase.multiply(convention.tauxCommission).divide(java.math.BigDecimal("100"))

        // Calculer la TVA sur commission
        val tvaCommission = commissionHt.multiply(convention.tauxTva).divide(java.math.BigDecimal("100"))

        // Commission TTC
        val commissionTtc = commissionHt.add(tvaCommission)

        val commission = Commission(
            depense = depense,
            convention = convention,
            dateCalcul = java.time.LocalDate.now(),
            baseCalcul = convention.baseCalcul,
            montantBase = montantBase,
            tauxCommission = convention.tauxCommission,
            tauxTva = convention.tauxTva,
            montantCommissionHt = commissionHt,
            montantTvaCommission = tvaCommission,
            montantCommissionTtc = commissionTtc
        )

        logger.info { "Calcul de commission: Base=${montantBase}, Commission HT=${commissionHt}, TTC=${commissionTtc}" }

        return repository.save(commission)
    }
}
