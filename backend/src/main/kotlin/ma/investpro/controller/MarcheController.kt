package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.entity.Marche
import ma.investpro.entity.StatutMarche
import ma.investpro.service.MarcheService
import ma.investpro.mapper.MarcheMapper
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/marches")
@CrossOrigin(origins = ["*"])
class MarcheController(
    private val marcheService: MarcheService,
    private val marcheMapper: MarcheMapper
) {

    /**
     * Optimized list endpoint for frontend list view
     * Returns minimal fields per marche for efficient loading
     * Supports micro-frontends pattern where each component loads only what it needs
     */
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getMarchesStats(): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: GET /api/marches/stats" }
        val stats = marcheService.getMarcheStats()
        return ResponseEntity.ok(stats)
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getAllMarches(): ResponseEntity<ApiResponse<List<MarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches (returns DTOs)" }
        val marches = marcheService.findAll()
        val dtos = marcheMapper.toDTOList(marches)
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    /**
     * ✅ FIXED: Returns DTO instead of Entity
     * Eliminates circular references and provides flattened data
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getMarcheById(@PathVariable id: Long): ResponseEntity<ApiResponse<MarcheDTO>> {
        logger.info { "🌐 API: GET /api/marches/$id (returns DTO)" }
        return try {
            val marche = marcheService.findById(id)
            val dto = marcheMapper.toDTO(marche)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Marché non trouvé"))
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun createMarche(@RequestBody marche: Marche): ResponseEntity<ApiResponse<MarcheDTO>> {
        logger.info { "🌐 API: POST /api/marches - Création marché ${marche.numeroMarche}" }
        return try {
            val createdMarche = marcheService.create(marche)
            val dto = marcheMapper.toDTO(createdMarche)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(dto, "Marché créé avec succès"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest()
                .body(ApiResponse.error(e.message ?: "Erreur de validation"))
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun updateMarche(@PathVariable id: Long, @RequestBody marche: Marche): ResponseEntity<ApiResponse<MarcheDTO>> {
        logger.info { "🌐 API: PUT /api/marches/$id" }
        return try {
            val updatedMarche = marcheService.update(id, marche)
            val dto = marcheMapper.toDTO(updatedMarche)
            ResponseEntity.ok(ApiResponse.success(dto, "Marché mis à jour"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marché non trouvé"))
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteMarche(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        logger.info { "🌐 API: DELETE /api/marches/$id" }
        return try {
            marcheService.delete(id)
            ResponseEntity.ok(ApiResponse.success(Unit, "Marché supprimé"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marché non trouvé"))
        }
    }

    @GetMapping("/fournisseur/{fournisseurId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getMarchesByFournisseur(@PathVariable fournisseurId: Long): ResponseEntity<ApiResponse<List<MarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches/fournisseur/$fournisseurId" }
        val marches = marcheService.findByFournisseur(fournisseurId)
        val dtos = marcheMapper.toDTOList(marches)
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @GetMapping("/convention/{conventionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getMarchesByConvention(@PathVariable conventionId: Long): ResponseEntity<ApiResponse<List<MarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches/convention/$conventionId" }
        val marches = marcheService.findByConvention(conventionId)
        val dtos = marcheMapper.toDTOList(marches)
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getMarchesByProjet(@PathVariable projetId: Long): ResponseEntity<ApiResponse<List<MarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches/projet/$projetId" }
        return try {
            val marches = marcheService.findByProjet(projetId)
            val dtos = marcheMapper.toDTOList(marches)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Projet non trouvé"))
        }
    }

    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getMarchesByStatut(@PathVariable statut: StatutMarche): ResponseEntity<ApiResponse<List<MarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches/statut/$statut" }
        val marches = marcheService.findByStatut(statut)
        val dtos = marcheMapper.toDTOList(marches)
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @GetMapping("/retard")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getMarchesEnRetard(): ResponseEntity<ApiResponse<List<MarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches/retard" }
        val marches = marcheService.findMarchesEnRetard()
        val dtos = marcheMapper.toDTOList(marches)
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    /**
     * ✅ FIXED: Granular endpoint returning DTOs
     * Get line items for a specific marche
     * Called by detail page component to load lignes separately
     * Part of micro-frontends architecture
     */
    @GetMapping("/{id}/lignes")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getMarcheLignes(@PathVariable id: Long): ResponseEntity<ApiResponse<List<MarcheLigneDTO>>> {
        logger.info { "🌐 API: GET /api/marches/$id/lignes (granular: line items only)" }
        return try {
            val lignes = marcheService.findLignesByMarcheId(id)
            val dtos = marcheMapper.toLigneDTOList(lignes)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marché non trouvé"))
        }
    }

    /**
     * ✅ FIXED: Granular endpoint returning DTOs
     * Get amendments for a specific marche
     * Called by detail page component to load avenants separately
     * Part of micro-frontends architecture
     */
    @GetMapping("/{id}/avenants")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getMarcheAvenants(@PathVariable id: Long): ResponseEntity<ApiResponse<List<AvenantMarcheDTO>>> {
        logger.info { "🌐 API: GET /api/marches/$id/avenants (granular: amendments only)" }
        return try {
            val avenants = marcheService.findAvenantsByMarcheId(id)
            val dtos = marcheMapper.toAvenantDTOList(avenants)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marché non trouvé"))
        }
    }

    /**
     * ✅ FIXED: Granular endpoint returning DTOs
     * Get billing statements for a specific marche
     * Called by detail page component to load decomptes separately
     * Part of micro-frontends architecture
     */
    @GetMapping("/{id}/decomptes")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getMarcheDecomptes(@PathVariable id: Long): ResponseEntity<ApiResponse<List<DecompteSimpleDTO>>> {
        logger.info { "🌐 API: GET /api/marches/$id/decomptes (granular: billing statements only)" }
        return try {
            val decomptes = marcheService.findDecomptesByMarcheId(id)
            val dtos = marcheMapper.toDecompteSimpleDTOList(decomptes)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marché non trouvé"))
        }
    }
}
