package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.PaiementStatistiques
import ma.investpro.entity.Paiement
import ma.investpro.service.PaiementService
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/paiements")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000", "https://naciro2010.github.io"])
class PaiementController(private val paiementService: PaiementService) {

    @GetMapping
    fun getAllPaiements(): ResponseEntity<ApiResponse<List<Paiement>>> {
        logger.info { "GET /api/paiements" }
        val paiements = paiementService.findAll()
        return ResponseEntity.ok(ApiResponse(
            success = true,
            data = paiements,
            message = "Paiements recuperes avec succes"
        ))
    }

    @GetMapping("/{id}")
    fun getPaiementById(@PathVariable id: Long): ResponseEntity<ApiResponse<Paiement>> {
        logger.info { "GET /api/paiements/$id" }
        return try {
            val paiement = paiementService.findById(id)
            if (paiement != null) {
                ResponseEntity.ok(ApiResponse(
                    success = true,
                    data = paiement,
                    message = "Paiement recupere avec succes"
                ))
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse(
                    success = false,
                    data = null,
                    message = "Paiement $id introuvable"
                ))
            }
        } catch (e: Exception) {
            logger.error { "Error: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse(
                success = false,
                data = null,
                message = "Erreur lors de la recuperation du paiement: ${e.message}"
            ))
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun createPaiement(@RequestBody paiement: Paiement): ResponseEntity<ApiResponse<Paiement>> {
        logger.info { "POST /api/paiements - Creation paiement ${paiement.referencePaiement}" }
        return try {
            val createdPaiement = paiementService.create(paiement)
            ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse(
                success = true,
                data = createdPaiement,
                message = "Paiement cree avec succes"
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
                message = "Erreur lors de la creation du paiement: ${e.message}"
            ))
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun updatePaiement(@PathVariable id: Long, @RequestBody paiement: Paiement): ResponseEntity<ApiResponse<Paiement>> {
        logger.info { "PUT /api/paiements/$id" }
        return try {
            val updatedPaiement = paiementService.update(id, paiement)
            ResponseEntity.ok(ApiResponse(
                success = true,
                data = updatedPaiement,
                message = "Paiement mis a jour avec succes"
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
                message = "Erreur lors de la mise a jour du paiement: ${e.message}"
            ))
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deletePaiement(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        logger.info { "DELETE /api/paiements/$id" }
        return try {
            paiementService.delete(id)
            ResponseEntity.ok(ApiResponse(
                success = true,
                message = "Paiement supprime avec succes"
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
                message = "Erreur lors de la suppression du paiement: ${e.message}"
            ))
        }
    }

    @GetMapping("/statistiques")
    fun getStatistiques(): ResponseEntity<ApiResponse<PaiementStatistiques>> {
        logger.info { "GET /api/paiements/statistiques" }
        return try {
            val stats = paiementService.getStatistiques()
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
