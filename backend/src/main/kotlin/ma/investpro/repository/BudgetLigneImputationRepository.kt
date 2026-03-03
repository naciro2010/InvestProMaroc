package ma.investpro.repository

import ma.investpro.entity.BudgetLigneImputation
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface BudgetLigneImputationRepository : JpaRepository<BudgetLigneImputation, Long> {

    fun findByBudgetLigneIdAndActifTrue(budgetLigneId: Long): List<BudgetLigneImputation>

    fun findByBudgetLigneId(budgetLigneId: Long): List<BudgetLigneImputation>

    fun existsByBudgetLigneIdAndProjetCode(budgetLigneId: Long, projetCode: String): Boolean

    fun existsByBudgetLigneIdAndProjetCodeAndTypeImputation(
        budgetLigneId: Long, projetCode: String, typeImputation: String
    ): Boolean

    fun findByBudgetLigneIdAndProjetCode(budgetLigneId: Long, projetCode: String): BudgetLigneImputation?

    fun findByBudgetLigneIdIn(budgetLigneIds: List<Long>): List<BudgetLigneImputation>

    fun findByBudgetLigneIdInAndActifTrue(budgetLigneIds: List<Long>): List<BudgetLigneImputation>

    fun findByBudgetLigneIdAndTypeImputationAndActifTrue(
        budgetLigneId: Long, typeImputation: String
    ): List<BudgetLigneImputation>
}
