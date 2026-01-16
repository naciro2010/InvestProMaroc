package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.MaitreOeuvreRequest
import ma.investpro.dto.MaitreOeuvreResponse
import ma.investpro.service.MaitreOeuvreService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/maitres-oeuvre")
@CrossOrigin(origins = ["*"])
class MaitreOeuvreController(
    private val service: MaitreOeuvreService
) {

    /**
     * Récupère tous les MO/MOD d'une convention
     */
    @GetMapping("/convention/{conventionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getAllByConvention(@PathVariable conventionId: Long): ResponseEntity<ApiResponse<List<MaitreOeuvreResponse>>> {
        return try {
            val data = service.getAllByConvention(conventionId)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Maîtres d'Œuvre récupérés avec succès",
                    data = data
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Erreur lors de la récupération des Maîtres d'Œuvre: ${e.message}",
                    data = null
                )
            )
        }
    }

    /**
     * Récupère tous les MO d'une convention
     */
    @GetMapping("/convention/{conventionId}/mo")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getMOByConvention(@PathVariable conventionId: Long): ResponseEntity<ApiResponse<List<MaitreOeuvreResponse>>> {
        return try {
            val data = service.getMOByConvention(conventionId)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Maîtres d'Œuvre (MO) récupérés avec succès",
                    data = data
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Erreur lors de la récupération des MO: ${e.message}",
                    data = null
                )
            )
        }
    }

    /**
     * Récupère tous les MOD d'une convention
     */
    @GetMapping("/convention/{conventionId}/mod")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getMODByConvention(@PathVariable conventionId: Long): ResponseEntity<ApiResponse<List<MaitreOeuvreResponse>>> {
        return try {
            val data = service.getMODByConvention(conventionId)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Maîtres d'Œuvre Délégués (MOD) récupérés avec succès",
                    data = data
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Erreur lors de la récupération des MOD: ${e.message}",
                    data = null
                )
            )
        }
    }

    /**
     * Récupère un MO/MOD par ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<MaitreOeuvreResponse>> {
        return try {
            val data = service.getById(id)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Maître d'Œuvre récupéré avec succès",
                    data = data
                )
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Maître d'Œuvre non trouvé",
                    data = null
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Erreur lors de la récupération du Maître d'Œuvre: ${e.message}",
                    data = null
                )
            )
        }
    }

    /**
     * Crée un nouveau MO/MOD
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun create(@RequestBody request: MaitreOeuvreRequest): ResponseEntity<ApiResponse<MaitreOeuvreResponse>> {
        return try {
            val data = service.create(request)
            ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse(
                    success = true,
                    message = "Maître d'Œuvre créé avec succès",
                    data = data
                )
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Données invalides",
                    data = null
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Erreur lors de la création du Maître d'Œuvre: ${e.message}",
                    data = null
                )
            )
        }
    }

    /**
     * Met à jour un MO/MOD existant
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun update(
        @PathVariable id: Long,
        @RequestBody request: MaitreOeuvreRequest
    ): ResponseEntity<ApiResponse<MaitreOeuvreResponse>> {
        return try {
            val data = service.update(id, request)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Maître d'Œuvre mis à jour avec succès",
                    data = data
                )
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Données invalides",
                    data = null
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Erreur lors de la mise à jour du Maître d'Œuvre: ${e.message}",
                    data = null
                )
            )
        }
    }

    /**
     * Supprime (soft delete) un MO/MOD
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        return try {
            service.delete(id)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Maître d'Œuvre supprimé avec succès",
                    data = null
                )
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Maître d'Œuvre non trouvé",
                    data = null
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Erreur lors de la suppression du Maître d'Œuvre: ${e.message}",
                    data = null
                )
            )
        }
    }

    /**
     * Restaure un MO/MOD inactif
     */
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun restore(@PathVariable id: Long): ResponseEntity<ApiResponse<MaitreOeuvreResponse>> {
        return try {
            val data = service.restore(id)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Maître d'Œuvre restauré avec succès",
                    data = data
                )
            )
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse(
                    success = false,
                    message = e.message ?: "Maître d'Œuvre non trouvé",
                    data = null
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse(
                    success = false,
                    message = "Erreur lors de la restauration du Maître d'Œuvre: ${e.message}",
                    data = null
                )
            )
        }
    }
}
