package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.EntityModificationDTO
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.service.EntityModificationService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * Controleur REST generique pour l'historique des modifications de toutes les entites.
 * Fournit un endpoint unique pour recuperer le chatter/historique style Odoo.
 */
@RestController
@RequestMapping("/api/historique")
class EntityModificationController(
    private val entityModificationService: EntityModificationService
) {

    @GetMapping("/{entityType}/{entityId}")
    @ReadAccess
    fun getHistorique(
        @PathVariable entityType: String,
        @PathVariable entityId: Long
    ): ResponseEntity<ApiResponse<List<EntityModificationDTO>>> {
        val historique = entityModificationService.getHistorique(entityType.uppercase(), entityId)
        return ResponseEntity.ok(ApiResponse.success(historique))
    }

    /**
     * Micro-endpoint: dernieres modifications globales (tous types d'entites).
     * Utile pour un flux d'activite global.
     */
    @GetMapping("/recent")
    @ReadAccess
    fun getRecentModifications(
        @RequestParam(defaultValue = "50") limit: Int
    ): ResponseEntity<ApiResponse<List<EntityModificationDTO>>> {
        val modifications = entityModificationService.getRecentModifications(limit.coerceIn(1, 100))
        return ResponseEntity.ok(ApiResponse.success(modifications))
    }
}
