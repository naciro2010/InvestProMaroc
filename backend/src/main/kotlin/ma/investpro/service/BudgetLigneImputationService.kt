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
 * Permet de répartir le montant d'une ligne budget entre plusieurs projets,
 * avec distinction par type: BUDGET, ENGAGEMENT, DEPENSE.
 */
@Service
@Transactional
class BudgetLigneImputationService(
    private val budgetLigneImputationRepository: BudgetLigneImputationRepository,
    private val conventionBudgetLigneRepository: ConventionBudgetLigneRepository,
    private val projetRepository: ProjetRepository
) {

    fun findByBudgetLigneId(budgetLigneId: Long): List<BudgetLigneImputation> {
        return budgetLigneImputationRepository.findByBudgetLigneIdAndActifTrue(budgetLigneId)
    }

    fun findByBudgetLigneIds(budgetLigneIds: List<Long>): List<BudgetLigneImputation> {
        if (budgetLigneIds.isEmpty()) return emptyList()
        return budgetLigneImputationRepository.findByBudgetLigneIdInAndActifTrue(budgetLigneIds)
    }

    fun addImputation(
        budgetLigneId: Long,
        projetId: Long,
        projetCode: String,
        projetLibelle: String?,
        pourcentage: BigDecimal,
        typeImputation: String = "BUDGET"
    ): BudgetLigneImputation {
        val budgetLigne = conventionBudgetLigneRepository.findById(budgetLigneId)
            .orElseThrow { IllegalArgumentException("Ligne de budget $budgetLigneId introuvable") }

        val projet = projetRepository.findById(projetId)
            .orElseThrow { IllegalArgumentException("Projet $projetId introuvable") }

        // Vérifier l'unicité budget_ligne + projet_code + type
        if (budgetLigneImputationRepository.existsByBudgetLigneIdAndProjetCodeAndTypeImputation(
                budgetLigneId, projetCode, typeImputation
            )
        ) {
            throw IllegalStateException("Ce projet est déjà imputé (type $typeImputation) sur cette ligne de budget")
        }

        // Vérifier que le total des pourcentages ne dépasse pas 100% (par type)
        val existingImputations = budgetLigneImputationRepository
            .findByBudgetLigneIdAndTypeImputationAndActifTrue(budgetLigneId, typeImputation)
        val totalExisting = existingImputations.sumOf { it.pourcentage }
        if (totalExisting + pourcentage > BigDecimal("100.00")) {
            throw IllegalStateException(
                "Le total des pourcentages $typeImputation (${totalExisting + pourcentage}%) dépasse 100%"
            )
        }

        // Le montant de base dépend du type d'imputation
        val baseMontant = when (typeImputation) {
            "ENGAGEMENT" -> budgetLigne.engagementMontant
            "DEPENSE" -> budgetLigne.depensesMontant
            else -> budgetLigne.montant
        }

        val montant = baseMontant
            .multiply(pourcentage)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        val imputation = BudgetLigneImputation(
            budgetLigne = budgetLigne,
            projet = projet,
            projetCode = projetCode,
            projetLibelle = projetLibelle ?: projet.nom,
            pourcentage = pourcentage,
            montant = montant,
            typeImputation = typeImputation
        )

        return budgetLigneImputationRepository.save(imputation)
    }

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

        val budgetLigneId = budgetLigne.id
            ?: throw IllegalStateException("ID ligne de budget null")

        // Si changement de projet, vérifier l'unicité (avec type)
        if (projetCode != null && projetCode != imputation.projetCode) {
            if (budgetLigneImputationRepository.existsByBudgetLigneIdAndProjetCodeAndTypeImputation(
                    budgetLigneId, projetCode, imputation.typeImputation
                )
            ) {
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

        // Vérifier que le total ne dépasse pas 100% (par type)
        val existingImputations = budgetLigneImputationRepository
            .findByBudgetLigneIdAndTypeImputationAndActifTrue(budgetLigneId, imputation.typeImputation)
        val totalOthers = existingImputations
            .filter { it.id != id }
            .sumOf { it.pourcentage }
        if (totalOthers + pourcentage > BigDecimal("100.00")) {
            throw IllegalStateException(
                "Le total des pourcentages (${totalOthers + pourcentage}%) dépasse 100%"
            )
        }

        // Le montant de base dépend du type d'imputation
        val baseMontant = when (imputation.typeImputation) {
            "ENGAGEMENT" -> budgetLigne.engagementMontant
            "DEPENSE" -> budgetLigne.depensesMontant
            else -> budgetLigne.montant
        }

        val montant = baseMontant
            .multiply(pourcentage)
            .divide(BigDecimal(100), 2, RoundingMode.HALF_UP)

        imputation.pourcentage = pourcentage
        imputation.montant = montant

        return budgetLigneImputationRepository.save(imputation)
    }

    fun deleteImputation(id: Long) {
        val imputation = budgetLigneImputationRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Imputation $id introuvable") }

        imputation.actif = false
        budgetLigneImputationRepository.save(imputation)
    }
}
