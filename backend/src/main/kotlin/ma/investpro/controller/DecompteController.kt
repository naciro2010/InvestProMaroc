package ma.investpro.controller

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

    @GetMapping
    fun getAllDecomptes(): ResponseEntity<List<Decompte>> {
        logger.info { "🌐 API: GET /api/decomptes" }
        val decomptes = decompteService.findAll()
        return ResponseEntity.ok(decomptes)
    }

    @GetMapping("/{id}")
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
    fun getDecomptesByMarche(@PathVariable marcheId: Long): ResponseEntity<List<Decompte>> {
        logger.info { "🌐 API: GET /api/decomptes/marche/$marcheId" }
        val decomptes = decompteService.findByMarche(marcheId)
        return ResponseEntity.ok(decomptes)
    }

}
