package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.entity.Decompte
import ma.investpro.service.DecompteService
import ma.investpro.mapper.DecompteMapper
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

private val logger = KotlinLogging.logger {}

data class RejetRequest(val motif: String)

@RestController
@RequestMapping("/api/decomptes")
@CrossOrigin(origins = ["*"])
class DecompteController(
    private val decompteService: DecompteService,
    private val decompteMapper: DecompteMapper
) {

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
    fun getAllDecomptes(): ResponseEntity<ApiResponse<List<DecompteDTO>>> {
        logger.info { "🌐 API: GET /api/decomptes (full list with DTOs)" }
        val decomptes = decompteService.findAll()
        val dtos = decomptes.map { decompteMapper.toDTO(it) }
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    /**
     * ✅ FIXED: Returns DecompteDTO instead of Entity
     * Eliminates circular references and provides flattened data
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getDecompteById(@PathVariable id: Long): ResponseEntity<ApiResponse<DecompteDTO>> {
        logger.info { "🌐 API: GET /api/decomptes/$id (returns DTO)" }
        return try {
            val decompte = decompteService.findById(id)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Décompte non trouvé"))
            val dto = decompteMapper.toDTO(decompte)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération du décompte"))
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun createDecompte(@RequestBody decompte: Decompte): ResponseEntity<ApiResponse<DecompteDTO>> {
        logger.info { "🌐 API: POST /api/decomptes - Création décompte ${decompte.numeroDecompte}" }
        return try {
            val createdDecompte = decompteService.create(decompte)
            val dto = decompteMapper.toDTO(createdDecompte)
            ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(dto, "Décompte créé avec succès"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur de validation"))
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun updateDecompte(@PathVariable id: Long, @RequestBody decompte: Decompte): ResponseEntity<ApiResponse<DecompteDTO>> {
        logger.info { "🌐 API: PUT /api/decomptes/$id" }
        return try {
            val updatedDecompte = decompteService.update(id, decompte)
            val dto = decompteMapper.toDTO(updatedDecompte)
            ResponseEntity.ok(ApiResponse.success(dto, "Décompte mis à jour"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.message ?: "Décompte non trouvé"))
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteDecompte(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        logger.info { "🌐 API: DELETE /api/decomptes/$id" }
        return try {
            decompteService.delete(id)
            ResponseEntity.ok(ApiResponse.success(Unit, "Décompte supprimé"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.message ?: "Décompte non trouvé"))
        }
    }

    @GetMapping("/marche/{marcheId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getDecomptesByMarche(@PathVariable marcheId: Long): ResponseEntity<ApiResponse<List<DecompteDTO>>> {
        logger.info { "🌐 API: GET /api/decomptes/marche/$marcheId" }
        val decomptes = decompteService.findByMarche(marcheId)
        val dtos = decomptes.map { decompteMapper.toDTO(it) }
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    /**
     * ✅ FIXED: Granular endpoint converting entities to DTOs
     * Get retentions for a specific decompte
     * Called by detail page component to load retentions separately
     * Part of micro-frontends architecture
     */
    @GetMapping("/{id}/retenues")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getDecompteRetenues(@PathVariable id: Long): ResponseEntity<ApiResponse<List<DecompteRetenueDTO>>> {
        logger.info { "🌐 API: GET /api/decomptes/$id/retenues (granular: retentions only)" }
        return try {
            val retenues = decompteService.findRetenuesByDecompteId(id)
            val dtos = retenues.map { decompteMapper.toRetenueDTO(it) }
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.message ?: "Décompte non trouvé"))
        }
    }

    /**
     * ✅ FIXED: Granular endpoint converting entities to DTOs
     * Get imputations for a specific decompte
     * Called by detail page component to load allocations separately
     * Part of micro-frontends architecture
     */
    @GetMapping("/{id}/imputations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getDecompteImputations(@PathVariable id: Long): ResponseEntity<ApiResponse<List<DecompteImputationDTO>>> {
        logger.info { "🌐 API: GET /api/decomptes/$id/imputations (granular: allocations only)" }
        return try {
            val imputations = decompteService.findImputationsByDecompteId(id)
            val dtos = imputations.map { decompteMapper.toImputationDTO(it) }
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.message ?: "Décompte non trouvé"))
        }
    }

    /**
     * ✅ NEW: Workflow endpoint - Valider un décompte
     * Changes status from SOUMIS to VALIDE
     */
    @PostMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun validerDecompte(
        @PathVariable id: Long,
        @org.springframework.security.core.annotation.AuthenticationPrincipal userDetails: org.springframework.security.core.userdetails.UserDetails
    ): ResponseEntity<ApiResponse<DecompteDTO>> {
        logger.info { "🌐 API: POST /api/decomptes/$id/valider - Validation du décompte par ${userDetails.username}" }
        return try {
            // Get user ID from username (assuming username is the ID or you have a User service)
            // For now, using a placeholder - this should be improved with proper User lookup
            val userId = 1L // TODO: Get from UserService based on userDetails.username
            val decompte = decompteService.valider(id, userId)
            val dto = decompteMapper.toDTO(decompte)
            ResponseEntity.ok(ApiResponse.success(dto, "Décompte validé avec succès"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Impossible de valider le décompte"))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la validation"))
        }
    }

    /**
     * ✅ NEW: Workflow endpoint - Rejeter un décompte
     * Changes status from SOUMIS to REJETE
     * Note: motif is logged but not currently stored in entity (can be improved)
     */
    @PostMapping("/{id}/rejeter")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun rejeterDecompte(
        @PathVariable id: Long,
        @RequestBody request: RejetRequest
    ): ResponseEntity<ApiResponse<DecompteDTO>> {
        logger.info { "🌐 API: POST /api/decomptes/$id/rejeter - Rejet du décompte: ${request.motif}" }
        return try {
            val decompte = decompteService.rejeter(id)
            val dto = decompteMapper.toDTO(decompte)
            ResponseEntity.ok(ApiResponse.success(dto, "Décompte rejeté"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Impossible de rejeter le décompte"))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors du rejet"))
        }
    }

    /**
     * ✅ NEW: Workflow endpoint - Soumettre un décompte
     * Changes status from BROUILLON to SOUMIS
     */
    @PostMapping("/{id}/soumettre")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun soumettreDecompte(@PathVariable id: Long): ResponseEntity<ApiResponse<DecompteDTO>> {
        logger.info { "🌐 API: POST /api/decomptes/$id/soumettre - Soumission du décompte" }
        return try {
            val decompte = decompteService.soumettre(id)
            val dto = decompteMapper.toDTO(decompte)
            ResponseEntity.ok(ApiResponse.success(dto, "Décompte soumis pour validation"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Impossible de soumettre le décompte"))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la soumission"))
        }
    }
}
