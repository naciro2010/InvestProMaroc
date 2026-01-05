package ma.investpro.controller

import ma.investpro.entity.Convention
import ma.investpro.entity.StatutConvention
import ma.investpro.service.ConventionService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/conventions")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000", "https://naciro2010.github.io"])
class ConventionController(
    private val conventionService: ConventionService
) {

    // ========== CRUD Endpoints ==========

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getAll(): ResponseEntity<List<Convention>> {
        return ResponseEntity.ok(conventionService.findAll())
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getById(@PathVariable id: Long): ResponseEntity<Convention> {
        val convention = conventionService.findById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(convention)
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getByCode(@PathVariable code: String): ResponseEntity<Convention> {
        val convention = conventionService.findByCode(code)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(convention)
    }

    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getByStatut(@PathVariable statut: StatutConvention): ResponseEntity<List<Convention>> {
        return ResponseEntity.ok(conventionService.findByStatut(statut))
    }

    @GetMapping("/actives")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getActives(): ResponseEntity<List<Convention>> {
        return ResponseEntity.ok(conventionService.findConventionsActives())
    }

    @GetMapping("/racine")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getConventionsRacine(): ResponseEntity<List<Convention>> {
        return ResponseEntity.ok(conventionService.findConventionsRacine())
    }

    @GetMapping("/{id}/sous-conventions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    fun getSousConventions(@PathVariable id: Long): ResponseEntity<List<Convention>> {
        return ResponseEntity.ok(conventionService.findSousConventions(id))
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun create(@RequestBody convention: Convention): ResponseEntity<Convention> {
        return try {
            val created = conventionService.create(convention)
            ResponseEntity.status(HttpStatus.CREATED).body(created)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun update(
        @PathVariable id: Long,
        @RequestBody convention: Convention
    ): ResponseEntity<Convention> {
        return try {
            val updated = conventionService.update(id, convention)
            ResponseEntity.ok(updated)
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
    fun soumettre(@PathVariable id: Long): ResponseEntity<Convention> {
        return try {
            val convention = conventionService.soumettre(id)
            ResponseEntity.ok(convention)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun valider(
        @PathVariable id: Long,
        @RequestBody request: Map<String, Long>
    ): ResponseEntity<Convention> {
        return try {
            val valideParId = request["valideParId"]
                ?: return ResponseEntity.badRequest().build()

            val convention = conventionService.valider(id, valideParId)
            ResponseEntity.ok(convention)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/rejeter")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun rejeter(
        @PathVariable id: Long,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<Convention> {
        return try {
            val motif = request["motif"] ?: "Aucun motif fourni"
            val convention = conventionService.rejeter(id, motif)
            ResponseEntity.ok(convention)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/annuler")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun annuler(
        @PathVariable id: Long,
        @RequestBody request: Map<String, String>
    ): ResponseEntity<Convention> {
        return try {
            val motif = request["motif"] ?: "Aucun motif fourni"
            val convention = conventionService.annuler(id, motif)
            ResponseEntity.ok(convention)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/demarrer")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun demarrer(@PathVariable id: Long): ResponseEntity<Convention> {
        return try {
            val convention = conventionService.demarrer(id)
            ResponseEntity.ok(convention)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/achever")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    fun achever(@PathVariable id: Long): ResponseEntity<Convention> {
        return try {
            val convention = conventionService.achever(id)
            ResponseEntity.ok(convention)
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
    ): ResponseEntity<Convention> {
        return try {
            val created = conventionService.creerSousConvention(parentId, sousConvention)
            ResponseEntity.status(HttpStatus.CREATED).body(created)
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
}
