package ma.investpro.service

import ma.investpro.entity.Budget
import ma.investpro.entity.StatutBudget
import ma.investpro.repository.BudgetRepository
import ma.investpro.repository.ConventionRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Service Budget - Gestion des budgets avec versions
 */
@Service
@Transactional
class BudgetService(
    private val budgetRepository: BudgetRepository,
    private val conventionRepository: ConventionRepository
) {

    // ========== CRUD Operations ==========

    fun findAll(): List<Budget> = budgetRepository.findAll()

    fun findById(id: Long): Budget? = budgetRepository.findByIdOrNull(id)

    fun findByConvention(conventionId: Long): List<Budget> =
        budgetRepository.findByConventionId(conventionId)

    fun findByStatut(statut: StatutBudget): List<Budget> =
        budgetRepository.findByStatut(statut)

    fun create(budget: Budget): Budget {
        require(budget.id == null) { "Cannot create budget with existing ID" }

        val conventionId = budget.convention.id
            ?: throw IllegalArgumentException("L'ID de la convention est requis")

        // Vérifier que la convention existe
        val convention = conventionRepository.findByIdOrNull(conventionId)
            ?: throw IllegalArgumentException("Convention avec ID $conventionId non trouvée")

        // Vérifier que la version n'existe pas déjà pour cette convention
        if (budgetRepository.existsByConventionIdAndVersion(conventionId, budget.version)) {
            throw IllegalArgumentException("Un budget avec la version ${budget.version} existe déjà pour cette convention")
        }

        // Récupérer le plafond de la convention
        budget.plafondConvention = convention.plafondMontant ?: BigDecimal.ZERO

        // Calculer le total du budget
        budget.calculerTotal()

        // Vérifier que le budget ne dépasse pas le plafond
        if (!budget.verifierPlafond()) {
            throw IllegalArgumentException("Le budget dépasse le plafond de la convention")
        }

        // Si c'est une révision (V1, V2, etc.), calculer le delta
        if (budget.version != "V0") {
            budget.budgetPrecedentId?.let { precedentId ->
                findById(precedentId)?.let { budgetPrecedent ->
                    budget.calculerDelta(budgetPrecedent.totalBudget)
                }
            }
        }

        return budgetRepository.save(budget)
    }

    fun update(id: Long, budget: Budget): Budget {
        val existing = findById(id)
            ?: throw IllegalArgumentException("Budget $id introuvable")

        // Seuls les budgets en BROUILLON peuvent être modifiés
        require(existing.statut == StatutBudget.BROUILLON) {
            "Seuls les budgets en BROUILLON peuvent être modifiés"
        }

        existing.apply {
            version = budget.version
            dateBudget = budget.dateBudget
            observations = budget.observations
            justification = budget.justification
            lignes.clear()
            lignes.addAll(budget.lignes)
        }

        // Recalculer le total
        existing.calculerTotal()

        // Vérifier le plafond
        if (!existing.verifierPlafond()) {
            throw IllegalArgumentException("Le budget dépasse le plafond de la convention")
        }

        return budgetRepository.save(existing)
    }

    fun delete(id: Long) {
        val budget = findById(id)
            ?: throw IllegalArgumentException("Budget $id introuvable")

        require(budget.statut == StatutBudget.BROUILLON) {
            "Seuls les budgets en BROUILLON peuvent être supprimés"
        }

        budgetRepository.delete(budget)
    }

    // ========== Workflow Operations ==========

    fun soumettre(id: Long): Budget {
        val budget = findById(id)
            ?: throw IllegalArgumentException("Budget $id introuvable")

        require(budget.statut == StatutBudget.BROUILLON) {
            "Seuls les budgets en BROUILLON peuvent être soumis"
        }

        budget.statut = StatutBudget.SOUMIS
        return budgetRepository.save(budget)
    }

    fun valider(id: Long, valideParId: Long): Budget {
        val budget = findById(id)
            ?: throw IllegalArgumentException("Budget $id introuvable")

        require(budget.statut == StatutBudget.SOUMIS) {
            "Seuls les budgets SOUMIS peuvent être validés"
        }

        budget.apply {
            statut = StatutBudget.VALIDE
            dateValidation = LocalDate.now()
            this.valideParId = valideParId
        }

        return budgetRepository.save(budget)
    }

    fun rejeter(id: Long): Budget {
        val budget = findById(id)
            ?: throw IllegalArgumentException("Budget $id introuvable")

        require(budget.statut == StatutBudget.SOUMIS) {
            "Seuls les budgets SOUMIS peuvent être rejetés"
        }

        budget.statut = StatutBudget.REJETE
        return budgetRepository.save(budget)
    }

    fun archiver(id: Long): Budget {
        val budget = findById(id)
            ?: throw IllegalArgumentException("Budget $id introuvable")

        budget.statut = StatutBudget.ARCHIVE
        return budgetRepository.save(budget)
    }

    // ========== Statistiques ==========

    fun getStatistiques(): Map<String, Any> {
        val all = budgetRepository.findAll()
        return mapOf(
            "total" to all.size,
            "brouillon" to all.count { it.statut == StatutBudget.BROUILLON },
            "soumis" to all.count { it.statut == StatutBudget.SOUMIS },
            "valides" to all.count { it.statut == StatutBudget.VALIDE },
            "rejetes" to all.count { it.statut == StatutBudget.REJETE },
            "archives" to all.count { it.statut == StatutBudget.ARCHIVE },
            "montantTotal" to all.filter { it.statut == StatutBudget.VALIDE }.sumOf { it.totalBudget }
        )
    }
}
