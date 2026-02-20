package ma.investpro.controller

import ma.investpro.dto.*
import ma.investpro.dto.convention.*
import ma.investpro.entity.Convention
import ma.investpro.entity.StatutConvention
import ma.investpro.entity.ImputationPrevisionnelle
import ma.investpro.entity.VersementPrevisionnel
import ma.investpro.entity.User
import ma.investpro.entity.TypeConvention
import ma.investpro.mapper.ConventionMapper
import ma.investpro.mapper.ConventionModificationMapper
import ma.investpro.mapper.ConventionMicroMapper
import ma.investpro.service.ConventionService
import ma.investpro.service.MarcheService
import ma.investpro.repository.ImputationPrevisionnelleRepository
import ma.investpro.repository.VersementPrevisionnelRepository
import ma.investpro.repository.PartenaireRepository
import ma.investpro.repository.UserRepository
import ma.investpro.security.annotations.ReadAccess
import ma.investpro.security.annotations.WriteAccess
import ma.investpro.security.annotations.AdminOnly
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import jakarta.validation.Valid

/**
 * Contrôleur REST pour la gestion des Conventions.
 *
 * SÉCURITÉ:
 * - @ReadAccess: Accessible à USER, MANAGER, ADMIN (via hiérarchie des rôles)
 * - @WriteAccess: Accessible à MANAGER, ADMIN
 * - @AdminOnly: Accessible uniquement à ADMIN
 *
 * Toutes les routes sont protégées par défaut (authentification requise).
 */
@RestController
@RequestMapping("/api/conventions")
class ConventionController(
    private val conventionService: ConventionService,
    private val conventionMapper: ConventionMapper,
    private val conventionModificationMapper: ConventionModificationMapper,
    private val conventionMicroMapper: ConventionMicroMapper,
    private val imputationRepository: ImputationPrevisionnelleRepository,
    private val versementRepository: VersementPrevisionnelRepository,
    private val partenaireRepository: PartenaireRepository,
    private val userRepository: UserRepository,
    private val marcheService: MarcheService
) {

    // ========== CRUD Endpoints ==========

    @GetMapping
    @ReadAccess
    fun getAll(): ResponseEntity<List<ConventionDTO>> {
        val conventions = conventionService.findAll()
        val dtos = conventionMapper.toDTOList(conventions)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/{id}")
    @ReadAccess
    fun getById(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        val convention = conventionService.findById(id)
            ?: return ResponseEntity.notFound().build()
        val dto = conventionMapper.toDTO(convention)
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "Convention récupérée avec succès",
            "data" to dto
        ))
    }

    @GetMapping("/code/{code}")
    @ReadAccess
    fun getByCode(@PathVariable code: String): ResponseEntity<ConventionDTO> {
        val convention = conventionService.findByCode(code)
            ?: return ResponseEntity.notFound().build()
        val dto = conventionMapper.toDTO(convention)
        return ResponseEntity.ok(dto)
    }

    @GetMapping("/statut/{statut}")
    @ReadAccess
    fun getByStatut(@PathVariable statut: StatutConvention): ResponseEntity<List<ConventionDTO>> {
        val conventions = conventionService.findByStatut(statut)
        val dtos = conventionMapper.toDTOList(conventions)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/actives")
    @ReadAccess
    fun getActives(): ResponseEntity<List<ConventionSimpleDTO>> {
        val conventions = conventionService.findConventionsActives()
        val dtos = conventionMapper.toSimpleDTOList(conventions)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/racine")
    @ReadAccess
    fun getConventionsRacine(): ResponseEntity<List<ConventionDTO>> {
        val conventions = conventionService.findConventionsRacine()
        val dtos = conventionMapper.toDTOList(conventions)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/{id}/sous-conventions")
    @ReadAccess
    fun getSousConventions(@PathVariable id: Long): ResponseEntity<ApiResponse<List<ConventionSimpleDTO>>> {
        val conventions = conventionService.findSousConventions(id)
        val dtos = conventionMapper.toSimpleDTOList(conventions)
        return ResponseEntity.ok(ApiResponse.success(dtos))
    }

    @PostMapping
    @WriteAccess
    fun create(@Valid @RequestBody convention: Convention): ResponseEntity<ConventionDTO> {
        return try {
            // Capturer l'utilisateur créateur depuis le contexte de sécurité
            val authentication = SecurityContextHolder.getContext().authentication
            val user = authentication.principal as? User
            convention.createdById = user?.id

            val created = conventionService.create(convention)
            val dto = conventionMapper.toDTO(created)
            ResponseEntity.status(HttpStatus.CREATED).body(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    @WriteAccess
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody convention: Convention
    ): ResponseEntity<ConventionDTO> {
        return try {
            val updated = conventionService.update(id, convention)
            val dto = conventionMapper.toDTO(updated)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
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

    // ========== Workflow Endpoints ==========

    @PostMapping("/{id}/soumettre")
    @WriteAccess
    fun soumettre(@PathVariable id: Long): ResponseEntity<ConventionDTO> {
        return try {
            val convention = conventionService.soumettre(id)
            val dto = conventionMapper.toDTO(convention)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/valider")
    @WriteAccess
    fun valider(
        @PathVariable id: Long,
        @Valid @RequestBody request: Map<String, Long>
    ): ResponseEntity<ConventionDTO> {
        return try {
            val valideParId = request["valideParId"]
                ?: return ResponseEntity.badRequest().build()

            val convention = conventionService.valider(id, valideParId)
            val dto = conventionMapper.toDTO(convention)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/rejeter")
    @WriteAccess
    fun rejeter(
        @PathVariable id: Long,
        @Valid @RequestBody request: Map<String, String>
    ): ResponseEntity<ConventionDTO> {
        return try {
            val motif = request["motif"] ?: "Aucun motif fourni"
            val convention = conventionService.rejeter(id, motif)
            val dto = conventionMapper.toDTO(convention)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/mettre-en-cours")
    @WriteAccess
    fun mettreEnCours(@PathVariable id: Long): ResponseEntity<ConventionDTO> {
        return try {
            val convention = conventionService.mettreEnCours(id)
            val dto = conventionMapper.toDTO(convention)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/annuler")
    @WriteAccess
    fun annuler(
        @PathVariable id: Long,
        @Valid @RequestBody request: Map<String, String>
    ): ResponseEntity<ConventionDTO> {
        return try {
            val motif = request["motif"] ?: "Aucun motif fourni"
            val convention = conventionService.annuler(id, motif)
            val dto = conventionMapper.toDTO(convention)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/demarrer")
    @WriteAccess
    fun demarrer(@PathVariable id: Long): ResponseEntity<ConventionDTO> {
        return try {
            val convention = conventionService.demarrer(id)
            val dto = conventionMapper.toDTO(convention)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/achever")
    @WriteAccess
    fun achever(@PathVariable id: Long): ResponseEntity<ConventionDTO> {
        return try {
            val convention = conventionService.achever(id)
            val dto = conventionMapper.toDTO(convention)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/remettre-en-brouillon")
    @WriteAccess
    fun remettreEnBrouillon(@PathVariable id: Long): ResponseEntity<ConventionDTO> {
        return try {
            val convention = conventionService.remettreEnBrouillon(id)
            val dto = conventionMapper.toDTO(convention)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    /**
     * Dévalider une convention (action admin uniquement).
     * VALIDE → SOUMIS ou EN_EXECUTION → VALIDE
     */
    @PostMapping("/{id}/devalider")
    @AdminOnly
    fun devalider(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionDTO>> {
        return try {
            val convention = conventionService.devalider(id)
            val dto = conventionMapper.toDTO(convention)
            ResponseEntity.ok(ApiResponse.success(dto, "Convention dévalidée avec succès"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().body(ApiResponse.error(e.message ?: "Erreur lors de la dévalidation"))
        }
    }

    // ========== Sous-Conventions ==========

    @PostMapping("/{parentId}/sous-conventions")
    @WriteAccess
    fun creerSousConvention(
        @PathVariable parentId: Long,
        @Valid @RequestBody sousConvention: Convention
    ): ResponseEntity<ConventionDTO> {
        return try {
            val created = conventionService.creerSousConvention(parentId, sousConvention)
            val dto = conventionMapper.toDTO(created)
            ResponseEntity.status(HttpStatus.CREATED).body(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    // ========== Statistiques ==========

    @GetMapping("/statistiques")
    @ReadAccess
    fun getStatistiques(): ResponseEntity<Map<String, Long>> {
        return ResponseEntity.ok(conventionService.getStatistiques())
    }

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

            // Calculer la date de fin si nécessaire
            if (imputation.dateFinPrevue == null) {
                imputation.dateFinPrevue = imputation.dateDemarrage.plusMonths(imputation.delaiMois.toLong())
            }

            val saved = imputationRepository.save(imputation)

            val dto = ImputationPrevisionnelleDTO(
                id = saved.id,
                conventionId = saved.convention?.id ?: 0,
                volet = saved.volet,
                dateDemarrage = saved.dateDemarrage,
                delaiMois = saved.delaiMois,
                dateFinPrevue = saved.dateFinPrevue,
                montantPrevu = saved.montantPrevu,
                remarques = saved.remarques,
                actif = saved.actif,
                createdAt = saved.createdAt,
                updatedAt = saved.updatedAt
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
        @Valid @RequestBody request: Map<String, Any?>
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

                // Partenaire bénéficiaire
                (request["partenaireId"] as? Number)?.toLong()?.let { pid ->
                    partenaire = partenaireRepository.findById(pid).orElse(null)
                }

                // MOD responsable
                (request["modId"] as? Number)?.toLong()?.let { modId ->
                    maitreOeuvreDelegue = partenaireRepository.findById(modId).orElse(null)
                }
            }

            val saved = versementRepository.save(versement)

            val dto = VersementPrevisionnelDTO(
                id = saved.id,
                conventionId = saved.convention?.id ?: 0,
                volet = saved.volet,
                dateVersement = saved.dateVersement,
                montant = saved.montant,
                montantPrevu = saved.montantPrevu,
                partenaireId = saved.partenaire?.id ?: 0,
                partenaireNom = saved.partenaire?.raisonSociale,
                maitreOeuvreDelegueId = saved.maitreOeuvreDelegue?.id,
                maitreOeuvreDelegueNom = saved.maitreOeuvreDelegue?.raisonSociale,
                remarques = saved.remarques,
                actif = saved.actif,
                createdAt = saved.createdAt,
                updatedAt = saved.updatedAt
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

    // ========== Gestion de l'historique des modifications ==========

    /**
     * Modifier une convention avec historique complet
     */
    @PutMapping("/{id}/with-history")
    @WriteAccess
    fun updateWithHistory(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateConventionWithHistoryRequest
    ): ResponseEntity<ApiResponse<ConventionDTO>> {
        return try {
            // Récupérer l'utilisateur qui effectue la modification
            val user: User = userRepository.findById(request.modifieParId).orElseThrow {
                IllegalArgumentException("Utilisateur non trouvé")
            }

            // Créer l'objet Convention à partir de la requête
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
                dateDebut = request.dateDebut
                dateFin = request.dateFin
                description = request.description
            }

            // Appeler le service avec historique
            val updated: Convention = conventionService.updateWithHistory(
                id = id,
                convention = convention,
                motifModification = request.motifModification,
                modifiePar = user
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

    /**
     * Récupérer l'historique complet des modifications d'une convention
     */
    @GetMapping("/{id}/historique")
    @ReadAccess
    fun getHistorique(@PathVariable id: Long): ResponseEntity<ApiResponse<List<ConventionModificationDTO>>> {
        return try {
            val historique: List<ConventionModificationDTO> = conventionService.getHistoriqueModifications(id)
                .let { modifications: List<ma.investpro.entity.ConventionModification> ->
                    conventionModificationMapper.toDTOList(modifications)
                }
            ResponseEntity.ok(ApiResponse.success(historique))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération de l'historique"))
        }
    }

    /**
     * Récupérer les N dernières modifications d'une convention
     */
    @GetMapping("/{id}/historique/derniers/{limit}")
    @ReadAccess
    fun getDernieresModifications(
        @PathVariable id: Long,
        @PathVariable limit: Int
    ): ResponseEntity<ApiResponse<List<ConventionModificationDTO>>> {
        return try {
            val historique: List<ConventionModificationDTO> = conventionService.getDernieresModifications(id, limit)
                .let { modifications: List<ma.investpro.entity.ConventionModification> ->
                    conventionModificationMapper.toDTOList(modifications)
                }
            ResponseEntity.ok(ApiResponse.success(historique))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération de l'historique"))
        }
    }

    /**
     * Vérifier si une convention a été modifiée
     */
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

    // ========== Marché Linking Endpoints ==========

    /**
     * Link an existing marché to this convention
     */
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

    /**
     * Unlink a marché from this convention
     */
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

    // ========== MICRO-ENDPOINTS (Micro-Services Architecture) ==========

    @GetMapping("/{id}/basic")
    @ReadAccess
    fun getBasicInfo(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionBasicDTO>> {
        return try {
            val convention = conventionService.findById(id)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Convention non trouvée"))

            val dto = conventionMicroMapper.toBasicDTO(convention)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des informations de base"))
        }
    }

    @GetMapping("/{id}/finances")
    @ReadAccess
    fun getFinancesInfo(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionFinancesDTO>> {
        return try {
            val convention = conventionService.findById(id)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Convention non trouvée"))

            val dto = conventionMicroMapper.toFinancesDTO(convention)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des informations financières"))
        }
    }

    @GetMapping("/{id}/dates")
    @ReadAccess
    fun getDatesInfo(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionDatesDTO>> {
        return try {
            val convention = conventionService.findById(id)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Convention non trouvée"))

            val dto = conventionMicroMapper.toDatesDTO(convention)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des dates"))
        }
    }

    @GetMapping("/{id}/stats")
    @ReadAccess
    fun getStats(@PathVariable id: Long): ResponseEntity<ApiResponse<ConventionStatsDTO>> {
        return try {
            val convention = conventionService.findById(id)
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Convention non trouvée"))

            val dto = conventionMicroMapper.toStatsDTO(convention)
            ResponseEntity.ok(ApiResponse.success(dto))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Erreur lors de la récupération des statistiques"))
        }
    }
}
