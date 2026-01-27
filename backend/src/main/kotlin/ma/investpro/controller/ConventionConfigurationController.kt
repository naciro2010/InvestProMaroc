package ma.investpro.controller

import jakarta.validation.Valid
import ma.investpro.dto.ApiResponse
import ma.investpro.dto.parametrage.ConventionConfigurationDTO
import ma.investpro.mapper.ConventionConfigurationMapper
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.service.ConventionConfigurationService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/parametrage/conventions")
class ConventionConfigurationController(
    private val configurationService: ConventionConfigurationService,
    private val configurationMapper: ConventionConfigurationMapper
) {
    @GetMapping
    @ReadAccess
    fun getConfiguration(): ResponseEntity<ApiResponse<ConventionConfigurationDTO>> {
        val configuration = configurationService.getConfiguration()
        return ResponseEntity.ok(
            ApiResponse.success(
                configurationMapper.toDTO(configuration),
                "Paramétrage des conventions récupéré avec succès"
            )
        )
    }

    @PutMapping
    @WriteAccess
    fun updateConfiguration(
        @Valid @RequestBody request: ConventionConfigurationDTO
    ): ResponseEntity<ApiResponse<ConventionConfigurationDTO>> {
        val updated = configurationService.updateConfiguration(request)
        return ResponseEntity.ok(
            ApiResponse.success(
                configurationMapper.toDTO(updated),
                "Paramétrage des conventions mis à jour"
            )
        )
    }
}
