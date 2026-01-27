package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.entity.Decompte
import ma.investpro.entity.DecompteRetenue
import ma.investpro.entity.DecompteImputation
import ma.investpro.service.DecompteService
import ma.investpro.mapper.DecompteMapper
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

private val logger = KotlinLogging.logger {}

data class RejetRequest(val motif: String)

/**
 * Contrôleur REST pour la gestion des Décomptes.
 *
 * SÉCURITÉ (via hiérarchie des rôles):
 * - @ReadAccess: USER, MANAGER, ADMIN
 * - @WriteAccess: MANAGER, ADMIN
 * - @AdminOnly: ADMIN uniquement
 */
@RestController
@RequestMapping("/api/decomptes")
class DecompteController(
    private val decompteService: DecompteService,
    private val decompteMapper: DecompteMapper
) {

    @GetMapping("/list")
    @ReadAccess
    fun getDecomptesList(): ResponseEntity<List<DecompteListDTO>> {
        logger.info { "🌐 API: GET /api/decomptes/list (optimized for list view)" }
        val decomptes = decompteService.findAllForListView()
        return ResponseEntity.ok(decomptes)
    }

    @GetMapping
    @ReadAccess
    fun getAllDecomptes(): ResponseEntity<ApiResponse<List<DecompteDTO>>> {
        logger.info { "🌐 API: GET /api/decomptes (full list with DTOs)" }
        val decomptes = decompteService.findAll()
        val dtos = decomptes.map { decompteMapper.toDTO(it) }
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @GetMapping("/{id}")
    @ReadAccess
    fun getDecompteById(@PathVariable id: Long): ResponseEntity<ApiResponse<DecompteDTO>> {
        logger.info { "🌐 API: GET /api/decomptes/$id (returns DTO)" }
        return try {
            val decompte = decompteService.findById(id)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Décompte non trouvé"))
            val dto = decompteMapper.toDTO(decompte)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération du décompte"))
        }
    }

    @PostMapping
    @WriteAccess
    fun createDecompte(@RequestBody decompte: Decompte): ResponseEntity<ApiResponse<DecompteDTO>> {
        logger.info { "🌐 API: POST /api/decomptes - Création décompte ${decompte.numeroDecompte}" }
        return try {
            val createdDecompte = decompteService.create(decompte)
            val dto = decompteMapper.toDTO(createdDecompte)
            ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(dto, "Décompte créé avec succès"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur de validation"))
        }
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun updateDecompte(@PathVariable id: Long, @RequestBody decompte: Decompte): ResponseEntity<ApiResponse<DecompteDTO>> {
        logger.info { "🌐 API: PUT /api/decomptes/$id" }
        return try {
            val updatedDecompte = decompteService.update(id, decompte)
            val dto = decompteMapper.toDTO(updatedDecompte)
            ResponseEntity.ok(ApiResponse.success(dto, "Décompte mis à jour"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.message ?: "Décompte non trouvé"))
        }
    }

    @DeleteMapping("/{id}")
    @AdminOnly
    fun deleteDecompte(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        logger.info { "🌐 API: DELETE /api/decomptes/$id" }
        return try {
            decompteService.delete(id)
            ResponseEntity.ok(ApiResponse.success(Unit, "Décompte supprimé"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.message ?: "Décompte non trouvé"))
        }
    }

    @GetMapping("/marche/{marcheId}")
    @ReadAccess
    fun getDecomptesByMarche(@PathVariable marcheId: Long): ResponseEntity<ApiResponse<List<DecompteDTO>>> {
        logger.info { "🌐 API: GET /api/decomptes/marche/$marcheId" }
        val decomptes = decompteService.findByMarche(marcheId)
        val dtos = decomptes.map { decompteMapper.toDTO(it) }
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @GetMapping("/{id}/retenues")
    @ReadAccess
    fun getDecompteRetenues(@PathVariable id: Long): ResponseEntity<ApiResponse<List<DecompteRetenueDTO>>> {
        logger.info { "🌐 API: GET /api/decomptes/$id/retenues (granular: retentions only)" }
        return try {
            val retenues: List<DecompteRetenue> = decompteService.findRetenuesByDecompteId(id)
            val dtos: List<DecompteRetenueDTO> = retenues.map { retenue: DecompteRetenue -> decompteMapper.toRetenueDTO(retenue) }
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.message ?: "Décompte non trouvé"))
        }
    }

    @GetMapping("/{id}/imputations")
    @ReadAccess
    fun getDecompteImputations(@PathVariable id: Long): ResponseEntity<ApiResponse<List<DecompteImputationDTO>>> {
        logger.info { "🌐 API: GET /api/decomptes/$id/imputations (granular: allocations only)" }
        return try {
            val imputations: List<DecompteImputation> = decompteService.findImputationsByDecompteId(id)
            val dtos: List<DecompteImputationDTO> = imputations.map { imputation: DecompteImputation -> decompteMapper.toImputationDTO(imputation) }
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.message ?: "Décompte non trouvé"))
        }
    }

    @PostMapping("/{id}/valider")
    @WriteAccess
    fun validerDecompte(
        @PathVariable id: Long,
        @org.springframework.security.core.annotation.AuthenticationPrincipal userDetails: org.springframework.security.core.userdetails.UserDetails
    ): ResponseEntity<ApiResponse<DecompteDTO>> {
        logger.info { "🌐 API: POST /api/decomptes/$id/valider - Validation du décompte par ${userDetails.username}" }
        return try {
            val userId = 1L // TODO: Get from UserService based on userDetails.username
            val decompte = decompteService.valider(id, userId)
            val dto = decompteMapper.toDTO(decompte)
            ResponseEntity.ok(ApiResponse.success(dto, "Décompte validé avec succès"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Impossible de valider le décompte"))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la validation"))
        }
    }

    @PostMapping("/{id}/rejeter")
    @WriteAccess
    fun rejeterDecompte(
        @PathVariable id: Long,
        @RequestBody request: RejetRequest
    ): ResponseEntity<ApiResponse<DecompteDTO>> {
        logger.info { "🌐 API: POST /api/decomptes/$id/rejeter - Rejet du décompte: ${request.motif}" }
        return try {
            val decompte = decompteService.rejeter(id)
            val dto = decompteMapper.toDTO(decompte)
            ResponseEntity.ok(ApiResponse.success(dto, "Décompte rejeté"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Impossible de rejeter le décompte"))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors du rejet"))
        }
    }

    @PostMapping("/{id}/soumettre")
    @WriteAccess
    fun soumettreDecompte(@PathVariable id: Long): ResponseEntity<ApiResponse<DecompteDTO>> {
        logger.info { "🌐 API: POST /api/decomptes/$id/soumettre - Soumission du décompte" }
        return try {
            val decompte = decompteService.soumettre(id)
            val dto = decompteMapper.toDTO(decompte)
            ResponseEntity.ok(ApiResponse.success(dto, "Décompte soumis pour validation"))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Impossible de soumettre le décompte"))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la soumission"))
        }
    }
}
