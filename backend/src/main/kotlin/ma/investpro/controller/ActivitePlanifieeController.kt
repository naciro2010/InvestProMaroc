package ma.investpro.controller

import jakarta.validation.Valid
import ma.investpro.dto.ActivitePlanifieeResponse
import ma.investpro.dto.ApiResponse
import ma.investpro.dto.CreateActivitePlanifieeRequest
import ma.investpro.dto.UpdateActivitePlanifieeRequest
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.service.ActivitePlanifieeService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/conventions/{conventionId}/activites")
class ActivitePlanifieeController(
    private val activitePlanifieeService: ActivitePlanifieeService,
) {

    @GetMapping
    @ReadAccess
    fun getByConvention(
        @PathVariable conventionId: Long,
    ): ResponseEntity<ApiResponse<List<ActivitePlanifieeResponse>>> = ResponseEntity.ok(
        ApiResponse.success(
            activitePlanifieeService.getByConvention(conventionId),
            "Activités récupérées"
        )
    )

    @PostMapping
    @WriteAccess
    fun create(
        @PathVariable conventionId: Long,
        @Valid @RequestBody request: CreateActivitePlanifieeRequest,
    ): ResponseEntity<ApiResponse<ActivitePlanifieeResponse>> = ResponseEntity.ok(
        ApiResponse.success(
            activitePlanifieeService.create(conventionId, request),
            "Activité créée"
        )
    )

    @PutMapping("/{id}")
    @WriteAccess
    fun update(
        @PathVariable conventionId: Long,
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateActivitePlanifieeRequest,
    ): ResponseEntity<ApiResponse<ActivitePlanifieeResponse>> = ResponseEntity.ok(
        ApiResponse.success(
            activitePlanifieeService.update(id, request),
            "Activité mise à jour"
        )
    )

    @PutMapping("/{id}/toggle")
    @WriteAccess
    fun toggleDone(
        @PathVariable conventionId: Long,
        @PathVariable id: Long,
    ): ResponseEntity<ApiResponse<ActivitePlanifieeResponse>> = ResponseEntity.ok(
        ApiResponse.success(
            activitePlanifieeService.toggleDone(id),
            "Statut mis à jour"
        )
    )

    @DeleteMapping("/{id}")
    @WriteAccess
    fun delete(
        @PathVariable conventionId: Long,
        @PathVariable id: Long,
    ): ResponseEntity<ApiResponse<String>> {
        activitePlanifieeService.delete(id)
        return ResponseEntity.ok(ApiResponse.success("OK", "Activité supprimée"))
    }
}
