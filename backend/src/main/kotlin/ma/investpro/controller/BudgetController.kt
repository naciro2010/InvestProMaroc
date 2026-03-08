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
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000", "https://naciro2010.github.io"])
class BudgetController(private val budgetService: BudgetService) {

    @GetMapping
    @ReadAccess
    fun getAllBudgets(): ResponseEntity<ApiResponse<List<BudgetDTO>>> {
        logger.info { "GET /api/budgets" }
        val budgets = budgetService.findAllDTOs()
        return ResponseEntity.ok(ApiResponse(
            success = true,
            data = budgets,
            message = "Budgets recuperes avec succes"
        ))
    }

    @GetMapping("/{id}")
    @ReadAccess
    fun getBudgetById(@PathVariable id: Long): ResponseEntity<ApiResponse<BudgetDTO>> {
        logger.info { "GET /api/budgets/$id" }
        return try {
            val budget = budgetService.findByIdDTO(id)
            if (budget != null) {
                ResponseEntity.ok(ApiResponse(
                    success = true,
                    data = budget,
                    message = "Budget recupere avec succes"
                ))
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse(
                    success = false,
                    data = null,
                    message = "Budget $id introuvable"
                ))
            }
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la recuperation du budget: ${e.message}"
            ))
        }
    }

    @PostMapping
    @WriteAccess
    fun createBudget(@Valid @RequestBody budget: Budget): ResponseEntity<ApiResponse<Budget>> {
        logger.info { "POST /api/budgets - Creation budget ${budget.version}" }
        return try {
            val createdBudget = budgetService.create(budget)
            ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse(
                success = true,
                data = createdBudget,
                message = "Budget cree avec succes"
            ))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Validation error: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse(
                success = false,
                data = null,
                message = e.message ?: "Erreur de validation"
            ))
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la creation du budget: ${e.message}"
            ))
        }
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun updateBudget(@PathVariable id: Long, @Valid @RequestBody budget: Budget): ResponseEntity<ApiResponse<Budget>> {
        logger.info { "PUT /api/budgets/$id" }
        return try {
            val updatedBudget = budgetService.update(id, budget)
            ResponseEntity.ok(ApiResponse(
                success = true,
                data = updatedBudget,
                message = "Budget mis a jour avec succes"
            ))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Validation error: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse(
                success = false,
                data = null,
                message = e.message ?: "Erreur de validation"
            ))
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la mise a jour du budget: ${e.message}"
            ))
        }
    }

    @DeleteMapping("/{id}")
    @AdminOnly
    fun deleteBudget(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        logger.info { "DELETE /api/budgets/$id" }
        return try {
            budgetService.delete(id)
            ResponseEntity.ok(ApiResponse(
                success = true,
                data = null,
                message = "Budget supprime avec succes"
            ))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Validation error: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse(
                success = false,
                data = null,
                message = e.message ?: "Erreur de validation"
            ))
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la suppression du budget: ${e.message}"
            ))
        }
    }

    @PostMapping("/{id}/soumettre")
    @WriteAccess
    fun soumettreBudget(@PathVariable id: Long): ResponseEntity<ApiResponse<Budget>> {
        logger.info { "POST /api/budgets/$id/soumettre" }
        return try {
            val budget = budgetService.soumettre(id)
            ResponseEntity.ok(ApiResponse(
                success = true,
                data = budget,
                message = "Budget soumis avec succes"
            ))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Validation error: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse(
                success = false,
                data = null,
                message = e.message ?: "Erreur de validation"
            ))
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la soumission du budget: ${e.message}"
            ))
        }
    }

    @PostMapping("/{id}/valider")
    @AdminOnly
    fun validerBudget(@PathVariable id: Long, @Valid @RequestBody body: Map<String, Long>): ResponseEntity<ApiResponse<Budget>> {
        logger.info { "POST /api/budgets/$id/valider" }
        return try {
            val valideParId = body["valideParId"] ?: throw IllegalArgumentException("valideParId requis")
            val budget = budgetService.valider(id, valideParId)
            ResponseEntity.ok(ApiResponse(
                success = true,
                data = budget,
                message = "Budget valide avec succes"
            ))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Validation error: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse(
                success = false,
                data = null,
                message = e.message ?: "Erreur de validation"
            ))
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la validation du budget: ${e.message}"
            ))
        }
    }

    @GetMapping("/statistiques")
    @ReadAccess
    fun getStatistiques(): ResponseEntity<ApiResponse<BudgetStatistiques>> {
        logger.info { "GET /api/budgets/statistiques" }
        return try {
            val stats = budgetService.getStatistiques()
            ResponseEntity.ok(ApiResponse(
                success = true,
                data = stats,
                message = "Statistiques recuperees avec succes"
            ))
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la recuperation des statistiques: ${e.message}"
            ))
        }
    }
}
