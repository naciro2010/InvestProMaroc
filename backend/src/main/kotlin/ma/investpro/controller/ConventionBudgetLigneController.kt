package ma.investpro.controller

import jakarta.validation.Valid
import ma.investpro.dto.ApiResponse
import ma.investpro.dto.ConventionBudgetLigneDTO
import ma.investpro.dto.CreateConventionBudgetLigneRequest
import ma.investpro.dto.UpdateConventionBudgetLigneRequest
import ma.investpro.entity.ConventionBudgetLigne
import ma.investpro.mapper.ConventionBudgetLigneMapper
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.service.ConventionBudgetLigneService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * Contrôleur REST pour la gestion des lignes de répartition budgétaire
 * par catégorie de dépense dans une convention.
 *
 * Endpoints:
 * - GET    /api/conventions/{conventionId}/budget-lignes
 * - POST   /api/conventions/{conventionId}/budget-lignes
 * - PUT    /api/conventions/{conventionId}/budget-lignes/{id}
 * - DELETE /api/conventions/{conventionId}/budget-lignes/{id}
 */
@RestController
@RequestMapping("/api/conventions/{conventionId}/budget-lignes")
class ConventionBudgetLigneController(
    private val conventionBudgetLigneService: ConventionBudgetLigneService,
    private val conventionBudgetLigneMapper: ConventionBudgetLigneMapper
) {

    /**
     * Récupère toutes les lignes de budget d'une convention
     */
    @GetMapping
    @ReadAccess
    fun getAllBudgetLignes(
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<List<ConventionBudgetLigneDTO>>> {
        val lignes: List<ConventionBudgetLigne> = conventionBudgetLigneService.findByConventionId(conventionId)
        val dtos: List<ConventionBudgetLigneDTO> = conventionBudgetLigneMapper.toDTOList(lignes)
        return ResponseEntity.ok(ApiResponse.success(dtos, "Lignes de budget récupérées avec succès"))
    }

    /**
     * Ajoute une ligne de budget à une convention
     */
    @PostMapping
    @WriteAccess
    fun addBudgetLigne(
        @PathVariable conventionId: Long,
        @Valid @RequestBody request: CreateConventionBudgetLigneRequest
    ): ResponseEntity<ApiResponse<ConventionBudgetLigneDTO>> {
        val budgetLigne: ConventionBudgetLigne = conventionBudgetLigneService.addBudgetLigne(
            conventionId = conventionId,
            categorieDepenseId = request.categorieDepenseId,
            montant = request.montant,
            engagementMontant = request.engagementMontant,
            depensesMontant = request.depensesMontant,
            designation = request.designation,
            remarques = request.remarques
        )

        val dto: ConventionBudgetLigneDTO = conventionBudgetLigneMapper.toDTO(budgetLigne)
        return ResponseEntity.ok(ApiResponse.success(dto, "Ligne de budget ajoutée avec succès"))
    }

    /**
     * Met à jour une ligne de budget
     */
    @PutMapping("/{id}")
    @WriteAccess
    fun updateBudgetLigne(
        @PathVariable conventionId: Long,
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateConventionBudgetLigneRequest
    ): ResponseEntity<ApiResponse<ConventionBudgetLigneDTO>> {
        val budgetLigne: ConventionBudgetLigne = conventionBudgetLigneService.updateBudgetLigne(
            id = id,
            categorieDepenseId = request.categorieDepenseId,
            montant = request.montant,
            engagementMontant = request.engagementMontant,
            depensesMontant = request.depensesMontant,
            designation = request.designation,
            remarques = request.remarques
        )

        val dto: ConventionBudgetLigneDTO = conventionBudgetLigneMapper.toDTO(budgetLigne)
        return ResponseEntity.ok(ApiResponse.success(dto, "Ligne de budget mise à jour avec succès"))
    }

    /**
     * Supprime une ligne de budget (soft delete)
     */
    @DeleteMapping("/{id}")
    @WriteAccess
    fun deleteBudgetLigne(
        @PathVariable conventionId: Long,
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<Unit>> {
        conventionBudgetLigneService.deleteBudgetLigne(id)
        return ResponseEntity.ok(ApiResponse.success(Unit, "Ligne de budget supprimée avec succès"))
    }
}
