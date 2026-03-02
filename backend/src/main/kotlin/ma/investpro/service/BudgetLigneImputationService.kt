package ma.investpro.service

import ma.investpro.entity.BudgetLigneImputation
import ma.investpro.repository.BudgetLigneImputationRepository
import ma.investpro.repository.ConventionBudgetLigneRepository
import ma.investpro.repository.ProjetRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode

/**
 * Service pour la gestion des imputations par projet sur les lignes de budget.
 * Permet de répartir le montant d'une ligne budget entre plusieurs projets.
 */
@Service
@Transactional
class BudgetLigneImputationService(
    private val budgetLigneImputationRepository: BudgetLigneImputationRepository,
    private val conventionBudgetLigneRepository: ConventionBudgetLigneRepository,
    private val projetRepository: ProjetRepository
) {

    /**
     * Récupère les imputations actives d'une ligne budget
     */
    fun findByBudgetLigneId(budgetLigneId: Long): List<BudgetLigneImputation> {
        return budgetLigneImputationRepository.findByBudgetLigneIdAndActifTrue(budgetLigneId)
    }

    /**
     * Récupère les imputations pour plusieurs lignes budget (batch)
     */
    fun findByBudgetLigneIds(budgetLigneIds: List<Long>): List<BudgetLigneImputation> {
        if (budgetLigneIds.isEmpty()) return emptyList()
        return budgetLigneImputationRepository.findByBudgetLigneIdInAndActifTrue(budgetLigneIds)
    }

    /**
     * Ajoute une imputation à une ligne budget
     */
    fun addImputation(
        budgetLigneId: Long,
        projetId: Long,
        projetCode: String,
        projetLibelle: String?,
        pourcentage: BigDecimal
    ): BudgetLigneImputation {
        val budgetLigne = conventionBudgetLigneRepository.findById(budgetLigneId)
            .orElseThrow { IllegalArgumentException("Ligne de budget $budgetLigneId introuvable") }

        val projet = projetRepository.findById(projetId)
            .orElseThrow { IllegalArgumentException("Projet $projetId introuvable") }

        // Vérifier l'unicité budget_ligne + projet_code
        if (budgetLigneImputationRepository.existsByBudgetLigneIdAndProjetCode(budgetLigneId, projetCode)) {
            throw IllegalStateException("Ce projet est déjà imputé sur cette ligne de budget")
        }

        // Vérifier que le total des pourcentages ne dépasse pas 100%
        val existingImputations = budgetLigneImputationRepository.findByBudgetLigneIdAndActifTrue(budgetLigneId)
        val totalExisting = existingImputations.sumOf { it.pourcentage }
        if (totalExisting + pourcentage > BigDecimal("100.00")) {
            throw IllegalStateException(
                "Le total des pourcentages (${totalExisting + pourcentage}%) dépasse 100%"
            )
        }

        // Calculer le montant: pourcentage × montant ligne budget
        val montant = budgetLigne.montant
            .multiply(pourcentage)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        val imputation = BudgetLigneImputation(
            budgetLigne = budgetLigne,
            projet = projet,
            projetCode = projetCode,
            projetLibelle = projetLibelle ?: projet.nom,
            pourcentage = pourcentage,
            montant = montant
        )

        return budgetLigneImputationRepository.save(imputation)
    }

    /**
     * Met à jour le pourcentage d'une imputation
     */
    fun updateImputation(
        id: Long,
        projetId: Long?,
        projetCode: String?,
        projetLibelle: String?,
        pourcentage: BigDecimal
    ): BudgetLigneImputation {
        val imputation = budgetLigneImputationRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Imputation $id introuvable") }

        val budgetLigne = imputation.budgetLigne
            ?: throw IllegalStateException("Ligne de budget null pour l'imputation $id")

        // Si changement de projet, vérifier l'unicité
        if (projetCode != null && projetCode != imputation.projetCode) {
            val budgetLigneId = budgetLigne.id
                ?: throw IllegalStateException("ID ligne de budget null")

            if (budgetLigneImputationRepository.existsByBudgetLigneIdAndProjetCode(budgetLigneId, projetCode)) {
                throw IllegalStateException("Ce projet est déjà imputé sur cette ligne de budget")
            }
            imputation.projetCode = projetCode
        }

        if (projetId != null) {
            val projet = projetRepository.findById(projetId)
                .orElseThrow { IllegalArgumentException("Projet $projetId introuvable") }
            imputation.projet = projet
        }

        if (projetLibelle != null) {
            imputation.projetLibelle = projetLibelle
        }

        // Vérifier que le total ne dépasse pas 100%
        val budgetLigneId = budgetLigne.id
            ?: throw IllegalStateException("ID ligne de budget null")
        val existingImputations = budgetLigneImputationRepository.findByBudgetLigneIdAndActifTrue(budgetLigneId)
        val totalOthers = existingImputations
            .filter { it.id != id }
            .sumOf { it.pourcentage }
        if (totalOthers + pourcentage > BigDecimal("100.00")) {
            throw IllegalStateException(
                "Le total des pourcentages (${totalOthers + pourcentage}%) dépasse 100%"
            )
        }

        // Recalculer le montant
        val montant = budgetLigne.montant
            .multiply(pourcentage)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        imputation.pourcentage = pourcentage
        imputation.montant = montant

        return budgetLigneImputationRepository.save(imputation)
    }

    /**
     * Supprime une imputation (soft delete)
     */
    fun deleteImputation(id: Long) {
        val imputation = budgetLigneImputationRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Imputation $id introuvable") }

        imputation.actif = false
        budgetLigneImputationRepository.save(imputation)
    }
}
