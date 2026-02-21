package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.CreateOrdreServiceRequest
import ma.investpro.dto.MarcheDureeCalculDTO
import ma.investpro.dto.OrdreServiceDTO
import ma.investpro.entity.OrdreService
import ma.investpro.entity.TypeOrdreService
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.service.OrdreServiceService
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

/**
 * Controleur REST pour la gestion des ordres de service des marches.
 *
 * Endpoints:
 * - GET  /api/marches/{marcheId}/ordres-service           - Liste des ordres
 * - GET  /api/marches/{marcheId}/ordres-service/duree-penalites - Calcul duree et penalites
 * - POST /api/marches/{marcheId}/ordres-service           - Creation d'un ordre
 * - PUT  /api/marches/{marcheId}/ordres-service/{id}      - Modification d'un ordre
 * - DELETE /api/marches/{marcheId}/ordres-service/{id}    - Suppression d'un ordre
 *
 * SECURITE (via hierarchie des roles):
 * - @ReadAccess: USER, MANAGER, ADMIN
 * - @WriteAccess: MANAGER, ADMIN
 */
@RestController
@RequestMapping("/api/marches/{marcheId}/ordres-service")
class OrdreServiceController(
    private val ordreServiceService: OrdreServiceService
) {

    @GetMapping
    @ReadAccess
    fun getOrdresService(
        @PathVariable marcheId: Long
    ): ResponseEntity<ApiResponse<List<OrdreServiceDTO>>> {
        logger.info { "GET /api/marches/$marcheId/ordres-service" }
        val ordres = ordreServiceService.findByMarcheId(marcheId)
        val dtos = ordreServiceService.toDTOList(ordres)
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @GetMapping("/duree-penalites")
    @ReadAccess
    fun getDureeEtPenalites(
        @PathVariable marcheId: Long
    ): ResponseEntity<ApiResponse<MarcheDureeCalculDTO>> {
        logger.info { "GET /api/marches/$marcheId/ordres-service/duree-penalites" }
        return try {
            val calcul = ordreServiceService.calculerDureeEtPenalites(marcheId)
            ResponseEntity.ok(ApiResponse.success(calcul))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marche non trouve"))
        }
    }

    @PostMapping
    @WriteAccess
    fun createOrdreService(
        @PathVariable marcheId: Long,
        @Valid @RequestBody request: CreateOrdreServiceRequest
    ): ResponseEntity<ApiResponse<OrdreServiceDTO>> {
        logger.info { "POST /api/marches/$marcheId/ordres-service - type: ${request.typeOrdre}" }
        return try {
            val ordreService = OrdreService(
                numeroOrdre = request.numeroOrdre,
                typeOrdre = TypeOrdreService.valueOf(request.typeOrdre),
                dateOrdre = request.dateOrdre,
                dateEffet = request.dateEffet,
                reference = request.reference,
                motif = request.motif,
                observations = request.observations,
                dureeArretJours = request.dureeArretJours
            )
            val created = ordreServiceService.create(marcheId, ordreService)
            val dto = ordreServiceService.toDTO(created)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(dto, "Ordre de service cree avec succes"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest()
                .body(ApiResponse.error(e.message ?: "Erreur de validation"))
        }
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun updateOrdreService(
        @PathVariable marcheId: Long,
        @PathVariable id: Long,
        @Valid @RequestBody request: CreateOrdreServiceRequest
    ): ResponseEntity<ApiResponse<OrdreServiceDTO>> {
        logger.info { "PUT /api/marches/$marcheId/ordres-service/$id" }
        return try {
            val ordreService = OrdreService(
                numeroOrdre = request.numeroOrdre,
                typeOrdre = TypeOrdreService.valueOf(request.typeOrdre),
                dateOrdre = request.dateOrdre,
                dateEffet = request.dateEffet,
                reference = request.reference,
                motif = request.motif,
                observations = request.observations,
                dureeArretJours = request.dureeArretJours
            )
            val updated = ordreServiceService.update(id, ordreService)
            val dto = ordreServiceService.toDTO(updated)
            ResponseEntity.ok(ApiResponse.success(dto, "Ordre de service mis a jour"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Ordre de service non trouve"))
        }
    }

    @DeleteMapping("/{id}")
    @WriteAccess
    fun deleteOrdreService(
        @PathVariable marcheId: Long,
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<Unit>> {
        logger.info { "DELETE /api/marches/$marcheId/ordres-service/$id" }
        return try {
            ordreServiceService.delete(id)
            ResponseEntity.ok(ApiResponse.success(Unit, "Ordre de service supprime"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Ordre de service non trouve"))
        }
    }
}
