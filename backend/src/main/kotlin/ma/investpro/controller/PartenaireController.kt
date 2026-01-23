package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.PartenaireDTO
import ma.investpro.dto.PartenaireSimpleDTO
import ma.investpro.mapper.PartenaireMapper
import ma.investpro.service.PartenaireService
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

/**
 * REST Controller for Partenaire entity
 * Provides read-only endpoints for accessing partners
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
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
     * Get partenaire by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
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
}
