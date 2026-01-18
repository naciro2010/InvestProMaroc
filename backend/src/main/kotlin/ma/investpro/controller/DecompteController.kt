package ma.investpro.controller

import ma.investpro.dto.DecompteListDTO
import ma.investpro.entity.Decompte
import ma.investpro.service.DecompteService
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/decomptes")
@CrossOrigin(origins = ["*"])
class DecompteController(private val decompteService: DecompteService) {

    /**
     * Optimized list endpoint for frontend list view
     * Returns minimal fields per decompte for efficient loading
     * Supports micro-frontends pattern where each component loads only what it needs
     */
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getDecomptesList(): ResponseEntity<List<DecompteListDTO>> {
        logger.info { "🌐 API: GET /api/decomptes/list (optimized for list view)" }
        val decomptes = decompteService.findAllForListView()
        return ResponseEntity.ok(decomptes)
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getAllDecomptes(): ResponseEntity<List<Decompte>> {
        logger.info { "🌐 API: GET /api/decomptes (full list with all relations)" }
        val decomptes = decompteService.findAll()
        return ResponseEntity.ok(decomptes)
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getDecompteById(@PathVariable id: Long): ResponseEntity<Decompte> {
        logger.info { "🌐 API: GET /api/decomptes/$id" }
        return try {
            val decompte = decompteService.findById(id)
            ResponseEntity.ok(decompte)
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun createDecompte(@RequestBody decompte: Decompte): ResponseEntity<Decompte> {
        logger.info { "🌐 API: POST /api/decomptes - Création décompte ${decompte.numeroDecompte}" }
        return try {
            val createdDecompte = decompteService.create(decompte)
            ResponseEntity.status(HttpStatus.CREATED).body(createdDecompte)
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun updateDecompte(@PathVariable id: Long, @RequestBody decompte: Decompte): ResponseEntity<Decompte> {
        logger.info { "🌐 API: PUT /api/decomptes/$id" }
        return try {
            val updatedDecompte = decompteService.update(id, decompte)
            ResponseEntity.ok(updatedDecompte)
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteDecompte(@PathVariable id: Long): ResponseEntity<Void> {
        logger.info { "🌐 API: DELETE /api/decomptes/$id" }
        return try {
            decompteService.delete(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/marche/{marcheId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getDecomptesByMarche(@PathVariable marcheId: Long): ResponseEntity<List<Decompte>> {
        logger.info { "🌐 API: GET /api/decomptes/marche/$marcheId" }
        val decomptes = decompteService.findByMarche(marcheId)
        return ResponseEntity.ok(decomptes)
    }

    /**
     * Granular endpoint: Get retentions for a specific decompte
     * Called by detail page component to load retentions separately
     * Part of micro-frontends architecture
     */
    @GetMapping("/{id}/retenues")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getDecompteRetenues(@PathVariable id: Long): ResponseEntity<List<Any>> {
        logger.info { "🌐 API: GET /api/decomptes/$id/retenues (granular: retentions only)" }
        return try {
            val retenues = decompteService.findRetenuesByDecompteId(id)
            ResponseEntity.ok(retenues)
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Granular endpoint: Get imputations for a specific decompte
     * Called by detail page component to load allocations separately
     * Part of micro-frontends architecture
     */
    @GetMapping("/{id}/imputations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getDecompteImputations(@PathVariable id: Long): ResponseEntity<List<Any>> {
        logger.info { "🌐 API: GET /api/decomptes/$id/imputations (granular: allocations only)" }
        return try {
            val imputations = decompteService.findImputationsByDecompteId(id)
            ResponseEntity.ok(imputations)
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.notFound().build()
        }
    }

}
