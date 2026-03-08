package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.dto.convention.*
import ma.investpro.mapper.ConventionMicroMapper
import ma.investpro.service.ConventionService
import ma.investpro.security.annotations.ReadAccess
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * Micro-endpoints pour chargement progressif des conventions.
 * Chaque endpoint retourne un sous-ensemble ciblé (5-15 KB).
 */
@RestController
@RequestMapping("/api/conventions")
class ConventionMicroController(
    private val conventionService: ConventionService,
    private val conventionMicroMapper: ConventionMicroMapper
) {

    @GetMapping("/{id}/basic")
    @ReadAccess
    fun getBasicInfo(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionBasicDTO>> {
        return try {
            val convention = conventionService.findById(id)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Convention non trouvée"))
            val dto = conventionMicroMapper.toBasicDTO(convention)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des informations de base"))
        }
    }

    @GetMapping("/{id}/finances")
    @ReadAccess
    fun getFinancesInfo(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionFinancesDTO>> {
        return try {
            val convention = conventionService.findById(id)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Convention non trouvée"))
            val dto = conventionMicroMapper.toFinancesDTO(convention)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des informations financières"))
        }
    }

    @GetMapping("/{id}/dates")
    @ReadAccess
    fun getDatesInfo(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionDatesDTO>> {
        return try {
            val convention = conventionService.findById(id)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Convention non trouvée"))
            val dto = conventionMicroMapper.toDatesDTO(convention)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des dates"))
        }
    }

    @GetMapping("/{id}/stats")
    @ReadAccess
    fun getStats(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionStatsDTO>> {
        return try {
            val convention = conventionService.findById(id)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Convention non trouvée"))
            val dto = conventionMicroMapper.toStatsDTO(convention)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des statistiques"))
        }
    }

    @GetMapping("/{id}/detail-enriched")
    @ReadAccess
    fun getDetailEnriched(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionDetailEnrichedDTO>> {
        return try {
            val convention = conventionService.findById(id)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Convention non trouvée"))
            val dto = conventionMicroMapper.toDetailEnrichedDTO(convention)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des données enrichies"))
        }
    }
}
