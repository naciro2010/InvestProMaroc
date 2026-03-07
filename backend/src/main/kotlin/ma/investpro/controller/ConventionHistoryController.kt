package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.entity.Convention
import ma.investpro.entity.TypeConvention
import ma.investpro.entity.User
import ma.investpro.mapper.ConventionMapper
import ma.investpro.mapper.ConventionModificationMapper
import ma.investpro.service.ConventionService
import ma.investpro.repository.UserRepository
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import jakarta.validation.Valid

/**
 * Historique des modifications de Convention.
 */
@RestController
@RequestMapping("/api/conventions")
class ConventionHistoryController(
    private val conventionService: ConventionService,
    private val conventionMapper: ConventionMapper,
    private val conventionModificationMapper: ConventionModificationMapper,
    private val userRepository: UserRepository
) {

    @PutMapping("/{id}/with-history")
    @WriteAccess
    fun updateWithHistory(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateConventionWithHistoryRequest
    ): ResponseEntity<ApiResponse<ConventionDTO>> {
        return try {
            val user: User = userRepository.findById(request.modifieParId).orElseThrow {
                IllegalArgumentException("Utilisateur non trouvé")
            }
            val convention: Convention = conventionService.findById(id)
                ?: throw IllegalArgumentException("Convention non trouvée")

            convention.apply {
                libelle = request.libelle
                numero = request.numero
                objet = request.objet
                typeConvention = TypeConvention.valueOf(request.typeConvention)
                tauxCommission = request.tauxCommission
                budget = request.budget
                baseCalcul = request.baseCalcul ?: "DECAISSEMENTS_TTC"
                tauxTva = request.tauxTva
                tauxTvaLignes = request.tauxTvaLignes ?: tauxTvaLignes
                dateDebut = request.dateDebut
                dateFin = request.dateFin
                description = request.description
            }

            val updated: Convention = conventionService.updateWithHistory(
                id = id, convention = convention,
                motifModification = request.motifModification, modifiePar = user
            )
            val dto: ConventionDTO = conventionMapper.toDTO(updated)
            ResponseEntity.ok(ApiResponse.success(dto, "Convention modifiée avec succès"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur de validation"))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la modification: ${e.message}"))
        }
    }

    @GetMapping("/{id}/historique")
    @ReadAccess
    fun getHistorique(@PathVariable id: Long): ResponseEntity<ApiResponse<List<ConventionModificationDTO>>> {
        return try {
            val historique: List<ConventionModificationDTO> = conventionService.getHistoriqueModifications(id)
                .let { modifications -> conventionModificationMapper.toDTOList(modifications) }
            ResponseEntity.ok(ApiResponse.success(historique))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération de l'historique"))
        }
    }

    @GetMapping("/{id}/historique/derniers/{limit}")
    @ReadAccess
    fun getDernieresModifications(
        @PathVariable id: Long,
        @PathVariable limit: Int
    ): ResponseEntity<ApiResponse<List<ConventionModificationDTO>>> {
        return try {
            val historique: List<ConventionModificationDTO> = conventionService.getDernieresModifications(id, limit)
                .let { modifications -> conventionModificationMapper.toDTOList(modifications) }
            ResponseEntity.ok(ApiResponse.success(historique))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération de l'historique"))
        }
    }

    @GetMapping("/{id}/a-ete-modifiee")
    @ReadAccess
    fun aEteModifiee(@PathVariable id: Long): ResponseEntity<ApiResponse<Boolean>> {
        return try {
            val modifiee: Boolean = conventionService.aEteModifiee(id)
            ResponseEntity.ok(ApiResponse.success(modifiee))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la vérification"))
        }
    }
}
