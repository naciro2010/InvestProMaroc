package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.PieceJointeCreateRequest
import ma.investpro.dto.PieceJointeDTO
import ma.investpro.dto.PieceJointeUpdateRequest
import ma.investpro.entity.PieceJointe
import ma.investpro.security.JwtService
import ma.investpro.service.PieceJointeService
import org.springframework.core.io.Resource
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/pieces-jointes")
@CrossOrigin(origins = ["http://localhost:5173", "https://naciro2010.github.io"])
class PieceJointeController(
    private val pieceJointeService: PieceJointeService,
    private val jwtService: JwtService
) {

    /**
     * Upload une pièce jointe
     */
    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("typeEntite") typeEntite: String,
        @RequestParam("entiteId") entiteId: Long,
        @RequestParam("description", required = false) description: String?,
        @RequestHeader("Authorization") token: String
    ): ResponseEntity<ApiResponse<PieceJointeDTO>> {
        return try {
            // Extraire l'user ID du token
            val jwt = token.substring(7) // Remove "Bearer " prefix
            val userId = jwtService.extractUserId(jwt)
                ?: throw IllegalArgumentException("Impossible d'extraire l'ID utilisateur du token")

            val request = PieceJointeCreateRequest(
                description = description,
                typeEntite = PieceJointe.TypeEntite.valueOf(typeEntite),
                entiteId = entiteId
            )

            val result = pieceJointeService.uploadFile(file, request, userId)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Fichier uploadé avec succès",
                    data = result
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                    ApiResponse(
                        success = false,
                        message = "Erreur lors de l'upload: ${e.message}",
                        data = null
                    )
                )
        }
    }

    /**
     * Récupère toutes les pièces jointes pour une entité
     */
    @GetMapping
    fun getPiecesJointes(
        @RequestParam("typeEntite") typeEntite: String,
        @RequestParam("entiteId") entiteId: Long
    ): ResponseEntity<ApiResponse<List<PieceJointeDTO>>> {
        return try {
            val type = PieceJointe.TypeEntite.valueOf(typeEntite)
            val result = pieceJointeService.getPiecesJointesForEntite(type, entiteId)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Pièces jointes récupérées avec succès",
                    data = result
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                    ApiResponse(
                        success = false,
                        message = "Erreur lors de la récupération: ${e.message}",
                        data = emptyList()
                    )
                )
        }
    }

    /**
     * Récupère une pièce jointe par ID
     */
    @GetMapping("/{id}")
    fun getPieceJointeById(@PathVariable id: Long): ResponseEntity<ApiResponse<PieceJointeDTO>> {
        return try {
            val result = pieceJointeService.getById(id)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Pièce jointe récupérée avec succès",
                    data = result
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(
                    ApiResponse(
                        success = false,
                        message = "Pièce jointe non trouvée: ${e.message}",
                        data = null
                    )
                )
        }
    }

    /**
     * Télécharge une pièce jointe
     */
    @GetMapping("/{id}/download")
    fun downloadFile(@PathVariable id: Long): ResponseEntity<Resource> {
        return try {
            val pieceJointe = pieceJointeService.getById(id)
            val resource = pieceJointeService.downloadFile(id)

            ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(pieceJointe.typeMime))
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"${pieceJointe.nomOriginal}\""
                )
                .body(resource)
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        }
    }

    /**
     * Met à jour une pièce jointe
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun updatePieceJointe(
        @PathVariable id: Long,
        @RequestBody request: PieceJointeUpdateRequest
    ): ResponseEntity<ApiResponse<PieceJointeDTO>> {
        return try {
            val result = pieceJointeService.updatePieceJointe(id, request)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Pièce jointe mise à jour avec succès",
                    data = result
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                    ApiResponse(
                        success = false,
                        message = "Erreur lors de la mise à jour: ${e.message}",
                        data = null
                    )
                )
        }
    }

    /**
     * Supprime une pièce jointe (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun deletePieceJointe(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        return try {
            pieceJointeService.deletePieceJointe(id)
            ResponseEntity.ok(
                ApiResponse(
                    success = true,
                    message = "Pièce jointe supprimée avec succès",
                    data = null
                )
            )
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                    ApiResponse(
                        success = false,
                        message = "Erreur lors de la suppression: ${e.message}",
                        data = null
                    )
                )
        }
    }
}
