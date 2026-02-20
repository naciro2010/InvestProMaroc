package ma.investpro.controller

import ma.investpro.dto.DimensionStatistiques
import ma.investpro.entity.DimensionAnalytique
import ma.investpro.entity.ValeurDimension
import ma.investpro.service.DimensionAnalytiqueService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getAll(): ResponseEntity<List<DimensionAnalytique>> {
        return ResponseEntity.ok(dimensionService.findAll())
    }

    @GetMapping("/actives")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getActives(): ResponseEntity<List<DimensionAnalytique>> {
        return ResponseEntity.ok(dimensionService.findActive())
    }

    @GetMapping("/obligatoires")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getObligatoires(): ResponseEntity<List<DimensionAnalytique>> {
        return ResponseEntity.ok(dimensionService.findObligatoires())
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getById(@PathVariable id: Long): ResponseEntity<DimensionAnalytique> {
        val dimension = dimensionService.findById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(dimension)
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getByCode(@PathVariable code: String): ResponseEntity<DimensionAnalytique> {
        val dimension = dimensionService.findByCode(code)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(dimension)
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun create(@Valid @RequestBody dimension: DimensionAnalytique): ResponseEntity<DimensionAnalytique> {
        return try {
            val created = dimensionService.create(dimension)
            ResponseEntity.status(HttpStatus.CREATED).body(created)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            dimensionService.delete(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/toggle-active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getValeurs(@PathVariable id: Long): ResponseEntity<List<ValeurDimension>> {
        return ResponseEntity.ok(dimensionService.findValeursByDimension(id))
    }

    @GetMapping("/{id}/valeurs/actives")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getValeursActives(@PathVariable id: Long): ResponseEntity<List<ValeurDimension>> {
        return ResponseEntity.ok(dimensionService.findValeursActivesByDimension(id))
    }

    @PostMapping("/{id}/valeurs")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteValeur(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            dimensionService.deleteValeur(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/valeurs/{id}/toggle-active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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
