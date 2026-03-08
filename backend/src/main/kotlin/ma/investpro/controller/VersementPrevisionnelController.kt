package ma.investpro.controller

import ma.investpro.dto.ApiResponse
import ma.investpro.dto.VersementPrevisionnelDTO
import ma.investpro.entity.VersementPrevisionnel
import ma.investpro.repository.VersementPrevisionnelRepository
import ma.investpro.repository.ConventionRepository
import ma.investpro.repository.PartenaireRepository
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Contrôleur REST pour la gestion des Versements Prévisionnels.
 */
@RestController
@RequestMapping("/api")
class VersementPrevisionnelController(
    private val versementRepository: VersementPrevisionnelRepository,
    private val conventionRepository: ConventionRepository,
    private val partenaireRepository: PartenaireRepository
) {

    // ========== GET Endpoints ==========

    @GetMapping("/versements-previsionnels")
    @ReadAccess
    fun getAll(): ResponseEntity<ApiResponse<List<VersementPrevisionnelDTO>>> {
        val versements = versementRepository.findAll()
        val dtos = versements.map { toDTO(it) }
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @GetMapping("/versements-previsionnels/{id}")
    @ReadAccess
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<VersementPrevisionnelDTO>> {
        val versement = versementRepository.findById(id).orElse(null)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Versement non trouvé"))
        return ResponseEntity.ok(ApiResponse.success(toDTO(versement)))
    }

    @GetMapping("/conventions/{conventionId}/versements-previsionnels")
    @ReadAccess
    fun getByConvention(@PathVariable conventionId: Long): ResponseEntity<ApiResponse<List<VersementPrevisionnelDTO>>> {
        val versements = versementRepository.findByConventionId(conventionId)
        val dtos = versements.map { toDTO(it) }
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    data class VersementStatsDTO(val total: Long, val montantTotal: java.math.BigDecimal)

    @GetMapping("/versements-previsionnels/stats")
    @ReadAccess

    fun getStats(): ResponseEntity<ApiResponse<VersementStatsDTO>> {
        val total = versementRepository.count()
        val montantTotal = versementRepository.findAll().sumOf { it.montant }
        return ResponseEntity.ok(ApiResponse.success(VersementStatsDTO(
            total = total,
            montantTotal = montantTotal
        )))
    }

    // ========== CREATE Endpoint ==========

    @PostMapping("/conventions/{conventionId}/versements-previsionnels")
    @WriteAccess
    fun create(
        @PathVariable conventionId: Long,
        @Valid @RequestBody request: VersementPrevisionnelRequest
    ): ResponseEntity<ApiResponse<VersementPrevisionnelDTO>> {
        return try {
            val convention = conventionRepository.findById(conventionId).orElse(null)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Convention non trouvée"))

            val versement = VersementPrevisionnel().apply {
                this.convention = convention
                this.volet = request.volet
                this.dateVersement = LocalDate.parse(request.dateVersement)
                this.montant = request.montant
                this.montantPrevu = request.montantPrevu
                this.remarques = request.remarques

                // Partenaire bénéficiaire
                request.partenaireId?.let { pid ->
                    this.partenaire = partenaireRepository.findById(pid).orElse(null)
                }

                // MOD responsable
                request.modId?.let { modId ->
                    this.maitreOeuvreDelegue = partenaireRepository.findById(modId).orElse(null)
                }
            }

            val saved = versementRepository.save(versement)
            ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toDTO(saved), "Versement créé avec succès"))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(ApiResponse.error("Erreur lors de la création: ${e.message}"))
        }
    }

    // ========== UPDATE Endpoint ==========

    @PutMapping("/versements-previsionnels/{id}")
    @WriteAccess
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody request: VersementPrevisionnelRequest
    ): ResponseEntity<ApiResponse<VersementPrevisionnelDTO>> {
        return try {
            val versement = versementRepository.findById(id).orElse(null)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Versement non trouvé"))

            versement.apply {
                this.volet = request.volet
                this.dateVersement = LocalDate.parse(request.dateVersement)
                this.montant = request.montant
                this.montantPrevu = request.montantPrevu
                this.remarques = request.remarques

                // Partenaire bénéficiaire
                request.partenaireId?.let { pid ->
                    this.partenaire = partenaireRepository.findById(pid).orElse(null)
                } ?: run { this.partenaire = null }

                // MOD responsable
                request.modId?.let { modId ->
                    this.maitreOeuvreDelegue = partenaireRepository.findById(modId).orElse(null)
                } ?: run { this.maitreOeuvreDelegue = null }
            }

            val saved = versementRepository.save(versement)
            ResponseEntity.ok(ApiResponse.success(toDTO(saved), "Versement mis à jour avec succès"))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(ApiResponse.error("Erreur lors de la mise à jour: ${e.message}"))
        }
    }

    // ========== DELETE Endpoint ==========

    @DeleteMapping("/versements-previsionnels/{id}")
    @WriteAccess
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        return try {
            if (!versementRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Versement non trouvé"))
            }
            versementRepository.deleteById(id)
            ResponseEntity.ok(ApiResponse.success(Unit, "Versement supprimé avec succès"))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(ApiResponse.error("Erreur lors de la suppression: ${e.message}"))
        }
    }

    // ========== Helper Methods ==========

    private fun toDTO(versement: VersementPrevisionnel): VersementPrevisionnelDTO {
        return VersementPrevisionnelDTO(
            id = versement.id,
            conventionId = versement.convention?.id ?: 0,
            volet = versement.volet,
            dateVersement = versement.dateVersement,
            montant = versement.montant,
            montantPrevu = versement.montantPrevu,
            partenaireId = versement.partenaire?.id ?: 0,
            partenaireNom = versement.partenaire?.raisonSociale,
            maitreOeuvreDelegueId = versement.maitreOeuvreDelegue?.id,
            maitreOeuvreDelegueNom = versement.maitreOeuvreDelegue?.raisonSociale,
            remarques = versement.remarques,
            actif = versement.actif,
            createdAt = versement.createdAt,
            updatedAt = versement.updatedAt
        )
    }
}

/**
 * Request DTO for creating/updating versements
 */
data class VersementPrevisionnelRequest(
    val volet: String? = null,
    val dateVersement: String,
    val montant: BigDecimal,
    val montantPrevu: BigDecimal? = null,
    val remarques: String? = null,
    val partenaireId: Long? = null,
    val modId: Long? = null,
    // Additional fields for frontend compatibility
    val axe: String? = null,
    val projet: String? = null
)
