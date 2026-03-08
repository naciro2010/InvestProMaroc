package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.ConventionSummaryDTO
import ma.investpro.dto.FournisseurSummaryDTO
import ma.investpro.dto.MarcheSummaryDTO
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.service.CascadeService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * Contrôleur pour les résumés cascade (auto-fill Odoo-style).
 * Endpoints légers pour enrichir les dropdowns dans les formulaires.
 */
@RestController
@RequestMapping("/api/cascade")
class CascadeController(
    private val cascadeService: CascadeService
) {

    /**
     * Résumé d'une convention (pour auto-fill dans formulaire Marché).
     * Retourne budget, taux, engagé, décaissé, payé, etc.
     */
    @GetMapping("/conventions/{id}/summary")
    @ReadAccess
    fun getConventionSummary(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionSummaryDTO>> {
        val summary = cascadeService.getConventionSummary(id)
        return ResponseEntity.ok(ApiResponse.success(summary))
    }

    /**
     * Résumé d'un marché (pour auto-fill dans formulaire Décompte).
     * Retourne montants, cumul, restant, taux avancement, etc.
     */
    @GetMapping("/marches/{id}/summary")
    @ReadAccess
    fun getMarcheSummary(@PathVariable id: Long): ResponseEntity<ApiResponse<MarcheSummaryDTO>> {
        val summary = cascadeService.getMarcheSummary(id)
        return ResponseEntity.ok(ApiResponse.success(summary))
    }

    /**
     * Résumé d'un fournisseur (pour auto-fill dans formulaire Marché).
     * Retourne coordonnées, stats marchés, etc.
     */
    @GetMapping("/fournisseurs/{id}/summary")
    @ReadAccess
    fun getFournisseurSummary(@PathVariable id: Long): ResponseEntity<ApiResponse<FournisseurSummaryDTO>> {
        val summary = cascadeService.getFournisseurSummary(id)
        return ResponseEntity.ok(ApiResponse.success(summary))
    }
}
