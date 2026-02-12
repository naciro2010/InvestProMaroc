package ma.investpro.service

import ma.investpro.entity.ConventionBudgetLigne
import ma.investpro.repository.CategorieDepenseRepository
import ma.investpro.repository.ConventionBudgetLigneRepository
import ma.investpro.repository.ConventionRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode

/**
 * Service pour la gestion des lignes de répartition budgétaire par catégorie de dépense
 */
@Service
@Transactional
class ConventionBudgetLigneService(
    private val conventionBudgetLigneRepository: ConventionBudgetLigneRepository,
    private val conventionRepository: ConventionRepository,
    private val categorieDepenseRepository: CategorieDepenseRepository
) {

    /**
     * Trouve toutes les lignes budget actives d'une convention
     */
    fun findByConventionId(conventionId: Long): List<ConventionBudgetLigne> {
        return conventionBudgetLigneRepository.findByConventionIdAndActifTrue(conventionId)
    }

    /**
     * Ajoute une ligne de budget à une convention
     */
    fun addBudgetLigne(
        conventionId: Long,
        categorieDepenseId: Long,
        montant: BigDecimal,
        designation: String?,
        remarques: String?
    ): ConventionBudgetLigne {
        val convention = conventionRepository.findById(conventionId)
            .orElseThrow { IllegalArgumentException("Convention $conventionId introuvable") }

        val categorieDepense = categorieDepenseRepository.findById(categorieDepenseId)
            .orElseThrow { IllegalArgumentException("Catégorie de dépense $categorieDepenseId introuvable") }

        // Vérifier l'unicité convention + catégorie
        if (conventionBudgetLigneRepository.existsByConventionIdAndCategorieDepenseId(conventionId, categorieDepenseId)) {
            throw IllegalStateException("Cette catégorie de dépense est déjà utilisée dans cette convention")
        }

        // Calculer le pourcentage
        val pourcentage: BigDecimal = if (convention.budget > BigDecimal.ZERO) {
            montant.multiply(BigDecimal(100)).divide(convention.budget, 2, RoundingMode.HALF_UP)
        } else {
            BigDecimal.ZERO
        }

        val budgetLigne = ConventionBudgetLigne(
            convention = convention,
            categorieDepense = categorieDepense,
            designation = designation ?: categorieDepense.libelle,
            montant = montant,
            pourcentage = pourcentage,
            remarques = remarques
        )

        return conventionBudgetLigneRepository.save(budgetLigne)
    }

    /**
     * Met à jour une ligne de budget
     */
    fun updateBudgetLigne(
        id: Long,
        categorieDepenseId: Long?,
        montant: BigDecimal,
        designation: String?,
        remarques: String?
    ): ConventionBudgetLigne {
        val budgetLigne = conventionBudgetLigneRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Ligne de budget $id introuvable") }

        val convention = budgetLigne.convention
            ?: throw IllegalStateException("Convention null pour la ligne de budget $id")

        // Si changement de catégorie, vérifier l'unicité
        if (categorieDepenseId != null && categorieDepenseId != budgetLigne.categorieDepense?.id) {
            val conventionId = convention.id
                ?: throw IllegalStateException("Convention ID null")

            if (conventionBudgetLigneRepository.existsByConventionIdAndCategorieDepenseId(conventionId, categorieDepenseId)) {
                throw IllegalStateException("Cette catégorie de dépense est déjà utilisée dans cette convention")
            }

            val newCategorie = categorieDepenseRepository.findById(categorieDepenseId)
                .orElseThrow { IllegalArgumentException("Catégorie de dépense $categorieDepenseId introuvable") }

            budgetLigne.categorieDepense = newCategorie
        }

        // Recalculer le pourcentage
        val pourcentage: BigDecimal = if (convention.budget > BigDecimal.ZERO) {
            montant.multiply(BigDecimal(100)).divide(convention.budget, 2, RoundingMode.HALF_UP)
        } else {
            BigDecimal.ZERO
        }

        budgetLigne.apply {
            this.montant = montant
            this.pourcentage = pourcentage
            this.designation = designation ?: this.designation
            this.remarques = remarques
        }

        return conventionBudgetLigneRepository.save(budgetLigne)
    }

    /**
     * Supprime une ligne de budget (soft delete)
     */
    fun deleteBudgetLigne(id: Long) {
        val budgetLigne = conventionBudgetLigneRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Ligne de budget $id introuvable") }

        budgetLigne.actif = false
        conventionBudgetLigneRepository.save(budgetLigne)
    }
}
