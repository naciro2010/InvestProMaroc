package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.OrdrePaiementStatistiques
import ma.investpro.entity.OrdrePaiement
import ma.investpro.service.OrdrePaiementService
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/ordres-paiement")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000", "https://naciro2010.github.io"])
class OrdrePaiementController(private val ordrePaiementService: OrdrePaiementService) {

    @GetMapping
    fun getAllOrdresPaiement(): ResponseEntity<ApiResponse<List<OrdrePaiement>>> {
        logger.info { "GET /api/ordres-paiement" }
        val ordresPaiement = ordrePaiementService.findAll()
        return ResponseEntity.ok(ApiResponse(
            success = true,
            data = ordresPaiement,
            message = "Ordres de paiement recuperes avec succes"
        ))
    }

    @GetMapping("/{id}")
    fun getOrdrePaiementById(@PathVariable id: Long): ResponseEntity<ApiResponse<OrdrePaiement>> {
        logger.info { "GET /api/ordres-paiement/$id" }
        return try {
            val ordrePaiement = ordrePaiementService.findById(id)
            if (ordrePaiement != null) {
                ResponseEntity.ok(ApiResponse(
                    success = true,
                    data = ordrePaiement,
                    message = "Ordre de paiement recupere avec succes"
                ))
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse(
                    success = false,
                    data = null,
                    message = "Ordre de paiement $id introuvable"
                ))
            }
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la recuperation de l'ordre de paiement: ${e.message}"
            ))
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun createOrdrePaiement(@RequestBody ordrePaiement: OrdrePaiement): ResponseEntity<ApiResponse<OrdrePaiement>> {
        logger.info { "POST /api/ordres-paiement - Creation OP ${ordrePaiement.numeroOP}" }
        return try {
            val createdOrdrePaiement = ordrePaiementService.create(ordrePaiement)
            ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse(
                success = true,
                data = createdOrdrePaiement,
                message = "Ordre de paiement cree avec succes"
            ))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Validation error: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse(
                success = false,
                data = null,
                message = e.message ?: "Erreur de validation"
            ))
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la creation de l'ordre de paiement: ${e.message}"
            ))
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun updateOrdrePaiement(@PathVariable id: Long, @RequestBody ordrePaiement: OrdrePaiement): ResponseEntity<ApiResponse<OrdrePaiement>> {
        logger.info { "PUT /api/ordres-paiement/$id" }
        return try {
            val updatedOrdrePaiement = ordrePaiementService.update(id, ordrePaiement)
            ResponseEntity.ok(ApiResponse(
                success = true,
                data = updatedOrdrePaiement,
                message = "Ordre de paiement mis a jour avec succes"
            ))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Validation error: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse(
                success = false,
                data = null,
                message = e.message ?: "Erreur de validation"
            ))
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la mise a jour de l'ordre de paiement: ${e.message}"
            ))
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteOrdrePaiement(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        logger.info { "DELETE /api/ordres-paiement/$id" }
        return try {
            ordrePaiementService.delete(id)
            ResponseEntity.ok(ApiResponse(
                success = true,
                message = "Ordre de paiement supprime avec succes"
            ))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Validation error: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse(
                success = false,
                data = null,
                message = e.message ?: "Erreur de validation"
            ))
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la suppression de l'ordre de paiement: ${e.message}"
            ))
        }
    }

    @PostMapping("/{id}/valider")
    @PreAuthorize("hasRole('ADMIN')")
    fun validerOrdrePaiement(@PathVariable id: Long, @RequestBody body: Map<String, Long>): ResponseEntity<ApiResponse<OrdrePaiement>> {
        logger.info { "POST /api/ordres-paiement/$id/valider" }
        return try {
            val valideParId = body["valideParId"] ?: throw IllegalArgumentException("valideParId requis")
            val ordrePaiement = ordrePaiementService.valider(id, valideParId)
            ResponseEntity.ok(ApiResponse(
                success = true,
                data = ordrePaiement,
                message = "Ordre de paiement valide avec succes"
            ))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Validation error: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse(
                success = false,
                data = null,
                message = e.message ?: "Erreur de validation"
            ))
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la validation de l'ordre de paiement: ${e.message}"
            ))
        }
    }

    @PostMapping("/{id}/executer")
    @PreAuthorize("hasRole('ADMIN')")
    fun executerOrdrePaiement(@PathVariable id: Long): ResponseEntity<ApiResponse<OrdrePaiement>> {
        logger.info { "POST /api/ordres-paiement/$id/executer" }
        return try {
            val ordrePaiement = ordrePaiementService.executer(id)
            ResponseEntity.ok(ApiResponse(
                success = true,
                data = ordrePaiement,
                message = "Ordre de paiement execute avec succes"
            ))
        } catch (e: IllegalArgumentException) {
            logger.warn { "Validation error: ${e.message}" }
            ResponseEntity.badRequest().body(ApiResponse(
                success = false,
                data = null,
                message = e.message ?: "Erreur de validation"
            ))
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de l'execution de l'ordre de paiement: ${e.message}"
            ))
        }
    }

    @GetMapping("/statistiques")
    fun getStatistiques(): ResponseEntity<ApiResponse<OrdrePaiementStatistiques>> {
        logger.info { "GET /api/ordres-paiement/statistiques" }
        return try {
            val stats = ordrePaiementService.getStatistiques()
            ResponseEntity.ok(ApiResponse(
                success = true,
                data = stats,
                message = "Statistiques recuperees avec succes"
            ))
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la recuperation des statistiques: ${e.message}"
            ))
        }
    }
}
