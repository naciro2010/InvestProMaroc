package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.BudgetDTO
import ma.investpro.dto.BudgetStatistiques
import ma.investpro.entity.Budget
import ma.investpro.service.BudgetService
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/budgets")
class BudgetController(private val budgetService: BudgetService) {

    @GetMapping
    @ReadAccess
    fun getAllBudgets(): ResponseEntity<ApiResponse<List<BudgetDTO>>> {
        val budgets = budgetService.findAllDTOs()
        return ResponseEntity.ok(ApiResponse.success(budgets))
    }

    @GetMapping("/{id}")
    @ReadAccess
    fun getBudgetById(@PathVariable id: Long): ResponseEntity<ApiResponse<BudgetDTO>> {
        val budget = budgetService.findByIdDTO(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Budget $id introuvable"))
        return ResponseEntity.ok(ApiResponse.success(budget))
    }

    @PostMapping
    @WriteAccess
    fun createBudget(@Valid @RequestBody budget: Budget): ResponseEntity<ApiResponse<Budget>> {
        val createdBudget = budgetService.create(budget)
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(createdBudget, "Budget créé avec succès"))
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun updateBudget(@PathVariable id: Long, @Valid @RequestBody budget: Budget): ResponseEntity<ApiResponse<Budget>> {
        val updatedBudget = budgetService.update(id, budget)
        return ResponseEntity.ok(ApiResponse.success(updatedBudget, "Budget mis à jour"))
    }

    @DeleteMapping("/{id}")
    @AdminOnly
    fun deleteBudget(@PathVariable id: Long): ResponseEntity<ApiResponse<Nothing>> {
        budgetService.delete(id)
        return ResponseEntity.ok(ApiResponse.ok("Budget supprimé"))
    }

    @PostMapping("/{id}/soumettre")
    @WriteAccess
    fun soumettreBudget(@PathVariable id: Long): ResponseEntity<ApiResponse<Budget>> {
        val budget = budgetService.soumettre(id)
        return ResponseEntity.ok(ApiResponse.success(budget, "Budget soumis"))
    }

    @PostMapping("/{id}/valider")
    @AdminOnly
    fun validerBudget(@PathVariable id: Long, @Valid @RequestBody body: Map<String, Long>): ResponseEntity<ApiResponse<Budget>> {
        val valideParId = body["valideParId"] ?: throw IllegalArgumentException("valideParId requis")
        val budget = budgetService.valider(id, valideParId)
        return ResponseEntity.ok(ApiResponse.success(budget, "Budget validé"))
    }

    @GetMapping("/statistiques")
    @ReadAccess
    fun getStatistiques(): ResponseEntity<ApiResponse<BudgetStatistiques>> {
        val stats = budgetService.getStatistiques()
        return ResponseEntity.ok(ApiResponse.success(stats))
    }
}
