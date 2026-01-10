package ma.investpro.controller

import jakarta.validation.Valid
import ma.investpro.dto.*
import ma.investpro.entity.User
import ma.investpro.service.AvenantConventionService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

/**
 * Contrôleur REST pour les avenants de conventions
 */
@RestController
@RequestMapping("/api/avenants-conventions")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000", "https://naciro2010.github.io"])
class AvenantConventionController(
    private val avenantService: AvenantConventionService
) {

    /**
     * Récupère tous les avenants
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getAll(): ResponseEntity<ApiResponse<List<AvenantConventionSummary>>> {
        val avenants = avenantService.getAll()
        return ResponseEntity.ok(
            ApiResponse(
                success = true,
                message = "Avenants récupérés avec succès",
                data = avenants
            )
        )
    }

    /**
     * Récupère un avenant par ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<AvenantConventionResponse>> {
        return try {
            val avenant = avenantService.getById(id)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Avenant récupéré avec succès",
                    data = avenant
                )
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Avenant non trouvé",
                    data = null
                )
            )
        }
    }

    /**
     * Récupère tous les avenants d'une convention
     */
    @GetMapping("/convention/{conventionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getByConvention(@PathVariable conventionId: Long): ResponseEntity<ApiResponse<List<AvenantConventionResponse>>> {
        val avenants = avenantService.getAllByConvention(conventionId)
        return ResponseEntity.ok(
            ApiResponse(
                success = true,
                message = "Avenants de la convention récupérés avec succès",
                data = avenants
            )
        )
    }

    /**
     * Récupère les avenants en attente de validation
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun getPendingValidation(): ResponseEntity<ApiResponse<List<AvenantConventionSummary>>> {
        val avenants = avenantService.getPendingValidation()
        return ResponseEntity.ok(
            ApiResponse(
                success = true,
                message = "Avenants en attente récupérés avec succès",
                data = avenants
            )
        )
    }

    /**
     * Récupère les statistiques des avenants d'une convention
     */
    @GetMapping("/convention/{conventionId}/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getStatistics(@PathVariable conventionId: Long): ResponseEntity<ApiResponse<AvenantStatistics>> {
        val stats = avenantService.getStatistics(conventionId)
        return ResponseEntity.ok(
            ApiResponse(
                success = true,
                message = "Statistiques récupérées avec succès",
                data = stats
            )
        )
    }

    /**
     * Crée un nouvel avenant
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun create(@Valid @RequestBody request: AvenantConventionRequest): ResponseEntity<ApiResponse<AvenantConventionResponse>> {
        return try {
            val userId = getCurrentUserId()
            val avenant = avenantService.create(request, userId)
            ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse(
                    success = true,
                    message = "Avenant créé avec succès",
                    data = avenant
                )
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Erreur de validation",
                    data = null
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Erreur lors de la création de l'avenant: ${e.message}",
                    data = null
                )
            )
        }
    }

    /**
     * Met à jour un avenant (seulement si BROUILLON)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody request: AvenantConventionRequest
    ): ResponseEntity<ApiResponse<AvenantConventionResponse>> {
        return try {
            val avenant = avenantService.update(id, request)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Avenant mis à jour avec succès",
                    data = avenant
                )
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Avenant non trouvé",
                    data = null
                )
            )
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "État invalide",
                    data = null
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Erreur lors de la mise à jour de l'avenant: ${e.message}",
                    data = null
                )
            )
        }
    }

    /**
     * Soumet un avenant pour validation
     */
    @PostMapping("/{id}/soumettre")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun soumettre(@PathVariable id: Long): ResponseEntity<ApiResponse<AvenantConventionResponse>> {
        return try {
            val userId = getCurrentUserId()
            val avenant = avenantService.soumettre(id, userId)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Avenant soumis pour validation avec succès",
                    data = avenant
                )
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Avenant non trouvé",
                    data = null
                )
            )
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "État invalide",
                    data = null
                )
            )
        }
    }

    /**
     * Valide un avenant et applique les modifications à la convention
     */
    @PostMapping("/valider")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun valider(@Valid @RequestBody request: ValiderAvenantRequest): ResponseEntity<ApiResponse<AvenantConventionResponse>> {
        return try {
            val userId = getCurrentUserId()
            val avenant = avenantService.valider(request, userId)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Avenant validé et appliqué à la convention avec succès",
                    data = avenant
                )
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Avenant non trouvé",
                    data = null
                )
            )
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "État invalide",
                    data = null
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Erreur lors de la validation de l'avenant: ${e.message}",
                    data = null
                )
            )
        }
    }

    /**
     * Rejette un avenant (retour à BROUILLON)
     */
    @PostMapping("/rejeter")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun rejeter(@Valid @RequestBody request: RejeterAvenantRequest): ResponseEntity<ApiResponse<AvenantConventionResponse>> {
        return try {
            val avenant = avenantService.rejeter(request)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Avenant rejeté avec succès",
                    data = avenant
                )
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Avenant non trouvé",
                    data = null
                )
            )
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "État invalide",
                    data = null
                )
            )
        }
    }

    /**
     * Supprime un avenant (seulement si BROUILLON)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        return try {
            avenantService.delete(id)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Avenant supprimé avec succès",
                    data = null
                )
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Avenant non trouvé",
                    data = null
                )
            )
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "État invalide",
                    data = null
                )
            )
        }
    }

    /**
     * Récupère l'ID de l'utilisateur courant depuis le contexte de sécurité
     */
    private fun getCurrentUserId(): Long {
        val authentication = SecurityContextHolder.getContext().authentication
        val user = authentication.principal as? User
            ?: throw IllegalStateException("Utilisateur non authentifié")
        return user.id ?: throw IllegalStateException("ID utilisateur non disponible")
    }
}
