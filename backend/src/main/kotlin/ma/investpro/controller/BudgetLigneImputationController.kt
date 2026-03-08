package ma.investpro.controller

import jakarta.validation.Valid
import ma.investpro.dto.ApiResponse
import ma.investpro.dto.BudgetDistributionResponse
import ma.investpro.dto.BudgetLigneImputationDTO
import ma.investpro.dto.BudgetLigneWithImputationsDTO
import ma.investpro.dto.CreateBudgetLigneImputationRequest
import ma.investpro.dto.UpdateBudgetLigneImputationRequest
import ma.investpro.mapper.BudgetLigneImputationMapper
import ma.investpro.mapper.ConventionBudgetLigneMapper
import ma.investpro.repository.DecompteRepository
import ma.investpro.repository.MarcheRepository
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.service.BudgetLigneImputationService
import ma.investpro.service.ConventionBudgetLigneService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/api/conventions/{conventionId}")
class BudgetLigneImputationController(
    private val budgetLigneImputationService: BudgetLigneImputationService,
    private val conventionBudgetLigneService: ConventionBudgetLigneService,
    private val budgetLigneImputationMapper: BudgetLigneImputationMapper,
    private val conventionBudgetLigneMapper: ConventionBudgetLigneMapper,
    private val marcheRepository: MarcheRepository,
    private val decompteRepository: DecompteRepository
) {

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

    @GetMapping("/budget-distribution")
    @ReadAccess
    fun getBudgetDistribution(
        @PathVariable conventionId: Long
    ): ResponseEntity<ApiResponse<BudgetDistributionResponse>> {
        val lignes = conventionBudgetLigneService.findByConventionId(conventionId)
        val ligneIds = lignes.mapNotNull { it.id }
        val allImputations = budgetLigneImputationService.findByBudgetLigneIds(ligneIds)

        val imputationsByLigne = allImputations.groupBy { it.budgetLigne?.id }

        val lignesDTO: List<BudgetLigneWithImputationsDTO> = lignes.map { ligne ->
            val ligneImputations = imputationsByLigne[ligne.id] ?: emptyList()

            val budgetImps = ligneImputations.filter { it.typeImputation == "BUDGET" }
            val engagementImps = ligneImputations.filter { it.typeImputation == "ENGAGEMENT" }
            val depenseImps = ligneImputations.filter { it.typeImputation == "DEPENSE" }

            BudgetLigneWithImputationsDTO(
                budgetLigne = conventionBudgetLigneMapper.toDTO(ligne),
                imputationsBudget = budgetLigneImputationMapper.toDTOList(budgetImps),
                imputationsEngagement = budgetLigneImputationMapper.toDTOList(engagementImps),
                imputationsDepense = budgetLigneImputationMapper.toDTOList(depenseImps),
                totalPourcentageBudget = budgetImps.sumOf { it.pourcentage },
                totalPourcentageEngagement = engagementImps.sumOf { it.pourcentage },
                totalPourcentageDepense = depenseImps.sumOf { it.pourcentage }
            )
        }

        // Compute engagement from marchés linked to this convention
        val marches = marcheRepository.findByConventionId(conventionId)
        val totalEngagement = marches.fold(BigDecimal.ZERO) { acc, m -> acc.add(m.montantTtc) }

        // Compute dépenses from décomptes of those marchés
        val totalDepenses = marches.fold(BigDecimal.ZERO) { acc, m ->
            val decomptes = decompteRepository.findByMarcheId(m.id!!)
            acc.add(decomptes.fold(BigDecimal.ZERO) { dAcc, d -> dAcc.add(d.netAPayer) })
        }

        val totalBudget = lignes.fold(BigDecimal.ZERO) { acc, l -> acc.add(l.montant) }

        val response = BudgetDistributionResponse(
            lignes = lignesDTO,
            totalEngagement = totalEngagement,
            totalDepenses = totalDepenses,
            totalResteAEngager = totalBudget.subtract(totalEngagement),
            totalResteAPayer = totalEngagement.subtract(totalDepenses)
        )

        return ResponseEntity.ok(
            ApiResponse.success(response, "Distribution budgétaire récupérée avec succès")
        )
    }

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
            pourcentage = request.pourcentage,
            typeImputation = request.typeImputation
        )

        val dto = budgetLigneImputationMapper.toDTO(imputation)
        return ResponseEntity.ok(ApiResponse.success(dto, "Imputation ajoutée avec succès"))
    }

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
