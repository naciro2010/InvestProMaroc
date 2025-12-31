package ma.investpro.controller

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
    fun getAllOrdresPaiement(): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: GET /api/ordres-paiement" }
        val ordresPaiement = ordrePaiementService.findAll()
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "data" to ordresPaiement,
            "message" to "Ordres de paiement récupérés avec succès"
        ))
    }

    @GetMapping("/{id}")
    fun getOrdrePaiementById(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: GET /api/ordres-paiement/$id" }
        return try {
            val ordrePaiement = ordrePaiementService.findById(id)
            if (ordrePaiement != null) {
                ResponseEntity.ok(mapOf(
                    "success" to true,
                    "data" to ordrePaiement,
                    "message" to "Ordre de paiement récupéré avec succès"
                ))
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf(
                    "success" to false,
                    "message" to "Ordre de paiement $id introuvable"
                ))
            }
        } catch (e: Exception) {
            logger.error { "❌ API ERROR: ${e.message}" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "success" to false,
                "message" to "Erreur lors de la récupération de l'ordre de paiement: ${e.message}"
            ))
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun createOrdrePaiement(@RequestBody ordrePaiement: OrdrePaiement): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: POST /api/ordres-paiement - Création OP ${ordrePaiement.numeroOP}" }
        return try {
            val createdOrdrePaiement = ordrePaiementService.create(ordrePaiement)
            ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
                "success" to true,
                "data" to createdOrdrePaiement,
                "message" to "Ordre de paiement créé avec succès"
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
                "message" to "Erreur lors de la création de l'ordre de paiement: ${e.message}"
            ))
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun updateOrdrePaiement(@PathVariable id: Long, @RequestBody ordrePaiement: OrdrePaiement): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: PUT /api/ordres-paiement/$id" }
        return try {
            val updatedOrdrePaiement = ordrePaiementService.update(id, ordrePaiement)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to updatedOrdrePaiement,
                "message" to "Ordre de paiement mis à jour avec succès"
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
                "message" to "Erreur lors de la mise à jour de l'ordre de paiement: ${e.message}"
            ))
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteOrdrePaiement(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: DELETE /api/ordres-paiement/$id" }
        return try {
            ordrePaiementService.delete(id)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "message" to "Ordre de paiement supprimé avec succès"
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
                "message" to "Erreur lors de la suppression de l'ordre de paiement: ${e.message}"
            ))
        }
    }

    @PostMapping("/{id}/valider")
    @PreAuthorize("hasRole('ADMIN')")
    fun validerOrdrePaiement(@PathVariable id: Long, @RequestBody body: Map<String, Long>): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: POST /api/ordres-paiement/$id/valider" }
        return try {
            val valideParId = body["valideParId"] ?: throw IllegalArgumentException("valideParId requis")
            val ordrePaiement = ordrePaiementService.valider(id, valideParId)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to ordrePaiement,
                "message" to "Ordre de paiement validé avec succès"
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
                "message" to "Erreur lors de la validation de l'ordre de paiement: ${e.message}"
            ))
        }
    }

    @PostMapping("/{id}/executer")
    @PreAuthorize("hasRole('ADMIN')")
    fun executerOrdrePaiement(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: POST /api/ordres-paiement/$id/executer" }
        return try {
            val ordrePaiement = ordrePaiementService.executer(id)
            ResponseEntity.ok(mapOf(
                "success" to true,
                "data" to ordrePaiement,
                "message" to "Ordre de paiement exécuté avec succès"
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
                "message" to "Erreur lors de l'exécution de l'ordre de paiement: ${e.message}"
            ))
        }
    }

    @GetMapping("/statistiques")
    fun getStatistiques(): ResponseEntity<Map<String, Any>> {
        logger.info { "🌐 API: GET /api/ordres-paiement/statistiques" }
        return try {
            val stats = ordrePaiementService.getStatistiques()
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
