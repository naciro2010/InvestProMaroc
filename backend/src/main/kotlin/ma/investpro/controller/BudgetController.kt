package ma.investpro.controller

import ma.investpro.entity.Budget
import ma.investpro.service.BudgetService
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000", "https://naciro2010.github.io"])
class BudgetController(private val budgetService: BudgetService) {

    @GetMapping
    fun getAllBudgets(): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: GET /api/budgets" }
        val budgets = budgetService.findAll()
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "data" to budgets,
            "message" to "Budgets récupérés avec succès"
        ))
    }

    @GetMapping("/{id}")
    fun getBudgetById(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: GET /api/budgets/$id" }
        return try {
            val budget = budgetService.findById(id)
            if (budget != null) {
                ResponseEntity.ok(mapOf(
                    "success" to true,
                    "data" to budget,
                    "message" to "Budget récupéré avec succès"
                ))
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf(
                    "success" to false,
                    "message" to "Budget $id introuvable"
                ))
            }
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la récupération du budget: ${e.message}"
            ))
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun createBudget(@RequestBody budget: Budget): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: POST /api/budgets - Création budget ${budget.version}" }
        return try {
            val createdBudget = budgetService.create(budget)
            ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
                "success" to true,
                "data" to createdBudget,
                "message" to "Budget créé avec succès"
            ))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to e.message
            ))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la création du budget: ${e.message}"
            ))
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun updateBudget(@PathVariable id: Long, @RequestBody budget: Budget): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: PUT /api/budgets/$id" }
        return try {
            val updatedBudget = budgetService.update(id, budget)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to updatedBudget,
                "message" to "Budget mis à jour avec succès"
            ))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to e.message
            ))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la mise à jour du budget: ${e.message}"
            ))
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteBudget(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: DELETE /api/budgets/$id" }
        return try {
            budgetService.delete(id)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Budget supprimé avec succès"
            ))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to e.message
            ))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la suppression du budget: ${e.message}"
            ))
        }
    }

    @PostMapping("/{id}/soumettre")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun soumettreBudget(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: POST /api/budgets/$id/soumettre" }
        return try {
            val budget = budgetService.soumettre(id)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to budget,
                "message" to "Budget soumis avec succès"
            ))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to e.message
            ))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la soumission du budget: ${e.message}"
            ))
        }
    }

    @PostMapping("/{id}/valider")
    @PreAuthorize("hasRole('ADMIN')")
    fun validerBudget(@PathVariable id: Long, @RequestBody body: Map<String, Long>): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: POST /api/budgets/$id/valider" }
        return try {
            val valideParId = body["valideParId"] ?: throw IllegalArgumentException("valideParId requis")
            val budget = budgetService.valider(id, valideParId)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to budget,
                "message" to "Budget validé avec succès"
            ))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to e.message
            ))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la validation du budget: ${e.message}"
            ))
        }
    }

    @GetMapping("/statistiques")
    fun getStatistiques(): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: GET /api/budgets/statistiques" }
        return try {
            val stats = budgetService.getStatistiques()
            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to stats,
                "message" to "Statistiques récupérées avec succès"
            ))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la récupération des statistiques: ${e.message}"
            ))
        }
    }
}
