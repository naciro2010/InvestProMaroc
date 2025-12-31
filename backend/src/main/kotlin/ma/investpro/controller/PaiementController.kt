package ma.investpro.controller

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
    fun getAllPaiements(): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: GET /api/paiements" }
        val paiements = paiementService.findAll()
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "data" to paiements,
            "message" to "Paiements récupérés avec succès"
        ))
    }

    @GetMapping("/{id}")
    fun getPaiementById(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: GET /api/paiements/$id" }
        return try {
            val paiement = paiementService.findById(id)
            if (paiement != null) {
                ResponseEntity.ok(mapOf(
                    "success" to true,
                    "data" to paiement,
                    "message" to "Paiement récupéré avec succès"
                ))
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf(
                    "success" to false,
                    "message" to "Paiement $id introuvable"
                ))
            }
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la récupération du paiement: ${e.message}"
            ))
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun createPaiement(@RequestBody paiement: Paiement): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: POST /api/paiements - Création paiement ${paiement.referencePaiement}" }
        return try {
            val createdPaiement = paiementService.create(paiement)
            ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
                "success" to true,
                "data" to createdPaiement,
                "message" to "Paiement créé avec succès"
            ))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to e.message
            ))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la création du paiement: ${e.message}"
            ))
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun updatePaiement(@PathVariable id: Long, @RequestBody paiement: Paiement): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: PUT /api/paiements/$id" }
        return try {
            val updatedPaiement = paiementService.update(id, paiement)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to updatedPaiement,
                "message" to "Paiement mis à jour avec succès"
            ))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to e.message
            ))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la mise à jour du paiement: ${e.message}"
            ))
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deletePaiement(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: DELETE /api/paiements/$id" }
        return try {
            paiementService.delete(id)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Paiement supprimé avec succès"
            ))
        } catch (e: IllegalArgumentException) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.badRequest().body(mapOf(
                "success" to false,
                "message" to e.message
            ))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la suppression du paiement: ${e.message}"
            ))
        }
    }

    @GetMapping("/statistiques")
    fun getStatistiques(): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: GET /api/paiements/statistiques" }
        return try {
            val stats = paiementService.getStatistiques()
            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to stats,
                "message" to "Statistiques récupérées avec succès"
            ))
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la récupération des statistiques: ${e.message}"
            ))
        }
    }
}
