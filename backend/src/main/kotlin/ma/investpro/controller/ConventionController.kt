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
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
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
    fun getAll(): ResponseEntity<ApiResponse<List<ConventionSimpleDTO>>> {
        val conventions = conventionService.findAll()
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toSimpleDTOList(conventions)))
    }

    @GetMapping("/page")
    @ReadAccess
    fun getAllPaged(@PageableDefault(size = 25) pageable: Pageable): ResponseEntity<ApiResponse<PageResponse<ConventionSimpleDTO>>> {
        val page = conventionService.findAll(pageable)
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(page) { conventionMapper.toSimpleDTO(it) }))
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
    fun getByCode(@PathVariable code: String): ResponseEntity<ApiResponse<ConventionDTO>> {
        val convention = conventionService.findByCode(code)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Convention non trouvée"))
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(convention)))
    }

    @GetMapping("/statut/{statut}")
    @ReadAccess
    fun getByStatut(@PathVariable statut: StatutConvention): ResponseEntity<ApiResponse<List<ConventionSimpleDTO>>> {
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toSimpleDTOList(conventionService.findByStatut(statut))))
    }

    @GetMapping("/actives")
    @ReadAccess
    fun getActives(): ResponseEntity<ApiResponse<List<ConventionSimpleDTO>>> {
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toSimpleDTOList(conventionService.findConventionsActives())))
    }

    @GetMapping("/racine")
    @ReadAccess
    fun getConventionsRacine(): ResponseEntity<ApiResponse<List<ConventionSimpleDTO>>> {
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toSimpleDTOList(conventionService.findConventionsRacine())))
    }

    @PostMapping
    @WriteAccess
    fun create(@Valid @RequestBody request: CreateConventionRequest): ResponseEntity<ApiResponse<ConventionDTO>> {
        val convention = mapRequestToConvention(request)
        val authentication = SecurityContextHolder.getContext().authentication
        val user = authentication.principal as? User
        convention.createdById = user?.id

        val created = conventionService.create(convention)
        saveRelatedEntities(created.id!!, request)

        val reloaded = conventionService.findById(created.id!!) ?: created
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(conventionMapper.toDTO(reloaded), "Convention créée avec succès"))
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody request: CreateConventionRequest
    ): ResponseEntity<ApiResponse<ConventionDTO>> {
        val convention = mapRequestToConvention(request)
        conventionService.update(id, convention)
        request.lignesBudget?.let { conventionBudgetLigneService.replaceAllForConvention(id, it) }
        request.partenaires?.let { conventionPartenaireService.replaceAllForConvention(id, it) }

        val reloaded = conventionService.findById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Convention non trouvée"))
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(reloaded), "Convention mise à jour avec succès"))
    }

    @DeleteMapping("/{id}")
    @AdminOnly
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Nothing>> {
        conventionService.delete(id)
        return ResponseEntity.ok(ApiResponse.ok("Convention supprimée"))
    }

    // ========== Workflow ==========

    @PostMapping("/{id}/soumettre")
    @WriteAccess
    fun soumettre(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionDTO>> {
        val result = conventionService.soumettre(id)
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(result), "Convention soumise"))
    }

    @PostMapping("/{id}/valider")
    @WriteAccess
    fun valider(@PathVariable id: Long, @Valid @RequestBody request: Map<String, Long>): ResponseEntity<ApiResponse<ConventionDTO>> {
        val valideParId = request["valideParId"]
            ?: return ResponseEntity.badRequest().body(ApiResponse.error("valideParId est requis"))
        val result = conventionService.valider(id, valideParId)
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(result), "Convention validée"))
    }

    @PostMapping("/{id}/rejeter")
    @WriteAccess
    fun rejeter(@PathVariable id: Long, @Valid @RequestBody request: Map<String, String>): ResponseEntity<ApiResponse<ConventionDTO>> {
        val motif = request["motif"] ?: "Aucun motif fourni"
        val result = conventionService.rejeter(id, motif)
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(result), "Convention rejetée"))
    }

    @PostMapping("/{id}/mettre-en-cours")
    @WriteAccess
    fun mettreEnCours(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionDTO>> {
        val result = conventionService.mettreEnCours(id)
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(result), "Convention mise en cours"))
    }

    @PostMapping("/{id}/annuler")
    @WriteAccess
    fun annuler(@PathVariable id: Long, @Valid @RequestBody request: Map<String, String>): ResponseEntity<ApiResponse<ConventionDTO>> {
        val motif = request["motif"] ?: "Aucun motif fourni"
        val result = conventionService.annuler(id, motif)
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(result), "Convention annulée"))
    }

    @PostMapping("/{id}/demarrer")
    @WriteAccess
    fun demarrer(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionDTO>> {
        val result = conventionService.demarrer(id)
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(result), "Convention démarrée"))
    }

    @PostMapping("/{id}/achever")
    @WriteAccess
    fun achever(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionDTO>> {
        val result = conventionService.achever(id)
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(result), "Convention achevée"))
    }

    @PostMapping("/{id}/remettre-en-brouillon")
    @WriteAccess
    fun remettreEnBrouillon(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionDTO>> {
        val result = conventionService.remettreEnBrouillon(id)
        return ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(result), "Convention remise en brouillon"))
    }

    @PostMapping("/{id}/remettre-brouillon")
    @AdminOnly
    fun remettreEnBrouillonDepuisValide(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionDTO>> {
        return try {
            ResponseEntity.ok(ApiResponse.success(conventionMapper.toDTO(conventionService.remettreEnBrouillonDepuisValide(id)), "Convention remise en brouillon"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur lors du changement de statut"))
        }
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
