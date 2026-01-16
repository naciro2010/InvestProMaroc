package ma.investpro.controller

import ma.investpro.dto.CreateProjetConventionRequest
import ma.investpro.dto.ProjetConventionDTO
import ma.investpro.dto.UpdateProjetConventionRequest
import ma.investpro.mapper.ProjetConventionMapper
import ma.investpro.service.ProjetConventionService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import jakarta.validation.Valid

@RestController
@RequestMapping("/api/projet-conventions")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000", "https://naciro2010.github.io"])
class ProjetConventionController(
    private val projetConventionService: ProjetConventionService,
    private val projetConventionMapper: ProjetConventionMapper
) {

    // ========== Association Management ==========

    /**
     * Crée une nouvelle association entre un projet et une convention
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun createAssociation(
        @Valid @RequestBody request: CreateProjetConventionRequest
    ): ResponseEntity<Map<String, Any?>> {
        return try {
            val association = projetConventionService.createAssociation(
                request.projetId,
                request.conventionId,
                request.ordre
            )
            val dto = projetConventionMapper.toDTO(association)
            ResponseEntity.status(HttpStatus.CREATED).body(
                mapOf(
                    "success" to true,
                    "message" to "Association créée avec succès",
                    "data" to dto
                ) as Map<String, Any?>
            )
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(
                mapOf(
                    "success" to false,
                    "message" to (e.message ?: "Erreur lors de la création de l'association"),
                    "data" to null
                ) as Map<String, Any?>
            )
        }
    }

    /**
     * Récupère tous les projets-conventions
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getAll(): ResponseEntity<Map<String, Any?>> {
        val associations = projetConventionService.findAll()
        val dtos = projetConventionMapper.toDTOList(associations)
        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "message" to "Associations récupérées avec succès",
                "data" to dtos
            ) as Map<String, Any?>
        )
    }

    /**
     * Récupère une association par ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getById(@PathVariable id: Long): ResponseEntity<Map<String, Any?>> {
        val association = projetConventionService.findById(id)
            ?: return ResponseEntity.notFound().build()
        val dto = projetConventionMapper.toDTO(association)
        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "message" to "Association récupérée avec succès",
                "data" to dto
            ) as Map<String, Any?>
        )
    }

    /**
     * Récupère toutes les conventions associées à un projet
     */
    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getConventionsByProjet(@PathVariable projetId: Long): ResponseEntity<Map<String, Any?>> {
        val associations = projetConventionService.getConventionsByProjetId(projetId)
        val dtos = projetConventionMapper.toDTOList(associations)
        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "message" to "Conventions du projet récupérées",
                "data" to dtos
            ) as Map<String, Any?>
        )
    }

    /**
     * Récupère tous les projets associés à une convention
     */
    @GetMapping("/convention/{conventionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getProjetsByConvention(@PathVariable conventionId: Long): ResponseEntity<Map<String, Any?>> {
        val associations = projetConventionService.getProjetsByConventionId(conventionId)
        val dtos = projetConventionMapper.toDTOList(associations)
        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "message" to "Projets de la convention récupérés",
                "data" to dtos
            ) as Map<String, Any?>
        )
    }

    /**
     * Met à jour l'ordre d'une association
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun updateOrdre(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateProjetConventionRequest
    ): ResponseEntity<Map<String, Any?>> {
        val association = projetConventionService.updateOrdre(id, request.ordre)
            ?: return ResponseEntity.notFound().build()
        val dto = projetConventionMapper.toDTO(association)
        return ResponseEntity.ok(
            mapOf(
                "success" to true,
                "message" to "Ordre mis à jour avec succès",
                "data" to dto
            ) as Map<String, Any?>
        )
    }

    /**
     * Supprime une association spécifique
     */
    @DeleteMapping("/projet/{projetId}/convention/{conventionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun deleteAssociation(
        @PathVariable projetId: Long,
        @PathVariable conventionId: Long
    ): ResponseEntity<Map<String, Any?>> {
        return try {
            projetConventionService.deleteAssociation(projetId, conventionId)
            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "Association supprimée avec succès",
                    "data" to null
                ) as Map<String, Any?>
            )
        } catch (e: Exception) {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Supprime une association par ID
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun deleteById(@PathVariable id: Long): ResponseEntity<Map<String, Any?>> {
        val deleted = projetConventionService.delete(id)
        return if (deleted) {
            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "Association supprimée avec succès",
                    "data" to null
                ) as Map<String, Any?>
            )
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Réordonne les conventions d'un projet
     */
    @PutMapping("/projet/{projetId}/reorder")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun reorderConventions(
        @PathVariable projetId: Long,
        @RequestBody ordres: Map<Long, Int>
    ): ResponseEntity<Map<String, Any?>> {
        return try {
            projetConventionService.reorderConventions(projetId, ordres)
            val associations = projetConventionService.getConventionsByProjetId(projetId)
            val dtos = projetConventionMapper.toDTOList(associations)
            ResponseEntity.ok(
                mapOf(
                    "success" to true,
                    "message" to "Conventions réordonnées avec succès",
                    "data" to dtos
                ) as Map<String, Any?>
            )
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(
                mapOf(
                    "success" to false,
                    "message" to (e.message ?: "Erreur lors du réordonnement"),
                    "data" to null
                ) as Map<String, Any?>
            )
        }
    }
}
