package ma.investpro.controller

import jakarta.validation.Valid
import ma.investpro.dto.ApiResponse
import ma.investpro.dto.SubventionDTO
import ma.investpro.dto.SubventionRequest
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.service.SubventionService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/subventions")
class SubventionController(
    private val subventionService: SubventionService
) {

    @GetMapping
    @ReadAccess
    fun getAll(@RequestParam(required = false) conventionId: Long?): ResponseEntity<ApiResponse<List<SubventionDTO>>> {
        val subventions = if (conventionId != null) {
            subventionService.findByConventionId(conventionId)
        } else {
            subventionService.findAll()
        }
        return ResponseEntity.ok(ApiResponse.success(subventions))
    }

    @GetMapping("/{id}")
    @ReadAccess
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<SubventionDTO>> {
        val subvention = subventionService.findById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Subvention non trouvée"))
        return ResponseEntity.ok(ApiResponse.success(subvention))
    }

    @PostMapping
    @WriteAccess
    fun create(@Valid @RequestBody request: SubventionRequest): ResponseEntity<ApiResponse<SubventionDTO>> {
        return try {
            val created = subventionService.create(request)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Subvention créée avec succès"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest()
                .body(ApiResponse.error(e.message ?: "Erreur lors de la création"))
        }
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody request: SubventionRequest
    ): ResponseEntity<ApiResponse<SubventionDTO>> {
        return try {
            val updated = subventionService.update(id, request)
            ResponseEntity.ok(ApiResponse.success(updated, "Subvention mise à jour"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest()
                .body(ApiResponse.error(e.message ?: "Erreur lors de la mise à jour"))
        }
    }

    @DeleteMapping("/{id}")
    @WriteAccess
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        return try {
            subventionService.delete(id)
            ResponseEntity.ok(ApiResponse.success(Unit, "Subvention supprimée"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest()
                .body(ApiResponse.error(e.message ?: "Erreur lors de la suppression"))
        }
    }

    @GetMapping("/count")
    @ReadAccess
    fun countByConvention(@RequestParam conventionId: Long): ResponseEntity<ApiResponse<Long>> {
        val count = subventionService.countByConventionId(conventionId)
        return ResponseEntity.ok(ApiResponse.success(count))
    }
}
