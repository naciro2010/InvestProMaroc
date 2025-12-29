package ma.investpro.controller

import ma.investpro.entity.Convention
import ma.investpro.entity.StatutConvention
import ma.investpro.service.ConventionService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/conventions")
@CrossOrigin(origins = ["http://localhost:5173", "http://localhost:3000"])
class ConventionController(
    private val conventionService: ConventionService
) {

    // ========== CRUD Endpoints ==========

    @GetMapping
    fun getAll(): ResponseEntity<List<Convention>> {
        return ResponseEntity.ok(conventionService.findAll())
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<Convention> {
        val convention = conventionService.findById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(convention)
    }

    @GetMapping("/code/{code}")
    fun getByCode(@PathVariable code: String): ResponseEntity<Convention> {
        val convention = conventionService.findByCode(code)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(convention)
    }

    @GetMapping("/statut/{statut}")
    fun getByStatut(@PathVariable statut: StatutConvention): ResponseEntity<List<Convention>> {
        return ResponseEntity.ok(conventionService.findByStatut(statut))
    }

    @GetMapping("/actives")
    fun getActives(): ResponseEntity<List<Convention>> {
        return ResponseEntity.ok(conventionService.findConventionsActives())
    }

    @GetMapping("/racine")
    fun getConventionsRacine(): ResponseEntity<List<Convention>> {
        return ResponseEntity.ok(conventionService.findConventionsRacine())
    }

    @GetMapping("/{id}/sous-conventions")
    fun getSousConventions(@PathVariable id: Long): ResponseEntity<List<Convention>> {
        return ResponseEntity.ok(conventionService.findSousConventions(id))
    }

    @PostMapping
    fun create(@RequestBody convention: Convention): ResponseEntity<Convention> {
        return try {
            val created = conventionService.create(convention)
            ResponseEntity.status(HttpStatus.CREATED).body(created)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
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
    fun soumettre(@PathVariable id: Long): ResponseEntity<Convention> {
        return try {
            val convention = conventionService.soumettre(id)
            ResponseEntity.ok(convention)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/valider")
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
    fun demarrer(@PathVariable id: Long): ResponseEntity<Convention> {
        return try {
            val convention = conventionService.demarrer(id)
            ResponseEntity.ok(convention)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/achever")
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
    fun getStatistiques(): ResponseEntity<Map<String, Long>> {
        return ResponseEntity.ok(conventionService.getStatistiques())
    }
}
