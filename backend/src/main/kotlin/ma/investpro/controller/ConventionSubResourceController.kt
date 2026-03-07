package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.entity.ImputationPrevisionnelle
import ma.investpro.entity.VersementPrevisionnel
import ma.investpro.repository.ImputationPrevisionnelleRepository
import ma.investpro.repository.VersementPrevisionnelRepository
import ma.investpro.repository.PartenaireRepository
import ma.investpro.service.ConventionService
import ma.investpro.service.MarcheService
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import jakarta.validation.Valid

/**
 * Sous-ressources de Convention: imputations, versements, liens marchés.
 */
@RestController
@RequestMapping("/api/conventions")
class ConventionSubResourceController(
    private val conventionService: ConventionService,
    private val imputationRepository: ImputationPrevisionnelleRepository,
    private val versementRepository: VersementPrevisionnelRepository,
    private val partenaireRepository: PartenaireRepository,
    private val marcheService: MarcheService
) {

    // ========== Imputations Prévisionnelles ==========

    @GetMapping("/{conventionId}/imputations")
    @ReadAccess
    fun getImputations(@PathVariable conventionId: Long): ResponseEntity<ApiResponse<List<ImputationPrevisionnelleDTO>>> {
        return try {
            val imputations = imputationRepository.findByConventionId(conventionId)
            val dtos = imputations.map { imputation ->
                ImputationPrevisionnelleDTO(
                    id = imputation.id,
                    conventionId = imputation.convention?.id ?: 0,
                    volet = imputation.volet,
                    dateDemarrage = imputation.dateDemarrage,
                    delaiMois = imputation.delaiMois,
                    dateFinPrevue = imputation.dateFinPrevue,
                    montantPrevu = imputation.montantPrevu,
                    remarques = imputation.remarques,
                    actif = imputation.actif,
                    createdAt = imputation.createdAt,
                    updatedAt = imputation.updatedAt
                )
            }
            ResponseEntity.ok(ApiResponse.success(dtos))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des imputations"))
        }
    }

    @PostMapping("/{conventionId}/imputations")
    @WriteAccess
    fun ajouterImputation(
        @PathVariable conventionId: Long,
        @Valid @RequestBody imputation: ImputationPrevisionnelle
    ): ResponseEntity<ImputationPrevisionnelleDTO> {
        return try {
            val convention = conventionService.findById(conventionId)
                ?: return ResponseEntity.notFound().build()

            imputation.convention = convention
            if (imputation.dateFinPrevue == null) {
                imputation.dateFinPrevue = imputation.dateDemarrage.plusMonths(imputation.delaiMois.toLong())
            }

            val saved = imputationRepository.save(imputation)
            val dto = ImputationPrevisionnelleDTO(
                id = saved.id, conventionId = saved.convention?.id ?: 0,
                volet = saved.volet, dateDemarrage = saved.dateDemarrage,
                delaiMois = saved.delaiMois, dateFinPrevue = saved.dateFinPrevue,
                montantPrevu = saved.montantPrevu, remarques = saved.remarques,
                actif = saved.actif, createdAt = saved.createdAt, updatedAt = saved.updatedAt
            )
            ResponseEntity.status(HttpStatus.CREATED).body(dto)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{conventionId}/imputations/{imputationId}")
    @WriteAccess
    fun supprimerImputation(
        @PathVariable conventionId: Long,
        @PathVariable imputationId: Long
    ): ResponseEntity<Void> {
        return try {
            imputationRepository.deleteById(imputationId)
            ResponseEntity.noContent().build()
        } catch (e: Exception) {
            ResponseEntity.notFound().build()
        }
    }

    // ========== Versements Prévisionnels ==========

    @PostMapping("/{conventionId}/versements")
    @WriteAccess
    fun ajouterVersement(
        @PathVariable conventionId: Long,
        @Valid @RequestBody request: Map<String, @JvmSuppressWildcards Any?>
    ): ResponseEntity<VersementPrevisionnelDTO> {
        return try {
            val convention = conventionService.findById(conventionId)
                ?: return ResponseEntity.notFound().build()

            val versement = VersementPrevisionnel().apply {
                this.convention = convention
                volet = request["volet"] as? String
                dateVersement = java.time.LocalDate.parse(request["dateVersement"] as String)
                montant = (request["montant"] as? Number)?.let { java.math.BigDecimal(it.toString()) } ?: java.math.BigDecimal.ZERO
                montantPrevu = (request["montantPrevu"] as? Number)?.let { java.math.BigDecimal(it.toString()) }
                remarques = request["remarques"] as? String
                (request["partenaireId"] as? Number)?.toLong()?.let { pid ->
                    partenaire = partenaireRepository.findById(pid).orElse(null)
                }
                (request["modId"] as? Number)?.toLong()?.let { modId ->
                    maitreOeuvreDelegue = partenaireRepository.findById(modId).orElse(null)
                }
            }

            val saved = versementRepository.save(versement)
            val dto = VersementPrevisionnelDTO(
                id = saved.id, conventionId = saved.convention?.id ?: 0,
                volet = saved.volet, dateVersement = saved.dateVersement,
                montant = saved.montant, montantPrevu = saved.montantPrevu,
                partenaireId = saved.partenaire?.id ?: 0,
                partenaireNom = saved.partenaire?.raisonSociale,
                maitreOeuvreDelegueId = saved.maitreOeuvreDelegue?.id,
                maitreOeuvreDelegueNom = saved.maitreOeuvreDelegue?.raisonSociale,
                remarques = saved.remarques, actif = saved.actif,
                createdAt = saved.createdAt, updatedAt = saved.updatedAt
            )
            ResponseEntity.status(HttpStatus.CREATED).body(dto)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    @DeleteMapping("/{conventionId}/versements/{versementId}")
    @WriteAccess
    fun supprimerVersement(
        @PathVariable conventionId: Long,
        @PathVariable versementId: Long
    ): ResponseEntity<Void> {
        return try {
            versementRepository.deleteById(versementId)
            ResponseEntity.noContent().build()
        } catch (e: Exception) {
            ResponseEntity.notFound().build()
        }
    }

    // ========== Marché Linking ==========

    @PostMapping("/{conventionId}/marches/{marcheId}")
    @WriteAccess
    fun linkMarche(
        @PathVariable conventionId: Long,
        @PathVariable marcheId: Long
    ): ResponseEntity<ApiResponse<Unit>> {
        return try {
            marcheService.linkMarcheToConvention(marcheId, conventionId)
            ResponseEntity.ok(ApiResponse.success(Unit, "Marché lié à la convention avec succès"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marché ou convention non trouvé"))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la liaison du marché"))
        }
    }

    @DeleteMapping("/{conventionId}/marches/{marcheId}")
    @WriteAccess
    fun unlinkMarche(
        @PathVariable conventionId: Long,
        @PathVariable marcheId: Long
    ): ResponseEntity<ApiResponse<Unit>> {
        return try {
            marcheService.unlinkMarcheFromConvention(marcheId)
            ResponseEntity.ok(ApiResponse.success(Unit, "Marché délié de la convention avec succès"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.message ?: "Marché non trouvé"))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la suppression de la liaison"))
        }
    }
}
