package ma.investpro.controller

import ma.investpro.dto.DimensionStatistiques
import ma.investpro.entity.DimensionAnalytique
import ma.investpro.entity.ValeurDimension
import ma.investpro.service.DimensionAnalytiqueService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly

/**
 * Controller DimensionAnalytique - Gestion des dimensions analytiques
 * Approche REST simple
 */
@RestController
@RequestMapping("/api/dimensions")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000"])
class DimensionAnalytiqueController(
    private val dimensionService: DimensionAnalytiqueService
) {

    // ========== CRUD Dimensions ==========

    @GetMapping
    @ReadAccess
    fun getAll(): ResponseEntity<List<DimensionAnalytique>> {
        return ResponseEntity.ok(dimensionService.findAll())
    }

    @GetMapping("/actives")
    @ReadAccess
    fun getActives(): ResponseEntity<List<DimensionAnalytique>> {
        return ResponseEntity.ok(dimensionService.findActive())
    }

    @GetMapping("/obligatoires")
    @ReadAccess
    fun getObligatoires(): ResponseEntity<List<DimensionAnalytique>> {
        return ResponseEntity.ok(dimensionService.findObligatoires())
    }

    @GetMapping("/{id}")
    @ReadAccess
    fun getById(@PathVariable id: Long): ResponseEntity<DimensionAnalytique> {
        val dimension = dimensionService.findById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(dimension)
    }

    @GetMapping("/code/{code}")
    @ReadAccess
    fun getByCode(@PathVariable code: String): ResponseEntity<DimensionAnalytique> {
        val dimension = dimensionService.findByCode(code)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(dimension)
    }

    @PostMapping
    @WriteAccess
    fun create(@Valid @RequestBody dimension: DimensionAnalytique): ResponseEntity<DimensionAnalytique> {
        return try {
            val created = dimensionService.create(dimension)
            ResponseEntity.status(HttpStatus.CREATED).body(created)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody dimension: DimensionAnalytique
    ): ResponseEntity<DimensionAnalytique> {
        return try {
            val updated = dimensionService.update(id, dimension)
            ResponseEntity.ok(updated)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{id}")
    @AdminOnly
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            dimensionService.delete(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/toggle-active")
    @WriteAccess
    fun toggleActive(@PathVariable id: Long): ResponseEntity<DimensionAnalytique> {
        return try {
            val dimension = dimensionService.toggleActive(id)
            ResponseEntity.ok(dimension)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    // ========== CRUD Valeurs ==========

    @GetMapping("/{id}/valeurs")
    @ReadAccess
    fun getValeurs(@PathVariable id: Long): ResponseEntity<List<ValeurDimension>> {
        return ResponseEntity.ok(dimensionService.findValeursByDimension(id))
    }

    @GetMapping("/{id}/valeurs/actives")
    @ReadAccess
    fun getValeursActives(@PathVariable id: Long): ResponseEntity<List<ValeurDimension>> {
        return ResponseEntity.ok(dimensionService.findValeursActivesByDimension(id))
    }

    @PostMapping("/{id}/valeurs")
    @WriteAccess
    fun createValeur(
        @PathVariable id: Long,
        @Valid @RequestBody valeur: ValeurDimension
    ): ResponseEntity<ValeurDimension> {
        return try {
            val created = dimensionService.createValeur(id, valeur)
            ResponseEntity.status(HttpStatus.CREATED).body(created)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/valeurs/{id}")
    @WriteAccess
    fun updateValeur(
        @PathVariable id: Long,
        @Valid @RequestBody valeur: ValeurDimension
    ): ResponseEntity<ValeurDimension> {
        return try {
            val updated = dimensionService.updateValeur(id, valeur)
            ResponseEntity.ok(updated)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/valeurs/{id}")
    @AdminOnly
    fun deleteValeur(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            dimensionService.deleteValeur(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/valeurs/{id}/toggle-active")
    @WriteAccess
    fun toggleValeurActive(@PathVariable id: Long): ResponseEntity<ValeurDimension> {
        return try {
            val valeur = dimensionService.toggleValeurActive(id)
            ResponseEntity.ok(valeur)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    // ========== Statistiques ==========

    @GetMapping("/statistiques")
    fun getStatistiques(): ResponseEntity<DimensionStatistiques> {
        return ResponseEntity.ok(dimensionService.getStatistiques())
    }
}
