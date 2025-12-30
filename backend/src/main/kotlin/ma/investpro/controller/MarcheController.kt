package ma.investpro.controller

import ma.investpro.entity.Marche
import ma.investpro.entity.StatutMarche
import ma.investpro.service.MarcheService
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/marches")
@CrossOrigin(origins = ["*"])
class MarcheController(private val marcheService: MarcheService) {

    @GetMapping
    fun getAllMarches(): ResponseEntity<List<Marche>> {
        logger.info { "🌐 API: GET /api/marches" }
        val marches = marcheService.findAll()
        return ResponseEntity.ok(marches)
    }

    @GetMapping("/{id}")
    fun getMarcheById(@PathVariable id: Long): ResponseEntity<Marche> {
        logger.info { "🌐 API: GET /api/marches/$id" }
        return try {
            val marche = marcheService.findById(id)
            ResponseEntity.ok(marche)
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun createMarche(@RequestBody marche: Marche): ResponseEntity<Marche> {
        logger.info { "🌐 API: POST /api/marches - Création marché ${marche.numeroMarche}" }
        return try {
            val createdMarche = marcheService.create(marche)
            ResponseEntity.status(HttpStatus.CREATED).body(createdMarche)
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun updateMarche(@PathVariable id: Long, @RequestBody marche: Marche): ResponseEntity<Marche> {
        logger.info { "🌐 API: PUT /api/marches/$id" }
        return try {
            val updatedMarche = marcheService.update(id, marche)
            ResponseEntity.ok(updatedMarche)
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteMarche(@PathVariable id: Long): ResponseEntity<Void> {
        logger.info { "🌐 API: DELETE /api/marches/$id" }
        return try {
            marcheService.delete(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/fournisseur/{fournisseurId}")
    fun getMarchesByFournisseur(@PathVariable fournisseurId: Long): ResponseEntity<List<Marche>> {
        logger.info { "🌐 API: GET /api/marches/fournisseur/$fournisseurId" }
        val marches = marcheService.findByFournisseur(fournisseurId)
        return ResponseEntity.ok(marches)
    }

    @GetMapping("/statut/{statut}")
    fun getMarchesByStatut(@PathVariable statut: StatutMarche): ResponseEntity<List<Marche>> {
        logger.info { "🌐 API: GET /api/marches/statut/$statut" }
        val marches = marcheService.findByStatut(statut)
        return ResponseEntity.ok(marches)
    }

    @GetMapping("/retard")
    fun getMarchesEnRetard(): ResponseEntity<List<Marche>> {
        logger.info { "🌐 API: GET /api/marches/retard" }
        val marches = marcheService.findMarchesEnRetard()
        return ResponseEntity.ok(marches)
    }
}
