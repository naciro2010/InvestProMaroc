package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.CreateProjetConventionRequest
import ma.investpro.dto.ProjetConventionDTO
import ma.investpro.dto.UpdateProjetConventionRequest
import ma.investpro.mapper.ProjetConventionMapper
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly
import ma.investpro.service.ProjetConventionService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import jakarta.validation.Valid

/**
 * Contrôleur REST pour la gestion des associations Projet-Convention.
 *
 * SECURITE (via hierarchie des roles):
 * - @ReadAccess: USER, MANAGER, ADMIN
 * - @WriteAccess: MANAGER, ADMIN
 * - @AdminOnly: ADMIN uniquement
 */
@RestController
@RequestMapping("/api/projet-conventions")
class ProjetConventionController(
    private val projetConventionService: ProjetConventionService,
    private val projetConventionMapper: ProjetConventionMapper
) {

    // ========== Association Management ==========

    /**
     * Cree une nouvelle association entre un projet et une convention
     */
    @PostMapping
    @WriteAccess
    fun createAssociation(
        @Valid @RequestBody request: CreateProjetConventionRequest
    ): ResponseEntity<ApiResponse<ProjetConventionDTO>> {
        return try {
            val association = projetConventionService.createAssociation(
                request.projetId,
                request.conventionId,
                request.ordre
            )
            val dto = projetConventionMapper.toDTO(association)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(dto, "Association creee avec succes"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest()
                .body(ApiResponse.error(e.message ?: "Erreur lors de la creation de l'association"))
        }
    }

    /**
     * Recupere tous les projets-conventions
     */
    @GetMapping
    @ReadAccess
    fun getAll(): ResponseEntity<ApiResponse<List<ProjetConventionDTO>>> {
        val associations = projetConventionService.findAll()
        val dtos = projetConventionMapper.toDTOList(associations)
        return ResponseEntity.ok(ApiResponse.success(dtos, "Associations recuperees avec succes"))
    }

    /**
     * Recupere une association par ID
     */
    @GetMapping("/{id}")
    @ReadAccess
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<ProjetConventionDTO>> {
        val association = projetConventionService.findById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Association non trouvee"))
        val dto = projetConventionMapper.toDTO(association)
        return ResponseEntity.ok(ApiResponse.success(dto, "Association recuperee avec succes"))
    }

    /**
     * Recupere toutes les conventions associees a un projet
     */
    @GetMapping("/projet/{projetId}")
    @ReadAccess
    fun getConventionsByProjet(@PathVariable projetId: Long): ResponseEntity<ApiResponse<List<ProjetConventionDTO>>> {
        val associations = projetConventionService.getConventionsByProjetId(projetId)
        val dtos = projetConventionMapper.toDTOList(associations)
        return ResponseEntity.ok(ApiResponse.success(dtos, "Conventions du projet recuperees"))
    }

    /**
     * Recupere tous les projets associes a une convention
     */
    @GetMapping("/convention/{conventionId}")
    @ReadAccess
    fun getProjetsByConvention(@PathVariable conventionId: Long): ResponseEntity<ApiResponse<List<ProjetConventionDTO>>> {
        val associations = projetConventionService.getProjetsByConventionId(conventionId)
        val dtos = projetConventionMapper.toDTOList(associations)
        return ResponseEntity.ok(ApiResponse.success(dtos, "Projets de la convention recuperes"))
    }

    /**
     * Met a jour l'ordre d'une association
     */
    @PutMapping("/{id}")
    @WriteAccess
    fun updateOrdre(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateProjetConventionRequest
    ): ResponseEntity<ApiResponse<ProjetConventionDTO>> {
        val association = projetConventionService.updateOrdre(id, request.ordre)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Association non trouvee"))
        val dto = projetConventionMapper.toDTO(association)
        return ResponseEntity.ok(ApiResponse.success(dto, "Ordre mis a jour avec succes"))
    }

    /**
     * Supprime une association specifique par projetId et conventionId
     */
    @DeleteMapping("/projet/{projetId}/convention/{conventionId}")
    @WriteAccess
    fun deleteAssociation(
        @PathVariable projetId: Long,
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<String>> {
        return try {
            projetConventionService.deleteAssociation(projetId, conventionId)
            ResponseEntity.ok(ApiResponse.success("OK", "Association supprimee avec succes"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Association non trouvee"))
        }
    }

    /**
     * Supprime une association par ID
     */
    @DeleteMapping("/{id}")
    @AdminOnly
    fun deleteById(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        val deleted = projetConventionService.delete(id)
        return if (deleted) {
            ResponseEntity.ok(ApiResponse.success("OK", "Association supprimee avec succes"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Association non trouvee"))
        }
    }

    /**
     * Reordonne les conventions d'un projet
     */
    @PutMapping("/projet/{projetId}/reorder")
    @WriteAccess
    fun reorderConventions(
        @PathVariable projetId: Long,
        @RequestBody ordres: Map<Long, Int>
    ): ResponseEntity<ApiResponse<List<ProjetConventionDTO>>> {
        return try {
            projetConventionService.reorderConventions(projetId, ordres)
            val associations = projetConventionService.getConventionsByProjetId(projetId)
            val dtos = projetConventionMapper.toDTOList(associations)
            ResponseEntity.ok(ApiResponse.success(dtos, "Conventions reordonnees avec succes"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest()
                .body(ApiResponse.error(e.message ?: "Erreur lors du reordonnement"))
        }
    }
}
