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
    fun getAll(): ResponseEntity<Map<String, Any>> {
        val avenants = avenantService.getAll()
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "Avenants récupérés avec succès",
            "data" to avenants
        ))
    }

    /**
     * Récupère un avenant par ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getById(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        return try {
            val avenant = avenantService.getById(id)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Avenant récupéré avec succès",
                "data" to avenant
            ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf(
                "success" to false,
                "message" to e.message,
                "data" to null
            ))
        }
    }

    /**
     * Récupère tous les avenants d'une convention
     */
    @GetMapping("/convention/{conventionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getByConvention(@PathVariable conventionId: Long): ResponseEntity<Map<String, Any>> {
        val avenants = avenantService.getAllByConvention(conventionId)
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "Avenants de la convention récupérés avec succès",
            "data" to avenants
        ))
    }

    /**
     * Récupère les avenants en attente de validation
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun getPendingValidation(): ResponseEntity<Map<String, Any>> {
        val avenants = avenantService.getPendingValidation()
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "Avenants en attente récupérés avec succès",
            "data" to avenants
        ))
    }

    /**
     * Récupère les statistiques des avenants d'une convention
     */
    @GetMapping("/convention/{conventionId}/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getStatistics(@PathVariable conventionId: Long): ResponseEntity<Map<String, Any>> {
        val stats = avenantService.getStatistics(conventionId)
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "Statistiques récupérées avec succès",
            "data" to stats
        ))
    }

    /**
     * Crée un nouvel avenant
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun create(@Valid @RequestBody request: AvenantConventionRequest): ResponseEntity<Map<String, Any>> {
        return try {
            val userId = getCurrentUserId()
            val avenant = avenantService.create(request, userId)
            ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
                "success" to true,
                "message" to "Avenant créé avec succès",
                "data" to avenant
            ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf(
                "success" to false,
                "message" to e.message,
                "data" to null
            ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la création de l'avenant: ${e.message}",
                "data" to null
            ))
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
    ): ResponseEntity<Map<String, Any>> {
        return try {
            val avenant = avenantService.update(id, request)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Avenant mis à jour avec succès",
                "data" to avenant
            ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf(
                "success" to false,
                "message" to e.message,
                "data" to null
            ))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf(
                "success" to false,
                "message" to e.message,
                "data" to null
            ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la mise à jour de l'avenant: ${e.message}",
                "data" to null
            ))
        }
    }

    /**
     * Soumet un avenant pour validation
     */
    @PostMapping("/{id}/soumettre")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun soumettre(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        return try {
            val userId = getCurrentUserId()
            val avenant = avenantService.soumettre(id, userId)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Avenant soumis pour validation avec succès",
                "data" to avenant
            ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf(
                "success" to false,
                "message" to e.message,
                "data" to null
            ))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf(
                "success" to false,
                "message" to e.message,
                "data" to null
            ))
        }
    }

    /**
     * Valide un avenant et applique les modifications à la convention
     */
    @PostMapping("/valider")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun valider(@Valid @RequestBody request: ValiderAvenantRequest): ResponseEntity<Map<String, Any>> {
        return try {
            val userId = getCurrentUserId()
            val avenant = avenantService.valider(request, userId)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Avenant validé et appliqué à la convention avec succès",
                "data" to avenant
            ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf(
                "success" to false,
                "message" to e.message,
                "data" to null
            ))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf(
                "success" to false,
                "message" to e.message,
                "data" to null
            ))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la validation de l'avenant: ${e.message}",
                "data" to null
            ))
        }
    }

    /**
     * Rejette un avenant (retour à BROUILLON)
     */
    @PostMapping("/rejeter")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun rejeter(@Valid @RequestBody request: RejeterAvenantRequest): ResponseEntity<Map<String, Any>> {
        return try {
            val avenant = avenantService.rejeter(request)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Avenant rejeté avec succès",
                "data" to avenant
            ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf(
                "success" to false,
                "message" to e.message,
                "data" to null
            ))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf(
                "success" to false,
                "message" to e.message,
                "data" to null
            ))
        }
    }

    /**
     * Supprime un avenant (seulement si BROUILLON)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun delete(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        return try {
            avenantService.delete(id)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Avenant supprimé avec succès",
                "data" to null
            ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf(
                "success" to false,
                "message" to e.message,
                "data" to null
            ))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf(
                "success" to false,
                "message" to e.message,
                "data" to null
            ))
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
