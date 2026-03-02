package ma.investpro.controller

import jakarta.validation.Valid
import ma.investpro.dto.ApiResponse
import ma.investpro.dto.BudgetLigneImputationDTO
import ma.investpro.dto.BudgetLigneWithImputationsDTO
import ma.investpro.dto.CreateBudgetLigneImputationRequest
import ma.investpro.dto.UpdateBudgetLigneImputationRequest
import ma.investpro.mapper.BudgetLigneImputationMapper
import ma.investpro.mapper.ConventionBudgetLigneMapper
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.service.BudgetLigneImputationService
import ma.investpro.service.ConventionBudgetLigneService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

/**
 * Contrôleur REST pour la gestion des imputations par projet
 * sur les lignes de budget d'une convention.
 *
 * Endpoints:
 * - GET    /api/conventions/{conventionId}/budget-lignes/{ligneId}/imputations
 * - GET    /api/conventions/{conventionId}/budget-distribution
 * - POST   /api/conventions/{conventionId}/budget-lignes/{ligneId}/imputations
 * - PUT    /api/conventions/{conventionId}/budget-lignes/{ligneId}/imputations/{id}
 * - DELETE /api/conventions/{conventionId}/budget-lignes/{ligneId}/imputations/{id}
 */
@RestController
@RequestMapping("/api/conventions/{conventionId}")
class BudgetLigneImputationController(
    private val budgetLigneImputationService: BudgetLigneImputationService,
    private val conventionBudgetLigneService: ConventionBudgetLigneService,
    private val budgetLigneImputationMapper: BudgetLigneImputationMapper,
    private val conventionBudgetLigneMapper: ConventionBudgetLigneMapper
) {

    /**
     * Récupère toutes les imputations d'une ligne budget
     */
    @GetMapping("/budget-lignes/{ligneId}/imputations")
    @ReadAccess
    fun getImputations(
        @PathVariable conventionId: Long,
        @PathVariable ligneId: Long
    ): ResponseEntity<ApiResponse<List<BudgetLigneImputationDTO>>> {
        val imputations = budgetLigneImputationService.findByBudgetLigneId(ligneId)
        val dtos = budgetLigneImputationMapper.toDTOList(imputations)
        return ResponseEntity.ok(ApiResponse.success(dtos, "Imputations récupérées avec succès"))
    }

    /**
     * Récupère la distribution budgétaire complète d'une convention
     * (toutes les lignes budget + leurs imputations)
     */
    @GetMapping("/budget-distribution")
    @ReadAccess
    fun getBudgetDistribution(
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<List<BudgetLigneWithImputationsDTO>>> {
        val lignes = conventionBudgetLigneService.findByConventionId(conventionId)
        val ligneIds = lignes.mapNotNull { it.id }
        val allImputations = budgetLigneImputationService.findByBudgetLigneIds(ligneIds)

        // Group imputations by budget ligne id
        val imputationsByLigne = allImputations.groupBy { it.budgetLigne?.id }

        val result: List<BudgetLigneWithImputationsDTO> = lignes.map { ligne ->
            val ligneImputations = imputationsByLigne[ligne.id] ?: emptyList()
            val totalPourcentage = ligneImputations.sumOf { it.pourcentage }

            BudgetLigneWithImputationsDTO(
                budgetLigne = conventionBudgetLigneMapper.toDTO(ligne),
                imputations = budgetLigneImputationMapper.toDTOList(ligneImputations),
                totalPourcentageImpute = totalPourcentage
            )
        }

        return ResponseEntity.ok(
            ApiResponse.success(result, "Distribution budgétaire récupérée avec succès")
        )
    }

    /**
     * Ajoute une imputation à une ligne budget
     */
    @PostMapping("/budget-lignes/{ligneId}/imputations")
    @WriteAccess
    fun addImputation(
        @PathVariable conventionId: Long,
        @PathVariable ligneId: Long,
        @Valid @RequestBody request: CreateBudgetLigneImputationRequest
    ): ResponseEntity<ApiResponse<BudgetLigneImputationDTO>> {
        val imputation = budgetLigneImputationService.addImputation(
            budgetLigneId = ligneId,
            projetId = request.projetId,
            projetCode = request.projetCode,
            projetLibelle = request.projetLibelle,
            pourcentage = request.pourcentage
        )

        val dto = budgetLigneImputationMapper.toDTO(imputation)
        return ResponseEntity.ok(ApiResponse.success(dto, "Imputation ajoutée avec succès"))
    }

    /**
     * Met à jour une imputation
     */
    @PutMapping("/budget-lignes/{ligneId}/imputations/{id}")
    @WriteAccess
    fun updateImputation(
        @PathVariable conventionId: Long,
        @PathVariable ligneId: Long,
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateBudgetLigneImputationRequest
    ): ResponseEntity<ApiResponse<BudgetLigneImputationDTO>> {
        val imputation = budgetLigneImputationService.updateImputation(
            id = id,
            projetId = request.projetId,
            projetCode = request.projetCode,
            projetLibelle = request.projetLibelle,
            pourcentage = request.pourcentage
        )

        val dto = budgetLigneImputationMapper.toDTO(imputation)
        return ResponseEntity.ok(ApiResponse.success(dto, "Imputation mise à jour avec succès"))
    }

    /**
     * Supprime une imputation (soft delete)
     */
    @DeleteMapping("/budget-lignes/{ligneId}/imputations/{id}")
    @WriteAccess
    fun deleteImputation(
        @PathVariable conventionId: Long,
        @PathVariable ligneId: Long,
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<Unit>> {
        budgetLigneImputationService.deleteImputation(id)
        return ResponseEntity.ok(ApiResponse.success(Unit, "Imputation supprimée avec succès"))
    }
}
