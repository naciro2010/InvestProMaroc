package ma.investpro.controller

import jakarta.validation.Valid
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import ma.investpro.dto.ApiResponse
import ma.investpro.dto.ConventionPartenaireDTO
import ma.investpro.entity.ConventionPartenaire
import ma.investpro.mapper.ConventionPartenaireMapper
import ma.investpro.service.ConventionPartenaireService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly

/**
 * Contrôleur REST pour la gestion des partenaires de conventions
 */
@RestController
@RequestMapping("/api/conventions/{conventionId}/partenaires")
class ConventionPartenaireController(
    private val conventionPartenaireService: ConventionPartenaireService,
    private val conventionPartenaireMapper: ConventionPartenaireMapper
) {

    /**
     * Récupère tous les partenaires d'une convention
     */
    @GetMapping
    @ReadAccess
    fun getAllPartenaires(
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<List<ConventionPartenaireDTO>>> {
        val partenaires: List<ConventionPartenaire> = conventionPartenaireService.findByConventionId(conventionId)
        val dtos: List<ConventionPartenaireDTO> = conventionPartenaireMapper.toDTOList(partenaires)
        return ResponseEntity.ok(ApiResponse.success(dtos, "Partenaires récupérés avec succès"))
    }

    /**
     * Ajoute un partenaire à une convention
     */
    @PostMapping
    @WriteAccess
    fun addPartenaire(
        @PathVariable conventionId: Long,
        @Valid @RequestBody request: AddPartenaireRequest
    ): ResponseEntity<ApiResponse<ConventionPartenaireDTO>> {
        val conventionPartenaire: ConventionPartenaire = conventionPartenaireService.addPartenaireToConvention(
            conventionId = conventionId,
            partenaireId = request.partenaireId,
            budgetAlloue = request.budgetAlloue,
            pourcentage = request.pourcentage,
            estMaitreOeuvre = request.estMaitreOeuvre ?: false,
            estMaitreOeuvreDelegue = request.estMaitreOeuvreDelegue ?: false,
            remarques = request.remarques
        )

        val dto: ConventionPartenaireDTO = conventionPartenaireMapper.toDTO(conventionPartenaire)
        return ResponseEntity.ok(ApiResponse.success(dto, "Partenaire ajouté avec succès"))
    }

    /**
     * Met à jour un partenaire d'une convention
     */
    @PutMapping("/{id}")
    @WriteAccess
    fun updatePartenaire(
        @PathVariable conventionId: Long,
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdatePartenaireRequest
    ): ResponseEntity<ApiResponse<ConventionPartenaireDTO>> {
        val conventionPartenaire: ConventionPartenaire = conventionPartenaireService.updatePartenaireInConvention(
            id = id,
            budgetAlloue = request.budgetAlloue,
            pourcentage = request.pourcentage,
            estMaitreOeuvre = request.estMaitreOeuvre,
            estMaitreOeuvreDelegue = request.estMaitreOeuvreDelegue,
            remarques = request.remarques
        )

        val dto: ConventionPartenaireDTO = conventionPartenaireMapper.toDTO(conventionPartenaire)
        return ResponseEntity.ok(ApiResponse.success(dto, "Partenaire mis à jour avec succès"))
    }

    /**
     * Supprime un partenaire d'une convention
     */
    @DeleteMapping("/{id}")
    @WriteAccess
    fun deletePartenaire(
        @PathVariable conventionId: Long,
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<Unit>> {
        conventionPartenaireService.deleteById(id)
        return ResponseEntity.ok(ApiResponse.success(Unit, "Partenaire retiré avec succès"))
    }
}

/**
 * Request DTO pour ajouter un partenaire
 */
data class AddPartenaireRequest(
    @field:NotNull(message = "L'ID du partenaire est obligatoire")
    val partenaireId: Long,

    @field:NotNull(message = "Le budget alloué est obligatoire")
    @field:DecimalMin("0.00", message = "Le budget doit être positif")
    val budgetAlloue: BigDecimal,

    @field:NotNull(message = "Le pourcentage est obligatoire")
    @field:DecimalMin("0.00", message = "Le pourcentage doit être >= 0")
    @field:DecimalMax("100.00", message = "Le pourcentage doit être <= 100")
    val pourcentage: BigDecimal,

    val estMaitreOeuvre: Boolean? = false,
    val estMaitreOeuvreDelegue: Boolean? = false,
    val remarques: String? = null
)

/**
 * Request DTO pour mettre à jour un partenaire
 */
data class UpdatePartenaireRequest(
    @field:NotNull(message = "Le budget alloué est obligatoire")
    @field:DecimalMin("0.00", message = "Le budget doit être positif")
    val budgetAlloue: BigDecimal,

    @field:NotNull(message = "Le pourcentage est obligatoire")
    @field:DecimalMin("0.00", message = "Le pourcentage doit être >= 0")
    @field:DecimalMax("100.00", message = "Le pourcentage doit être <= 100")
    val pourcentage: BigDecimal,

    @field:NotNull(message = "estMaitreOeuvre est obligatoire")
    val estMaitreOeuvre: Boolean,

    @field:NotNull(message = "estMaitreOeuvreDelegue est obligatoire")
    val estMaitreOeuvreDelegue: Boolean,

    val remarques: String? = null
)
