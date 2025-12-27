package ma.investpro.controller

import jakarta.validation.Valid
import ma.investpro.dto.ApiResponse
import ma.investpro.entity.*
import ma.investpro.service.*
import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/conventions")
class ConventionController(private val service: ConventionService) {

    @GetMapping
    fun getAll() = ResponseEntity.ok(ApiResponse(true, "Liste des conventions", service.findAll()))

    @GetMapping("/active")
    fun getActive() = ResponseEntity.ok(ApiResponse(true, "Conventions actives", service.findActiveConventions()))

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<Convention>> {
        val entity = service.findById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Convention non trouvée"))
        return ResponseEntity.ok(ApiResponse(true, "Convention trouvée", entity))
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun create(@Valid @RequestBody entity: Convention) =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(true, "Convention créée", service.create(entity)))

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(@PathVariable id: Long, @Valid @RequestBody entity: Convention): ResponseEntity<ApiResponse<Convention>> {
        val updated = service.update(id, entity)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Convention non trouvée"))
        return ResponseEntity.ok(ApiResponse(true, "Convention mise à jour", updated))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        return if (service.delete(id)) {
            ResponseEntity.ok(ApiResponse(true, "Convention supprimée"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse(false, "Convention non trouvée"))
        }
    }

    // Workflow endpoints
    @PostMapping("/{id}/soumettre")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    fun soumettre(@PathVariable id: Long): ResponseEntity<ApiResponse<Convention>> {
        return try {
            val convention = service.soumettre(id)
            ResponseEntity.ok(ApiResponse(true, "Convention soumise pour validation", convention))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, e.message ?: "Convention non trouvée"))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message ?: "Opération invalide"))
        }
    }

    @PostMapping("/{id}/valider")
    @PreAuthorize("hasRole('ADMIN')")
    fun valider(
        @PathVariable id: Long,
        @RequestBody request: ValiderConventionRequest
    ): ResponseEntity<ApiResponse<Convention>> {
        return try {
            val convention = service.valider(id, request.valideParId)
            ResponseEntity.ok(ApiResponse(true, "Convention validée - Version V0 créée", convention))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, e.message ?: "Convention non trouvée"))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message ?: "Opération invalide"))
        }
    }

    @PostMapping("/{id}/rejeter")
    @PreAuthorize("hasRole('ADMIN')")
    fun rejeter(
        @PathVariable id: Long,
        @RequestBody request: RejeterConventionRequest
    ): ResponseEntity<ApiResponse<Convention>> {
        return try {
            val convention = service.rejeter(id, request.motif)
            ResponseEntity.ok(ApiResponse(true, "Convention rejetée - retour en brouillon", convention))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, e.message ?: "Convention non trouvée"))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message ?: "Opération invalide"))
        }
    }

    @PostMapping("/{id}/annuler")
    @PreAuthorize("hasRole('ADMIN')")
    fun annuler(
        @PathVariable id: Long,
        @RequestBody request: AnnulerConventionRequest
    ): ResponseEntity<ApiResponse<Convention>> {
        return try {
            val convention = service.annuler(id, request.motif)
            ResponseEntity.ok(ApiResponse(true, "Convention annulée", convention))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, e.message ?: "Convention non trouvée"))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message ?: "Opération invalide"))
        }
    }

    // Sous-conventions endpoints
    @PostMapping("/{parentId}/sous-conventions")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    fun creerSousConvention(
        @PathVariable parentId: Long,
        @Valid @RequestBody request: CreerSousConventionRequest
    ): ResponseEntity<ApiResponse<Convention>> {
        return try {
            val sousConvention = service.creerSousConvention(
                parentId,
                request.sousConvention,
                request.heriteParametres
            )
            ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse(true, "Sous-convention créée", sousConvention))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, e.message ?: "Convention parente non trouvée"))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message ?: "Opération invalide"))
        }
    }

    @GetMapping("/{parentId}/sous-conventions")
    fun getSousConventions(@PathVariable parentId: Long): ResponseEntity<ApiResponse<List<Convention>>> {
        return try {
            val sousConventions = service.getSousConventions(parentId)
            ResponseEntity.ok(ApiResponse(true, "Sous-conventions récupérées", sousConventions))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, e.message ?: "Convention non trouvée"))
        }
    }

    @PutMapping("/{id}/parametres-surcharge")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    fun updateParametresSousConvention(
        @PathVariable id: Long,
        @RequestBody request: UpdateParametresSousConventionRequest
    ): ResponseEntity<ApiResponse<Convention>> {
        return try {
            val updated = service.updateParametresSousConvention(
                id,
                request.surchargeTauxCommission,
                request.surchargeBaseCalcul
            )
            ResponseEntity.ok(ApiResponse(true, "Paramètres mis à jour", updated))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, e.message ?: "Sous-convention non trouvée"))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse(false, e.message ?: "Opération invalide"))
        }
    }
}

// DTOs for workflow requests
data class ValiderConventionRequest(val valideParId: Long)
data class RejeterConventionRequest(val motif: String)
data class AnnulerConventionRequest(val motif: String)

// DTOs for sous-conventions
data class CreerSousConventionRequest(
    val sousConvention: Convention,
    val heriteParametres: Boolean
)

data class UpdateParametresSousConventionRequest(
    val surchargeTauxCommission: java.math.BigDecimal?,
    val surchargeBaseCalcul: String?
)

@RestController
@RequestMapping("/api/projets")
class ProjetController(private val service: ProjetService) {

    @GetMapping
    fun getAll() = ResponseEntity.ok(ApiResponse(true, "Liste des projets", service.findAll()))

    @GetMapping("/active")
    fun getActive() = ResponseEntity.ok(ApiResponse(true, "Projets actifs", service.findAllActive()))

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<Projet>> {
        val entity = service.findById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Projet non trouvé"))
        return ResponseEntity.ok(ApiResponse(true, "Projet trouvé", entity))
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    fun create(@Valid @RequestBody entity: Projet) =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(true, "Projet créé", service.create(entity)))

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    fun update(@PathVariable id: Long, @Valid @RequestBody entity: Projet): ResponseEntity<ApiResponse<Projet>> {
        val updated = service.update(id, entity)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Projet non trouvé"))
        return ResponseEntity.ok(ApiResponse(true, "Projet mis à jour", updated))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        return if (service.delete(id)) {
            ResponseEntity.ok(ApiResponse(true, "Projet supprimé"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse(false, "Projet non trouvé"))
        }
    }
}

@RestController
@RequestMapping("/api/fournisseurs")
class FournisseurController(private val service: FournisseurService) {

    @GetMapping
    fun getAll() = ResponseEntity.ok(ApiResponse(true, "Liste des fournisseurs", service.findAll()))

    @GetMapping("/active")
    fun getActive() = ResponseEntity.ok(ApiResponse(true, "Fournisseurs actifs", service.findAllActive()))

    @GetMapping("/non-residents")
    fun getNonResidents() = ResponseEntity.ok(ApiResponse(true, "Fournisseurs non-résidents", service.findNonResidents()))

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<Fournisseur>> {
        val entity = service.findById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Fournisseur non trouvé"))
        return ResponseEntity.ok(ApiResponse(true, "Fournisseur trouvé", entity))
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    fun create(@Valid @RequestBody entity: Fournisseur) =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(true, "Fournisseur créé", service.create(entity)))

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    fun update(@PathVariable id: Long, @Valid @RequestBody entity: Fournisseur): ResponseEntity<ApiResponse<Fournisseur>> {
        val updated = service.update(id, entity)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Fournisseur non trouvé"))
        return ResponseEntity.ok(ApiResponse(true, "Fournisseur mis à jour", updated))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        return if (service.delete(id)) {
            ResponseEntity.ok(ApiResponse(true, "Fournisseur supprimé"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse(false, "Fournisseur non trouvé"))
        }
    }
}

@RestController
@RequestMapping("/api/axes-analytiques")
class AxeAnalytiqueController(private val service: AxeAnalytiqueService) {

    @GetMapping
    fun getAll() = ResponseEntity.ok(ApiResponse(true, "Liste des axes analytiques", service.findAll()))

    @GetMapping("/active")
    fun getActive() = ResponseEntity.ok(ApiResponse(true, "Axes analytiques actifs", service.findAllActive()))

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<AxeAnalytique>> {
        val entity = service.findById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Axe analytique non trouvé"))
        return ResponseEntity.ok(ApiResponse(true, "Axe analytique trouvé", entity))
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun create(@Valid @RequestBody entity: AxeAnalytique) =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(true, "Axe analytique créé", service.create(entity)))

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(@PathVariable id: Long, @Valid @RequestBody entity: AxeAnalytique): ResponseEntity<ApiResponse<AxeAnalytique>> {
        val updated = service.update(id, entity)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Axe analytique non trouvé"))
        return ResponseEntity.ok(ApiResponse(true, "Axe analytique mis à jour", updated))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        return if (service.delete(id)) {
            ResponseEntity.ok(ApiResponse(true, "Axe analytique supprimé"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse(false, "Axe analytique non trouvé"))
        }
    }
}

@RestController
@RequestMapping("/api/comptes-bancaires")
class CompteBancaireController(private val service: CompteBancaireService) {

    @GetMapping
    fun getAll() = ResponseEntity.ok(ApiResponse(true, "Liste des comptes bancaires", service.findAll()))

    @GetMapping("/active")
    fun getActive() = ResponseEntity.ok(ApiResponse(true, "Comptes bancaires actifs", service.findAllActive()))

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<CompteBancaire>> {
        val entity = service.findById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Compte bancaire non trouvé"))
        return ResponseEntity.ok(ApiResponse(true, "Compte bancaire trouvé", entity))
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun create(@Valid @RequestBody entity: CompteBancaire) =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(true, "Compte bancaire créé", service.create(entity)))

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(@PathVariable id: Long, @Valid @RequestBody entity: CompteBancaire): ResponseEntity<ApiResponse<CompteBancaire>> {
        val updated = service.update(id, entity)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Compte bancaire non trouvé"))
        return ResponseEntity.ok(ApiResponse(true, "Compte bancaire mis à jour", updated))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        return if (service.delete(id)) {
            ResponseEntity.ok(ApiResponse(true, "Compte bancaire supprimé"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse(false, "Compte bancaire non trouvé"))
        }
    }
}

@RestController
@RequestMapping("/api/depenses")
class DepenseInvestissementController(private val service: DepenseInvestissementService) {

    @GetMapping
    fun getAll() = ResponseEntity.ok(ApiResponse(true, "Liste des dépenses", service.findAll()))

    @GetMapping("/unpaid")
    fun getUnpaid() = ResponseEntity.ok(ApiResponse(true, "Dépenses non payées", service.findUnpaid()))

    @GetMapping("/paid")
    fun getPaid() = ResponseEntity.ok(ApiResponse(true, "Dépenses payées", service.findPaid()))

    @GetMapping("/year/{year}")
    fun getByYear(@PathVariable year: Int) =
        ResponseEntity.ok(ApiResponse(true, "Dépenses pour l'année $year", service.findByYear(year)))

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<DepenseInvestissement>> {
        val entity = service.findById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Dépense non trouvée"))
        return ResponseEntity.ok(ApiResponse(true, "Dépense trouvée", entity))
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('USER')")
    fun create(@Valid @RequestBody entity: DepenseInvestissement) =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse(true, "Dépense créée avec succès", service.create(entity)))

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    fun update(@PathVariable id: Long, @Valid @RequestBody entity: DepenseInvestissement): ResponseEntity<ApiResponse<DepenseInvestissement>> {
        val updated = service.update(id, entity)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Dépense non trouvée"))
        return ResponseEntity.ok(ApiResponse(true, "Dépense mise à jour", updated))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: Long): ResponseEntity<ApiResponse<Unit>> {
        return if (service.delete(id)) {
            ResponseEntity.ok(ApiResponse(true, "Dépense supprimée"))
        } else {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse(false, "Dépense non trouvée"))
        }
    }
}

@RestController
@RequestMapping("/api/commissions")
class CommissionController(private val service: CommissionService) {

    @GetMapping
    fun getAll() = ResponseEntity.ok(ApiResponse(true, "Liste des commissions", service.findAll()))

    @GetMapping("/year/{year}")
    fun getByYear(@PathVariable year: Int) =
        ResponseEntity.ok(ApiResponse(true, "Commissions pour l'année $year", service.findByYear(year)))

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<ApiResponse<Commission>> {
        val entity = service.findById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Commission non trouvée"))
        return ResponseEntity.ok(ApiResponse(true, "Commission trouvée", entity))
    }

    @GetMapping("/depense/{depenseId}")
    fun getByDepense(@PathVariable depenseId: Long): ResponseEntity<ApiResponse<Commission>> {
        val commission = service.findByDepense(depenseId)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse(false, "Commission non trouvée pour cette dépense"))
        return ResponseEntity.ok(ApiResponse(true, "Commission trouvée", commission))
    }
}
