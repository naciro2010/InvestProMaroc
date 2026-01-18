package ma.investpro.controller

import ma.investpro.dto.MarcheListDTO
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

    /**
     * Optimized list endpoint for frontend list view
     * Returns minimal fields per marche for efficient loading
     * Supports micro-frontends pattern where each component loads only what it needs
     */
    @GetMapping("/list")
    fun getMarchesList(): ResponseEntity<List<MarcheListDTO>> {
        logger.info { "🌐 API: GET /api/marches/list (optimized for list view)" }
        val marches = marcheService.findAllForListView()
        return ResponseEntity.ok(marches)
    }

    /**
     * Statistics endpoint for dashboard/summary
     * Returns counts and aggregations without loading full entities
     */
    @GetMapping("/stats")
    fun getMarchesStats(): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: GET /api/marches/stats" }
        val stats = marcheService.getMarcheStats()
        return ResponseEntity.ok(stats)
    }

    @GetMapping
    fun getAllMarches(): ResponseEntity<List<Marche>> {
        logger.info { "🌐 API: GET /api/marches (full list with all relations)" }
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

    @GetMapping("/convention/{conventionId}")
    fun getMarchesByConvention(@PathVariable conventionId: Long): ResponseEntity<List<Marche>> {
        logger.info { "🌐 API: GET /api/marches/convention/$conventionId" }
        val marches = marcheService.findByConvention(conventionId)
        return ResponseEntity.ok(marches)
    }

    @GetMapping("/projet/{projetId}")
    fun getMarchesByProjet(@PathVariable projetId: Long): ResponseEntity<List<Marche>> {
        logger.info { "🌐 API: GET /api/marches/projet/$projetId" }
        return try {
            val marches = marcheService.findByProjet(projetId)
            ResponseEntity.ok(marches)
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.notFound().build()
        }
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

    /**
     * Granular endpoint: Get line items for a specific marche
     * Called by detail page component to load lignes separately
     * Part of micro-frontends architecture
     */
    @GetMapping("/{id}/lignes")
    fun getMarcheLignes(@PathVariable id: Long): ResponseEntity<List<Any>> {
        logger.info { "🌐 API: GET /api/marches/$id/lignes (granular: line items only)" }
        return try {
            val lignes = marcheService.findLignesByMarcheId(id)
            ResponseEntity.ok(lignes)
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Granular endpoint: Get amendments for a specific marche
     * Called by detail page component to load avenants separately
     * Part of micro-frontends architecture
     */
    @GetMapping("/{id}/avenants")
    fun getMarcheAvenants(@PathVariable id: Long): ResponseEntity<List<Any>> {
        logger.info { "🌐 API: GET /api/marches/$id/avenants (granular: amendments only)" }
        return try {
            val avenants = marcheService.findAvenantsByMarcheId(id)
            ResponseEntity.ok(avenants)
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Granular endpoint: Get billing statements for a specific marche
     * Called by detail page component to load decomptes separately
     * Part of micro-frontends architecture
     */
    @GetMapping("/{id}/decomptes")
    fun getMarcheDecomptes(@PathVariable id: Long): ResponseEntity<List<Any>> {
        logger.info { "🌐 API: GET /api/marches/$id/decomptes (granular: billing statements only)" }
        return try {
            val decomptes = marcheService.findDecomptesByMarcheId(id)
            ResponseEntity.ok(decomptes)
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.notFound().build()
        }
    }
}
