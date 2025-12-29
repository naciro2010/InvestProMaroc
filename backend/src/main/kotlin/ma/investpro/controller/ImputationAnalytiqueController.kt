package ma.investpro.controller

import ma.investpro.entity.ImputationAnalytique
import ma.investpro.entity.TypeImputation
import ma.investpro.service.ImputationAnalytiqueService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

/**
 * Controller ImputationAnalytique - Gestion des imputations analytiques
 * Approche REST simple
 */
@RestController
@RequestMapping("/api/imputations")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000"])
class ImputationAnalytiqueController(
    private val imputationService: ImputationAnalytiqueService
) {

    // ========== CRUD Imputations ==========

    @GetMapping
    fun getAll(
        @RequestParam(required = false) type: TypeImputation?,
        @RequestParam(required = false) referenceId: Long?
    ): ResponseEntity<List<ImputationAnalytique>> {
        val imputations = when {
            type != null && referenceId != null ->
                imputationService.findByReference(type, referenceId)
            else -> imputationService.findAll()
        }
        return ResponseEntity.ok(imputations)
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<ImputationAnalytique> {
        val imputation = imputationService.findById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(imputation)
    }

    @PostMapping
    fun create(@RequestBody imputation: ImputationAnalytique): ResponseEntity<ImputationAnalytique> {
        return try {
            val created = imputationService.create(imputation)
            ResponseEntity.status(HttpStatus.CREATED).body(created)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @RequestBody imputation: ImputationAnalytique
    ): ResponseEntity<ImputationAnalytique> {
        return try {
            val updated = imputationService.update(id, imputation)
            ResponseEntity.ok(updated)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            imputationService.delete(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    // ========== Validation ==========

    @GetMapping("/validate-total")
    fun validateTotal(
        @RequestParam type: TypeImputation,
        @RequestParam referenceId: Long,
        @RequestParam montantAttendu: BigDecimal
    ): ResponseEntity<Map<String, Any>> {
        val isValid = imputationService.validateTotal(type, referenceId, montantAttendu)
        val totalImpute = imputationService.getTotalImpute(type, referenceId)

        return ResponseEntity.ok(
            mapOf(
                "isValid" to isValid,
                "montantAttendu" to montantAttendu,
                "totalImpute" to totalImpute,
                "difference" to (montantAttendu - totalImpute)
            )
        )
    }

    @GetMapping("/total")
    fun getTotal(
        @RequestParam type: TypeImputation,
        @RequestParam referenceId: Long
    ): ResponseEntity<Map<String, BigDecimal>> {
        val total = imputationService.getTotalImpute(type, referenceId)
        return ResponseEntity.ok(mapOf("total" to total))
    }

    // ========== Reporting et Agrégations ==========

    @GetMapping("/reporting/by-dimension")
    fun aggregateByDimension(
        @RequestParam type: TypeImputation,
        @RequestParam dimension: String
    ): ResponseEntity<Map<String, BigDecimal>> {
        val aggregation = imputationService.aggregateByDimension(type, dimension)
        return ResponseEntity.ok(aggregation)
    }

    @GetMapping("/reporting/by-two-dimensions")
    fun aggregateByTwoDimensions(
        @RequestParam type: TypeImputation,
        @RequestParam dimension1: String,
        @RequestParam dimension2: String
    ): ResponseEntity<Map<String, Any>> {
        val aggregation = imputationService.aggregateByTwoDimensions(type, dimension1, dimension2)

        // Transformer en format plus exploitable pour le frontend
        val result = aggregation.map { (key, value) ->
            mapOf(
                "dimension1" to key.first,
                "dimension2" to key.second,
                "montant" to value
            )
        }

        return ResponseEntity.ok(
            mapOf(
                "dimension1" to dimension1,
                "dimension2" to dimension2,
                "data" to result
            )
        )
    }

    // ========== Statistiques ==========

    @GetMapping("/statistiques")
    fun getStatistiques(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(imputationService.getStatistiques())
    }
}
