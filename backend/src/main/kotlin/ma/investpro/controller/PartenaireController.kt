package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.CreatePartenaireDTO
import ma.investpro.dto.PartenaireDTO
import ma.investpro.dto.PartenaireSimpleDTO
import ma.investpro.dto.UpdatePartenaireDTO
import ma.investpro.mapper.PartenaireMapper
import ma.investpro.service.PartenaireService
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import jakarta.validation.Valid
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly

private val logger = KotlinLogging.logger {}

/**
 * REST Controller for Partenaire entity
 * Provides full CRUD endpoints for managing partners
 */
@RestController
@RequestMapping("/api/partenaires")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000", "https://naciro2010.github.io"])
class PartenaireController(
    private val partenaireService: PartenaireService,
    private val partenaireMapper: PartenaireMapper
) {

    /**
     * Get all partenaires
     */
    @GetMapping
    @ReadAccess
    fun getAll(): ResponseEntity<ApiResponse<List<PartenaireDTO>>> {
        logger.info { "API: GET /api/partenaires" }
        return try {
            val partenaires = partenaireService.findAll()
            val dtos: List<PartenaireDTO> = partenaireMapper.toDTOList(partenaires)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: Exception) {
            logger.error { "Error fetching partenaires: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des partenaires"))
        }
    }

    /**
     * Get all active partenaires (for dropdowns)
     */
    @GetMapping("/active")
    @ReadAccess
    fun getAllActive(): ResponseEntity<ApiResponse<List<PartenaireSimpleDTO>>> {
        logger.info { "API: GET /api/partenaires/active" }
        return try {
            val partenaires = partenaireService.findAllActive()
            val dtos: List<PartenaireSimpleDTO> = partenaireMapper.toSimpleDTOList(partenaires)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: Exception) {
            logger.error { "Error fetching active partenaires: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des partenaires actifs"))
        }
    }

    /**
     * Get list of active partenaires (optimized for dropdowns)
     */
    @GetMapping("/list")
    @ReadAccess
    fun getList(): ResponseEntity<ApiResponse<List<PartenaireSimpleDTO>>> {
        logger.info { "API: GET /api/partenaires/list" }
        return try {
            val partenaires = partenaireService.findAllActive()
            val dtos: List<PartenaireSimpleDTO> = partenaireMapper.toSimpleDTOList(partenaires)
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: Exception) {
            logger.error { "Error fetching partenaires list: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération de la liste des partenaires"))
        }
    }

    /**
     * Get partenaire by ID
     */
    @GetMapping("/{id}")
    @ReadAccess
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<PartenaireDTO>> {
        logger.info { "API: GET /api/partenaires/$id" }
        return try {
            val partenaire = partenaireService.findById(id)
            val dto: PartenaireDTO = partenaireMapper.toDTO(partenaire)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Partenaire not found: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Partenaire non trouvé"))
        } catch (e: Exception) {
            logger.error { "Error fetching partenaire: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération du partenaire"))
        }
    }

    /**
     * Create a new partenaire
     */
    @PostMapping
    @WriteAccess
    fun create(@Valid @RequestBody dto: CreatePartenaireDTO): ResponseEntity<ApiResponse<PartenaireDTO>> {
        logger.info { "API: POST /api/partenaires - Creating partenaire: ${dto.code}" }
        return try {
            val partenaire = partenaireMapper.toEntity(dto)
            val saved = partenaireService.save(partenaire)
            val resultDto: PartenaireDTO = partenaireMapper.toDTO(saved)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(resultDto, "Partenaire créé avec succès"))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Validation error creating partenaire: ${e.message}" }
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.message ?: "Erreur de validation"))
        } catch (e: Exception) {
            logger.error { "Error creating partenaire: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la création du partenaire"))
        }
    }

    /**
     * Update an existing partenaire
     */
    @PutMapping("/{id}")
    @WriteAccess
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody dto: UpdatePartenaireDTO
    ): ResponseEntity<ApiResponse<PartenaireDTO>> {
        logger.info { "API: PUT /api/partenaires/$id" }
        return try {
            val existing = partenaireService.findById(id)
            partenaireMapper.updateEntityFromDTO(dto, existing)
            val saved = partenaireService.save(existing)
            val resultDto: PartenaireDTO = partenaireMapper.toDTO(saved)
            ResponseEntity.ok(ApiResponse.success(resultDto, "Partenaire modifié avec succès"))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Partenaire not found: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Partenaire non trouvé"))
        } catch (e: Exception) {
            logger.error { "Error updating partenaire: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la modification du partenaire"))
        }
    }

    /**
     * Delete a partenaire (soft delete)
     */
    @DeleteMapping("/{id}")
    @WriteAccess
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        logger.info { "API: DELETE /api/partenaires/$id" }
        return try {
            val partenaire = partenaireService.findById(id)
            partenaire.actif = false
            partenaireService.save(partenaire)
            ResponseEntity.ok(ApiResponse.success(Unit, "Partenaire supprimé avec succès"))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Partenaire not found: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Partenaire non trouvé"))
        } catch (e: Exception) {
            logger.error { "Error deleting partenaire: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la suppression du partenaire"))
        }
    }
}
