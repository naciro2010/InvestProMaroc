package ma.investpro.controller

import ma.investpro.dto.ConventionDTO
import ma.investpro.dto.ConventionSimpleDTO
import ma.investpro.dto.ImputationPrevisionnelleDTO
import ma.investpro.dto.VersementPrevisionnelDTO
import ma.investpro.entity.Convention
import ma.investpro.entity.StatutConvention
import ma.investpro.entity.ImputationPrevisionnelle
import ma.investpro.entity.VersementPrevisionnel
import ma.investpro.mapper.ConventionMapper
import ma.investpro.service.ConventionService
import ma.investpro.repository.ImputationPrevisionnelleRepository
import ma.investpro.repository.VersementPrevisionnelRepository
import ma.investpro.repository.PartenaireRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/conventions")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000", "https://naciro2010.github.io"])
class ConventionController(
    private val conventionService: ConventionService,
    private val conventionMapper: ConventionMapper,
    private val imputationRepository: ImputationPrevisionnelleRepository,
    private val versementRepository: VersementPrevisionnelRepository,
    private val partenaireRepository: PartenaireRepository
) {

    // ========== CRUD Endpoints ==========

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getAll(): ResponseEntity<List<ConventionDTO>> {
        val conventions = conventionService.findAll()
        val dtos = conventionMapper.toDTOList(conventions)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getById(@PathVariable id: Long): ResponseEntity<ConventionDTO> {
        val convention = conventionService.findById(id)
            ?: return ResponseEntity.notFound().build()
        val dto = conventionMapper.toDTO(convention)
        return ResponseEntity.ok(dto)
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getByCode(@PathVariable code: String): ResponseEntity<ConventionDTO> {
        val convention = conventionService.findByCode(code)
            ?: return ResponseEntity.notFound().build()
        val dto = conventionMapper.toDTO(convention)
        return ResponseEntity.ok(dto)
    }

    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getByStatut(@PathVariable statut: StatutConvention): ResponseEntity<List<ConventionDTO>> {
        val conventions = conventionService.findByStatut(statut)
        val dtos = conventionMapper.toDTOList(conventions)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/actives")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getActives(): ResponseEntity<List<ConventionSimpleDTO>> {
        val conventions = conventionService.findConventionsActives()
        val dtos = conventionMapper.toSimpleDTOList(conventions)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/racine")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getConventionsRacine(): ResponseEntity<List<ConventionDTO>> {
        val conventions = conventionService.findConventionsRacine()
        val dtos = conventionMapper.toDTOList(conventions)
        return ResponseEntity.ok(dtos)
    }

    @GetMapping("/{id}/sous-conventions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getSousConventions(@PathVariable id: Long): ResponseEntity<List<ConventionSimpleDTO>> {
        val conventions = conventionService.findSousConventions(id)
        val dtos = conventionMapper.toSimpleDTOList(conventions)
        return ResponseEntity.ok(dtos)
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun create(@RequestBody convention: Convention): ResponseEntity<ConventionDTO> {
        return try {
            val created = conventionService.create(convention)
            val dto = conventionMapper.toDTO(created)
            ResponseEntity.status(HttpStatus.CREATED).body(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun update(
        @PathVariable id: Long,
        @RequestBody convention: Convention
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun valider(
        @PathVariable id: Long,
        @RequestBody request: Map<String, Long>
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun rejeter(
        @PathVariable id: Long,
        @RequestBody request: Map<String, String>
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun annuler(
        @PathVariable id: Long,
        @RequestBody request: Map<String, String>
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun achever(@PathVariable id: Long): ResponseEntity<ConventionDTO> {
        return try {
            val convention = conventionService.achever(id)
            val dto = conventionMapper.toDTO(convention)
            ResponseEntity.ok(dto)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    // ========== Sous-Conventions ==========

    @PostMapping("/{parentId}/sous-conventions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun creerSousConvention(
        @PathVariable parentId: Long,
        @RequestBody sousConvention: Convention
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getStatistiques(): ResponseEntity<Map<String, Long>> {
        return ResponseEntity.ok(conventionService.getStatistiques())
    }

    // ========== Imputations Prévisionnelles ==========

    @PostMapping("/{conventionId}/imputations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun ajouterImputation(
        @PathVariable conventionId: Long,
        @RequestBody imputation: ImputationPrevisionnelle
    ): ResponseEntity<ImputationPrevisionnelleDTO> {
        return try {
            val convention = conventionService.findById(conventionId)
                ?: return ResponseEntity.notFound().build()

            imputation.convention = convention

            // Calculer la date de fin si nécessaire
            if (imputation.dateFinPrevue == null && imputation.dateDemarrage != null) {
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun ajouterVersement(
        @PathVariable conventionId: Long,
        @RequestBody request: Map<String, Any?>
    ): ResponseEntity<VersementPrevisionnelDTO> {
        return try {
            val convention = conventionService.findById(conventionId)
                ?: return ResponseEntity.notFound().build()

            val versement = VersementPrevisionnel().apply {
                this.convention = convention
                volet = request["volet"] as? String
                dateVersement = java.time.LocalDate.parse(request["dateVersement"] as String)
                montant = (request["montant"] as? Number)?.let { java.math.BigDecimal(it.toString()) } ?: java.math.BigDecimal.ZERO
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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
}
