package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.entity.Convention
import ma.investpro.entity.StatutConvention
import ma.investpro.entity.TypeConvention
import ma.investpro.entity.User
import ma.investpro.mapper.ConventionMapper
import ma.investpro.service.ConventionService
import ma.investpro.service.ConventionBudgetLigneService
import ma.investpro.service.ConventionPartenaireService
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import jakarta.validation.Valid

/**
 * Contrôleur REST principal pour les Conventions.
 * CRUD, workflow, sous-conventions et statistiques.
 *
 * Les sous-ressources (imputations, versements, marchés) sont dans ConventionSubResourceController.
 * L'historique des modifications est dans ConventionHistoryController.
 * Les micro-endpoints sont dans ConventionMicroController.
 */
@RestController
@RequestMapping("/api/conventions")
class ConventionController(
    private val conventionService: ConventionService,
    private val conventionBudgetLigneService: ConventionBudgetLigneService,
    private val conventionPartenaireService: ConventionPartenaireService,
    private val conventionMapper: ConventionMapper
) {

    // ========== CRUD ==========

    @GetMapping
    @ReadAccess
    fun getAll(): ResponseEntity<List<ConventionSimpleDTO>> {
        val conventions = conventionService.findAll()
        return ResponseEntity.ok(conventionMapper.toSimpleDTOList(conventions))
    }

    @GetMapping("/{id}")
    @ReadAccess
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionDTO>> {
        val convention = conventionService.findById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Convention non trouvée"))
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(convention), "Convention récupérée avec succès"))
    }

    @GetMapping("/code/{code}")
    @ReadAccess
    fun getByCode(@PathVariable code: String): ResponseEntity<ConventionDTO> {
        val convention = conventionService.findByCode(code) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(conventionMapper.toDTO(convention))
    }

    @GetMapping("/statut/{statut}")
    @ReadAccess
    fun getByStatut(@PathVariable statut: StatutConvention): ResponseEntity<List<ConventionSimpleDTO>> {
        return ResponseEntity.ok(conventionMapper.toSimpleDTOList(conventionService.findByStatut(statut)))
    }

    @GetMapping("/actives")
    @ReadAccess
    fun getActives(): ResponseEntity<List<ConventionSimpleDTO>> {
        return ResponseEntity.ok(conventionMapper.toSimpleDTOList(conventionService.findConventionsActives()))
    }

    @GetMapping("/racine")
    @ReadAccess
    fun getConventionsRacine(): ResponseEntity<List<ConventionSimpleDTO>> {
        return ResponseEntity.ok(conventionMapper.toSimpleDTOList(conventionService.findConventionsRacine()))
    }

    @PostMapping
    @WriteAccess
    fun create(@Valid @RequestBody request: CreateConventionRequest): ResponseEntity<ApiResponse<ConventionDTO>> {
        return try {
            val convention = mapRequestToConvention(request)
            val authentication = SecurityContextHolder.getContext().authentication
            val user = authentication.principal as? User
            convention.createdById = user?.id

            val created = conventionService.create(convention)
            saveRelatedEntities(created.id!!, request)

            val reloaded = conventionService.findById(created.id!!) ?: created
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(conventionMapper.toDTO(reloaded), "Convention créée avec succès"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur de validation"))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la création: ${e.message}"))
        }
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody request: CreateConventionRequest
    ): ResponseEntity<ApiResponse<ConventionDTO>> {
        return try {
            val convention = mapRequestToConvention(request)
            conventionService.update(id, convention)
            request.lignesBudget?.let { conventionBudgetLigneService.replaceAllForConvention(id, it) }
            request.partenaires?.let { conventionPartenaireService.replaceAllForConvention(id, it) }

            val reloaded = conventionService.findById(id)
                ?: return ResponseEntity.notFound().build()
            ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(reloaded), "Convention mise à jour avec succès"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur de validation"))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la mise à jour: ${e.message}"))
        }
    }

    @DeleteMapping("/{id}")
    @AdminOnly
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            conventionService.delete(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    // ========== Workflow ==========

    @PostMapping("/{id}/soumettre")
    @WriteAccess
    fun soumettre(@PathVariable id: Long): ResponseEntity<ConventionDTO> {
        return try {
            ResponseEntity.ok(conventionMapper.toDTO(conventionService.soumettre(id)))
        } catch (e: IllegalArgumentException) { ResponseEntity.badRequest().build() }
    }

    @PostMapping("/{id}/valider")
    @WriteAccess
    fun valider(@PathVariable id: Long, @Valid @RequestBody request: Map<String, Long>): ResponseEntity<ConventionDTO> {
        return try {
            val valideParId = request["valideParId"] ?: return ResponseEntity.badRequest().build()
            ResponseEntity.ok(conventionMapper.toDTO(conventionService.valider(id, valideParId)))
        } catch (e: IllegalArgumentException) { ResponseEntity.badRequest().build() }
    }

    @PostMapping("/{id}/rejeter")
    @WriteAccess
    fun rejeter(@PathVariable id: Long, @Valid @RequestBody request: Map<String, String>): ResponseEntity<ConventionDTO> {
        return try {
            val motif = request["motif"] ?: "Aucun motif fourni"
            ResponseEntity.ok(conventionMapper.toDTO(conventionService.rejeter(id, motif)))
        } catch (e: IllegalArgumentException) { ResponseEntity.badRequest().build() }
    }

    @PostMapping("/{id}/mettre-en-cours")
    @WriteAccess
    fun mettreEnCours(@PathVariable id: Long): ResponseEntity<ConventionDTO> {
        return try {
            ResponseEntity.ok(conventionMapper.toDTO(conventionService.mettreEnCours(id)))
        } catch (e: IllegalArgumentException) { ResponseEntity.badRequest().build() }
    }

    @PostMapping("/{id}/annuler")
    @WriteAccess
    fun annuler(@PathVariable id: Long, @Valid @RequestBody request: Map<String, String>): ResponseEntity<ConventionDTO> {
        return try {
            val motif = request["motif"] ?: "Aucun motif fourni"
            ResponseEntity.ok(conventionMapper.toDTO(conventionService.annuler(id, motif)))
        } catch (e: IllegalArgumentException) { ResponseEntity.badRequest().build() }
    }

    @PostMapping("/{id}/demarrer")
    @WriteAccess
    fun demarrer(@PathVariable id: Long): ResponseEntity<ConventionDTO> {
        return try {
            ResponseEntity.ok(conventionMapper.toDTO(conventionService.demarrer(id)))
        } catch (e: IllegalArgumentException) { ResponseEntity.badRequest().build() }
    }

    @PostMapping("/{id}/achever")
    @WriteAccess
    fun achever(@PathVariable id: Long): ResponseEntity<ConventionDTO> {
        return try {
            ResponseEntity.ok(conventionMapper.toDTO(conventionService.achever(id)))
        } catch (e: IllegalArgumentException) { ResponseEntity.badRequest().build() }
    }

    @PostMapping("/{id}/remettre-en-brouillon")
    @WriteAccess
    fun remettreEnBrouillon(@PathVariable id: Long): ResponseEntity<ConventionDTO> {
        return try {
            ResponseEntity.ok(conventionMapper.toDTO(conventionService.remettreEnBrouillon(id)))
        } catch (e: IllegalArgumentException) { ResponseEntity.badRequest().build() }
    }

    @PostMapping("/{id}/devalider")
    @AdminOnly
    fun devalider(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionDTO>> {
        return try {
            ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(conventionService.devalider(id)), "Convention dévalidée avec succès"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur lors de la dévalidation"))
        }
    }

    // ========== Sous-Conventions ==========

    @GetMapping("/{id}/sous-conventions")
    @ReadAccess
    fun getSousConventions(@PathVariable id: Long): ResponseEntity<ApiResponse<List<ConventionSimpleDTO>>> {
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toSimpleDTOList(conventionService.findSousConventions(id))))
    }

    @PostMapping("/{parentId}/sous-conventions")
    @WriteAccess
    fun creerSousConvention(
        @PathVariable parentId: Long,
        @Valid @RequestBody request: CreateConventionRequest
    ): ResponseEntity<ApiResponse<ConventionDTO>> {
        return try {
            val sousConvention = mapRequestToConvention(request).apply {
                heriteParametres = request.heriteParametres
                surchargeTauxCommission = request.surchargeTauxCommission
                surchargeBaseCalcul = request.surchargeBaseCalcul
            }
            val created = conventionService.creerSousConvention(parentId, sousConvention)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(conventionMapper.toDTO(created), "Sous-convention créée avec succès"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur de validation"))
        }
    }

    // ========== Statistiques ==========

    @GetMapping("/statistiques")
    @ReadAccess
    fun getStatistiques(): ResponseEntity<Map<String, Long>> {
        return ResponseEntity.ok(conventionService.getStatistiques())
    }

    // ========== Private Helpers ==========

    private fun mapRequestToConvention(request: CreateConventionRequest): Convention {
        return Convention(
            code = request.code, numero = request.numero,
            dateConvention = request.dateConvention,
            typeConvention = TypeConvention.valueOf(request.typeConvention),
            libelle = request.libelle, objet = request.objet,
            tauxCommission = request.tauxCommission, budget = request.budget,
            baseCalcul = request.baseCalcul, tauxTva = request.tauxTva,
            tauxTvaLignes = request.tauxTvaLignes,
            dateDebut = request.dateDebut, dateFin = request.dateFin,
            description = request.description
        )
    }

    private fun saveRelatedEntities(conventionId: Long, request: CreateConventionRequest) {
        request.lignesBudget?.forEach { ligneRequest ->
            conventionBudgetLigneService.addBudgetLigne(
                conventionId = conventionId,
                categorieDepenseId = ligneRequest.categorieDepenseId,
                montant = ligneRequest.montant,
                designation = ligneRequest.designation,
                remarques = null
            )
        }
        request.partenaires?.forEach { partenaireRequest ->
            conventionPartenaireService.addPartenaireToConvention(
                conventionId = conventionId,
                partenaireId = partenaireRequest.partenaireId,
                budgetAlloue = partenaireRequest.budgetAlloue,
                pourcentage = partenaireRequest.pourcentage,
                estMaitreOeuvre = partenaireRequest.estMaitreOeuvre,
                estMaitreOeuvreDelegue = partenaireRequest.estMaitreOeuvreDelegue,
                remarques = partenaireRequest.remarques
            )
        }
    }
}
