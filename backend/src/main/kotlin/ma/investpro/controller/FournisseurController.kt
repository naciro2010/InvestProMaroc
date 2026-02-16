package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.CreateFournisseurDTO
import ma.investpro.dto.FournisseurDTO
import ma.investpro.dto.FournisseurSimpleDTO
import ma.investpro.dto.UpdateFournisseurDTO
import ma.investpro.mapper.FournisseurMapper
import ma.investpro.service.FournisseurService
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import jakarta.validation.Valid

private val logger = KotlinLogging.logger {}

/**
 * REST Controller for Fournisseur entity
 * Provides full CRUD endpoints for managing suppliers
 */
@RestController
@RequestMapping("/api/fournisseurs")
class FournisseurController(
    private val fournisseurService: FournisseurService,
    private val fournisseurMapper: FournisseurMapper
) {

    /**
     * Get all fournisseurs
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getAll(): ResponseEntity<ApiResponse<List<FournisseurDTO>>> {
        logger.info { "API: GET /api/fournisseurs" }
        return try {
            val fournisseurs = fournisseurService.findAll()
            val dtos: List<FournisseurDTO> = fournisseurMapper.toDTOList(fournisseurs)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: Exception) {
            logger.error { "Error fetching fournisseurs: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des fournisseurs"))
        }
    }

    /**
     * Get all active fournisseurs (for dropdowns)
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getAllActive(): ResponseEntity<ApiResponse<List<FournisseurSimpleDTO>>> {
        logger.info { "API: GET /api/fournisseurs/active" }
        return try {
            val fournisseurs = fournisseurService.findAllActive()
            val dtos: List<FournisseurSimpleDTO> = fournisseurMapper.toSimpleDTOList(fournisseurs)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: Exception) {
            logger.error { "Error fetching active fournisseurs: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des fournisseurs actifs"))
        }
    }

    /**
     * Search fournisseurs by raison sociale
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun search(@RequestParam q: String): ResponseEntity<ApiResponse<List<FournisseurSimpleDTO>>> {
        logger.info { "API: GET /api/fournisseurs/search?q=$q" }
        return try {
            val fournisseurs = fournisseurService.search(q)
            val dtos: List<FournisseurSimpleDTO> = fournisseurMapper.toSimpleDTOList(fournisseurs)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: Exception) {
            logger.error { "Error searching fournisseurs: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la recherche des fournisseurs"))
        }
    }

    /**
     * Get fournisseur by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<FournisseurDTO>> {
        logger.info { "API: GET /api/fournisseurs/$id" }
        return try {
            val fournisseur = fournisseurService.findById(id)
            val dto: FournisseurDTO = fournisseurMapper.toDTO(fournisseur)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Fournisseur not found: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Fournisseur non trouvé"))
        } catch (e: Exception) {
            logger.error { "Error fetching fournisseur: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération du fournisseur"))
        }
    }

    /**
     * Create a new fournisseur
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun create(@Valid @RequestBody dto: CreateFournisseurDTO): ResponseEntity<ApiResponse<FournisseurDTO>> {
        logger.info { "API: POST /api/fournisseurs - Creating fournisseur: ${dto.code}" }
        return try {
            val fournisseur = fournisseurMapper.toEntity(dto)
            val saved = fournisseurService.save(fournisseur)
            val resultDto: FournisseurDTO = fournisseurMapper.toDTO(saved)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(resultDto, "Fournisseur créé avec succès"))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Validation error creating fournisseur: ${e.message}" }
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.message ?: "Erreur de validation"))
        } catch (e: Exception) {
            logger.error { "Error creating fournisseur: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la création du fournisseur"))
        }
    }

    /**
     * Update an existing fournisseur
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody dto: UpdateFournisseurDTO
    ): ResponseEntity<ApiResponse<FournisseurDTO>> {
        logger.info { "API: PUT /api/fournisseurs/$id" }
        return try {
            val existing = fournisseurService.findById(id)
            fournisseurMapper.updateEntityFromDTO(dto, existing)
            val saved = fournisseurService.save(existing)
            val resultDto: FournisseurDTO = fournisseurMapper.toDTO(saved)
            ResponseEntity.ok(ApiResponse.success(resultDto, "Fournisseur modifié avec succès"))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Fournisseur not found: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Fournisseur non trouvé"))
        } catch (e: Exception) {
            logger.error { "Error updating fournisseur: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la modification du fournisseur"))
        }
    }

    /**
     * Delete a fournisseur (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        logger.info { "API: DELETE /api/fournisseurs/$id" }
        return try {
            val fournisseur = fournisseurService.findById(id)
            fournisseur.actif = false
            fournisseurService.save(fournisseur)
            ResponseEntity.ok(ApiResponse.success(Unit, "Fournisseur supprimé avec succès"))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Fournisseur not found: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Fournisseur non trouvé"))
        } catch (e: Exception) {
            logger.error { "Error deleting fournisseur: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la suppression du fournisseur"))
        }
    }
}
